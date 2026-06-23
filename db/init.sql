-- PLC Tag Readings Table
CREATE TABLE IF NOT EXISTS tag_readings (
  id SERIAL PRIMARY KEY,
  tag_id VARCHAR(50) NOT NULL,
  tag_name VARCHAR(100) NOT NULL,
  tag_type VARCHAR(10) NOT NULL,
  tag_unit VARCHAR(20) NOT NULL,
  value FLOAT NOT NULL,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  reading_timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tag_readings_tag_id ON tag_readings(tag_id);
CREATE INDEX IF NOT EXISTS idx_tag_readings_timestamp ON tag_readings(reading_timestamp);
CREATE INDEX IF NOT EXISTS idx_tag_readings_created_at ON tag_readings(created_at);

-- Daily readings summary
CREATE TABLE IF NOT EXISTS tag_readings_daily (
  id SERIAL PRIMARY KEY,
  tag_id VARCHAR(50) NOT NULL,
  reading_date DATE NOT NULL,
  min_value FLOAT,
  max_value FLOAT,
  avg_value FLOAT,
  count_readings INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tag_id, reading_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_tag_id ON tag_readings_daily(tag_id);
CREATE INDEX IF NOT EXISTS idx_daily_reading_date ON tag_readings_daily(reading_date);

-- System logs
CREATE TABLE IF NOT EXISTS system_logs (
  id SERIAL PRIMARY KEY,
  level VARCHAR(10) NOT NULL,
  message TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON system_logs(created_at);
