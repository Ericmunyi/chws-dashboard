const { Router } = require('express');
const { body } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { db } = require('../models');
const syncService = require('../services/syncService');
const { USER_ROLES, SYNC_DIRECTIONS, SYNC_ENTITY_TYPES } = require('../config/constants');

const router = Router();

router.get(
  '/',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CHW, USER_ROLES.VIEWER),
  async (req, res, next) => {
    try {
      const { page = 1, limit = 20, patientId, chwId, encounterType, from, to } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      let query = db.encounters()
        .select(
          'encounters.*',
          db.knex.raw("(p.first_name || ' ' || p.last_name) as patient_name"),
          db.knex.raw("(u.first_name || ' ' || u.last_name) as chw_name"),
          'departments.name as department_name',
          'departments.code as department_code'
        )
        .join('patients as p', 'encounters.patient_id', 'p.id')
        .leftJoin('users as u', 'encounters.chw_id', 'u.id')
        .leftJoin('departments', 'encounters.department_id', 'departments.id')
        .orderBy('encounters.encounter_datetime', 'desc');

      if (patientId) query = query.where('encounters.patient_id', patientId);
      if (chwId) query = query.where('encounters.chw_id', chwId);
      if (encounterType) query = query.where('encounters.encounter_type', encounterType);
      if (req.query.departmentId) query = query.where('encounters.department_id', req.query.departmentId);
      if (from) query = query.where('encounters.encounter_datetime', '>=', from);
      if (to) query = query.where('encounters.encounter_datetime', '<=', to);
      if (req.user.role === 'chw') {
        query = query.where(function () {
          this.where('encounters.chw_id', req.user.id).orWhere('p.assigned_chw_id', req.user.id);
        });
      }

      const [{ count }] = await query.clone().clearSelect().clearOrder().count('encounters.id as count');
      const encounters = await query.limit(parseInt(limit)).offset(offset);

      res.json({
        data: encounters,
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

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const encounter = await db.encounters()
      .select(
        'encounters.*',
        db.knex.raw("(p.first_name || ' ' || p.last_name) as patient_name"),
        db.knex.raw("(u.first_name || ' ' || u.last_name) as chw_name"),
        'departments.name as department_name',
        'departments.code as department_code'
      )
      .join('patients as p', 'encounters.patient_id', 'p.id')
      .leftJoin('users as u', 'encounters.chw_id', 'u.id')
      .leftJoin('departments', 'encounters.department_id', 'departments.id')
      .where('encounters.id', req.params.id)
      .first();

    if (!encounter) {
      return res.status(404).json({ error: 'Medical record not found' });
    }

    res.json(encounter);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CHW),
  [
    body('patientId').trim().notEmpty(),
    body('encounterType').trim().notEmpty(),
    body('encounterDatetime').trim().notEmpty(),
    validate,
  ],
  async (req, res, next) => {
    try {
      const [encounter] = await db.encounters()
        .insert({
          id: uuidv4(),
          patient_id: req.body.patientId,
          chw_id: req.user.id,
          encounter_type: req.body.encounterType,
          encounter_datetime: req.body.encounterDatetime,
          location: req.body.location,
          latitude: req.body.latitude,
          longitude: req.body.longitude,
          department_id: req.body.departmentId || null,
          observations: req.body.observations,
          sync_status: 'pending',
        })
        .returning('*');

      await syncService.queueEntity(SYNC_ENTITY_TYPES.ENCOUNTER, encounter.id, SYNC_DIRECTIONS.PUSH_TO_OPENMRS);

      res.status(201).json(encounter);
    } catch (err) {
      next(err);
    }
  }
);

router.put('/:id', authenticate, authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CHW), async (req, res, next) => {
  try {
    const updates = {
      encounter_type: req.body.encounterType,
      encounter_datetime: req.body.encounterDatetime,
      location: req.body.location,
      observations: req.body.observations,
      updated_at: new Date(),
    };
    if (req.body.departmentId !== undefined) updates.department_id = req.body.departmentId || null;

    const [updated] = await db.encounters()
      .where({ id: req.params.id })
      .update(updates)
      .returning('*');

    if (!updated) {
      return res.status(404).json({ error: 'Medical record not found' });
    }

    await syncService.queueEntity(SYNC_ENTITY_TYPES.ENCOUNTER, updated.id, SYNC_DIRECTIONS.PUSH_TO_OPENMRS);

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
