'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { mockProducts } from './mockData';

export interface SaleItem {
  id: string;
  product: string;
  value: number;
  commission: number;
  time: string;
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
  addSale: (productName?: string, price?: number, commission?: number) => void;
  resetData: () => void;
  toggleAutoSimulate: () => void;
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
  } catch (err) {
    // audio autoplay policy ignore
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

  // Load from localStorage on mount - migrate away from legacy hardcoded 2290.35
  useEffect(() => {
    try {
      const saved = localStorage.getItem('decolashop_sales_state_v2');
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
      } else {
        // Clear any old fake state
        localStorage.removeItem('decolashop_sales_state');
      }
    } catch {
      // ignore
    }
  }, []);

  const persistState = (data: any) => {
    try {
      localStorage.setItem('decolashop_sales_state_v2', JSON.stringify(data));
    } catch {
      // ignore
    }
  };

  const addSale = (productName?: string, price?: number, commission?: number) => {
    const catalogItem = mockProducts[Math.floor(Math.random() * mockProducts.length)];
    const chosenProduct = productName || catalogItem.name;
    const rawPrice = typeof catalogItem.price === 'string' 
      ? parseFloat(catalogItem.price.replace('R$', '').replace('.', '').replace(',', '.').trim()) 
      : (catalogItem.price || 149.90);
    const chosenPrice = price || rawPrice;
    const chosenCommission = commission || Math.round(chosenPrice * 0.32 * 100) / 100;

    const newVendas = Math.round((vendasTotais + chosenPrice) * 100) / 100;
    const newSaldo = Math.round((saldoDisponivel + chosenCommission) * 100) / 100;
    const newPedidos = pedidos + 1;
    const newUnidades = unidades + 1;
    const newCliques = cliques + Math.floor(Math.random() * 8) + 1;
    const newVisitas = visitas + Math.floor(Math.random() * 3) + 1;

    const now = new Date();
    const timeStr = `Hoje, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newTx: SaleItem = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      product: chosenProduct,
      value: chosenPrice,
      commission: chosenCommission,
      time: timeStr,
    };

    const newRecent = [newTx, ...recentSales.slice(0, 15)];

    // Update current hour in graph
    const currentHourStr = String(Math.floor(now.getHours() / 2) * 2).padStart(2, '0');
    const newHourly = hourlyData.map(h => {
      if (h.hour === currentHourStr) {
        return { ...h, valHoje: Math.round((h.valHoje + chosenPrice) * 100) / 100 };
      }
      return h;
    });

    setVendasTotais(newVendas);
    setSaldoDisponivel(newSaldo);
    setPedidos(newPedidos);
    setUnidades(newUnidades);
    setCliques(newCliques);
    setVisitas(newVisitas);
    setRecentSales(newRecent);
    setHourlyData(newHourly);

    persistState({
      vendasTotais: newVendas,
      saldoDisponivel: newSaldo,
      pedidos: newPedidos,
      unidades: newUnidades,
      cliques: newCliques,
      visitas: newVisitas,
      recentSales: newRecent,
      hourlyData: newHourly,
    });

    playCashChime();

    toast.custom((t) => (
      <div className={`flex items-center gap-3 p-4 rounded-2xl bg-[#0d121f] border border-[#22c55e]/50 shadow-2xl shadow-[#22c55e]/25 text-white max-w-md ${
        t.visible ? 'animate-in slide-in-from-top-3' : 'animate-out fade-out'
      }`}>
        <div className="w-10 h-10 rounded-xl bg-[#22c55e]/20 border border-[#22c55e]/40 flex items-center justify-center text-[#22c55e] font-black text-lg flex-shrink-0 animate-bounce">
          💰
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#22c55e] bg-[#22c55e]/10 px-2 py-0.5 rounded-full border border-[#22c55e]/30">
              Venda Confirmada!
            </span>
            <span className="text-xs font-black text-[#4ade80]">
              + R$ {chosenCommission.toFixed(2)}
            </span>
          </div>
          <p className="text-xs font-bold text-white truncate mt-1">{chosenProduct}</p>
          <p className="text-[10px] text-slate-400">Total Venda: R$ {chosenPrice.toFixed(2)} • Shopee Pay</p>
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
      localStorage.removeItem('decolashop_sales_state_v2');
      localStorage.removeItem('decolashop_sales_state');
    } catch {}

    toast.success('🔄 Dashboard e Métricas limpos com sucesso (R$ 0,00)!');
  };

  const toggleAutoSimulate = () => {
    setAutoSimulate(prev => {
      const next = !prev;
      if (next) {
        toast('⚡ Modo Auto-Vendas Ativado! Vendas a cada 10s.', { icon: '🚀' });
      } else {
        toast('Modo Auto-Vendas Pausado.', { icon: '⏸️' });
      }
      return next;
    });
  };

  useEffect(() => {
    if (!autoSimulate) return;
    const interval = setInterval(() => {
      addSale();
    }, 10000);
    return () => clearInterval(interval);
  }, [autoSimulate, vendasTotais, saldoDisponivel, pedidos, unidades, cliques, visitas, hourlyData, recentSales]);

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
      addSale,
      resetData,
      toggleAutoSimulate,
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
