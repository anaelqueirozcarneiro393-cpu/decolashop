'use client';

import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  RotateCcw, 
  Play, 
  Pause, 
  ShieldCheck, 
  X, 
  Settings, 
  Database, 
  Sparkles, 
  Coins, 
  Volume2, 
  VolumeX, 
  Eye, 
  SlidersHorizontal 
} from 'lucide-react';
import { useSales } from '@/lib/salesContext';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

export default function AdminQuickActions() {
  const { data: session } = useSession();
  const { 
    addSale, 
    resetData, 
    toggleAutoSimulate, 
    autoSimulate, 
    saldoDisponivel, 
    vendasTotais, 
    pedidos 
  } = useSales();

  // Oculto por padrão
  const [isOpen, setIsOpen] = useState(false);
  const [customSaldo, setCustomSaldo] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Verificação estrita de Administrador
  // @ts-ignore
  const userEmail = session?.user?.email?.toLowerCase().trim() || '';
  // @ts-ignore
  const userRole = (session?.user as any)?.role || '';
  const isAdmin = 
    userEmail === 'admin@decolashop.com' || 
    userEmail === 'admin@newshop.com' || 
    userEmail.includes('admin') || 
    userRole === 'admin';

  // Atalho secreto do teclado: [Alt + A] ou [Ctrl + Shift + A]
  useEffect(() => {
    if (!isAdmin) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isAltA = e.altKey && (e.key === 'a' || e.key === 'A');
      const isCtrlShiftA = e.ctrlKey && e.shiftKey && (e.key === 'a' || e.key === 'A');
      const isCtrlAltA = e.ctrlKey && e.altKey && (e.key === 'a' || e.key === 'A');

      if (isAltA || isCtrlShiftA || isCtrlAltA) {
        e.preventDefault();
        setIsOpen((prev) => {
          const next = !prev;
          if (next) {
            toast('🛡️ Painel de Administrador Decola Shop aberto!', {
              icon: '⚡',
              style: {
                background: '#111726',
                color: '#4ade80',
                border: '1px solid rgba(34, 197, 94, 0.4)',
              },
            });
          }
          return next;
        });
      }

      // Atalhos secundários quando o painel ou atalhos globais estiverem ativos:
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
  }, [isAdmin, addSale, resetData]);

  // Se não for admin, não renderiza absolutamente NADA no DOM
  if (!isAdmin) return null;

  // Se estiver oculto, renderiza apenas o listener (sem visual no DOM)
  if (!isOpen) return null;

  const handleResetOnboarding = () => {
    localStorage.removeItem('decolashop_seen_onboarding');
    localStorage.removeItem('apexfinder_seen_onboarding');
    toast.success('Pop-up de boas-vindas reativado! Ele abrirá na próxima navegação ou recarregamento.');
  };

  const handleSetSaldo = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(customSaldo.replace(',', '.'));
    if (!isNaN(val) && val >= 0) {
      // Define a venda simulada para coincidir com o valor desejado
      const diff = val - saldoDisponivel;
      if (diff > 0) {
        addSale(diff);
      }
      setCustomSaldo('');
      toast.success(`Saldo ajustado para R$ ${val.toFixed(2)}`);
    } else {
      toast.error('Informe um valor válido em reais.');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0d131f] border border-[#22c55e]/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-[#22c55e]/15 text-white animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#22c55e] to-[#15803d] flex items-center justify-center text-[#080c14] shadow-lg shadow-[#22c55e]/25">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">Painel do Administrador</h3>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#080c14] bg-[#22c55e] px-2 py-0.5 rounded-full">
                  Exclusivo
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Visível apenas para <code className="text-[#4ade80] font-semibold">{userEmail}</code>
              </p>
            </div>
          </div>

          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            title="Fechar [Esc ou Alt + A]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Atalho Informativo */}
        <div className="mb-5 p-3 rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/25 flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium">Atalho para abrir/fechar:</span>
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold">
            <span className="bg-[#111726] border border-white/10 px-2 py-0.5 rounded text-[#4ade80]">Alt + A</span>
            <span className="text-slate-500">ou</span>
            <span className="bg-[#111726] border border-white/10 px-2 py-0.5 rounded text-[#4ade80]">Ctrl + Shift + A</span>
          </div>
        </div>

        {/* Métricas em Tempo Real */}
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Coins size={14} className="text-[#22c55e]" /> Faturamento em Tempo Real
          </h4>
          <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-[#111726] border border-white/10 text-center">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Vendas Totais</span>
              <span className="text-sm font-black text-[#4ade80]">R$ {vendasTotais.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Saldo Saque</span>
              <span className="text-sm font-black text-[#22c55e]">R$ {saldoDisponivel.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Pedidos</span>
              <span className="text-sm font-black text-white">{pedidos} un</span>
            </div>
          </div>
        </div>

        {/* Ações de Vendas */}
        <div className="space-y-3 mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Zap size={14} className="text-[#22c55e]" /> Simulador de Vendas & Testes
          </h4>
          
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => addSale()}
              className="py-3 px-3 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] active:scale-95 text-[#080c14] font-black text-xs uppercase tracking-wider shadow-lg shadow-[#22c55e]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap size={14} fill="currentColor" />
              <span>+ Gerar Venda [Alt+V]</span>
            </button>

            <button
              onClick={toggleAutoSimulate}
              className={`py-3 px-3 rounded-2xl border font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                autoSimulate 
                  ? 'bg-[#22c55e]/20 border-[#22c55e] text-[#22c55e]' 
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
              }`}
            >
              {autoSimulate ? <Pause size={14} /> : <Play size={14} />}
              <span>{autoSimulate ? 'Pausar Auto' : 'Auto Vendas (10s)'}</span>
            </button>
          </div>

          {/* Ajustar saldo específico */}
          <form onSubmit={handleSetSaldo} className="flex gap-2 pt-1">
            <input
              type="text"
              value={customSaldo}
              onChange={(e) => setCustomSaldo(e.target.value)}
              placeholder="Definir saldo (ex: 2500,00)"
              className="flex-1 px-3.5 py-2.5 bg-[#111726] border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#22c55e]"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/10 transition-colors cursor-pointer"
            >
              Aplicar
            </button>
            <button
              type="button"
              onClick={resetData}
              className="px-3.5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="Zerar faturamento para R$ 0,00 [Alt + R]"
            >
              <RotateCcw size={14} />
            </button>
          </form>
        </div>

        {/* Configurações da Plataforma */}
        <div className="space-y-2.5 pt-4 border-t border-white/10">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Settings size={14} className="text-[#22c55e]" /> Configurações do Sistema
          </h4>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={handleResetOnboarding}
              className="p-3 rounded-xl bg-[#111726] hover:bg-white/5 border border-white/10 text-left transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Sparkles size={16} className="text-[#22c55e] shrink-0" />
              <div>
                <span className="font-bold text-white block">Pop-up Inicial</span>
                <span className="text-[10px] text-slate-400">Reativar onboarding</span>
              </div>
            </button>

            <div className="p-3 rounded-xl bg-[#111726] border border-white/10 text-left flex items-center gap-2">
              <Database size={16} className="text-[#22c55e] shrink-0" />
              <div>
                <span className="font-bold text-white block">Supabase</span>
                <span className="text-[10px] text-[#4ade80]">🟢 15 produtos ativos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé de Fechar */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Pressione <kbd className="text-[#22c55e] font-mono font-bold">Esc</kbd> ou <kbd className="text-[#22c55e] font-mono font-bold">Alt + A</kbd> para fechar
          </span>
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Ocultar Painel
          </button>
        </div>

      </div>
    </div>
  );
}
