'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

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

const DEFAULT_HOURLY: ChartHour[] = [
  { hour: '00', valHoje: 45, valOntem: 20 },
  { hour: '02', valHoje: 12, valOntem: 15 },
  { hour: '04', valHoje: 8, valOntem: 5 },
  { hour: '06', valHoje: 30, valOntem: 18 },
  { hour: '08', valHoje: 120, valOntem: 80 },
  { hour: '10', valHoje: 240, valOntem: 190 },
  { hour: '12', valHoje: 380, valOntem: 310 },
  { hour: '14', valHoje: 520, valOntem: 410 },
  { hour: '16', valHoje: 480, valOntem: 430 },
  { hour: '18', valHoje: 590, valOntem: 490 },
  { hour: '20', valHoje: 510, valOntem: 440 },
  { hour: '22', valHoje: 290, valOntem: 260 },
];

const DEFAULT_SALES: SaleItem[] = [
  { id: 'TX-9841', product: 'Mochila Notebook Impermeável', value: 119.90, commission: 38.36, time: 'Hoje, 01:54' },
  { id: 'TX-9840', product: 'Smartwatch Serie 8 Ultra', value: 149.90, commission: 47.96, time: 'Hoje, 01:42' },
  { id: 'TX-9839', product: 'Kit Álbum Copa do Mundo 2026', value: 167.70, commission: 53.66, time: 'Hoje, 01:28' },
  { id: 'TX-9838', product: 'Kit Painel Ripado Decoração', value: 139.86, commission: 44.75, time: 'Hoje, 00:59' },
  { id: 'TX-9837', product: 'Chinelo Slide Nuvem Confort', value: 119.96, commission: 38.38, time: 'Hoje, 00:41' },
];

const SAMPLE_PRODUCTS = [
  { name: 'Mochila Notebook Impermeável', price: 119.90, commission: 38.36 },
  { name: 'Smartwatch Serie 8 Ultra', price: 149.90, commission: 47.96 },
  { name: 'Kit Até 20 Painel Ripado Autocolante', price: 139.86, commission: 44.75 },
  { name: 'Kit Álbum Copa do Mundo 2026 + 3 Envelopes', price: 167.70, commission: 53.66 },
  { name: 'Chinelo Slide Nuvem Confort', price: 119.96, commission: 38.38 },
  { name: 'Fone Bluetooth Pro Wireless Noise Cancelling', price: 89.90, commission: 28.76 },
  { name: 'Mini Projetor Portátil 4K Cinema Pro', price: 299.00, commission: 95.68 },
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
  const [vendasTotais, setVendasTotais] = useState<number>(2290.35);
  const [saldoDisponivel, setSaldoDisponivel] = useState<number>(2290.35);
  const [visitas, setVisitas] = useState<number>(791);
  const [cliques, setCliques] = useState<number>(2159);
  const [pedidos, setPedidos] = useState<number>(56);
  const [unidades, setUnidades] = useState<number>(56);
  const [hourlyData, setHourlyData] = useState<ChartHour[]>(DEFAULT_HOURLY);
  const [recentSales, setRecentSales] = useState<SaleItem[]>(DEFAULT_SALES);
  const [autoSimulate, setAutoSimulate] = useState<boolean>(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('decolashop_sales_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.vendasTotais) setVendasTotais(parsed.vendasTotais);
        if (parsed.saldoDisponivel) setSaldoDisponivel(parsed.saldoDisponivel);
        if (parsed.visitas) setVisitas(parsed.visitas);
        if (parsed.cliques) setCliques(parsed.cliques);
        if (parsed.pedidos) setPedidos(parsed.pedidos);
        if (parsed.unidades) setUnidades(parsed.unidades);
        if (parsed.hourlyData) setHourlyData(parsed.hourlyData);
        if (parsed.recentSales) setRecentSales(parsed.recentSales);
      }
    } catch {
      // ignore
    }
  }, []);

  // Save to localStorage when updated
  const persistState = (data: any) => {
    try {
      localStorage.setItem('decolashop_sales_state', JSON.stringify(data));
    } catch {
      // ignore
    }
  };

  const addSale = (productName?: string, price?: number, commission?: number) => {
    const randomPick = SAMPLE_PRODUCTS[Math.floor(Math.random() * SAMPLE_PRODUCTS.length)];
    const chosenProduct = productName || randomPick.name;
    const chosenPrice = price || randomPick.price;
    const chosenCommission = commission || randomPick.commission;

    const newVendas = Math.round((vendasTotais + chosenPrice) * 100) / 100;
    const newSaldo = Math.round((saldoDisponivel + chosenCommission) * 100) / 100;
    const newPedidos = pedidos + 1;
    const newUnidades = unidades + 1;
    const newCliques = cliques + Math.floor(Math.random() * 15) + 3;
    const newVisitas = visitas + Math.floor(Math.random() * 5) + 1;

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

    // Update hourly graph
    const newHourly = [...hourlyData];
    const lastIdx = newHourly.length - 1;
    newHourly[lastIdx] = {
      ...newHourly[lastIdx],
      valHoje: Math.round(newHourly[lastIdx].valHoje + chosenPrice),
    };

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

    // Play chime sound
    playCashChime();

    // Show live celebratory popup toast
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
              Venda Aprovada!
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
    setVendasTotais(2290.35);
    setSaldoDisponivel(2290.35);
    setVisitas(791);
    setCliques(2159);
    setPedidos(56);
    setUnidades(56);
    setHourlyData(DEFAULT_HOURLY);
    setRecentSales(DEFAULT_SALES);
    setAutoSimulate(false);

    try {
      localStorage.removeItem('decolashop_sales_state');
    } catch {}

    toast.success('🔄 Dashboard e Saldo resetados para os valores padrão!');
  };

  const toggleAutoSimulate = () => {
    setAutoSimulate(prev => {
      const next = !prev;
      if (next) {
        toast('⚡ Modo Auto-Vendas Ativado! Vendas simuladas a cada 10s.', { icon: '🚀' });
      } else {
        toast('Modo Auto-Vendas Pausado.', { icon: '⏸️' });
      }
      return next;
    });
  };

  // Auto simulate loop
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
  const ctx = useContext(SalesContext);
  if (!ctx) throw new Error('useSales must be used inside SalesProvider');
  return ctx;
}
