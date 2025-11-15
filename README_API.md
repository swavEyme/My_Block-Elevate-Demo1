# BlockElevate API Documentation

## Overview
Complete API system for the BlockElevate multi-program platform with role-based access control and external platform integrations.

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and API keys
   ```

3. **Setup Databases**
   - Run `core.sql` and `RBAC.sql` in PostgreSQL
   - Ensure MongoDB and Redis are running

4. **Start Server**
   ```bash
   npm run dev  # Development
   npm start    # Production
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/me` - Get current user info

### User Management
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/:id/roles` - Get user roles (Admin only)
- `PUT /api/users/:id/roles` - Update user roles (Admin only)

### Mental Health Platform
- `GET /api/mental-health/resources` - Get wellness resources
- `GET /api/mental-health/sessions` - Get therapy sessions
- `POST /api/mental-health/sessions` - Book therapy session
- `GET /api/mental-health/wellness-data` - Get wellness tracking data
- `POST /api/mental-health/wellness-data` - Log wellness data

### Shopping Platform
- `GET /api/shop/products` - Get products
- `GET /api/shop/orders` - Get user orders
- `POST /api/shop/orders` - Place new order
- `GET /api/shop/inventory` - Get inventory (Admin/Manager only)
- `PUT /api/shop/products/:id` - Update product (Admin/Manager only)

### Social Media Hub
- `GET /api/social/posts` - Get social posts
- `POST /api/social/posts` - Create new post
- `GET /api/social/communities` - Get communities
- `POST /api/social/communities/:id/join` - Join community
- `DELETE /api/social/posts/:id` - Remove post (Moderator/Admin only)

### Admin Dashboard
- `GET /api/admin/analytics` - Get platform analytics (Admin only)
- `GET /api/admin/users` - Get all users (Admin only)
- `PUT /api/admin/users/:id/status` - Update user status (Admin only)
- `GET /api/admin/system-health` - Get system health (Admin only)
- `GET /api/roles` - Get all roles (Admin only)
- `GET /api/permissions` - Get all permissions (Admin only)

### External Integrations
- `GET /api/integrations/config` - Get integration configs (Admin only)
- `PUT /api/integrations/config/:platform` - Update integration config (Admin only)
- `POST /api/integrations/sync/:platform` - Trigger data sync (Admin only)

### Webhook Endpoints
- `POST /api/integrations/webhooks/nonprofit/:provider` - Nonprofit platform webhooks
- `POST /api/integrations/webhooks/mental-health/:provider` - Mental health platform webhooks
- `POST /api/integrations/webhooks/ecommerce/:provider` - E-commerce platform webhooks
- `POST /api/integrations/webhooks/social/:provider` - Social media platform webhooks

## External Platform Integration Setup

### Nonprofit Platforms
When you get API credentials, update these integrations:
- **GuideStar**: Organization data, financial information
- **Candid**: Grant opportunities, foundation directory
- **Network for Good**: Donation processing
- **JustGiving**: Fundraising campaigns
- **GoFundMe**: Crowdfunding data

### Mental Health Platforms
- **BetterHelp**: Therapy sessions, therapist availability
- **Talkspace**: Messaging therapy updates
- **Headspace**: Meditation progress, content library
- **Calm**: Sleep tracking, mindfulness data
- **Psychology Today**: Therapist directory

### E-commerce Platforms
- **Shopify**: Products, orders, inventory management
- **Stripe**: Payment processing, subscriptions
- **PayPal**: Payment gateway integration
- **Square**: POS transactions, inventory
- **WooCommerce**: WordPress e-commerce integration

### Social Media Platforms
- **Facebook**: Posts, comments, page insights
- **Instagram**: Media sharing, user engagement
- **Twitter**: Tweets, mentions, direct messages
- **Discord**: Server events, community management
- **LinkedIn**: Professional networking, company updates

## Role-Based Access Control

### Roles
- **SuperAdmin**: Full system access
- **PlatformEditor**: Content creation and modification
- **BasicUser**: Standard user access
- **ServiceAccount**: API-to-API communication

### Permissions
- Platform-specific permissions (e.g., `platform1:create_content`)
- System-level permissions (e.g., `core:manage_billing`)
- Resource-based access control

## Data Synchronization

### Automatic Sync
- **Hourly**: Critical data updates
- **Daily**: Comprehensive data sync at 2 AM

### Manual Sync
- Trigger via admin dashboard
- Force sync option available
- Real-time webhook processing

## Security Features
- JWT authentication with role validation
- Rate limiting (100 requests/minute per user)
- Helmet.js security headers
- Input validation with Joi
- Webhook signature verification
- Environment-based configuration

## Monitoring & Logging
- Winston logging with structured JSON
- Activity tracking in MongoDB
- System health monitoring
- External API status tracking
- Performance metrics collection

## Database Architecture
- **PostgreSQL**: User data, RBAC, subscriptions
- **MongoDB**: Activity events, wellness data, social posts
- **Redis**: Caching, sessions, rate limiting

## Development Notes
- All external API integrations are prepared with TODO comments
- Mock data provided for testing without external APIs
- Comprehensive error handling and logging
- Scalable architecture for high-volume usage
- Background job processing for data synchronization

## Next Steps
1. Add your external API credentials to `.env`
2. Implement specific external API calls in integration services
3. Create database tables for products, orders, social posts
4. Set up webhook signature verification
5. Configure monitoring and alerting systems