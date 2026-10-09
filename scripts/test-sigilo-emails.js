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

async function testParams() {
  const emails = [
    'lucas27amorim@gmail.com',
    'ceramoscarloseduardo6@gmail.com',
    'sjanayna439@gmail.com',
    'jucielyj9@gmail.com',
    'alannegueba00@gmail.com'
  ];

  for (const em of emails) {
    const res = await fetch(`${base}/api/v1/gateway/transactions?email=${encodeURIComponent(em)}`, {
      headers: { 'x-public-key': pub, 'x-secret-key': sec }
    });
    console.log(`Email ${em} status:`, res.status);
    const data = await res.json().catch(() => ({}));
    console.log(`Data for ${em}:`, data?.statusCode ? data.message : (data.id ? data.id : data));
  }
}
testParams();
