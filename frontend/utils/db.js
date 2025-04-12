import { Pool } from 'pg';

const pool = new Pool({
  connectionString: "postgresql://postgres:sprPlIgYvBbJubPOxxqQYqiODcAkjYOJ@hopper.proxy.rlwy.net:31690/railway",
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;