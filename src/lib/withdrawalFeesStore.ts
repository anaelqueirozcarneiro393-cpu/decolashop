import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

export interface PaidWithdrawalFee {
  id: string;
  transactionId?: string;
  customerEmail: string;
  customerName?: string;
  amount: number;
  paidAt: number;
  status: 'confirmed';
}

export interface WithdrawalFeesStore {
  totalCount: number;
  totalAmount: number;
  fees: PaidWithdrawalFee[];
}

const SUPABASE_FEES_STORE_KEY = 'system:paid_withdrawal_fees_v1';

function getStoragePaths(): string[] {
  const paths = [path.join(process.cwd(), '.withdrawal_fees_data.json')];
  try {
    const tmpPath = path.join('/tmp', '.withdrawal_fees_data.json');
    if (!paths.includes(tmpPath)) {
      paths.push(tmpPath);
    }
  } catch {}
  return paths;
}

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
let memoryStore: WithdrawalFeesStore = {
  totalCount: 0,
  totalAmount: 0,
  fees: []
};

export function saveLocalFeesStore(store: WithdrawalFeesStore) {
  memoryStore = store;
  const paths = getStoragePaths();
  for (const filePath of paths) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(store, null, 2), 'utf-8');
    } catch {}
  }
}

export function loadLocalFeesStore(): WithdrawalFeesStore {
  const paths = getStoragePaths();
  for (const filePath of paths) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.fees)) {
          if (parsed.fees.length >= memoryStore.fees.length) {
            memoryStore = {
              totalCount: parsed.totalCount ?? parsed.fees.length,
              totalAmount: parsed.totalAmount ?? parsed.fees.reduce((acc: number, f: any) => acc + (Number(f.amount) || 0), 0),
              fees: parsed.fees
            };
          }
        }
      }
    } catch {}
  }
  return memoryStore;
}

export async function loadFeesStoreFromSupabase(): Promise<WithdrawalFeesStore> {
  try {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('verification_tokens')
        .select('token')
        .eq('identifier', SUPABASE_FEES_STORE_KEY)
        .maybeSingle();

      if (data?.token) {
        const parsed = JSON.parse(data.token);
        if (parsed && Array.isArray(parsed.fees)) {
          memoryStore = {
            totalCount: parsed.totalCount ?? parsed.fees.length,
            totalAmount: parsed.totalAmount ?? parsed.fees.reduce((acc: number, f: any) => acc + (Number(f.amount) || 0), 0),
            fees: parsed.fees
          };
          saveLocalFeesStore(memoryStore);
          return memoryStore;
        }
      }
    }
  } catch (err) {
    console.warn('[TAXAS SAQUE] Erro ao carregar taxas do Supabase:', err);
  }
  return loadLocalFeesStore();
}

export async function saveFeesStoreToSupabase(store: WithdrawalFeesStore) {
  saveLocalFeesStore(store);
  try {
    const supabase = getSupabase();
    if (supabase) {
      const token = JSON.stringify(store);
      const { error } = await supabase
        .from('verification_tokens')
        .update({ token, expires: new Date('2099-01-01').toISOString() })
        .eq('identifier', SUPABASE_FEES_STORE_KEY);

      if (error) {
        await supabase
          .from('verification_tokens')
          .insert({
            identifier: SUPABASE_FEES_STORE_KEY,
            token,
            expires: new Date('2099-01-01').toISOString()
          });
      }
    }
  } catch (err) {
    console.error('[TAXAS SAQUE] Erro ao sincronizar taxas de saque com Supabase:', err);
  }
}

/**
 * Registra o pagamento de uma taxa de saque / antecipação.
 * Bloqueia duplicatas por transactionId e por e-mail em janela recente de 10 min.
 */
export async function recordPaidWithdrawalFee(params: {
  transactionId?: string;
  customerEmail: string;
  customerName?: string;
  amount: number;
  paidAt?: number;
}): Promise<PaidWithdrawalFee | null> {
  const store = await loadFeesStoreFromSupabase();
  const cleanEmail = (params.customerEmail || '').toLowerCase().trim();
  const numAmount = Number(params.amount) || 150;
  const timestamp = params.paidAt || Date.now();

  // 1. Evita duplicata por transactionId
  if (params.transactionId) {
    const existingTx = store.fees.find(f => f.transactionId === params.transactionId);
    if (existingTx) {
      console.log(`[TAXAS SAQUE] Taxa com transactionId ${params.transactionId} já registrada.`);
      return existingTx;
    }
  }

  // 2. Evita duplicata por e-mail recente (últimos 10 minutos)
  const recentDuplicate = store.fees.find(f => 
    f.customerEmail.toLowerCase() === cleanEmail &&
    Math.abs(timestamp - (f.paidAt || 0)) < 10 * 60 * 1000
  );
  if (recentDuplicate) {
    console.log(`[TAXAS SAQUE] Pagamento de taxa recente já registrado para ${cleanEmail}.`);
    return recentDuplicate;
  }

  const newFee: PaidWithdrawalFee = {
    id: `fee_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    transactionId: params.transactionId,
    customerEmail: cleanEmail,
    customerName: params.customerName || cleanEmail.split('@')[0],
    amount: numAmount,
    paidAt: timestamp,
    status: 'confirmed'
  };

  store.fees.unshift(newFee);
  store.totalCount = store.fees.length;
  store.totalAmount = Number(store.fees.reduce((acc, f) => acc + (f.amount || 0), 0).toFixed(2));

  await saveFeesStoreToSupabase(store);
  console.log(`[TAXAS SAQUE] 🎉 Nova taxa de saque registrada! Cliente: ${cleanEmail} - Valor: R$ ${numAmount}. Total acumulado: ${store.totalCount} taxas (R$ ${store.totalAmount})`);

  return newFee;
}

export async function getPaidWithdrawalFeesMetrics(): Promise<WithdrawalFeesStore> {
  return await loadFeesStoreFromSupabase();
}
