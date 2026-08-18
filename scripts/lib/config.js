'use strict';

// Shared across every book/catalog build. Public and safe to ship client-side
// on purpose -- this is Supabase's anon key, gated entirely by the RLS
// policies in deploy/supabase_schema.sql, not by secrecy.
const SUPABASE_ANON_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4Njk2MTU4MCwiZXhwIjo0OTQyNjM1MTgwLCJyb2xlIjoiYW5vbiJ9.jfJMjIAPRUvadhcJuuoUjHvQYw1ocmpOrRFduy8__aM';

const SITE_ORIGIN = 'https://arabic.kasbpro.com';

module.exports = { SUPABASE_ANON_KEY, SITE_ORIGIN };
