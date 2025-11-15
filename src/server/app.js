const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { connectDatabases } = require('./config/database');
const { logger } = require('./utils/logger');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const mentalHealthRoutes = require('./routes/mentalHealth');
const shopRoutes = require('./routes/shop');
const socialRoutes = require('./routes/social');
const adminRoutes = require('./routes/admin');
const integrationRoutes = require('./routes/integrations');
const staticRoutes = require('./routes/static');
const { errorHandler } = require('./middleware/errorHandler');
const { rateLimitMiddleware } = require('./middleware/rateLimit');

const app = express();
const PORT = process.env.PORT || 3001;

// Security & CORS
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(rateLimitMiddleware);

// Routes
app.use('/', staticRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/mental-health', mentalHealthRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/integrations', integrationRoutes);

// Error handling
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDatabases();
    app.listen(PORT, () => {
      logger.info(`BlockElevate API running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();