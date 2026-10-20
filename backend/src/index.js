require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const { app } = require('./app');
const { db, knex } = require('./models');
const logger = require('./config/logger');
const syncService = require('./services/syncService');

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || '*', methods: ['GET', 'POST'] },
});

app.set('io', io);

io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  socket.on('join:dashboard', () => socket.join('dashboard'));
  socket.on('disconnect', () => logger.info(`Client disconnected: ${socket.id}`));
});

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

async function seedIfEmpty() {
  try {
    const userCount = await db.users().count('id as count').first();
    if (userCount.count > 0) return;

    logger.info('No users found — seeding initial data...');
    const hash = await bcrypt.hash('Password123!', 12);

    const users = [
      { id: uuidv4(), username: 'admin', email: 'admin@chws.gov', password_hash: hash, first_name: 'System', last_name: 'Admin', role: 'admin', phone: '+254700100001', is_active: true },
      { id: uuidv4(), username: 'manager', email: 'manager@chws.gov', password_hash: hash, first_name: 'Jane', last_name: 'Wanjiku', role: 'manager', phone: '+254700100002', is_active: true },
      { id: uuidv4(), username: 'chw1', email: 'chw1@chws.gov', password_hash: hash, first_name: 'John', last_name: 'Kamau', role: 'chw', phone: '+254700100003', is_active: true },
      { id: uuidv4(), username: 'chw2', email: 'chw2@chws.gov', password_hash: hash, first_name: 'Mary', last_name: 'Achieng', role: 'chw', phone: '+254700100004', is_active: true },
    ];

    for (const u of users) {
      await db.users().insert(u);
    }

    logger.info('Seeded admin/manager/chw1/chw2 users (password: Password123!)');
  } catch (err) {
    logger.warn('Auto-seed skipped', { error: err.message });
  }
}

server.listen(PORT, async () => {
  if ((process.env.NODE_ENV || 'development') === 'production' && !process.env.DATABASE_URL) {
    logger.warn('DATABASE_URL not set — falling back to local SQLite database');
  }
  await runMigrations();
  await seedIfEmpty();
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
