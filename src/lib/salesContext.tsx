'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { mockProducts, Product } from './mockData';
import { getDeterministicBaseline } from './deterministicSales';
import { registerSaleForCampaign, getDivulgados } from './divulgados';

export interface SaleItem {
  id: string;
  product: string;
  value: number;
  commission: number;
  time: string;
  timestamp?: number;
  image?: string;
}

export function formatSaleTime(timestamp?: number, fallbackStr?: string): string {
  const now = new Date();
  const todayStr = now.toDateString();
  const yesterdayStr = new Date(now.getTime() - 86400000).toDateString();

  if (timestamp && typeof timestamp === 'number' && !isNaN(timestamp)) {
    const d = new Date(timestamp);
    const dStr = d.toDateString();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');

    if (dStr === todayStr) {
      return `Hoje, ${hh}:${mm}`;
    }
    if (dStr === yesterdayStr) {
      return `Ontem, ${hh}:${mm}`;
    }
    const dd = String(d.getDate()).padStart(2, '0');
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mo}, ${hh}:${mm}`;
  }

  return fallbackStr || `Hoje, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export interface ChartHour {
  hour: string;
  valHoje: number;
  valOntem: number;
}

interface SalesContextType {
  vendasTotais: number;
  saldoDisponivel: number;
  visitas: number;
  cliques: number;
  pedidos: number;
  unidades: number;
  hourlyData: ChartHour[];
  recentSales: SaleItem[];
  autoSimulate: boolean;
  
  // Taxa de antecipação dinâmica
  taxaAntecipacao: number;

  // Configurações do Gerador
  intervalMode: 'range' | 'fixed';
  minSeconds: number;
  maxSeconds: number;
  fixedSeconds: number;
  selectedProductId: string; // 'all' ou ID do produto
  availableProducts: Product[];

  addSale: (targetProduct?: Partial<Product>, customPrice?: number) => void;
  triggerDelayedCampaignSales: (targetProduct: Partial<Product>, customPrice?: number) => void;
  resetData: () => void;
  toggleAutoSimulate: () => void;
  setIntervalMode: (mode: 'range' | 'fixed') => void;
  setMinSeconds: (val: number) => void;
  setMaxSeconds: (val: number) => void;
  setFixedSeconds: (val: number) => void;
  setSelectedProductId: (id: string) => void;
  setSaldoDisponivelDirect: (val: number) => void;
  isSoundEnabled: boolean;
  toggleSound: () => void;
}

const CLEAN_HOURLY: ChartHour[] = [
  { hour: '00', valHoje: 0, valOntem: 0 },
  { hour: '02', valHoje: 0, valOntem: 0 },
  { hour: '04', valHoje: 0, valOntem: 0 },
  { hour: '06', valHoje: 0, valOntem: 0 },
  { hour: '08', valHoje: 0, valOntem: 0 },
  { hour: '10', valHoje: 0, valOntem: 0 },
  { hour: '12', valHoje: 0, valOntem: 0 },
  { hour: '14', valHoje: 0, valOntem: 0 },
  { hour: '16', valHoje: 0, valOntem: 0 },
  { hour: '18', valHoje: 0, valOntem: 0 },
  { hour: '20', valHoje: 0, valOntem: 0 },
  { hour: '22', valHoje: 0, valOntem: 0 },
];

const SalesContext = createContext<SalesContextType | null>(null);

function playCashChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    // First high ping
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc1.frequency.exponentialRampToValueAtTime(1318.51, now + 0.1); // E6
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second bell ping
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1567.98, now + 0.08); // G6
    gain2.gain.setValueAtTime(0.25, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.45);
  } catch {
    // audio policy ignore
  }
}

const STORAGE_KEY = 'decolashop_sales_state_v3';

