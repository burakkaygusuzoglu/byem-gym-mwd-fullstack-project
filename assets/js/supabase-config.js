/* ============================================================
   BYEM GYM — supabase-config.js
   Supabase client initialization
   
   ⚠️  IMPORTANT:
   Replace SUPABASE_URL and SUPABASE_ANON_KEY with your
   project values from: https://supabase.com/dashboard
   Never commit real credentials to a public repo.
   Use environment variables or a .env approach for production.
   ============================================================ */

const SUPABASE_URL      = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
