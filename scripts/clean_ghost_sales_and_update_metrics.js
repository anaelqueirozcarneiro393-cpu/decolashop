const { createClient } = require('@supabase/supabase-js');
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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  db: { schema: 'next_auth' }
});

const EXPIRY_FAR_FUTURE = '2099-01-01T00:00:00Z';

const GHOST_SALE_KEYS = [
  'affiliate_sale:sale_af_1791505170601_eeq2', // Alan Delon (ghost 179.90)
  'affiliate_sale:sale_af_1791491585193_3kmc', // Giovani (ghost 179.90)
  'affiliate_sale:sale_af_1791490399560_4tlx', // Marcones (ghost 179.90)
  'affiliate_sale:sale_af_1791493534767_u8wy'  // Erick (ghost 179.90)
];

async function run() {
  console.log('=== 1. DELETANDO AS 4 VENDAS FANTASMA DO SUPABASE ===');
  for (const key of GHOST_SALE_KEYS) {
    const { error } = await supabase.from('verification_tokens').delete().eq('identifier', key);
    if (error) {
      console.error(`Erro ao deletar ${key}:`, error);
    } else {
      console.log(`✅ Deletado com sucesso: ${key}`);
    }
  }

  console.log('\n=== 2. OBTENDO TODAS AS VENDAS RESTANTES ===');
  const { data: salesRows, error: salesErr } = await supabase
    .from('verification_tokens')
    .select('*')
    .like('identifier', 'affiliate_sale:%');

  if (salesErr) {
    console.error('Erro ao buscar vendas:', salesErr);
    return;
  }

  console.log(`Total de vendas reais restantes no banco: ${salesRows.length}`);

  let totalRev = 0;
  let totalSalesCount = 0;
  const verifiedSales = [];

  for (const row of salesRows) {
    const sale = JSON.parse(row.token);
    
    // Garantir comissão de 100% para Kaio (Dono)
    if (sale.affiliateCode === 'rwjncwiofw' || sale.affiliateCode === 'kaio') {
      sale.affiliateCode = 'rwjncwiofw';
      sale.affiliateName = 'kaio';
      sale.commissionPercent = 100;
      sale.commissionAmount = sale.totalAmount;
    }

    totalRev += sale.totalAmount;
    totalSalesCount += 1;
    verifiedSales.push(sale);

    // Salvar token normalizado
    await supabase.from('verification_tokens').update({
      token: JSON.stringify(sale)
    }).eq('identifier', row.identifier);

    console.log(`- [Venda ${totalSalesCount}] ${sale.customerName} (${sale.customerEmail}) | Plano: ${sale.plan} | R$ ${sale.totalAmount} | TxId: ${sale.transactionId || 'NONE'}`);
  }

  totalRev = Number(totalRev.toFixed(2));
  console.log(`\nFaturamento Real Total: R$ ${totalRev}`);
  console.log(`Quantidade de Vendas: ${totalSalesCount}`);

  console.log('\n=== 3. ATUALIZANDO AFILIADO KAIO (rwjncwiofw) NO SUPABASE ===');
  const kaioAffiliate = {
    id: 'af_rwjncwiofw_muzjd4ee',
    name: 'kaio',
    code: 'rwjncwiofw',
    email: 'kaiofredy2908@gmail.com',
    phone: '63992369341',
    pixKey: '63992369341',
    pixKeyType: 'phone',
    commissionPercent: 100,
    active: true,
    createdAt: 1791463921286,
    totalRevenue: totalRev,
    totalSalesCount: totalSalesCount,
    pendingCommission: totalRev,
    paidCommission: 0,
    lastPaidAt: null
  };

  await supabase.from('verification_tokens').delete().eq('identifier', 'affiliate:rwjncwiofw');
  await supabase.from('verification_tokens').insert({
    identifier: 'affiliate:rwjncwiofw',
    token: JSON.stringify(kaioAffiliate),
    expires: EXPIRY_FAR_FUTURE
  });

  await supabase.from('verification_tokens').delete().eq('identifier', 'affiliate:kaio');
  await supabase.from('verification_tokens').insert({
    identifier: 'affiliate:kaio',
    token: JSON.stringify({
      ...kaioAffiliate,
      code: 'kaio',
      name: 'kaio (alias)'
    }),
    expires: EXPIRY_FAR_FUTURE
  });

  console.log('✅ Afiliado oficial kaio (rwjncwiofw) atualizado com 100% de comissão e totais exatos!');
}

run();
