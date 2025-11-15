const { logger } = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validation failed', details: err.details });
  }

  if (err.code === '23505') { // PostgreSQL unique violation
    return res.status(409).json({ error: 'Resource already exists' });
  }

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
};

module.exports = { errorHandler };