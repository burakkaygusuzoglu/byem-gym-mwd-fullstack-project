/* ============================================================
   BYEM GYM — supabase-config.js
   Supabase client initialization
   
   ⚠️  IMPORTANT:
   Replace SUPABASE_URL and SUPABASE_ANON_KEY with your
   project values from: https://supabase.com/dashboard
   Never commit real credentials to a public repo.
   Use environment variables or a .env approach for production.
   ============================================================ */

const SUPABASE_URL = 'https://wllrwaktpzfztwafcrlk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsbHJ3YWt0cHpmenR3YWZjcmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjUyNzYsImV4cCI6MjA5MjIwMTI3Nn0.fOTVg_h8PqHDhOIGmbwW34jiaBkoG2WSo4uJuLgaPdU';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
