const express = require('express');
const { pgPool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/analytics
router.get('/analytics', authenticateToken, requireRole(['SuperAdmin']), async (req, res, next) => {
  try {
    const { timeframe = '30d' } = req.query;

    // TODO: Integrate with analytics platforms
    // Example: Google Analytics API, Mixpanel API, Amplitude API
    
    const mockAnalytics = {
      users: {
        total: 15420,
        active_30d: 8750,
        new_30d: 1250,
        growth_rate: 12.5
      },
      engagement: {
        avg_session_duration: 18.5,
        posts_created_30d: 3420,
        orders_30d: 890,
        wellness_entries_30d: 5670
      },
      revenue: {
        total_30d: 45670.50,
        avg_order_value: 51.30,
        conversion_rate: 3.2
      },
      platform_usage: {
        mental_health: 65,
        shopping: 45,
        social: 78,
        admin: 12
      }
    };

    res.json(mockAnalytics);
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/users
router.get('/users', authenticateToken, requireRole(['SuperAdmin']), async (req, res, next) => {
  try {
    const { status, role, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT u.user_id, u.email, u.first_name, u.last_name, u.status, u.created_at,
             array_agg(r.role_name) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.user_id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.role_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND u.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` GROUP BY u.user_id, u.email, u.first_name, u.last_name, u.status, u.created_at`;
    
    if (role) {
      query += ` HAVING $${params.length + 1} = ANY(array_agg(r.role_name))`;
      params.push(role);
    }

    query += ` ORDER BY u.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pgPool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/users/:id/status
router.put('/users/:id/status', authenticateToken, requireRole(['SuperAdmin']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['ACTIVE', 'INACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const query = `
      UPDATE users 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2
      RETURNING user_id, email, status
    `;
    
    const result = await pgPool.query(query, [status, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // TODO: Send notification to user about status change
    // TODO: Log admin action for audit trail

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/system-health
router.get('/system-health', authenticateToken, requireRole(['SuperAdmin']), async (req, res, next) => {
  try {
    // TODO: Integrate with monitoring services
    // Example: New Relic API, DataDog API, AWS CloudWatch
    
    const mockSystemHealth = {
      status: "healthy",
      uptime: "99.9%",
      response_time: {
        avg: 145,
        p95: 280,
        p99: 450
      },
      databases: {
        postgresql: { status: "healthy", connections: 45, max_connections: 100 },
        mongodb: { status: "healthy", connections: 23, max_connections: 50 },
        redis: { status: "healthy", memory_usage: "65%" }
      },
      external_apis: {
        payment_gateway: { status: "healthy", last_check: "2024-01-15T10:30:00Z" },
        email_service: { status: "healthy", last_check: "2024-01-15T10:30:00Z" },
        sms_service: { status: "degraded", last_check: "2024-01-15T10:25:00Z" }
      },
      server_metrics: {
        cpu_usage: 35,
        memory_usage: 68,
        disk_usage: 42
      }
    };

    res.json(mockSystemHealth);
  } catch (error) {
    next(error);
  }
});

// GET /api/roles
router.get('/roles', authenticateToken, requireRole(['SuperAdmin']), async (req, res, next) => {
  try {
    const query = 'SELECT role_id, role_name, description FROM roles ORDER BY role_name';
    const result = await pgPool.query(query);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// GET /api/permissions
router.get('/permissions', authenticateToken, requireRole(['SuperAdmin']), async (req, res, next) => {
  try {
    const query = 'SELECT permission_id, permission_name, resource_key FROM permissions ORDER BY permission_name';
    const result = await pgPool.query(query);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

module.exports = router;