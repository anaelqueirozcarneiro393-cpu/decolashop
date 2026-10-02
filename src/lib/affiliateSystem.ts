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

const AFFILIATES_STORAGE_KEY = 'decolashop_affiliates_v1';
const AFFILIATE_SALES_STORAGE_KEY = 'decolashop_affiliate_sales_v1';
const AFFILIATE_REF_COOKIE = 'decolashop_af';
const AFFILIATE_REF_STORAGE = 'decolashop_affiliate_ref';

// Realistic seed affiliates for gerente@decolashop.com
const DEFAULT_AFFILIATES: Affiliate[] = [
  {
    id: 'af_pedro',
    name: 'Pedro Alcântara',
    code: 'pedro',
    email: 'pedro.alcantara@gmail.com',
    phone: '(11) 98721-4433',
    pixKey: '384.921.849-12',
    pixKeyType: 'cpf',
    commissionPercent: 50,
    active: true,
    createdAt: Date.now() - 14 * 86400000,
    totalRevenue: 2848.40,
    totalSalesCount: 12,
    pendingCommission: 479.70,
    paidCommission: 944.50,
    lastPaidAt: Date.now() - 3 * 86400000,
  },
  {
    id: 'af_lucas',
    name: 'Lucas Rocha (Dropship Pro)',
    code: 'lucas',
    email: 'lucasrocha.mkt@gmail.com',
    phone: '(21) 99876-1122',
    pixKey: 'lucasrocha.mkt@gmail.com',
    pixKeyType: 'email',
    commissionPercent: 50,
    active: true,
    createdAt: Date.now() - 10 * 86400000,
    totalRevenue: 1968.90,
    totalSalesCount: 8,
    pendingCommission: 269.85,
    paidCommission: 714.60,
    lastPaidAt: Date.now() - 4 * 86400000,
  },
  {
    id: 'af_carla',
    name: 'Carla Mendes',
    code: 'carla',
    email: 'carla.mendes@hotmail.com',
    phone: '(31) 98455-7799',
    pixKey: '31984557799',
    pixKeyType: 'phone',
    commissionPercent: 60,
    active: true,
    createdAt: Date.now() - 7 * 86400000,
    totalRevenue: 1548.50,
    totalSalesCount: 6,
    pendingCommission: 389.70,
    paidCommission: 539.40,
    lastPaidAt: Date.now() - 2 * 86400000,
  }
];

// Seed sales demonstrating checkout commissions (subscriptions + bumps)
const DEFAULT_SALES: AffiliateSale[] = [
  {
    id: 'sale_af_101',
    affiliateId: 'af_pedro',
    affiliateCode: 'pedro',
    affiliateName: 'Pedro Alcântara',
    customerName: 'Rodrigo Silveira',
    customerEmail: 'rodrigo.silveira@outlook.com',
    customerPhone: '11977665544',
    plan: 'lifetime',
    planPrice: 179.90,
    bumps: ['bump_curso', 'bump_acelerador'],
    bumpPrices: 69.80,
    totalAmount: 249.70,
    commissionPercent: 50,
    commissionAmount: 124.85,
    isSelfPurchase: false,
    status: 'confirmed',
    createdAt: Date.now() - 2 * 3600000, // 2h ago
    transactionId: 'TX-PIX-984210'
  },
  {
    id: 'sale_af_102',
    affiliateId: 'af_lucas',
    affiliateCode: 'lucas',
    affiliateName: 'Lucas Rocha (Dropship Pro)',
    customerName: 'Juliana Pires',
    customerEmail: 'juliana.pires@gmail.com',
    customerPhone: '21988776655',
    plan: 'lifetime',
    planPrice: 179.90,
    bumps: ['bump_acompanhamento'],
    bumpPrices: 59.90,
    totalAmount: 239.80,
    commissionPercent: 50,
    commissionAmount: 119.90,
    isSelfPurchase: false,
    status: 'confirmed',
    createdAt: Date.now() - 7 * 3600000, // 7h ago
    transactionId: 'TX-PIX-983192'
  },
  {
    id: 'sale_af_103',
    affiliateId: 'af_carla',
    affiliateCode: 'carla',
    affiliateName: 'Carla Mendes',
    customerName: 'Marcos Vinicius',
    customerEmail: 'marcos.vini99@gmail.com',
    customerPhone: '31971234455',
    plan: 'monthly',
    planPrice: 89.90,
    bumps: ['bump_curso'],
    bumpPrices: 29.90,
    totalAmount: 119.80,
    commissionPercent: 60,
    commissionAmount: 71.88,
    isSelfPurchase: false,
    status: 'confirmed',
    createdAt: Date.now() - 14 * 3600000, // 14h ago
    transactionId: 'TX-PIX-981044'
  },
  {
    id: 'sale_af_104',
    affiliateId: 'af_pedro',
    affiliateCode: 'pedro',
    affiliateName: 'Pedro Alcântara',
    customerName: 'Pedro Alcântara',
    customerEmail: 'pedro.alcantara@gmail.com',
    customerPhone: '11987214433',
    plan: 'lifetime',
    planPrice: 179.90,
    bumps: ['bump_acelerador'],
    bumpPrices: 39.90,
    totalAmount: 219.80,
    commissionPercent: 50,
    commissionAmount: 109.90,
    isSelfPurchase: true, // Example of self-purchase detection
    status: 'confirmed',
    createdAt: Date.now() - 26 * 3600000,
    transactionId: 'TX-PIX-978431'
  },
  {
    id: 'sale_af_105',
    affiliateId: 'af_pedro',
    affiliateCode: 'pedro',
    affiliateName: 'Pedro Alcântara',
    customerName: 'Renata Albuquerque',
    customerEmail: 'renata.alb@gmail.com',
    plan: 'lifetime',
    planPrice: 179.90,
    bumps: ['bump_curso', 'bump_acompanhamento', 'bump_acelerador'],
    bumpPrices: 129.70,
    totalAmount: 309.60,
    commissionPercent: 50,
    commissionAmount: 154.80,
    isSelfPurchase: false,
    status: 'paid_to_affiliate',
    createdAt: Date.now() - 4 * 86400000,
    transactionId: 'TX-PIX-967120'
  }
];

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
 * Get all registered affiliates
 */
export function getAffiliates(): Affiliate[] {
  if (typeof window === 'undefined') return DEFAULT_AFFILIATES;
  try {
    const raw = localStorage.getItem(AFFILIATES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(AFFILIATES_STORAGE_KEY, JSON.stringify(DEFAULT_AFFILIATES));
      return DEFAULT_AFFILIATES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_AFFILIATES;
  } catch {
    return DEFAULT_AFFILIATES;
  }
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
 * Get all affiliate sales
 */
export function getAffiliateSales(): AffiliateSale[] {
  if (typeof window === 'undefined') return DEFAULT_SALES;
  try {
    const raw = localStorage.getItem(AFFILIATE_SALES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(AFFILIATE_SALES_STORAGE_KEY, JSON.stringify(DEFAULT_SALES));
      return DEFAULT_SALES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return DEFAULT_SALES;
  } catch {
    return DEFAULT_SALES;
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
  saveAffiliates(updated);
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
  const affiliates = getAffiliates();
  const filtered = affiliates.filter(a => a.id !== id);
  if (filtered.length === affiliates.length) return false;
  saveAffiliates(filtered);
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
    console.warn(`[AFILIADOS] Código "${activeCode}" não encontrado ou inativo.`);
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
