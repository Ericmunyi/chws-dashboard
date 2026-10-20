const { Router } = require('express');
const { body } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { db } = require('../models');
const { USER_ROLES } = require('../config/constants');

const router = Router();

const TIME_SLOTS = [];
for (let h = 8; h <= 16; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`);
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:30`);
}

router.get(
  '/available-slots',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  async (req, res, next) => {
    try {
      let { facilityId, date } = req.query;
      if (!date) {
        return res.status(400).json({ error: 'date is required' });
      }

      if (req.user.facility_id) {
        facilityId = req.user.facility_id;
      }
      if (!facilityId) {
        return res.status(400).json({ error: 'facilityId is required' });
      }

      const booked = await db.appointments()
        .where({ facility_id: facilityId, appointment_date: date })
        .whereNot('status', 'cancelled')
        .select('appointment_time');

      const bookedTimes = new Set(booked.map((b) => b.appointment_time));
      const available = TIME_SLOTS.filter((t) => !bookedTimes.has(t));

      res.json({ data: available, facilityId });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CHW, USER_ROLES.VIEWER),
  async (req, res, next) => {
    try {
      const { page = 1, limit = 20, date, status, facilityId, patientId } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      let query = db.appointments()
        .select(
          'appointments.*',
          db.knex.raw("(p.first_name || ' ' || p.last_name) as patient_name"),
          db.knex.raw("(u.first_name || ' ' || u.last_name) as created_by_name"),
          'referral_facilities.name as facility_name'
        )
        .join('patients as p', 'appointments.patient_id', 'p.id')
        .join('users as u', 'appointments.created_by', 'u.id')
        .leftJoin('referral_facilities', 'appointments.facility_id', 'referral_facilities.id')
        .orderBy('appointments.appointment_date', 'asc')
        .orderBy('appointments.appointment_time', 'asc');

      if (date) query = query.where('appointments.appointment_date', date);
      if (status) query = query.where('appointments.status', status);
      if (facilityId) query = query.where('appointments.facility_id', facilityId);
      if (patientId) query = query.where('appointments.patient_id', patientId);
      if (req.user.facility_id) {
        query = query.where('appointments.facility_id', req.user.facility_id);
      } else if (req.user.role === 'chw') {
        query = query.where('p.assigned_chw_id', req.user.id);
      }

      const [{ count }] = await query.clone().clearSelect().count('appointments.id as count');
      const appointments = await query.limit(parseInt(limit)).offset(offset);

      res.json({
        data: appointments,
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
    const appointment = await db.appointments()
      .select(
        'appointments.*',
        db.knex.raw("(p.first_name || ' ' || p.last_name) as patient_name"),
        db.knex.raw("(u.first_name || ' ' || u.last_name) as created_by_name"),
        'referral_facilities.name as facility_name'
      )
      .join('patients as p', 'appointments.patient_id', 'p.id')
      .join('users as u', 'appointments.created_by', 'u.id')
      .leftJoin('referral_facilities', 'appointments.facility_id', 'referral_facilities.id')
      .where('appointments.id', req.params.id)
      .first();

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  [
    body('patientId').trim().notEmpty(),
    body('facilityId').trim().notEmpty(),
    body('appointmentDate').trim().notEmpty(),
    body('appointmentTime').trim().notEmpty(),
    validate,
  ],
  async (req, res, next) => {
    try {
      let { patientId, facilityId, appointmentDate, appointmentTime, reason, notes } = req.body;

      if (req.user.facility_id) {
        if (facilityId && facilityId !== req.user.facility_id) {
          return res.status(403).json({ error: 'You can only schedule appointments at your assigned facility' });
        }
        facilityId = req.user.facility_id;
      }

      const existing = await db.appointments()
        .where({ facility_id: facilityId, appointment_date: appointmentDate, appointment_time: appointmentTime })
        .whereNot('status', 'cancelled')
        .first();

      if (existing) {
        return res.status(409).json({ error: 'This time slot is already booked' });
      }

      const [appointment] = await db.appointments()
        .insert({
          id: uuidv4(),
          patient_id: patientId,
          facility_id: facilityId,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          reason,
          notes,
          status: 'scheduled',
          created_by: req.user.id,
        })
        .returning('*');

      res.status(201).json(appointment);
    } catch (err) {
      next(err);
    }
  }
);

router.put('/:id', authenticate, authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER), async (req, res, next) => {
  try {
    const appointment = await db.appointments().where({ id: req.params.id }).first();
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    if (req.user.facility_id && appointment.facility_id !== req.user.facility_id) {
      return res.status(403).json({ error: 'You can only manage appointments at your assigned facility' });
    }

    const allowedFields = {};

    if (req.body.status) {
      const validStatuses = ['scheduled', 'completed', 'cancelled', 'no_show'];
      if (!validStatuses.includes(req.body.status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      allowedFields.status = req.body.status;
    }
    if (req.body.notes !== undefined) allowedFields.notes = req.body.notes;
    if (req.body.reason !== undefined) allowedFields.reason = req.body.reason;
    if (req.body.appointmentDate) allowedFields.appointment_date = req.body.appointmentDate;
    if (req.body.appointmentTime) allowedFields.appointment_time = req.body.appointmentTime;

    allowedFields.updated_at = new Date();

    const [updated] = await db.appointments()
      .where({ id: req.params.id })
      .update(allowedFields)
      .returning('*');

    if (!updated) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
