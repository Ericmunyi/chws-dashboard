require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { db, knex } = require('./models');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const logger = require('./config/logger');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const patientRoutes = require('./routes/patients');
const syncRoutes = require('./routes/sync');
const syncService = require('./services/syncService');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || '*', methods: ['GET', 'POST'] },
});

app.set('db', db);
app.set('io', io);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (msg) => logger.http(msg.trim()) } }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests', message: 'Please try again later' },
});
app.use('/api/', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/sync', syncRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
  });
});

io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  socket.on('join:dashboard', () => socket.join('dashboard'));
  socket.on('disconnect', () => logger.info(`Client disconnected: ${socket.id}`));
});

const path = require('path');
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
const fs = require('fs');
if (process.env.NODE_ENV === 'production' && fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/socket.io/')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.use(errorHandler);
app.use(notFoundHandler);

const PORT = process.env.PORT || 5000;
let syncInterval;

async function runMigrations() {
  try {
    const [_, pending] = await knex.migrate.list();
    if (pending.length > 0) {
      logger.info(`Running ${pending.length} pending migration(s)...`);
      const [batch, migrations] = await knex.migrate.latest();
      logger.info(`Migration batch ${batch} applied: ${migrations.join(', ')}`);
    }
  } catch (err) {
    logger.warn('Migration check failed (first run may create DB)', { error: err.message });
  }
}

server.listen(PORT, async () => {
  await runMigrations();
  logger.info(`CHWS Dashboard API running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);

  syncInterval = setInterval(async () => {
    try {
      const result = await syncService.processSyncQueue();
      if (result.processed > 0 || result.failed > 0) {
        io.to('dashboard').emit('sync:update', result);
      }
    } catch (err) {
      logger.error('Auto-sync cycle failed', { error: err.message });
    }
  }, parseInt(process.env.SYNC_INTERVAL_MS) || 300000);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down...');
  clearInterval(syncInterval);
  db.knex.destroy();
  server.close(() => process.exit(0));
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled rejection', { error: err.message, stack: err.stack });
});

module.exports = { app, server };
