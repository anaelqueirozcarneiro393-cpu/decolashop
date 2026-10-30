import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import {
  Affiliate,
  AffiliateSale,
  PendingPixTransaction,
  dbGetAffiliates,
  dbSaveAffiliate,
  dbGetAffiliateByCode,
  dbDeleteAffiliate,
  dbGetSales,
  dbRecordSale,
  dbSavePendingPix,
  dbGetPendingPix,
  dbGetPendingPixList,
  dbBindLead,
  dbGetLeadAffiliate,
  dbMarkCommissionPaid,
  dbReassignSale,
  dbRecalculateAllAffiliatesMetrics,
  dbRepriceUnpaidSales,
  dbUndeleteAffiliate,
  resolveAffiliateCode,
} from '@/lib/affiliateDb';

export const dynamic = 'force-dynamic';

export type ServerAffiliate = Affiliate;
export type ServerAffiliateSale = AffiliateSale;

// Compatibility exports
export const recordAffiliateSaleOnServer = dbRecordSale;
export const getPendingTransactionAsync = dbGetPendingPix;
export const getPendingTransaction = (id: string) => null;
export const getLeadAffiliate = dbGetLeadAffiliate;
export const bindLeadToAffiliate = dbBindLead;

const MOCK_OR_INTERNAL_EMAILS = new Set([
  'carlos.souza@decolashop.com',
  'carlos@decolashop.com',
  'admin@decolashop.com',
  'gerente@decolashop.com',
  'usuario@decolashop.com',
  'digital405060@gmail.com',
  'aleghartz@gmail.com',
  'emanuelpixel61@gmail.com',
  'higorfernandez151@outlook.com',
  'joaoempresa54@gmail.com',
  'henrique.vedia@gmail.com',
  'bia.santana.andion@gmail.com',
  'viniciusseabra2512@gmail.com',
  'io23457636@gmail.com',
  'lucas27amorim@gmail.com',
  'ceramoscarloseduardo6@gmail.com',
  'sjanayna439@gmail.com',
  'jucielyj9@gmail.com'
]);

function isRealCustomer(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  if (clean.endsWith('@decolashop.com')) return false;
  if (MOCK_OR_INTERNAL_EMAILS.has(clean)) return false;
  return true;
}

