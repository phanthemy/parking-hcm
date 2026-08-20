import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.SPATIAL_DATABASE_URL || 'postgresql://erp:erp_dev_2026@localhost:5432/mapgo_spatial',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default pool;
