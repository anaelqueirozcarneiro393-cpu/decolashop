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

interface PendingTransaction {
  transactionId: string;
  clientIdentifier?: string;
  email: string;
  name?: string;
  phone?: string;
  cpf?: string;
  plan: string;
  planPrice?: number;
  bumps?: string[];
  bumpPrices?: number;
  total: number;
  affiliateCode?: string | null;
  createdAt: number;
}

interface AffiliatesStore {
  affiliates: ServerAffiliate[];
  sales: ServerAffiliateSale[];
  pendingTransactions?: PendingTransaction[];
}

// Support multiple storage locations (process.cwd() for local dev, /tmp for Vercel/AWS Lambda serverless)
function getStoragePaths(): string[] {
  const paths = [path.join(process.cwd(), '.affiliates_data.json')];
  try {
    const tmpPath = path.join('/tmp', '.affiliates_data.json');
    if (!paths.includes(tmpPath)) {
      paths.push(tmpPath);
    }
  } catch {}
  return paths;
}

import { createClient } from '@supabase/supabase-js';

const SUPABASE_STORE_KEY = 'system:affiliates_store_v1';

function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = 
    process.env.SUPABASE_SERVICE_ROLE_KEY || 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey, { db: { schema: 'next_auth' } });
}

// In-memory cache
let memoryStore: AffiliatesStore = {
  affiliates: [],
  sales: [],
  pendingTransactions: [],
};

export function saveLocalStore(store: AffiliatesStore) {
  memoryStore = store;
  const paths = getStoragePaths();
  for (const filePath of paths) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(store, null, 2), 'utf-8');
    } catch (e) {
      // In serverless environments (like Vercel), process.cwd() may be read-only, but /tmp will succeed
    }
  }
}

export function loadStore(): AffiliatesStore {
  const paths = getStoragePaths();
  for (const filePath of paths) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.affiliates) && Array.isArray(parsed.sales)) {
          if (parsed.affiliates.length >= memoryStore.affiliates.length) {
            memoryStore.affiliates = parsed.affiliates;
          }
          if (parsed.sales.length >= memoryStore.sales.length) {
            memoryStore.sales = parsed.sales;
          }
          if (Array.isArray(parsed.pendingTransactions)) {
            memoryStore.pendingTransactions = parsed.pendingTransactions;
          }
        }
      }
    } catch (e) {
      // Ignore read errors
    }
  }
  return memoryStore;
}

export async function loadStoreFromSupabase(): Promise<AffiliatesStore> {
  try {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('verification_tokens')
        .select('token')
        .eq('identifier', SUPABASE_STORE_KEY)
        .maybeSingle();

      if (data?.token) {
        const parsed = JSON.parse(data.token);
        if (parsed && Array.isArray(parsed.affiliates) && Array.isArray(parsed.sales)) {
          memoryStore = {
            affiliates: parsed.affiliates,
            sales: parsed.sales,
            pendingTransactions: parsed.pendingTransactions || []
          };
          saveLocalStore(memoryStore);
          return memoryStore;
        }
      }
    }
  } catch (err) {
    console.warn('[AFILIADOS] Erro ao carregar do Supabase, usando cache local:', err);
  }
  return loadStore();
}

export async function saveStoreToSupabase(store: AffiliatesStore) {
  saveLocalStore(store);
  try {
    const supabase = getSupabase();
    if (supabase) {
      const token = JSON.stringify(store);
      const { error } = await supabase
        .from('verification_tokens')
        .update({ token, expires: new Date('2099-01-01').toISOString() })
        .eq('identifier', SUPABASE_STORE_KEY);

      if (error) {
        await supabase
          .from('verification_tokens')
          .insert({
            identifier: SUPABASE_STORE_KEY,
            token,
            expires: new Date('2099-01-01').toISOString()
          });
      }
    }
  } catch (err) {
    console.error('[AFILIADOS] Erro ao sincronizar com Supabase:', err);
  }
}

export function saveStore(store: AffiliatesStore) {
  saveLocalStore(store);
  // Persist to Supabase asynchronously without blocking
  saveStoreToSupabase(store).catch(() => {});
}

/**
 * Register pending PIX transaction to associate affiliateCode with transactionId and customer email
 */
export function registerPendingTransaction(tx: PendingTransaction) {
  const store = loadStore();
  if (!store.pendingTransactions) store.pendingTransactions = [];
  
  // Remove older entry for same transactionId if exists
  store.pendingTransactions = store.pendingTransactions.filter(
    p => p.transactionId !== tx.transactionId && p.clientIdentifier !== tx.clientIdentifier
  );

  // Keep last 300 pending transactions
  store.pendingTransactions.unshift(tx);
  if (store.pendingTransactions.length > 300) {
    store.pendingTransactions = store.pendingTransactions.slice(0, 300);
  }

  saveStore(store);
  console.log(`[AFILIADOS SERVER] Transação pendente registrada: ${tx.transactionId} - Afiliado: ${tx.affiliateCode || 'NENHUM'} - Cliente: ${tx.email}`);
}

