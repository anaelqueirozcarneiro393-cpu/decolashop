import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = 
      process.env.SUPABASE_SERVICE_ROLE_KEY || 
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const body = await req.json();
    console.log("🔥 [WEBHOOK CN PAY RECEBIDO] 🔥", JSON.stringify(body, null, 2));

    // Validations
    const customer = body.customer || body.payer || {};
    const email = (customer.email || body.email || "").toLowerCase().trim();
    const status = (body.status || body.event || "").toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "E-mail do cliente não encontrado no payload" }, { status: 400 });
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
