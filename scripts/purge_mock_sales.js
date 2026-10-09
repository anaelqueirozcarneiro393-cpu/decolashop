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

const MOCK_KEYS = [
  'affiliate_sale:DEC-27270-VIP',
  'affiliate_sale:DEC-31035-VIP',
  'affiliate_sale:DEC-43900-VIP',
  'affiliate_sale:DEC-JUCIELY-PIX',
  'affiliate_sale:sale_af_lucas_amorim_vip',
  'affiliate_sale:sale_af_carlos_eduardo_vip',
  'affiliate_sale:sale_af_janayna_vip',
  'affiliate_sale:sale_af_juciely_justino_pix'
];

async function run() {
  console.log('=== 1. DELETANDO AS 4 VENDAS MOCK DO SUPABASE ===');
  for (const key of MOCK_KEYS) {
    const { error } = await supabase.from('verification_tokens').delete().eq('identifier', key);
    if (error) console.error(`Erro ao deletar ${key}:`, error);
    else console.log(`✅ Deletado: ${key}`);
  }

  // Deletar ou limpar do storage legado se existir
  await supabase.from('verification_tokens').delete().eq('identifier', 'system:affiliates_store_v1');
  console.log('✅ Removido system:affiliates_store_v1 legado');

  console.log('\n=== 2. OBTENDO APENAS AS VENDAS 100% REAIS DA SIGILOPAY ===');
  const { data: remainingSales } = await supabase
    .from('verification_tokens')
    .select('*')
    .like('identifier', 'affiliate_sale:%');

  console.log(`Vendas restantes no Supabase: ${remainingSales.length}`);

  let totalRev = 0;
  let count = 0;

  remainingSales.forEach((s, idx) => {
    const sale = JSON.parse(s.token);
    totalRev += sale.totalAmount;
    count += 1;
    console.log(`[${idx+1}] ${sale.customerName} (${sale.customerEmail}) | R$ ${sale.totalAmount} | Plano: ${sale.plan} | TxId: ${sale.transactionId}`);
  });

  totalRev = Number(totalRev.toFixed(2));
  console.log(`\nFaturamento Real Total: R$ ${totalRev}`);
  console.log(`Total de Vendas Reais: ${count}`);

  console.log('\n=== 3. ATUALIZANDO AFILIADO KAIO COM OS VALORES 100% REAIS ===');
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
    totalSalesCount: count,
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

  console.log('✅ Afiliado Kaio atualizado no Supabase com exatidão cirúrgica!');
}

run();
