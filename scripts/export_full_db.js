const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const sourceUrl = 'https://mxukkgweuanemcgwvwdk.supabase.co';
const sourceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dWtrZ3dldWFuZW1jZ3d2d2RrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzcwNDQ1OCwiZXhwIjoyMDkzMjgwNDU4fQ.330MXmQV3e9mU2C1qIr2YjITAcOTrw2jY4CkkhaY97A';

async function fetchAll(client, table) {
  let all = [];
  let from = 0;
  const step = 1000;
  while (true) {
    const { data, error } = await client.from(table).select('*').range(from, from + step - 1);
    if (error) {
      console.error(`Error fetching ${table}:`, error.message);
      break;
    }
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < step) break;
    from += step;
  }
  return all;
}

async function exportAll() {
  console.log('Starting full export from mxukkgweuanemcgwvwdk...');
  
  const clientNextAuth = createClient(sourceUrl, sourceKey, { db: { schema: 'next_auth' } });
  const clientPublic = createClient(sourceUrl, sourceKey, { db: { schema: 'public' } });

  const users = await fetchAll(clientNextAuth, 'users');
  console.log(`Exported ${users.length} users`);

  const accounts = await fetchAll(clientNextAuth, 'accounts');
  console.log(`Exported ${accounts.length} accounts`);

  const sessions = await fetchAll(clientNextAuth, 'sessions');
  console.log(`Exported ${sessions.length} sessions`);

  const verification_tokens = await fetchAll(clientNextAuth, 'verification_tokens');
  console.log(`Exported ${verification_tokens.length} verification_tokens`);

  const products = await fetchAll(clientPublic, 'Product');
  console.log(`Exported ${products.length} products`);

  const dump = {
    exportedAt: new Date().toISOString(),
    sourceProject: 'mxukkgweuanemcgwvwdk',
    tables: {
      users,
      accounts,
      sessions,
      verification_tokens,
      products
    }
  };

  const outPath = path.join(__dirname, 'full_db_dump.json');
  fs.writeFileSync(outPath, JSON.stringify(dump, null, 2), 'utf-8');
  console.log(`Full dump saved to: ${outPath} (${(fs.statSync(outPath).size / 1024 / 1024).toFixed(2)} MB)`);
}

exportAll().catch(console.error);
