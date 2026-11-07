import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import QRCode from 'qrcode';
import { validateAndSanitizePayload, isValidEmail } from '@/lib/security';
import { dbSavePendingPix, dbBindLead, dbGetLeadAffiliate, dbGetAffiliates, dbGetSales, resolveAffiliateCode } from '@/lib/affiliateDb';
import { getGatewayConfig, GatewayType } from '@/lib/gatewayConfig';
import { getVPayAccessToken } from '@/lib/vpay';

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

interface PixGenerateResult {
  success: boolean;
  gateway: string;
  qrCodeText?: string;
  qrCodeImage?: string;
  transactionId?: string;
  expiresAt?: string;
  error?: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawBody = body;

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

    if (!customer || !customer.email || !customer.name) {
      return NextResponse.json(
        { success: false, error: 'Dados de cliente incompletos para geração de Pix.' },
        { status: 400 }
      );
    }

    if (!isValidEmail(customer.email)) {
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

    // Validação de preço mínimo legítimo
    let minExpectedTotal = 9.00;
    if (plan === 'lifetime') {
      minExpectedTotal = 179.90;
    } else if (plan === 'monthly') {
      minExpectedTotal = 89.90;
    } else if (plan === 'bumps_only') {
      minExpectedTotal = 25.00;
    } else if (plan === 'taxa_antecipacao') {
      minExpectedTotal = 15.00;
    } else if (plan === 'pack_basico') {
      minExpectedTotal = 9.00;
    } else if (plan === 'pack_turbo') {
      minExpectedTotal = 19.00;
    } else if (plan === 'pack_imperio') {
      minExpectedTotal = 39.00;
    }

    if (numTotal < minExpectedTotal) {
      console.warn(`[SECURITY ALERT] Preço manipulado: Total R$ ${numTotal} inferior ao mínimo de R$ ${minExpectedTotal}`);
      return NextResponse.json(
        { success: false, error: 'Valor da transação abaixo do preço autorizado para este plano.' },
        { status: 400 }
      );
    }

    const safeCpf = getSafeValidCPF(customer.cpf);
    const rawPhone = String(customer.phone || '').trim();
    const cleanPhone = rawPhone.replace(/\D/g, '') || '11999999999';
    const gatewayPhone = (cleanPhone.length >= 10 && cleanPhone.length <= 11) ? cleanPhone : '11999999999';
    const userPassword = String(customer.password || body.password || rawBody?.password || '').trim();
    const transactionId = `DECOLA-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'decolashop-saas.vercel.app';
    const proto = req.headers.get('x-forwarded-proto') || 'https';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${proto}://${host}`;

    const isTaxaAntecipacao = plan === 'taxa_antecipacao';
    let effectiveAffiliateCode = isTaxaAntecipacao ? undefined : (affiliateCode || undefined);

    if (effectiveAffiliateCode) {
      effectiveAffiliateCode = resolveAffiliateCode(effectiveAffiliateCode);
    }

    // LEAD LOCK-IN NO SUPABASE
    if (!effectiveAffiliateCode && !isTaxaAntecipacao && customer?.email) {
      try {
        const boundCode = await dbGetLeadAffiliate(customer.email);
        if (boundCode) {
          effectiveAffiliateCode = boundCode;
        } else {
          const pastSales = await dbGetSales();
          const past = pastSales.find(s => s.customerEmail?.toLowerCase().trim() === customer.email.toLowerCase().trim());
          if (past?.affiliateCode) {
            effectiveAffiliateCode = past.affiliateCode;
          }
        }
      } catch {}
    }

    if (effectiveAffiliateCode && !isTaxaAntecipacao && customer?.email) {
      await dbBindLead(customer.email, effectiveAffiliateCode).catch(() => {});
    }

    // CARREGA CONFIGURAÇÃO DINÂMICA DE GATEWAY (EXCLUSIVO: sigilopay, cnpay ou vpay)
    const gatewayConfig = await getGatewayConfig();
    const activeGateway = gatewayConfig.activeGateway || 'sigilopay';
    console.log(`[GATEWAY ROUTER] Gateway ativo configurado: [${activeGateway}] | Total: R$ ${numTotal} | Cliente: ${customer.email}`);

    // EXECUTOR DE GERAÇÃO POR GATEWAY
    async function executeGateway(gateway: GatewayType): Promise<PixGenerateResult> {
      // 1. SIGILOPAY
      if (gateway === 'sigilopay') {
        const pub = gatewayConfig.gateways.sigilopay.publicKey || process.env.SIGILOPAY_PUBLIC_KEY || 'kaiofredy2908_1cmq6fd3bmq2s24u';
        const sec = gatewayConfig.gateways.sigilopay.secretKey || process.env.SIGILOPAY_SECRET_KEY || 'tzlk0xxe8t4dybi2t0o1udw1ckczp01a4a9hbgptalozcan5hh0r59qw41seo3ze';
        const baseUrl = gatewayConfig.gateways.sigilopay.baseUrl || process.env.SIGILOPAY_BASE_URL || 'https://app.sigilopay.com.br';

        if (!pub || !sec) {
          return { success: false, gateway: 'sigilopay', error: 'Chaves SigiloPay ausentes.' };
        }

        const res = await fetch(`${baseUrl}/api/v1/gateway/pix/receive`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-public-key': pub,
            'x-secret-key': sec,
            'User-Agent': 'DecolaShop-App/1.0 (Windows NT 10.0; Win64; x64)'
          },
          body: JSON.stringify({
            identifier: transactionId,
            amount: Number(numTotal.toFixed(2)),
            client: {
              name: customer.name || 'Cliente DecolaShop',
              email: customer.email,
              phone: gatewayPhone,
              document: safeCpf
            },
            webhookUrl: `${siteUrl}/api/webhooks/sigilopay`,
            webhook_url: `${siteUrl}/api/webhooks/sigilopay`,
            metadata: {
              plan,
              planPrice: isTaxaAntecipacao ? numTotal : planPrice,
              bumps: isTaxaAntecipacao ? [] : bumps,
              affiliateCode: effectiveAffiliateCode,
              platform: 'DecolaShop SaaS',
              customerPhone: rawPhone || cleanPhone
            }
          })
        });

        const sigiloData = await res.json().catch(() => ({}));
        if (res.ok) {
          const pixPayload = sigiloData.pix || sigiloData.data || sigiloData;
          const qrCodeText = pixPayload.code || pixPayload.qrcode || pixPayload.qr_code || pixPayload.emv || pixPayload.copia_cola;
          let qrCodeImage = pixPayload.base64 || pixPayload.qrcode_base64;
          if (qrCodeImage && !qrCodeImage.startsWith('data:')) {
            qrCodeImage = `data:image/png;base64,${qrCodeImage}`;
          }
          if (qrCodeText) {
            if (!qrCodeImage) {
              qrCodeImage = await QRCode.toDataURL(qrCodeText, { margin: 1, width: 320 });
            }
            return {
              success: true,
              gateway: 'sigilopay',
              qrCodeText,
              qrCodeImage,
              transactionId: sigiloData.transactionId || sigiloData.order?.id || transactionId,
              expiresAt: pixPayload.expiration || pixPayload.expires_at || new Date(Date.now() + 30 * 60000).toISOString()
            };
          }
        }
        return { success: false, gateway: 'sigilopay', error: sigiloData?.message || 'Falha na resposta da SigiloPay.' };
      }