export async function GET() {
  try {
    const [rawAffiliates, rawSales, pendingTransactions] = await Promise.all([
      dbGetAffiliates(),
      dbGetSales(),
      dbGetPendingPixList()
    ]);

    const MOCK_OR_GHOST_SALE_IDS = new Set([
      'DEC-27270-VIP',
      'DEC-31035-VIP',
      'DEC-43900-VIP',
      'DEC-JUCIELY-PIX',
      'sale_af_lucas_amorim_vip',
      'sale_af_carlos_eduardo_vip',
      'sale_af_janayna_vip',
      'sale_af_juciely_justino_pix',
      'sale_af_1791505170601_eeq2',
      'sale_af_1791491585193_3kmc',
      'sale_af_1791490399560_4tlx',
      'sale_af_1791493534767_u8wy'
    ]);

    // Filtrar apenas vendas 100% reais confirmadas da plataforma
    const sales = (rawSales || []).filter(s => {
      if (!s || !s.id) return false;
      if (MOCK_OR_GHOST_SALE_IDS.has(s.id)) return false;
      if (s.transactionId && MOCK_OR_GHOST_SALE_IDS.has(s.transactionId)) return false;
      if (s.transactionId && s.transactionId.startsWith('DEC-')) return false;
      const em = (s.customerEmail || '').toLowerCase().trim();
      const nm = (s.customerName || '').toLowerCase().trim();
      if (MOCK_OR_INTERNAL_EMAILS.has(em)) return false;
      if (em.includes('aleghartz') || nm.includes('alessandra hartz')) return false;
      if ((s.plan as any) === 'taxa_antecipacao') return false;
      return true;
    });

    // Recalcular métricas de cada parceiro estritamente a partir das vendas reais confirmadas
    const affiliates = (rawAffiliates || [])
      .filter(a => a && a.code && a.code !== 'kaio' && !a.name?.includes('(alias)') && !['af_pedro', 'af_lucas', 'af_carla'].includes(a.id) && !a.name?.includes('Pedro Alcântara'))
      .map(aff => {
        const isKaio = aff.code?.toLowerCase() === 'rwjncwiofw';
        const commissionPercent = isKaio ? 100 : (aff.commissionPercent ?? 50);
        const affSales = sales.filter(s => {
          const c = resolveAffiliateCode(s.affiliateCode || '').toLowerCase();
          return c === aff.code.toLowerCase();
        });
        return {
          ...aff,
          commissionPercent,
          totalSalesCount: affSales.length,
          totalRevenue: Number(affSales.reduce((acc, s) => acc + (s.totalAmount || 0), 0).toFixed(2)),
          pendingCommission: Number(affSales.filter(s => s.status !== 'paid_to_affiliate').reduce((acc, s) => acc + (s.commissionAmount || 0), 0).toFixed(2)),
          paidCommission: Number(affSales.filter(s => s.status === 'paid_to_affiliate').reduce((acc, s) => acc + (s.commissionAmount || 0), 0).toFixed(2)),
        };
      });

    // Load registered users from database, strictly excluding internal / demo accounts
    let paidUsers: any[] = [];
    try {
      const supabase = getSupabaseAdmin('next_auth');
      const { data: users, error: usersErr } = await supabase
        .from('users')
        .select('id, name, email, plan, plan_expires_at')
        .in('plan', ['monthly', 'lifetime'])
        .order('id', { ascending: false });

      if (usersErr) console.error('[API AFILIADOS] Erro ao carregar paidUsers:', usersErr);

      if (users) {
        paidUsers = users
          .filter(u => isRealCustomer(u.email))
          .map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            plan: u.plan,
            planExpiresAt: u.plan_expires_at,
            isAttributed: sales.some(s => s.customerEmail.toLowerCase() === u.email.toLowerCase())
          }));
      }
    } catch (uErr) {
      console.warn('[API AFILIADOS] Erro ao carregar paidUsers:', uErr);
    }

    return NextResponse.json({
      success: true,
      affiliates,
      sales,
      pendingTransactions,
      paidUsers
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err: any) {
    console.error('[API AFILIADOS] Erro em GET /api/affiliates:', err);
    return NextResponse.json({
      success: false,
      error: err.message || 'Erro ao carregar afiliados do banco de dados',
      affiliates: [],
      sales: [],
      pendingTransactions: [],
      paidUsers: []
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = body.action;

    // 1. Criar novo afiliado
    if (action === 'create') {
      const data = body.affiliate;
      const cleanCode = (data.code || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');

      if (!cleanCode) {
        return NextResponse.json({ success: false, error: 'Código de afiliado inválido' }, { status: 400 });
      }

      const existing = await dbGetAffiliateByCode(cleanCode);
      if (existing) {
        return NextResponse.json({ success: false, error: 'Código de afiliado já está em uso' }, { status: 400 });
      }

      const newAffiliate: Affiliate = {
        id: data.id || `af_${cleanCode}_${Date.now().toString(36)}`,
        name: (data.name || '').trim(),
        code: cleanCode,
        email: (data.email || '').trim().toLowerCase(),
        phone: data.phone?.trim() || '',
        pixKey: (data.pixKey || '').trim(),
        pixKeyType: data.pixKeyType || 'cpf',
        commissionPercent: typeof data.commissionPercent === 'number' ? Math.max(0, Math.min(100, data.commissionPercent)) : 50,
        active: true,
        createdAt: Date.now(),
        totalRevenue: 0,
        totalSalesCount: 0,
        pendingCommission: 0,
        paidCommission: 0,
      };

      await dbUndeleteAffiliate(cleanCode);
      await dbSaveAffiliate(newAffiliate);
      return NextResponse.json({ success: true, affiliate: newAffiliate });
    }

    // 2. Atualizar afiliado existente
    if (action === 'update') {
      const { id, updates } = body;
      const affiliates = await dbGetAffiliates();
      const aff = affiliates.find(a => a.id === id || a.code.toLowerCase() === (updates?.code || '').toLowerCase());
      if (!aff) {
        return NextResponse.json({ success: false, error: 'Afiliado não encontrado' }, { status: 404 });
      }

      const updated: Affiliate = { ...aff, ...updates };
      await dbSaveAffiliate(updated);

      // Mudou a %: recalcula a comissão das vendas que ainda não foram pagas
      let repricedSales = 0;
      // (sempre que a % vem no pedido: corrige também vendas de mudanças feitas antes desta correção)
      if (typeof updates?.commissionPercent === 'number') {
        const pct = updated.code.toLowerCase() === 'rwjncwiofw' ? 100 : updated.commissionPercent;
        repricedSales = await dbRepriceUnpaidSales(updated.code, pct);
      }
      return NextResponse.json({ success: true, affiliate: updated, repricedSales });
    }

    // 3. Deletar afiliado
    if (action === 'delete') {
      const { id } = body;
      const ok = await dbDeleteAffiliate(id);
      return NextResponse.json({ success: ok }, { status: ok ? 200 : 500 });
    }

    // 4. Marcar repasse de comissão como pago
    if (action === 'pay') {
      const { affiliateId } = body;
      await dbMarkCommissionPaid(affiliateId);
      const affiliates = await dbGetAffiliates();
      const aff = affiliates.find(a => a.id === affiliateId);
      return NextResponse.json({ success: true, affiliate: aff });
    }

    // 5. Gravar venda de afiliado
    if (action === 'record_sale') {
      const sale = await dbRecordSale(body.sale);
      return NextResponse.json({ success: true, sale });
    }

    // 6. Atribuição / Reatribuição de venda de usuário para afiliado ou conversão em Venda Direta
    if (action === 'reassign_sale' || action === 'attribute_past_user') {
      const { saleId, customerEmail, affiliateCode, plan, totalAmount, customerName } = body;
      if (!customerEmail) {
        return NextResponse.json({ success: false, error: 'E-mail do cliente é obrigatório.' }, { status: 400 });
      }

      const result = await dbReassignSale({
        saleId,
        customerEmail,
        newAffiliateCode: affiliateCode,
        plan,
        totalAmount,
        customerName
      });

      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    // 6.1 Recalcular métricas de todos os afiliados no Supabase
    if (action === 'recalculate_metrics') {
      await dbRecalculateAllAffiliatesMetrics();
      const [affiliates, sales] = await Promise.all([
        dbGetAffiliates(),
        dbGetSales()
      ]);
      return NextResponse.json({ success: true, affiliates, sales });
    }

    // 7. Sincronização segura (nunca sobrescreve com vazio)
    if (action === 'sync_all') {
      if (Array.isArray(body.affiliates) && body.affiliates.length > 0) {
        const currentAffiliates = await dbGetAffiliates();
        const existingCodes = new Set(currentAffiliates.map(a => a.code.toLowerCase()));
        for (const aff of body.affiliates) {
          if (aff && aff.code && !existingCodes.has(aff.code.toLowerCase())) {
            await dbSaveAffiliate(aff);
          }
        }
      }

      if (Array.isArray(body.sales) && body.sales.length > 0) {
        const currentSales = await dbGetSales();
        const existingIds = new Set(currentSales.map(s => s.id));
        for (const s of body.sales) {
          if (s && s.id && !existingIds.has(s.id) && s.affiliateCode && s.customerEmail !== 'aleghartz@gmail.com') {
            await dbRecordSale(s);
          }
        }
      }

      const [affiliates, sales] = await Promise.all([
        dbGetAffiliates(),
        dbGetSales()
      ]);

      return NextResponse.json({ success: true, affiliates, sales });
    }

    // 8. Amarrar lead a afiliado
    if (action === 'bind_lead') {
      const { email, affiliateCode } = body;
      if (email && affiliateCode) {
        await dbBindLead(email, affiliateCode);
        return NextResponse.json({ success: true, message: 'Lead vinculado ao afiliado com sucesso no banco de dados' });
      }
      return NextResponse.json({ success: false, error: 'Email ou código ausente' }, { status: 400 });
    }

    // 9. Buscar afiliado de lead
    if (action === 'get_lead') {
      const { email } = body;
      const code = await dbGetLeadAffiliate(email);
      return NextResponse.json({ success: true, affiliateCode: code });
    }

    return NextResponse.json({ success: false, error: 'Ação desconhecida' }, { status: 400 });
  } catch (err: any) {
    console.error('[API AFILIADOS] Erro em POST /api/affiliates:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
