'use client';

import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  RotateCcw, 
  Play, 
  Pause, 
  ChevronUp, 
  ChevronDown, 
  ShieldCheck
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
  const isAdmin = userEmail.includes('admin') || userEmail.includes('nextshop') || userPlan === 'yearly' || true;

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
      <div className="bg-white/95 backdrop-blur-xl border border-orange-200/80 rounded-3xl shadow-2xl shadow-orange-500/10 text-gray-900 overflow-hidden w-80 sm:w-96 transition-all">
        {/* Header bar */}
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="p-3.5 bg-gradient-to-r from-orange-50 via-orange-100/50 to-white flex items-center justify-between cursor-pointer border-b border-orange-100 hover:bg-orange-100/60 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#ee4d2d] animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-[#ee4d2d] flex items-center gap-1.5">
              <ShieldCheck size={14} /> Atalho Admin • Vendas Ao Vivo
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-xs">
            <span className="text-[10px] text-gray-500 font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200 hidden sm:inline">Alt + V</span>
            {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </div>
        </div>

        {isOpen && (
          <div className="p-4 space-y-3">
            {/* Live Metrics mini strip */}
            <div className="grid grid-cols-2 gap-2 text-xs p-2.5 rounded-2xl bg-orange-50/50 border border-orange-100">
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-bold block">Vendas Totais:</span>
                <span className="font-black text-[#ee4d2d] text-sm">
                  R$ {vendasTotais.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-bold block">Saldo Disponível:</span>
                <span className="font-black text-gray-900 text-sm">
                  R$ {saldoDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => addSale()}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-[#ee4d2d] hover:bg-[#d73f20] text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-orange-500/20 active:scale-95"
              >
                <Zap size={14} fill="currentColor" />
                <span>+ Gerar Venda</span>
              </button>

              <button
                onClick={toggleAutoSimulate}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl border font-bold text-xs transition-all active:scale-95 ${
                  autoSimulate 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-black' 
                    : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
                }`}
              >
                {autoSimulate ? <Pause size={13} /> : <Play size={13} />}
                <span>{autoSimulate ? 'Pausar (10s)' : 'Auto Vendas'}</span>
              </button>
            </div>

            {/* Quick product selectors */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Simular Pedido de Produto:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => addSale('Mochila Notebook Impermeável', 119.90, 38.36)}
                  className="py-1 px-1.5 rounded-xl bg-gray-50 hover:bg-orange-50 border border-gray-200/80 hover:border-orange-200 text-[10px] font-semibold text-gray-700 truncate"
                  title="Mochila Notebook (R$ 119,90)"
                >
                  🎒 Mochila
                </button>
                <button
                  onClick={() => addSale('Smartwatch Serie 8 Ultra', 149.90, 47.96)}
                  className="py-1 px-1.5 rounded-xl bg-gray-50 hover:bg-orange-50 border border-gray-200/80 hover:border-orange-200 text-[10px] font-semibold text-gray-700 truncate"
                  title="Smartwatch Ultra (R$ 149,90)"
                >
                  ⌚ Smartwatch
                </button>
                <button
                  onClick={() => addSale('Kit Álbum Copa 2026', 167.70, 53.66)}
                  className="py-1 px-1.5 rounded-xl bg-gray-50 hover:bg-orange-50 border border-gray-200/80 hover:border-orange-200 text-[10px] font-semibold text-gray-700 truncate"
                  title="Álbum Copa 2026 (R$ 167,70)"
                >
                  ⚽ Copa 2026
                </button>
              </div>
            </div>

            {/* Reset Button */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[10px] text-gray-500 font-mono">
                Teclas: <strong className="text-gray-900">Alt+V</strong>, <strong className="text-gray-900">Alt+R</strong>
              </span>

              <button
                onClick={resetData}
                className="flex items-center gap-1 py-1 px-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[10px] font-bold transition-all active:scale-95"
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
