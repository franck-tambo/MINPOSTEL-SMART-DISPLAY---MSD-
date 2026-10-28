import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || 'https://svdmmslrlmjechelmkwf.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Testing insert with Supabase Service Role Key...');

const newAnnouncement = {
  title_fr: 'Digitalisation des Services Postaux',
  title_en: 'Digitalization of Postal Services',
  description_fr: 'Le Ministère des Postes et Télécommunications informe le public du déploiement de nouveaux guichets numériques.',
  description_en: 'The Ministry of Posts and Telecommunications informs visitors of the deployment of new digital counters.',
  priority: 'IMPORTANT',
  status: 'PUBLISHED',
  card_color: '#134074'
};

const { data, error } = await supabase.from('announcements').insert([newAnnouncement]).select();

if (error) {
  console.error('\n❌ Insert error:', error.message);
} else {
  console.log('\n🎉 SUCCESS! Inserted into Supabase announcements table:');
  console.log(data);
}
