import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getPaidWithdrawalFeesMetrics, recordPaidWithdrawalFee } from '@/lib/withdrawalFeesStore';

export const dynamic = 'force-dynamic';

function isAuthorizedManager(email?: string | null, role?: string | null): boolean {
  if (!email) return false;
  const cleanEmail = email.toLowerCase().trim();
  return (
    cleanEmail === 'gerente@decolashop.com' ||
    cleanEmail === 'admin@decolashop.com' ||
    cleanEmail.startsWith('gerente@') ||
    cleanEmail.includes('gerente') ||
    cleanEmail.includes('admin') ||
    role === 'gerente' ||
    role === 'admin'
  );
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    const sessionEmail = session?.user?.email;
    const sessionRole = (session?.user as any)?.role;

    // Check query param fallback if authenticated via client
    const { searchParams } = new URL(req.url);
    const queryEmail = searchParams.get('email');

    const effectiveEmail = sessionEmail || queryEmail;
    if (!effectiveEmail || !isAuthorizedManager(effectiveEmail, sessionRole)) {
      return NextResponse.json(
        { success: false, error: 'Acesso restrito exclusivamente à conta de Gerente.' },
        { status: 403 }
      );
    }

    const data = await getPaidWithdrawalFeesMetrics();
    return NextResponse.json({
      success: true,
      totalCount: data.totalCount,
      totalAmount: data.totalAmount,
      fees: data.fees
    });
  } catch (error: any) {
    console.error('[API GERENTE TAXAS SAQUE] Erro ao carregar métricas:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar dados de taxas de saque.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const sessionEmail = session?.user?.email;
    const sessionRole = (session?.user as any)?.role;

    const body = await req.json();
    const effectiveEmail = sessionEmail || body.managerEmail;

    if (!effectiveEmail || !isAuthorizedManager(effectiveEmail, sessionRole)) {
      return NextResponse.json(
        { success: false, error: 'Acesso não autorizado.' },
        { status: 403 }
      );
    }

    if (body.action === 'record') {
      const recorded = await recordPaidWithdrawalFee({
        customerEmail: body.customerEmail,
        customerName: body.customerName,
        amount: Number(body.amount) || 150,
        transactionId: body.transactionId,
        paidAt: body.paidAt || Date.now()
      });
      return NextResponse.json({ success: true, fee: recorded });
    }

    return NextResponse.json({ success: false, error: 'Ação não reconhecida.' }, { status: 400 });
  } catch (error: any) {
    console.error('[API GERENTE TAXAS SAQUE POST]:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao processar requisição.' },
      { status: 500 }
    );
  }
}
