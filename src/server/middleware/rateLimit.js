const { redisClient } = require('../config/database');
const { logger } = require('../utils/logger');

const rateLimitMiddleware = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] || req.ip;
    const key = `rate_limit:${userId}`;
    
    const requests = await redisClient.incr(key);
    if (requests === 1) {
      await redisClient.expire(key, 60);
    }

    if (requests > 100) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    next();
  } catch (error) {
    logger.error('Rate limit middleware error:', error);
    next();
  }
};

module.exports = { rateLimitMiddleware };