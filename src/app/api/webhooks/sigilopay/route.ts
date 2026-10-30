import { NextResponse } from "next/server";
import { getSupabaseAdmin, saveVerificationToken } from "@/lib/supabaseAdmin";
import { validateAndSanitizePayload, isValidEmail } from "@/lib/security";
import { dbRecordSale, dbGetPendingPix, dbGetLeadAffiliate, dbBindLead, dbGetAffiliates, resolveAffiliateCode } from "@/lib/affiliateDb";
import { recordPaidWithdrawalFee } from "@/lib/withdrawalFeesStore";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();

    // 1. Validate payload against SQLi & XSS attacks
    const payloadValidation = validateAndSanitizePayload(rawBody);
    if (!payloadValidation.safe) {
      console.warn(`[SECURITY] Webhook SigiloPay bloqueado por payload malicioso: ${payloadValidation.reason}`);
      return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }

    const body = rawBody;

    console.log("🔥 [WEBHOOK SIGILOPAY RECEBIDO] 🔥", JSON.stringify(body, null, 2));

    // Registro do último webhook recebido (lido por /api/health/supabase)
    saveVerificationToken('system:last_sigilopay_webhook', JSON.stringify({
      at: new Date().toISOString(),
      status: body.status || body.event || body.type || body.data?.status || null,
      transactionId: body.transactionId || body.id || body.data?.id || body.identifier || null
    })).catch(() => {});

    // Extract customer & order details (SigiloPay payload structure)
    const client = body.client || body.customer || body.payer || body.data?.client || body.data?.customer || {};
    const status = (body.status || body.event || body.type || body.data?.status || "").toUpperCase();
    let transactionId = 
      body.transactionId || 
      body.id || 
      body.data?.id || 
      body.data?.transactionId ||
      body.transaction?.id ||
      body.data?.transaction?.id ||
      body.clientIdentifier || 
      body.data?.clientIdentifier ||
      body.identifier;

    let email = (client.email || body.email || body.data?.email || "").toLowerCase().trim();

    // Check pending transaction registry in Supabase for fallback data (by TxId and by Email)
    let pendingLocal = transactionId ? await dbGetPendingPix(transactionId) : null;
    if (!pendingLocal && email) {
      pendingLocal = await dbGetPendingPix(email);
    }

    if (pendingLocal) {
      if (!transactionId && pendingLocal.transactionId) transactionId = pendingLocal.transactionId;
      if (!email && pendingLocal.email) email = pendingLocal.email.toLowerCase().trim();
    }

    // Direct gateway query if transactionId is available for 100% authoritative amounts
    let gatewayAmount = Number(body.amount || body.chargeAmount || body.value || body.data?.amount || body.data?.chargeAmount || body.transaction?.amount || 0);
    // Status confirmado direto na SigiloPay (o status do corpo do webhook não é confiável)
    let gatewayStatus: string | null = null;
    const idsToCheck = Array.from(new Set([transactionId, pendingLocal?.transactionId].filter(Boolean)));
    for (const txId of idsToCheck) {
      try {
        const sigiloPublicKey = process.env.SIGILOPAY_PUBLIC_KEY || 'kaiofredy2908_1cmq6fd3bmq2s24u';
        const sigiloSecretKey = process.env.SIGILOPAY_SECRET_KEY || 'tzlk0xxe8t4dybi2t0o1udw1ckczp01a4a9hbgptalozcan5hh0r59qw41seo3ze';
        const sigiloBaseUrl = process.env.SIGILOPAY_BASE_URL || 'https://app.sigilopay.com.br';
        const lookup = () => fetch(`${sigiloBaseUrl}/api/v1/gateway/transactions?id=${encodeURIComponent(txId as string)}`, {
          headers: { 'x-public-key': sigiloPublicKey, 'x-secret-key': sigiloSecretKey }
        });
        let checkRes = await lookup();
        if (checkRes.status === 429) {
          // SigiloPay limitou as requisições: espera e tenta de novo antes de desistir
          await new Promise((r) => setTimeout(r, 2000));
          checkRes = await lookup();
        }
        if (checkRes.ok) {
          const apiTx = await checkRes.json();
          const apiAmt = Number(apiTx.amount || apiTx.chargeAmount || 0);
          if (apiAmt > 0) gatewayAmount = apiAmt;
          gatewayStatus = String(apiTx.status || '').toUpperCase() || (apiTx.payedAt ? 'PAID' : null);
          if (gatewayStatus) break;
        }
      } catch {}
    }

    let affiliateCode = 
      body.metadata?.affiliateCode || 
      body.metadata?.affiliate_code || 
      body.data?.metadata?.affiliateCode || 
      body.data?.metadata?.affiliate_code ||
      body.affiliateCode || 
      pendingLocal?.affiliateCode || 
      null;

    // Detect plan strictly: if paid amount <= 130, it is 100% monthly (R$ 89,90)
    let plan = body.metadata?.plan || pendingLocal?.plan;
    if (plan !== 'bumps_only' && plan !== 'taxa_antecipacao' && gatewayAmount > 0) {
      if (gatewayAmount <= 130) {
        plan = 'monthly';
      } else if (gatewayAmount >= 160) {
        plan = 'lifetime';
      }
    }
    if (!plan) plan = 'monthly'; // Safe default

    let bumps = body.items || body.metadata?.bumps || pendingLocal?.bumps || [];
    let total = gatewayAmount > 0 
      ? gatewayAmount 
      : Number(body.amount || body.total || pendingLocal?.total || (plan === 'monthly' ? 89.90 : 179.90));
    let customerName = client.name || pendingLocal?.name;
    let customerPhone = client.phone || pendingLocal?.phone;
    let customerCpf = client.document || pendingLocal?.cpf;

    if (!email || !isValidEmail(email)) {
      if (transactionId) {
        const pending = await dbGetPendingPix(transactionId);
        if (pending && pending.email) {
          console.log(`[SigiloPay Webhook] Dados recuperados via Supabase pending_pix (${transactionId}): ${pending.email}`);
          email = pending.email.toLowerCase().trim();
          if (pending.plan && !gatewayAmount) plan = pending.plan;
          if (pending.bumps) bumps = pending.bumps;
          if (pending.total && !gatewayAmount) total = Number(pending.total);
          if (pending.name) customerName = pending.name;
          if (pending.phone) customerPhone = customerPhone || pending.phone;
          if (pending.cpf) customerCpf = customerCpf || pending.cpf;
          if (!affiliateCode && pending.affiliateCode) affiliateCode = pending.affiliateCode;
        }
      }

      if (!email || !isValidEmail(email)) {
        console.warn("[SigiloPay Webhook] E-mail do cliente não encontrado no payload ou no banco Supabase:", body);
        return NextResponse.json({ success: true, message: "Aguardando e-mail do cliente" }, { status: 200 });
      }
    }

    // Fallback: check pending store by email if affiliateCode still not found
    if (!affiliateCode && email) {
      const pendingByEmail = await dbGetPendingPix(email);
      if (pendingByEmail?.affiliateCode) {
        affiliateCode = pendingByEmail.affiliateCode;
      }
    }

    if (affiliateCode) {
      affiliateCode = resolveAffiliateCode(affiliateCode);
    }

    // LEAD LOCK-IN: Fallback para vínculo perpétuo de lead no Supabase
    if (!affiliateCode && email) {
      try {
        const boundCode = await dbGetLeadAffiliate(email);
        if (boundCode) {
          affiliateCode = boundCode;
          console.log(`[AFILIADOS LEAD LOCK WEBHOOK] Venda resgatada via lead perpétuo no Supabase: ${email} -> ${boundCode}`);
        }
      } catch {}
    }

    if (affiliateCode && email) {
      dbBindLead(email, affiliateCode).catch(() => {});
    }

    // Protect administrative email
    if (email.startsWith("admin@") || email === 'gerente@decolashop.com') {
      console.warn(`[SECURITY] Tentativa de ativação de webhook para conta de admin bloqueada: ${email}`);
      return NextResponse.json({ error: "Conta protegida" }, { status: 403 });
    }

    // Só aprova com o status confirmado na SigiloPay; sem confirmação do gateway, não ativa nada
    const isApproved = !!gatewayStatus && /PAID|APPROVED|PAGO|CONFIRMED|COMPLETED/.test(gatewayStatus);

    console.log(`SigiloPay Webhook: Cliente ${email} - Status webhook: ${status} / gateway: ${gatewayStatus ?? 'não confirmado'} (Aprovado: ${isApproved}) - Afiliado: ${affiliateCode || 'Nenhum'}`);

    const isTaxaAntecipacao = 
      plan === 'taxa_antecipacao' || 
      body.metadata?.plan === 'taxa_antecipacao' || 
      pendingLocal?.plan === 'taxa_antecipacao';

    if (isApproved) {
      if (isTaxaAntecipacao) {
        try {
          await recordPaidWithdrawalFee({
            transactionId: transactionId || undefined,
            customerEmail: email,
            customerName: customerName || email.split('@')[0],
            amount: Number(total) || 150,
            paidAt: Date.now()
          });
        } catch (feeErr) {
          console.error('[TAXAS SAQUE WEBHOOK] Erro ao registrar taxa paga:', feeErr);
        }

        console.log(`[SigiloPay Webhook] ✅ Taxa de saque aprovada para ${email} (R$ ${total}). Afiliados 100% blindados de comissão.`);
        return NextResponse.json({
          success: true,
          message: "Taxa de antecipação aprovada e registrada exclusivamente para a gerência com sucesso!",
          email,
          plan: 'taxa_antecipacao'
        }, { status: 200 });
      }

      return await processApproval({
        email,
        plan,
        bumps,
        total,
        name: customerName,
        phone: customerPhone,
        cpf: customerCpf,
        transactionId,
        affiliateCode
      });
    }

    return NextResponse.json({ success: true, message: "Webhook SigiloPay processado (status não-aprovador)" }, { status: 200 });

  } catch (error: any) {
    console.error("Erro fatal no Webhook da SigiloPay:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function processApproval(options: {
  email: string;
  plan?: string;
  bumps?: any[];
  total?: number;
  name?: string;
  phone?: string;
  cpf?: string;
  transactionId?: string;
  affiliateCode?: string | null;
}) {
  const { email, plan = 'lifetime', bumps = [], total, name, phone, cpf, transactionId, affiliateCode } = options;

  const safeBumps = Array.isArray(bumps) ? bumps.map((b: any) => String(b.name || b.id || b)) : [];

  // 1. Atualiza/cria usuário no banco de dados se Supabase estiver ativo
  try {
    const supabase = getSupabaseAdmin('next_auth');

    // Busca usuário existente para preservar senha personalizada ou bumps
    const { data: existingUser } = await supabase
      .from('users')
      .select('name, image, plan, plan_expires_at')
      .eq('email', email)
      .maybeSingle();

    let existingMeta: any = {};
    if (existingUser?.image && existingUser.image.startsWith('{')) {
      try { existingMeta = JSON.parse(existingUser.image); } catch {}
    }

    // Busca transação pendente para resgatar senha escolhida no cadastro
    let pendingTx: any = null;
    if (transactionId) {
      pendingTx = await dbGetPendingPix(transactionId);
    }
    if (!pendingTx && email) {
      pendingTx = await dbGetPendingPix(email);
    }

    const resolvedPassword = 
      (existingMeta.pwd && existingMeta.pwd !== 'decola123' ? existingMeta.pwd : null) ||
      pendingTx?.password ||
      existingMeta.pwd ||
      'decola123';

    const mergedBumps = Array.from(new Set([
      ...(existingMeta.bumps || []),
      ...safeBumps
    ]));

    // Nunca rebaixa o plano: comprar um bump não tira o mensal/vitalício de quem já tem
    const PLAN_RANK: Record<string, number> = { free: 0, bumps_only: 1, monthly: 2, lifetime: 3 };
    const existingPlan = existingUser?.plan || 'free';
    const keepExisting = (PLAN_RANK[existingPlan] ?? 0) > (PLAN_RANK[plan] ?? 0);
    const finalPlan = keepExisting ? existingPlan : plan;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (finalPlan === 'monthly' ? 30 : 3650));
    const finalExpiresAt = keepExisting && existingUser?.plan_expires_at
      ? existingUser.plan_expires_at
      : expiresAt.toISOString();

    const userMetadata = JSON.stringify({
      avatar: existingMeta.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      pwd: resolvedPassword,
      bumps: mergedBumps,
      phone: phone || existingMeta.phone || null,
      cpf: cpf || existingMeta.cpf || null
    });

    const { error: upsertErr } = await supabase
      .from('users')
      .upsert({
        email,
        name: name || existingUser?.name || email.split('@')[0],
        plan: finalPlan,
        plan_expires_at: finalExpiresAt,
        image: userMetadata
      }, { onConflict: 'email' });

    if (upsertErr) throw upsertErr;

    console.log(`[SigiloPay Webhook] Usuário pago ${email} registrado/atualizado no plano ${finalPlan}! (Senha preservada)`);
  } catch (dbErr) {
    console.warn('[SigiloPay Webhook] Aviso ao salvar usuário no Supabase:', dbErr);
  }

  // 2. REGISTRO 100% GARANTIDO DA COMISSÃO DO AFILIADO NO BANCO SUPABASE
  if (affiliateCode && plan !== 'taxa_antecipacao') {
    try {
      const isBumpsOnly = plan === 'bumps_only';
      const userPlan = (isBumpsOnly ? 'bumps_only' : (plan === 'monthly' ? 'monthly' : 'lifetime')) as 'monthly' | 'lifetime';
      const planBase = isBumpsOnly ? 0 : (userPlan === 'monthly' ? 89.90 : 179.90);
      const totalAmount = Number(total) || planBase;
      const sale = await dbRecordSale({
        affiliateCode,
        plan: userPlan,
        planPrice: planBase,
        bumps: safeBumps,
        bumpPrices: isBumpsOnly ? totalAmount : Math.max(0, totalAmount - planBase),
        totalAmount,
        customerName: name || email.split('@')[0],
        customerEmail: email,
        customerPhone: phone || undefined,
        customerCpf: cpf || undefined,
        transactionId: transactionId || undefined,
      });

      if (sale) {
        console.log(`[SigiloPay Webhook] 🎉 Venda de afiliado (${affiliateCode}) gravada no Supabase para ${email}! Comissão: R$ ${sale.commissionAmount}`);
      }
    } catch (affErr) {
      console.error('[SigiloPay Webhook] Erro ao registrar comissão de afiliado no Supabase:', affErr);
    }
  }

  return NextResponse.json({ 
    success: true, 
    message: "Pagamento aprovado, usuário ativado e comissão atribuída com sucesso!",
    email,
    affiliateCode: affiliateCode || null
  }, { status: 200 });
}
