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

async function inspectAllSales() {
  const { data: sales } = await supabase.from('verification_tokens').select('*').like('identifier', 'affiliate_sale:%');
  console.log('Total sales in Supabase:', sales.length);
  sales.forEach((s, idx) => {
    const p = JSON.parse(s.token);
    console.log(`\n=== SALE ${idx+1} === KEY: ${s.identifier}`);
    console.log(JSON.stringify(p, null, 2));
  });
}
inspectAllSales();
