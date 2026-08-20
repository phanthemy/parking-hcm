-- Migration: Create user_reports table for User Reports Module
-- Rollback: DROP TABLE IF EXISTS user_reports;

CREATE TABLE IF NOT EXISTS user_reports (
  id SERIAL PRIMARY KEY,
  spot_id BIGINT REFERENCES places(id) ON DELETE SET NULL,
  spot_name TEXT,
  report_type VARCHAR(50) NOT NULL, -- 'CLOSED', 'WRONG_PRICE', 'FULL', 'WRONG_LOCATION', 'WRONG_PHONE', 'OTHER'
  description TEXT,
  reporter_contact VARCHAR(100),
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'INVESTIGATING', 'RESOLVED', 'REJECTED'
  admin_note TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status);
CREATE INDEX IF NOT EXISTS idx_user_reports_spot_id ON user_reports(spot_id);
