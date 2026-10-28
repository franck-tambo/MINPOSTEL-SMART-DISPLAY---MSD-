import mysql from 'mysql2';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from minpostel-smart-display root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || '';
const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');

let pgPool = null;
let mysqlPool = null;

if (isPostgres) {
  try {
    const urlObj = new URL(dbUrl);
    // Fast DNS check to verify host is resolvable before creating pool
    await dns.lookup(urlObj.hostname);

    const { default: pg } = await import('pg');
    pgPool = new pg.Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
      max: 10,
      connectionTimeoutMillis: 1500,
      idleTimeoutMillis: 30000
    });
    console.log('[DATABASE] Initialized PostgreSQL / Supabase connection pool');
  } catch (err) {
    console.warn(`[DATABASE] PostgreSQL host unreachable (${err.code || err.message}). Using local high-speed engine.`);
    pgPool = null;
  }
} else if (process.env.DB_HOST) {
  try {
    const dbConfig = {
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'msd_db',
      waitForConnections: true,
      connectTimeout: 1000,
      connectionLimit: 10,
      queueLimit: 0,
      timezone: '+00:00'
    };
    mysqlPool = mysql.createPool(dbConfig).promise();
  } catch (err) {
    mysqlPool = null;
  }
}

/**
 * Execute parameterized query safely across both MySQL and PostgreSQL (Supabase)
 */
export async function query(sql, params = []) {
  if (pgPool) {
    try {
      let paramIndex = 1;
      const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
      const result = await pgPool.query(pgSql, params);
      return result.rows;
    } catch (err) {
      console.error(`[POSTGRES DATABASE ERROR] Query Failed: ${sql}`, err.message);
      throw err;
    }
  }

  if (mysqlPool) {
    try {
      const [rows] = await mysqlPool.execute(sql, params);
      return rows;
    } catch (err) {
      console.error(`[MYSQL DATABASE ERROR] Query Failed: ${sql}`, err.message);
      throw err;
    }
  }

  // If neither pool is reachable, throw immediately (0ms) so caller falls back to local memory/JSON store
  throw new Error('NO_DB_POOL');
}

/**
 * Test Database connection state
 */
export async function testDbConnection() {
  if (pgPool) {
    try {
      const client = await pgPool.connect();
      console.log('[DATABASE SUCCESS] Connected to Supabase / PostgreSQL Database');
      client.release();
      return true;
    } catch (err) {
      console.warn(`[DATABASE WARNING] Could not connect to Supabase PostgreSQL: ${err.message}`);
      return false;
    }
  }

  if (mysqlPool) {
    try {
      const connection = await mysqlPool.getConnection();
      console.log(`[DATABASE SUCCESS] Connected to MySQL Database`);
      connection.release();
      return true;
    } catch (err) {
      console.warn(`[DATABASE WARNING] Could not connect to MySQL: ${err.message}`);
      return false;
    }
  }

  return false;
}

export default { query, testDbConnection };
