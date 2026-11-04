const sigiloPublicKey = 'kaiofredy2908_1cmq6fd3bmq2s24u';
const sigiloSecretKey = 'tzlk0xxe8t4dybi2t0o1udw1ckczp01a4a9hbgptalozcan5hh0r59qw41seo3ze';
const sigiloBaseUrl = 'https://app.sigilopay.com.br';

async function checkSigilo() {
  console.log('Querying SigiloPay API...');
  
  // Try transactions list endpoints
  const endpoints = [
    '/api/v1/gateway/transactions?limit=25',
    '/api/v1/gateway/transactions?page=1&limit=25',
    '/api/v1/transactions?limit=25',
    '/api/v1/gateway/pix?limit=25'
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${sigiloBaseUrl}${ep}`, {
        headers: {
          'x-public-key': sigiloPublicKey,
          'x-secret-key': sigiloSecretKey,
          'Content-Type': 'application/json'
        }
      });
      console.log(`Endpoint ${ep} status:`, res.status);
      if (res.ok) {
        const data = await res.json();
        console.log(`Endpoint ${ep} returned:`, Array.isArray(data) ? `Array(${data.length})` : Object.keys(data));
        const list = Array.isArray(data) ? data : (data.data || data.transactions || data.items || []);
        console.log(`Found ${list.length} transactions in list:`);
        list.slice(0, 15).forEach(tx => {
          console.log(`- ID: ${tx.id || tx.transactionId} | Status: ${tx.status} | Amt: ${tx.amount || tx.chargeAmount || tx.value} | Name: ${tx.client?.name || tx.customer?.name || tx.name} | Email: ${tx.client?.email || tx.customer?.email || tx.email} | Created: ${tx.createdAt || tx.created_at} | Paid: ${tx.payedAt || tx.paidAt}`);
        });
        return;
      } else {
        const errText = await res.text();
        console.log(`Err text (${res.status}):`, errText.substring(0, 200));
      }
    } catch (e) {
      console.error(`Error on ${ep}:`, e.message);
    }
  }
}

checkSigilo().catch(console.error);
