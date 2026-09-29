import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Bypass RLS using Service Role Key to update the next_auth.users table securely
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'next_auth',
  },
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🔥 [WEBHOOK IRONPAY RECEBIDO] 🔥");

    // Validação básica do payload da Ironpay
    if (!body || !body.customer || !body.customer.email) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const email = body.customer.email.toLowerCase();
    const status = body.status; // 'paid', 'canceled', 'refunded', etc
    const items = body.items || [];
    const productName = items.length > 0 ? items[0].title || "" : "";

    console.log(`Processando Webhook para ${email} - Status: ${status} - Produto: ${productName}`);

    // Determinar o novo plano e validade
    let plan = 'free';
    let expiresAt: Date | null = null;

    if (status === 'paid' || status === 'approved') {
      if (productName.toLowerCase().includes('mensal')) {
        plan = 'monthly';
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
      } else if (productName.toLowerCase().includes('anual')) {
        plan = 'yearly';
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 365);
      } else if (productName.toLowerCase().includes('vitalício') || productName.toLowerCase().includes('teste')) {
        plan = 'yearly'; // Tratando como vip / lifetime
        expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 10); // 10 anos
      } else {
        // Se não identificar o nome, dá 30 dias por padrão para garantir
        plan = 'monthly';
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
      }
    } else if (['canceled', 'refunded', 'chargeback'].includes(status)) {
      // Se cancelou ou pediu reembolso, corta o acesso
      plan = 'free';
      expiresAt = null;
    } else {
      // Outros status como 'pending', ignoramos
      return NextResponse.json({ received: true, ignored: true }, { status: 200 });
    }

    // Atualizar o banco de dados (tabela next_auth.users)
    const { data, error } = await supabase
      .from('users')
      .update({
        plan: plan,
        plan_expires_at: expiresAt ? expiresAt.toISOString() : null,
      })
      .eq('email', email)
      .select();

    if (error) {
      console.error("Erro ao atualizar banco de dados:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!data || data.length === 0) {
      console.log(`⚠️ Usuário não encontrado. Salvando como compra pendente: ${email}`);
      const { error: insertError } = await supabase
        .from('pending_purchases')
        .insert({
          email: email,
          plan: plan,
          plan_expires_at: expiresAt ? expiresAt.toISOString() : null,
        });

      if (insertError) {
        console.error("Erro ao inserir pagamento pendente:", insertError);
        return NextResponse.json({ error: "Database error on pending" }, { status: 500 });
      }
      
      console.log(`✅ Compra pendente salva com sucesso para: ${email}`);
      return NextResponse.json({ received: true, success: true, pending: true }, { status: 200 });
    }

    console.log(`✅ Acesso atualizado com sucesso para: ${email}. Plano: ${plan}`);
    return NextResponse.json({ received: true, success: true }, { status: 200 });

  } catch (error) {
    console.error("Erro fatal no Webhook da Ironpay:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
