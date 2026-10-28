import pg from 'pg';

const password = encodeURIComponent('1Oneloves&2007');
const ref = 'svdmmslrlmjechelmkwf';

const regions = [
  'eu-west-3', 'eu-west-2', 'eu-west-1', 'eu-central-1', 'eu-north-1',
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 'ca-central-1',
  'ap-south-1', 'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2',
  'sa-east-1', 'me-central-1'
];

console.log('Testing all Supabase pooler regions...');

const results = await Promise.allSettled(regions.map(async (reg) => {
  const host = `aws-0-${reg}.pooler.supabase.com`;
  const connStr = `postgresql://postgres.${ref}:${password}@${host}:6543/postgres`;
  const pool = new pg.Pool({ connectionString: connStr, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 5000 });
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT current_database(), current_user');
    client.release();
    await pool.end();
    return { reg, connStr, db: res.rows[0] };
  } catch (e) {
    await pool.end();
    throw { reg, err: e.message };
  }
}));

const found = results.find(r => r.status === 'fulfilled');
if (found) {
  console.log('\n🎉 FOUND WORKING POOLER!');
  console.log('Region:', found.value.reg);
  console.log('Database:', found.value.db);
  console.log('Working Connection String:');
  console.log(found.value.connStr);
} else {
  console.log('\nFailed details:');
  results.forEach((r, i) => {
    console.log(`- ${regions[i]}: ${r.reason?.err}`);
  });
}
