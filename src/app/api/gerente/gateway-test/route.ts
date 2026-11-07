import { NextRequest, NextResponse } from 'next/server';
import { getGatewayConfig, GatewayType } from '@/lib/gatewayConfig';
import { getVPaySaldo } from '@/lib/vpay';

function isGerenteOrAdmin(emailParam?: string): boolean {
  const email = (emailParam || '').toLowerCase().trim();
  return (
    email === 'gerente@decolashop.com' ||
    email === 'admin@decolashop.com' ||
    email.startsWith('gerente@') ||
    email.startsWith('admin@') ||
    email.includes('gerente') ||
    email.includes('admin')
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, gateway, credentials } = body;

    if (!isGerenteOrAdmin(email)) {
      return NextResponse.json(
        { success: false, error: 'Acesso restrito exclusivamente à conta de Gerente.' },
        { status: 403 }
      );
    }

    const config = await getGatewayConfig();
    const targetGateway: GatewayType = gateway || config.activeGateway;
    const startTime = Date.now();

    // 1. TESTE SIGILOPAY
    if (targetGateway === 'sigilopay') {
      const pub = credentials?.publicKey || config.gateways.sigilopay.publicKey;
      const sec = credentials?.secretKey || config.gateways.sigilopay.secretKey;
      const url = credentials?.baseUrl || config.gateways.sigilopay.baseUrl || 'https://app.sigilopay.com.br';

      if (!pub || !sec) {
        return NextResponse.json({
          success: false,
          gateway: 'SigiloPay',
          error: 'Chaves de API da SigiloPay não configuradas.',
        });
      }

      const res = await fetch(`${url}/api/v1/gateway/pix/receive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-public-key': pub,
          'x-secret-key': sec,
        },
        body: JSON.stringify({
          identifier: 'PING-' + Date.now(),
          amount: 2.00,
          client: {
            name: 'DecolaShop Test',
            email: 'test@decolashop.com',
            phone: '11999999999',
            document: '39151747805'
          }
        })
      });

      const elapsed = Date.now() - startTime;
      const data = await res.json().catch(() => ({}));
      const ok = res.ok && Boolean(data.pix?.code || data.transactionId);

      return NextResponse.json({
        success: ok,
        gateway: 'SigiloPay',
        latencyMs: elapsed,
        status: res.status,
        message: ok 
          ? `🟢 SigiloPay ONLINE e Autorizada (${elapsed}ms)` 
          : `⚠️ SigiloPay respondeu com status ${res.status}: ${data.message || 'Credenciais inválidas ou erro temporário'}`,
        details: data
      });
    }

    // 2. TESTE CNPAY (https://painel.appcnpay.com/docs/v1)
    if (targetGateway === 'cnpay') {
      const pubKey = credentials?.publicKey || credentials?.apiKey || config.gateways.cnpay.publicKey || config.gateways.cnpay.apiKey || 'iamironman2001m_fo5jmrxbcscjli5u';
      const secKey = credentials?.secretKey || config.gateways.cnpay.secretKey || 'wucvyumqql79c74kl08a94ezjeep8bbkg3a81ti3je2girowkxdvqby6czfz0j6n';
      const baseUrl = credentials?.baseUrl || config.gateways.cnpay.baseUrl || 'https://painel.appcnpay.com/api/v1';

      if (!pubKey || !secKey) {
        return NextResponse.json({
          success: false,
          gateway: 'CNpay',
          error: 'Chaves da CNpay não preenchidas. Insira a Chave Pública (Client ID) e Chave Privada (Client Secret).',
        });
      }

      try {
        const res = await fetch(`${baseUrl}/gateway/producer/balance`, {
          headers: {
            'Content-Type': 'application/json',
            'x-public-key': pubKey,
            'x-secret-key': secKey,
          }
        });

        const elapsed = Date.now() - startTime;
        const data = await res.json().catch(() => ({}));
        const ok = res.status === 200 || (res.ok && data.available !== undefined);

        return NextResponse.json({
          success: ok,
          gateway: 'CNpay',
          latencyMs: elapsed,
          status: res.status,
          message: ok 
            ? `🟢 CNpay ONLINE! Autenticada e Pronta para Vendas (${elapsed}ms)` 
            : `⚠️ CNpay respondeu com status ${res.status}: ${data.message || 'Verifique se as chaves da API estão corretas.'}`,
          details: data
        });
      } catch (err: any) {
        return NextResponse.json({
          success: false,
          gateway: 'CNpay',
          error: `Falha de conexão com CNpay: ${err.message}`,
        });
      }
    }

    // 3. TESTE VPAY (https://vpay-api.onrender.com/api)
    if (targetGateway === 'vpay') {
      const apiKey = credentials?.apiKey || credentials?.clientId || config.gateways.vpay.apiKey || config.gateways.vpay.clientId || 'vp_82c63bcb1e4e93243ea6643fcd7a4c90';
      const apiSecret = credentials?.apiSecret || credentials?.clientSecret || config.gateways.vpay.apiSecret || config.gateways.vpay.clientSecret || '15f4a8308c85551bcdd6d4ff5f0a6b5aad58bf090b06d633902980ad18e733a2';
      const baseUrl = credentials?.baseUrl || config.gateways.vpay.baseUrl || 'https://vpay-api.onrender.com/api';

      if (!apiKey || !apiSecret) {
        return NextResponse.json({
          success: false,
          gateway: 'Vpay',
          error: 'Credenciais Vpay não preenchidas. Insira o x-api-key e x-api-secret.',
        });
      }

      try {
        const saldoData = await getVPaySaldo(apiKey, apiSecret, baseUrl);
        const elapsed = Date.now() - startTime;
        const saldoDisp = saldoData?.saldo?.disponivel !== undefined ? ` (Saldo: R$ ${saldoData.saldo.disponivel})` : '';

        return NextResponse.json({
          success: true,
          gateway: 'Vpay',
          latencyMs: elapsed,
          status: 200,
          message: `🟢 Vpay ONLINE! Autenticada e Pronta para Vendas (${elapsed}ms)${saldoDisp}`,
          details: saldoData
        });
      } catch (err: any) {
        return NextResponse.json({
          success: false,
          gateway: 'Vpay',
          error: `Falha ao conectar com Vpay: ${err.message}`,
        });
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Gateway inválido. Os gateways autorizados são apenas: SigiloPay, CNpay e Vpay.',
    }, { status: 400 });

  } catch (err: any) {
    console.error('[API Gateway Test Error]:', err);
    return NextResponse.json({
      success: false,
      error: err.message || 'Erro inesperado ao testar gateway.',
    }, { status: 500 });
  }
}
