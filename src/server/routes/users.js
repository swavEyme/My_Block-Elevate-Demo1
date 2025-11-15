const express = require('express');
const { pgPool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/:id
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Users can only view their own profile unless they're admin
    if (req.user.user_id !== id && !req.user.roles.includes('SuperAdmin')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const query = `
      SELECT user_id, email, first_name, last_name, status, created_at
      FROM users 
      WHERE user_id = $1
    `;
    
    const result = await pgPool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/:id
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { first_name, last_name } = req.body;
    
    // Users can only update their own profile unless they're admin
    if (req.user.user_id !== id && !req.user.roles.includes('SuperAdmin')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const query = `
      UPDATE users 
      SET first_name = $1, last_name = $2, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $3
      RETURNING user_id, email, first_name, last_name, status
    `;
    
    const result = await pgPool.query(query, [first_name, last_name, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id/roles
router.get('/:id/roles', authenticateToken, requireRole(['SuperAdmin']), async (req, res, next) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT r.role_name, r.description
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.role_id
      WHERE ur.user_id = $1
    `;
    
    const result = await pgPool.query(query, [id]);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/:id/roles
router.put('/:id/roles', authenticateToken, requireRole(['SuperAdmin']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { roleIds } = req.body;

    await pgPool.query('BEGIN');
    
    // Remove existing roles
    await pgPool.query('DELETE FROM user_roles WHERE user_id = $1', [id]);
    
    // Add new roles
    for (const roleId of roleIds) {
      await pgPool.query(
        'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)',
        [id, roleId]
      );
    }
    
    await pgPool.query('COMMIT');
    res.json({ message: 'Roles updated successfully' });
  } catch (error) {
    await pgPool.query('ROLLBACK');
    next(error);
  }
});

module.exports = router;