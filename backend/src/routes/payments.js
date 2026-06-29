const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { USER_ROLES } = require('../config/constants');
const paymentService = require('../services/paymentService');

const router = Router();

router.get(
  '/summary',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CHW),
  async (req, res, next) => {
    try {
      const summary = await paymentService.getSummary(req.user);
      res.json(summary);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CHW),
  async (req, res, next) => {
    try {
      const result = await paymentService.list(req.query, req.user);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CHW),
  async (req, res, next) => {
    try {
      const payment = await paymentService.create(req.body, req.user.id);
      res.status(201).json(payment);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
