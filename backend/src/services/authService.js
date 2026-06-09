const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, username: user.username, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  const refreshToken = jwt.sign(
    { id: user.id, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

const authService = {
  async login(username, password, ipAddress, userAgent) {
    const user = await db.users().where({ username }).first();
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.is_active) {
      throw new AppError('Account deactivated. Contact administrator.', 403);
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new AppError('Invalid credentials', 401);
    }

    const tokens = generateTokens(user);

    await db.refreshTokens().insert({
      user_id: user.id,
      token: tokens.refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await db.users().where({ id: user.id }).update({ last_login_at: new Date() });

    await db.knex('audit_log').insert({
      user_id: user.id,
      action: 'login',
      details: JSON.stringify({ method: 'password' }),
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    logger.info(`User ${user.username} logged in`);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        phone: user.phone,
      },
      ...tokens,
    };
  },

  async refreshAccessToken(refreshToken) {
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const stored = await db.refreshTokens().where({ token: refreshToken }).first();
    if (!stored) {
      throw new AppError('Refresh token has been revoked', 401);
    }

    const user = await db.users().where({ id: decoded.id }).first();
    if (!user || !user.is_active) {
      await db.refreshTokens().where({ token: refreshToken }).del();
      throw new AppError('User not found or inactive', 401);
    }

    const tokens = generateTokens(user);

    await db.refreshTokens().where({ id: stored.id }).del();
    await db.refreshTokens().insert({
      user_id: user.id,
      token: tokens.refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
      ...tokens,
    };
  },

  async logout(userId, refreshToken) {
    if (refreshToken) {
      await db.refreshTokens().where({ token: refreshToken }).del();
    }
    await db.refreshTokens().where({ user_id: userId }).del();

    await db.knex('audit_log').insert({
      user_id: userId,
      action: 'logout',
      details: JSON.stringify({ method: 'manual' }),
    });

    logger.info(`User ${userId} logged out`);
  },

  async getCurrentUser(userId) {
    const user = await db.users().where({ id: userId }).first();
    if (!user) throw new AppError('User not found', 404);
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      phone: user.phone,
      isActive: user.is_active,
      lastLoginAt: user.last_login_at,
      createdAt: user.created_at,
    };
  },

  async listUsers(filters = {}) {
    let query = db.users().select(
      'id', 'username', 'email', 'first_name', 'last_name',
      'role', 'phone', 'is_active', 'last_login_at', 'created_at'
    );

    if (filters.role) query = query.where({ role: filters.role });
    if (filters.is_active !== undefined) query = query.where({ is_active: filters.is_active });
    if (filters.search) {
      query = query.where(function () {
        this.where('first_name', 'ilike', `%${filters.search}%`)
          .orWhere('last_name', 'ilike', `%${filters.search}%`)
          .orWhere('email', 'ilike', `%${filters.search}%`);
      });
    }

    return query.orderBy('created_at', 'desc');
  },

  async createUser(userData) {
    const existing = await db.users()
      .where({ username: userData.username })
      .orWhere({ email: userData.email })
      .first();

    if (existing) {
      throw new AppError('Username or email already exists', 409);
    }

    const passwordHash = await bcrypt.hash(userData.password, 12);

    const id = uuidv4();

    await db.users()
      .insert({
        id,
        username: userData.username,
        email: userData.email,
        password_hash: passwordHash,
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: userData.role || 'chw',
        phone: userData.phone,
        is_active: true,
      });

    return {
      id,
      username: userData.username,
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      role: userData.role || 'chw',
      phone: userData.phone,
      created_at: new Date().toISOString(),
    };
  },
};

module.exports = authService;
