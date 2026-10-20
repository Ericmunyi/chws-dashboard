const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const { db } = require('./models');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const logger = require('./config/logger');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const patientRoutes = require('./routes/patients');
const syncRoutes = require('./routes/sync');
const settingsRoutes = require('./routes/settings');
const householdRoutes = require('./routes/households');
const referralRoutes = require('./routes/referrals');
const paymentRoutes = require('./routes/payments');
const patientPortalRoutes = require('./routes/patientPortal');
const appointmentRoutes = require('./routes/appointments');
const encounterRoutes = require('./routes/encounters');
const departmentRoutes = require('./routes/departments');
const queueRoutes = require('./routes/queue');

const app = express();

app.set('db', db);
app.set('io', null); // local server attaches a Socket.io instance; null on serverless (routes guard for it)
app.set('trust proxy', 1);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
// If the platform (e.g. Vercel) already parsed the body, skip body-parser stream reads
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    req._body = true;
  }
  next();
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (msg) => logger.http(msg.trim()) } }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: 'Too many requests', message: 'Please try again later' },
});
app.use('/api/', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/households', householdRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/patient-portal', patientPortalRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-records', encounterRoutes);
app.use('/api/encounters', encounterRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/queue', queueRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
  });
});

const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (process.env.NODE_ENV === 'production' && fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/socket.io/')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.use(errorHandler);
app.use(notFoundHandler);

module.exports = { app };
