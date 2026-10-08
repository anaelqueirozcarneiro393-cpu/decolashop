const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.resolve(__dirname, '../.env.local');
let env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx > -1) {
      env[trimmed.substring(0, idx).trim()] = trimmed.substring(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    }
  });
}

const supabaseUrl = env.SUPABASE_URL || 'https://mxukkgweuanemcgwvwdk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dWtrZ3dldWFuZW1jZ3d2d2RrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzcwNDQ1OCwiZXhwIjoyMDkzMjgwNDU4fQ.330MXmQV3e9mU2C1qIr2YjITAcOTrw2jY4CkkhaY97A';
const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'next_auth' },
  auth: { persistSession: false }
});

const EXPIRY_FAR_FUTURE = '2099-01-01T00:00:00Z';

async function saveAffiliate(aff) {
  const identifier = `affiliate:${aff.code.toLowerCase()}`;
  await supabase.from('verification_tokens').delete().eq('identifier', identifier);
  const { error } = await supabase.from('verification_tokens').insert({
    identifier,
    token: JSON.stringify(aff),
    expires: EXPIRY_FAR_FUTURE
  });
  if (error) console.error('Error saving affiliate:', error);
  else console.log(`✅ Afiliado ${aff.code} (${aff.name}) cadastrado no Supabase!`);
}

async function recordSale(affiliate, customer, plan, totalAmount) {
  const cleanEmail = customer.email.toLowerCase().trim();
  const commissionPercent = affiliate.commissionPercent || 50;
  const numTotal = Number(totalAmount);
  const commissionAmount = Number(((numTotal * commissionPercent) / 100).toFixed(2));
  const planBase = plan === 'monthly' ? 89.90 : 179.90;

  const saleId = `sale_af_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const identifier = `affiliate_sale:${customer.transactionId || saleId}`;

  const sale = {
    id: saleId,
    affiliateId: affiliate.id,
    affiliateCode: affiliate.code,
    affiliateName: affiliate.name,
    customerName: customer.name || cleanEmail.split('@')[0],
    customerEmail: cleanEmail,
    customerPhone: customer.phone || '11999999999',
    plan,
    planPrice: planBase,
    bumps: [],
    bumpPrices: Math.max(0, numTotal - planBase),
    totalAmount: numTotal,
    commissionPercent,
    commissionAmount,
    isSelfPurchase: false,
    status: 'confirmed',
    createdAt: customer.createdAt || Date.now(),
    transactionId: customer.transactionId || saleId
  };

  await supabase.from('verification_tokens').delete().eq('identifier', identifier);
  const { error } = await supabase.from('verification_tokens').insert({
    identifier,
    token: JSON.stringify(sale),
    expires: EXPIRY_FAR_FUTURE
  });

  if (error) {
    console.error(`Erro ao salvar venda de ${cleanEmail}:`, error);
    return;
  }

  // Update affiliate metrics
  affiliate.totalRevenue = Number(((affiliate.totalRevenue || 0) + numTotal).toFixed(2));
  affiliate.totalSalesCount = (affiliate.totalSalesCount || 0) + 1;
  affiliate.pendingCommission = Number(((affiliate.pendingCommission || 0) + commissionAmount).toFixed(2));

  // Lead lock
  await supabase.from('verification_tokens').delete().eq('identifier', `lead_affiliate:${cleanEmail}`);
  await supabase.from('verification_tokens').insert({
    identifier: `lead_affiliate:${cleanEmail}`,
    token: affiliate.code,
    expires: EXPIRY_FAR_FUTURE
  });

  console.log(`🎉 Venda atribuída: ${customer.name} (${cleanEmail}) -> Afiliado: ${affiliate.code} | Total: R$ ${numTotal} | Comissão: R$ ${commissionAmount}`);
}

async function run() {
  // 1. Criar Afiliado Principal
  const mainAffiliate = {
    id: 'af_kaio_oficial',
    name: 'Afiliado Oficial',
    code: 'kaio',
    email: 'afiliados@decolashop.com',
    phone: '11999998888',
    pixKey: 'kaiofredy2908_pix@decolashop.com',
    pixKeyType: 'email',
    commissionPercent: 50,
    active: true,
    createdAt: Date.now() - 3 * 86400000,
    totalRevenue: 0,
    totalSalesCount: 0,
    pendingCommission: 0,
    paidCommission: 0
  };

  // 2. Criar Variações de Código Comuns para Cobrir Qualquer Link Divulgado
  const parceiroAffiliate = {
    id: 'af_parceiro_oficial',
    name: 'Parceiro DecolaShop',
    code: 'parceiro',
    email: 'parceiro@decolashop.com',
    pixKey: 'parceiro@decolashop.com',
    pixKeyType: 'email',
    commissionPercent: 50,
    active: true,
    createdAt: Date.now() - 3 * 86400000,
    totalRevenue: 0,
    totalSalesCount: 0,
    pendingCommission: 0,
    paidCommission: 0
  };

  // 3. Atribuir Vendas Reais ao Afiliado Principal
  await recordSale(mainAffiliate, {
    name: 'Carlos Eduardo',
    email: 'ceramoscarloseduardo6@gmail.com',
    transactionId: 'DEC-31035-VIP',
    createdAt: Date.now() - 30 * 60 * 1000 // 30 min atrás
  }, 'lifetime', 179.90);

  await recordSale(mainAffiliate, {
    name: 'Lucas Amorim',
    email: 'lucas27amorim@gmail.com',
    transactionId: 'DEC-27270-VIP',
    createdAt: Date.now() - 25 * 60 * 1000 // 25 min atrás
  }, 'lifetime', 179.90);

  await recordSale(mainAffiliate, {
    name: 'Janayna',
    email: 'sjanayna439@gmail.com',
    transactionId: 'DEC-43900-VIP',
    createdAt: Date.now() - 4 * 3600 * 1000 // 4h atrás
  }, 'lifetime', 179.90);

  await recordSale(mainAffiliate, {
    name: 'Juciely Justino',
    email: 'jucielyj9@gmail.com',
    transactionId: 'DEC-JUCIELY-PIX',
    createdAt: Date.now() - 24 * 3600 * 1000 // 1 dia atrás
  }, 'monthly', 89.90);

  // Salva os afiliados atualizados com as métricas somadas
  await saveAffiliate(mainAffiliate);
  await saveAffiliate(parceiroAffiliate);

  console.log('\n--- RESUMO DO PAINEL DE AFILIADOS NO SUPABASE ---');
  console.log(`Afiliado: ${mainAffiliate.name} (?af=${mainAffiliate.code})`);
  console.log(`Vendas Concluídas: ${mainAffiliate.totalSalesCount}`);
  console.log(`Faturamento Total: R$ ${mainAffiliate.totalRevenue}`);
  console.log(`Comissão Pendente a Pagar: R$ ${mainAffiliate.pendingCommission}`);
}

run();
