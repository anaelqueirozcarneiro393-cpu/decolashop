import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

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
  isSelfPurchase: boolean;
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

const SUPABASE_STORE_LEGACY_KEY = 'system:affiliates_store_v1';
const EXPIRY_FAR_FUTURE = '2099-01-01T00:00:00Z';

/**
 * 1. Obter todos os afiliados cadastrados diretamente do Supabase PostgreSQL
 */
export async function dbGetAffiliates(): Promise<Affiliate[]> {
  try {
    const supabase = getSupabaseAdmin('next_auth');
    const { data, error } = await supabase
      .from('verification_tokens')
      .select('token')
      .like('identifier', 'affiliate:%');

    if (error) {
      console.error('[DB AFILIADOS] Erro ao buscar afiliados:', error);
      return [];
    }

    const affiliates: Affiliate[] = [];
    for (const row of data || []) {
      try {
        const parsed = JSON.parse(row.token);
        if (parsed && parsed.code) {
          affiliates.push(parsed);
        }
      } catch {}
    }

    // Se a tabela granular ainda estiver vazia, tenta resgatar do legado para não perder nada
    if (affiliates.length === 0) {
      const { data: legacy } = await supabase
        .from('verification_tokens')
        .select('token')
        .eq('identifier', SUPABASE_STORE_LEGACY_KEY)
        .maybeSingle();

      if (legacy?.token) {
        try {
          const parsedLegacy = JSON.parse(legacy.token);
          if (Array.isArray(parsedLegacy.affiliates) && parsedLegacy.affiliates.length > 0) {
            for (const a of parsedLegacy.affiliates) {
              await dbSaveAffiliate(a);
              affiliates.push(a);
            }
          }
        } catch {}
      }
    }

    return affiliates.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (err) {
    console.error('[DB AFILIADOS] Exceção em dbGetAffiliates:', err);
    return [];
  }
}

/**
 * 2. Salvar ou atualizar um afiliado diretamente no banco Supabase
 */
export async function dbSaveAffiliate(affiliate: Affiliate): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin('next_auth');
    const cleanCode = (affiliate.code || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanCode) return false;

    const identifier = `affiliate:${cleanCode}`;
    const token = JSON.stringify({
      ...affiliate,
      code: cleanCode
    });

    await supabase.from('verification_tokens').delete().eq('identifier', identifier);
    const { error } = await supabase.from('verification_tokens').insert({
      identifier,
      token,
      expires: EXPIRY_FAR_FUTURE
    });

    if (error) {
      console.error(`[DB AFILIADOS] Erro ao salvar afiliado ${cleanCode}:`, error);
      return false;
    }
    console.log(`[DB AFILIADOS] ✅ Afiliado "${cleanCode}" salvo no Supabase com sucesso.`);
    return true;
  } catch (err) {
    console.error('[DB AFILIADOS] Exceção ao salvar afiliado:', err);
    return false;
  }
}

export const AFFILIATE_CODE_ALIASES: Record<string, string> = {
  'kaio': 'rwjncwiofw'
};

