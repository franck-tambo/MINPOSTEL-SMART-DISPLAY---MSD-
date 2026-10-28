import pg from 'pg';

const ip = '2a05:d018:837:ae01:4743:8fc6:3efb:530a';
const password = encodeURIComponent('1Oneloves&2007');

const url = `postgresql://postgres:${password}@[${ip}]:5432/postgres`;

console.log('Testing connection to Supabase via IPv6 literal...');

const pool = new pg.Pool({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 5000
});

try {
  const client = await pool.connect();
  console.log('\n🎉 SUCCESS! Connected directly to Supabase via IPv6!');
  const res = await client.query('SELECT current_database(), current_user, version()');
  console.log('Database:', res.rows[0].current_database);
  console.log('User:', res.rows[0].current_user);

  const tables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  console.log('\nTables found:');
  tables.rows.forEach(r => console.log(' - ' + r.table_name));

  client.release();
  await pool.end();
} catch (e) {
  console.log('IPv6 connection failed:', e.message);
  await pool.end();
}
