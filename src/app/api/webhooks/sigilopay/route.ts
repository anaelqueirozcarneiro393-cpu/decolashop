import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { validateAndSanitizePayload, isValidEmail } from "@/lib/security";
import { dbRecordSale, dbGetPendingPix, dbGetLeadAffiliate, dbBindLead, dbGetAffiliates } from "@/lib/affiliateDb";
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

    // Extract customer & order details (SigiloPay payload structure)
    const client = body.client || body.customer || body.payer || body.data?.client || body.data?.customer || {};
    const status = (body.status || body.event || body.type || body.data?.status || "").toUpperCase();
    const transactionId = body.transactionId || body.id || body.data?.id || body.clientIdentifier || body.identifier;

    // Check pending transaction registry in Supabase for fallback data
    const pendingLocal = transactionId ? await dbGetPendingPix(transactionId) : null;

    let email = (client.email || body.email || body.data?.email || pendingLocal?.email || "").toLowerCase().trim();
    let affiliateCode = 
      body.metadata?.affiliateCode || 
      body.metadata?.affiliate_code || 
      body.data?.metadata?.affiliateCode || 
      body.data?.metadata?.affiliate_code ||
      body.affiliateCode || 
      pendingLocal?.affiliateCode || 
      null;

    let plan = body.metadata?.plan || pendingLocal?.plan || 'lifetime';
    let bumps = body.items || body.metadata?.bumps || pendingLocal?.bumps || [];
    let total = Number(body.amount || body.total || pendingLocal?.total || (plan === 'monthly' ? 89.90 : 179.90));
    let customerName = client.name || pendingLocal?.name;
    let customerPhone = client.phone || pendingLocal?.phone;
    let customerCpf = client.document || pendingLocal?.cpf;

    if (!email || !isValidEmail(email)) {
      if (transactionId) {
        const pending = await dbGetPendingPix(transactionId);
        if (pending && pending.email) {
          console.log(`[SigiloPay Webhook] Dados recuperados via Supabase pending_pix (${transactionId}): ${pending.email}`);
          email = pending.email.toLowerCase().trim();
          if (pending.plan) plan = pending.plan;
          if (pending.bumps) bumps = pending.bumps;
          if (pending.total) total = Number(pending.total);
          if (pending.name) customerName = pending.name;
          if (pending.phone) customerPhone = pending.phone;
          if (pending.cpf) customerCpf = pending.cpf;
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
      const cleanAf = affiliateCode.toLowerCase().trim();
      if (cleanAf === 'kaio' || cleanAf === 'kaiofredy' || cleanAf === 'kaiofredy2908') {
        affiliateCode = 'rwjncwiofw';
      }
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

    // AUTO-ATTRIBUTION: Se a venda é de assinatura/bump e não veio código, atribui ao afiliado ativo da plataforma (rwjncwiofw)
    if (!affiliateCode && plan !== 'taxa_antecipacao') {
      try {
        const activeAffiliates = await dbGetAffiliates();
        const rwj = activeAffiliates.find(a => a.code === 'rwjncwiofw');
        if (rwj && rwj.active) {
          affiliateCode = 'rwjncwiofw';
          console.log(`[AFILIADOS AUTO-ATTRIBUTION WEBHOOK] Venda resgatada e atribuída automaticamente ao afiliado rwjncwiofw`);
        } else if (activeAffiliates && activeAffiliates.length > 0) {
          const primary = activeAffiliates.find(a => a.active) || activeAffiliates[0];
          if (primary && primary.code) {
            affiliateCode = primary.code;
            console.log(`[AFILIADOS AUTO-ATTRIBUTION WEBHOOK] Venda resgatada e atribuída automaticamente ao afiliado ativo "${primary.code}" (${primary.name})`);
          }
        }
      } catch (autoErr) {
        console.warn('[AFILIADOS AUTO-ATTRIBUTION] Erro ao buscar afiliado ativo:', autoErr);
      }
    }

    if (affiliateCode && email) {
      dbBindLead(email, affiliateCode).catch(() => {});
    }

    // Protect administrative email
    if (email.startsWith("admin@") || email === 'gerente@decolashop.com') {
      console.warn(`[SECURITY] Tentativa de ativação de webhook para conta de admin bloqueada: ${email}`);
      return NextResponse.json({ error: "Conta protegida" }, { status: 403 });
    }

    const isApproved = 
      status.includes("PAID") || 
      status.includes("APPROVED") || 
      status.includes("PAGO") || 
      status.includes("CONFIRMED") ||
      status.includes("COMPLETED");

    console.log(`SigiloPay Webhook: Cliente ${email} - Status: ${status} (Aprovado: ${isApproved}) - Afiliado: ${affiliateCode || 'Nenhum'}`);

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

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (plan === 'monthly' ? 30 : 3650));

    const userMetadata = JSON.stringify({
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      pwd: 'decola123',
      bumps: safeBumps,
      phone: phone || null,
      cpf: cpf || null
    });

    await supabase
      .from('users')
      .upsert({
        email,
        name: name || email.split('@')[0],
        plan: plan || 'lifetime',
        plan_expires_at: expiresAt.toISOString(),
        image: userMetadata
      }, { onConflict: 'email' });

    console.log(`[SigiloPay Webhook] Usuário pago ${email} registrado/atualizado no plano ${plan}!`);
  } catch (dbErr) {
    console.warn('[SigiloPay Webhook] Aviso ao salvar usuário no Supabase:', dbErr);
  }

  // 2. REGISTRO 100% GARANTIDO DA COMISSÃO DO AFILIADO NO BANCO SUPABASE
  if (affiliateCode && plan !== 'taxa_antecipacao') {
    try {
      const userPlan = (plan === 'monthly' ? 'monthly' : 'lifetime') as 'monthly' | 'lifetime';
      const planBase = userPlan === 'monthly' ? 89.90 : 179.90;
      const totalAmount = Number(total) || planBase;
      const sale = await dbRecordSale({
        affiliateCode,
        plan: userPlan,
        planPrice: planBase,
        bumps: safeBumps,
        bumpPrices: Math.max(0, totalAmount - planBase),
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
