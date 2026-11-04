const { createClient } = require('@supabase/supabase-js');

// Check old DB (mxukkgweuanemcgwvwdk)
const oldUrl = 'https://mxukkgweuanemcgwvwdk.supabase.co';
const oldKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dWtrZ3dldWFuZW1jZ3d2d2RrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzcwNDQ1OCwiZXhwIjoyMDkzMjgwNDU4fQ.330MXmQV3e9mU2C1qIr2YjITAcOTrw2jY4CkkhaY97A';
const oldSupabase = createClient(oldUrl, oldKey, { db: { schema: 'next_auth' } });

async function checkOld() {
  console.log('--- CHECKING OLD DATABASE (mxukkgweuanemcgwvwdk) ---');
  const { data: sales, error } = await oldSupabase
    .from('verification_tokens')
    .select('identifier, token')
    .like('identifier', 'affiliate_sale:%');

  console.log('Total sales in old DB:', sales?.length, error ? error.message : '');

  const parsed = (sales || []).map(s => {
    try { return JSON.parse(s.token); } catch(e) { return null; }
  }).filter(Boolean);

  parsed.sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));

  console.log('Top 10 sales in old DB:');
  parsed.slice(0, 10).forEach(s => {
    const d = new Date(s.createdAt);
    console.log(`- ${s.customerName} | ${s.customerEmail} | R$ ${s.totalAmount} | Aff: ${s.affiliateCode} | ${d.toISOString()} (BRT: ${d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })})`);
  });

  const jv = parsed.filter(s => (s.customerName || '').toLowerCase().includes('victor') || (s.customerEmail || '').toLowerCase().includes('victor'));
  console.log('\nVictor sales in old DB:', jv.length);
  jv.forEach(s => {
    const d = new Date(s.createdAt);
    console.log(`-> ${s.customerName} | ${s.customerEmail} | R$ ${s.totalAmount} | Aff: ${s.affiliateCode} | ${d.toISOString()} (BRT: ${d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })})`);
  });
}

checkOld().catch(console.error);
