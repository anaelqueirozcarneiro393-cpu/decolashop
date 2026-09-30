import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';

export const dynamic = 'force-dynamic';

// Official Central Bank of Brazil (BACEN) EMV BR Code Generator
function generatePixBRCode({
  pixKey,
  merchantName = 'DECOLASHOP',
  merchantCity = 'SAO PAULO',
  amount,
  txid = '***'
}: {
  pixKey: string;
  merchantName?: string;
  merchantCity?: string;
  amount: number;
  txid?: string;
}): string {
  const cleanKey = pixKey.trim();
  const cleanName = merchantName.slice(0, 25).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const cleanCity = merchantCity.slice(0, 15).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const cleanTxid = (txid || '***').slice(0, 25).replace(/[^a-zA-Z0-9]/g, '') || '***';
  const formattedAmount = Number(amount).toFixed(2);

  // Tag 26: Merchant Account Information - Pix
  const gui = '0014br.gov.bcb.pix';
  const keyField = `01${cleanKey.length.toString().padStart(2, '0')}${cleanKey}`;
  const maiValue = `${gui}${keyField}`;
  const maiTag = `26${maiValue.length.toString().padStart(2, '0')}${maiValue}`;

  // Tag 54: Amount
  const amountTag = `54${formattedAmount.length.toString().padStart(2, '0')}${formattedAmount}`;

  // Tag 62: Additional Data Field (Reference / txid)
  const refLabel = `05${cleanTxid.length.toString().padStart(2, '0')}${cleanTxid}`;
  const addDataTag = `62${refLabel.length.toString().padStart(2, '0')}${refLabel}`;

  // Base Payload
  const rawPayload = 
    `000201` +
    maiTag +
    `52040000` +
    `5303986` +
    amountTag +
    `5802BR` +
    `59${cleanName.length.toString().padStart(2, '0')}${cleanName}` +
    `60${cleanCity.length.toString().padStart(2, '0')}${cleanCity}` +
    addDataTag +
    `6304`;

  // CRC16-CCITT (poly 0x1021, init 0xFFFF)
  let crc = 0xFFFF;
  for (let i = 0; i < rawPayload.length; i++) {
    crc ^= rawPayload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  const crcHex = crc.toString(16).toUpperCase().padStart(4, '0');
  return `${rawPayload}${crcHex}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { plan, planPrice, bumps, total, customer } = body;

    if (!customer || !customer.email || !customer.cpf) {
      return NextResponse.json(
        { success: false, error: 'Dados do cliente incompletos (e-mail e CPF obrigatórios)' }, 
        { status: 400 }
      );
    }

    const cleanCpf = String(customer.cpf).replace(/\D/g, '');
    const cleanPhone = String(customer.phone || '11999999999').replace(/\D/g, '');
    const transactionId = `DECOLA-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://decolashop.vercel.app';

    // CN Pay Keys
    const cnpayPublicKey = process.env.CNPAY_PUBLIC_KEY || process.env.CNPAY_API_KEY || 'iamironman2001m_xfa4zgezewf6mnqk';
    const cnpaySecretKey = process.env.CNPAY_SECRET_KEY || '319bngqwoe9ggd3p4vafnhgf26g6dkvd8ikkl5jsvirjmten7mu1d2q63cbpui6w';
    const cnpayBaseUrl = process.env.CNPAY_BASE_URL || process.env.CNPAY_API_URL || 'https://painel.appcnpay.com/api/v1';

    console.log(`[CN Pay Pix Request] Total: R$ ${total} - Cliente: ${customer.email} - CPF: ${cleanCpf}`);

    // Try CN Pay Live Gateway
    if (cnpayPublicKey && cnpaySecretKey) {
      try {
        const cnpayResponse = await fetch(`${cnpayBaseUrl}/gateway/pix/receive`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-public-key': cnpayPublicKey,
            'x-secret-key': cnpaySecretKey,
            'User-Agent': 'DecolaShop-App/1.0 (Windows NT 10.0; Win64; x64)'
          },
          body: JSON.stringify({
            identifier: transactionId,
            amount: Number(Number(total).toFixed(2)),
            client: {
              name: customer.name || 'Cliente DecolaShop',
              email: customer.email,
              phone: cleanPhone,
              document: cleanCpf
            },
            webhook_url: `${siteUrl}/api/webhooks/cnpay`,
            metadata: {
              plan,
              planPrice,
              bumps,
              platform: 'DecolaShop SaaS'
            }
          })
        });

        const cnpayData = await cnpayResponse.json();

        if (cnpayResponse.ok) {
          const pixPayload = cnpayData.pix || cnpayData.data || cnpayData;
          const qrCodeText = 
            pixPayload.qrcode || 
            pixPayload.qr_code || 
            pixPayload.emv || 
            pixPayload.copia_cola || 
            pixPayload.code;

          let qrCodeImage = pixPayload.qrcode_base64;
          if (qrCodeImage && !qrCodeImage.startsWith('data:')) {
            qrCodeImage = `data:image/png;base64,${qrCodeImage}`;
          }

          if (qrCodeText) {
            if (!qrCodeImage) {
              qrCodeImage = await QRCode.toDataURL(qrCodeText, { margin: 1, width: 300 });
            }
            console.log(`[CN Pay Direct API] Pix gerado com sucesso via API oficial da CN Pay!`);
            return NextResponse.json({
              success: true,
              pix: {
                qrCodeText,
                qrCodeImage,
                transactionId: cnpayData.identifier || cnpayData.id || transactionId,
                expiresAt: pixPayload.expiration || pixPayload.expires_at || new Date(Date.now() + 15 * 60000).toISOString()
              }
            });
          }
        } else {
          console.warn("[CN Pay API Status]", cnpayResponse.status, cnpayData?.message || cnpayData);
          const detail = cnpayData?.details?.error || cnpayData?.message || 'Seus dados não estão aprovados.';
          
          // Check if there is an explicit real fallback Pix key configured
          const activePixKey = process.env.CNPAY_PIX_KEY || process.env.PIX_KEY;
          
          if (!activePixKey || activePixKey === 'contato@decolashop.com') {
            return NextResponse.json({
              success: false,
              error: `CN Pay: ${detail} (Acesse painel.appcnpay.com para verificar os documentos da sua conta de vendedor)`
            }, { status: 400 });
          }
        }
      } catch (cnpayError: any) {
        console.warn("[CN Pay Direct API Warning]:", cnpayError.message);
      }
    }

    // Only generate static EMV Pix if a REAL custom key has been configured (not fake placeholder)
    const activePixKey = process.env.CNPAY_PIX_KEY || process.env.PIX_KEY;
    if (!activePixKey || activePixKey === 'contato@decolashop.com') {
      return NextResponse.json({
        success: false,
        error: 'Sua conta na CN Pay ainda não está autorizada para vendas ("Seus dados não estão aprovados"). Acesse painel.appcnpay.com para aprovar seus documentos.'
      }, { status: 400 });
    }

    // 100% Compliant BACEN EMV Pix Generation with REAL configured key
    const pixCopiaCola = generatePixBRCode({
      pixKey: activePixKey,
      merchantName: process.env.PIX_MERCHANT_NAME || 'DECOLASHOP',
      merchantCity: process.env.PIX_MERCHANT_CITY || 'SAO PAULO',
      amount: Number(total),
      txid: transactionId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)
    });

    // Native High-Quality Base64 QR Code
    const qrCodeImageUrl = await QRCode.toDataURL(pixCopiaCola, {
      margin: 1,
      width: 320,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    // Save pending transaction in Supabase
    try {
      const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from('pending_orders').insert({
          transaction_id: transactionId,
          email: customer.email,
          name: customer.name,
          cpf: cleanCpf,
          phone: cleanPhone,
          total: total,
          plan: plan,
          bumps: bumps,
          status: 'pending'
        }).select();
      }
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      pix: {
        qrCodeText: pixCopiaCola,
        qrCodeImage: qrCodeImageUrl,
        transactionId: transactionId,
        expiresAt: new Date(Date.now() + 15 * 60000).toISOString()
      }
    });

  } catch (error: any) {
    console.error('[CN Pay Pix Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao processar requisição Pix' }, 
      { status: 500 }
    );
  }
}

