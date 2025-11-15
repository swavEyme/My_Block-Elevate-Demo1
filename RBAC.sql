-- ===============================================
-- 4. CORE TABLE: ROLES
-- Defines the types of users (e.g., Admin, Viewer, Editor).
-- ===============================================

CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

INSERT INTO roles (role_name, description) VALUES
('SuperAdmin', 'Full unrestricted access to all platforms and settings.'),
('PlatformEditor', 'Can create and modify content/data on their assigned platform.'),
('BasicUser', 'Standard user with read-only access to their own data.'),
('ServiceAccount', 'Non-human account for platform-to-platform communication.');


-- ===============================================
-- 5. CORE TABLE: USER_ROLES (Junction Table)
-- Links a user to one or more roles.
-- ===============================================

CREATE TABLE user_roles (
    user_role_id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(role_id) ON DELETE RESTRICT,

    -- Ensures a user can only have one instance of a specific role
    UNIQUE (user_id, role_id)
);

-- Index for faster lookups of all users in a specific role
CREATE INDEX idx_user_roles_role_id ON user_roles (role_id);


-- ===============================================
-- 6. CORE TABLE: PERMISSIONS
-- Defines specific actions that can be taken (the 'what').
-- ===============================================

CREATE TABLE permissions (
    permission_id SERIAL PRIMARY KEY,
    permission_name VARCHAR(100) NOT NULL UNIQUE,
    -- e.g., 'platform1:create_content', 'platform2:read_analytics'
    resource_key VARCHAR(100) NOT NULL UNIQUE
);

-- Example Permissions for your ecosystem
INSERT INTO permissions (permission_name, resource_key) VALUES
('Create Platform 1 Content', 'platform1:create_content'),
('View Platform 2 Analytics', 'platform2:read_analytics'),
('Manage User Subscriptions', 'core:manage_billing'),
('System Health Check', 'system:health_check');


-- ===============================================
-- 7. CORE TABLE: ROLE_PERMISSIONS (Junction Table)
-- Links a role to specific permissions (the 'who' can do 'what').
-- ===============================================

CREATE TABLE role_permissions (
    role_permission_id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(permission_id) ON DELETE RESTRICT,

    UNIQUE (role_id, permission_id)
);

-- Example: SuperAdmin can manage billing
INSERT INTO role_permissions (role_id, permission_id) VALUES
((SELECT role_id FROM roles WHERE role_name = 'SuperAdmin'), (SELECT permission_id FROM permissions WHERE resource_key = 'core:manage_billing'));