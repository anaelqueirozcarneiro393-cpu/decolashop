const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync(path.resolve(__dirname, '../.env.local'), 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  const k = parts[0]?.trim();
  const v = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
  if (k && v) env[k] = v;
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  db: { schema: 'next_auth' }
});

async function run() {
  console.log('=== USERS TABLE ===');
  const { data: users } = await supabase.from('users').select('*');
  users.forEach(u => {
    console.log(`Email: ${u.email} | Plan: ${u.plan} | Name: ${u.name}`);
  });

  console.log('\n=== ALL TOKENS FOR LUCAS AMORIM ===');
  const { data: tokens } = await supabase.from('verification_tokens').select('*').ilike('token', '%lucas27amorim%');
  tokens.forEach(t => {
    console.log(`ID: ${t.identifier}`);
    console.log(t.token);
  });
}
run();
