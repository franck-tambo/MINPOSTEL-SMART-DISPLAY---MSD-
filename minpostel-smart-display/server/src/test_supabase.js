import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const dbUrl = process.env.DATABASE_URL;
console.log('Testing DATABASE_URL:', dbUrl ? dbUrl.replace(/:[^:@]+@/, ':****@') : 'NOT SET');

if (!dbUrl || dbUrl.includes('[YOUR-PASSWORD]')) {
  console.log('\n❌ [ACTION REQUIRED]: The placeholder [YOUR-PASSWORD] is still in your DATABASE_URL in .env.');
  console.log('Please replace [YOUR-PASSWORD] with the real database password you set when creating the Supabase project.');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

try {
  const client = await pool.connect();
  const res = await client.query('SELECT current_database(), current_user, version()');
  console.log('\n✅ [SUCCESS]: Connected to Supabase PostgreSQL database!');
  console.log('Database:', res.rows[0].current_database);
  console.log('User:', res.rows[0].current_user);

  const tables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  console.log('\nTables found in database:');
  tables.rows.forEach(r => console.log(' - ' + r.table_name));

  client.release();
  await pool.end();
  process.exit(0);
} catch (err) {
  console.error('\n❌ [CONNECTION FAILED]:', err.message);
  process.exit(1);
}
