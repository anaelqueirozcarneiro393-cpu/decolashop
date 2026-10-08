'use client';

export interface Affiliate {
  id: string;
  name: string;
  code: string; // The URL slug used in ?af=code
  email: string;
  phone?: string;
  pixKey: string;
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  commissionPercent: number; // e.g. 50 (for 50%)
  active: boolean;
  createdAt: number;
  totalRevenue: number;
  totalSalesCount: number;
  pendingCommission: number;
  paidCommission: number;
  lastPaidAt?: number;
}

export interface AffiliateSale {
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
  isSelfPurchase: boolean; // True if customerEmail matches affiliate email
  status: 'confirmed' | 'paid_to_affiliate';
  createdAt: number;
  transactionId?: string;
}

export interface PendingPixTransaction {
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

const AFFILIATES_STORAGE_KEY = 'decolashop_affiliates_real_v2';
const AFFILIATE_SALES_STORAGE_KEY = 'decolashop_affiliate_sales_real_v2';
const PENDING_TXS_STORAGE_KEY = 'decolashop_affiliate_pending_txs_v2';
const DELETED_AFFILIATES_KEY = 'decolashop_deleted_affiliates_real_v2';
const AFFILIATE_REF_COOKIE = 'decolashop_af';
const AFFILIATE_REF_STORAGE = 'decolashop_affiliate_ref';

function getDeletedAffiliateIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(DELETED_AFFILIATES_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function addDeletedAffiliateId(id: string) {
  if (typeof window === 'undefined') return;
  try {
    const set = getDeletedAffiliateIds();
    set.add(id);
    localStorage.setItem(DELETED_AFFILIATES_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

function removeDeletedAffiliateId(id: string) {
  if (typeof window === 'undefined') return;
  try {
    const set = getDeletedAffiliateIds();
    set.delete(id);
    localStorage.setItem(DELETED_AFFILIATES_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

// Clean real affiliate system - 100% real data only
const DEFAULT_AFFILIATES: Affiliate[] = [];
const DEFAULT_SALES: AffiliateSale[] = [];

// Helper: Read cookie
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[1]) : null;
}

// Helper: Set ultra-durable cookie with 365 days expiration, Lax security, and multi-domain scope
function setDurableCookie(name: string, value: string, days = 365) {
  if (typeof document === 'undefined') return;
  const maxAge = days * 86400;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const encoded = encodeURIComponent(value);

  // 1. Host-specific cookie
  document.cookie = `${name}=${encoded}; max-age=${maxAge}; expires=${expires}; path=/; SameSite=Lax`;

  // 2. Cross-subdomain cookies for decolashop domains
  try {
    const hostname = window.location.hostname;
    if (hostname.includes('decolashop.com.br')) {
      document.cookie = `${name}=${encoded}; max-age=${maxAge}; expires=${expires}; path=/; domain=.decolashop.com.br; SameSite=Lax`;
    } else if (hostname.includes('decolashop.com')) {
      document.cookie = `${name}=${encoded}; max-age=${maxAge}; expires=${expires}; path=/; domain=.decolashop.com; SameSite=Lax`;
    }
  } catch {}
}

/**
 * Capture affiliate reference from URL and permanently lock into storage
 */
export function captureAffiliateFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const afCode = urlParams.get('af') || urlParams.get('ref') || urlParams.get('afiliado');
    if (afCode && afCode.trim()) {
      const cleanCode = afCode.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
      if (cleanCode) {
        setAffiliateRef(cleanCode);
        return cleanCode;
      }
    }
  } catch (e) {
    console.error('Erro ao capturar código de afiliado:', e);
  }
  return null;
}

/**
 * Set affiliate reference code permanently locked in:
 * - window memory
 * - localStorage
 * - sessionStorage
 * - 365-day multi-domain cookie
 */
export function setAffiliateRef(code: string): void {
  if (typeof window === 'undefined') return;
  try {
    const cleanCode = code.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanCode) return;

    // 1. Memory
    (window as any).__decolashop_af = cleanCode;

    // 2. localStorage
    localStorage.setItem(AFFILIATE_REF_STORAGE, cleanCode);

    // 3. sessionStorage
    sessionStorage.setItem(AFFILIATE_REF_STORAGE, cleanCode);

    // 4. 365-day Cookie
    setDurableCookie(AFFILIATE_REF_COOKIE, cleanCode, 365);

    // Notify listeners
    window.dispatchEvent(new CustomEvent('decolashop_affiliate_changed', { detail: cleanCode }));
  } catch {}
}

/**
 * Get current active affiliate reference code with self-healing across storages
 */
export function getAffiliateRef(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    // 1. In-memory
    if ((window as any).__decolashop_af) {
      return (window as any).__decolashop_af;
    }

    // 2. Instant URL inspection
    if (typeof window.location !== 'undefined' && window.location.search) {
      const urlParams = new URLSearchParams(window.location.search);
      const afUrl = urlParams.get('af') || urlParams.get('ref') || urlParams.get('afiliado');
      if (afUrl && afUrl.trim()) {
        const clean = afUrl.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
        if (clean) {
          setAffiliateRef(clean);
          return clean;
        }
      }
    }

    // 3. localStorage
    const fromStorage = localStorage.getItem(AFFILIATE_REF_STORAGE);
    if (fromStorage && fromStorage.trim()) {
      const clean = fromStorage.trim().toLowerCase();
      (window as any).__decolashop_af = clean;
      return clean;
    }

    // 4. sessionStorage
    const fromSession = sessionStorage.getItem(AFFILIATE_REF_STORAGE);
    if (fromSession && fromSession.trim()) {
      const clean = fromSession.trim().toLowerCase();
      (window as any).__decolashop_af = clean;
      return clean;
    }

    // 5. Cookie
    const fromCookie = getCookie(AFFILIATE_REF_COOKIE);
    if (fromCookie && fromCookie.trim()) {
      const clean = fromCookie.trim().toLowerCase();
      (window as any).__decolashop_af = clean;
      // Self-heal localStorage
      try { localStorage.setItem(AFFILIATE_REF_STORAGE, clean); } catch {}
      return clean;
    }
  } catch {}
  return null;
}

/**
 * Permanently binds customer email to current locked affiliate on the server
 */
export function bindLeadEmailToAffiliate(email: string): void {
  if (typeof window === 'undefined' || !email) return;
  const af = getAffiliateRef();
  if (!af) return;
  fetch('/api/affiliates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'bind_lead', email: email.trim().toLowerCase(), affiliateCode: af })
  }).catch(() => {});
  fetch('https://decolashop-saas.vercel.app/api/affiliates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'bind_lead', email: email.trim().toLowerCase(), affiliateCode: af })
  }).catch(() => {});
}