// Quick health check to test if CN Pay has approved the seller account
export async function GET() {
  const cnpayPublicKey = process.env.CNPAY_PUBLIC_KEY || process.env.CNPAY_API_KEY || 'iamironman2001m_xfa4zgezewf6mnqk';
  const cnpaySecretKey = process.env.CNPAY_SECRET_KEY || '319bngqwoe9ggd3p4vafnhgf26g6dkvd8ikkl5jsvirjmten7mu1d2q63cbpui6w';
  const cnpayBaseUrl = process.env.CNPAY_BASE_URL || process.env.CNPAY_API_URL || 'https://painel.appcnpay.com/api/v1';

  try {
    const res = await fetch(`${cnpayBaseUrl}/gateway/pix/receive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-public-key': cnpayPublicKey,
        'x-secret-key': cnpaySecretKey,
      },
      body: JSON.stringify({
        identifier: 'CHECK-' + Date.now(),
        amount: 1.00,
        client: {
          name: 'Verificacao Status',
          email: 'teste@decolashop.com',
          phone: '11999999999',
          document: '39151747805'
        }
      })
    });

    const data = await res.json();
    const isApproved = res.ok;

    return NextResponse.json({
      success: true,
      status: res.status,
      approved: isApproved,
      message: isApproved 
        ? '🎉 Conta CN Pay aprovada e autorizada para vendas!' 
        : `Aguardando aprovação na CN Pay: ${data?.details?.error || data?.message || 'Dados em análise'}`,
      details: data
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      approved: false,
      error: err.message
    }, { status: 500 });
  }
}
