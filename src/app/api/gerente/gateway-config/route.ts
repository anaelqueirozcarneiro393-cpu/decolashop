import { NextRequest, NextResponse } from 'next/server';
import { getGatewayConfig, saveGatewayConfig, GatewayType } from '@/lib/gatewayConfig';

function isGerenteOrAdmin(req: NextRequest, emailParam?: string): boolean {
  const email = (emailParam || req.nextUrl.searchParams.get('email') || '').toLowerCase().trim();
  
  if (
    email === 'gerente@decolashop.com' ||
    email === 'admin@decolashop.com' ||
    email.startsWith('gerente@') ||
    email.startsWith('admin@') ||
    email.includes('gerente') ||
    email.includes('admin')
  ) {
    return true;
  }

  // Permite também por cabeçalho interno seguro se houver
  const authHeader = req.headers.get('x-decola-role');
  if (authHeader === 'gerente' || authHeader === 'admin') {
    return true;
  }

  return false;
}

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get('email') || '';
    
    if (!isGerenteOrAdmin(req, email)) {
      return NextResponse.json(
        { success: false, error: 'Acesso restrito exclusivamente à conta de Gerente.' },
        { status: 403 }
      );
    }

    const config = await getGatewayConfig();

    return NextResponse.json({
      success: true,
      config,
    });
  } catch (err: any) {
    console.error('[API Gateway Config GET Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erro ao carregar configurações de gateway.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, activeGateway, smartFailover, fallbackGateway, gateways } = body;

    if (!isGerenteOrAdmin(req, email)) {
      return NextResponse.json(
        { success: false, error: 'Acesso restrito exclusivamente à conta de Gerente.' },
        { status: 403 }
      );
    }

    const validGateways: GatewayType[] = ['sigilopay', 'mercadopago', 'asaas', 'efipay', 'pix_direto'];
    if (activeGateway && !validGateways.includes(activeGateway)) {
      return NextResponse.json(
        { success: false, error: 'Gateway selecionado é inválido.' },
        { status: 400 }
      );
    }

    const updated = await saveGatewayConfig(
      {
        ...(activeGateway ? { activeGateway } : {}),
        ...(typeof smartFailover === 'boolean' ? { smartFailover } : {}),
        ...(fallbackGateway ? { fallbackGateway } : {}),
        ...(gateways ? { gateways } : {}),
      },
      email || 'gerente@decolashop.com'
    );

    return NextResponse.json({
      success: true,
      message: `Gateway ativo atualizado com sucesso para [${updated.activeGateway}].`,
      config: updated,
    });
  } catch (err: any) {
    console.error('[API Gateway Config POST Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erro ao atualizar gateway.' },
      { status: 500 }
    );
  }
}
