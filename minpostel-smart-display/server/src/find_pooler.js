import pg from 'pg';

const password = encodeURIComponent('1Oneloves&2007');
const ref = 'svdmmslrlmjechelmkwf';

const regions = [
  'eu-west-3',
  'eu-central-1',
  'eu-west-1',
  'us-east-1',
  'us-west-1',
  'ap-southeast-1',
  'af-south-1'
];

console.log('Testing Supabase Connection Poolers...');

for (const region of regions) {
  const connStr = `postgresql://postgres.${ref}:${password}@aws-0-${region}.pooler.supabase.com:6543/postgres`;
  const pool = new pg.Pool({
    connectionString: connStr,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 3500
  });

  try {
    const client = await pool.connect();
    console.log(`\n🎉 SUCCESS! Connected via region: ${region}`);
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
    
    // Save winning string to .env
    console.log('\nWinning connection string:');
    console.log(connStr);
    process.exit(0);
  } catch (err) {
    console.log(`Region ${region}: ${err.message}`);
    await pool.end();
  }
}

console.log('\nNone of the common pooler regions connected.');
process.exit(1);
