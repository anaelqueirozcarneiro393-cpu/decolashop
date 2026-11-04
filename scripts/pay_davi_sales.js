const { createClient } = require('@supabase/supabase-js');

const targetUrl = 'https://chgttysabvuoxpujfuho.supabase.co';
const targetPub = 'sb_publishable_MK3ImGrf9HccrQgGTKVhzQ_-BiCjb-_';
const supabase = createClient(targetUrl, targetPub, { db: { schema: 'public' } });

async function markDaviSalesPaid() {
  console.log('Fetching Davi sales from Supabase...');
  const { data: rows, error } = await supabase
    .from('verification_tokens')
    .select('identifier, token')
    .like('identifier', 'affiliate_sale:%');

  if (error) {
    console.error('Error fetching sales:', error);
    return;
  }

  let updated = 0;
  for (const row of rows) {
    try {
      const sale = JSON.parse(row.token);
      const isDavi = sale.affiliateCode?.toLowerCase() === 'mhnfbcve' || sale.affiliateName?.toLowerCase().includes('david') || sale.affiliateName?.toLowerCase().includes('davi');
      if (isDavi && sale.status !== 'paid_to_affiliate') {
        sale.status = 'paid_to_affiliate';
        sale.paidAt = Date.now();

        await supabase.from('verification_tokens').delete().eq('identifier', row.identifier);
        const { error: insErr } = await supabase.from('verification_tokens').insert({
          identifier: row.identifier,
          token: JSON.stringify(sale),
          expires: '2099-01-01T00:00:00Z'
        });

        if (!insErr) {
          console.log(`✅ Marcada como paga: ${sale.customerName} (R$ ${sale.totalAmount} | Comissão R$ ${sale.commissionAmount})`);
          updated++;
        } else {
          console.error(`❌ Erro ao atualizar ${row.identifier}:`, insErr.message);
        }
      }
    } catch (e) {
      console.error('JSON parse error:', e.message);
    }
  }

  console.log(`\n🎉 Total de vendas do Davi marcadas como pagas no Supabase: ${updated}`);
}

markDaviSalesPaid().catch(console.error);
