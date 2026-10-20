const { Router } = require('express');
const { body } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { db } = require('../models');
const { USER_ROLES } = require('../config/constants');

const router = Router();

const ACTIVE_STATUSES = ['waiting', 'in_service'];
const VALID_STATUSES = ['waiting', 'in_service', 'completed', 'skipped', 'cancelled'];
const VALID_PRIORITIES = ['normal', 'urgent', 'emergency'];
const PRIORITY_ORDER = { emergency: 0, urgent: 1, normal: 2 };

const today = () => new Date().toISOString().slice(0, 10);

router.get(
  '/',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CHW, USER_ROLES.VIEWER),
  async (req, res, next) => {
    try {
      const { departmentId, date = today(), status, page = 1, limit = 50 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      let query = db.departmentQueue()
        .select(
          'department_queue.*',
          db.knex.raw("(p.first_name || ' ' || p.last_name) as patient_name"),
          db.knex.raw("p.gender as patient_gender"),
          db.knex.raw("p.phone as patient_phone"),
          db.knex.raw("p.village as patient_village"),
          'departments.name as department_name',
          'departments.code as department_code'
        )
        .join('patients as p', 'department_queue.patient_id', 'p.id')
        .join('departments', 'department_queue.department_id', 'departments.id')
        .where('department_queue.queue_date', date)
        .orderBy(
          db.knex.raw(`case department_queue.priority when 'emergency' then 0 when 'urgent' then 1 else 2 end`),
          'asc'
        )
        .orderBy('department_queue.queue_number', 'asc');

      if (departmentId) query = query.where('department_queue.department_id', departmentId);
      if (status) query = query.where('department_queue.status', status);

      const [{ count }] = await query.clone().clearSelect().count('department_queue.id as count');
      const entries = await query.limit(parseInt(limit)).offset(offset);

      res.json({
        data: entries,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(count),
          totalPages: Math.ceil(parseInt(count) / parseInt(limit)),
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/summary', authenticate, async (req, res, next) => {
  try {
    const date = req.query.date || today();

    const counts = await db.departmentQueue()
      .where({ queue_date: date })
      .whereNot('status', 'cancelled')
      .groupBy('department_id')
      .select(
        'department_id',
        db.knex.raw("sum(case when status = 'waiting' then 1 else 0 end) as waiting"),
        db.knex.raw("sum(case when status = 'in_service' then 1 else 0 end) as in_service"),
        db.knex.raw("sum(case when status = 'completed' then 1 else 0 end) as completed"),
        db.knex.raw('count(*) as total')
      );

      res.json({ data: counts, date });
  } catch (err) {
    next(err);
  }
});

router.get(
  '/:id',
  authenticate,
  async (req, res, next) => {
    try {
      const entry = await db.departmentQueue()
        .select(
          'department_queue.*',
          db.knex.raw("(p.first_name || ' ' || p.last_name) as patient_name"),
          'departments.name as department_name'
        )
        .join('patients as p', 'department_queue.patient_id', 'p.id')
        .join('departments', 'department_queue.department_id', 'departments.id')
        .where('department_queue.id', req.params.id)
        .first();

      if (!entry) return res.status(404).json({ error: 'Queue entry not found' });
      res.json(entry);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CHW),
  [
    body('patientId').trim().notEmpty(),
    body('departmentId').trim().notEmpty(),
    validate,
  ],
  async (req, res, next) => {
    try {
      const { patientId, departmentId, priority = 'normal', reason, notes, encounterId } = req.body;

      if (!VALID_PRIORITIES.includes(priority)) {
        return res.status(400).json({ error: 'Invalid priority' });
      }

      const department = await db.departments().where({ id: departmentId, is_active: true }).first();
      if (!department) return res.status(404).json({ error: 'Department not found' });

      const patient = await db.patients().where('id', patientId).first();
      if (!patient) return res.status(404).json({ error: 'Patient not found' });

      const queueDate = today();

      const duplicate = await db.departmentQueue()
        .where({ department_id: departmentId, patient_id: patientId, queue_date: queueDate })
        .whereIn('status', ACTIVE_STATUSES)
        .first();
      if (duplicate) {
        return res.status(409).json({ error: 'Patient is already in this department queue today' });
      }

      const maxRow = await db.departmentQueue()
        .where({ department_id: departmentId, queue_date: queueDate })
        .max('queue_number as max')
        .first();
      const queueNumber = (maxRow.max || 0) + 1;

      const [entry] = await db.departmentQueue()
        .insert({
          id: uuidv4(),
          department_id: departmentId,
          patient_id: patientId,
          encounter_id: encounterId || null,
          queue_date: queueDate,
          queue_number: queueNumber,
          status: 'waiting',
          priority,
          reason,
          notes,
          queued_by: req.user.id,
        })
        .returning('*');

      const io = req.app.get('io');
      if (io) io.to('dashboard').emit('queue:update', { departmentId, action: 'enqueued' });

      res.status(201).json({ ...entry, queue_number: queueNumber });
    } catch (err) {
      if (err.message && err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Queue number conflict, please retry' });
      }
      next(err);
    }
  }
);

router.post('/call-next', authenticate, authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CHW), async (req, res, next) => {
  try {
    const { departmentId } = req.body;
    if (!departmentId) return res.status(400).json({ error: 'departmentId is required' });

    const current = await db.departmentQueue()
      .where({ department_id: departmentId, queue_date: today(), status: 'in_service' })
      .first();
    if (current) {
      return res.status(409).json({ error: 'A patient is currently being served in this department' });
    }

    const nextEntry = await db.departmentQueue()
      .where({ department_id: departmentId, queue_date: today(), status: 'waiting' })
      .orderBy(
        db.knex.raw(`case priority when 'emergency' then 0 when 'urgent' then 1 else 2 end`),
        'asc'
      )
      .orderBy('queue_number', 'asc')
      .first();

    if (!nextEntry) return res.status(404).json({ error: 'No patients waiting in this queue' });

    const [updated] = await db.departmentQueue()
      .where('id', nextEntry.id)
      .update({ status: 'in_service', called_at: new Date(), updated_at: new Date() })
      .returning('*');

    const patient = await db.patients().where('id', updated.patient_id).first();
    const io = req.app.get('io');
    if (io) io.to('dashboard').emit('queue:update', { departmentId, action: 'called' });

    res.json({
      ...updated,
      patient_name: patient ? `${patient.first_name} ${patient.last_name}` : '',
    });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticate, authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CHW), async (req, res, next) => {
  try {
    const entry = await db.departmentQueue().where('id', req.params.id).first();
    if (!entry) return res.status(404).json({ error: 'Queue entry not found' });

    const allowed = {};

    if (req.body.status !== undefined) {
      if (!VALID_STATUSES.includes(req.body.status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      allowed.status = req.body.status;
      if (req.body.status === 'completed') allowed.completed_at = new Date();
      if (req.body.status === 'in_service') allowed.called_at = entry.called_at || new Date();
    }
    if (req.body.priority !== undefined) {
      if (!VALID_PRIORITIES.includes(req.body.priority)) {
        return res.status(400).json({ error: 'Invalid priority' });
      }
      allowed.priority = req.body.priority;
    }
    if (req.body.notes !== undefined) allowed.notes = req.body.notes;
    allowed.updated_at = new Date();

    const [updated] = await db.departmentQueue().where('id', req.params.id).update(allowed).returning('*');

    const io = req.app.get('io');
    if (io) io.to('dashboard').emit('queue:update', { departmentId: entry.department_id, action: 'updated' });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CHW), async (req, res, next) => {
  try {
    const entry = await db.departmentQueue().where('id', req.params.id).first();
    if (!entry) return res.status(404).json({ error: 'Queue entry not found' });

    await db.departmentQueue().where('id', req.params.id).update({
      status: 'cancelled',
      updated_at: new Date(),
    });

    const io = req.app.get('io');
    if (io) io.to('dashboard').emit('queue:update', { departmentId: entry.department_id, action: 'cancelled' });

    res.json({ message: 'Patient removed from queue' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
