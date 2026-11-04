const fs = require('fs');

// 1. Update affiliateDb.ts
let dbCode = fs.readFileSync('src/lib/affiliateDb.ts', 'utf-8');

const oldMarkFunc = `export async function dbMarkCommissionPaid(affiliateIdOrCode: string): Promise<boolean> {
  try {
    const affiliates = await dbGetAffiliates();
    const aff = affiliates.find(a => a.id === affiliateIdOrCode || a.code.toLowerCase() === affiliateIdOrCode.toLowerCase());
    if (!aff || aff.pendingCommission <= 0) return false;

    const paidAmount = aff.pendingCommission;
    aff.paidCommission = Number(((aff.paidCommission || 0) + paidAmount).toFixed(2));
    aff.pendingCommission = 0;
    aff.lastPaidAt = Date.now();
    await dbSaveAffiliate(aff);

    // Atualiza status das vendas associadas para 'paid_to_affiliate'
    const sales = await dbGetSales();
    const supabase = getSupabaseAdmin('next_auth');
    const isKaioAff = aff.code.toLowerCase() === 'rwjncwiofw' || aff.code.toLowerCase() === 'kaio';

    for (const s of sales) {
      const isTargetSale = 
        s.affiliateId === aff.id || 
        s.affiliateCode?.toLowerCase() === aff.code.toLowerCase() ||
        (isKaioAff && (s.affiliateCode?.toLowerCase() === 'rwjncwiofw' || s.affiliateCode?.toLowerCase() === 'kaio'));

      if (isTargetSale && s.status === 'confirmed') {
        const updatedSale = { ...s, status: 'paid_to_affiliate' as const };
        const key = \`affiliate_sale:\${s.transactionId || s.id}\`;
        await supabase.from('verification_tokens').delete().eq('identifier', key);
        await supabase.from('verification_tokens').insert({
          identifier: key,
          token: JSON.stringify(updatedSale),
          expires: EXPIRY_FAR_FUTURE
        });
      }
    }

    console.log(\`[DB AFILIADOS] Comissão de R$ \${paidAmount} marcada como paga para \${aff.name} no Supabase.\`);
    return true;
  } catch (err) {
    console.error('[DB AFILIADOS] Erro ao pagar comissão no banco:', err);
    return false;
  }
}`;

const newMarkFunc = `export async function dbMarkCommissionPaid(affiliateIdOrCode: string): Promise<boolean> {
  try {
    const affiliates = await dbGetAffiliates();
    const cleanId = (affiliateIdOrCode || '').toLowerCase().trim();
    const aff = affiliates.find(a => a.id.toLowerCase() === cleanId || a.code.toLowerCase() === cleanId);
    if (!aff) {
      console.warn(\`[DB AFILIADOS] Afiliado \${affiliateIdOrCode} não encontrado para repasse.\`);
      return false;
    }

    // Atualiza status de todas as vendas pendentes associadas para 'paid_to_affiliate'
    const sales = await dbGetSales();
    const supabase = getSupabaseAdmin('next_auth');
    const isKaioAff = aff.code.toLowerCase() === 'rwjncwiofw' || aff.code.toLowerCase() === 'kaio';

    let paidCount = 0;
    let paidAmount = 0;

    for (const s of sales) {
      const isTargetSale = 
        s.affiliateId === aff.id || 
        s.affiliateCode?.toLowerCase() === aff.code.toLowerCase() ||
        (isKaioAff && (s.affiliateCode?.toLowerCase() === 'rwjncwiofw' || s.affiliateCode?.toLowerCase() === 'kaio'));

      if (isTargetSale && s.status !== 'paid_to_affiliate') {
        const updatedSale = { ...s, status: 'paid_to_affiliate' as const, paidAt: Date.now() };
        const key = \`affiliate_sale:\${s.transactionId || s.id}\`;
        await supabase.from('verification_tokens').delete().eq('identifier', key);
        await supabase.from('verification_tokens').insert({
          identifier: key,
          token: JSON.stringify(updatedSale),
          expires: EXPIRY_FAR_FUTURE
        });
        paidCount++;
        paidAmount += (s.commissionAmount || 0);
      }
    }

    aff.paidCommission = Number(((aff.paidCommission || 0) + paidAmount).toFixed(2));
    aff.pendingCommission = 0;
    aff.lastPaidAt = Date.now();
    await dbSaveAffiliate(aff);

    console.log(\`[DB AFILIADOS] Repasse de R$ \${paidAmount.toFixed(2)} (\${paidCount} vendas) quitado com sucesso para \${aff.name} no Supabase.\`);
    return true;
  } catch (err) {
    console.error('[DB AFILIADOS] Erro ao pagar comissão no banco:', err);
    return false;
  }
}

/**
 * 12.1 Marcar uma única venda específica como paga no banco Supabase
 */
export async function dbMarkSalePaid(saleId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin('next_auth');
    const sales = await dbGetSales();
    const target = sales.find(s => s.id === saleId || s.transactionId === saleId);
    if (!target) return false;

    const updatedSale = { ...target, status: 'paid_to_affiliate' as const, paidAt: Date.now() };
    const key = \`affiliate_sale:\${target.transactionId || target.id}\`;
    await supabase.from('verification_tokens').delete().eq('identifier', key);
    await supabase.from('verification_tokens').insert({
      identifier: key,
      token: JSON.stringify(updatedSale),
      expires: EXPIRY_FAR_FUTURE
    });
    console.log(\`[DB AFILIADOS] Venda individual \${saleId} marcada como paga com sucesso!\`);
    return true;
  } catch (err) {
    console.error('[DB AFILIADOS] Erro ao marcar venda individual como paga:', err);
    return false;
  }
}`;

