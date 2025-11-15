const { Pool } = require('pg');
const mongoose = require('mongoose');
const redis = require('redis');
const { logger } = require('../utils/logger');

// PostgreSQL connection
const pgPool = new Pool({
  connectionString: process.env.POSTGRES_URL || 'postgresql://localhost:5432/blockelevate',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// MongoDB connection
const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/blockelevate');
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    throw error;
  }
};

// Redis connection
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
    logger.info('Redis connected');
  } catch (error) {
    logger.error('Redis connection failed:', error);
    throw error;
  }
};

const connectDatabases = async () => {
  await Promise.all([
    connectMongoDB(),
    connectRedis()
  ]);
  
  // Test PostgreSQL connection
  try {
    await pgPool.query('SELECT NOW()');
    logger.info('PostgreSQL connected');
  } catch (error) {
    logger.error('PostgreSQL connection failed:', error);
    throw error;
  }
};

module.exports = {
  pgPool,
  redisClient,
  connectDatabases
};