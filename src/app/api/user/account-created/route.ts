import { NextResponse } from 'next/server';
import { getAccountCreationTimestamp, setAccountCreationTimestamp } from '@/lib/accountCreation';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = (searchParams.get('email') || '').toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ success: false, error: 'E-mail não fornecido' }, { status: 400 });
    }

    const createdAt = await getAccountCreationTimestamp(email);

    if (createdAt) {
      const now = Date.now();
      const elapsedMs = Math.max(0, now - createdAt);
      const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
      const daysRemaining = Math.max(0, 30 - elapsedDays);

      return NextResponse.json({
        success: true,
        accountCreatedAt: createdAt,
        elapsedDays,
        daysRemaining,
        isCarenciaCompleted: daysRemaining === 0
      });
    }

    return NextResponse.json({
      success: true,
      accountCreatedAt: null,
      message: 'Data de criação não encontrada no servidor'
    });
  } catch (error: any) {
    console.error('[API account-created] Erro:', error);
    return NextResponse.json({ success: false, error: 'Erro interno ao consultar data de criação' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email || '').toLowerCase().trim();
    const rawTs = Number(body.accountCreatedAt || body.createdAt);

    if (!email) {
      return NextResponse.json({ success: false, error: 'E-mail não fornecido' }, { status: 400 });
    }

    if (!rawTs || isNaN(rawTs) || rawTs <= 0) {
      return NextResponse.json({ success: false, error: 'Data de criação inválida' }, { status: 400 });
    }

    const finalTs = await setAccountCreationTimestamp(email, rawTs);
    const now = Date.now();
    const elapsedMs = Math.max(0, now - finalTs);
    const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, 30 - elapsedDays);

    return NextResponse.json({
      success: true,
      accountCreatedAt: finalTs,
      elapsedDays,
      daysRemaining,
      isCarenciaCompleted: daysRemaining === 0
    });
  } catch (error: any) {
    console.error('[API account-created POST] Erro:', error);
    return NextResponse.json({ success: false, error: 'Erro interno ao salvar data de criação' }, { status: 500 });
  }
}

