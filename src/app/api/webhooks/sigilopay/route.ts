import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateAndSanitizePayload, isValidEmail } from "@/lib/security";

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
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = 
      process.env.SUPABASE_SERVICE_ROLE_KEY || 
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log("🔥 [WEBHOOK SIGILOPAY RECEBIDO] 🔥", JSON.stringify(body, null, 2));

    // Extract customer & order details (SigiloPay payload structure)
    const client = body.client || body.customer || body.payer || body.data?.client || body.data?.customer || {};
    const email = (client.email || body.email || body.data?.email || "").toLowerCase().trim();
    const status = (body.status || body.event || body.type || body.data?.status || "").toUpperCase();
    const transactionId = body.transactionId || body.id || body.data?.id || body.clientIdentifier || body.identifier;

    if (!email || !isValidEmail(email)) {
      // If email is not in payload, check if we stored it in pending_orders via transactionId
      if (transactionId && supabaseUrl && supabaseKey) {
        try {
          const supabaseCheck = createClient(supabaseUrl, supabaseKey);
          const { data: pending } = await supabaseCheck
            .from('pending_orders')
            .select('email, plan, bumps')
            .eq('transaction_id', transactionId)
            .maybeSingle();

          if (pending && pending.email) {
            console.log(`[SigiloPay Webhook] E-mail recuperado via pending_orders (${transactionId}): ${pending.email}`);
            return await processApproval(pending.email, pending.plan, pending.bumps, supabaseUrl, supabaseKey);
          }
        } catch {}
      }

      console.warn("[SigiloPay Webhook] E-mail do cliente não encontrado no payload ou na tabela pending_orders:", body);
      return NextResponse.json({ success: true, message: "Aguardando e-mail do cliente" }, { status: 200 });
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

    console.log(`SigiloPay Webhook: Cliente ${email} - Status: ${status} (Aprovado: ${isApproved})`);

    if (isApproved && supabaseUrl && supabaseKey) {
      const items = body.items || body.metadata?.bumps || [];
      const plan = body.metadata?.plan || 'lifetime';
      return await processApproval(email, plan, items, supabaseUrl, supabaseKey, client.name);
    }

    return NextResponse.json({ success: true, message: "Webhook SigiloPay processado (status não-aprovador)" }, { status: 200 });

  } catch (error: any) {
    console.error("Erro fatal no Webhook da SigiloPay:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function processApproval(
  email: string, 
  plan: string = 'lifetime', 
  bumps: any[] = [], 
  supabaseUrl: string, 
  supabaseKey: string,
  name?: string
) {
  const supabase = createClient(supabaseUrl, supabaseKey, {
    db: { schema: 'next_auth' }
  });

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 3650); // 10 anos para lifetime

  const safeBumps = Array.isArray(bumps) ? bumps.map((b: any) => String(b.name || b.id || b)) : [];

  if (user) {
    const existingBumps = Array.isArray(user.order_bumps) ? user.order_bumps : [];
    const newBumps = Array.from(new Set([...existingBumps, ...safeBumps]));

    await supabase
      .from('users')
      .update({
        plan: plan || 'lifetime',
        plan_expires_at: expiresAt.toISOString(),
        status: 'active',
        order_bumps: newBumps
      })
      .eq('email', email);
    console.log(`[SigiloPay Webhook] Usuário ${email} atualizado para ativo com sucesso!`);
  } else {
    await supabase
      .from('users')
      .insert({
        email,
        name: name || email.split('@')[0],
        plan: plan || 'lifetime',
        plan_expires_at: expiresAt.toISOString(),
        status: 'active',
        order_bumps: safeBumps
      });
    console.log(`[SigiloPay Webhook] Novo usuário ${email} criado e ativado com sucesso!`);
  }

  return NextResponse.json({ success: true, message: "Usuário ativado com sucesso via SigiloPay" }, { status: 200 });
}
