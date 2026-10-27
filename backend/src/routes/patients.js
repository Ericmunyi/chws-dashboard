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
      const { page = 1, limit = 20, search, status, village, chwId } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      let query = db.patients()
        .select(
          'patients.*',
          db.knex.raw("(chw.first_name || ' ' || chw.last_name) as assigned_chw_name")
        )
        .leftJoin('users as chw', 'patients.assigned_chw_id', 'chw.id')
        .orderBy('patients.created_at', 'desc');

      if (search) {
        query = query.where(function () {
          this.where('patients.first_name', 'like', `%${search}%`)
            .orWhere('patients.last_name', 'like', `%${search}%`)
            .orWhere('patients.national_id', 'like', `%${search}%`)
            .orWhere('patients.phone', 'like', `%${search}%`);
        });
      }
      if (status) query = query.where('patients.status', status);
      if (village) query = query.where('patients.village', village);
      if (chwId) query = query.where('patients.assigned_chw_id', chwId);
      if (req.user.role === 'chw') {
        query = query.where('patients.assigned_chw_id', req.user.id);
      }

      const [{ count }] = await query.clone().clearSelect().clearOrder().count('patients.id as count');
      const patients = await query.limit(parseInt(limit)).offset(offset);

      res.json({
        data: patients,
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
    const patient = await db.patients()
      .select(
        'patients.*',
        db.knex.raw("(chw.first_name || ' ' || chw.last_name) as assigned_chw_name")
      )
      .leftJoin('users as chw', 'patients.assigned_chw_id', 'chw.id')
      .where('patients.id', req.params.id)
      .first();

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const encounters = await db.encounters()
      .where({ patient_id: patient.id })
      .orderBy('encounter_datetime', 'desc')
      .limit(20);

    res.json({ ...patient, encounters });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CHW),
  [
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    body('dateOfBirth').isDate(),
    body('gender').isIn(['Male', 'Female', 'Other']),
    validate,
  ],
  async (req, res, next) => {
    try {
      const nationalId = (req.body.nationalId || '').trim() || null;
      const phone = (req.body.phone || '').trim() || null;

    let patient;
    try {
      let recordNumber = null;
      try {
        const hasCol = await db.knex.schema.hasColumn('patients', 'record_number');
        if (hasCol) {
          const [{ count }] = await db.patients().count('id as count');
          const seq = parseInt(count) + 1;
          recordNumber = `PT-${String(seq).padStart(4, '0')}`;
        } else {
          // Create column if missing
          try {
            await db.knex.schema.alterTable('patients', (table) => {
              table.string('record_number', 20);
            });
            const [{ count }] = await db.patients().count('id as count');
            const seq = parseInt(count) + 1;
            recordNumber = `PT-${String(seq).padStart(4, '0')}`;
          } catch (e) {}
        }
      } catch (e) {}

      const insertData = {
        id: uuidv4(),
        first_name: req.body.firstName,
        last_name: req.body.lastName,
        middle_name: req.body.middleName,
        date_of_birth: req.body.dateOfBirth,
        gender: req.body.gender,
        phone,
        national_id: nationalId,
        village: req.body.village,
        ward: req.body.ward,
        sub_county: req.body.subCounty,
        county: req.body.county,
        assigned_chw_id: req.body.assignedChwId || req.user.id,
        address: req.body.address,
        status: 'active',
      };
      if (recordNumber) insertData.record_number = recordNumber;

      try {
        [patient] = await db.patients().insert(insertData).returning('*');
      } catch (e) {
        // Try without returning for some DBs
        const res = await db.patients().insert(insertData);
        patient = await db.patients().where({ id: insertData.id }).first();
      }
    } catch (err) {
      next(err);
      return;
    }

      await syncService.queueEntity(SYNC_ENTITY_TYPES.PATIENT, patient.id, SYNC_DIRECTIONS.PUSH_TO_ECHIS);

      res.status(201).json(patient);
    } catch (err) {
      next(err);
    }
  }
);

router.put('/:id', authenticate, authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CHW), async (req, res, next) => {
  try {
    const [updated] = await db.patients()
      .where({ id: req.params.id })
      .update({
        first_name: req.body.firstName,
        last_name: req.body.lastName,
        middle_name: req.body.middleName,
        phone: req.body.phone,
        village: req.body.village,
        ward: req.body.ward,
        sub_county: req.body.subCounty,
        county: req.body.county,
        address: req.body.address,
        status: req.body.status,
        updated_at: new Date(),
      })
      .returning('*');

    if (!updated) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    await syncService.queueEntity(SYNC_ENTITY_TYPES.PATIENT, updated.id, SYNC_DIRECTIONS.PUSH_TO_ECHIS);

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete(
  '/:id',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  async (req, res, next) => {
    try {
      const deleted = await db.knex.transaction(async (trx) => {
        const patient = await trx('patients').where({ id: req.params.id }).first();
        if (!patient) return null;

        await trx('chw_activities').where({ patient_id: req.params.id }).del();
        await trx('sync_log')
          .where({ entity_type: SYNC_ENTITY_TYPES.PATIENT, entity_id: req.params.id })
          .del();
        await trx('patients').where({ id: req.params.id }).del();
        return patient;
      });

      if (!deleted) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      res.json({ message: 'Patient deleted successfully', id: deleted.id });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
