const { Router } = require('express');
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const patientPortalService = require('../services/patientPortalService');

const router = Router();

function authenticatePatient(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'patient') {
      return res.status(403).json({ error: 'Invalid patient token' });
    }
    req.patient = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

router.post(
  '/send-otp',
  [
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    validate,
  ],
  async (req, res, next) => {
    try {
      const result = await patientPortalService.sendOtp(req.body.phone);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/verify-otp',
  [
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('otp').trim().notEmpty().withMessage('OTP is required'),
    validate,
  ],
  async (req, res, next) => {
    try {
      const result = await patientPortalService.verifyOtp(req.body.phone, req.body.otp);
      res.json(result);
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  }
);

router.get('/me', authenticatePatient, async (req, res, next) => {
  try {
    const data = await patientPortalService.getPatientData(req.patient.patientId);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
