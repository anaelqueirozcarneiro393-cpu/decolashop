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

const pub = env.SIGILOPAY_PUBLIC_KEY;
const sec = env.SIGILOPAY_SECRET_KEY;
const base = env.SIGILOPAY_BASE_URL || 'https://app.sigilopay.com.br';

async function listAllSigilo() {
  const endpoints = [
    '/api/v1/gateway/transactions',
    '/api/v1/gateway/transactions?page=1&limit=20',
    '/api/v1/gateway/orders'
  ];

  for (const ep of endpoints) {
    console.log(`\nTesting ${ep}...`);
    try {
      const res = await fetch(`${base}${ep}`, {
        headers: { 'x-public-key': pub, 'x-secret-key': sec }
      });
      console.log('Status:', res.status);
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        console.log('Success! Sample data:', Array.isArray(data) ? `Array of ${data.length}` : (data.data ? `data.data length: ${data.data.length}` : Object.keys(data)));
        if (Array.isArray(data)) {
          data.slice(0, 10).forEach(tx => console.log(`TX: ${tx.id} | ${tx.amount} | ${tx.status} | Client: ${tx.client?.name || tx.client?.email || 'N/A'}`));
        } else if (data.data && Array.isArray(data.data)) {
          data.data.slice(0, 10).forEach(tx => console.log(`TX: ${tx.id} | ${tx.amount} | ${tx.status} | Client: ${tx.client?.name || tx.client?.email || 'N/A'}`));
        }
      } else {
        console.log('Failed:', data);
      }
    } catch (e) {
      console.error(e.message);
    }
  }
}
listAllSigilo();
