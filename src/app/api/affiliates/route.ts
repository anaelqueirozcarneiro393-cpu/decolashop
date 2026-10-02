import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export interface ServerAffiliate {
  id: string;
  name: string;
  code: string;
  email: string;
  phone?: string;
  pixKey: string;
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  commissionPercent: number;
  active: boolean;
  createdAt: number;
  totalRevenue: number;
  totalSalesCount: number;
  pendingCommission: number;
  paidCommission: number;
  lastPaidAt?: number;
}

export interface ServerAffiliateSale {
  id: string;
  affiliateId: string;
  affiliateCode: string;
  affiliateName: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerCpf?: string;
  plan: 'monthly' | 'lifetime';
  planPrice: number;
  bumps: string[];
  bumpPrices: number;
  totalAmount: number;
  commissionPercent: number;
  commissionAmount: number;
  isSelfPurchase: boolean;
  status: 'confirmed' | 'paid_to_affiliate';
  createdAt: number;
  transactionId?: string;
}

interface AffiliatesStore {
  affiliates: ServerAffiliate[];
  sales: ServerAffiliateSale[];
}

const DATA_FILE = path.join(process.cwd(), '.affiliates_data.json');

// In-memory cache
let memoryStore: AffiliatesStore = {
  affiliates: [],
  sales: [],
};

export function loadStore(): AffiliatesStore {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.affiliates) && Array.isArray(parsed.sales)) {
        memoryStore = parsed;
        return memoryStore;
      }
    }
  } catch (e) {
    console.error('Erro ao ler .affiliates_data.json:', e);
  }
  return memoryStore;
}

export function saveStore(store: AffiliatesStore) {
  memoryStore = store;
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (e) {
    console.error('Erro ao salvar .affiliates_data.json:', e);
  }
}

