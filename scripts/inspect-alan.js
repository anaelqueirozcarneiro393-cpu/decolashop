const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
let envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  const k = parts[0]?.trim();
  const v = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
  if (k && v) env[k] = v;
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { db: { schema: 'next_auth' } });

async function check() {
  const { data: sales } = await supabase.from('verification_tokens').select('*').like('identifier', 'affiliate_sale:%');
  console.log('--- ALL SALES FOR ALAN NEGUEBA ---');
  sales.forEach(s => {
    const p = JSON.parse(s.token);
    if (p.customerEmail && p.customerEmail.includes('alannegueba')) {
      console.log('ID:', s.identifier);
      console.log(JSON.stringify(p, null, 2));
    }
  });

  const { data: pending } = await supabase.from('verification_tokens').select('*').like('identifier', '%alannegueba%');
  console.log('--- ANY PENDING / TOKENS FOR ALAN ---');
  pending.forEach(p => {
    console.log(p.identifier, p.token);
  });

  const { data: user } = await supabase.from('users').select('*').ilike('email', '%alannegueba%');
  console.log('--- USER IN USERS TABLE ---');
  console.log(user);
}
check();