/**
 * Clear affiliate reference
 */
export function clearAffiliateRef(): void {
  if (typeof window === 'undefined') return;
  try {
    delete (window as any).__decolashop_af;
    localStorage.removeItem(AFFILIATE_REF_STORAGE);
    sessionStorage.removeItem(AFFILIATE_REF_STORAGE);
    setDurableCookie(AFFILIATE_REF_COOKIE, '', -1);
  } catch {}
}

/**
 * Get all registered affiliates (100% real data, starts empty)
 */
export function getAffiliates(): Affiliate[] {
  if (typeof window === 'undefined') return [];
  try {
    // Purge legacy fake keys if any
    localStorage.removeItem('decolashop_affiliates_v1');
    localStorage.removeItem('decolashop_affiliate_sales_v1');

    const raw = localStorage.getItem(AFFILIATES_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Purge any fake seed affiliates
      const filtered = parsed.filter(a => !['af_pedro', 'af_lucas', 'af_carla'].includes(a.id) && !a.name?.includes('Pedro Alcântara'));
      if (filtered.length !== parsed.length) {
        localStorage.setItem(AFFILIATES_STORAGE_KEY, JSON.stringify(filtered));
      }
      return filtered;
    }
    return [];
  } catch {
    return [];
  }
}

function postAffiliatesApi(payload: any) {
  if (typeof window === 'undefined') return;
  fetch('/api/affiliates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(() => {});
  fetch('https://decolashop-saas.vercel.app/api/affiliates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(() => {});
}

/**
 * Get all pending PIX transactions (QR codes generated awaiting bank confirmation)
 */
export function getPendingPixTransactions(): PendingPixTransaction[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PENDING_TXS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Synchronize affiliates, sales and pending PIX transactions from server API across devices
 */
export async function syncAffiliatesFromServer(): Promise<{ affiliates: Affiliate[]; sales: AffiliateSale[]; pendingTransactions: PendingPixTransaction[]; paidUsers?: any[] }> {
  if (typeof window === 'undefined') return { affiliates: [], sales: [], pendingTransactions: [], paidUsers: [] };
  try {
    let data: any = null;
    try {
      const res = await fetch('/api/affiliates', { cache: 'no-store' });
      if (res.ok) {
        data = await res.json();
      }
    } catch {}

    // Fallback de alta disponibilidade para garantir que os dados apareçam imediatamente
    if (!data || !data.success || !Array.isArray(data.affiliates) || (data.affiliates.length === 0 && (!data.paidUsers || data.paidUsers.length === 0))) {
      try {
        const fbRes = await fetch('https://decolashop-saas.vercel.app/api/affiliates', { cache: 'no-store' });
        if (fbRes.ok) {
          const fbData = await fbRes.json();
          if (fbData && fbData.success && Array.isArray(fbData.affiliates) && fbData.affiliates.length > 0) {
            data = fbData;
          }
        }
      } catch {}
    }

    if (data && data.success && Array.isArray(data.affiliates)) {
      const localAffiliates = getAffiliates();
      const localSales = getAffiliateSales();

        // 1. Salva transações pendentes (Pix gerados aguardando pagamento)
        const incomingPending: PendingPixTransaction[] = Array.isArray(data.pendingTransactions) ? data.pendingTransactions : [];
        const prevRawPending = localStorage.getItem(PENDING_TXS_STORAGE_KEY) || '[]';
        const nextRawPending = JSON.stringify(incomingPending);
        if (prevRawPending !== nextRawPending) {
          localStorage.setItem(PENDING_TXS_STORAGE_KEY, nextRawPending);
          window.dispatchEvent(new Event('decolashop_affiliate_pending_updated'));
        }

        // Se o servidor estiver vazio mas o cliente tiver dados locais, envia os dados locais para salvar no servidor!
        if (data.affiliates.length === 0 && localAffiliates.length > 0) {
          fetch('/api/affiliates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'sync_all', affiliates: localAffiliates, sales: localSales })
          }).catch(() => {});
          return { affiliates: localAffiliates, sales: localSales, pendingTransactions: incomingPending, paidUsers: data.paidUsers || [] };
        }

        // O banco de dados Supabase é a fonte única e definitiva da verdade
        const affiliatesMap = new Map<string, Affiliate>();
        data.affiliates.forEach((serverAff: Affiliate) => {
          if (serverAff && serverAff.code) {
            affiliatesMap.set(serverAff.code.toLowerCase(), serverAff);
          }
        });

        // Preserva afiliados locais que ainda não estejam no banco de dados e sincroniza
        const unsyncedAffiliates: Affiliate[] = [];
        localAffiliates.forEach(a => {
          if (a && a.code && !affiliatesMap.has(a.code.toLowerCase())) {
            affiliatesMap.set(a.code.toLowerCase(), a);
            unsyncedAffiliates.push(a);
          }
        });

        const mergedAffiliates = Array.from(affiliatesMap.values());

        // Vendas: o banco de dados é a autoridade máxima
        const salesMap = new Map<string, AffiliateSale>();
        (data.sales || []).forEach((s: AffiliateSale) => {
          if (s && s.id) salesMap.set(s.id, s);
        });

        const unsyncedSales: AffiliateSale[] = [];
        localSales.forEach(s => {
          if (s && s.id && !salesMap.has(s.id)) {
            salesMap.set(s.id, s);
            unsyncedSales.push(s);
          }
        });

        const mergedSales = Array.from(salesMap.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        const prevRawAff = localStorage.getItem(AFFILIATES_STORAGE_KEY) || '[]';
        const prevRawSales = localStorage.getItem(AFFILIATE_SALES_STORAGE_KEY) || '[]';
        const nextRawAff = JSON.stringify(mergedAffiliates);
        const nextRawSales = JSON.stringify(mergedSales);

        localStorage.setItem(AFFILIATES_STORAGE_KEY, nextRawAff);
        localStorage.setItem(AFFILIATE_SALES_STORAGE_KEY, nextRawSales);

        // Se havia novos dados locais que não estavam no servidor, envia ao banco
        if (unsyncedAffiliates.length > 0 || unsyncedSales.length > 0) {
          fetch('/api/affiliates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'sync_all', affiliates: unsyncedAffiliates, sales: unsyncedSales })
          }).catch(() => {});
        }

        if (prevRawAff !== nextRawAff) {
          window.dispatchEvent(new Event('decolashop_affiliate_updated'));
        }
        if (prevRawSales !== nextRawSales) {
          window.dispatchEvent(new Event('decolashop_affiliate_sales_updated'));
        }
        return { affiliates: mergedAffiliates, sales: mergedSales, pendingTransactions: incomingPending, paidUsers: data.paidUsers || [] };
      }
    } catch (e) {
    console.warn('Erro ao sincronizar afiliados do servidor:', e);
  }
  return { affiliates: getAffiliates(), sales: getAffiliateSales(), pendingTransactions: getPendingPixTransactions(), paidUsers: [] };
}

/**
 * Save affiliates list and notify subscribers
 */
export function saveAffiliates(affiliates: Affiliate[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AFFILIATES_STORAGE_KEY, JSON.stringify(affiliates));
    window.dispatchEvent(new Event('decolashop_affiliates_updated'));
  } catch {}
}

/**
 * Get all affiliate sales (100% real sales from checkout confirmations)
 */
export function getAffiliateSales(): AffiliateSale[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(AFFILIATE_SALES_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      let changed = false;
      // 1. Purge fake seed sales and taxa_antecipacao sales
      let filtered = parsed.filter(s => 
        !s.id.startsWith('sale_af_10') && 
        !s.affiliateName?.includes('Pedro Alcântara') &&
        (s.plan as any) !== 'taxa_antecipacao'
      );
      if (filtered.length !== parsed.length) changed = true;

      // 2. Normaliza preços oficiais: Vitalício = R$ 179,90, Mensal = R$ 89,90
      filtered.forEach(sale => {
        if (sale.plan === 'lifetime' && (sale.planPrice === 147 || sale.totalAmount === 147)) {
          sale.planPrice = 179.90;
          sale.totalAmount = Number((179.90 + (sale.bumpPrices || 0)).toFixed(2));
          sale.commissionAmount = Number(((sale.totalAmount * (sale.commissionPercent || 50)) / 100).toFixed(2));
          changed = true;
        } else if (sale.plan === 'monthly' && (sale.planPrice === 97 || sale.totalAmount === 97)) {
          sale.planPrice = 89.90;
          sale.totalAmount = Number((89.90 + (sale.bumpPrices || 0)).toFixed(2));
          sale.commissionAmount = Number(((sale.totalAmount * (sale.commissionPercent || 50)) / 100).toFixed(2));
          changed = true;
        }
      });

      if (changed) {
        localStorage.setItem(AFFILIATE_SALES_STORAGE_KEY, JSON.stringify(filtered));
      }
      return filtered;
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Save affiliate sales list and notify subscribers
 */
export function saveAffiliateSales(sales: AffiliateSale[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AFFILIATE_SALES_STORAGE_KEY, JSON.stringify(sales));
    window.dispatchEvent(new Event('decolashop_affiliate_sales_updated'));
  } catch {}
}

/**
 * Add a new affiliate
 */
export function addAffiliate(data: {
  name: string;
  code: string;
  email: string;
  phone?: string;
  pixKey: string;
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  commissionPercent?: number;
}): Affiliate {
  const affiliates = getAffiliates();
  const cleanCode = data.code.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');

  // Check if code already exists
  const existing = affiliates.find(a => a.code.toLowerCase() === cleanCode);
  if (existing) {
    throw new Error(`O código de afiliado "${cleanCode}" já está em uso.`);
  }

  const newAffiliate: Affiliate = {
    id: `af_${cleanCode}_${Date.now().toString(36)}`,
    name: data.name.trim(),
    code: cleanCode,
    email: data.email.trim().toLowerCase(),
    phone: data.phone?.trim() || '',
    pixKey: data.pixKey.trim(),
    pixKeyType: data.pixKeyType,
    commissionPercent: typeof data.commissionPercent === 'number' ? Math.max(0, Math.min(100, data.commissionPercent)) : 50,
    active: true,
    createdAt: Date.now(),
    totalRevenue: 0,
    totalSalesCount: 0,
    pendingCommission: 0,
    paidCommission: 0,
  };

  const updated = [newAffiliate, ...affiliates];
  removeDeletedAffiliateId(newAffiliate.id);
  saveAffiliates(updated);
  postAffiliatesApi({ action: 'create', affiliate: newAffiliate });
  return newAffiliate;
}

/**
 * Update existing affiliate
 */
export function updateAffiliate(id: string, updates: Partial<Affiliate>): Affiliate | null {
  const affiliates = getAffiliates();
  const index = affiliates.findIndex(a => a.id === id);
  if (index === -1) return null;

  // If code is changing, check uniqueness
  if (updates.code) {
    const cleanCode = updates.code.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const conflict = affiliates.find(a => a.id !== id && a.code.toLowerCase() === cleanCode);
    if (conflict) {
      throw new Error(`O código "${cleanCode}" já está em uso por outro afiliado.`);
    }
    updates.code = cleanCode;
  }

  if (updates.commissionPercent !== undefined) {
    updates.commissionPercent = Math.max(0, Math.min(100, updates.commissionPercent));
  }

  const updatedAffiliate = {
    ...affiliates[index],
    ...updates,
  };

  affiliates[index] = updatedAffiliate;
  saveAffiliates(affiliates);
  postAffiliatesApi({ action: 'update', id, updates });
  return updatedAffiliate;
}

/**
 * Quick update of commission percent
 */
export function updateAffiliateCommission(id: string, newPercent: number): boolean {
  const bounded = Math.max(0, Math.min(100, Math.round(newPercent)));
  const updated = updateAffiliate(id, { commissionPercent: bounded });
  return !!updated;
}

/**
 * Delete affiliate
 */
export function deleteAffiliate(id: string): boolean {
  addDeletedAffiliateId(id);
  const affiliates = getAffiliates();
  const filtered = affiliates.filter(a => a.id !== id);
  if (filtered.length === affiliates.length) return false;
  saveAffiliates(filtered);
  postAffiliatesApi({ action: 'delete', id });
  return true;
}

/**
 * Mark all pending commission for an affiliate as paid via manual Pix
 */
export function markCommissionPaid(affiliateId: string): boolean {
  const affiliates = getAffiliates();
  const aff = affiliates.find(a => a.id === affiliateId);
  if (!aff || aff.pendingCommission <= 0) return false;

  const paidAmount = aff.pendingCommission;
  aff.paidCommission = Number((aff.paidCommission + paidAmount).toFixed(2));
  aff.pendingCommission = 0;
  aff.lastPaidAt = Date.now();

  saveAffiliates(affiliates);

  // Update associated sales to 'paid_to_affiliate'
  const sales = getAffiliateSales();
  let salesUpdated = false;
  sales.forEach(sale => {
    if (sale.affiliateId === affiliateId && sale.status === 'confirmed') {
      sale.status = 'paid_to_affiliate';
      salesUpdated = true;
    }
  });

  if (salesUpdated) {
    saveAffiliateSales(sales);
  }

  postAffiliatesApi({ action: 'pay', affiliateId });
  return true;
}

/**
 * Record an affiliate sale strictly from the initial entrance checkout.
 * Called ONLY when Pix payment has been confirmed as paid!
 * Rule: Commission applies to total initial checkout (Subscription + Order Bumps).
 * Rule: Never called on internal SaaS charges (e.g. taxa de antecipação).
 */
export function recordAffiliateSale(params: {
  plan: 'monthly' | 'lifetime';
  planPrice: number;
  bumps: string[];
  bumpPrices: number;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerCpf?: string;
  transactionId?: string;
}): AffiliateSale | null {
  if ((params.plan as any) === 'taxa_antecipacao') {
    return null;
  }
  const activeCode = getAffiliateRef();
  if (!activeCode) {
    // Direct / owner sale (No commission to pay, 100% owner profit)
    return null;
  }

  const affiliates = getAffiliates();
  let affiliate = affiliates.find(a => a.code.toLowerCase() === activeCode.toLowerCase() && a.active);

  if (!affiliate) {
    console.log(`[AFILIADOS CLIENT] Código "${activeCode}" não pré-cadastrado no navegador. Auto-provisionando parceiro...`);
    affiliate = {
      id: `af_${activeCode}_${Date.now().toString(36)}`,
      name: `Afiliado ${activeCode.toUpperCase()}`,
      code: activeCode,
      email: '',
      pixKey: '',
      pixKeyType: 'random',
      commissionPercent: 50,
      active: true,
      createdAt: Date.now(),
      totalRevenue: 0,
      totalSalesCount: 0,
      pendingCommission: 0,
      paidCommission: 0,
    };
    affiliates.unshift(affiliate);
  }

  const cleanCustomerEmail = params.customerEmail.toLowerCase().trim();
  const isSelfPurchase = cleanCustomerEmail === affiliate.email.toLowerCase().trim();

  // Commission calculation strictly on initial checkout (Plan + Bumps)
  const commissionPercent = affiliate.commissionPercent;
  const commissionAmount = Number(((params.totalAmount * commissionPercent) / 100).toFixed(2));

  const newSale: AffiliateSale = {
    id: `sale_af_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    affiliateId: affiliate.id,
    affiliateCode: affiliate.code,
    affiliateName: affiliate.name,
    customerName: params.customerName,
    customerEmail: cleanCustomerEmail,
    customerPhone: params.customerPhone,
    customerCpf: params.customerCpf,
    plan: params.plan,
    planPrice: params.planPrice,
    bumps: params.bumps,
    bumpPrices: params.bumpPrices,
    totalAmount: params.totalAmount,
    commissionPercent,
    commissionAmount,
    isSelfPurchase,
    status: 'confirmed',
    createdAt: Date.now(),
    transactionId: params.transactionId
  };

  // Update affiliate metrics
  affiliate.totalRevenue = Number((affiliate.totalRevenue + params.totalAmount).toFixed(2));
  affiliate.totalSalesCount += 1;
  affiliate.pendingCommission = Number((affiliate.pendingCommission + commissionAmount).toFixed(2));

  // Save changes
  saveAffiliates(affiliates);

  const sales = getAffiliateSales();
  saveAffiliateSales([newSale, ...sales]);
  postAffiliatesApi({ action: 'record_sale', sale: { affiliateCode: activeCode, ...params } });

  return newSale;
}

/**
 * Generate shareable affiliate link
 */
export function getAffiliateLink(code: string): string {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    return `${origin}/?af=${encodeURIComponent(code)}`;
  }
  return `https://decolashop.com.br/?af=${encodeURIComponent(code)}`;
}
