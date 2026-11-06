'use client';

import { useState, useEffect, useCallback } from 'react';

export const LIFETIME_INITIAL_CREDITS = 50; // Plano Vitalício vem com 50 créditos
export const MONTHLY_INITIAL_CREDITS = 30;  // Plano Mensal vem com 30 créditos
export const DEFAULT_INITIAL_CREDITS = 30;  // Base padrão
export const DEFAULT_SLOT_LIMIT = 15;       // Limite padrão de 15 produtos divulgados

export const CREDIT_COSTS = {
  PUBLISH_AI: 3,         // Divulgar Produto com IA (Canais e Margens)
  SUPPLIER_MINING: 2,    // Mineração Profunda de Fornecedor Secreto
  EXPAND_SLOTS: 10,      // Aumentar limite de 15 produtos (+5 vagas)
};

export const RECHARGE_PACKAGES = [
  {
    id: 'pack_basico',
    name: 'Básico',
    credits: 40,
    bonusCredits: 0,
    totalCredits: 40,
    price: 9.90,
    pricePerCredit: 'R$ 0,24',
    badge: 'Iniciante',
    badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    popular: false,
    description: 'Ideal para testar e divulgar seus primeiros produtos com IA.',
  },
  {
    id: 'pack_turbo',
    name: 'Turbo Escala',
    credits: 100,
    bonusCredits: 20,
    totalCredits: 120,
    price: 19.90,
    pricePerCredit: 'R$ 0,16',
    badge: 'Mais Vendido 🔥',
    badgeColor: 'bg-[#22c55e]/20 text-[#4ade80] border-[#22c55e]/40 shadow-sm shadow-[#22c55e]/20',
    popular: true,
    description: 'Melhor custo-benefício. Garanta criativos, mineração e vagas extras.',
  },
  {
    id: 'pack_imperio',
    name: 'Escala Total',
    credits: 280,
    bonusCredits: 70,
    totalCredits: 350,
    price: 39.90,
    pricePerCredit: 'R$ 0,11',
    badge: 'Máxima Margem ⚡',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    popular: false,
    description: 'Para quem opera como agência e escala múltiplos canais todos os dias.',
  },
];

function getCleanEmailKey(email?: string): string {
  if (!email && typeof window !== 'undefined') {
    email = localStorage.getItem('decolashop_user_email') || localStorage.getItem('decolashop_active_user_email') || 'default';
  }
  return (email || 'default').toLowerCase().replace(/[^a-z0-9_]/g, '_');
}

export function getInitialCreditsForPlan(plan?: string | null, email?: string): number {
  const cleanEmail = (email || '').toLowerCase().trim();
  const rawPlan = (
    plan ||
    (typeof window !== 'undefined' ? localStorage.getItem('decolashop_user_plan') : null) ||
    ''
  ).toLowerCase().trim();

  const isLifetime = 
    rawPlan === 'lifetime' || 
    rawPlan === 'vitalicio' || 
    cleanEmail === 'gerente@decolashop.com' || 
    cleanEmail === 'admin@decolashop.com' ||
    cleanEmail.includes('admin') ||
    cleanEmail.includes('gerente');

  return isLifetime ? LIFETIME_INITIAL_CREDITS : MONTHLY_INITIAL_CREDITS;
}

export function getUserCredits(email?: string, plan?: string): number {
  if (typeof window === 'undefined') return LIFETIME_INITIAL_CREDITS;
  const cleanKey = getCleanEmailKey(email);
  const key = `decolashop_ai_credits_${cleanKey}`;
  const planInitKey = `decolashop_plan_credits_initialized_v3_${cleanKey}`;
  const stored = localStorage.getItem(key);
  const expectedInitial = getInitialCreditsForPlan(plan, email);

  // Primeira inicialização para a conta
  if (stored === null) {
    localStorage.setItem(key, String(expectedInitial));
    localStorage.setItem(planInitKey, 'true');
    return expectedInitial;
  }

  const parsed = parseInt(stored, 10);
  const current = isNaN(parsed) ? expectedInitial : parsed;

  // Garante que Vitalício venha com pelo menos 50 créditos e Mensal com pelo menos 30 créditos
  const isInitialized = localStorage.getItem(planInitKey);
  if (!isInitialized) {
    localStorage.setItem(planInitKey, 'true');
    if (current < expectedInitial) {
      localStorage.setItem(key, String(expectedInitial));
      return expectedInitial;
    }
  }

  return current;
}

