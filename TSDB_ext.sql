---Prerequisite: Ensure TimescaleDB extension is installed on your PostgreSQL server.---
-- Connect to the PostgreSQL database as a superuser or admin
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- This command only needs to be run once per database.

-- ===============================================
-- 8. PLATFORM 3 CORE TABLE: METRICS
-- Stores all real-time, high-volume performance data.
-- ===============================================

CREATE TABLE metrics (
    -- The core time-series key for TimescaleDB
    time TIMESTAMP WITH TIME ZONE NOT NULL,

    -- UUID of the User (Foreign Key to PostgreSQL's users.user_id)
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,

    -- The source platform/service generating the metric
    source_service VARCHAR(100) NOT NULL,

    -- The specific event or metric name (e.g., 'latency_ms', 'api_call_count', 'cpu_usage_pct')
    metric_name VARCHAR(100) NOT NULL,

    -- The value of the metric. Using numeric for flexibility.
    metric_value NUMERIC(10, 2) NOT NULL,

    -- Optional tags for filtering (e.g., region, environment)
    tags JSONB
);

-- ===============================================
-- 9. CONVERT TO HYPERTABLE
-- This command is what turns the standard table into a high-performance TimescaleDB
-- hypertable, partitioning the data by time for fast queries.
-- ===============================================

SELECT create_hypertable('metrics', 'time', chunk_time_interval => INTERVAL '7 days');

-- Note: The '7 days' interval means the data will be physically chunked every 7 days.
-- This is crucial for performance and retention policies.

-- ===============================================
-- 10. INDEXING FOR TIME-SERIES QUERIES
-- Optimized for querying a specific metric over a time range.
-- ===============================================

CREATE INDEX idx_metrics_time_name_source ON metrics (time DESC, metric_name, source_service);

-- ===============================================
-- 11. CONTINUOUS AGGREGATE
-- Creates a materialized view that automatically updates hourly averages.
-- ===============================================

CREATE MATERIALIZED VIEW hourly_metric_summary
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 hour', time) AS hour,
    source_service,
    metric_name,
    AVG(metric_value) AS avg_value,
    MAX(metric_value) AS max_value,
    COUNT(*) AS total_points
FROM metrics
GROUP BY hour, source_service, metric_name
WITH DATA;

-- Create an index on the materialized view for fast dashboard lookups
CREATE INDEX idx_hourly_summary ON hourly_metric_summary (hour DESC, metric_name);