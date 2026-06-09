const path = require('path');
const fs = require('fs');
const knexConfig = require('../config/knexfile');

const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const config = knexConfig[process.env.NODE_ENV || 'development'];
const knex = require('knex')(config);

const db = {
  users: () => knex('users'),
  patients: () => knex('patients'),
  households: () => knex('households'),
  encounters: () => knex('encounters'),
  chwActivities: () => knex('chw_activities'),
  syncLog: () => knex('sync_log'),
  auditLog: () => knex('audit_log'),
  regions: () => knex('regions'),
  refreshTokens: () => knex('refresh_tokens'),
  systemConfig: () => knex('system_config'),
  knex,
};

module.exports = { db, knex };
