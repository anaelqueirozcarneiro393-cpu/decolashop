'use client';

import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  DollarSign, 
  Send, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  AlertCircle,
  Zap,
  RotateCcw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSales } from '@/lib/salesContext';

export default function FinanceiroView() {
  const { saldoDisponivel, vendasTotais, pedidos, recentSales, addSale, resetData } = useSales();
  const [pixType, setPixType] = useState('cpf');
  const [pixKey, setPixKey] = useState('123.456.789-00');
  const [isSaved, setIsSaved] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(saldoDisponivel.toFixed(2));

  const handleSavePix = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pixKey) {
      toast.error('Preencha sua chave PIX');
      return;
    }
    setIsSaved(true);
    toast.success('Chave PIX atualizada com sucesso!');
  };

  const handleWithdraw = () => {
    setIsWithdrawing(true);
    setTimeout(() => {
      setIsWithdrawing(false);
      setShowWithdrawModal(false);
      toast.success('🎉 Solicitação de Saque PIX enviada! Processamento em até 15 minutos.');
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-slate-100">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#22c55e]/15 text-[#4ade80] text-xs font-black mb-3 border border-[#22c55e]/30">
          <Wallet className="w-3.5 h-3.5" />
          <span>Gestão de Comissões & Repasses PIX</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-2 text-white">
          Painel <span className="apex-gradient-text">Financeiro & Saques</span>
        </h1>
        <p className="text-slate-400 text-sm">
          Acompanhe suas vendas com divulgação, cadastre sua chave PIX e solicite seus saques instantâneos.
        </p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-7 rounded-3xl bg-gradient-to-br from-[#111726]/90 via-[#0d121f] to-[#090d16] border border-[#22c55e]/40 shadow-2xl shadow-[#22c55e]/15 backdrop-blur-xl">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#22c55e]">Saldo Disponível</span>
            <Wallet size={18} className="text-[#22c55e]" />
          </div>
          <p className="text-4xl font-black text-white tracking-tight mb-4">
            R$ {saldoDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <button
            onClick={() => { setWithdrawAmount(saldoDisponivel.toFixed(2)); setShowWithdrawModal(true); }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-black font-black text-xs transition-all active:scale-95 shadow-lg shadow-[#22c55e]/25"
          >
            <Send size={14} />
            <span>Solicitar Saque PIX</span>
          </button>
        </div>

        <div className="p-7 rounded-3xl bg-[#0d121f]/90 border border-white/10 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Vendas Totais Acumuladas</span>
            <TrendingUp size={18} className="text-[#4ade80]" />
          </div>
          <p className="text-4xl font-black text-white tracking-tight mb-2">
            R$ {vendasTotais.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-400">{pedidos} pedidos convertidos pelas divulgações</p>
        </div>

        <div className="p-7 rounded-3xl bg-[#0d121f]/90 border border-white/10 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total já Sacado</span>
            <CheckCircle2 size={18} className="text-[#22c55e]" />
          </div>
          <p className="text-4xl font-black text-slate-300 tracking-tight mb-2">R$ 4.850,00</p>
          <p className="text-xs text-[#4ade80] flex items-center gap-1 font-bold">
            <ShieldCheck size={14} /> 100% dos pagamentos liquidados
          </p>
        </div>
      </div>

      {/* PIX Key Form */}
      <div className="rounded-3xl p-6 md:p-8 bg-[#0d121f]/90 border border-white/10 shadow-xl backdrop-blur-xl">
        <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
          <CreditCard className="text-[#22c55e]" size={20} /> Dados de Recebimento PIX
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Sua chave PIX para envio automático dos seus saques de comissão.
        </p>

        <form onSubmit={handleSavePix} className="space-y-4 max-w-xl">
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'cpf', label: 'CPF' },
              { id: 'email', label: 'E-mail' },
              { id: 'telefone', label: 'Celular' },
              { id: 'aleatoria', label: 'Chave Aleatória' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPixType(item.id)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                  pixType === item.id
                    ? 'bg-[#22c55e]/20 border-[#22c55e] text-[#4ade80] font-black'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div>
            <input
              type="text"
              value={pixKey}
              onChange={(e) => { setPixKey(e.target.value); setIsSaved(false); }}
              placeholder={pixType === 'cpf' ? '000.000.000-00' : 'Informe sua chave PIX'}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#22c55e]/30 focus:border-[#22c55e]"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold text-white transition-all"
          >
            {isSaved ? '✓ Chave Salva' : 'Salvar Chave PIX'}
          </button>
        </form>
      </div>

      {/* Transaction History with Live Updates */}
      <div className="rounded-3xl p-6 md:p-8 bg-[#0d121f]/90 border border-white/10 shadow-xl backdrop-blur-xl space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Clock className="text-[#22c55e]" size={20} /> Histórico Recente de Conversões
          </h3>
          <span className="text-xs text-[#4ade80] font-bold">Atualizado em tempo real</span>
        </div>

        <div className="divide-y divide-white/5">
          {recentSales.map((tx) => (
            <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4 text-xs group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#22c55e]/15 text-[#4ade80] flex items-center justify-center font-bold">
                  <ArrowDownLeft size={16} />
                </div>
                <div>
                  <p className="font-bold text-white group-hover:text-[#4ade80] transition-colors">{tx.product}</p>
                  <p className="text-[10px] text-slate-400">{tx.id} • {tx.time}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-black text-[#4ade80] text-sm">+ R$ {tx.commission.toFixed(2)}</p>
                <p className="text-[10px] text-slate-400">Venda: R$ {tx.value.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0d121f] max-w-md w-full p-6 md:p-8 rounded-3xl border border-[#22c55e]/40 shadow-2xl shadow-[#22c55e]/20 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Wallet className="text-[#22c55e]" size={20} /> Solicitar Saque PIX
              </h3>
              <button 
                onClick={() => setShowWithdrawModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Saldo Disponível:</span>
                <span className="font-black text-[#4ade80]">R$ {saldoDisponivel.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Chave PIX de Destino:</span>
                <span className="font-bold text-white">{pixKey}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Taxa de Saque:</span>
                <span className="font-bold text-[#4ade80]">R$ 0,00 (Grátis)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Valor do Saque (R$)
              </label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-base font-black text-white focus:outline-none focus:ring-2 focus:ring-[#22c55e]/30 focus:border-[#22c55e]"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 text-slate-300 font-bold text-xs hover:bg-white/10 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleWithdraw}
                disabled={isWithdrawing}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-black font-black text-xs hover:from-[#4ade80] hover:to-[#22c55e] transition-all shadow-lg shadow-[#22c55e]/25 flex items-center justify-center gap-2"
              >
                {isWithdrawing ? 'Processando...' : 'Confirmar Saque'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
