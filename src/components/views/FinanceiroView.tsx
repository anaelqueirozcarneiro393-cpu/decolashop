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
  AlertCircle 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function FinanceiroView() {
  const [pixType, setPixType] = useState('cpf');
  const [pixKey, setPixKey] = useState('123.456.789-00');
  const [isSaved, setIsSaved] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('2290.35');

  const transactions = [
    { id: 'TX-9841', product: 'Mochila Notebook Impermeável', value: 'R$ 119,90', commission: '+ R$ 38,36', time: 'Hoje, 01:54', status: 'Aprovado' },
    { id: 'TX-9840', product: 'Smartwatch Serie 8 Ultra', value: 'R$ 149,90', commission: '+ R$ 47,96', time: 'Hoje, 01:42', status: 'Aprovado' },
    { id: 'TX-9839', product: 'Kit Álbum Copa do Mundo 2026', value: 'R$ 167,70', commission: '+ R$ 53,66', time: 'Hoje, 01:28', status: 'Aprovado' },
    { id: 'TX-9838', product: 'Kit Painel Ripado Decoração', value: 'R$ 139,86', commission: '+ R$ 44,75', time: 'Hoje, 00:59', status: 'Aprovado' },
    { id: 'TX-9837', product: 'Chinelo Slide Nuvem Confort', value: 'R$ 119,96', commission: '+ R$ 38,38', time: 'Hoje, 00:41', status: 'Aprovado' },
    { id: 'TX-9836', product: 'Mochila Notebook Impermeável', value: 'R$ 119,90', commission: '+ R$ 38,36', time: 'Hoje, 00:15', status: 'Aprovado' },
  ];

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-3 border border-emerald-500/20">
          <Wallet className="w-3.5 h-3.5" />
          <span>Gestão de Comissões & Repasses</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-2">
          Painel <span className="apex-gradient-text">Financeiro & Saques</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          Acompanhe suas vendas com divulgação, cadastre sua chave PIX e solicite seus saques.
        </p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-dark-bg to-dark-bg border border-emerald-500/30 shadow-xl">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Saldo Disponível</span>
            <Wallet size={18} className="text-emerald-400" />
          </div>
          <p className="text-4xl font-black text-white tracking-tight mb-3">R$ 2.290,35</p>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-black font-black text-xs hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            <Send size={14} />
            <span>Solicitar Saque PIX</span>
          </button>
        </div>

        <div className="p-6 rounded-3xl glass border border-border/50">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Vendas Totais Acumuladas</span>
            <TrendingUp size={18} className="text-primary" />
          </div>
          <p className="text-4xl font-black text-white tracking-tight mb-2">R$ 2.290,35</p>
          <p className="text-xs text-muted-foreground">56 pedidos convertidos pelas divulgações</p>
        </div>

        <div className="p-6 rounded-3xl glass border border-border/50">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Total já Sacado</span>
            <CheckCircle2 size={18} className="text-slate-400" />
          </div>
          <p className="text-4xl font-black text-slate-300 tracking-tight mb-2">R$ 4.850,00</p>
          <p className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
            <ShieldCheck size={14} /> 100% dos pagamentos liquidados
          </p>
        </div>
      </div>

      {/* PIX Key Form */}
      <div className="glass rounded-3xl p-6 md:p-8 border border-border/50">
        <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
          <CreditCard className="text-primary" size={20} /> Dados de Recebimento PIX
        </h3>
        <p className="text-xs text-muted-foreground mb-6">
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
                    ? 'bg-primary/20 border-primary text-white font-black'
                    : 'bg-secondary/30 border-border/50 text-muted-foreground hover:bg-secondary'
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
              className="w-full bg-secondary/30 border border-border/50 rounded-xl py-3 px-4 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-secondary/80 hover:bg-secondary border border-border/60 text-xs font-bold text-white transition-all"
          >
            {isSaved ? '✓ Chave Salva' : 'Salvar Chave PIX'}
          </button>
        </form>
      </div>

      {/* Transaction History */}
      <div className="glass rounded-3xl p-6 md:p-8 border border-border/50 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Clock className="text-primary" size={20} /> Histórico Recente de Conversões
          </h3>
          <span className="text-xs text-muted-foreground">Atualizado em tempo real</span>
        </div>

        <div className="divide-y divide-white/5">
          {transactions.map((tx) => (
            <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                  <ArrowDownLeft size={16} />
                </div>
                <div>
                  <p className="font-bold text-white">{tx.product}</p>
                  <p className="text-[10px] text-muted-foreground">{tx.id} • {tx.time}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-black text-emerald-400 text-sm">{tx.commission}</p>
                <p className="text-[10px] text-muted-foreground">Venda: {tx.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-darker max-w-md w-full p-6 md:p-8 rounded-3xl border border-primary/30 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Wallet className="text-primary" size={20} /> Solicitar Saque PIX
              </h3>
              <button 
                onClick={() => setShowWithdrawModal(false)}
                className="text-muted-foreground hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Saldo Disponível:</span>
                <span className="font-black text-emerald-400">R$ 2.290,35</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Chave PIX de Destino:</span>
                <span className="font-bold text-white">{pixKey}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Taxa de Saque:</span>
                <span className="font-bold text-emerald-400">R$ 0,00 (Grátis)</span>
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
                className="w-full bg-secondary/30 border border-border/50 rounded-xl py-3 px-4 text-base font-black text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 py-3 rounded-xl bg-secondary/50 text-slate-300 font-bold text-xs hover:bg-secondary transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleWithdraw}
                disabled={isWithdrawing}
                className="flex-1 py-3 rounded-xl bg-primary text-black font-black text-xs hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
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
