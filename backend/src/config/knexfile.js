const path = require('path');

const dataDir = path.resolve(__dirname, '../../data');

module.exports = {
  development: {
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
  },
  production: {
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
  },
};