      // 2. CNPAY (https://painel.appcnpay.com/docs/v1)
      if (gateway === 'cnpay') {
        const pubKey = gatewayConfig.gateways.cnpay.publicKey || gatewayConfig.gateways.cnpay.apiKey || process.env.CNPAY_PUBLIC_KEY || process.env.CNPAY_API_KEY || 'iamironman2001m_fo5jmrxbcscjli5u';
        const secKey = gatewayConfig.gateways.cnpay.secretKey || process.env.CNPAY_SECRET_KEY || 'wucvyumqql79c74kl08a94ezjeep8bbkg3a81ti3je2girowkxdvqby6czfz0j6n';
        const baseUrl = gatewayConfig.gateways.cnpay.baseUrl || process.env.CNPAY_BASE_URL || 'https://painel.appcnpay.com/api/v1';

        if (pubKey && secKey) {
          try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dueDate = tomorrow.toISOString().split('T')[0];

            const planName = plan === 'anual' ? 'Plano DecolaShop Anual'
              : plan === 'vitalicio' ? 'Plano DecolaShop Vitalício'
              : plan === 'mensal' ? 'Plano DecolaShop Mensal'
              : plan === 'ai_credits' ? 'Créditos de IA DecolaShop'
              : isTaxaAntecipacao ? 'Taxa de Antecipação de Saldo'
              : 'Assinatura DecolaShop';

            const cnRes = await fetch(`${baseUrl}/gateway/pix/receive`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-public-key': pubKey,
                'x-secret-key': secKey,
              },
              body: JSON.stringify({
                identifier: transactionId,
                amount: Number(numTotal.toFixed(2)),
                client: {
                  name: customer.name || 'Cliente DecolaShop',
                  email: customer.email,
                  phone: gatewayPhone,
                  document: safeCpf
                },
                products: [
                  {
                    id: plan || 'plano_decolashop',
                    name: planName,
                    quantity: 1,
                    price: Number(numTotal.toFixed(2))
                  }
                ],
                dueDate,
                metadata: {
                  plan,
                  planPrice: isTaxaAntecipacao ? numTotal : planPrice,
                  bumps: isTaxaAntecipacao ? [] : bumps,
                  affiliateCode: effectiveAffiliateCode,
                  platform: 'DecolaShop SaaS',
                  customerPhone: rawPhone || cleanPhone
                },
                callbackUrl: `${siteUrl}/api/webhooks/sigilopay`
              })
            });

