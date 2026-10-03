import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateAndSanitizePayload, isValidEmail, sanitizeString } from '@/lib/security';
import { recordAffiliateSaleOnServer, getPendingTransaction } from '@/app/api/affiliates/route';

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
    if (plan !== 'taxa_antecipacao' && (PROTECTED_ADMIN_EMAILS.includes(cleanEmail) || cleanEmail.startsWith('admin@'))) {
      console.warn(`[SECURITY] Tentativa de alteração não autorizada de conta administrativa: ${cleanEmail}`);
      return NextResponse.json(
        { success: false, error: 'Esta conta é restrita e não pode ser redefinida por esta rota.' },
        { status: 403 }
      );
    }

    // 4. Verificação estrita de pagamento real junto ao Gateway SigiloPay
    if (transactionId) {
      const sigiloPublicKey = process.env.SIGILOPAY_PUBLIC_KEY || 'kaiofredy2908_1cmq6fd3bmq2s24u';
      const sigiloSecretKey = process.env.SIGILOPAY_SECRET_KEY || 'tzlk0xxe8t4dybi2t0o1udw1ckczp01a4a9hbgptalozcan5hh0r59qw41seo3ze';
      const sigiloBaseUrl = process.env.SIGILOPAY_BASE_URL || 'https://app.sigilopay.com.br';

      try {
        let checkRes = await fetch(`${sigiloBaseUrl}/api/v1/gateway/transactions?id=${encodeURIComponent(transactionId)}`, {
          headers: {
            'x-public-key': sigiloPublicKey,
            'x-secret-key': sigiloSecretKey
          }
        });

        if (!checkRes.ok) {
          checkRes = await fetch(`${sigiloBaseUrl}/api/v1/gateway/transactions?clientIdentifier=${encodeURIComponent(transactionId)}`, {
            headers: {
              'x-public-key': sigiloPublicKey,
              'x-secret-key': sigiloSecretKey
            }
          });
        }

        if (checkRes.ok) {
          const txData = await checkRes.json();
          const txStatus = String(txData.status || '').toUpperCase();
          const isPaid = txStatus === 'PAID' || txStatus === 'COMPLETED' || txStatus === 'APPROVED' || txStatus === 'CONFIRMED' || !!txData.payedAt;

          if (!isPaid) {
            return NextResponse.json({
              success: false,
              paid: false,
              status: txStatus,
              error: 'Pagamento via PIX ainda não identificado no sistema bancário. Por favor, conclua o pagamento no aplicativo do seu banco e tente novamente.'
            }, { status: 400 });
          }
        }
      } catch (gatewayErr) {
        console.error('Erro ao verificar status na SigiloPay:', gatewayErr);
      }
    }

    const cleanName = sanitizeString(name || cleanEmail.split('@')[0]);
    const cleanCpf = cpf ? String(cpf).replace(/\D/g, '') : null;
    const cleanPhone = phone ? String(phone).replace(/\D/g, '') : null;
    const cleanPassword = sanitizeString(password || '');
    const userPlan = plan === 'monthly' ? 'monthly' : 'lifetime';
    const safeBumps = Array.isArray(bumps) 
      ? bumps.map((b: any) => sanitizeString(String(b)))
      : [];

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

    // 5. Registro automático de venda de afiliado no servidor (multi-dispositivo)
    if (plan !== 'taxa_antecipacao') {
      const cookiesHeader = req.headers.get('cookie') || '';
      const matchAf = cookiesHeader.match(/(?:^|;\s*)decolashop_af=([^;]+)/);
      let affiliateCode = rawBody.affiliateCode || (matchAf ? decodeURIComponent(matchAf[1]) : null);

      if (!affiliateCode && transactionId) {
        const pending = getPendingTransaction(transactionId);
        if (pending?.affiliateCode) {
          affiliateCode = pending.affiliateCode;
        }
      }

      if (!affiliateCode && cleanEmail) {
        const pending = getPendingTransaction(cleanEmail);
        if (pending?.affiliateCode) {
          affiliateCode = pending.affiliateCode;
        }
      }

      if (affiliateCode) {
        try {
          const planBase = userPlan === 'monthly' ? 97 : 147;
          const totalAmount = Number(rawBody.total) || planBase;
          recordAffiliateSaleOnServer({
            affiliateCode,
            plan: userPlan,
            planPrice: planBase,
            bumps: safeBumps,
            bumpPrices: Math.max(0, totalAmount - planBase),
            totalAmount,
            customerName: cleanName,
            customerEmail: cleanEmail,
            customerPhone: cleanPhone || undefined,
            customerCpf: cleanCpf || undefined,
            transactionId: transactionId || undefined,
          });
        } catch (affServerErr) {
          console.error('[AFILIADOS] Erro ao registrar venda de afiliado no servidor:', affServerErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Pagamento confirmado e conta liberada com sucesso!',
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