export function SalesProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const sessionEmail = session?.user?.email?.toLowerCase().trim();
  const userEmail = sessionEmail || (status === 'loading' ? '' : 'usuario@decolashop.com');
  const cleanEmailKey = (userEmail || 'guest').replace(/[^a-z0-9]/g, '_');
  const userStorageKey = `decolashop_sales_state_${cleanEmailKey}`;

  // Sincroniza e-mail ativo no localStorage para componentes periféricos (ex: divulgados)
  useEffect(() => {
    if (typeof window !== 'undefined' && userEmail) {
      try {
        localStorage.setItem('decolashop_active_user_email', userEmail);
      } catch {}
    }
  }, [userEmail]);

  const isGerenteUser = Boolean(
    userEmail === 'gerente@decolashop.com' || 
    userEmail === 'admin@decolashop.com' || 
    userEmail === 'admin@newshop.com' || 
    userEmail.includes('admin') || 
    userEmail.includes('gerente') ||
    (session?.user as any)?.role === 'gerente' ||
    (session?.user as any)?.role === 'admin'
  );
  const isNormalUser = !isGerenteUser;

  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const currentLoadedEmailRef = useRef<string | null>(null);
  const [vendasTotais, setVendasTotais] = useState<number>(0);
  const [saldoDisponivel, setSaldoDisponivel] = useState<number>(0);
  const [visitas, setVisitas] = useState<number>(0);
  const [cliques, setCliques] = useState<number>(0);
  const [pedidos, setPedidos] = useState<number>(0);
  const [unidades, setUnidades] = useState<number>(0);
  const [hourlyData, setHourlyData] = useState<ChartHour[]>(CLEAN_HOURLY);
  const [recentSales, setRecentSales] = useState<SaleItem[]>([]);
  // Vendas automáticas ativas por padrão para que nunca pare de cair vendas
  const [autoSimulate, setAutoSimulate] = useState<boolean>(true);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const isSoundEnabledRef = useRef(true);
  isSoundEnabledRef.current = isSoundEnabled;

  const toggleSound = () => {
    setIsSoundEnabled(prev => {
      const next = !prev;
      toast(next ? '🔊 Efeitos sonoros ativados' : '🔇 Efeitos sonoros silenciados', {
        icon: next ? '🔊' : '🔇',
        duration: 2000
      });
      return next;
    });
  };

  // Intervalo dinâmico (Gerente: 100s-400s, Usuários normais: 570s-630s = ~10 min)
  const [intervalMode, setIntervalMode] = useState<'range' | 'fixed'>('range');
  const [minSeconds, setMinSeconds] = useState<number>(isGerenteUser ? 100 : 570);
  const [maxSeconds, setMaxSeconds] = useState<number>(isGerenteUser ? 400 : 630);
  const [fixedSeconds, setFixedSeconds] = useState<number>(isGerenteUser ? 180 : 600);
  const [selectedProductId, setSelectedProductId] = useState<string>('all');
  const [availableProducts, setAvailableProducts] = useState<Product[]>(mockProducts);

  const autoSimulateRef = useRef(autoSimulate);
  autoSimulateRef.current = autoSimulate;

  // Carrega produtos reais do site (Supabase ou mockProducts)
  useEffect(() => {
    fetch('/api/public/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: Product[] = data.map((item: any) => ({
            id: String(item.id),
            name: item.name,
            title: item.name,
            price: item.price,
            image_url: item.image || item.image_url,
            hype_score: item.hype_score || 95,
            score: item.hype_score || 95,
            url: item.shopeeLink || 'https://shopee.com.br',
            category: item.category || 'Geral',
            commission: item.commission || `R$ ${(Number(item.price || 50) * 0.32).toFixed(2)}`,
          }));
          setAvailableProducts(mapped);
        }
      })
      .catch(() => {
        setAvailableProducts(mockProducts);
      });
  }, []);

  // 1. Carrega dados persistidos do localStorage no mount + Sincronização Nuvem + Fallback Determinístico
  useEffect(() => {
    if (status === 'loading' || !userEmail) return;
    let isCancelled = false;

    async function initializeSalesState() {
      try {
        const isUsuarioDemo = userEmail === 'usuario@decolashop.com';
        const NORMAL_USER_RESET_KEY = 'decolashop_normal_clean_zero_v10';
        const USUARIO_DEMO_APPLY_KEY = 'decolashop_usuario_history_700_1k_apply_v1';

        // Para os outros usuários normais (cliente, user, joao, aleghartz, etc.), garante reset inicial 100% zerado
        if (isNormalUser && !isUsuarioDemo && localStorage.getItem(`${NORMAL_USER_RESET_KEY}_${cleanEmailKey}`) !== 'done') {
          try {
            localStorage.setItem(`${NORMAL_USER_RESET_KEY}_${cleanEmailKey}`, 'done');
            localStorage.removeItem(userStorageKey);
            localStorage.removeItem(`decolashop_sales_state_${cleanEmailKey}`);
            localStorage.removeItem('decolashop_sales_state_usuario_decolashop_com');
            localStorage.removeItem(`decolashop_saldo_antecipado_${cleanEmailKey}`);
            localStorage.removeItem(`decolashop_saldo_antecipado_pago_${cleanEmailKey}`);
            localStorage.removeItem(`decolashop_has_withdrawn_${cleanEmailKey}`);
            localStorage.removeItem(`decolashop_notified_unlock_250_${cleanEmailKey}`);
            localStorage.removeItem('decolashop_divulgados');
            localStorage.removeItem(`decolashop_divulgados_${cleanEmailKey}`);
            localStorage.removeItem('decolashop_next_sale_target');
            fetch(`/api/user/sync-state?action=reset&email=${encodeURIComponent(userEmail)}`).catch(() => {});
          } catch {}
        }

        // Aplicação do histórico pequeno (700-1k/dia) exclusivamente na conta usuario@decolashop.com
        if (isUsuarioDemo && localStorage.getItem(USUARIO_DEMO_APPLY_KEY) !== 'done') {
          try {
            localStorage.setItem(USUARIO_DEMO_APPLY_KEY, 'done');
            localStorage.removeItem(userStorageKey);
            localStorage.removeItem('decolashop_sales_state_usuario_decolashop_com');
            localStorage.removeItem(`decolashop_notified_unlock_250_${cleanEmailKey}`);
            fetch('/api/user/sync-state?action=reset&email=usuario@decolashop.com').catch(() => {});
          } catch {}
        }

        let saved = localStorage.getItem(userStorageKey);

        // TRANSFERÊNCIA / MIGRAÇÃO AUTOMÁTICA COMPLETA (EXCLUSIVO GERENTE):
        if (isGerenteUser && !saved) {
          saved = 
            localStorage.getItem('decolashop_sales_state_gerente_decolashop_com') ||
            localStorage.getItem('decolashop_sales_state_admin_decolashop_com') ||
            localStorage.getItem('decolashop_sales_state_admin');

          if (saved) {
            try {
              localStorage.setItem(userStorageKey, saved);
              localStorage.setItem('decolashop_sales_state_gerente_decolashop_com', saved);
            } catch {}
          }
        }

        let parsed: any = null;
        if (saved) {
          try {
            parsed = JSON.parse(saved);
          } catch {}
        }

        // =========================================================================
        // CENÁRIO 1: CONTA GERENTE (Histórico Semanal de Vendas entre 3k e 5k/dia)
        // =========================================================================
        if (isGerenteUser) {
          if (!parsed || typeof parsed.vendasTotais !== 'number' || parsed.vendasTotais < 10000) {
            try {
              let syncRes = await fetch(`/api/user/sync-state?email=gerente@decolashop.com`);
              let syncJson = await syncRes.json();
              if (syncJson?.success && syncJson?.data && syncJson.data.vendasTotais >= 10000) {
                parsed = syncJson.data;
              }
            } catch {}

            if (!parsed || typeof parsed.vendasTotais !== 'number' || parsed.vendasTotais < 10000) {
              parsed = getDeterministicBaseline(userEmail, Date.now());
            }

            try {
              const str = JSON.stringify(parsed);
              localStorage.setItem(userStorageKey, str);
              localStorage.setItem('decolashop_sales_state_gerente_decolashop_com', str);
              localStorage.setItem('decolashop_sales_state_admin_decolashop_com', str);
              fetch('/api/user/sync-state', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail, state: parsed })
              }).catch(() => {});
            } catch {}
          }
        } else if (isUsuarioDemo) {
          // =========================================================================
          // CENÁRIO 2: CONTA USUÁRIO DEMO (Histórico Pequeno de 700 a 1k/dia)
          // =========================================================================
          if (!parsed || typeof parsed.vendasTotais !== 'number' || parsed.vendasTotais < 1000) {
            try {
              let syncRes = await fetch(`/api/user/sync-state?email=usuario@decolashop.com`);
              let syncJson = await syncRes.json();
              if (syncJson?.success && syncJson?.data && syncJson.data.vendasTotais >= 1000) {
                parsed = syncJson.data;
              }
            } catch {}

            if (!parsed || typeof parsed.vendasTotais !== 'number' || parsed.vendasTotais < 1000) {
              parsed = getDeterministicBaseline(userEmail, Date.now());
            }

            try {
              const str = JSON.stringify(parsed);
              localStorage.setItem(userStorageKey, str);
              localStorage.setItem('decolashop_sales_state_usuario_decolashop_com', str);
              fetch('/api/user/sync-state', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail, state: parsed })
              }).catch(() => {});
            } catch {}
          }
        } else {
          // =========================================================================
          // CENÁRIO 3: DEMAIS CONTAS DE USUÁRIOS REAIS (Começam 100% Zeradas)
          // =========================================================================
          // Se houver dados válidos salvos no localStorage ou na nuvem, PRESERVA 100%!
          // Nunca apaga faturamento ou saldo acumulado da conta do usuário.
          if (!parsed || typeof parsed.vendasTotais !== 'number') {
            try {
              let syncRes = await fetch(`/api/user/sync-state?email=${encodeURIComponent(userEmail)}`);
              let syncJson = await syncRes.json();
              if (syncJson?.success && syncJson?.data && typeof syncJson.data.vendasTotais === 'number') {
                parsed = syncJson.data;
              }
            } catch {}

            if (!parsed || typeof parsed.vendasTotais !== 'number') {
              parsed = getDeterministicBaseline(userEmail, Date.now());
            }

            try {
              localStorage.setItem(userStorageKey, JSON.stringify(parsed));
            } catch {}
          }
        }

        if (isCancelled) return;

        let currVendasTotais = typeof parsed.vendasTotais === 'number' ? parsed.vendasTotais : 0;
        let currSaldoDisponivel = typeof parsed.saldoDisponivel === 'number' ? parsed.saldoDisponivel : 0;
        let currVisitas = typeof parsed.visitas === 'number' ? parsed.visitas : 0;
        let currCliques = typeof parsed.cliques === 'number' ? parsed.cliques : 0;
        let currPedidos = typeof parsed.pedidos === 'number' ? parsed.pedidos : 0;
        let currUnidades = typeof parsed.unidades === 'number' ? parsed.unidades : 0;
        let currHourlyData: ChartHour[] = Array.isArray(parsed.hourlyData) ? [...parsed.hourlyData] : [...CLEAN_HOURLY];
        let currRecentSales: SaleItem[] = Array.isArray(parsed.recentSales) ? [...parsed.recentSales] : [];

        const nowMs = Date.now();
        const todayDateStr = new Date(nowMs).toDateString();
        const savedDateStr = parsed.lastSavedDate || (parsed.lastActiveTimestamp ? new Date(parsed.lastActiveTimestamp).toDateString() : null);

        // 1. CHECAGEM E TRANSIÇÃO DE MEIA-NOITE (VIRADA DE DATA):
        const isDayRollover = savedDateStr && savedDateStr !== todayDateStr;

        if (isDayRollover) {
          // Virou o dia! Move os valores de ontem para valOntem e reseta valHoje para hoje começar limpo
          currHourlyData = currHourlyData.map(h => ({
            hour: h.hour,
            valOntem: (h.valHoje || 0) > 0 ? (h.valHoje || 0) : (h.valOntem || 0),
            valHoje: 0
          }));

          // Atualiza as datas em recentSales para "Ontem"
          currRecentSales = currRecentSales.map(item => {
            let newTime = item.time;
            if (item.timestamp) {
              newTime = formatSaleTime(item.timestamp, item.time);
            } else if (typeof item.time === 'string' && item.time.startsWith('Hoje,')) {
              newTime = item.time.replace('Hoje,', 'Ontem,');
            }
            return { ...item, time: newTime };
          });
        } else {
          // Mesmo se for o mesmo dia, sanitiza resquícios de horas futuras (ex: se o usuário abriu à meia-noite e tinha dados de 14h gravados)
          const currentHourNum = new Date(nowMs).getHours();
          const currentBracketNum = Math.floor(currentHourNum / 2) * 2;
          let hasFutureGhostData = false;
          currHourlyData.forEach(h => {
            if (parseInt(h.hour, 10) > currentBracketNum && (h.valHoje || 0) > 0) {
              hasFutureGhostData = true;
            }
          });

          if (hasFutureGhostData) {
            currHourlyData = currHourlyData.map(h => {
              const hNum = parseInt(h.hour, 10);
              if (hNum > currentBracketNum) {
                return {
                  hour: h.hour,
                  valOntem: (h.valHoje || 0) > 0 ? (h.valHoje || 0) : (h.valOntem || 0),
                  valHoje: 0
                };
              }
              return h;
            });
            currRecentSales = currRecentSales.map(item => {
              let newTime = item.time;
              if (item.timestamp) {
                newTime = formatSaleTime(item.timestamp, item.time);
              } else if (typeof item.time === 'string' && item.time.startsWith('Hoje,')) {
                const matchHour = item.time.match(/(\d{2}):(\d{2})/);
                if (matchHour && parseInt(matchHour[1], 10) > currentHourNum) {
                  newTime = item.time.replace('Hoje,', 'Ontem,');
                }
              }
              return { ...item, time: newTime };
            });
          }
        }

        if (parsed.intervalMode) setIntervalMode(parsed.intervalMode);
        if (!isGerenteUser) {
          setMinSeconds(570);
          setMaxSeconds(630);
          setFixedSeconds(600);
        } else {
          if (parsed.minSeconds && parsed.minSeconds >= 80) setMinSeconds(parsed.minSeconds);
          if (parsed.maxSeconds && parsed.maxSeconds >= 200) setMaxSeconds(parsed.maxSeconds);
          if (parsed.fixedSeconds && parsed.fixedSeconds >= 60) setFixedSeconds(parsed.fixedSeconds);
        }
        if (parsed.selectedProductId) setSelectedProductId(parsed.selectedProductId);

        // Calcula vendas cronológicas retroativas de ausência (Para Gerente e para Membros com produtos/campanhas ativas)
        const newestSavedSaleTime = currRecentSales.length > 0 ? (currRecentSales[0].timestamp || 0) : 0;
        const referenceTime = parsed.lastActiveTimestamp || newestSavedSaleTime || 0;
        const elapsedMs = referenceTime > 0 ? (nowMs - referenceTime) : 0;
        const timeSinceNewestSale = newestSavedSaleTime > 0 ? (nowMs - newestSavedSaleTime) : elapsedMs;
        
        // Coleta produtos registrados pelo usuário (campanhas e favoritos)
        let userRegisteredProducts: any[] = [];
        try {
          const userCampaigns = getDivulgados(userEmail);
          if (Array.isArray(userCampaigns)) {
            userCampaigns.filter((d: any) => d.status === 'active').forEach((d: any) => {
              userRegisteredProducts.push({
                id: d.productId || d.id,
                name: d.name,
                price: typeof d.price === 'number' ? d.price : 99.90,
                image_url: d.image_url,
                category: d.category || 'Geral'
              });
            });
          }
          const rawSavs = localStorage.getItem('decolashop_saved_products');
          if (rawSavs) {
            const parsedSavs = JSON.parse(rawSavs);
            if (Array.isArray(parsedSavs)) {
              mockProducts.filter(p => parsedSavs.includes(p.id)).forEach(p => {
                userRegisteredProducts.push({
                  id: p.id,
                  name: p.name,
                  price: p.price,
                  image_url: p.image_url,
                  category: p.category || 'Geral'
                });
              });
            }
          }
        } catch {}

        const hasUserProds = userRegisteredProducts.length > 0;
        const shouldCatchUpSales = elapsedMs >= 180_000 || (timeSinceNewestSale >= 480_000 && (hasUserProds || isGerenteUser));

        let count = 0;
        if (isGerenteUser) {
          if (shouldCatchUpSales) {
            const elapsedMinutes = Math.max(
              Math.floor(elapsedMs / 60_000),
              Math.floor(timeSinceNewestSale / 60_000)
            );
            if (elapsedMinutes < 60) {
              count = Math.max(1, Math.min(5, Math.floor(elapsedMinutes / 9)));
            } else if (elapsedMinutes < 360) {
              count = Math.max(3, Math.min(10, Math.floor(elapsedMinutes / 28)));
            } else if (elapsedMinutes < 1440) {
              count = Math.max(8, Math.min(18, Math.floor(elapsedMinutes / 75)));
            } else {
              count = Math.floor(16 + Math.random() * 6);
            }
          }
        } else {
          // CONTAS DE USUÁRIOS NORMAIS:
          // 1. Contas novas ou com 0 vendas NUNCA recebem vendas retroativas de ausência!
          // 2. Se a conta já tiver vendas reais prévias e ficou ausente com campanhas ativas,
          //    computa estritamente no ritmo de 1 venda a cada 10 minutos (com teto moderado).
          if (currRecentSales.length > 0 && currVendasTotais > 0 && elapsedMs >= 600_000 && hasUserProds) {
            const elapsedMinutes = Math.floor(elapsedMs / 60_000);
            if (elapsedMinutes < 20) {
              count = 1;
            } else if (elapsedMinutes < 60) {
              count = Math.min(2, Math.floor(elapsedMinutes / 20));
            } else if (elapsedMinutes < 240) {
              count = Math.min(4, Math.floor(elapsedMinutes / 40));
            } else {
              count = Math.min(6, Math.floor(4 + Math.random() * 2));
            }
          } else {
            count = 0;
          }
        }

          if (count > 0) {
            const catalog = userRegisteredProducts.length > 0 
              ? userRegisteredProducts 
              : (mockProducts.length > 0 ? mockProducts : []);

            const effectiveElapsed = Math.min(Math.max(elapsedMs, count * 300_000), 24 * 3600 * 1000);
            const timeWindow = effectiveElapsed > 120_000 ? (effectiveElapsed - 60_000) : (count * 300_000);
            const step = Math.max(45_000, timeWindow / count);
            const startTimestamp = referenceTime > 0 ? referenceTime : (nowMs - timeWindow);

            let offlineGrossTotal = 0;
            let offlineCommissionTotal = 0;
            const generatedSales: SaleItem[] = [];

            for (let i = 0; i < count; i++) {
              const jitter = (Math.random() - 0.5) * 0.4 * step;
              const saleTimestamp = startTimestamp + (i + 0.5) * step + jitter;
              const clampedTimestamp = Math.min(nowMs - 30_000, Math.max(startTimestamp + 30_000, saleTimestamp));
              const saleDate = new Date(clampedTimestamp);
              
              const product = catalog[Math.floor(Math.random() * catalog.length)] || {
                name: 'Smartwatch W9 Pro Ultra Series 9',
                price: 149.90,
                image_url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=800'
              };
              
              let rawPrice = 149.90;
              if (typeof product.price === 'number') {
                rawPrice = product.price;
              } else if (typeof product.price === 'string') {
                const clean = product.price.replace('R$', '').replace(/\s/g, '').replace('.', '').replace(',', '.').trim();
                rawPrice = parseFloat(clean) || 149.90;
              }
              const comm = Math.round(rawPrice * 0.32 * 100) / 100;

              offlineGrossTotal += rawPrice;
              offlineCommissionTotal += comm;

              // Registra na campanha correspondente em divulgados
              registerSaleForCampaign(product.id || product.name, rawPrice);

              const isToday = saleDate.toDateString() === new Date(nowMs).toDateString();
              const isYesterday = saleDate.toDateString() === new Date(nowMs - 86400000).toDateString();
              
              let formattedTime = '';
              const hh = String(saleDate.getHours()).padStart(2, '0');
              const mm = String(saleDate.getMinutes()).padStart(2, '0');

              if (isToday) {
                formattedTime = `Hoje, ${hh}:${mm}`;
              } else if (isYesterday) {
                formattedTime = `Ontem, ${hh}:${mm}`;
              } else {
                const dd = String(saleDate.getDate()).padStart(2, '0');
                const mo = String(saleDate.getMonth() + 1).padStart(2, '0');
                formattedTime = `${dd}/${mo}, ${hh}:${mm}`;
              }

              generatedSales.push({
                id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
                product: product.name || (product as any).title || 'Produto DecolaShop',
                value: rawPrice,
                commission: comm,
                time: formattedTime,
                timestamp: saleDate.getTime(),
                image: product.image_url,
              });

              const bracketHour = String(Math.floor(saleDate.getHours() / 2) * 2).padStart(2, '0');
              currHourlyData = currHourlyData.map(h => {
                if (h.hour === bracketHour) {
                  if (isToday) {
                    return { ...h, valHoje: Math.round(((h.valHoje || 0) + rawPrice) * 100) / 100 };
                  } else if (isYesterday) {
                    return { ...h, valOntem: Math.round(((h.valOntem || 0) + rawPrice) * 100) / 100 };
                  }
                }
                return h;
              });
            }

            currRecentSales = [...generatedSales.reverse(), ...currRecentSales].slice(0, 100);
            currVendasTotais = Math.round((currVendasTotais + offlineGrossTotal) * 100) / 100;
            currSaldoDisponivel = Math.round((currSaldoDisponivel + offlineCommissionTotal) * 100) / 100;
            currPedidos = currPedidos + count;
            currUnidades = currUnidades + count;
            currCliques = currCliques + count * 6;
            currVisitas = currVisitas + count * 4;

            // Agenda a próxima venda ao vivo (Gerente: 20-40s, Normal: ~10 minutos = 570s a 630s)
            try {
              const liveDelaySec = isGerenteUser 
                ? Math.floor(Math.random() * 20 + 20) 
                : Math.floor(Math.random() * 60 + 570);
              const liveNextTarget = Date.now() + liveDelaySec * 1000;
              localStorage.setItem('decolashop_next_sale_target', String(liveNextTarget));
            } catch {}

            setTimeout(() => {
              if (isSoundEnabledRef.current) {
                playCashChime();
              }
              toast.custom((t) => (
                <div className={`p-4 rounded-2xl bg-[#0c1220]/95 border border-[#22c55e]/50 shadow-2xl shadow-[#22c55e]/20 text-white max-w-sm backdrop-blur-xl transition-all ${
                  t.visible ? 'animate-in slide-in-from-top-3 duration-300' : 'animate-out fade-out duration-200'
                }`}>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#22c55e] bg-[#22c55e]/15 px-2 py-0.5 rounded-full border border-[#22c55e]/30 flex items-center gap-1">
                      <span>🚀</span> Relatório de Ausência
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Piloto Automático</span>
                  </div>
                  <p className="text-xs font-bold text-slate-100 leading-snug">
                    Enquanto você esteve fora, sua loja realizou <strong className="text-[#4ade80] font-black">{count} novas vendas</strong>!
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Faturamento</span>
                      <strong className="text-white font-mono">R$ {offlineGrossTotal.toFixed(2).replace('.', ',')}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Lucro Líquido</span>
                      <strong className="text-[#22c55e] font-mono text-sm">+R$ {offlineCommissionTotal.toFixed(2).replace('.', ',')}</strong>
                    </div>
                  </div>
                </div>
              ), { duration: 7500 });
            }, 1200);
          }

        setVendasTotais(currVendasTotais);
        setSaldoDisponivel(currSaldoDisponivel);
        setVisitas(currVisitas);
        setCliques(currCliques);
        setPedidos(currPedidos);
        setUnidades(currUnidades);
        setHourlyData(currHourlyData);
        setRecentSales(currRecentSales);
      } catch {
        // ignore
      } finally {
        currentLoadedEmailRef.current = userEmail;
        setIsLoaded(true);
      }
    }

    initializeSalesState();

    return () => {
      isCancelled = true;
    };
  }, [userEmail, userStorageKey, status]);

  // 2. Salva no localStorage isolado por usuário e sincroniza com a nuvem silenciosamente
  useEffect(() => {
    if (!isLoaded || status === 'loading' || !userEmail) return;
    if (currentLoadedEmailRef.current !== userEmail) return;
    try {
      const dataToSave = {
        vendasTotais,
        saldoDisponivel,
        visitas,
        cliques,
        pedidos,
        unidades,
        hourlyData,
        recentSales,
        intervalMode,
        minSeconds,
        maxSeconds,
        fixedSeconds,
        selectedProductId,
        lastActiveTimestamp: Date.now(),
        lastSavedDate: new Date().toDateString()
      };
      localStorage.setItem(userStorageKey, JSON.stringify(dataToSave));
      if (isGerenteUser) {
        localStorage.setItem('decolashop_sales_state_gerente_decolashop_com', JSON.stringify(dataToSave));
        localStorage.setItem('decolashop_sales_state_admin_decolashop_com', JSON.stringify(dataToSave));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      }

      // Sincronização em nuvem leve (Background)
      if (typeof window !== 'undefined' && userEmail) {
        fetch('/api/user/sync-state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail, state: dataToSave })
        }).catch(() => {});
      }
    } catch {
      // ignore
    }
  }, [
    isLoaded,
    vendasTotais,
    saldoDisponivel,
    visitas,
    cliques,
    pedidos,
    unidades,
    hourlyData,
    recentSales,
    intervalMode,
    minSeconds,
    maxSeconds,
    fixedSeconds,
    selectedProductId,
    userStorageKey,
    userEmail
  ]);

  // Monitor em tempo real para virada da meia-noite (00:00) caso o usuário fique com a aba aberta
  useEffect(() => {
    let currentDayStr = new Date().toDateString();
    const interval = setInterval(() => {
      const nowDayStr = new Date().toDateString();
      if (nowDayStr !== currentDayStr) {
        currentDayStr = nowDayStr;
        // Virou o dia! Move valHoje de ontem para valOntem e zera valHoje de hoje
        setHourlyData(prev => prev.map(h => ({
          hour: h.hour,
          valOntem: (h.valHoje || 0) > 0 ? (h.valHoje || 0) : (h.valOntem || 0),
          valHoje: 0
        })));
        setRecentSales(prev => prev.map(s => ({
          ...s,
          time: formatSaleTime(s.timestamp, s.time)
        })));
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Taxa de Antecipação: Começa em R$ 0,00 e sobe de acordo com o saldo disponível (7% sobre o saldo), com limite máximo de R$ 150,00
  const taxaAntecipacao = Math.min(150, Math.round(saldoDisponivel * 0.07 * 100) / 100);

  const addSale = (targetProduct?: Partial<Product>, customPrice?: number) => {
    // Escolhe produto alvo, ou o selecionado no admin, ou produtos registrados pelo usuário, ou catálogo geral
    let chosen: Product;
    if (targetProduct && targetProduct.name) {
      chosen = targetProduct as Product;
    } else if (selectedProductId && selectedProductId !== 'all') {
      const found = availableProducts.find(p => p.id === selectedProductId);
      chosen = found || availableProducts[Math.floor(Math.random() * availableProducts.length)];
    } else {
      // Prioriza produtos registrados pelo usuário (campanhas ativas e salvos em favoritos)
      let userProds: Product[] = [];
      try {
        const userDivs = getDivulgados(userEmail);
        if (Array.isArray(userDivs)) {
          userDivs.filter((d: any) => d.status === 'active').forEach((d: any) => {
            userProds.push({
              id: d.productId || d.id,
              name: d.name,
              price: typeof d.price === 'number' ? d.price : 99.90,
              image_url: d.image_url,
              category: d.category || 'Geral',
              hype_score: 95,
              url: 'https://shopee.com.br'
            });
          });
        }
        const rawSavs = localStorage.getItem('decolashop_saved_products');
        if (rawSavs) {
          const parsedSavs = JSON.parse(rawSavs);
          if (Array.isArray(parsedSavs)) {
            availableProducts.filter(p => parsedSavs.includes(p.id)).forEach(p => {
              userProds.push(p);
            });
          }
        }
      } catch {}

      // Se o usuário tiver produtos registrados, 75% das vendas saem desses produtos!
      if (userProds.length > 0 && Math.random() < 0.75) {
        chosen = userProds[Math.floor(Math.random() * userProds.length)];
      } else {
        chosen = availableProducts[Math.floor(Math.random() * availableProducts.length)];
      }
    }

    if (!chosen) {
      chosen = mockProducts[0] || {
        id: '1',
        name: 'Smartwatch W9 Pro Ultra Series 9',
        price: 149.90,
        image_url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=800'
      };
    }

    let parsedPrice = 149.90;
    if (customPrice && customPrice > 0) {
      parsedPrice = customPrice;
    } else if (typeof chosen.price === 'number') {
      parsedPrice = chosen.price;
    } else if (typeof chosen.price === 'string') {
      const clean = chosen.price.replace('R$', '').replace(/\s/g, '').replace('.', '').replace(',', '.').trim();
      parsedPrice = parseFloat(clean) || 149.90;
    }

    const commissionVal = Math.round(parsedPrice * 0.32 * 100) / 100;
    const now = new Date();
    const timeStr = `Hoje, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const newTx: SaleItem = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      product: chosen.name || 'Produto DecolaShop',
      value: parsedPrice,
      commission: commissionVal,
      time: timeStr,
      timestamp: now.getTime(),
      image: chosen.image_url,
    };

    // Atualiza contadores da campanha em divulgados
    registerSaleForCampaign(chosen.id || chosen.name, parsedPrice, userEmail);

    setVendasTotais(prev => {
      const updated = Math.round((prev + parsedPrice) * 100) / 100;
      return updated;
    });

    setSaldoDisponivel(prev => {
      const updated = Math.round((prev + commissionVal) * 100) / 100;
      return updated;
    });

    setPedidos(prev => prev + 1);
    setUnidades(prev => prev + 1);
    setCliques(prev => prev + Math.floor(Math.random() * 5) + 2);
    setVisitas(prev => prev + Math.floor(Math.random() * 3) + 1);

    setRecentSales(prev => [newTx, ...prev.slice(0, 99)]);

    const currentHourStr = String(Math.floor(now.getHours() / 2) * 2).padStart(2, '0');
    setHourlyData(prev => prev.map(h => {
      if (h.hour === currentHourStr) {
        return { ...h, valHoje: Math.round((h.valHoje + parsedPrice) * 100) / 100 };
      }
      return h;
    }));

    if (isSoundEnabledRef.current) {
      playCashChime();
    }

    // Notificação com FOTO DO PRODUTO REAL
    toast.custom((t) => (
      <div className={`flex items-center gap-3 p-3.5 rounded-2xl bg-[#0d121f]/95 border border-[#22c55e]/50 shadow-2xl shadow-[#22c55e]/25 text-white max-w-sm backdrop-blur-xl ${
        t.visible ? 'animate-in slide-in-from-top-3 duration-300' : 'animate-out fade-out duration-200'
      }`}>
        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#22c55e]/40 flex-shrink-0 bg-slate-900">
          <img 
            src={chosen.image_url} 
            alt={chosen.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className="text-[9px] font-black uppercase tracking-wider text-[#22c55e] bg-[#22c55e]/15 px-1.5 py-0.5 rounded border border-[#22c55e]/30">
              Venda Aprovada! 🚀
            </span>
            <span className="text-xs font-black text-[#4ade80]">
              + R$ {commissionVal.toFixed(2)}
            </span>
          </div>
          <p className="text-xs font-bold text-white truncate leading-tight" title={chosen.name}>
            {chosen.name}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Valor: <strong className="text-slate-200">R$ {parsedPrice.toFixed(2)}</strong> • Despacho 24h
          </p>
        </div>
      </div>
    ), { duration: 4000 });
  };

  // Divulgação com IA: 1ª venda em ~10 minutos para usuários normais
  const triggerDelayedCampaignSales = (targetProduct: Partial<Product>, customPrice?: number) => {
    const isMgr = isGerenteUserRef.current;
    // 1ª Venda: Gerente 60s, Normal 600s (10 minutos)
    const initialDelayMs = isMgr ? 60000 : 600000;
    setTimeout(() => {
      addSale(targetProduct, customPrice);
      toast.success('🎉 Venda da sua campanha com IA acabou de cair! Comissões liberadas.', {
        duration: 5000,
        icon: '💰'
      });

      // Loop subsequente: Gerente 100s-400s, Normal ~10 minutos (570s a 630s)
      const scheduleSubsequent = () => {
        const randomSeconds = isMgr
          ? Math.floor(Math.random() * (400 - 100 + 1)) + 100
          : Math.floor(Math.random() * (630 - 570 + 1)) + 570;
        setTimeout(() => {
          addSale(targetProduct, customPrice);
          scheduleSubsequent();
        }, randomSeconds * 1000);
      };

      scheduleSubsequent();
    }, initialDelayMs);
  };

  const resetData = () => {
    let baseline: any = null;
    if (isGerenteUser) {
      baseline = getDeterministicBaseline('gerente@decolashop.com', Date.now());
    } else if (userEmail === 'usuario@decolashop.com') {
      baseline = getDeterministicBaseline('usuario@decolashop.com', Date.now());
    }

    if (baseline) {
      setVendasTotais(baseline.vendasTotais);
      setSaldoDisponivel(baseline.saldoDisponivel);
      setVisitas(baseline.visitas);
      setCliques(baseline.cliques);
      setPedidos(baseline.pedidos);
      setUnidades(baseline.unidades);
      setHourlyData(baseline.hourlyData);
      setRecentSales(baseline.recentSales);
      setAutoSimulate(true);

      try {
        const str = JSON.stringify(baseline);
        localStorage.setItem(userStorageKey, str);
        if (isGerenteUser) {
          localStorage.setItem('decolashop_sales_state_gerente_decolashop_com', str);
          localStorage.setItem('decolashop_sales_state_admin_decolashop_com', str);
        } else {
          localStorage.setItem('decolashop_sales_state_usuario_decolashop_com', str);
        }
        fetch('/api/user/sync-state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail, state: baseline })
        }).catch(() => {});
      } catch {}
    } else {
      setVendasTotais(0);
      setSaldoDisponivel(0);
      setVisitas(0);
      setCliques(0);
      setPedidos(0);
      setUnidades(0);
      setHourlyData(CLEAN_HOURLY);
      setRecentSales([]);
      setAutoSimulate(true);

      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(userStorageKey);
        localStorage.removeItem('decolashop_sales_state_v2');
        localStorage.removeItem('decolashop_sales_state');
        localStorage.removeItem(`decolashop_sales_state_${cleanEmailKey}`);
        localStorage.removeItem(`decolashop_divulgados_${cleanEmailKey}`);
        localStorage.removeItem('decolashop_divulgados');
        localStorage.removeItem('decolashop_next_sale_target');
        fetch(`/api/user/sync-state?action=reset&email=${encodeURIComponent(userEmail)}`).catch(() => {});
      } catch {}
    }

    try {
      localStorage.removeItem('decolashop_saldo_antecipado');
      localStorage.removeItem(`decolashop_saldo_antecipado_${cleanEmailKey}`);
      localStorage.removeItem(`decolashop_saldo_antecipado_pago_${cleanEmailKey}`);
      localStorage.removeItem(`decolashop_has_withdrawn_${cleanEmailKey}`);
      localStorage.removeItem(`decolashop_notified_unlock_250_${cleanEmailKey}`);
      localStorage.removeItem('decolashop_divulgados');
      localStorage.removeItem('decolashop_next_sale_target');
      window.dispatchEvent(new Event('decolashop_divulgados_updated'));
    } catch {}

    toast.success('Conta redefinida com sucesso para o estado inicial.');
  };

  const setSaldoDisponivelDirect = (val: number) => {
    setSaldoDisponivel(val);
  };

  const toggleAutoSimulate = () => {
    setAutoSimulate(prev => {
      const next = !prev;
      if (next) {
        const desc = intervalMode === 'range' 
          ? `entre ${minSeconds}s e ${maxSeconds}s`
          : `a cada ${fixedSeconds}s`;
        toast(`🚀 Tráfego Contínuo Ativado (${desc})`, { 
          icon: '⚡',
          style: { background: '#111726', color: '#4ade80', border: '1px solid rgba(34,197,94,0.4)' }
        });
      } else {
        toast('Tráfego Contínuo Pausado.', { icon: '⏸️' });
      }
      return next;
    });
  };

  // Stable refs para garantir agendamento contínuo sem cancelamento por re-render
  const addSaleRef = useRef(addSale);
  addSaleRef.current = addSale;
  const isGerenteUserRef = useRef(isGerenteUser);
  isGerenteUserRef.current = isGerenteUser;

  // Sistema Contínuo e Infalível de Vendas em Tempo Real (Gerente e Membros)
  // As vendas NUNCA param de cair para nenhuma conta ativa!
  useEffect(() => {
    if (!autoSimulate) return;

    let timerId: NodeJS.Timeout | null = null;
    let isCancelled = false;

    const scheduleNextSale = () => {
      if (isCancelled) return;

      let delayMs: number;
      const isMgr = isGerenteUserRef.current;
      const now = Date.now();

      // Checa agendamento persistido no localStorage para não reiniciar o tempo ao navegar ou recarregar
      let targetTimestamp = 0;
      try {
        const stored = localStorage.getItem('decolashop_next_sale_target');
        if (stored) targetTimestamp = parseInt(stored, 10);
      } catch {}

      if (targetTimestamp > 0 && targetTimestamp > now) {
        // Usa o tempo restante do agendamento prévio
        delayMs = Math.max(5000, targetTimestamp - now);
      } else {
        let nextSec: number;
        if (isMgr) {
          // CONTA DE GERENTE: intervalo solicitado entre 100s e 400s (ou customizado pelo admin)
          if (intervalMode === 'fixed') {
            nextSec = Math.max(5, fixedSeconds);
          } else if (intervalMode === 'range' && (minSeconds !== 100 || maxSeconds !== 400)) {
            const min = Math.max(5, minSeconds);
            const max = Math.max(min, maxSeconds);
            nextSec = Math.floor(Math.random() * (max - min + 1)) + min;
          } else {
            nextSec = Math.floor(Math.random() * (400 - 100 + 1)) + 100;
          }
        } else {
          // CONTAS DE MEMBROS NORMAIS:
          // Ritmo solicitado: estritamente 1 venda a cada 10 minutos (~570s a 630s, média 600s = 10 min)
          if (intervalMode === 'fixed') {
            nextSec = Math.max(60, fixedSeconds);
          } else {
            nextSec = Math.floor(Math.random() * (630 - 570 + 1)) + 570;
          }
        }
        delayMs = nextSec * 1000;
        try {
          localStorage.setItem('decolashop_next_sale_target', String(now + delayMs));
        } catch {}
      }

      timerId = setTimeout(() => {
        if (!isCancelled && autoSimulateRef.current) {
          addSaleRef.current();
          try {
            localStorage.removeItem('decolashop_next_sale_target');
          } catch {}
          scheduleNextSale();
        }
      }, delayMs);
    };

    scheduleNextSale();

    // Quando o usuário volta para a aba do navegador após tê-la minimizado ou trocado de aba
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isCancelled && autoSimulateRef.current) {
        const now = Date.now();
        let target = 0;
        try {
          const stored = localStorage.getItem('decolashop_next_sale_target');
          if (stored) target = parseInt(stored, 10);
        } catch {}

        if (target > 0 && now >= target) {
          addSaleRef.current();
          try {
            localStorage.removeItem('decolashop_next_sale_target');
          } catch {}
          if (timerId) clearTimeout(timerId);
          scheduleNextSale();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isCancelled = true;
      if (timerId) clearTimeout(timerId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [autoSimulate, intervalMode, minSeconds, maxSeconds, fixedSeconds]);

  return (
    <SalesContext.Provider value={{
      vendasTotais,
      saldoDisponivel,
      visitas,
      cliques,
      pedidos,
      unidades,
      hourlyData,
      recentSales,
      autoSimulate,
      taxaAntecipacao,
      intervalMode,
      minSeconds,
      maxSeconds,
      fixedSeconds,
      selectedProductId,
      availableProducts,
      addSale,
      triggerDelayedCampaignSales,
      resetData,
      toggleAutoSimulate,
      setIntervalMode,
      setMinSeconds,
      setMaxSeconds,
      setFixedSeconds,
      setSelectedProductId,
      setSaldoDisponivelDirect,
      isSoundEnabled,
      toggleSound,
    }}>
      {children}
    </SalesContext.Provider>
  );
}

export function useSales() {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
}
