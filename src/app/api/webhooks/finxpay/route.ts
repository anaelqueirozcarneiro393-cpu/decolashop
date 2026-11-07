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
      console.warn(`[SECURITY] Webhook FinxPay bloqueado por payload malicioso: ${payloadValidation.reason}`);
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
    }

    const body = rawBody;
    console.log('🔥 [WEBHOOK FINXPAY RECEBIDO] 🔥', JSON.stringify(body, null, 2));

    const event = String(body.event || body.type || '').toLowerCase();
    const tx = body.transaction || body.data || body;
    const status = String(tx.status || body.status || '').toUpperCase();
    const id = tx.id || body.id || '';
    const externalId = tx.external_id || body.external_id || '';
    const amount = Number(tx.amount || body.amount || 0);

    saveVerificationToken('system:last_finxpay_webhook', JSON.stringify({
      at: new Date().toISOString(),
      event,
      status,
      id,
      externalId
    })).catch(() => {});

    // Confirma se o pagamento foi confirmado
    const isPaid = status === 'CONFIRMED' || status === 'PAID' || event === 'payment.confirmed' || event === 'spei.payment.confirmed';
    if (!isPaid) {
      return NextResponse.json({ received: true, status, event });
    }

    // Busca dados complementares em pending_pix
    let pending = (externalId ? await dbGetPendingPix(externalId) : null)
      || (id ? await dbGetPendingPix(id) : null);

    let email = (pending?.email || tx.payer_email || body.email || '').toLowerCase().trim();

    if (!email || !isValidEmail(email)) {
      console.warn('[Webhook FinxPay] E-mail não localizado na transação:', body);
      return NextResponse.json({ received: true, warning: 'E-mail não identificado' });
    }

    let plan = pending?.plan || 'monthly';
    let total = amount > 0 ? amount : Number(pending?.total || 89.90);
    let affiliateCode = pending?.affiliateCode || await dbGetLeadAffiliate(email) || null;

    // Se for taxa de antecipação
    if (plan === 'taxa_antecipacao') {
      await recordPaidWithdrawalFee({
        customerEmail: email,
        customerName: pending?.name || tx.payer_name || 'Cliente DecolaShop',
        amount: total,
        transactionId: id || externalId || `finx_${Date.now()}`,
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
        customerName: pending?.name || tx.payer_name || 'Cliente DecolaShop',
        customerEmail: email,
        customerPhone: pending?.phone || undefined,
        customerCpf: pending?.cpf || undefined,
        transactionId: id || externalId || undefined,
      }).catch(err => console.warn('Erro ao registrar venda afiliado FinxPay:', err));

      await dbBindLead(email, affiliateCode).catch(() => {});
    }

    return NextResponse.json({ received: true, status: 'CONFIRMED', plan: effectivePlan, email });
  } catch (err: any) {
    console.error('[WEBHOOK FINXPAY ERROR]:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
