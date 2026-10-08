const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.resolve(__dirname, '../.env.local');
let env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx > -1) {
      env[trimmed.substring(0, idx).trim()] = trimmed.substring(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    }
  });
}

const supabaseUrl = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const client = createClient(supabaseUrl, supabaseKey, { db: { schema: 'next_auth' } });

async function check() {
  const { data: users, error: uErr } = await client.from('users').select('*').limit(30);
  console.log('--- ALL USERS IN DB ---');
  if (uErr) console.error('Error fetching users:', uErr);
  else console.log(JSON.stringify(users, null, 2));

  const { data: storeToken } = await client.from('verification_tokens').select('*').eq('identifier', 'system:affiliates_store_v1').maybeSingle();
  console.log('\n--- AFFILIATES STORE TOKEN ---');
  console.log(storeToken ? storeToken.token : 'NO STORE TOKEN');

  const { data: allTokens } = await client.from('verification_tokens').select('*').limit(100);
  console.log('\n--- ALL VERIFICATION TOKENS ---');
  console.log(allTokens);

  // Check public schema tables if any
  const publicClient = createClient(supabaseUrl, supabaseKey);
  const { data: pendingOrders, error: pErr } = await publicClient.from('pending_orders').select('*').limit(20);
  console.log('\n--- PUBLIC.PENDING_ORDERS ---');
  if (pErr) console.log('pending_orders error:', pErr.message);
  else console.log(pendingOrders);
}

check();
