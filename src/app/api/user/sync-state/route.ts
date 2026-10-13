import { NextResponse } from 'next/server';
import { getAccountCreationTimestamp, setAccountCreationTimestamp } from '@/lib/accountCreation';
import { loadVerificationToken, saveVerificationToken } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

// Cache global em memória no servidor Next.js para leitura ultrarrápida
const memorySyncStore = new Map<string, any>();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = (searchParams.get('email') || '').toLowerCase().trim();
  const action = (searchParams.get('action') || '').toLowerCase().trim();

  if (!email) {
    return NextResponse.json({ success: false, error: 'E-mail não fornecido' }, { status: 400 });
  }

  // Ação de reset explícita (somente quando explicitamente acionada)
  if (action === 'reset') {
    memorySyncStore.delete(email);
    await saveVerificationToken(`sync_state:${email}`, JSON.stringify({}));
    const res = NextResponse.json({ success: true, message: `Estado de ${email} redefinido com sucesso` });
    res.cookies.delete(`decola_sync_${email.replace(/[^a-z0-9]/g, '_')}`);
    res.cookies.delete(`decola_sync_usuario_decolashop_com`);
    return res;
  }

  let stored = memorySyncStore.get(email);
  if (!stored && (email === 'gerente@decolashop.com' || email === 'admin@decolashop.com')) {
    stored = memorySyncStore.get('gerente@decolashop.com') || memorySyncStore.get('admin@decolashop.com');
  }

  // Carrega do banco Supabase se não estiver em memória
  if (!stored) {
    try {
      const dbRaw = await loadVerificationToken(`sync_state:${email}`);
      if (dbRaw) {
        stored = JSON.parse(dbRaw);
      } else if (email === 'gerente@decolashop.com' || email === 'admin@decolashop.com') {
        const fallbackRaw = await loadVerificationToken('sync_state:gerente@decolashop.com') || 
                            await loadVerificationToken('sync_state:admin@decolashop.com');
        if (fallbackRaw) {
          stored = JSON.parse(fallbackRaw);
        }
      }
    } catch (err) {
      console.warn(`[SYNC-STATE GET] Erro ao ler sync_state:${email} do Supabase:`, err);
    }
  }

  if (!stored) {
    stored = {};
  }

  // Garante a data imutável de criação da conta (carência de 30 dias estável)
  let accountCreatedAt = stored.accountCreatedAt;
  if (!accountCreatedAt || isNaN(Number(accountCreatedAt)) || Number(accountCreatedAt) <= 0) {
    try {
      accountCreatedAt = await getAccountCreationTimestamp(email);
      if (accountCreatedAt) {
        stored.accountCreatedAt = accountCreatedAt;
        await setAccountCreationTimestamp(email, accountCreatedAt);
      }
    } catch {}
  }

  // Garante produtos divulgados salvos no banco para este usuário
  if (!stored.divulgados || !Array.isArray(stored.divulgados) || stored.divulgados.length === 0) {
    try {
      const dbDiv = await loadVerificationToken(`divulgados:${email}`);
      if (dbDiv) {
        const parsedDiv = JSON.parse(dbDiv);
        if (Array.isArray(parsedDiv) && parsedDiv.length > 0) {
          stored.divulgados = parsedDiv;
        }
      }
    } catch {}
  }

  if (email === 'usuario@decolashop.com' && stored.isAnticipated) {
    stored.isAnticipated = false;
  }

  memorySyncStore.set(email, stored);

  const hasData = stored && (typeof stored.vendasTotais === 'number' || stored.divulgados || stored.accountCreatedAt);

  const res = NextResponse.json({ 
    success: true, 
    data: hasData ? stored : null, 
    accountCreatedAt: stored?.accountCreatedAt || accountCreatedAt || null,
    source: hasData ? 'cloud_supabase' : 'none' 
  });

  if (email === 'usuario@decolashop.com') {
    res.cookies.delete(`decola_sync_usuario_decolashop_com`);
  }
  return res;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email || '').toLowerCase().trim();
    const action = (body.action || '').toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ success: false, error: 'E-mail não fornecido' }, { status: 400 });
    }

    if (action === 'reset' || body.reset === true) {
      memorySyncStore.delete(email);
      await saveVerificationToken(`sync_state:${email}`, JSON.stringify({}));
      const res = NextResponse.json({ success: true, message: `Conta ${email} redefinida com sucesso` });
      res.cookies.delete(`decola_sync_${email.replace(/[^a-z0-9]/g, '_')}`);
      res.cookies.delete(`decola_sync_usuario_decolashop_com`);
      return res;
    }

    const state = body.state;
    if (!state) {
      return NextResponse.json({ success: false, error: 'Dados insuficientes' }, { status: 400 });
    }

    // 1. Carrega dados existentes do cache de memória E do Supabase
    let existingFromDb: any = {};
    try {
      const dbRaw = await loadVerificationToken(`sync_state:${email}`);
      if (dbRaw) existingFromDb = JSON.parse(dbRaw);
    } catch {}

    const existingFromMem = memorySyncStore.get(email) || {};
    const existing = { ...existingFromDb, ...existingFromMem };

    // 2. Proteção contra sobrescrita acidental por novo dispositivo desidratado:
    // Se o dispositivo novo ainda não tinha localStorage e mandou 0, mas o banco já tem vendas acumuladas,
    // preservamos com prioridade os valores acumulados no banco!
    const isIncomingEmpty = (state.vendasTotais === 0 || state.vendasTotais === undefined) &&
                            (state.saldoDisponivel === 0 || state.saldoDisponivel === undefined) &&
                            (!state.recentSales || state.recentSales.length === 0);

    const hasExistingData = (typeof existing.vendasTotais === 'number' && existing.vendasTotais > 0) ||
                            (typeof existing.saldoDisponivel === 'number' && existing.saldoDisponivel > 0);

    const mergedVendasTotais = (isIncomingEmpty && hasExistingData)
      ? existing.vendasTotais
      : (typeof state.vendasTotais === 'number' ? state.vendasTotais : existing.vendasTotais);

    const mergedSaldoDisponivel = (isIncomingEmpty && hasExistingData)
      ? existing.saldoDisponivel
      : (typeof state.saldoDisponivel === 'number' ? state.saldoDisponivel : existing.saldoDisponivel);

    const mergedVisitas = (isIncomingEmpty && hasExistingData)
      ? existing.visitas
      : (typeof state.visitas === 'number' ? state.visitas : existing.visitas);

    const mergedCliques = (isIncomingEmpty && hasExistingData)
      ? existing.cliques
      : (typeof state.cliques === 'number' ? state.cliques : existing.cliques);

    const mergedPedidos = (isIncomingEmpty && hasExistingData)
      ? existing.pedidos
      : (typeof state.pedidos === 'number' ? state.pedidos : existing.pedidos);

    const mergedUnidades = (isIncomingEmpty && hasExistingData)
      ? existing.unidades
      : (typeof state.unidades === 'number' ? state.unidades : existing.unidades);

    const mergedRecentSales = (Array.isArray(state.recentSales) && state.recentSales.length > 0)
      ? state.recentSales
      : (existing.recentSales || []);

    const mergedHourlyData = (Array.isArray(state.hourlyData) && state.hourlyData.length > 0)
      ? state.hourlyData
      : (existing.hourlyData || undefined);

    const mergedDivulgados = (Array.isArray(state.divulgados) && state.divulgados.length > 0)
      ? state.divulgados
      : (existing.divulgados || undefined);

    // 3. Imutabilidade absoluta da data de criação da conta (carência):
    // Nunca substitui um timestamp existente por um mais recente! Mantém sempre Math.min
    let finalCreatedAt = existing.accountCreatedAt;
    if (typeof state.accountCreatedAt === 'number' && state.accountCreatedAt > 0) {
      finalCreatedAt = finalCreatedAt ? Math.min(finalCreatedAt, state.accountCreatedAt) : state.accountCreatedAt;
    }
    if (!finalCreatedAt) {
      finalCreatedAt = await getAccountCreationTimestamp(email);
    }
    if (finalCreatedAt) {
      await setAccountCreationTimestamp(email, finalCreatedAt);
    }

    const payload = {
      ...existing,
      ...state,
      vendasTotais: mergedVendasTotais,
      saldoDisponivel: mergedSaldoDisponivel,
      visitas: mergedVisitas,
      cliques: mergedCliques,
      pedidos: mergedPedidos,
      unidades: mergedUnidades,
      recentSales: mergedRecentSales,
      ...(mergedHourlyData ? { hourlyData: mergedHourlyData } : {}),
      ...(mergedDivulgados ? { divulgados: mergedDivulgados } : {}),
      accountCreatedAt: finalCreatedAt || undefined,
      syncedAt: Date.now(),
    };

    if (email === 'usuario@decolashop.com' && state.isAnticipated === false) {
      payload.isAnticipated = false;
    }

    // 4. Salva no cache de memória do servidor
    memorySyncStore.set(email, payload);

    // 5. Salva no banco Supabase para persistência 100% entre dispositivos
    await saveVerificationToken(`sync_state:${email}`, JSON.stringify(payload));

    if (mergedDivulgados && Array.isArray(mergedDivulgados)) {
      await saveVerificationToken(`divulgados:${email}`, JSON.stringify(mergedDivulgados));
    }

    // Se for gerente ou admin, sincroniza ambos no banco e na memória
    if (email === 'gerente@decolashop.com' || email === 'admin@decolashop.com') {
      memorySyncStore.set('gerente@decolashop.com', payload);
      memorySyncStore.set('admin@decolashop.com', payload);
      await saveVerificationToken('sync_state:gerente@decolashop.com', JSON.stringify(payload));
      await saveVerificationToken('sync_state:admin@decolashop.com', JSON.stringify(payload));
    }

    const res = NextResponse.json({ 
      success: true, 
      message: 'Estado sincronizado com sucesso no Supabase',
      data: payload 
    });

    // Salva também em cookie seguro de longa duração (1 ano)
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
    console.error('[SYNC-STATE POST] Erro:', err);
    return NextResponse.json({ success: false, error: 'Erro ao salvar sincronização' }, { status: 500 });
  }
}

