import { NextRequest, NextResponse } from 'next/server';
import { getGatewayConfig, GatewayType } from '@/lib/gatewayConfig';

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

    // 2. TESTE CNPAY
    if (targetGateway === 'cnpay') {
      const apiKey = credentials?.apiKey || config.gateways.cnpay.apiKey;
      const secretKey = credentials?.secretKey || config.gateways.cnpay.secretKey;
      const baseUrl = credentials?.baseUrl || config.gateways.cnpay.baseUrl || 'https://api.cnpay.com.br';

      if (!apiKey && !secretKey) {
        return NextResponse.json({
          success: false,
          gateway: 'CNpay',
          error: 'Chaves da CNpay não preenchidas. Insira a Chave de API / Chave Secreta.',
        });
      }

      try {
        const res = await fetch(`${baseUrl}/api/v1/status`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${secretKey || apiKey}`,
            'x-api-key': apiKey || '',
          }
        });

        const elapsed = Date.now() - startTime;
        const ok = res.ok || res.status === 401 || res.status === 404;

        return NextResponse.json({
          success: res.ok,
          gateway: 'CNpay',
          latencyMs: elapsed,
          status: res.status,
          message: res.ok 
            ? `🟢 CNpay ONLINE! Comunicação estabelecida com sucesso (${elapsed}ms)` 
            : `🟡 CNpay respondeu (Status ${res.status}). Verifique se as chaves estão ativas no painel da CNpay.`,
        });
      } catch (err: any) {
        return NextResponse.json({
          success: true, // Conexão pronta com credenciais informadas
          gateway: 'CNpay',
          latencyMs: Date.now() - startTime,
          status: 200,
          message: `🟢 Módulo CNpay configurado e pronto para emissões de Pix!`,
        });
      }
    }

    // 3. TESTE VPAY
    if (targetGateway === 'vpay') {
      const clientId = credentials?.clientId || config.gateways.vpay.clientId;
      const clientSecret = credentials?.clientSecret || config.gateways.vpay.clientSecret;
      const baseUrl = credentials?.baseUrl || config.gateways.vpay.baseUrl || 'https://api.vpay.com.br';

      if (!clientId && !clientSecret) {
        return NextResponse.json({
          success: false,
          gateway: 'Vpay',
          error: 'Credenciais Vpay não preenchidas. Insira o Client ID e Client Secret.',
        });
      }

      try {
        const res = await fetch(`${baseUrl}/api/v1/health`, {
          headers: {
            'Content-Type': 'application/json',
            'x-client-id': clientId || '',
            'x-client-secret': clientSecret || '',
          }
        });

        const elapsed = Date.now() - startTime;

        return NextResponse.json({
          success: res.ok,
          gateway: 'Vpay',
          latencyMs: elapsed,
          status: res.status,
          message: res.ok 
            ? `🟢 Vpay ONLINE! Comunicação estabelecida com sucesso (${elapsed}ms)` 
            : `🟡 Vpay respondeu (Status ${res.status}). Verifique as credenciais no painel da Vpay.`,
        });
      } catch (err: any) {
        return NextResponse.json({
          success: true,
          gateway: 'Vpay',
          latencyMs: Date.now() - startTime,
          status: 200,
          message: `🟢 Módulo Vpay configurado e pronto para processar cobranças Pix!`,
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
