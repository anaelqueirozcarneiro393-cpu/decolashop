import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { validateAndSanitizePayload, isValidEmail, sanitizeString } from '@/lib/security';
import { dbRecordSale, dbGetPendingPix, dbGetLeadAffiliate, dbBindLead, dbGetAffiliates } from '@/lib/affiliateDb';
import { recordPaidWithdrawalFee } from '@/lib/withdrawalFeesStore';

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

    // 4. Verificação estrita de pagamento real junto ao Gateway SigiloPay (OBRIGATÓRIO)
    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: 'Identificador de transação (transactionId) é obrigatório para validação de pagamento.' },
        { status: 400 }
      );
    }

    const sigiloPublicKey = process.env.SIGILOPAY_PUBLIC_KEY || 'kaiofredy2908_1cmq6fd3bmq2s24u';
    const sigiloSecretKey = process.env.SIGILOPAY_SECRET_KEY || 'tzlk0xxe8t4dybi2t0o1udw1ckczp01a4a9hbgptalozcan5hh0r59qw41seo3ze';
    const sigiloBaseUrl = process.env.SIGILOPAY_BASE_URL || 'https://app.sigilopay.com.br';

    let isPaid = false;
    let txStatus = '';
    let txData: any = {};

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
        txData = await checkRes.json();
        txStatus = String(txData.status || '').toUpperCase();
        isPaid = txStatus === 'PAID' || txStatus === 'COMPLETED' || txStatus === 'APPROVED' || txStatus === 'CONFIRMED' || !!txData.payedAt;
      } else {
        return NextResponse.json({
          success: false,
          paid: false,
          error: 'Transação não encontrada ou inválida na SigiloPay.'
        }, { status: 400 });
      }
    } catch (gatewayErr) {
      console.error('Erro ao verificar status na SigiloPay:', gatewayErr);
      return NextResponse.json({
        success: false,
        paid: false,
        error: 'Erro de comunicação com o gateway bancário. Tente novamente em instantes.'
      }, { status: 502 });
    }

    if (!isPaid) {
      return NextResponse.json({
        success: false,
        paid: false,
        status: txStatus,
        error: 'Pagamento via PIX ainda não identificado no sistema bancário. Por favor, conclua o pagamento no aplicativo do seu banco e tente novamente.'
      }, { status: 400 });
    }

    // Identifica transação pendente se existir para checar plano e integridade
    const pendingTx = transactionId ? await dbGetPendingPix(transactionId) : null;
    const effectivePlan = plan || pendingTx?.plan || 'lifetime';
    const isTaxaAntecipacao = effectivePlan === 'taxa_antecipacao';

    // Validação de valor real pago na SigiloPay (Impede ativação com pagamentos adulterados de R$ 1,00)
    const paidAmount = Number(txData.amount || txData.value || txData.data?.amount || 0);
    if (!isTaxaAntecipacao && effectivePlan !== 'bumps_only') {
      if (paidAmount > 0 && paidAmount < 70) {
        console.warn(`[SECURITY ALERT] Valor pago na SigiloPay (R$ ${paidAmount}) insuficiente para plano ${effectivePlan}: ${cleanEmail}`);
        return NextResponse.json({
          success: false,
          paid: false,
          error: 'O valor identificado no pagamento bancário é insuficiente para a liberação deste plano.'
        }, { status: 400 });
      }
    }

    const cleanName = sanitizeString(name || cleanEmail.split('@')[0]);

    // TRATAMENTO EXCLUSIVO DA TAXA DE SAQUE / ANTECIPAÇÃO:
    // 1. Registra no sistema de taxas de saque do Gerente
    // 2. Não altera senha/plano de usuário
    // 3. NUNCA credita comissão para afiliados
    if (isTaxaAntecipacao) {
      try {
        const feeAmount = paidAmount > 0 ? paidAmount : (Number(rawBody.total) || pendingTx?.total || 150);
        await recordPaidWithdrawalFee({
          transactionId: transactionId || undefined,
          customerEmail: cleanEmail,
          customerName: cleanName,
          amount: feeAmount,
          paidAt: Date.now()
        });
      } catch (feeErr) {
        console.error('[TAXAS SAQUE] Erro ao registrar taxa de saque paga:', feeErr);
      }

      console.log(`[SigiloPay Confirm] ✅ Taxa de saque confirmada para ${cleanEmail} (R$ ${paidAmount || rawBody.total || 150}). NENHUMA comissão repassada a afiliados.`);

      return NextResponse.json({
        success: true,
        message: 'Pagamento da taxa de antecipação confirmado com sucesso! Saque liberado.',
        email: cleanEmail,
        plan: 'taxa_antecipacao'
      });
    }
    const cleanCpf = cpf ? String(cpf).replace(/\D/g, '') : null;
    const cleanPhone = phone ? String(phone).replace(/\D/g, '') : null;
    const cleanPassword = sanitizeString(password || '');
    let userPlan = plan === 'monthly' ? 'monthly' : 'lifetime';
    if (paidAmount > 0) {
      if (paidAmount <= 130) {
        userPlan = 'monthly';
      } else if (paidAmount >= 160) {
        userPlan = 'lifetime';
      }
    } else if (pendingTx?.plan === 'monthly') {
      userPlan = 'monthly';
    }
    const safeBumps = Array.isArray(bumps) 
      ? bumps.map((b: any) => sanitizeString(String(b)))
      : [];

    try {
      const supabase = getSupabaseAdmin('next_auth');

      // Prevenção contra Replay Attack (reuso do mesmo transactionId)
      if (plan !== 'taxa_antecipacao' && plan !== 'bumps_only') {
        const claimId = `claim_tx_${transactionId}`;
        const { data: alreadyClaimed } = await supabase
          .from('verification_tokens')
          .select('identifier')
          .eq('identifier', claimId)
          .maybeSingle();

        if (alreadyClaimed) {
          console.warn(`[SECURITY] Tentativa de reuso da transação ${transactionId} por ${cleanEmail}`);
          return NextResponse.json({
            success: false,
            error: 'Esta transação já foi utilizada para ativação de uma conta.'
          }, { status: 400 });
        }

        // Registra a transação como reivindicada
        await supabase.from('verification_tokens').insert({
          identifier: claimId,
          token: cleanEmail,
          expires: new Date('2099-01-01').toISOString()
        });
      }

      // Busca dados pendentes pré-registrados para resgate de bumps, valor e afiliado
      let pendingTx: any = null;
      if (transactionId) {
        pendingTx = await dbGetPendingPix(transactionId);
      }
      if (!pendingTx && cleanEmail) {
        pendingTx = await dbGetPendingPix(cleanEmail);
      }

      const finalBumps = (safeBumps && safeBumps.length > 0) ? safeBumps : (pendingTx?.bumps || []);
      const planBase = userPlan === 'monthly' ? 89.90 : 179.90;
      const totalAmount = 
        Number(txData.amount || txData.chargeAmount) || 
        Number(rawBody.total) || 
        Number(pendingTx?.total) || 
        planBase;
      const finalTxId = transactionId || pendingTx?.transactionId;

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (userPlan === 'monthly' ? 30 : 3650)); // 10 years for lifetime

      const userMetadata = JSON.stringify({
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
        pwd: cleanPassword || 'decola123',
        bumps: finalBumps,
        phone: cleanPhone || null,
        cpf: cleanCpf || null
      });

      await supabase
        .from('users')
        .upsert({
          email: cleanEmail,
          name: cleanName,
          plan: userPlan,
          plan_expires_at: expiresAt.toISOString(),
          image: userMetadata
        }, { onConflict: 'email' });

      console.log(`[SigiloPay Confirm] Usuário pago ${cleanEmail} registrado com sucesso no plano ${userPlan}!`);
    } catch (dbErr) {
      console.error('Erro ao registrar usuário no Supabase:', dbErr);
    }

    // 5. Registro automático de venda de afiliado no servidor (multi-dispositivo)
    if (plan !== 'taxa_antecipacao') {
      const cookiesHeader = req.headers.get('cookie') || '';
      const matchAf = cookiesHeader.match(/(?:^|;\s*)decolashop_af=([^;]+)/);
      let affiliateCode = rawBody.affiliateCode || (matchAf ? decodeURIComponent(matchAf[1]) : null);

      let pendingTx: any = null;
      if (transactionId) {
        pendingTx = await dbGetPendingPix(transactionId);
      }
      if (!pendingTx && cleanEmail) {
        pendingTx = await dbGetPendingPix(cleanEmail);
      }

      if (!affiliateCode && pendingTx?.affiliateCode) {
        affiliateCode = pendingTx.affiliateCode;
      }

      // LEAD LOCK-IN: Vínculo perpétuo de email do lead com afiliado no Supabase
      if (!affiliateCode && cleanEmail) {
        try {
          const bound = await dbGetLeadAffiliate(cleanEmail);
          if (bound) {
            affiliateCode = bound;
            console.log(`[AFILIADOS LEAD LOCK] Venda confirmada resgatada pelo vínculo perpétuo no banco: ${cleanEmail} -> ${bound}`);
          }
        } catch {}
      }

      // AUTO-ATTRIBUTION: Se a venda é de assinatura/bump e não veio código, atribui ao afiliado ativo da loja (rwjncwiofw)
      if (!affiliateCode) {
        try {
          const activeAffs = await dbGetAffiliates();
          const rwj = activeAffs.find(a => a.code === 'rwjncwiofw');
          if (rwj && rwj.active) {
            affiliateCode = 'rwjncwiofw';
          }
        } catch {}
      }

      if (affiliateCode && cleanEmail) {
        await dbBindLead(cleanEmail, affiliateCode).catch(() => {});
      }

      if (affiliateCode) {
        try {
          const planBase = userPlan === 'monthly' ? 89.90 : 179.90;
          const finalBumps = (safeBumps && safeBumps.length > 0) ? safeBumps : (pendingTx?.bumps || []);
          const totalAmount = 
            Number(txData.amount || txData.chargeAmount) || 
            Number(rawBody.total) || 
            Number(pendingTx?.total) || 
            planBase;
          const finalTxId = transactionId || pendingTx?.transactionId;

          await dbRecordSale({
            affiliateCode,
            plan: userPlan,
            planPrice: planBase,
            bumps: finalBumps,
            bumpPrices: Math.max(0, Number((totalAmount - planBase).toFixed(2))),
            totalAmount,
            customerName: cleanName,
            customerEmail: cleanEmail,
            customerPhone: cleanPhone || undefined,
            customerCpf: cleanCpf || undefined,
            transactionId: finalTxId || undefined,
          });
        } catch (affServerErr) {
          console.error('[AFILIADOS] Erro ao registrar venda de afiliado no Supabase:', affServerErr);
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
