import pg from 'pg';

const url1 = 'postgresql://postgres:1Oneloves%262007@db.svdmmslrlmjechelmkwf.supabase.co:5432/postgres';
const url2 = 'postgresql://postgres:1Oneloves%262007@db.svdmmslrlmjechelmkwf.supabase.co:6543/postgres';

console.log('Testing connection with URL encoded password...');

const test = async (url, desc) => {
  const pool = new pg.Pool({ connectionString: url, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 5000 });
  try {
    const client = await pool.connect();
    console.log(`\n🎉 SUCCESS connecting to ${desc}!`);
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
    return true;
  } catch (err) {
    console.log(`${desc} failed:`, err.message);
    await pool.end();
    return false;
  }
};

const ok1 = await test(url1, 'Port 5432 Direct');
if (!ok1) {
  await test(url2, 'Port 6543 Direct');
}
