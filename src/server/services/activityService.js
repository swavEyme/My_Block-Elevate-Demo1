const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

// MongoDB Schema for user activity events (from your existing structure)
const EventSchema = new mongoose.Schema({
  user_id: { type: String, required: true, index: true },
  event_type: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  details: mongoose.Schema.Types.Mixed,
  platform_source: String,
  session_id: String
});

const ActivityEvent = mongoose.model('ActivityEvent', EventSchema);

const trackActivity = async (userId, eventType, details = {}) => {
  try {
    const newEvent = new ActivityEvent({
      user_id: userId,
      event_type: eventType,
      details: details,
      platform_source: 'BlockElevate_API'
    });

    await newEvent.save();
    logger.info(`Activity tracked: ${eventType} for user ${userId}`);
    
    return newEvent._id;
  } catch (error) {
    logger.error('Error tracking activity:', error);
    throw error;
  }
};

const getUserActivity = async (userId, options = {}) => {
  try {
    const {
      eventType,
      startDate,
      endDate,
      limit = 50,
      offset = 0
    } = options;

    let query = { user_id: userId };

    if (eventType) {
      query.event_type = eventType;
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const events = await ActivityEvent
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(offset)
      .lean();

    return events;
  } catch (error) {
    logger.error('Error getting user activity:', error);
    throw error;
  }
};

const getActivityAnalytics = async (options = {}) => {
  try {
    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate = new Date()
    } = options;

    const pipeline = [
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$event_type',
          count: { $sum: 1 },
          unique_users: { $addToSet: '$user_id' }
        }
      },
      {
        $project: {
          event_type: '$_id',
          count: 1,
          unique_users: { $size: '$unique_users' },
          _id: 0
        }
      },
      {
        $sort: { count: -1 }
      }
    ];

    const analytics = await ActivityEvent.aggregate(pipeline);
    return analytics;
  } catch (error) {
    logger.error('Error getting activity analytics:', error);
    throw error;
  }
};

module.exports = {
  trackActivity,
  getUserActivity,
  getActivityAnalytics,
  ActivityEvent
};