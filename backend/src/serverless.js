process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Load backend/.env for local testing; on Vercel env vars come from the dashboard
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// Ensure knex's pg client is bundled by Vercel's tracer (knex requires it dynamically)
require('pg');

const { app } = require('./app');

// Vercel Node functions receive native (req, res) — Express handles them directly
module.exports = (req, res) => app(req, res);
