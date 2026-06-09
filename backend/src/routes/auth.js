const { Router } = require('express');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const authService = require('../services/authService');
const { USER_ROLES } = require('../config/constants');

const router = Router();

router.post(
  '/register',
  [
    body('username').trim().notEmpty().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    validate,
  ],
  async (req, res, next) => {
    try {
      const user = await authService.createUser(req.body);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/login',
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
  ],
  async (req, res, next) => {
    try {
      const result = await authService.login(
        req.body.username,
        req.body.password,
        req.ip,
        req.get('User-Agent')
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }
    const result = await authService.refreshAccessToken(refreshToken);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/logout', authenticate, async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(req.user.id, refreshToken);
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.get(
  '/users',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  async (req, res, next) => {
    try {
      const users = await authService.listUsers(req.query);
      res.json(users);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/users',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  [
    body('username').trim().notEmpty().isLength({ min: 3 }),
    body('email').isEmail(),
    body('password').isLength({ min: 8 }),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    body('role').isIn(Object.values(USER_ROLES)),
    validate,
  ],
  async (req, res, next) => {
    try {
      const user = await authService.createUser(req.body);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
