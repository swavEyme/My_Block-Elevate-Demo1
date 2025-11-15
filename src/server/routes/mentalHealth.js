const express = require('express');
const { pgPool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { trackActivity } = require('../services/activityService');

const router = express.Router();

// GET /api/mental-health/resources
router.get('/resources', authenticateToken, async (req, res, next) => {
  try {
    // TODO: Integrate with external mental health resource APIs
    // Example: Psychology Today API, BetterHelp API, etc.
    
    const mockResources = [
      {
        id: 1,
        title: "Mindfulness Meditation Guide",
        type: "article",
        category: "meditation",
        url: "/resources/mindfulness-guide"
      },
      {
        id: 2,
        title: "Anxiety Management Techniques",
        type: "video",
        category: "anxiety",
        url: "/resources/anxiety-management"
      }
    ];

    await trackActivity(req.user.user_id, 'MENTAL_HEALTH_RESOURCES_VIEWED', {
      resource_count: mockResources.length
    });

    res.json(mockResources);
  } catch (error) {
    next(error);
  }
});

// GET /api/mental-health/sessions
router.get('/sessions', authenticateToken, async (req, res, next) => {
  try {
    // TODO: Integrate with therapy session booking APIs
    // Example: SimplePractice API, TherapyNotes API
    
    const query = `
      SELECT session_id, session_date, session_type, status
      FROM mental_health_sessions 
      WHERE user_id = $1 
      ORDER BY session_date DESC
    `;
    
    // This table would need to be created in your schema
    // const result = await pgPool.query(query, [req.user.user_id]);
    
    // Mock response for now
    const mockSessions = [
      {
        session_id: 1,
        session_date: "2024-01-15T10:00:00Z",
        session_type: "therapy",
        status: "completed"
      }
    ];

    res.json(mockSessions);
  } catch (error) {
    next(error);
  }
});

// POST /api/mental-health/sessions
router.post('/sessions', authenticateToken, async (req, res, next) => {
  try {
    const { session_date, session_type, notes } = req.body;

    // TODO: Integrate with booking system APIs
    // Example: Calendly API, Acuity Scheduling API
    
    await trackActivity(req.user.user_id, 'MENTAL_HEALTH_SESSION_BOOKED', {
      session_type,
      session_date
    });

    res.status(201).json({
      message: 'Session booked successfully',
      session_id: Date.now() // Mock ID
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/mental-health/wellness-data
router.get('/wellness-data', authenticateToken, async (req, res, next) => {
  try {
    // TODO: Integrate with wellness tracking APIs
    // Example: Apple HealthKit, Google Fit, Fitbit API
    
    const mockWellnessData = {
      mood_score: 7.5,
      sleep_hours: 7.2,
      exercise_minutes: 45,
      meditation_minutes: 20,
      last_updated: new Date().toISOString()
    };

    res.json(mockWellnessData);
  } catch (error) {
    next(error);
  }
});

// POST /api/mental-health/wellness-data
router.post('/wellness-data', authenticateToken, async (req, res, next) => {
  try {
    const { mood_score, sleep_hours, exercise_minutes, meditation_minutes } = req.body;

    // TODO: Store in wellness tracking database
    // TODO: Sync with external health platforms
    
    await trackActivity(req.user.user_id, 'WELLNESS_DATA_LOGGED', {
      mood_score,
      sleep_hours,
      exercise_minutes,
      meditation_minutes
    });

    res.status(201).json({ message: 'Wellness data recorded successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;