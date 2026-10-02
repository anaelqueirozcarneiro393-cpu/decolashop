import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Cache global em memória no servidor Next.js para sincronização instantânea entre abas e dispositivos
const memorySyncStore = new Map<string, any>();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = (searchParams.get('email') || '').toLowerCase().trim();

  if (!email) {
    return NextResponse.json({ success: false, error: 'E-mail não fornecido' }, { status: 400 });
  }

  let stored = memorySyncStore.get(email);
  if (!stored && (email === 'gerente@decolashop.com' || email === 'admin@decolashop.com')) {
    stored = memorySyncStore.get('gerente@decolashop.com') || memorySyncStore.get('admin@decolashop.com');
  }

  if (stored) {
    return NextResponse.json({ success: true, data: stored, source: 'cloud' });
  }

  return NextResponse.json({ success: true, data: null, source: 'none' });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email || '').toLowerCase().trim();
    const state = body.state;

    if (!email || !state) {
      return NextResponse.json({ success: false, error: 'Dados insuficientes' }, { status: 400 });
    }

    const existing = memorySyncStore.get(email) || {};
    const payload = {
      ...existing,
      ...state,
      syncedAt: Date.now(),
    };

    // Salva no cache do servidor
    memorySyncStore.set(email, payload);
    // Se for gerente ou admin, sincroniza ambos
    if (email === 'gerente@decolashop.com' || email === 'admin@decolashop.com') {
      const existingGerente = memorySyncStore.get('gerente@decolashop.com') || {};
      const existingAdmin = memorySyncStore.get('admin@decolashop.com') || {};
      memorySyncStore.set('gerente@decolashop.com', { ...existingGerente, ...payload });
      memorySyncStore.set('admin@decolashop.com', { ...existingAdmin, ...payload });
    }

    const res = NextResponse.json({ success: true, message: 'Estado sincronizado com sucesso' });

    // Salva também em cookie seguro de longa duração (1 ano) para persistir trocas locais
    if (payload.saldoDisponivel !== undefined) {
      res.cookies.set(`decola_sync_${email.replace(/[^a-z0-9]/g, '_')}`, JSON.stringify({
        vendasTotais: payload.vendasTotais,
        saldoDisponivel: payload.saldoDisponivel,
        isAnticipated: payload.isAnticipated,
        lastActiveTimestamp: Date.now()
      }), {
        maxAge: 31536000, // 1 ano
        path: '/',
        sameSite: 'lax',
      });
    }

    return res;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Erro ao salvar sincronização' }, { status: 500 });
  }
}
