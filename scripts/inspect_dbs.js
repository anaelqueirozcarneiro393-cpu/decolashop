const { createClient } = require('@supabase/supabase-js');

const sourceUrl = 'https://mxukkgweuanemcgwvwdk.supabase.co';
const sourceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dWtrZ3dldWFuZW1jZ3d2d2RrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzcwNDQ1OCwiZXhwIjoyMDkzMjgwNDU4fQ.330MXmQV3e9mU2C1qIr2YjITAcOTrw2jY4CkkhaY97A';

async function main() {
  const schemas = ['public', 'next_auth'];
  const candidates = [
    'users', 'accounts', 'sessions', 'verification_tokens', 
    'Product', 'products', 'affiliates', 'sales', 'lead_affiliate', 
    'pending_pix', 'subscriptions', 'orders', 'transactions'
  ];

  console.log('--- SOURCE (mxukkgweuanemcgwvwdk) ---');
  for (const s of schemas) {
    const client = createClient(sourceUrl, sourceKey, { db: { schema: s } });
    for (const t of candidates) {
      try {
        const { count, error } = await client.from(t).select('*', { count: 'exact', head: true });
        if (!error && count !== null) {
          console.log(`[${s}].[${t}]: ${count} rows`);
        }
      } catch (e) {
        // ignore
      }
    }
  }
}

main().catch(console.error);
