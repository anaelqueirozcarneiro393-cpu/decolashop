async function checkProd() {
  try {
    const res = await fetch('https://decolashop-saas.vercel.app/api/affiliates');
    const data = await res.json();
    console.log('SUCCESS:', data.success);
    console.log('AFFILIATES:', JSON.stringify(data.affiliates, null, 2));
    console.log('TOTAL SALES COUNT:', data.sales.length);
    console.log('SALES LIST:');
    data.sales.forEach((s, idx) => {
      console.log(`[${idx+1}] ${s.customerName} (${s.customerEmail}) | ${s.plan} | R$ ${s.totalAmount} | TxId: ${s.transactionId}`);
    });
  } catch (err) {
    console.error('Error fetching prod:', err);
  }
}
checkProd();