/**
 * Retrieve pending transaction details asynchronously checking both cache and Supabase
 */
export async function getPendingTransactionAsync(idOrEmail: string): Promise<PendingTransaction | null> {
  const local = getPendingTransaction(idOrEmail);
  if (local) return local;

  const store = await loadStoreFromSupabase();
  if (!store.pendingTransactions || !idOrEmail) return null;
  const clean = idOrEmail.trim().toLowerCase();

  const found = store.pendingTransactions.find(
    p => (p.transactionId && p.transactionId.toLowerCase() === clean) ||
         (p.clientIdentifier && p.clientIdentifier.toLowerCase() === clean) ||
         (p.email && p.email.toLowerCase() === clean)
  );

  return found || null;
}

/**
 * Retrieve pending transaction details by transactionId, clientIdentifier, or customer email
 */
export function getPendingTransaction(idOrEmail: string): PendingTransaction | null {
  const store = loadStore();
  if (!store.pendingTransactions || !idOrEmail) return null;
  const clean = idOrEmail.trim().toLowerCase();

  const found = store.pendingTransactions.find(
    p => (p.transactionId && p.transactionId.toLowerCase() === clean) ||
         (p.clientIdentifier && p.clientIdentifier.toLowerCase() === clean) ||
         (p.email && p.email.toLowerCase() === clean)
  );

  return found || null;
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
  // BLOQUEIO TOTAL: Taxa de saque / antecipação NUNCA gera comissão para afiliados
  if ((params.plan as any) === 'taxa_antecipacao') {
    console.warn(`[AFILIADOS SERVER] Bloqueio: Taxa de saque não gera comissão para afiliados.`);
    return null;
  }

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

  const cleanCustomerEmail = (params.customerEmail || '').toLowerCase().trim();

  // 1. Prevent duplicate sales by transactionId
  if (params.transactionId) {
    const existing = store.sales.find(s => s.transactionId === params.transactionId);
    if (existing) {
      console.log(`[AFILIADOS SERVER] Venda com transactionId ${params.transactionId} já registrada anteriormente. Retornando existente.`);
      return existing;
    }
  }

  // 2. Prevent duplicate sales by customerEmail + plan within 15 minutes
  const recentDuplicate = store.sales.find(s => 
    s.customerEmail.toLowerCase() === cleanCustomerEmail &&
    s.plan === params.plan &&
    Math.abs(Date.now() - (s.createdAt || 0)) < 15 * 60 * 1000
  );
  if (recentDuplicate) {
    console.log(`[AFILIADOS SERVER] Venda duplicada ignorada para ${cleanCustomerEmail} (já registrada há menos de 15 minutos).`);
    return recentDuplicate;
  }

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
  const store = await loadStoreFromSupabase();
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
    const store = await loadStoreFromSupabase();

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
      await saveStoreToSupabase(store);
      return NextResponse.json({ success: true, affiliate: newAffiliate });
    }

    if (action === 'update') {
      const { id, updates } = body;
      const idx = store.affiliates.findIndex(a => a.id === id);
      if (idx === -1) {
        return NextResponse.json({ success: false, error: 'Afiliado não encontrado' }, { status: 404 });
      }

      store.affiliates[idx] = { ...store.affiliates[idx], ...updates };
      await saveStoreToSupabase(store);
      return NextResponse.json({ success: true, affiliate: store.affiliates[idx] });
    }

    if (action === 'delete') {
      const { id } = body;
      store.affiliates = store.affiliates.filter(a => a.id !== id);
      await saveStoreToSupabase(store);
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

        await saveStoreToSupabase(store);
      }
      return NextResponse.json({ success: true, affiliate: aff });
    }

    if (action === 'record_sale') {
      const sale = recordAffiliateSaleOnServer(body.sale);
      await saveStoreToSupabase(store);
      return NextResponse.json({ success: true, sale });
    }

    if (action === 'sync_all') {
      // Sync from admin interface
      if (Array.isArray(body.affiliates)) {
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
      await saveStoreToSupabase(store);
      return NextResponse.json({ success: true, store });
    }

    return NextResponse.json({ success: false, error: 'Ação desconhecida' }, { status: 400 });
  } catch (err: any) {
    console.error('Erro em /api/affiliates:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
