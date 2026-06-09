const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Request contains invalid data',
      details: formatted,
    });
  }
  next();
};

module.exports = { validate };