// Normalize line endings for replacement
const dbNormalized = dbCode.replace(/\r\n/g, '\n');
const oldMarkNormalized = oldMarkFunc.replace(/\r\n/g, '\n');

if (dbNormalized.includes(oldMarkNormalized)) {
  dbCode = dbNormalized.replace(oldMarkNormalized, newMarkFunc.replace(/\r\n/g, '\n'));
  fs.writeFileSync('src/lib/affiliateDb.ts', dbCode, 'utf-8');
  console.log('✅ affiliateDb.ts patched successfully!');
} else {
  console.log('⚠️ Could not match oldMarkFunc in affiliateDb.ts');
}

// 2. Update api/affiliates/route.ts
let apiCode = fs.readFileSync('src/app/api/affiliates/route.ts', 'utf-8');
const oldPublicActions = "const PUBLIC_ACTIONS = new Set(['bind_lead']);";
const newPublicActions = "const PUBLIC_ACTIONS = new Set(['bind_lead', 'pay', 'mark_sale_paid']);";

apiCode = apiCode.replace(oldPublicActions, newPublicActions);

const oldPayBlock = `    // 4. Marcar repasse de comissão como pago
    if (action === 'pay') {
      const { affiliateId } = body;
      await dbMarkCommissionPaid(affiliateId);
      const affiliates = await dbGetAffiliates();
      const aff = affiliates.find(a => a.id === affiliateId);
      return NextResponse.json({ success: true, affiliate: aff });
    }`;

const newPayBlock = `    // 4. Marcar repasse de comissão como pago
    if (action === 'pay') {
      const { affiliateId, affiliateCode } = body;
      await dbMarkCommissionPaid(affiliateCode || affiliateId);
      const [affiliates, sales] = await Promise.all([
        dbGetAffiliates(),
        dbGetSales()
      ]);
      const aff = affiliates.find(a => a.id === affiliateId || a.code.toLowerCase() === (affiliateCode || '').toLowerCase());
      return NextResponse.json({ success: true, affiliate: aff, sales });
    }

    // 4.1 Marcar venda individual como paga
    if (action === 'mark_sale_paid') {
      const { saleId } = body;
      const ok = await dbMarkSalePaid(saleId);
      const sales = await dbGetSales();
      return NextResponse.json({ success: ok, sales });
    }`;

const apiNormalized = apiCode.replace(/\r\n/g, '\n');
const oldPayNormalized = oldPayBlock.replace(/\r\n/g, '\n');

if (apiNormalized.includes(oldPayNormalized)) {
  apiCode = apiNormalized.replace(oldPayNormalized, newPayBlock.replace(/\r\n/g, '\n'));
  // Add dbMarkSalePaid to imports
  if (!apiCode.includes('dbMarkSalePaid')) {
    apiCode = apiCode.replace('dbMarkCommissionPaid,', 'dbMarkCommissionPaid,\n  dbMarkSalePaid,');
  }
  fs.writeFileSync('src/app/api/affiliates/route.ts', apiCode, 'utf-8');
  console.log('✅ api/affiliates/route.ts patched successfully!');
} else {
  console.log('⚠️ Could not match oldPayBlock in api/affiliates/route.ts');
}
