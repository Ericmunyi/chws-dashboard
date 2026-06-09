const { AUDIT_ACTIONS } = require('../config/constants');

const auditLogger = (action) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      if (res.statusCode < 400 && req.user) {
        const auditEntry = {
          user_id: req.user.id,
          action,
          entity_type: req.baseUrl?.split('/').pop(),
          entity_id: req.params.id,
          details: {
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
          },
          ip_address: req.ip,
          user_agent: req.get('User-Agent'),
        };
        req.app.get('db')('audit_log').insert(auditEntry).catch(() => {});
      }
      return originalJson(body);
    };
    next();
  };
};

module.exports = { auditLogger };
