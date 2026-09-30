import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateAndSanitizePayload, isValidEmail, sanitizeString } from "@/lib/security";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();

    // 1. Validate payload against SQLi & XSS attacks
    const payloadValidation = validateAndSanitizePayload(rawBody);
    if (!payloadValidation.safe) {
      console.warn(`[SECURITY] Webhook CN Pay bloqueado por payload malicioso: ${payloadValidation.reason}`);
      return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }

    const body = rawBody;
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = 
      process.env.SUPABASE_SERVICE_ROLE_KEY || 
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log("🔥 [WEBHOOK CN PAY RECEBIDO] 🔥", JSON.stringify(body, null, 2));

    // Validations
    const customer = body.customer || body.payer || {};
    const email = (customer.email || body.email || "").toLowerCase().trim();
    const status = (body.status || body.event || "").toLowerCase();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "E-mail do cliente inválido ou não encontrado no payload" }, { status: 400 });
    }

    // Protect administrative email
    if (email.startsWith("admin@")) {
      console.warn(`[SECURITY] Tentativa de ativação de webhook para conta de admin bloqueada: ${email}`);
      return NextResponse.json({ error: "Conta protegida" }, { status: 403 });
    }

    const items = body.items || [];
    const isApproved = status.includes("paid") || status.includes("approved") || status.includes("pago");

    console.log(`CN Pay Webhook: Cliente ${email} - Status: ${status} (Aprovado: ${isApproved})`);

    if (isApproved && supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        db: { schema: 'next_auth' }
      });

      // Find user
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      const expiresAt = new Date();
      // Default 365 days for lifetime or 30 days for monthly
      expiresAt.setDate(expiresAt.getDate() + 365);

      if (user) {
        await supabase
          .from('users')
          .update({
            plan: 'lifetime',
            plan_expires_at: expiresAt.toISOString(),
            status: 'active',
            order_bumps: items.map((i: any) => i.name || i.id)
          })
          .eq('email', email);
        console.log(`[CN Pay Webhook] Usuário ${email} atualizado para ativo com sucesso!`);
      } else {
        // Create user
        await supabase
          .from('users')
          .insert({
            email,
            name: customer.name || email.split('@')[0],
            plan: 'lifetime',
            plan_expires_at: expiresAt.toISOString(),
            status: 'active',
            order_bumps: items.map((i: any) => i.name || i.id)
          });
        console.log(`[CN Pay Webhook] Novo usuário ${email} criado e ativado com sucesso!`);
      }
    }

    return NextResponse.json({ success: true, message: "Webhook CN Pay processado" }, { status: 200 });

  } catch (error: any) {
    console.error("Erro fatal no Webhook da CN Pay:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
