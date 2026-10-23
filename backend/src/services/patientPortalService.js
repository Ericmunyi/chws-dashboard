const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../models');
const logger = require('../config/logger');
const africaTalkingService = require('./africaTalkingService');

const OTP_EXPIRY_MINUTES = 5;
const PORTAL_TOKEN_EXPIRY = '30m';

function normalizePhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';

  if (digits.startsWith('254')) return `+254${digits.slice(3)}`;
  if (digits.startsWith('0')) return `+254${digits.slice(1)}`;
  if (digits.length === 9) return `+254${digits}`;

  return `+${digits}`;
}

function phoneVariants(phone) {
  const normalized = normalizePhone(phone);
  if (!normalized) return [];

  const international = normalized.slice(1);
  const national = international.slice(3);

  return [
    ...new Set([
      String(phone).trim(),
      normalized,
      international,
      `0${national}`,
      national,
    ]),
  ];
}

async function findPatientByPhone(phone) {
  const variants = phoneVariants(phone);
  if (variants.length === 0) return null;

  return db.patients()
    .where(function () {
      this.whereIn('phone', variants).orWhereIn('alt_phone', variants);
    })
    .first();
}

const patientPortalService = {
  async sendOtp(phone) {
    const patient = await findPatientByPhone(phone);
    if (!patient) {
      return { exists: false, message: 'No patient found with this phone number' };
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpPhone = normalizePhone(phone);

    await db.knex('patient_otps').insert({
      id: uuidv4(),
      phone: otpPhone,
      otp_hash: otpHash,
      expires_at: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    });

    const message = `Your CHW Dashboard OTP is ${otp}. Valid for ${OTP_EXPIRY_MINUTES} minutes. Do not share this code.`;

    const sent = await africaTalkingService.sendSms(otpPhone, message);

    if (!sent && process.env.NODE_ENV !== 'production') {
      logger.info(`OTP for ${otpPhone}: ${otp}`);
    }

    return {
      exists: true,
      message: sent ? 'OTP sent successfully' : 'OTP generated but SMS delivery unavailable',
    };
  },

  async verifyOtp(phone, otp) {
    const patient = await findPatientByPhone(phone);
    if (!patient) {
      throw new Error('Patient not found');
    }

    const otpRecord = await db.knex('patient_otps')
      .where({ phone: normalizePhone(phone), used: false })
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