export function resolveAffiliateCode(code: string): string {
  const clean = (code || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
  return AFFILIATE_CODE_ALIASES[clean] || clean;
}

/**
 * 3. Buscar um afiliado específico pelo código
 */
export async function dbGetAffiliateByCode(code: string): Promise<Affiliate | null> {
  try {
    const cleanCode = resolveAffiliateCode(code);
    if (!cleanCode) return null;

    const supabase = getSupabaseAdmin('next_auth');
    const { data } = await supabase
      .from('verification_tokens')
      .select('token')
      .eq('identifier', `affiliate:${cleanCode}`)
      .maybeSingle();

    if (data?.token) {
      try {
        return JSON.parse(data.token);
      } catch {}
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * 4. Deletar afiliado no banco Supabase
 */
export async function dbDeleteAffiliate(codeOrId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin('next_auth');
    const clean = codeOrId.trim().toLowerCase();

    // Tenta por código direto
    await supabase.from('verification_tokens').delete().eq('identifier', `affiliate:${clean}`);

    // Tenta varrer se foi passado ID
    const affiliates = await dbGetAffiliates();
    const found = affiliates.find(a => a.id === codeOrId || a.code.toLowerCase() === clean);
    if (found) {
      await supabase.from('verification_tokens').delete().eq('identifier', `affiliate:${found.code.toLowerCase()}`);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * 5. Obter todas as vendas de afiliados registradas no banco Supabase
 */
export async function dbGetSales(): Promise<AffiliateSale[]> {
  try {
    const supabase = getSupabaseAdmin('next_auth');
    const { data, error } = await supabase
      .from('verification_tokens')
      .select('token')
      .like('identifier', 'affiliate_sale:%');

    if (error) {
      console.error('[DB AFILIADOS] Erro ao buscar vendas:', error);
      return [];
    }

    const sales: AffiliateSale[] = [];
    for (const row of data || []) {
      try {
        const parsed = JSON.parse(row.token);
        if (parsed && parsed.id) {
          sales.push(parsed);
        }
      } catch {}
    }

    return sales.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (err) {
    console.error('[DB AFILIADOS] Exceção em dbGetSales:', err);
    return [];
  }
}

/**
 * 6. Gravar venda de afiliado no banco Supabase (100% permanente e à prova de perda)
 */
export async function dbRecordSale(params: {
  affiliateCode: string;
  plan: 'monthly' | 'lifetime';
  planPrice: number;
  bumps?: string[];
  bumpPrices?: number;
  totalAmount: number;
  customerName?: string;
  customerEmail: string;
  customerPhone?: string;
  customerCpf?: string;
  transactionId?: string;
}): Promise<AffiliateSale | null> {
  if ((params.plan as any) === 'taxa_antecipacao') {
    return null;
  }

  const cleanCode = resolveAffiliateCode(params.affiliateCode);
  if (!cleanCode) return null;

  const cleanEmail = (params.customerEmail || '').trim().toLowerCase();
  if (!cleanEmail) return null;

  const supabase = getSupabaseAdmin('next_auth');

  // 1. Verificação contra duplicatas por transactionId
  if (params.transactionId) {
    const saleIdKey = `affiliate_sale:${params.transactionId}`;
    const { data: existingTx } = await supabase
      .from('verification_tokens')
      .select('token')
      .eq('identifier', saleIdKey)
      .maybeSingle();

    if (existingTx?.token) {
      try {
        console.log(`[DB AFILIADOS] Venda com transactionId ${params.transactionId} já existente no Supabase.`);
        return JSON.parse(existingTx.token);
      } catch {}
    }
  }

  // 2. Busca ou auto-provisiona o afiliado no banco Supabase
  let affiliate = await dbGetAffiliateByCode(cleanCode);
  if (!affiliate) {
    console.log(`[DB AFILIADOS] Código "${cleanCode}" não existia no banco. Auto-cadastrando parceiro com 50% de comissão.`);
    affiliate = {
      id: `af_${cleanCode}_${Date.now().toString(36)}`,
      name: `Afiliado ${cleanCode.toUpperCase()}`,
      code: cleanCode,
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
    await dbSaveAffiliate(affiliate);
  }

  // 3. Calcula comissões
  const commissionPercent = affiliate.commissionPercent || 50;
  const totalAmount = Number(params.totalAmount) || (params.plan === 'monthly' ? 89.90 : 179.90);
  const commissionAmount = Number(((totalAmount * commissionPercent) / 100).toFixed(2));
  const isSelfPurchase = affiliate.email ? cleanEmail === affiliate.email.toLowerCase().trim() : false;

  const saleId = `sale_af_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const finalSaleKey = `affiliate_sale:${params.transactionId || saleId}`;

  const newSale: AffiliateSale = {
    id: saleId,
    affiliateId: affiliate.id,
    affiliateCode: affiliate.code,
    affiliateName: affiliate.name,
    customerName: params.customerName || cleanEmail.split('@')[0],
    customerEmail: cleanEmail,
    customerPhone: params.customerPhone,
    customerCpf: params.customerCpf,
    plan: params.plan,
    planPrice: params.planPrice || (params.plan === 'monthly' ? 89.90 : 179.90),
    bumps: params.bumps || [],
    bumpPrices: params.bumpPrices || 0,
    totalAmount,
    commissionPercent,
    commissionAmount,
    isSelfPurchase,
    status: 'confirmed',
    createdAt: Date.now(),
    transactionId: params.transactionId
  };

  // 4. Salva a venda como registro único no Supabase
  await supabase.from('verification_tokens').delete().eq('identifier', finalSaleKey);
  await supabase.from('verification_tokens').insert({
    identifier: finalSaleKey,
    token: JSON.stringify(newSale),
    expires: EXPIRY_FAR_FUTURE
  });

  // 5. Atualiza métricas acumuladas do afiliado no Supabase
  affiliate.totalRevenue = Number(((affiliate.totalRevenue || 0) + totalAmount).toFixed(2));
  affiliate.totalSalesCount = (affiliate.totalSalesCount || 0) + 1;
  affiliate.pendingCommission = Number(((affiliate.pendingCommission || 0) + commissionAmount).toFixed(2));
  await dbSaveAffiliate(affiliate);

  // 6. Limpa transação pendente se houver
  if (params.transactionId) {
    await supabase.from('verification_tokens').delete().eq('identifier', `pending_pix:${params.transactionId}`);
  }
  await supabase.from('verification_tokens').delete().eq('identifier', `pending_pix_email:${cleanEmail}`);

  // 7. Vincula perpetuamente o lead
  await dbBindLead(cleanEmail, cleanCode);

  console.log(`[DB AFILIADOS] 🎉 VENDA GRAVADA NO SUPABASE: Afiliado "${cleanCode}" | Cliente: ${cleanEmail} | Total: R$ ${totalAmount} | Comissão: R$ ${commissionAmount}`);
  return newSale;
}

/**
 * 7. Salvar transação Pix pendente no banco Supabase
 */
export async function dbSavePendingPix(tx: PendingPixTransaction): Promise<void> {
  try {
    const supabase = getSupabaseAdmin('next_auth');
    const txToken = JSON.stringify(tx);

    // Salva pela chave principal da transação
    await supabase.from('verification_tokens').delete().eq('identifier', `pending_pix:${tx.transactionId}`);
    await supabase.from('verification_tokens').insert({
      identifier: `pending_pix:${tx.transactionId}`,
      token: txToken,
      expires: EXPIRY_FAR_FUTURE
    });

    // Salva índice por clientIdentifier se existir
    if (tx.clientIdentifier && tx.clientIdentifier !== tx.transactionId) {
      await supabase.from('verification_tokens').delete().eq('identifier', `pending_pix_client:${tx.clientIdentifier}`);
      await supabase.from('verification_tokens').insert({
        identifier: `pending_pix_client:${tx.clientIdentifier}`,
        token: txToken,
        expires: EXPIRY_FAR_FUTURE
      });
    }

    // Salva índice por email do cliente
    if (tx.email) {
      const cleanEmail = tx.email.toLowerCase().trim();
      await supabase.from('verification_tokens').delete().eq('identifier', `pending_pix_email:${cleanEmail}`);
      await supabase.from('verification_tokens').insert({
        identifier: `pending_pix_email:${cleanEmail}`,
        token: txToken,
        expires: EXPIRY_FAR_FUTURE
      });

      // Se há afiliado, já amarra o lead
      if (tx.affiliateCode) {
        await dbBindLead(cleanEmail, tx.affiliateCode);
      }
    }

    console.log(`[DB AFILIADOS] Transação pendente gravada no Supabase: ${tx.transactionId} (${tx.email}) -> Afiliado: ${tx.affiliateCode || 'Nenhum'}`);
  } catch (err) {
    console.error('[DB AFILIADOS] Erro ao gravar transação pendente no Supabase:', err);
  }
}

/**
 * 8. Buscar transação pendente por transactionId, clientIdentifier ou e-mail
 */
export async function dbGetPendingPix(idOrEmail: string): Promise<PendingPixTransaction | null> {
  try {
    if (!idOrEmail) return null;
    const clean = idOrEmail.trim().toLowerCase();
    const supabase = getSupabaseAdmin('next_auth');

    // 1. Tenta por ID direto
    const { data: byId } = await supabase
      .from('verification_tokens')
      .select('token')
      .eq('identifier', `pending_pix:${idOrEmail.trim()}`)
      .maybeSingle();

    if (byId?.token) {
      try { return JSON.parse(byId.token); } catch {}
    }

    // 2. Tenta por clientIdentifier
    const { data: byClient } = await supabase
      .from('verification_tokens')
      .select('token')
      .eq('identifier', `pending_pix_client:${idOrEmail.trim()}`)
      .maybeSingle();

    if (byClient?.token) {
      try { return JSON.parse(byClient.token); } catch {}
    }

    // 3. Tenta por email
    const { data: byEmail } = await supabase
      .from('verification_tokens')
      .select('token')
      .eq('identifier', `pending_pix_email:${clean}`)
      .maybeSingle();

    if (byEmail?.token) {
      try { return JSON.parse(byEmail.token); } catch {}
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * 9. Obter todas as transações pendentes para exibição no painel
 */
export async function dbGetPendingPixList(): Promise<PendingPixTransaction[]> {
  try {
    const supabase = getSupabaseAdmin('next_auth');
    const { data } = await supabase
      .from('verification_tokens')
      .select('identifier, token')
      .like('identifier', 'pending_pix:%');

    const list: PendingPixTransaction[] = [];
    const seenTxIds = new Set<string>();
    for (const row of data || []) {
      if (row.identifier.startsWith('pending_pix_client:') || row.identifier.startsWith('pending_pix_email:')) {
        continue;
      }
      try {
        const parsed = JSON.parse(row.token);
        if (parsed && parsed.transactionId && !seenTxIds.has(parsed.transactionId)) {
          seenTxIds.add(parsed.transactionId);
          list.push(parsed);
        }
      } catch {}
    }

    return list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch {
    return [];
  }
}

/**
 * 10. Amarrar lead a um afiliado de forma perpétua no Supabase
 */
export async function dbBindLead(email: string, affiliateCode: string): Promise<void> {
  try {
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanCode = resolveAffiliateCode(affiliateCode);
    if (!cleanEmail || !cleanCode || !cleanEmail.includes('@')) return;

    const supabase = getSupabaseAdmin('next_auth');
    const identifier = `lead_affiliate:${cleanEmail}`;

    await supabase.from('verification_tokens').delete().eq('identifier', identifier);
    await supabase.from('verification_tokens').insert({
      identifier,
      token: cleanCode,
      expires: EXPIRY_FAR_FUTURE
    });

    console.log(`[DB AFILIADOS] Lead "${cleanEmail}" vinculado perpetuamente ao afiliado "${cleanCode}" no Supabase.`);
  } catch (err) {
    console.error('[DB AFILIADOS] Erro ao vincular lead:', err);
  }
}

/**
 * 11. Recuperar o afiliado vinculado a um e-mail no Supabase
 */
export async function dbGetLeadAffiliate(email: string): Promise<string | null> {
  try {
    const cleanEmail = (email || '').toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) return null;

    const supabase = getSupabaseAdmin('next_auth');
    const { data } = await supabase
      .from('verification_tokens')
      .select('token')
      .eq('identifier', `lead_affiliate:${cleanEmail}`)
      .maybeSingle();

    return data?.token ? data.token.trim().toLowerCase() : null;
  } catch {
    return null;
  }
}

/**
 * 12. Marcar comissão como paga no banco Supabase
 */
export async function dbMarkCommissionPaid(affiliateIdOrCode: string): Promise<boolean> {
  try {
    const affiliates = await dbGetAffiliates();
    const aff = affiliates.find(a => a.id === affiliateIdOrCode || a.code.toLowerCase() === affiliateIdOrCode.toLowerCase());
    if (!aff || aff.pendingCommission <= 0) return false;

    const paidAmount = aff.pendingCommission;
    aff.paidCommission = Number(((aff.paidCommission || 0) + paidAmount).toFixed(2));
    aff.pendingCommission = 0;
    aff.lastPaidAt = Date.now();
    await dbSaveAffiliate(aff);

    // Atualiza status das vendas associadas para 'paid_to_affiliate'
    const sales = await dbGetSales();
    const supabase = getSupabaseAdmin('next_auth');

    for (const s of sales) {
      if ((s.affiliateId === aff.id || s.affiliateCode.toLowerCase() === aff.code.toLowerCase()) && s.status === 'confirmed') {
        const updatedSale = { ...s, status: 'paid_to_affiliate' as const };
        const key = `affiliate_sale:${s.transactionId || s.id}`;
        await supabase.from('verification_tokens').delete().eq('identifier', key);
        await supabase.from('verification_tokens').insert({
          identifier: key,
          token: JSON.stringify(updatedSale),
          expires: EXPIRY_FAR_FUTURE
        });
      }
    }

    console.log(`[DB AFILIADOS] Comissão de R$ ${paidAmount} marcada como paga para ${aff.name} no Supabase.`);
    return true;
  } catch (err) {
    console.error('[DB AFILIADOS] Erro ao pagar comissão no banco:', err);
    return false;
  }
}
