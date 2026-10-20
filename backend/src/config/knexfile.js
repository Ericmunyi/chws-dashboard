const path = require('path');

const dataDir = path.resolve(__dirname, '../../data');

const sqlite = {
  client: 'better-sqlite3',
  connection: {
    filename: path.join(dataDir, 'chws_dashboard.db'),
  },
  useNullAsDefault: true,
  migrations: {
    directory: path.join(__dirname, 'migrations'),
  },
  seeds: {
    directory: path.join(__dirname, 'seeds'),
  },
};

const postgres = {
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  },
  pool: {
    min: 0,
    max: 10,
    acquireTimeoutMillis: 30000,
  },
  migrations: {
    directory: path.join(__dirname, 'migrations'),
  },
  seeds: {
    directory: path.join(__dirname, 'seeds'),
  },
};

module.exports = {
  development: sqlite,
  // Use PostgreSQL (e.g. Neon) when DATABASE_URL is provided, otherwise
  // fall back to the local SQLite file (single-server / local runs).
  production: process.env.DATABASE_URL ? postgres : sqlite,
};