export function recordAffiliateSaleOnServer(params: {
  affiliateCode: string;
  plan: 'monthly' | 'lifetime';
  planPrice: number;
  bumps?: string[];
  bumpPrices?: number;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerCpf?: string;
  transactionId?: string;
}): ServerAffiliateSale | null {
  const store = loadStore();
  const cleanCode = (params.affiliateCode || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
  if (!cleanCode) return null;

  const affiliate = store.affiliates.find(
    a => a.code.toLowerCase() === cleanCode && a.active !== false
  );

  if (!affiliate) {
    console.warn(`[AFILIADOS SERVER] Código "${cleanCode}" não cadastrado ou inativo.`);
    return null;
  }

  // Prevent duplicate sales by transactionId
  if (params.transactionId) {
    const existing = store.sales.find(s => s.transactionId === params.transactionId);
    if (existing) {
      return existing;
    }
  }

  const cleanCustomerEmail = (params.customerEmail || '').toLowerCase().trim();
  const isSelfPurchase = cleanCustomerEmail === affiliate.email.toLowerCase().trim();
  const commissionPercent = affiliate.commissionPercent || 50;
  const commissionAmount = Number(((params.totalAmount * commissionPercent) / 100).toFixed(2));

  const newSale: ServerAffiliateSale = {
    id: `sale_af_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    affiliateId: affiliate.id,
    affiliateCode: affiliate.code,
    affiliateName: affiliate.name,
    customerName: params.customerName || 'Cliente',
    customerEmail: cleanCustomerEmail,
    customerPhone: params.customerPhone,
    customerCpf: params.customerCpf,
    plan: params.plan,
    planPrice: params.planPrice,
    bumps: params.bumps || [],
    bumpPrices: params.bumpPrices || 0,
    totalAmount: params.totalAmount,
    commissionPercent,
    commissionAmount,
    isSelfPurchase,
    status: 'confirmed',
    createdAt: Date.now(),
    transactionId: params.transactionId,
  };

  affiliate.totalRevenue = Number(((affiliate.totalRevenue || 0) + params.totalAmount).toFixed(2));
  affiliate.totalSalesCount = (affiliate.totalSalesCount || 0) + 1;
  affiliate.pendingCommission = Number(((affiliate.pendingCommission || 0) + commissionAmount).toFixed(2));

  store.sales.unshift(newSale);
  saveStore(store);

  console.log(`[AFILIADOS SERVER] Venda registrada para "${affiliate.name}" (${cleanCode}) - Total: R$ ${params.totalAmount} - Comissão: R$ ${commissionAmount}`);
  return newSale;
}

export async function GET() {
  const store = loadStore();
  return NextResponse.json({
    success: true,
    affiliates: store.affiliates,
    sales: store.sales,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = body.action;
    const store = loadStore();

    if (action === 'create') {
      const data = body.affiliate;
      const cleanCode = (data.code || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');

      if (!cleanCode) {
        return NextResponse.json({ success: false, error: 'Código de afiliado inválido' }, { status: 400 });
      }

      const existingIndex = store.affiliates.findIndex(a => a.code.toLowerCase() === cleanCode);
      if (existingIndex !== -1) {
        return NextResponse.json({ success: false, error: 'Código já em uso' }, { status: 400 });
      }

      const newAffiliate: ServerAffiliate = {
        id: data.id || `af_${cleanCode}_${Date.now().toString(36)}`,
        name: data.name.trim(),
        code: cleanCode,
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || '',
        pixKey: data.pixKey.trim(),
        pixKeyType: data.pixKeyType || 'cpf',
        commissionPercent: typeof data.commissionPercent === 'number' ? Math.max(0, Math.min(100, data.commissionPercent)) : 50,
        active: true,
        createdAt: Date.now(),
        totalRevenue: 0,
        totalSalesCount: 0,
        pendingCommission: 0,
        paidCommission: 0,
      };

      store.affiliates.unshift(newAffiliate);
      saveStore(store);
      return NextResponse.json({ success: true, affiliate: newAffiliate });
    }

    if (action === 'update') {
      const { id, updates } = body;
      const idx = store.affiliates.findIndex(a => a.id === id);
      if (idx === -1) {
        return NextResponse.json({ success: false, error: 'Afiliado não encontrado' }, { status: 404 });
      }

      store.affiliates[idx] = { ...store.affiliates[idx], ...updates };
      saveStore(store);
      return NextResponse.json({ success: true, affiliate: store.affiliates[idx] });
    }

    if (action === 'delete') {
      const { id } = body;
      store.affiliates = store.affiliates.filter(a => a.id !== id);
      saveStore(store);
      return NextResponse.json({ success: true });
    }

    if (action === 'pay') {
      const { affiliateId } = body;
      const aff = store.affiliates.find(a => a.id === affiliateId);
      if (aff && aff.pendingCommission > 0) {
        const amount = aff.pendingCommission;
        aff.paidCommission = Number(((aff.paidCommission || 0) + amount).toFixed(2));
        aff.pendingCommission = 0;
        aff.lastPaidAt = Date.now();

        store.sales.forEach(s => {
          if (s.affiliateId === affiliateId && s.status === 'confirmed') {
            s.status = 'paid_to_affiliate';
          }
        });

        saveStore(store);
      }
      return NextResponse.json({ success: true, affiliate: aff });
    }

    if (action === 'record_sale') {
      const sale = recordAffiliateSaleOnServer(body.sale);
      return NextResponse.json({ success: true, sale });
    }

    if (action === 'sync_all') {
      // Sync from admin interface
      if (Array.isArray(body.affiliates)) {
        // Merge affiliates preserving metrics
        const existingCodes = new Set(store.affiliates.map(a => a.code.toLowerCase()));
        for (const aff of body.affiliates) {
          if (!existingCodes.has(aff.code.toLowerCase())) {
            store.affiliates.push(aff);
          }
        }
      }
      if (Array.isArray(body.sales)) {
        const existingSaleIds = new Set(store.sales.map(s => s.id));
        for (const s of body.sales) {
          if (!existingSaleIds.has(s.id)) {
            store.sales.push(s);
          }
        }
      }
      saveStore(store);
      return NextResponse.json({ success: true, store });
    }

    return NextResponse.json({ success: false, error: 'Ação desconhecida' }, { status: 400 });
  } catch (err: any) {
    console.error('Erro em /api/affiliates:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
