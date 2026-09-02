
-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. ENUM TYPES
-- ==============================================================================

DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('ADMIN', 'OPERATOR', 'TECHNICIAN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_status_enum AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'LOCKED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE node_status_enum AS ENUM ('HEALTHY', 'WARNING', 'CRITICAL', 'OFFLINE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE alert_severity_enum AS ENUM ('INFO', 'WARNING', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE alert_status_enum AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_priority_enum AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_status_enum AS ENUM ('CREATED', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_PARTS', 'RESOLVED', 'CLOSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 3. TABLES DEFINITION
-- ==============================================================================

-- 3.1. USERS & RBAC ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'TECHNICIAN',
    status user_status_enum NOT NULL DEFAULT 'PENDING_APPROVAL',
    avatar_url VARCHAR(500),
    phone_number VARCHAR(50),
    department VARCHAR(100),
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.2. PHYSICAL SPATIAL HIERARCHY TABLES (Sites -> Rooms -> Racks)
CREATE TABLE IF NOT EXISTS sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    floor_number INT DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(site_id, code)
);

CREATE TABLE IF NOT EXISTS racks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    u_height INT NOT NULL DEFAULT 42,
    x_coord FLOAT DEFAULT 0.0,
    y_coord FLOAT DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(room_id, code)
);

