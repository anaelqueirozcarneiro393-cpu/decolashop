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

async function check() {
  const decIds = ['DEC-27270-VIP', 'DEC-31035-VIP', 'DEC-43900-VIP', 'DEC-JUCIELY-PIX'];
  for (const id of decIds) {
    const res = await fetch(`${base}/api/v1/gateway/transactions?id=${id}`, {
      headers: { 'x-public-key': pub, 'x-secret-key': sec }
    });
    console.log(`${id} -> SigiloPay HTTP Status:`, res.status);
  }

  console.log('\nQuerying SigiloPay for real Alan Delon transaction cmv07wbgt6hk701q2ezy3qusd...');
  try {
    const resReal = await fetch(`${base}/api/v1/gateway/transactions?id=cmv07wbgt6hk701q2ezy3qusd`, {
      headers: { 'x-public-key': pub, 'x-secret-key': sec }
    });
    console.log('Status Alan Delon:', resReal.status);
    const dataReal = await resReal.json().catch(() => ({}));
    console.log('Data Alan Delon:', dataReal);
  } catch (e) {
    console.error('Error Alan:', e);
  }
}
check();