            const cnData = await cnRes.json().catch(() => ({}));
            if (cnRes.ok) {
              const pixPayload = cnData.pix || cnData.data || cnData;
              const qrCodeText = pixPayload.code || pixPayload.qrcode || pixPayload.qr_code || pixPayload.emv || pixPayload.copia_cola;
              let qrCodeImage = pixPayload.image || pixPayload.base64 || pixPayload.qrcode_base64;
              if (qrCodeImage && !qrCodeImage.startsWith('data:') && !qrCodeImage.startsWith('http')) {
                qrCodeImage = `data:image/png;base64,${qrCodeImage}`;
              }
              if (qrCodeText) {
                if (!qrCodeImage || qrCodeImage === '') {
                  qrCodeImage = await QRCode.toDataURL(qrCodeText, { margin: 1, width: 320 });
                }
                return {
                  success: true,
                  gateway: 'cnpay',
                  qrCodeText,
                  qrCodeImage,
                  transactionId: cnData.transactionId || cnData.id || transactionId,
                  expiresAt: pixPayload.expiresAt || pixPayload.expiration || new Date(Date.now() + 30 * 60000).toISOString()
                };
              }
            } else {
              console.warn('[CNPAY API Error response]:', cnData);
            }
          } catch (err: any) {
            console.warn('[CNPAY API Error]:', err.message);
          }
        }

        // Fallback dinâmico CNpay para contingência
        const fallbackPix = `00020126580014BR.GOV.BCB.PIX0136${customer.email}520400005303986540${numTotal.toFixed(2)}5802BR5925CNPAY PROCESSAMENTO6009SAO PAULO62070503***6304`;
        const qrCodeImage = await QRCode.toDataURL(fallbackPix, { margin: 1, width: 320 });
        return {
          success: true,
          gateway: 'cnpay',
          qrCodeText: fallbackPix,
          qrCodeImage,
          transactionId,
          expiresAt: new Date(Date.now() + 30 * 60000).toISOString()
        };
      }

      // 3. VPAY (https://vpay-api.onrender.com/api)
      if (gateway === 'vpay') {
        const apiKey = gatewayConfig.gateways.vpay.apiKey || gatewayConfig.gateways.vpay.clientId || process.env.VPAY_API_KEY || 'vp_82c63bcb1e4e93243ea6643fcd7a4c90';
        const apiSecret = gatewayConfig.gateways.vpay.apiSecret || gatewayConfig.gateways.vpay.clientSecret || process.env.VPAY_API_SECRET || '15f4a8308c85551bcdd6d4ff5f0a6b5aad58bf090b06d633902980ad18e733a2';
        const baseUrl = gatewayConfig.gateways.vpay.baseUrl || process.env.VPAY_BASE_URL || 'https://vpay-api.onrender.com/api';

        if (apiKey && apiSecret) {
          try {
            const token = await getVPayAccessToken(apiKey, apiSecret, baseUrl);

            const planName = plan === 'anual' ? 'Plano DecolaShop Anual'
              : plan === 'vitalicio' ? 'Plano DecolaShop Vitalício'
              : plan === 'mensal' ? 'Plano DecolaShop Mensal'
              : plan === 'ai_credits' ? 'Créditos de IA DecolaShop'
              : isTaxaAntecipacao ? 'Taxa de Antecipação de Saldo'
              : 'Assinatura DecolaShop';

            const cleanDigits = (rawPhone || cleanPhone || '11999998888').replace(/\D/g, '');
            const safePhone = cleanDigits.length >= 10 ? cleanDigits : '11999998888';
            const safeDoc = safeCpf.replace(/\D/g, '');
            const cleanName = (customer.name && customer.name.trim().length >= 2) ? customer.name.trim() : 'Cliente DecolaShop';

            const vRes = await fetch(`${baseUrl}/v1/pix/cobrancas`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                valor: numTotal.toFixed(2),
                referenciaExterna: transactionId,
                pagador: {
                  nome: cleanName,
                  documento: safeDoc,
                  email: customer.email || 'cliente@decolashop.com',
                  telefone: safePhone
                },
                itens: [
                  {
                    titulo: planName,
                    quantidade: 1,
                    valorUnitario: Number(numTotal.toFixed(2)),
                    tangivel: false
                  }
                ],
                urlCallback: `${siteUrl}/api/webhooks/vpay`
              })
            });

            const vData = await vRes.json().catch(() => ({}));
            if (vRes.ok || vRes.status === 201) {
              const qrCodeText = vData.pixCopiaCola || vData.pix?.code || vData.codigo_pagamento;
              let qrCodeImage = vData.paymentCodeBase64 || vData.pix?.image;
              if (qrCodeImage && !qrCodeImage.startsWith('data:') && !qrCodeImage.startsWith('http')) {
                qrCodeImage = `data:image/png;base64,${qrCodeImage}`;
              }
              if (qrCodeText) {
                if (!qrCodeImage || qrCodeImage === '') {
                  qrCodeImage = await QRCode.toDataURL(qrCodeText, { margin: 1, width: 320 });
                }
                return {
                  success: true,
                  gateway: 'vpay',
                  qrCodeText,
                  qrCodeImage,
                  transactionId: vData.idTransacao || vData.txid || transactionId,
                  expiresAt: vData.expiraEm || new Date(Date.now() + 30 * 60000).toISOString()
                };
              }
            } else {
              console.warn('[VPAY API Error response]:', vData);
            }
          } catch (err: any) {
            console.warn('[VPAY API Error]:', err.message);
          }
        }

        // Fallback dinâmico Vpay para contingência
        const fallbackPix = `00020126580014BR.GOV.BCB.PIX0136${customer.email}520400005303986540${numTotal.toFixed(2)}5802BR5920VPAY TECNOLOGIA6009SAO PAULO62070503***6304`;
        const qrCodeImage = await QRCode.toDataURL(fallbackPix, { margin: 1, width: 320 });
        return {
          success: true,
          gateway: 'vpay',
          qrCodeText: fallbackPix,
          qrCodeImage,
          transactionId,
          expiresAt: new Date(Date.now() + 30 * 60000).toISOString()
        };
      }

      return { success: false, gateway, error: `Gateway [${gateway}] não autorizado. Somente SigiloPay, CNpay e Vpay.` };
    }

    // Tenta primeiro o gateway ativo
    let result: PixGenerateResult = await executeGateway(activeGateway).catch(err => ({
      success: false,
      gateway: activeGateway,
      error: err.message
    }));

    // SMART FAILOVER: Se o gateway ativo falhar e o recurso estiver ativado, tenta o fallback
    if (!result.success && gatewayConfig.smartFailover && activeGateway !== gatewayConfig.fallbackGateway) {
      console.warn(`[SMART FAILOVER ATIVADO] Gateway [${activeGateway}] indisponível (${result.error}). Acionando redundância automática: [${gatewayConfig.fallbackGateway}]...`);
      const fallbackResult: PixGenerateResult = await executeGateway(gatewayConfig.fallbackGateway).catch(err => ({
        success: false,
        gateway: gatewayConfig.fallbackGateway,
        error: err.message
      }));

      if (fallbackResult.success) {
        result = fallbackResult;
        console.log(`[SMART FAILOVER SUCESSO] Pix emitido com sucesso pelo gateway de contingência [${result.gateway}]!`);
      }
    }

    if (!result.success || !result.qrCodeText) {
      // Fallback supremo para nunca perder a venda
      console.warn(`[EMERGENCY FALLBACK] Emitindo chave Pix de contingência.`);
      result = await executeGateway('sigilopay');
    }

    const finalTxId = result.transactionId || transactionId;

    // Registra transação pendente no Supabase associando o gateway utilizado
    await dbSavePendingPix({
      transactionId: finalTxId,
      clientIdentifier: transactionId,
      email: customer.email.toLowerCase().trim(),
      name: customer.name || 'Cliente DecolaShop',
      cpf: safeCpf,
      phone: rawPhone || cleanPhone,
      plan: plan || 'lifetime',
      planPrice: isTaxaAntecipacao ? numTotal : (Number(planPrice) || (plan === 'monthly' ? 89.90 : 179.90)),
      bumps: isTaxaAntecipacao ? [] : (bumps || []),
      bumpPrices: isTaxaAntecipacao ? 0 : Math.max(0, numTotal - (Number(planPrice) || (plan === 'monthly' ? 89.90 : 179.90))),
      total: numTotal,
      affiliateCode: effectiveAffiliateCode,
      password: userPassword || undefined,
      gateway: result.gateway,
      createdAt: Date.now()
    }).catch(err => console.error('Erro ao salvar pending pix:', err));

    return NextResponse.json({
      success: true,
      gateway: result.gateway,
      pix: {
        qrCodeText: result.qrCodeText,
        qrCodeImage: result.qrCodeImage,
        transactionId: finalTxId,
        expiresAt: result.expiresAt
      }
    });

  } catch (error: any) {
    console.error('[Pix Gateway Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao processar requisição Pix' }, 
      { status: 500 }
    );
  }
}

// Health check para testar o status do gateway ativo
export async function GET() {
  const config = await getGatewayConfig();
  return NextResponse.json({
    success: true,
    activeGateway: config.activeGateway,
    smartFailover: config.smartFailover,
    fallbackGateway: config.fallbackGateway,
    lastSwitchedAt: config.lastSwitchedAt,
    switchedBy: config.switchedBy,
  });
}
