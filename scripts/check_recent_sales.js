const { createClient } = require('@supabase/supabase-js');

const url = 'https://chgttysabvuoxpujfuho.supabase.co';
const key = 'sb_publishable_MK3ImGrf9HccrQgGTKVhzQ_-BiCjb-_';
const supabase = createClient(url, key, { db: { schema: 'public' } });

async function check() {
  const { data: sales, error } = await supabase
    .from('verification_tokens')
    .select('identifier, token')
    .like('identifier', 'affiliate_sale:%');

  console.log('Total sales in Supabase:', sales?.length, 'Error:', error?.message);

  const parsed = (sales || []).map(s => {
    try { return { identifier: s.identifier, ...JSON.parse(s.token) }; } catch(e) { return null; }
  }).filter(Boolean);

  parsed.sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));

  console.log('\nTop 15 most recent sales:');
  parsed.slice(0, 15).forEach(s => {
    const d = new Date(s.createdAt);
    console.log(`- ${s.customerName} | ${s.customerEmail} | R$ ${s.totalAmount} | Aff: ${s.affiliateCode} | Created: ${d.toISOString()} (BRT: ${d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}) | ${s.id || s.identifier}`);
  });

  // Check joao victor
  const jv = parsed.filter(s => (s.customerName || '').toLowerCase().includes('joao victor') || (s.customerName || '').toLowerCase().includes('joão victor') || (s.customerEmail || '').toLowerCase().includes('victor'));
  console.log('\nSales matching Joao Victor:');
  jv.forEach(s => {
    const d = new Date(s.createdAt);
    console.log(`- ${s.customerName} | ${s.customerEmail} | R$ ${s.totalAmount} | Aff: ${s.affiliateCode} | BRT: ${d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`);
  });

  // Also check pending_pix tokens or recent tokens created today
  const { data: allTokens, error: tErr } = await supabase
    .from('verification_tokens')
    .select('identifier, token')
    .order('expires', { ascending: false })
    .limit(50);

  console.log('\nSample recent tokens count:', allTokens?.length);
}

check().catch(console.error);
