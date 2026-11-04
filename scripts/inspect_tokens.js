const { createClient } = require('@supabase/supabase-js');

const sourceUrl = 'https://mxukkgweuanemcgwvwdk.supabase.co';
const sourceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dWtrZ3dldWFuZW1jZ3d2d2RrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzcwNDQ1OCwiZXhwIjoyMDkzMjgwNDU4fQ.330MXmQV3e9mU2C1qIr2YjITAcOTrw2jY4CkkhaY97A';
const supabase = createClient(sourceUrl, sourceKey, { db: { schema: 'next_auth' } });

async function fetchAll(table) {
  let all = [];
  let from = 0;
  const step = 1000;
  while (true) {
    const { data, error } = await supabase.from(table).select('*').range(from, from + step - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < step) break;
    from += step;
  }
  return all;
}

async function main() {
  const tokens = await fetchAll('verification_tokens');
  const prefixes = {};
  for (const row of tokens) {
    const id = row.identifier || '';
    const colon = id.indexOf(':');
    const p = colon !== -1 ? id.substring(0, colon) : id;
    prefixes[p] = (prefixes[p] || 0) + 1;
  }
  console.log('Total verification tokens fetched:', tokens.length);
  console.log('Breakdown by prefix:', prefixes);

  const sales = tokens.filter(t => t.identifier.startsWith('affiliate_sale:'));
  console.log('Real count of affiliate_sale:', sales.length);
}

main().catch(console.error);
