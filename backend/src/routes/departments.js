const { Router } = require('express');
const { body } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { db } = require('../models');
const { USER_ROLES } = require('../config/constants');

const router = Router();

router.get(
  '/',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CHW, USER_ROLES.VIEWER),
  async (req, res, next) => {
    try {
      const { includeInactive } = req.query;
      let query = db.departments().orderBy('display_order', 'asc').orderBy('name', 'asc');
      if (includeInactive !== 'true') query = query.where('is_active', true);

      const departments = await query;

      const queueDate = new Date().toISOString().slice(0, 10);
      const counts = await db.departmentQueue()
        .where({ queue_date: queueDate })
        .whereNot('status', 'cancelled')
        .groupBy('department_id')
        .select('department_id', db.knex.raw('count(*) as count'));

      const waiting = await db.departmentQueue()
        .where({ queue_date: queueDate, status: 'waiting' })
        .groupBy('department_id')
        .select('department_id', db.knex.raw('count(*) as count'));

      const countMap = Object.fromEntries(counts.map((c) => [c.department_id, parseInt(c.count)]));
      const waitingMap = Object.fromEntries(waiting.map((c) => [c.department_id, parseInt(c.count)]));

      res.json({
        data: departments.map((d) => ({
          ...d,
          queuedToday: countMap[d.id] || 0,
          waitingToday: waitingMap[d.id] || 0,
        })),
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const department = await db.departments().where('id', req.params.id).first();
    if (!department) return res.status(404).json({ error: 'Department not found' });
    res.json(department);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  [
    body('name').trim().notEmpty(),
    body('code').trim().notEmpty().isLength({ max: 20 }),
    validate,
  ],
  async (req, res, next) => {
    try {
      const { name, code, description, displayOrder } = req.body;

      const existing = await db.departments()
        .where(db.knex.raw('lower(code) = ?', [code.toLowerCase()]))
        .first();
      if (existing) return res.status(409).json({ error: 'A department with this code already exists' });

      const [department] = await db.departments()
        .insert({
          id: uuidv4(),
          name,
          code: code.toUpperCase(),
          description,
          display_order: displayOrder || 0,
          is_active: true,
        })
        .returning('*');

      res.status(201).json(department);
    } catch (err) {
      next(err);
    }
  }
);

router.put('/:id', authenticate, authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER), async (req, res, next) => {
  try {
    const allowed = {};
    if (req.body.name !== undefined) allowed.name = req.body.name;
    if (req.body.description !== undefined) allowed.description = req.body.description;
    if (req.body.isActive !== undefined) allowed.is_active = req.body.isActive;
    if (req.body.displayOrder !== undefined) allowed.display_order = req.body.displayOrder;
    allowed.updated_at = new Date();

    const [updated] = await db.departments().where('id', req.params.id).update(allowed).returning('*');
    if (!updated) return res.status(404).json({ error: 'Department not found' });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
