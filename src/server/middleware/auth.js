const jwt = require('jsonwebtoken');
const { pgPool } = require('../config/database');
const { logger } = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'blockelevate-secret-key';

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user with roles
    const userQuery = `
      SELECT u.user_id, u.email, u.status, 
             array_agg(r.role_name) as roles,
             array_agg(p.resource_key) as permissions
      FROM users u
      LEFT JOIN user_roles ur ON u.user_id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.role_id
      LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.permission_id
      WHERE u.user_id = $1 AND u.status = 'ACTIVE'
      GROUP BY u.user_id, u.email, u.status
    `;
    
    const result = await pgPool.query(userQuery, [decoded.userId]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

const requireRole = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const hasRole = requiredRoles.some(role => req.user.roles.includes(role));
    if (!hasRole) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

const requirePermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.permissions) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!req.user.permissions.includes(requiredPermission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  requirePermission,
  JWT_SECRET
};