const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mxukkgweuanemcgwvwdk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dWtrZ3dldWFuZW1jZ3d2d2RrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzcwNDQ1OCwiZXhwIjoyMDkzMjgwNDU4fQ.330MXmQV3e9mU2C1qIr2YjITAcOTrw2jY4CkkhaY97A';
const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'next_auth' },
  auth: { persistSession: false }
});

const EXPIRY_FAR_FUTURE = '2099-01-01T00:00:00Z';

async function run() {
  console.log('--- ATUALIZANDO AFILIADO KAIO (rwjncwiofw) NO SUPABASE ---');

  // 1. Apagar todas as vendas fake/mock de Alessandra Hartz do banco
  const { data: allSales } = await supabase
    .from('verification_tokens')
    .select('identifier, token')
    .like('identifier', 'affiliate_sale:%');

  for (const row of allSales || []) {
    try {
      const s = JSON.parse(row.token);
      if (s.customerEmail === 'aleghartz@gmail.com') {
        console.log(`Removendo venda de teste de ${s.customerEmail}: ${row.identifier}`);
        await supabase.from('verification_tokens').delete().eq('identifier', row.identifier);
      }
    } catch {}
  }

  // 2. Definir o afiliado kaio (rwjncwiofw) oficial com dados reais
  const kaioAffiliate = {
    id: 'af_rwjncwiofw_muzjd4ee',
    name: 'kaio',
    code: 'rwjncwiofw',
    email: 'kaiofredy2908@gmail.com',
    phone: '63992369341',
    pixKey: '63992369341',
    pixKeyType: 'phone',
    commissionPercent: 50,
    active: true,
    createdAt: 1791463921286,
    totalRevenue: 629.60,
    totalSalesCount: 4,
    pendingCommission: 314.80,
    paidCommission: 0,
    lastPaidAt: null
  };

  // Salva affiliate:rwjncwiofw
  await supabase.from('verification_tokens').delete().eq('identifier', 'affiliate:rwjncwiofw');
  await supabase.from('verification_tokens').insert({
    identifier: 'affiliate:rwjncwiofw',
    token: JSON.stringify(kaioAffiliate),
    expires: EXPIRY_FAR_FUTURE
  });
  console.log('✅ Afiliado oficial kaio (code: rwjncwiofw) atualizado no Supabase!');

  // Também salvar alias affiliate:kaio apontando para os mesmos totais
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

  // 3. Cadastrar as 4 vendas reais sob o código rwjncwiofw
  const realSales = [
    {
      id: 'sale_af_carlos_eduardo_vip',
      affiliateId: 'af_rwjncwiofw_muzjd4ee',
      affiliateCode: 'rwjncwiofw',
      affiliateName: 'kaio',
      customerName: 'Carlos Eduardo',
      customerEmail: 'ceramoscarloseduardo6@gmail.com',
      customerPhone: '11999999999',
      plan: 'lifetime',
      planPrice: 179.90,
      bumps: [],
      bumpPrices: 0,
      totalAmount: 179.90,
      commissionPercent: 50,
      commissionAmount: 89.95,
      isSelfPurchase: false,
      status: 'confirmed',
      createdAt: 1791479026210,
      transactionId: 'DEC-31035-VIP'
    },
    {
      id: 'sale_af_lucas_amorim_vip',
      affiliateId: 'af_rwjncwiofw_muzjd4ee',
      affiliateCode: 'rwjncwiofw',
      affiliateName: 'kaio',
      customerName: 'Lucas Amorim',
      customerEmail: 'lucas27amorim@gmail.com',
      customerPhone: '11999999999',
      plan: 'lifetime',
      planPrice: 179.90,
      bumps: [],
      bumpPrices: 0,
      totalAmount: 179.90,
      commissionPercent: 50,
      commissionAmount: 89.95,
      isSelfPurchase: false,
      status: 'confirmed',
      createdAt: 1791479328777,
      transactionId: 'DEC-27270-VIP'
    },
    {
      id: 'sale_af_janayna_vip',
      affiliateId: 'af_rwjncwiofw_muzjd4ee',
      affiliateCode: 'rwjncwiofw',
      affiliateName: 'kaio',
      customerName: 'Janayna',
      customerEmail: 'sjanayna439@gmail.com',
      customerPhone: '11999999999',
      plan: 'lifetime',
      planPrice: 179.90,
      bumps: [],
      bumpPrices: 0,
      totalAmount: 179.90,
      commissionPercent: 50,
      commissionAmount: 89.95,
      isSelfPurchase: false,
      status: 'confirmed',
      createdAt: 1791466430075,
      transactionId: 'DEC-43900-VIP'
    },
    {
      id: 'sale_af_juciely_justino_pix',
      affiliateId: 'af_rwjncwiofw_muzjd4ee',
      affiliateCode: 'rwjncwiofw',
      affiliateName: 'kaio',
      customerName: 'Juciely Justino',
      customerEmail: 'jucielyj9@gmail.com',
      customerPhone: '11999999999',
      plan: 'monthly',
      planPrice: 89.90,
      bumps: [],
      bumpPrices: 0,
      totalAmount: 89.90,
      commissionPercent: 50,
      commissionAmount: 44.95,
      isSelfPurchase: false,
      status: 'confirmed',
      createdAt: 1791394431451,
      transactionId: 'DEC-JUCIELY-PIX'
    }
  ];

  for (const s of realSales) {
    // Apaga chaves anteriores
    await supabase.from('verification_tokens').delete().eq('identifier', `affiliate_sale:${s.id}`);
    await supabase.from('verification_tokens').delete().eq('identifier', `affiliate_sale:${s.transactionId}`);
    
    // Insere com a chave principal
    const { error } = await supabase.from('verification_tokens').insert({
      identifier: `affiliate_sale:${s.transactionId || s.id}`,
      token: JSON.stringify(s),
      expires: EXPIRY_FAR_FUTURE
    });

    if (error) console.error(`Erro ao salvar venda de ${s.customerEmail}:`, error);
    else console.log(`🎉 Venda atribuída ao afiliado rwjncwiofw: ${s.customerName} (${s.customerEmail}) - R$ ${s.totalAmount} (Comissão: R$ ${s.commissionAmount})`);

    // Atualiza amarração de lead (lead lock-in) para rwjncwiofw
    await supabase.from('verification_tokens').delete().eq('identifier', `lead_affiliate:${s.customerEmail}`);
    await supabase.from('verification_tokens').insert({
      identifier: `lead_affiliate:${s.customerEmail}`,
      token: 'rwjncwiofw',
      expires: EXPIRY_FAR_FUTURE
    });
  }

  // 4. Também vincular lead_affiliate para kaiofredy e telefone
  await supabase.from('verification_tokens').delete().eq('identifier', 'lead_affiliate:kaiofredy2908@gmail.com');
  await supabase.from('verification_tokens').insert({
    identifier: 'lead_affiliate:kaiofredy2908@gmail.com',
    token: 'rwjncwiofw',
    expires: EXPIRY_FAR_FUTURE
  });

  console.log('\n--- CONCLUÍDO COM SUCESSO ---');
  console.log('Afiliado: kaio');
  console.log('Link: https://www.decolashop.com.br/?af=rwjncwiofw');
  console.log('Código Oficial: rwjncwiofw');
  console.log('Total de Vendas Reais: 4');
  console.log('Faturamento Total: R$ 629,60');
  console.log('Comissão Pendente: R$ 314,80');
}

run();
