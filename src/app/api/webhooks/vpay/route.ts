import { NextResponse } from 'next/server';
import { getSupabaseAdmin, saveVerificationToken } from '@/lib/supabaseAdmin';
import { validateAndSanitizePayload, isValidEmail } from '@/lib/security';
import { dbRecordSale, dbGetPendingPix, dbBindLead, dbGetLeadAffiliate } from '@/lib/affiliateDb';
import { recordPaidWithdrawalFee } from '@/lib/withdrawalFeesStore';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();

    const payloadValidation = validateAndSanitizePayload(rawBody);
    if (!payloadValidation.safe) {
      console.warn(`[SECURITY] Webhook Vpay bloqueado por payload malicioso: ${payloadValidation.reason}`);
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
    }

    const body = rawBody;
    console.log('🔥 [WEBHOOK VPAY RECEBIDO] 🔥', JSON.stringify(body, null, 2));

    saveVerificationToken('system:last_vpay_webhook', JSON.stringify({
      at: new Date().toISOString(),
      status: body.status || null,
      idTransacao: body.idTransacao || null,
      referencia_externa: body.referencia_externa || null
    })).catch(() => {});

    const status = String(body.status || '').toUpperCase();
    const idTransacao = body.idTransacao || '';
    const refExterna = body.referencia_externa || '';
    let email = String(body.email || '').toLowerCase().trim();
    const valorBruto = Number(body.valor_bruto || body.valor || 0);

    // Se não for concluída, apenas confirma recebimento
    if (status !== 'CONCLUIDA' && status !== 'PAID') {
      return NextResponse.json({ received: true, status });
    }

    // Busca dados complementares em pending_pix
    let pending = (refExterna ? await dbGetPendingPix(refExterna) : null)
      || (idTransacao ? await dbGetPendingPix(idTransacao) : null)
      || (email ? await dbGetPendingPix(email) : null);

    if (pending) {
      if (!email && pending.email) email = pending.email.toLowerCase().trim();
    }

    if (!email || !isValidEmail(email)) {
      console.warn('[Webhook Vpay] E-mail não localizado na transação:', body);
      return NextResponse.json({ received: true, warning: 'E-mail não identificado' });
    }

    let plan = pending?.plan || 'monthly';
    let total = valorBruto > 0 ? valorBruto : Number(pending?.total || 89.90);
    let affiliateCode = pending?.affiliateCode || await dbGetLeadAffiliate(email) || null;

    // Se for taxa de antecipação
    if (plan === 'taxa_antecipacao') {
      await recordPaidWithdrawalFee({
        customerEmail: email,
        customerName: body.nome || pending?.name || 'Cliente DecolaShop',
        amount: total,
        transactionId: idTransacao || refExterna || `vpay_${Date.now()}`,
        paidAt: Date.now()
      });
      return NextResponse.json({ received: true, type: 'taxa_antecipacao', recorded: true });
    }

    // Se for recarga de créditos de IA
    if (plan === 'ai_credits') {
      const creditsToAdd = total >= 35 ? 120 : total >= 19 ? 50 : 20;
      const supabase = getSupabaseAdmin();
      const { data: userRecord } = await supabase
        .from('users')
        .select('id, email, ai_credits')
        .eq('email', email)
        .maybeSingle();

      if (userRecord) {
        const currentCredits = Number(userRecord.ai_credits) || 0;
        await supabase
          .from('users')
          .update({ ai_credits: currentCredits + creditsToAdd })
          .eq('email', email);
      }

      return NextResponse.json({ received: true, type: 'ai_credits', creditsAdded: creditsToAdd });
    }

    // Venda de plano regular (mensal ou vitalício)
    const effectivePlan: 'monthly' | 'lifetime' = total >= 140 ? 'lifetime' : 'monthly';
    const planBase = effectivePlan === 'monthly' ? 89.90 : 179.90;
    const supabase = getSupabaseAdmin();
    await supabase
      .from('users')
      .update({
        plan: effectivePlan,
        status: 'active',
        is_paid: true,
        updated_at: new Date().toISOString()
      })
      .eq('email', email);

    if (affiliateCode) {
      await dbRecordSale({
        affiliateCode,
        plan: effectivePlan,
        planPrice: planBase,
        bumps: pending?.bumps || [],
        bumpPrices: Math.max(0, total - planBase),
        totalAmount: total,
        customerName: body.nome || pending?.name || 'Cliente DecolaShop',
        customerEmail: email,
        customerPhone: pending?.phone || undefined,
        customerCpf: pending?.cpf || undefined,
        transactionId: idTransacao || refExterna || undefined,
      }).catch(err => console.warn('Erro ao registrar venda afiliado Vpay:', err));

      await dbBindLead(email, affiliateCode).catch(() => {});
    }

    return NextResponse.json({ received: true, status: 'CONCLUIDA', plan: effectivePlan, email });
  } catch (err: any) {
    console.error('[WEBHOOK VPAY ERROR]:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
