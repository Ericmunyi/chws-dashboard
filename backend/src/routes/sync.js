const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const syncService = require('../services/syncService');
const { USER_ROLES } = require('../config/constants');

const router = Router();

router.post(
  '/trigger',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  async (req, res, next) => {
    try {
      const result = await syncService.processSyncQueue();
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/timeline',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const timeline = await syncService.getSyncTimeline(limit);
      res.json(timeline);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/retry-failed',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  async (req, res, next) => {
    try {
      const result = await syncService.retryFailedItems();
      res.json({ retried: result.length, items: result });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/queue',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  async (req, res, next) => {
    try {
      const { entityType, entityId, direction } = req.body;
      await syncService.queueEntity(entityType, entityId, direction);
      res.status(201).json({ message: 'Entity queued for sync' });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
