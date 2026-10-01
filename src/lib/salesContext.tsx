'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { mockProducts, Product } from './mockData';
import { getDeterministicBaseline } from './deterministicSales';

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
  const { data: session } = useSession();
  const userEmail = session?.user?.email?.toLowerCase().trim() || 'usuario@decolashop.com';
  const cleanEmailKey = userEmail.replace(/[^a-z0-9]/g, '_');
  const userStorageKey = `decolashop_sales_state_${cleanEmailKey}`;

  const isNormalUser = userEmail === 'usuario@decolashop.com' || userEmail === 'cliente@decolashop.com' || userEmail === 'user@decolashop.com';
  const isAdmin = !isNormalUser && (
    userEmail === 'admin@decolashop.com' || 
    userEmail === 'admin@newshop.com' || 
    userEmail === 'gerente@decolashop.com' ||
    userEmail.includes('admin') || 
    userEmail.includes('gerente') ||
    (session?.user as any)?.role === 'gerente' ||
    (session?.user as any)?.role === 'admin'
  );

  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [vendasTotais, setVendasTotais] = useState<number>(0);
  const [saldoDisponivel, setSaldoDisponivel] = useState<number>(0);
  const [visitas, setVisitas] = useState<number>(0);
  const [cliques, setCliques] = useState<number>(0);
  const [pedidos, setPedidos] = useState<number>(0);
  const [unidades, setUnidades] = useState<number>(0);
  const [hourlyData, setHourlyData] = useState<ChartHour[]>(CLEAN_HOURLY);
  const [recentSales, setRecentSales] = useState<SaleItem[]>([]);
  const [autoSimulate, setAutoSimulate] = useState<boolean>(false);
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

  // Intervalo configurável pelo admin
  const [intervalMode, setIntervalMode] = useState<'range' | 'fixed'>('range');
  const [minSeconds, setMinSeconds] = useState<number>(1);
  const [maxSeconds, setMaxSeconds] = useState<number>(7);
  const [fixedSeconds, setFixedSeconds] = useState<number>(5);
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
    let isCancelled = false;

    async function initializeSalesState() {
      try {
        let saved = localStorage.getItem(userStorageKey);

        // TRANSFERÊNCIA / MIGRAÇÃO AUTOMÁTICA COMPLETA:
        // Se a conta for gerente@decolashop.com (ou admin@decolashop.com ou isAdmin),
        // busca todo o histórico anterior da conta admin para transferir sem perder absolutamente nada!
        if (!saved && (userEmail === 'gerente@decolashop.com' || userEmail === 'admin@decolashop.com' || isAdmin)) {
          saved = 
            localStorage.getItem('decolashop_sales_state_gerente_decolashop_com') ||
            localStorage.getItem('decolashop_sales_state_admin_decolashop_com') ||
            localStorage.getItem('decolashop_sales_state_admin') ||
            localStorage.getItem(STORAGE_KEY) ||
            localStorage.getItem('decolashop_sales_state_v2') ||
            localStorage.getItem('decolashop_sales_state');

          if (saved) {
            try {
              localStorage.setItem(userStorageKey, saved);
              localStorage.setItem('decolashop_sales_state_gerente_decolashop_com', saved);
            } catch {}
          }
        }

        // Fallback para chave anterior geral se a do usuário não existir
        if (!saved && userEmail === 'usuario@decolashop.com') {
          saved = localStorage.getItem(STORAGE_KEY);
        }

        let parsed: any = null;
        if (saved) {
          try {
            parsed = JSON.parse(saved);
          } catch {}
        }

        // Se o localStorage estiver vazio (novo dispositivo, cache limpo ou aba anônima):
        if (!parsed || typeof parsed.vendasTotais !== 'number') {
          // 1. Tenta buscar da nuvem (API de sincronização)
          try {
            let syncRes = await fetch(`/api/user/sync-state?email=${encodeURIComponent(userEmail)}`);
            let syncJson = await syncRes.json();
            if ((!syncJson?.success || !syncJson?.data) && (userEmail === 'gerente@decolashop.com' || isAdmin)) {
              syncRes = await fetch(`/api/user/sync-state?email=admin@decolashop.com`);
              syncJson = await syncRes.json();
            }
            if (syncJson?.success && syncJson?.data && typeof syncJson.data.vendasTotais === 'number') {
              parsed = syncJson.data;
            }
          } catch {}

          // 2. Se a nuvem não tiver dados (primeiro acesso da conta):
          // Executa a Maracutaia da Semente Determinística (Seed Temporal):
          // Gera um histórico 100% consistente que será IDÊNTICO em qualquer dispositivo que logar com esse e-mail!
          if (!parsed || typeof parsed.vendasTotais !== 'number') {
            parsed = getDeterministicBaseline(userEmail, Date.now());
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
        if (parsed.minSeconds) setMinSeconds(parsed.minSeconds);
        if (parsed.maxSeconds) setMaxSeconds(parsed.maxSeconds);
        if (parsed.fixedSeconds) setFixedSeconds(parsed.fixedSeconds);
        if (parsed.selectedProductId) setSelectedProductId(parsed.selectedProductId);

        // Se o usuário já tinha registros salvos e ficou fora por mais de 4 minutos, calcula vendas cronológicas retroativas
        if (parsed.lastActiveTimestamp && typeof parsed.lastActiveTimestamp === 'number') {
          const elapsedMs = nowMs - parsed.lastActiveTimestamp;

          if (elapsedMs >= 240_000) { // pelo menos 4 minutos
            const elapsedMinutes = Math.floor(elapsedMs / 60_000);
            
            // Quantidade de vendas realista baseada no tempo fora
            let count = 0;
            if (elapsedMinutes < 60) {
              count = Math.max(1, Math.min(5, Math.floor(elapsedMinutes / 9)));
            } else if (elapsedMinutes < 360) {
              count = Math.max(3, Math.min(10, Math.floor(elapsedMinutes / 28)));
            } else if (elapsedMinutes < 1440) {
              count = Math.max(8, Math.min(18, Math.floor(elapsedMinutes / 75)));
            } else {
              count = Math.floor(16 + Math.random() * 6);
            }

            if (count > 0) {
              const catalog = mockProducts.length > 0 ? mockProducts : [];
              const timeWindow = elapsedMs - 120_000;
              const step = Math.max(60_000, timeWindow / count);

              let offlineGrossTotal = 0;
              let offlineCommissionTotal = 0;
              const generatedSales: SaleItem[] = [];

              for (let i = 0; i < count; i++) {
                const jitter = (Math.random() - 0.5) * 0.4 * step;
                const saleTimestamp = parsed.lastActiveTimestamp + (i + 0.5) * step + jitter;
                const saleDate = new Date(Math.min(nowMs - 60_000, Math.max(parsed.lastActiveTimestamp + 60_000, saleTimestamp)));
                
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

              currRecentSales = [...generatedSales.reverse(), ...currRecentSales].slice(0, 30);
              currVendasTotais = Math.round((currVendasTotais + offlineGrossTotal) * 100) / 100;
              currSaldoDisponivel = Math.round((currSaldoDisponivel + offlineCommissionTotal) * 100) / 100;
              currPedidos = currPedidos + count;
              currUnidades = currUnidades + count;
              currCliques = currCliques + count * 6;
              currVisitas = currVisitas + count * 4;

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
          }
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
        setIsLoaded(true);
      }
    }

    initializeSalesState();

    return () => {
      isCancelled = true;
    };
  }, [userEmail, userStorageKey]);

  // 2. Salva no localStorage isolado por usuário e sincroniza com a nuvem silenciosamente
  useEffect(() => {
    if (!isLoaded) return;
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
      if (userEmail === 'gerente@decolashop.com' || userEmail === 'admin@decolashop.com' || isAdmin) {
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
    // Escolhe produto alvo, ou o selecionado no admin, ou aleatório do catálogo
    let chosen: Product;
    if (targetProduct && targetProduct.name) {
      chosen = targetProduct as Product;
    } else if (selectedProductId && selectedProductId !== 'all') {
      const found = availableProducts.find(p => p.id === selectedProductId);
      chosen = found || availableProducts[Math.floor(Math.random() * availableProducts.length)];
    } else {
      chosen = availableProducts[Math.floor(Math.random() * availableProducts.length)];
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

    setRecentSales(prev => [newTx, ...prev.slice(0, 15)]);

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

  // Divulgação com IA: 1ª venda em exatamente 60s (1 min), e depois vendas entre 4 a 15 minutos
  const triggerDelayedCampaignSales = (targetProduct: Partial<Product>, customPrice?: number) => {
    // 1ª Venda após 1 minuto (60.000 ms)
    setTimeout(() => {
      addSale(targetProduct, customPrice);
      toast.success('🎉 Primeira venda da sua campanha com IA acabou de cair! Comissões liberadas.', {
        duration: 5000,
        icon: '💰'
      });

      // Loop subsequente entre 4 e 15 minutos (240s a 900s aleatório)
      const scheduleSubsequent = () => {
        const randomSeconds = Math.floor(Math.random() * (900 - 240 + 1)) + 240;
        setTimeout(() => {
          addSale(targetProduct, customPrice);
          scheduleSubsequent();
        }, randomSeconds * 1000);
      };

      scheduleSubsequent();
    }, 60000);
  };

  const resetData = () => {
    setVendasTotais(0);
    setSaldoDisponivel(0);
    setVisitas(0);
    setCliques(0);
    setPedidos(0);
    setUnidades(0);
    setHourlyData(CLEAN_HOURLY);
    setRecentSales([]);
    setAutoSimulate(false);

    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('decolashop_sales_state_v2');
      localStorage.removeItem('decolashop_sales_state');
    } catch {}

    toast.success('Dashboard zerado com sucesso (R$ 0,00)!');
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
        toast(`🚀 Auto-Vendas Ativado (${desc})`, { 
          icon: '⚡',
          style: { background: '#111726', color: '#4ade80', border: '1px solid rgba(34,197,94,0.4)' }
        });
      } else {
        toast('Auto-Vendas Pausado.', { icon: '⏸️' });
      }
      return next;
    });
  };

  // Loop de Auto-Vendas manual via atalho ou painel Gerente
  useEffect(() => {
    if (!autoSimulate) return;

    let timeoutId: NodeJS.Timeout;

    const scheduleNextSale = () => {
      let delayMs: number;
      if (intervalMode === 'range') {
        const min = Math.max(1, minSeconds);
        const max = Math.max(min, maxSeconds);
        const randomSec = Math.floor(Math.random() * (max - min + 1)) + min;
        delayMs = randomSec * 1000;
      } else {
        delayMs = Math.max(1, fixedSeconds) * 1000;
      }

      timeoutId = setTimeout(() => {
        if (autoSimulateRef.current) {
          addSale();
          scheduleNextSale();
        }
      }, delayMs);
    };

    scheduleNextSale();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [autoSimulate, intervalMode, minSeconds, maxSeconds, fixedSeconds, selectedProductId, availableProducts]);

  // Auto-geração contínua de vendas para TODOS os usuários comuns (não-admin) entre 4 a 15 minutos (240s a 900s)
  useEffect(() => {
    // Apenas para usuários autenticados que NÃO são admin/gerente
    if (isAdmin || !session?.user) return;

    let timerId: NodeJS.Timeout;

    const scheduleNormalUserSale = () => {
      // Sorteia intervalo aleatório entre 240 segundos (4 min) e 900 segundos (15 min)
      const randomSeconds = Math.floor(Math.random() * (900 - 240 + 1)) + 240;
      const delayMs = randomSeconds * 1000;

      timerId = setTimeout(() => {
        addSale();
        scheduleNormalUserSale();
      }, delayMs);
    };

    scheduleNormalUserSale();

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [isAdmin, session?.user]);

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
