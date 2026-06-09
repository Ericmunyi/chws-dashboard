const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { USER_ROLES } = require('../config/constants');
const dashboardService = require('../services/dashboardService');

const router = Router();

router.get(
  '/summary',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CHW, USER_ROLES.VIEWER),
  async (req, res, next) => {
    try {
      const stats = await dashboardService.getSummaryStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/sync-status',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  async (req, res, next) => {
    try {
      const status = await dashboardService.getSyncStatus();
      res.json(status);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/chw-activity',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CHW),
  async (req, res, next) => {
    try {
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        chwId: req.query.chwId,
      };
      const activity = await dashboardService.getCHWActivity(filters);
      res.json(activity);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/health',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  async (req, res, next) => {
    try {
      const health = await dashboardService.getSystemHealth();
      res.json(health);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/patient-stats',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CHW),
  async (req, res, next) => {
    try {
      const stats = await dashboardService.getPatientStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
