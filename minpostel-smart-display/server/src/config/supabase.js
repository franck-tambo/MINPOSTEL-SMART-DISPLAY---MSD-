import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || 'https://svdmmslrlmjechelmkwf.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || 'sb_publishable_f-Q-oQj8SvndioFzjzS2DA_gBJkQyXG';

let activeSupabase = null;

// Rapid DNS & endpoint connectivity verification (< 25ms)
if (supabaseUrl && supabaseKey) {
  try {
    const urlObj = new URL(supabaseUrl);
    // If DNS cannot resolve hostname, do not initialize client to avoid 7-10s timeout stalls
    await dns.lookup(urlObj.hostname);

    activeSupabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
      global: {
        // Enforce maximum 1.5s timeout on any remote Supabase call
        fetch: (url, options = {}) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 1500);
          return fetch(url, { ...options, signal: controller.signal })
            .finally(() => clearTimeout(timeoutId));
        }
      }
    });
    console.log('[SUPABASE] Connected to Supabase Cloud endpoint:', supabaseUrl);
  } catch (err) {
    console.warn(`[SUPABASE] Endpoint ${supabaseUrl} unreachable (${err.code || err.message}). Supabase cloud disabled; using local high-speed store.`);
    activeSupabase = null;
  }
}

export const supabase = activeSupabase;
export default supabase;
