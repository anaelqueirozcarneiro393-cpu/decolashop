import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateAndSanitizePayload, isValidEmail, sanitizeString } from '@/lib/security';

export const dynamic = 'force-dynamic';

const PROTECTED_ADMIN_EMAILS = [
  'gerente@decolashop.com',
  'admin@decolashop.com',
  'admin@newshop.com',
];

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();

    // 1. SQL Injection and XSS Payload Validation
    const payloadValidation = validateAndSanitizePayload(rawBody);
    if (!payloadValidation.safe) {
      console.warn(`[SECURITY] Requisição bloqueada em /api/sigilopay/confirm-payment: ${payloadValidation.reason}`);
      return NextResponse.json(
        { success: false, error: 'Dados inválidos ou payload suspeito detectado.' },
        { status: 400 }
      );
    }

    const { email, name, cpf, phone, password, plan, bumps, transactionId } = rawBody;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'E-mail obrigatório para ativação da conta.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // 2. Email format validation
    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: 'Formato de e-mail inválido.' },
        { status: 400 }
      );
    }

    // 3. Admin Account Protection (Prevent unauthorized account takeover)
    if (PROTECTED_ADMIN_EMAILS.includes(cleanEmail) || cleanEmail.startsWith('admin@')) {
      console.warn(`[SECURITY] Tentativa de alteração não autorizada de conta administrativa: ${cleanEmail}`);
      return NextResponse.json(
        { success: false, error: 'Esta conta é restrita e não pode ser redefinida por esta rota.' },
        { status: 403 }
      );
    }

    const cleanName = sanitizeString(name || cleanEmail.split('@')[0]);
    const cleanCpf = cpf ? String(cpf).replace(/\D/g, '') : null;
    const cleanPhone = phone ? String(phone).replace(/\D/g, '') : null;
    const cleanPassword = sanitizeString(password || '');
    const userPlan = plan === 'monthly' ? 'monthly' : 'lifetime';

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = 
      process.env.SUPABASE_SERVICE_ROLE_KEY || 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey, {
          db: { schema: 'next_auth' }
        });

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (userPlan === 'monthly' ? 30 : 3650)); // 10 years for lifetime

        // Check if user exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('id, email, password, order_bumps')
          .eq('email', cleanEmail)
          .maybeSingle();

        const safeBumps = Array.isArray(bumps) 
          ? bumps.map((b: any) => sanitizeString(String(b)))
          : [];

        if (existingUser) {
          const existingBumps = Array.isArray(existingUser.order_bumps) ? existingUser.order_bumps : [];
          const newBumps = Array.from(new Set([...existingBumps, ...safeBumps]));
          await supabase
            .from('users')
            .update({
              name: cleanName,
              plan: userPlan,
              plan_expires_at: expiresAt.toISOString(),
              status: 'active',
              order_bumps: newBumps,
              phone: cleanPhone || null,
              cpf: cleanCpf || null,
              password: cleanPassword || existingUser.password || 'decola123'
            })
            .eq('email', cleanEmail);
        } else {
          await supabase
            .from('users')
            .insert({
              email: cleanEmail,
              name: cleanName,
              plan: userPlan,
              plan_expires_at: expiresAt.toISOString(),
              status: 'active',
              order_bumps: safeBumps,
              phone: cleanPhone || null,
              cpf: cleanCpf || null,
              password: cleanPassword || 'decola123'
            });
        }
      } catch (dbErr) {
        console.error('Erro ao registrar usuário no Supabase:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Pagamento confirmado e conta liberada com sucesso via SigiloPay!',
      email: cleanEmail,
      plan: userPlan,
      transactionId: transactionId || null
    });
  } catch (err: any) {
    console.error('Erro ao processar confirm-payment:', err);
    return NextResponse.json(
      { success: false, error: 'Falha ao processar confirmação de pagamento.' },
      { status: 500 }
    );
  }
}