export function setUserCredits(amount: number, email?: string): void {
  if (typeof window === 'undefined') return;
  const key = `decolashop_ai_credits_${getCleanEmailKey(email)}`;
  localStorage.setItem(key, String(Math.max(0, amount)));
  window.dispatchEvent(new Event('decolashop_credits_updated'));
}

export function deductCredits(amount: number, reason: string, email?: string): boolean {
  const current = getUserCredits(email);
  if (current < amount) {
    openCreditsModal(`Você precisa de ${amount} créditos de IA para esta ação (Saldo: ${current}).`);
    return false;
  }
  setUserCredits(current - amount, email);
  return true;
}

export function addCredits(amount: number, reason: string, email?: string): number {
  const current = getUserCredits(email);
  const updated = current + amount;
  setUserCredits(updated, email);
  return updated;
}

export function getCampaignSlotLimit(email?: string): number {
  if (typeof window === 'undefined') return DEFAULT_SLOT_LIMIT;
  const key = `decolashop_extra_slots_${getCleanEmailKey(email)}`;
  const extra = parseInt(localStorage.getItem(key) || '0', 10);
  return DEFAULT_SLOT_LIMIT + (isNaN(extra) ? 0 : extra);
}

export function expandCampaignSlots(slotsToAdd: number = 5, email?: string): number {
  if (typeof window === 'undefined') return DEFAULT_SLOT_LIMIT;
  const key = `decolashop_extra_slots_${getCleanEmailKey(email)}`;
  const extra = parseInt(localStorage.getItem(key) || '0', 10);
  const updatedExtra = (isNaN(extra) ? 0 : extra) + slotsToAdd;
  localStorage.setItem(key, String(updatedExtra));
  window.dispatchEvent(new Event('decolashop_credits_updated'));
  return DEFAULT_SLOT_LIMIT + updatedExtra;
}

// Global modal trigger helper
export function openCreditsModal(contextReason?: string, recommendedPackageId?: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('decolashop_open_credits_modal', {
      detail: { contextReason, recommendedPackageId },
    })
  );
}

// Hook reativo para qualquer componente React
export function useCredits(email?: string, plan?: string) {
  const [credits, setCreditsState] = useState<number>(() => getUserCredits(email, plan));
  const [slotLimit, setSlotLimitState] = useState<number>(() => getCampaignSlotLimit(email));

  const sync = useCallback(() => {
    setCreditsState(getUserCredits(email, plan));
    setSlotLimitState(getCampaignSlotLimit(email));
  }, [email, plan]);

  useEffect(() => {
    sync();
    window.addEventListener('decolashop_credits_updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('decolashop_credits_updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, [sync]);

  const deduct = useCallback(
    (amount: number, reason: string) => deductCredits(amount, reason, email),
    [email]
  );

  const add = useCallback(
    (amount: number, reason: string) => addCredits(amount, reason, email),
    [email]
  );

  const expandSlots = useCallback(
    (slotsToAdd: number = 5) => expandCampaignSlots(slotsToAdd, email),
    [email]
  );

  const openRecharge = useCallback(
    (reason?: string, packId?: string) => openCreditsModal(reason, packId),
    []
  );

  return {
    credits,
    slotLimit,
    deductCredits: deduct,
    addCredits: add,
    expandSlots,
    openRecharge,
    isLowCredits: credits < 5,
  };
}
