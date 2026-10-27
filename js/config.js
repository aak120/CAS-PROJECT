// FiQuo settings you can change without touching the rest of the code.
// Supabase: create a free project at supabase.com, run supabase/schema.sql in its SQL Editor,
// then paste the Project URL and the publishable (or "anon") key from Project Settings → API.
// That key is meant to be public: the database only lets it insert rows and read totals.
window.MQ = window.MQ || {};
MQ.CONFIG = {
  supabaseUrl: '',      // e.g. 'https://abcdefghijkl.supabase.co'
  supabaseKey: '',      // e.g. 'sb_publishable_...' or the long 'eyJ...' anon key
  founder: '',          // optional: the name you want shown on the "Our story" page
  contactEmail: ''      // optional: shown to teachers who want to use FiQuo in class
};
