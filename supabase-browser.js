const SUPABASE_URL = 'https://qdmepttnxfvmeqjywkap.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkbWVwdHRueGZ2bWVxanl3a2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0OTQzNTUsImV4cCI6MjA5MDA3MDM1NX0.eKvqCstACgi5yvp_sSDF6_xqNxt_FKuEvzNvimhnUzc';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.bccSupabase = supabaseClient;
window.bccSlugify = function(str = '') {
  return String(str).toLowerCase().trim().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-').replace(/^-+|-+$/g, '');
};
