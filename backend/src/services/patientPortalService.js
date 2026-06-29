const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../models');
const logger = require('../config/logger');

const OTP_EXPIRY_MINUTES = 5;
const PORTAL_TOKEN_EXPIRY = '30m';

const patientPortalService = {
  async sendOtp(phone) {
    const patient = await db.patients().where({ phone }).orWhere({ alt_phone: phone }).first();
    if (!patient) {
      return { exists: false, message: 'No patient found with this phone number' };
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    await db.knex('patient_otps').insert({
      id: uuidv4(),
      phone,
      otp_hash: otpHash,
      expires_at: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    });

    logger.info(`OTP for ${phone}: ${otp}`);

    return {
      exists: true,
      message: 'OTP sent successfully',
    };
  },

  async verifyOtp(phone, otp) {
    const patient = await db.patients().where({ phone }).orWhere({ alt_phone: phone }).first();
    if (!patient) {
      throw new Error('Patient not found');
    }

    const otpRecord = await db.knex('patient_otps')
      .where({ phone, used: false })
      .andWhere('expires_at', '>', new Date())
      .orderBy('created_at', 'desc')
      .first();

    if (!otpRecord) {
      throw new Error('No valid OTP found. Request a new one.');
    }

    const valid = await bcrypt.compare(otp, otpRecord.otp_hash);
    if (!valid) {
      throw new Error('Invalid OTP');
    }

    await db.knex('patient_otps').where({ id: otpRecord.id }).update({ used: true });

    const token = jwt.sign(
      { type: 'patient', patientId: patient.id, phone: patient.phone },
      process.env.JWT_SECRET,
      { expiresIn: PORTAL_TOKEN_EXPIRY }
    );

    return {
      token,
      patient: {
        id: patient.id,
        firstName: patient.first_name,
        lastName: patient.last_name,
        phone: patient.phone,
      },
    };
  },

  async getPatientData(patientId) {
    const patient = await db.patients()
      .select(
        'patients.*',
        db.knex.raw("(chw.first_name || ' ' || chw.last_name) as assigned_chw_name")
      )
      .leftJoin('users as chw', 'patients.assigned_chw_id', 'chw.id')
      .where('patients.id', patientId)
      .first();

    if (!patient) {
      throw new Error('Patient not found');
    }

    const encounters = await db.encounters()
      .where({ patient_id: patientId })
      .orderBy('encounter_datetime', 'desc')
      .limit(20);

    const referrals = await db.encounters()
      .select(
        'encounters.*',
        db.knex.raw("(chw.first_name || ' ' || chw.last_name) as chw_name")
      )
      .leftJoin('users as chw', 'encounters.chw_id', 'chw.id')
      .where({ patient_id: patientId, encounter_type: 'referral' })
      .orderBy('encounter_datetime', 'desc')
      .limit(10);

    return {
      ...patient,
      encounters,
      referrals,
    };
  },
};

module.exports = patientPortalService;
