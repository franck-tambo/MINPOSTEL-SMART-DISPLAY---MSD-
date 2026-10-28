import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || 'https://svdmmslrlmjechelmkwf.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_f-Q-oQj8SvndioFzjzS2DA_gBJkQyXG';

console.log('Testing Supabase JS Client connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey.substring(0, 15) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

try {
  const { data, error } = await supabase.from('announcements').select('*');
  if (error) {
    console.error('\n❌ Supabase Query Error:', error.message);
  } else {
    console.log('\n🎉 SUCCESS! Connected to Supabase via HTTPS REST Client!');
    console.log(`Announcements found in Supabase: ${data.length}`);
    console.log(data);
  }
} catch (err) {
  console.error('\n❌ Connection Exception:', err.message);
}
