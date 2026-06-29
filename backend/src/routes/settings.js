const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { USER_ROLES } = require('../config/constants');
const { db } = require('../models');

const router = Router();

router.get(
  '/',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  async (req, res, next) => {
    try {
      const configs = await db.systemConfig().select('key', 'value', 'description');
      const result = {};
      for (const c of configs) {
        try { result[c.key] = JSON.parse(c.value); }
        catch { result[c.key] = c.value; }
      }
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  async (req, res, next) => {
    try {
      const updates = req.body;
      for (const [key, value] of Object.entries(updates)) {
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        const existing = await db.systemConfig().where({ key }).first();
        if (existing) {
          await db.systemConfig().where({ key }).update({ value: stringValue, updated_at: new Date() });
        } else {
          await db.systemConfig().insert({ key, value: stringValue, description: '' });
        }
      }
      res.json({ message: 'Settings saved successfully' });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
