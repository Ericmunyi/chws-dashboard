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

      let query = db.households()
        .select(
          'households.*',
          db.knex.raw("(chw.first_name || ' ' || chw.last_name) as assigned_chw_name")
        )
        .leftJoin('users as chw', 'households.assigned_chw_id', 'chw.id')
        .orderBy('households.created_at', 'desc');

      if (search) {
        query = query.where(function () {
          this.where('households.head_name', 'like', `%${search}%`)
            .orWhere('households.head_phone', 'like', `%${search}%`)
            .orWhere('households.village', 'like', `%${search}%`);
        });
      }
      if (status) query = query.where('households.status', status);
      if (village) query = query.where('households.village', village);
      if (chwId) query = query.where('households.assigned_chw_id', chwId);
      if (req.user.role === 'chw') {
        query = query.where('households.assigned_chw_id', req.user.id);
      }

      const [{ count }] = await query.clone().clearSelect().clearOrder().count('households.id as count');
      const households = await query.limit(parseInt(limit)).offset(offset);

      res.json({
        data: households,
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
    const household = await db.households()
      .select(
        'households.*',
        db.knex.raw("(chw.first_name || ' ' || chw.last_name) as assigned_chw_name")
      )
      .leftJoin('users as chw', 'households.assigned_chw_id', 'chw.id')
      .where('households.id', req.params.id)
      .first();

    if (!household) {
      return res.status(404).json({ error: 'Household not found' });
    }

    const members = await db.patients()
      .where({ household_id: household.id })
      .orderBy('created_at', 'desc');

    res.json({ ...household, members });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CHW),
  [
    body('headName').trim().notEmpty(),
    validate,
  ],
  async (req, res, next) => {
    try {
      const [household] = await db.households()
        .insert({
          id: uuidv4(),
          head_name: req.body.headName,
          head_phone: req.body.headPhone,
          village: req.body.village,
          ward: req.body.ward,
          sub_county: req.body.subCounty,
          county: req.body.county,
          latitude: req.body.latitude,
          longitude: req.body.longitude,
          member_count: req.body.memberCount || 0,
          assigned_chw_id: req.body.assignedChwId || req.user.id,
          status: 'active',
        })
        .returning('*');

      await syncService.queueEntity(SYNC_ENTITY_TYPES.HOUSEHOLD, household.id, SYNC_DIRECTIONS.PUSH_TO_ECHIS);

      res.status(201).json(household);
    } catch (err) {
      next(err);
    }
  }
);

router.put('/:id', authenticate, authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CHW), async (req, res, next) => {
  try {
    const [updated] = await db.households()
      .where({ id: req.params.id })
      .update({
        head_name: req.body.headName,
        head_phone: req.body.headPhone,
        village: req.body.village,
        ward: req.body.ward,
        sub_county: req.body.subCounty,
        county: req.body.county,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        member_count: req.body.memberCount,
        status: req.body.status,
        updated_at: new Date(),
      })
      .returning('*');

    if (!updated) {
      return res.status(404).json({ error: 'Household not found' });
    }

    await syncService.queueEntity(SYNC_ENTITY_TYPES.HOUSEHOLD, updated.id, SYNC_DIRECTIONS.PUSH_TO_ECHIS);

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
