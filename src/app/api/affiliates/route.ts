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

export async function GET() {
  try {
    const [affiliates, sales, pendingTransactions] = await Promise.all([
      dbGetAffiliates(),
      dbGetSales(),
      dbGetPendingPixList()
    ]);

    // Load registered users from database to assist manager with attribution visibility
    let paidUsers: any[] = [];
    try {
      const supabase = getSupabaseAdmin('next_auth');
      const { data: users } = await supabase
        .from('users')
        .select('id, name, email, plan, plan_expires_at')
        .in('plan', ['monthly', 'lifetime'])
        .order('id', { ascending: false });

      if (users) {
        paidUsers = users.map(u => ({
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
      return NextResponse.json({ success: true, affiliate: updated });
    }

    // 3. Deletar afiliado
    if (action === 'delete') {
      const { id } = body;
      await dbDeleteAffiliate(id);
      return NextResponse.json({ success: true });
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

    // 6. Atribuição retroativa de usuário existente para um afiliado
    if (action === 'attribute_past_user') {
      const { customerEmail, affiliateCode, plan, totalAmount, customerName } = body;
      if (!customerEmail || !affiliateCode) {
        return NextResponse.json({ success: false, error: 'E-mail do cliente e código do afiliado são obrigatórios.' }, { status: 400 });
      }

      const userPlan = (plan === 'monthly' ? 'monthly' : 'lifetime') as 'monthly' | 'lifetime';
      const planBase = userPlan === 'monthly' ? 89.90 : 179.90;
      const numTotal = Number(totalAmount) || planBase;

      const sale = await dbRecordSale({
        affiliateCode,
        plan: userPlan,
        planPrice: planBase,
        bumps: [],
        bumpPrices: Math.max(0, numTotal - planBase),
        totalAmount: numTotal,
        customerName: customerName || customerEmail.split('@')[0],
        customerEmail: customerEmail.trim().toLowerCase(),
      });

      return NextResponse.json({ success: true, sale, message: 'Venda atribuída com sucesso ao afiliado no Supabase!' });
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