-- 3.3. SERVER NODES (PHYSICAL ASSETS & AR MAPPING)
CREATE TABLE IF NOT EXISTS server_nodes (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'SRV-NODE-01'
    rack_id UUID NOT NULL REFERENCES racks(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    u_start INT NOT NULL, -- Rack U Slot start (1 to 42)
    u_height INT NOT NULL DEFAULT 2, -- 1U, 2U, 3U, 4U
    ip_address VARCHAR(45) NOT NULL,
    mac_address VARCHAR(17),
    model VARCHAR(255),
    cpu_model VARCHAR(255),
    ram_total_gb INT DEFAULT 32,
    disk_total_gb INT DEFAULT 1000,
    qr_code_payload VARCHAR(255) UNIQUE NOT NULL, -- e.g. 'ar-imms://node/SRV-NODE-01'
    status node_status_enum NOT NULL DEFAULT 'HEALTHY',
    last_heartbeat_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.4. DOCKER CONTAINERS RUNNING ON NODES
CREATE TABLE IF NOT EXISTS containers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    server_node_id VARCHAR(50) NOT NULL REFERENCES server_nodes(id) ON DELETE CASCADE,
    container_id VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    image VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'RUNNING',
    cpu_percent FLOAT DEFAULT 0.0,
    memory_usage_mb FLOAT DEFAULT 0.0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.5. HIGH-FREQUENCY TELEMETRY METRICS (TIME-SERIES DATA)
CREATE TABLE IF NOT EXISTS telemetry_metrics (
    id BIGSERIAL,
    server_node_id VARCHAR(50) NOT NULL REFERENCES server_nodes(id) ON DELETE CASCADE,
    cpu_usage_pct FLOAT NOT NULL,
    ram_usage_pct FLOAT NOT NULL,
    disk_usage_pct FLOAT NOT NULL,
    network_in_kbps FLOAT DEFAULT 0.0,
    network_out_kbps FLOAT DEFAULT 0.0,
    temperature_celsius FLOAT,
    power_draw_watts FLOAT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, recorded_at)
);

-- 3.6. ALERT THRESHOLD POLICIES
CREATE TABLE IF NOT EXISTS alert_thresholds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    metric_name VARCHAR(100) NOT NULL, -- 'cpu', 'ram', 'temp', 'disk', 'heartbeat'
    operator VARCHAR(10) NOT NULL DEFAULT '>', -- '>', '>=', '<', '<='
    warning_value FLOAT NOT NULL,
    critical_value FLOAT NOT NULL,
    duration_seconds INT NOT NULL DEFAULT 30,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.7. ALERT HISTORY & LOGS
CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'ALT-2026-1001'
    server_node_id VARCHAR(50) NOT NULL REFERENCES server_nodes(id) ON DELETE CASCADE,
    severity alert_severity_enum NOT NULL DEFAULT 'WARNING',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    metric_name VARCHAR(100),
    metric_value FLOAT,
    threshold_value FLOAT,
    status alert_status_enum NOT NULL DEFAULT 'OPEN',
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 3.8. MAINTENANCE WORK ORDERS (TICKETS)
CREATE TABLE IF NOT EXISTS maintenance_tickets (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'TCK-2026-001'
    alert_id VARCHAR(50) REFERENCES alerts(id) ON DELETE SET NULL,
    server_node_id VARCHAR(50) NOT NULL REFERENCES server_nodes(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority ticket_priority_enum NOT NULL DEFAULT 'MEDIUM',
    status ticket_status_enum NOT NULL DEFAULT 'CREATED',
    assigned_technician_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    ar_session_log JSONB, -- Coordinates & HUD logs from mobile AR inspection
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ
);

-- 3.9. SYSTEM AUDIT TRAIL & COMPLIANCE LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL, -- 'USER_LOGIN', 'ADMIN_APPROVE_USER', 'ADMIN_LOCK_USER', 'CREATE_TICKET', 'ACKNOWLEDGE_ALERT'
    entity_type VARCHAR(100) NOT NULL, -- 'USER', 'SERVER_NODE', 'ALERT', 'TICKET', 'CONFIG'
    entity_id VARCHAR(255),
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================
-- 4. PERFORMANCE INDEXES
-- ==============================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_server_nodes_rack_id ON server_nodes(rack_id);
CREATE INDEX IF NOT EXISTS idx_server_nodes_qr ON server_nodes(qr_code_payload);
CREATE INDEX IF NOT EXISTS idx_telemetry_node_time ON telemetry_metrics(server_node_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_status_time ON alerts(status, triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_status ON maintenance_tickets(assigned_technician_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_logs(created_at DESC);

-- ==============================================
-- 5. AUTOMATIC TIMESTAMP TRIGGER
-- ==============================================

CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated ON users;
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

DROP TRIGGER IF EXISTS trg_server_nodes_updated ON server_nodes;
CREATE TRIGGER trg_server_nodes_updated BEFORE UPDATE ON server_nodes FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

-- ==============================================
-- 6. INITIAL SEED DATA FOR DEMO & TESTING
-- ==============================================

-- 6.1. Seed Users (Pre-approved Admin & Operator, Default password: 'Password@123' using bcrypt hash)
-- Password '123456' hash: '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
INSERT INTO users (id, email, password_hash, full_name, role, status, avatar_url, department, approved_at)
VALUES 
('11111111-1111-1111-1111-111111111111', 'admin@ar-imms.dc', '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'System Administrator', 'ADMIN', 'APPROVED', 'AD', 'Infrastructure Ops', NOW()),
('22222222-2222-2222-2222-222222222222', 'operator@ar-imms.dc', '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'System Operator', 'OPERATOR', 'APPROVED', 'OP', 'NOC Command Center', NOW()),
('33333333-3333-3333-3333-333333333333', 'technician@ar-imms.dc', '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Nguyen Van A (Field Tech #12)', 'TECHNICIAN', 'APPROVED', 'NA', 'Field Maintenance', NOW())
ON CONFLICT (email) DO NOTHING;

-- 6.2. Seed Data Center Site & Room
INSERT INTO sites (id, name, code, address)
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'UTH High-Tech Campus Data Center', 'UTH-DC01', 'Ho Chi Minh City, Vietnam')
ON CONFLICT (code) DO NOTHING;

INSERT INTO rooms (id, site_id, name, code, floor_number)
VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Primary Server Room A', 'ROOM-A', 2)
ON CONFLICT (site_id, code) DO NOTHING;

-- 6.3. Seed Racks (Rack A1, Rack A2, Rack B1)
INSERT INTO racks (id, room_id, name, code, u_height, x_coord, y_coord)
VALUES 
('cccccccc-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Rack A1 (Primary Compute)', 'rack-a1', 42, 1.2, 0.5),
('cccccccc-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Rack A2 (Storage & Web)', 'rack-a2', 42, 2.0, 0.5),
('cccccccc-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Rack B1 (AI & GPU Cluster)', 'rack-b1', 42, 1.2, 1.8)
ON CONFLICT (room_id, code) DO NOTHING;

-- 6.4. Seed Server Nodes
INSERT INTO server_nodes (id, rack_id, name, u_start, u_height, ip_address, mac_address, model, cpu_model, ram_total_gb, qr_code_payload, status)
VALUES
('SRV-NODE-01', 'cccccccc-1111-1111-1111-111111111111', 'Primary Compute Node 01', 38, 2, '192.168.1.101', '52:54:00:8b:22:11', 'Dell PowerEdge R740', 'Intel Xeon Gold 6248R', 64, 'ar-imms://node/SRV-NODE-01', 'HEALTHY'),
('SRV-NODE-02', 'cccccccc-1111-1111-1111-111111111111', 'Storage & DB Replica 01', 34, 3, '192.168.1.102', '52:54:00:8b:22:12', 'HPE ProLiant DL380 Gen10', 'Intel Xeon Silver 4210', 128, 'ar-imms://node/SRV-NODE-02', 'HEALTHY'),
('SRV-NODE-03', 'cccccccc-1111-1111-1111-111111111111', 'AR Vision Processor Node', 28, 3, '192.168.1.103', '52:54:00:8b:22:13', 'NVIDIA RTX Server', 'Tesla T4 x2 Dual GPU', 64, 'ar-imms://node/SRV-NODE-03', 'HEALTHY'),
('SRV-NODE-04', 'cccccccc-2222-2222-2222-222222222222', 'Application Web Gateway', 36, 2, '192.168.1.104', '52:54:00:8b:22:14', 'Supermicro 1U TwinPro', 'AMD EPYC 7302P', 32, 'ar-imms://node/SRV-NODE-04', 'HEALTHY'),
('SRV-NODE-05', 'cccccccc-2222-2222-2222-222222222222', 'Log Aggregator & Pipeline', 20, 3, '192.168.1.105', '52:54:00:8b:22:15', 'Dell PowerEdge R640', 'Intel Xeon Bronze 3204', 64, 'ar-imms://node/SRV-NODE-05', 'HEALTHY'),
('SRV-NODE-06', 'cccccccc-3333-3333-3333-333333333333', 'Deep Learning & Analytics Node', 30, 4, '192.168.1.106', '52:54:00:8b:22:16', 'Gigabyte GPU Chassis', '4x RTX 4090 Cluster', 128, 'ar-imms://node/SRV-NODE-06', 'HEALTHY')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  model = EXCLUDED.model,
  status = EXCLUDED.status;

-- 6.5. Seed Default Alert Thresholds
INSERT INTO alert_thresholds (name, metric_name, warning_value, critical_value, duration_seconds)
VALUES 
('CPU Utilization Threshold', 'cpu', 75.0, 90.0, 30),
('Memory (RAM) Utilization Threshold', 'ram', 80.0, 92.0, 30),
('Thermal Temperature Threshold', 'temp', 65.0, 80.0, 15),
('Heartbeat Stale Detection', 'heartbeat', 45.0, 90.0, 90)
ON CONFLICT DO NOTHING;

-- 6.6. Seed Sample Initial Audit Log
INSERT INTO audit_logs (user_email, action, entity_type, entity_id, ip_address, details)
VALUES 
('admin@ar-imms.dc', 'SCHEMA_INITIALIZATION', 'DATABASE', 'POSTGRESQL', '127.0.0.1', '{"status": "SUCCESS", "version": "1.0-PROD"}');
