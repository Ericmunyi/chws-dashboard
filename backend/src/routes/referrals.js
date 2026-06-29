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
      const { page = 1, limit = 20 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      let query = db.encounters()
        .select(
          'encounters.*',
          db.knex.raw("(p.first_name || ' ' || p.last_name) as patient_name"),
          db.knex.raw("(chw.first_name || ' ' || chw.last_name) as chw_name")
        )
        .join('patients as p', 'encounters.patient_id', 'p.id')
        .leftJoin('users as chw', 'encounters.chw_id', 'chw.id')
        .where('encounters.encounter_type', 'referral')
        .orderBy('encounters.encounter_datetime', 'desc');

      if (req.user.role === 'chw') {
        query = query.where('encounters.chw_id', req.user.id);
      }

      const [{ count }] = await query.clone().clearSelect().count('encounters.id as count');
      const referrals = await query.limit(parseInt(limit)).offset(offset);

      const parsed = referrals.map((r) => ({
        ...r,
        details: r.observations ? JSON.parse(r.observations) : null,
      }));

      res.json({
        data: parsed,
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

router.post(
  '/',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CHW),
  [
    body('patientId').trim().notEmpty(),
    body('reason').trim().notEmpty(),
    body('referredTo').trim().notEmpty(),
    validate,
  ],
  async (req, res, next) => {
    try {
      const currentUser = await db.users().where({ id: req.user.id }).first();
      const referrerName = currentUser
        ? `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim()
        : req.user.username;

      const [referral] = await db.encounters()
        .insert({
          id: uuidv4(),
          patient_id: req.body.patientId,
          chw_id: req.user.id,
          encounter_type: 'referral',
          encounter_datetime: new Date(),
          location: req.body.location,
          observations: JSON.stringify({
            reason: req.body.reason,
            referred_to: req.body.referredTo,
            referred_by: referrerName,
            notes: req.body.notes || '',
            status: 'pending',
          }),
        })
        .returning('*');

      res.status(201).json(referral);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
