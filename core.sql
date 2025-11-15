-- ===============================================
-- 1. CORE TABLE: USERS
-- Stores foundational, non-volatile user account information.
-- ===============================================

CREATE TABLE users (
    -- Primary Key: Globally unique identifier for the user
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic Authentication & Identity
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_VERIFICATION'
        CHECK (status IN ('ACTIVE', 'INACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED')),

    -- User Profile Data (Minimal core data)
    first_name VARCHAR(100),
    last_name VARCHAR(100),

    -- Timestamps for Auditing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups based on account status
CREATE INDEX idx_users_status ON users (status);


-- ===============================================
-- 2. CORE TABLE: PLATFORM_CONFIGS
-- Stores integration details for the 4 foundational platforms.
-- ===============================================

CREATE TABLE platform_configs (
    -- Unique Identifier for the platform integration
    platform_config_id SERIAL PRIMARY KEY,

    -- Name of the integrated platform (e.g., 'Behavioral_Data_Platform', 'Metrics_Engine')
    platform_name VARCHAR(100) NOT NULL UNIQUE,

    -- System-level configuration details (e.g., connection strings, API roots)
    api_endpoint TEXT NOT NULL,
    secret_key_hash VARCHAR(255),

    -- Status of the integration
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial records for the 4 foundational platforms
INSERT INTO platform_configs (platform_name, api_endpoint) VALUES
('Behavioral_Data_Platform', 'http://behavioral.internal/api/v1/'),
('Real_Time_Metrics_Engine', 'http://metrics.internal/api/v2/'),
('Session_Cache_Service', 'redis://cache.internal:6379'),
('Future_Platform_X', 'http://future.internal/api/v1/');


-- ===============================================
-- 3. CORE TABLE: USER_SUBSCRIPTIONS
-- Handles billing and access control for platform features.
-- ===============================================

CREATE TABLE user_subscriptions (
    subscription_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign Key linking back to the USERS table
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,

    -- Plan details
    plan_name VARCHAR(50) NOT NULL DEFAULT 'FREE',
    plan_level INTEGER NOT NULL DEFAULT 1,

    -- Subscription Status and Dates
    status VARCHAR(50) NOT NULL DEFAULT 'TRIAL'
        CHECK (status IN ('TRIAL', 'ACTIVE', 'PAUSED', 'CANCELED', 'EXPIRED')),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,

    -- Enforce one active subscription per user (using a functional unique index later if needed)
    UNIQUE (user_id, status)
);

-- Index for quickly retrieving all users of a certain plan
CREATE INDEX idx_subscriptions_plan_name ON user_subscriptions (plan_name);

-- ===============================================
-- END OF CORE SCHEMA
-- ===============================================