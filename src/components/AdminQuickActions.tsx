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
  SlidersHorizontal,
  Clock,
  CheckCircle2,
  Package
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
    pedidos,
    intervalMode,
    setIntervalMode,
    minSeconds,
    setMinSeconds,
    maxSeconds,
    setMaxSeconds,
    fixedSeconds,
    setFixedSeconds,
    selectedProductId,
    setSelectedProductId,
    availableProducts,
    setSaldoDisponivelDirect
  } = useSales();

  // Oculto por padrão
  const [isOpen, setIsOpen] = useState(false);
  const [customSaldo, setCustomSaldo] = useState('');
  const [searchProduct, setSearchProduct] = useState('');

  // Verificação estrita de Gerente (Admin)
  // @ts-ignore
  const userEmail = session?.user?.email?.toLowerCase().trim() || '';
  // @ts-ignore
  const userRole = (session?.user as any)?.role || '';
  const isNormalUser = userEmail === 'usuario@decolashop.com' || userEmail === 'cliente@decolashop.com' || userEmail === 'user@decolashop.com';
  const isAdmin = !isNormalUser && (
    userEmail === 'admin@decolashop.com' || 
    userEmail === 'admin@newshop.com' || 
    userEmail === 'gerente@decolashop.com' || 
    userEmail.includes('admin') || 
    userEmail.includes('gerente') || 
    userRole === 'admin' ||
    userRole === 'gerente'
  );

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
            toast('🛡️ Painel do Gerente DecolaShop aberto!', {
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

  if (!isAdmin) return null;
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
      setSaldoDisponivelDirect(val);
      setCustomSaldo('');
      toast.success(`Saldo ajustado para R$ ${val.toFixed(2)}`);
    } else {
      toast.error('Informe um valor válido em reais.');
    }
  };

  const filteredProducts = availableProducts.filter(p => 
    p.name.toLowerCase().includes(searchProduct.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0d131f] border border-[#22c55e]/40 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl shadow-[#22c55e]/15 text-white animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-white/10 mb-4 sticky top-0 bg-[#0d131f] z-10 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#22c55e] to-[#15803d] flex items-center justify-center text-[#080c14] shadow-md shadow-[#22c55e]/25 flex-shrink-0">
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">Painel do Gerente</h3>
                <span className="text-[9px] font-black uppercase tracking-wider text-[#080c14] bg-[#22c55e] px-1.5 py-0.5 rounded-full">
                  Gerente
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Logado como: <code className="text-[#4ade80] font-semibold">{userEmail}</code>
              </p>
            </div>
          </div>

          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            title="Fechar [Esc ou Alt + A]"
          >
            <X size={18} />
          </button>
        </div>

        {/* 1. SELEÇÃO DO PRODUTO (COM FOTOS REAIS) */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Package size={14} className="text-[#22c55e]" /> Escolha o Produto da Venda (Com Fotos)
            </h4>
            <span className="text-[10px] text-slate-400">
              {availableProducts.length} produtos disponíveis
            </span>
          </div>

          {/* Opção Todos (Aleatório) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
            <button
              type="button"
              onClick={() => setSelectedProductId('all')}
              className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                selectedProductId === 'all'
                  ? 'bg-[#22c55e]/20 border-[#22c55e] text-white shadow-md shadow-[#22c55e]/15'
                  : 'bg-[#111726] border-white/10 text-slate-400 hover:border-white/20'
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-[#22c55e]/20 flex items-center justify-center text-lg flex-shrink-0">
                🎲
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-black block text-white truncate">Qualquer Produto (Aleatório)</span>
                <span className="text-[10px] text-slate-400">Gira todo o catálogo do site</span>
              </div>
              {selectedProductId === 'all' && <CheckCircle2 size={16} className="text-[#22c55e]" />}
            </button>

            {/* Quick Trigger Button */}
            <button
              type="button"
              onClick={() => addSale()}
              className="py-2.5 px-3 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] active:scale-95 text-[#080c14] font-black text-xs uppercase tracking-wider shadow-lg shadow-[#22c55e]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap size={14} fill="currentColor" />
              <span>+ Gerar 1 Venda Agora</span>
            </button>
          </div>

          {/* Carrossel / Grade de Produtos Reais com Fotos */}
          <div className="border border-white/10 rounded-2xl p-2 bg-[#111726]/60 max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {availableProducts.map((p) => {
              const isSelected = selectedProductId === p.id;
              const formattedPrice = typeof p.price === 'number' ? `R$ ${p.price.toFixed(2)}` : p.price;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProductId(p.id)}
                  className={`p-2 rounded-xl border flex items-center justify-between gap-2.5 cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-[#22c55e]/15 border-[#22c55e] text-white' 
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img 
                      src={p.image_url} 
                      alt={p.name} 
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-slate-900 border border-white/10"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate max-w-[240px] sm:max-w-[320px]">
                        {p.name}
                      </p>
                      <span className="text-[10px] text-[#4ade80] font-black">
                        {formattedPrice}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addSale(p);
                      }}
                      className="text-[10px] font-black uppercase tracking-wider bg-[#22c55e]/20 hover:bg-[#22c55e] hover:text-[#080c14] text-[#4ade80] px-2 py-1 rounded-lg border border-[#22c55e]/30 transition-all"
                    >
                      Vender
                    </button>
                    {isSelected && <CheckCircle2 size={16} className="text-[#22c55e]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. CONFIGURAÇÃO DE INTERVALO DE VENDAS */}
        <div className="mb-5 p-3.5 rounded-2xl bg-[#111726] border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Clock size={14} className="text-[#22c55e]" /> Intervalo entre cada Venda
            </h4>
            <div className="flex bg-[#0d131f] p-0.5 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setIntervalMode('range')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  intervalMode === 'range' ? 'bg-[#22c55e] text-[#080c14]' : 'text-slate-400 hover:text-white'
                }`}
              >
                Aleatório (Range)
              </button>
              <button
                type="button"
                onClick={() => setIntervalMode('fixed')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  intervalMode === 'fixed' ? 'bg-[#22c55e] text-[#080c14]' : 'text-slate-400 hover:text-white'
                }`}
              >
                Fixo
              </button>
            </div>
          </div>

          {/* Configuração de Range ou Fixo */}
          {intervalMode === 'range' ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 text-xs">Vender aleatoriamente entre</span>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={minSeconds}
                  onChange={(e) => setMinSeconds(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-14 px-2 py-1.5 bg-[#0d131f] border border-white/15 rounded-lg text-center font-black text-white text-xs focus:border-[#22c55e]"
                />
                <span className="text-slate-400 text-xs">e</span>
                <input
                  type="number"
                  min={minSeconds}
                  max={120}
                  value={maxSeconds}
                  onChange={(e) => setMaxSeconds(Math.max(minSeconds, parseInt(e.target.value) || 7))}
                  className="w-14 px-2 py-1.5 bg-[#0d131f] border border-white/15 rounded-lg text-center font-black text-white text-xs focus:border-[#22c55e]"
                />
                <span className="text-slate-400 text-xs">segundos</span>
              </div>
              <p className="text-[10px] text-slate-400 italic">
                Ex: a cada ciclo o sistema escolhe um segundo diferente entre {minSeconds}s e {maxSeconds}s.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 text-xs">Vender a cada intervalo fixo de</span>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={fixedSeconds}
                  onChange={(e) => setFixedSeconds(Math.max(1, parseInt(e.target.value) || 5))}
                  className="w-16 px-2 py-1.5 bg-[#0d131f] border border-white/15 rounded-lg text-center font-black text-white text-xs focus:border-[#22c55e]"
                />
                <span className="text-slate-400 text-xs">segundos</span>
              </div>
              <p className="text-[10px] text-slate-400 italic">
                Vendas contínuas com ritmo constante de {fixedSeconds} segundos.
              </p>
            </div>
          )}

          {/* Botão Start/Pause Auto-Vendas */}
          <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between">
            <div className="text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Status do Gerador:</span>
              <span className={`font-black flex items-center gap-1.5 ${autoSimulate ? 'text-[#4ade80]' : 'text-slate-400'}`}>
                <span className={`w-2 h-2 rounded-full ${autoSimulate ? 'bg-[#22c55e] animate-ping' : 'bg-slate-600'}`} />
                {autoSimulate ? 'Ativo e Rodando' : 'Pausado'}
              </span>
            </div>

            <button
              type="button"
              onClick={toggleAutoSimulate}
              className={`py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-lg ${
                autoSimulate 
                  ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 hover:bg-amber-500/30' 
                  : 'bg-[#22c55e] hover:bg-[#16a34a] text-[#080c14] shadow-[#22c55e]/25'
              }`}
            >
              {autoSimulate ? <Pause size={14} /> : <Play size={14} />}
              <span>{autoSimulate ? 'Pausar Auto-Vendas' : 'Iniciar Auto-Vendas'}</span>
            </button>
          </div>
        </div>

        {/* 3. MÉTRICAS E AJUSTE DE SALDO */}
        <div className="mb-5 p-3.5 rounded-2xl bg-[#111726] border border-white/10">
          <div className="grid grid-cols-3 gap-2 text-center mb-3">
            <div className="p-2 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[9px] text-slate-400 uppercase font-bold block">Vendas Totais</span>
              <span className="text-xs sm:text-sm font-black text-[#4ade80]">R$ {vendasTotais.toFixed(2)}</span>
            </div>
            <div className="p-2 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[9px] text-slate-400 uppercase font-bold block">Saldo Saque</span>
              <span className="text-xs sm:text-sm font-black text-[#22c55e]">R$ {saldoDisponivel.toFixed(2)}</span>
            </div>
            <div className="p-2 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[9px] text-slate-400 uppercase font-bold block">Pedidos</span>
              <span className="text-xs sm:text-sm font-black text-white">{pedidos} un</span>
            </div>
          </div>

          <form onSubmit={handleSetSaldo} className="flex gap-2">
            <input
              type="text"
              value={customSaldo}
              onChange={(e) => setCustomSaldo(e.target.value)}
              placeholder="Definir saldo manual (ex: 3500,00)"
              className="flex-1 px-3 py-2 bg-[#0d131f] border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#22c55e]"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/10 transition-colors cursor-pointer"
            >
              Definir
            </button>
            <button
              type="button"
              onClick={resetData}
              className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              title="Zerar dados para R$ 0,00"
            >
              <RotateCcw size={13} />
              <span>Zerar</span>
            </button>
          </form>
        </div>

        {/* 4. CONFIGURAÇÕES DO SISTEMA & SUPABASE */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <button
            type="button"
            onClick={handleResetOnboarding}
            className="p-2.5 rounded-xl bg-[#111726] hover:bg-white/5 border border-white/10 text-left transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Sparkles size={15} className="text-[#22c55e] shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-white block text-xs truncate">Reabrir Pop-up</span>
              <span className="text-[9px] text-slate-400">Decola Shop Boas-vindas</span>
            </div>
          </button>

          <div className="p-2.5 rounded-xl bg-[#111726] border border-white/10 text-left flex items-center gap-2">
            <Database size={15} className="text-[#22c55e] shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-white block text-xs truncate">Supabase Conectado</span>
              <span className="text-[9px] text-[#4ade80]">🟢 15 produtos ativos</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
          <span>
            Atalho: <kbd className="text-[#22c55e] font-mono font-bold">Alt + A</kbd> ou <kbd className="text-[#22c55e] font-mono font-bold">Ctrl + Shift + A</kbd>
          </span>
          <button
            onClick={() => setIsOpen(false)}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
