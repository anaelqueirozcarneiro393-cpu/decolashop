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

const AFFILIATES_STORAGE_KEY = 'decolashop_affiliates_real_v2';
const AFFILIATE_SALES_STORAGE_KEY = 'decolashop_affiliate_sales_real_v2';
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
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

// Helper: Set cookie with 60 days expiration and Lax security
function setCookie(name: string, value: string, days = 60) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

/**
 * Capture affiliate reference from URL and store in cookie + localStorage
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
 * Set affiliate reference code in cookie (60 days) and localStorage
 */
export function setAffiliateRef(code: string): void {
  if (typeof window === 'undefined') return;
  try {
    const cleanCode = code.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanCode) return;
    localStorage.setItem(AFFILIATE_REF_STORAGE, cleanCode);
    setCookie(AFFILIATE_REF_COOKIE, cleanCode, 60);
    // Notify listeners if any
    window.dispatchEvent(new CustomEvent('decolashop_affiliate_changed', { detail: cleanCode }));
  } catch {}
}

/**
 * Get current active affiliate reference code (if any)
 */
export function getAffiliateRef(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const fromStorage = localStorage.getItem(AFFILIATE_REF_STORAGE);
    if (fromStorage && fromStorage.trim()) return fromStorage.trim().toLowerCase();
    const fromCookie = getCookie(AFFILIATE_REF_COOKIE);
    if (fromCookie && fromCookie.trim()) return fromCookie.trim().toLowerCase();
  } catch {}
  return null;
}

/**
 * Clear affiliate reference
 */
export function clearAffiliateRef(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(AFFILIATE_REF_STORAGE);
    setCookie(AFFILIATE_REF_COOKIE, '', -1);
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
}

/**
 * Synchronize affiliates and sales from server API across devices
 */
export async function syncAffiliatesFromServer(): Promise<{ affiliates: Affiliate[]; sales: AffiliateSale[] }> {
  if (typeof window === 'undefined') return { affiliates: [], sales: [] };
  try {
    const res = await fetch('/api/affiliates', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.affiliates)) {
        const localAffiliates = getAffiliates();
        const localSales = getAffiliateSales();

        // Se o servidor estiver vazio mas o cliente tiver dados locais, envia os dados locais para salvar no servidor!
        if (data.affiliates.length === 0 && localAffiliates.length > 0) {
          fetch('/api/affiliates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'sync_all', affiliates: localAffiliates, sales: localSales })
          }).catch(() => {});
          return { affiliates: localAffiliates, sales: localSales };
        }

        const deletedIds = getDeletedAffiliateIds();
        // Merge bidirecional inteligente: preserva afiliados locais e remotos (excluindo deletados)
        const mergedAffiliatesMap = new Map<string, Affiliate>();
        localAffiliates.filter(a => !deletedIds.has(a.id)).forEach(a => mergedAffiliatesMap.set(a.code.toLowerCase(), a));
        data.affiliates.filter((serverAff: Affiliate) => !deletedIds.has(serverAff.id)).forEach((serverAff: Affiliate) => {
          const key = serverAff.code.toLowerCase();
          const existing = mergedAffiliatesMap.get(key);
          if (existing) {
            mergedAffiliatesMap.set(key, {
              ...existing,
              ...serverAff,
              totalRevenue: Math.max(existing.totalRevenue || 0, serverAff.totalRevenue || 0),
              totalSalesCount: Math.max(existing.totalSalesCount || 0, serverAff.totalSalesCount || 0),
              pendingCommission: Math.max(existing.pendingCommission || 0, serverAff.pendingCommission || 0),
              paidCommission: Math.max(existing.paidCommission || 0, serverAff.paidCommission || 0),
            });
          } else {
            mergedAffiliatesMap.set(key, serverAff);
          }
        });

        const mergedAffiliates = Array.from(mergedAffiliatesMap.values());

        // Mescla vendas por ID
        const mergedSalesMap = new Map<string, AffiliateSale>();
        localSales.forEach(s => mergedSalesMap.set(s.id, s));
        (data.sales || []).forEach((s: AffiliateSale) => mergedSalesMap.set(s.id, s));
        const mergedSales = Array.from(mergedSalesMap.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        const prevRawAff = localStorage.getItem(AFFILIATES_STORAGE_KEY) || '[]';
        const prevRawSales = localStorage.getItem(AFFILIATE_SALES_STORAGE_KEY) || '[]';
        const nextRawAff = JSON.stringify(mergedAffiliates);
        const nextRawSales = JSON.stringify(mergedSales);

        localStorage.setItem(AFFILIATES_STORAGE_KEY, nextRawAff);
        localStorage.setItem(AFFILIATE_SALES_STORAGE_KEY, nextRawSales);

        // Se havia afiliados ou vendas locais que não estavam no servidor, sincroniza o servidor
        if (mergedAffiliates.length > data.affiliates.length || mergedSales.length > (data.sales || []).length) {
          fetch('/api/affiliates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'sync_all', affiliates: mergedAffiliates, sales: mergedSales })
          }).catch(() => {});
        }

        if (prevRawAff !== nextRawAff) {
          window.dispatchEvent(new Event('decolashop_affiliates_updated'));
        }
        if (prevRawSales !== nextRawSales) {
          window.dispatchEvent(new Event('decolashop_affiliate_sales_updated'));
        }
        return { affiliates: mergedAffiliates, sales: mergedSales };
      }
    }
  } catch (e) {
    console.warn('Erro ao sincronizar afiliados do servidor:', e);
  }
  return { affiliates: getAffiliates(), sales: getAffiliateSales() };
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
      // Purge any fake seed sales
      const filtered = parsed.filter(s => !s.id.startsWith('sale_af_10') && !s.affiliateName?.includes('Pedro Alcântara'));
      if (filtered.length !== parsed.length) {
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
  const activeCode = getAffiliateRef();
  if (!activeCode) {
    // Direct / owner sale (No commission to pay, 100% owner profit)
    return null;
  }

  const affiliates = getAffiliates();
  const affiliate = affiliates.find(a => a.code.toLowerCase() === activeCode.toLowerCase() && a.active);

  if (!affiliate) {
    console.warn(`[AFILIADOS] Código "${activeCode}" não encontrado localmente. Encaminhando registro ao servidor...`);
    postAffiliatesApi({ action: 'record_sale', sale: { affiliateCode: activeCode, ...params } });
    return null;
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
