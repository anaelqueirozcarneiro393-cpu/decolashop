'use client';

import { useState, useEffect, useCallback } from 'react';

export type RegionCurrency = 'BRL' | 'USD';

export const CURRENCY_STORAGE_KEY = 'decolashop_dashboard_currency';
export const CURRENCY_EVENT = 'decolashop_currency_changed';

export function getStoredCurrency(): RegionCurrency {
  if (typeof window === 'undefined') return 'BRL';
  try {
    const val = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (val === 'USD' || val === 'BRL') return val;
  } catch {}
  return 'BRL';
}

export function setStoredCurrency(newCurrency: RegionCurrency) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
    window.dispatchEvent(new CustomEvent(CURRENCY_EVENT, { detail: newCurrency }));
  } catch {}
}

export function useRegionCurrency() {
  const [currency, setCurrencyState] = useState<RegionCurrency>(() => getStoredCurrency());

  useEffect(() => {
    // Sincroniza estado inicial
    setCurrencyState(getStoredCurrency());

    const handleCurrencyChange = (e: Event) => {
      const custom = e as CustomEvent<RegionCurrency>;
      if (custom.detail && (custom.detail === 'USD' || custom.detail === 'BRL')) {
        setCurrencyState(custom.detail);
      } else {
        setCurrencyState(getStoredCurrency());
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === CURRENCY_STORAGE_KEY && (e.newValue === 'USD' || e.newValue === 'BRL')) {
        setCurrencyState(e.newValue);
      }
    };

    window.addEventListener(CURRENCY_EVENT, handleCurrencyChange);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(CURRENCY_EVENT, handleCurrencyChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const setCurrency = useCallback((newCurrency: RegionCurrency) => {
    setCurrencyState(newCurrency);
    setStoredCurrency(newCurrency);
  }, []);

  const toggleRegion = useCallback(() => {
    const next: RegionCurrency = currency === 'BRL' ? 'USD' : 'BRL';
    setCurrency(next);
  }, [currency, setCurrency]);

  const isUsd = currency === 'USD';

  return {
    currency,
    isUsd,
    isExterior: isUsd,
    setCurrency,
    toggleRegion,
  };
}
