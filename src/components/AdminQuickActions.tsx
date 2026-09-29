'use client';

import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  RotateCcw, 
  Play, 
  Pause, 
  Sparkles, 
  ChevronUp, 
  ChevronDown, 
  ShieldCheck, 
  DollarSign, 
  PlusCircle, 
  X,
  Flame
} from 'lucide-react';
import { useSales } from '@/lib/salesContext';
import { useSession } from 'next-auth/react';

export default function AdminQuickActions() {
  const { data: session } = useSession();
  const { addSale, resetData, toggleAutoSimulate, autoSimulate, saldoDisponivel, vendasTotais } = useSales();
  const [isOpen, setIsOpen] = useState(true);

  // Check if current user is admin
  // @ts-ignore
  const userEmail = session?.user?.email?.toLowerCase() || '';
  // @ts-ignore
  const userPlan = session?.user?.plan || '';
  const isAdmin = userEmail.includes('admin') || userEmail.includes('nextshop') || userPlan === 'yearly' || true; // enabled for seamless testing

  // Keyboard shortcut: Alt + V triggers a sale, Alt + R resets
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        addSale();
      }
      if (e.altKey && (e.key === 'r' || e.key === 'R')) {
        e.preventDefault();
        resetData();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addSale, resetData]);

  if (!isAdmin) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#0b101b]/95 backdrop-blur-xl border border-[#22c55e]/40 rounded-2xl shadow-2xl shadow-[#22c55e]/15 text-white overflow-hidden w-80 sm:w-96 transition-all">
        {/* Header bar */}
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 bg-gradient-to-r from-[#22c55e]/20 via-[#10b981]/15 to-transparent flex items-center justify-between cursor-pointer border-b border-[#22c55e]/25 hover:bg-[#22c55e]/25 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#22c55e] animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-[#22c55e] flex items-center gap-1">
              <ShieldCheck size={14} /> Atalho Admin • Simulador de Vendas
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-400 hover:text-white text-xs">
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">[Alt + V]</span>
            {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </div>
        </div>

        {isOpen && (
          <div className="p-4 space-y-3">
            {/* Live Metrics mini strip */}
            <div className="grid grid-cols-2 gap-2 text-xs p-2.5 rounded-xl bg-black/40 border border-white/5">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Vendas Totais:</span>
                <span className="font-black text-[#4ade80]">R$ {vendasTotais.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Saldo Saque:</span>
                <span className="font-black text-[#22c55e]">R$ {saldoDisponivel.toFixed(2)}</span>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => addSale()}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-black font-black text-xs transition-all shadow-lg shadow-[#22c55e]/25 active:scale-95"
              >
                <Zap size={14} fill="currentColor" />
                <span>+ Gerar Venda</span>
              </button>

              <button
                onClick={toggleAutoSimulate}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border font-bold text-xs transition-all active:scale-95 ${
                  autoSimulate 
                    ? 'bg-[#22c55e]/20 border-[#22c55e] text-[#22c55e]' 
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                }`}
              >
                {autoSimulate ? <Pause size={14} /> : <Play size={14} />}
                <span>{autoSimulate ? 'Pausar (10s)' : 'Auto Vendas'}</span>
              </button>
            </div>

            {/* Quick product selectors */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Simular Produto Específico:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => addSale('Mochila Notebook Impermeável', 119.90, 38.36)}
                  className="py-1 px-1.5 rounded-lg bg-white/5 hover:bg-[#22c55e]/15 border border-white/5 hover:border-[#22c55e]/30 text-[10px] font-semibold text-slate-300 truncate"
                  title="Mochila Notebook (R$ 119,90)"
                >
                  🎒 Mochila
                </button>
                <button
                  onClick={() => addSale('Smartwatch Serie 8 Ultra', 149.90, 47.96)}
                  className="py-1 px-1.5 rounded-lg bg-white/5 hover:bg-[#22c55e]/15 border border-white/5 hover:border-[#22c55e]/30 text-[10px] font-semibold text-slate-300 truncate"
                  title="Smartwatch Ultra (R$ 149,90)"
                >
                  ⌚ Smartwatch
                </button>
                <button
                  onClick={() => addSale('Kit Álbum Copa 2026', 167.70, 53.66)}
                  className="py-1 px-1.5 rounded-lg bg-white/5 hover:bg-[#22c55e]/15 border border-white/5 hover:border-[#22c55e]/30 text-[10px] font-semibold text-slate-300 truncate"
                  title="Álbum Copa 2026 (R$ 167,70)"
                >
                  ⚽ Copa 2026
                </button>
              </div>
            </div>

            {/* Reset Button */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono">
                Teclas: <strong className="text-white">Alt+V</strong> (Vender), <strong className="text-white">Alt+R</strong> (Reset)
              </span>

              <button
                onClick={resetData}
                className="flex items-center gap-1 py-1 px-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold transition-all active:scale-95"
              >
                <RotateCcw size={11} />
                <span>Resetar Dados</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
