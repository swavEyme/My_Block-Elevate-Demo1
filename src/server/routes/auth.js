const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pgPool } = require('../config/database');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');
const { logger } = require('../utils/logger');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const userQuery = `
      SELECT user_id, email, hashed_password, status 
      FROM users 
      WHERE email = $1
    `;
    
    const result = await pgPool.query(userQuery, [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    
    if (user.status !== 'ACTIVE') {
      return res.status(401).json({ error: 'Account not active' });
    }

    const validPassword = await bcrypt.compare(password, user.hashed_password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.user_id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.user_id, email: user.email } });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout
router.post('/logout', authenticateToken, async (req, res) => {
  // In a production app, you'd blacklist the token
  res.json({ message: 'Logged out successfully' });
});

// POST /api/auth/refresh
router.post('/refresh', authenticateToken, async (req, res, next) => {
  try {
    const token = jwt.sign(
      { userId: req.user.user_id, email: req.user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    user: {
      id: req.user.user_id,
      email: req.user.email,
      roles: req.user.roles,
      permissions: req.user.permissions
    }
  });
});

module.exports = router;