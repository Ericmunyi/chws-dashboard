process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Load backend/.env for local testing; on Vercel env vars come from the dashboard
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// Ensure knex's pg client is bundled by Vercel's tracer (knex requires it dynamically)
require('pg');

const { app } = require('./app');
const { knex } = require('./models');
const logger = require('./config/logger');

let migrationsRun = false;

const runMigrations = async () => {
  if (migrationsRun) return;
  try {
    const [_, pending] = await knex.migrate.list();
    if (pending.length > 0) {
      const [batch, migrations] = await knex.migrate.latest();
      if (migrations && migrations.length > 0) {
        console.log(`Migration batch ${batch} applied: ${migrations.join(', ')}`);
      }
    }
    migrationsRun = true;
  } catch (err) {
    console.error('Migration check failed', err.message);
    migrationsRun = true;
  }
};

// Run migrations on cold start
runMigrations().catch(() => {});

// Vercel Node functions receive native (req, res) — Express handles them directly
module.exports = async (req, res) => {
  try {
    await runMigrations();
  } catch (e) {
    // ignore
  }
  return app(req, res);
};
