const { createClient } = require('@supabase/supabase-js');

const targetUrl = 'https://chgttysabvuoxpujfuho.supabase.co';
const targetPub = 'sb_publishable_MK3ImGrf9HccrQgGTKVhzQ_-BiCjb-_';

async function checkDavi() {
  const supabase = createClient(targetUrl, targetPub, { db: { schema: 'public' } });
  
  // Try querying sales
  const { data: sales, error } = await supabase
    .from('verification_tokens')
    .select('identifier, token')
    .like('identifier', 'affiliate_sale:%');

  console.log('Query result error:', error?.message);
  console.log('Total sales found:', sales?.length);

  if (sales) {
    const daviSales = sales.filter(s => {
      try {
        const d = JSON.parse(s.token);
        return d.affiliateCode?.toLowerCase() === 'mhnfbcve' || d.affiliateName?.toLowerCase().includes('david') || d.affiliateName?.toLowerCase().includes('davi');
      } catch { return false; }
    });

    console.log(`\nFound ${daviSales.length} sales for Davi (mhnfbcve):`);
    let pendingCount = 0;
    let paidCount = 0;
    let pendingAmt = 0;
    let paidAmt = 0;

    daviSales.forEach(r => {
      const d = JSON.parse(r.token);
      if (d.status === 'paid_to_affiliate') {
        paidCount++;
        paidAmt += (d.commissionAmount || 0);
      } else {
        pendingCount++;
        pendingAmt += (d.commissionAmount || 0);
        console.log(`- PENDENTE: ${d.customerName} (${d.customerEmail}) | R$ ${d.totalAmount} | Comissao: R$ ${d.commissionAmount} | Status: ${d.status} | ID: ${r.identifier}`);
      }
    });

    console.log(`\nResumo Davi:`);
    console.log(`- Total de vendas: ${daviSales.length}`);
    console.log(`- Vendas Pagas: ${paidCount} (R$ ${paidAmt.toFixed(2)})`);
    console.log(`- Vendas Pendentes: ${pendingCount} (R$ ${pendingAmt.toFixed(2)})`);
  }
}

checkDavi().catch(console.error);
