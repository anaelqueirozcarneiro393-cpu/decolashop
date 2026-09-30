'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { mockProducts, Product } from './mockData';

export interface SaleItem {
  id: string;
  product: string;
  value: number;
  commission: number;
  time: string;
  image?: string;
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
  
  // Configurações do Gerador
  intervalMode: 'range' | 'fixed';
  minSeconds: number;
  maxSeconds: number;
  fixedSeconds: number;
  selectedProductId: string; // 'all' ou ID do produto
  availableProducts: Product[];

  addSale: (targetProduct?: Partial<Product>, customPrice?: number) => void;
  resetData: () => void;
  toggleAutoSimulate: () => void;
  setIntervalMode: (mode: 'range' | 'fixed') => void;
  setMinSeconds: (val: number) => void;
  setMaxSeconds: (val: number) => void;
  setFixedSeconds: (val: number) => void;
  setSelectedProductId: (id: string) => void;
  setSaldoDisponivelDirect: (val: number) => void;
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

export function SalesProvider({ children }: { children: React.ReactNode }) {
  const [vendasTotais, setVendasTotais] = useState<number>(0);
  const [saldoDisponivel, setSaldoDisponivel] = useState<number>(0);
  const [visitas, setVisitas] = useState<number>(0);
  const [cliques, setCliques] = useState<number>(0);
  const [pedidos, setPedidos] = useState<number>(0);
  const [unidades, setUnidades] = useState<number>(0);
  const [hourlyData, setHourlyData] = useState<ChartHour[]>(CLEAN_HOURLY);
  const [recentSales, setRecentSales] = useState<SaleItem[]>([]);
  const [autoSimulate, setAutoSimulate] = useState<boolean>(false);

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

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('decolashop_sales_state_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.vendasTotais === 'number') setVendasTotais(parsed.vendasTotais);
        if (typeof parsed.saldoDisponivel === 'number') setSaldoDisponivel(parsed.saldoDisponivel);
        if (typeof parsed.visitas === 'number') setVisitas(parsed.visitas);
        if (typeof parsed.cliques === 'number') setCliques(parsed.cliques);
        if (typeof parsed.pedidos === 'number') setPedidos(parsed.pedidos);
        if (typeof parsed.unidades === 'number') setUnidades(parsed.unidades);
        if (parsed.hourlyData) setHourlyData(parsed.hourlyData);
        if (parsed.recentSales) setRecentSales(parsed.recentSales);
        if (parsed.intervalMode) setIntervalMode(parsed.intervalMode);
        if (parsed.minSeconds) setMinSeconds(parsed.minSeconds);
        if (parsed.maxSeconds) setMaxSeconds(parsed.maxSeconds);
        if (parsed.fixedSeconds) setFixedSeconds(parsed.fixedSeconds);
        if (parsed.selectedProductId) setSelectedProductId(parsed.selectedProductId);
      }
    } catch {
      // ignore
    }
  }, []);

  const persistState = (data: any) => {
    try {
      localStorage.setItem('decolashop_sales_state_v3', JSON.stringify(data));
    } catch {
      // ignore
    }
  };

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

    playCashChime();

    // Notificação com FOTO DO PRODUTO REAL
    toast.custom((t) => (
      <div className={`flex items-center gap-3 p-3.5 rounded-2xl bg-[#0d121f]/95 border border-[#22c55e]/50 shadow-2xl shadow-[#22c55e]/25 text-white max-w-sm backdrop-blur-xl ${
        t.visible ? 'animate-in slide-in-from-top-3 duration-300' : 'animate-out fade-out duration-200'
      }`}>
        {/* Foto Real do Produto */}
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
      localStorage.removeItem('decolashop_sales_state_v3');
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

  // Loop de Auto-Vendas com intervalo dinâmico (fixo ou aleatório entre min e max)
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

  // Identificação de Admin / Gerente vs Usuário Comum
  const { data: session } = useSession();
  const userEmail = session?.user?.email?.toLowerCase().trim() || '';
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

  // Auto-geração contínua de vendas para TODOS os usuários comuns (não-admin) entre 1 a 5 minutos (60s a 300s)
  useEffect(() => {
    // Apenas para usuários autenticados que NÃO são admin/gerente
    if (isAdmin || !session?.user) return;

    let timerId: NodeJS.Timeout;

    const scheduleNormalUserSale = () => {
      // Sorteia intervalo aleatório entre 60 segundos (1 min) e 300 segundos (5 min)
      const randomSeconds = Math.floor(Math.random() * (300 - 60 + 1)) + 60;
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
      intervalMode,
      minSeconds,
      maxSeconds,
      fixedSeconds,
      selectedProductId,
      availableProducts,
      addSale,
      resetData,
      toggleAutoSimulate,
      setIntervalMode,
      setMinSeconds,
      setMaxSeconds,
      setFixedSeconds,
      setSelectedProductId,
      setSaldoDisponivelDirect,
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
