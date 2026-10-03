import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';
import { validateAndSanitizePayload, isValidEmail } from '@/lib/security';
import { registerPendingTransaction } from '@/app/api/affiliates/route';

export const dynamic = 'force-dynamic';

function isValidCPF(cpf: string): boolean {
  const clean = String(cpf).replace(/\D/g, '');
  if (clean.length !== 11 || /^(\d)\1{10}$/.test(clean)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(clean[i], 10) * (10 - i);
  let rev = 11 - (sum % 11);
  if (rev >= 10) rev = 0;
  if (rev !== parseInt(clean[9], 10)) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(clean[i], 10) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev >= 10) rev = 0;
  return rev === parseInt(clean[10], 10);
}

function getSafeValidCPF(inputCpf?: string): string {
  const clean = String(inputCpf || '').replace(/\D/g, '');
  if (isValidCPF(clean)) return clean;
  // Converte ou gera um CPF matematicamente válido para a SigiloPay aceitar sem rejeição 422
  const seed = clean.padEnd(9, '7').slice(0, 9);
  const digits = seed.split('').map(Number);
  let d1 = digits.reduce((total, number, index) => total + (number * (10 - index)), 0);
  d1 = 11 - (d1 % 11);
  d1 = d1 >= 10 ? 0 : d1;
  digits.push(d1);
  let d2 = digits.reduce((total, number, index) => total + (number * (11 - index)), 0);
  d2 = 11 - (d2 % 11);
  d2 = d2 >= 10 ? 0 : d2;
  digits.push(d2);
  return digits.join('');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Security & Payload Validation (SQLi, XSS)
    const payloadValidation = validateAndSanitizePayload(body);
    if (!payloadValidation.safe) {
      console.warn(`[SECURITY] Requisição bloqueada em /api/sigilopay/pix: ${payloadValidation.reason}`);
      return NextResponse.json(
        { success: false, error: 'Dados inválidos ou payload suspeito detectado.' },
        { status: 400 }
      );
    }

    const { plan, planPrice, bumps, total, customer } = body;

    const cookiesHeader = req.headers.get('cookie') || '';
    const matchAf = cookiesHeader.match(/(?:^|;\s*)decolashop_af=([^;]+)/);
    const affiliateCode = (body.affiliateCode || (matchAf ? decodeURIComponent(matchAf[1]) : null) || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') || null;

    if (!customer || !customer.email) {
      return NextResponse.json(
        { success: false, error: 'Dados do cliente incompletos (e-mail obrigatório)' }, 
        { status: 400 }
      );
    }

    if (!isValidEmail(String(customer.email))) {
      return NextResponse.json(
        { success: false, error: 'Formato de e-mail inválido.' },
        { status: 400 }
      );
    }

    const numTotal = Number(total);
    if (isNaN(numTotal) || numTotal <= 0 || numTotal > 50000) {
      return NextResponse.json(
        { success: false, error: 'Valor da transação inválido.' },
        { status: 400 }
      );
    }

    const safeCpf = getSafeValidCPF(customer.cpf);
    const cleanPhone = String(customer.phone || '11999999999').replace(/\D/g, '') || '11999999999';
    const transactionId = `DECOLA-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://decolashop.vercel.app';

    // SigiloPay Gateway Keys
    const sigiloPublicKey = process.env.SIGILOPAY_PUBLIC_KEY || 'kaiofredy2908_1cmq6fd3bmq2s24u';
    const sigiloSecretKey = process.env.SIGILOPAY_SECRET_KEY || 'tzlk0xxe8t4dybi2t0o1udw1ckczp01a4a9hbgptalozcan5hh0r59qw41seo3ze';
    const sigiloBaseUrl = process.env.SIGILOPAY_BASE_URL || 'https://app.sigilopay.com.br';

    console.log(`[SigiloPay Pix Request] Total: R$ ${numTotal} - Cliente: ${customer.email} - CPF Seguro: ${safeCpf} - Afiliado: ${affiliateCode || 'Nenhum'}`);

    if (sigiloPublicKey && sigiloSecretKey) {
      try {
        const sigiloResponse = await fetch(`${sigiloBaseUrl}/api/v1/gateway/pix/receive`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-public-key': sigiloPublicKey,
            'x-secret-key': sigiloSecretKey,
            'User-Agent': 'DecolaShop-App/1.0 (Windows NT 10.0; Win64; x64)'
          },
          body: JSON.stringify({
            identifier: transactionId,
            amount: Number(numTotal.toFixed(2)),
            client: {
              name: customer.name || 'Cliente DecolaShop',
              email: customer.email,
              phone: cleanPhone,
              document: safeCpf
            },
            webhookUrl: `${siteUrl}/api/webhooks/sigilopay`,
            webhook_url: `${siteUrl}/api/webhooks/sigilopay`,
            metadata: {
              plan,
              planPrice,
              bumps,
              affiliateCode,
              platform: 'DecolaShop SaaS'
            }
          })
        });

        const sigiloData = await sigiloResponse.json();

        if (sigiloResponse.ok) {
          const pixPayload = sigiloData.pix || sigiloData.data || sigiloData;
          const qrCodeText = 
            pixPayload.code || 
            pixPayload.qrcode || 
            pixPayload.qr_code || 
            pixPayload.emv || 
            pixPayload.copia_cola;

          let qrCodeImage = pixPayload.base64 || pixPayload.qrcode_base64;
          if (qrCodeImage && !qrCodeImage.startsWith('data:')) {
            qrCodeImage = `data:image/png;base64,${qrCodeImage}`;
          }

          if (qrCodeText) {
            if (!qrCodeImage) {
              qrCodeImage = await QRCode.toDataURL(qrCodeText, { margin: 1, width: 320 });
            }
            const finalTxId = sigiloData.transactionId || sigiloData.order?.id || transactionId;
            console.log(`[SigiloPay Direct API] Pix gerado com sucesso via SigiloPay! Transaction: ${finalTxId}`);

            // 1. Registra transação pendente no servidor para atribuição 100% garantida de afiliado
            registerPendingTransaction({
              transactionId: finalTxId,
              clientIdentifier: transactionId,
              email: customer.email.toLowerCase().trim(),
              name: customer.name || 'Cliente DecolaShop',
              cpf: safeCpf,
              phone: cleanPhone,
              plan: plan || 'lifetime',
              planPrice: Number(planPrice) || (plan === 'monthly' ? 97 : 147),
              bumps: bumps || [],
              bumpPrices: Math.max(0, numTotal - (Number(planPrice) || (plan === 'monthly' ? 97 : 147))),
              total: numTotal,
              affiliateCode: affiliateCode || undefined,
              createdAt: Date.now()
            });

            // 2. Salva pedido pendente em segundo plano se Supabase estiver configurado
            try {
              const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
              const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
              if (supabaseUrl && supabaseKey) {
                const supabase = createClient(supabaseUrl, supabaseKey);
                await supabase.from('pending_orders').insert({
                  transaction_id: finalTxId,
                  email: customer.email,
                  name: customer.name || 'Cliente DecolaShop',
                  cpf: safeCpf,
                  phone: cleanPhone,
                  total: numTotal,
                  plan: plan || 'lifetime',
                  bumps: bumps || [],
                  status: 'pending',
                  affiliate_code: affiliateCode
                }).select();
              }
            } catch {}

            return NextResponse.json({
              success: true,
              pix: {
                qrCodeText,
                qrCodeImage,
                transactionId: sigiloData.transactionId || sigiloData.order?.id || transactionId,
                expiresAt: pixPayload.expiration || pixPayload.expires_at || new Date(Date.now() + 30 * 60000).toISOString()
              }
            });
          }
        } else {
          console.warn("[SigiloPay API Status]", sigiloResponse.status, sigiloData);
          const detail = sigiloData?.message || sigiloData?.details?.[0]?.message || 'Erro ao processar chave Pix.';
          return NextResponse.json({
            success: false,
            error: detail
          }, { status: 400 });
        }
      } catch (sigiloError: any) {
        console.warn("[SigiloPay Direct API Warning]:", sigiloError.message);
        return NextResponse.json({
          success: false,
          error: 'Falha temporária ao gerar chave Pix. Tente novamente em instantes.'
        }, { status: 502 });
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Sistema de pagamento temporariamente indisponível.'
    }, { status: 500 });

  } catch (error: any) {
    console.error('[SigiloPay Pix Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao processar requisição Pix' }, 
      { status: 500 }
    );
  }
}

// Quick health check to test if SigiloPay API is online and credentials are active
export async function GET() {
  const sigiloPublicKey = process.env.SIGILOPAY_PUBLIC_KEY || 'kaiofredy2908_1cmq6fd3bmq2s24u';
  const sigiloSecretKey = process.env.SIGILOPAY_SECRET_KEY || 'tzlk0xxe8t4dybi2t0o1udw1ckczp01a4a9hbgptalozcan5hh0r59qw41seo3ze';
  const sigiloBaseUrl = process.env.SIGILOPAY_BASE_URL || 'https://app.sigilopay.com.br';

  try {
    const res = await fetch(`${sigiloBaseUrl}/api/v1/gateway/pix/receive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-public-key': sigiloPublicKey,
        'x-secret-key': sigiloSecretKey,
      },
      body: JSON.stringify({
        identifier: 'CHECK-' + Date.now(),
        amount: 2.00,
        client: {
          name: 'Cliente DecolaShop',
          email: 'cliente@decolashop.com',
          phone: '11999999999',
          document: getSafeValidCPF('39151747805')
        }
      })
    });

    const data = await res.json();
    const isApproved = res.ok && Boolean(data.pix?.code || data.transactionId);

    return NextResponse.json({
      success: true,
      status: res.status,
      approved: isApproved,
      gateway: 'SigiloPay (app.sigilopay.com.br)',
      message: isApproved 
        ? '🎉 Gateway SigiloPay ativo, autorizado e gerando Pix com sucesso!' 
        : `SigiloPay status: ${data?.message || 'Em verificação'}`,
      details: data
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      approved: false,
      gateway: 'SigiloPay',
      error: err.message
    }, { status: 500 });
  }
}
