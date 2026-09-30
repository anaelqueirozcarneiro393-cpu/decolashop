'use client';

import React, { useState } from 'react';
import { 
  Wallet, 
  ShoppingBag, 
  TrendingUp, 
  Eye, 
  Clock, 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  Lock,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSales } from '@/lib/salesContext';
import { useSession } from 'next-auth/react';

export default function FinanceiroView() {
  const { data: session } = useSession();
  const { saldoDisponivel, vendasTotais, pedidos, cliques, taxaAntecipacao } = useSales();
  const [pixType, setPixType] = useState('CPF');
  const [pixKey, setPixKey] = useState('000.000.000-00');
  const [withdrawAmount, setWithdrawAmount] = useState('0,00');
  const [isProcessing, setIsProcessing] = useState(false);

  const userEmail = session?.user?.email || 'nextshopsaas@gmail.com';
  const averageCommission = pedidos > 0 ? (saldoDisponivel / pedidos).toFixed(2).replace('.', ',') : '0,00';

  const handleAntecipacao = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast.success(`⚡ Antecipação solicitada! Chave PIX gerada para pagamento da taxa de R$ ${taxaAntecipacao.toFixed(2).replace('.', ',')}.`);
    }, 800);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500 font-sans text-slate-100 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22c55e]/15 text-[#4ade80] text-[11px] font-black uppercase tracking-wider mb-2 border border-[#22c55e]/30 shadow-[0_0_10px_rgba(34,197,94,0.15)]">
          <span>$</span>
          <span>CONTROLE DE COMISSÕES</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Financeiro</h1>
        <p className="text-xs text-slate-400 mt-1">
          Acompanhe suas vendas, comissões recebidas e solicite saques diretamente para sua conta via PIX.
        </p>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Saldo Disponível */}
        <div className="bg-[#0d121f]/90 rounded-3xl p-6 border border-white/10 shadow-xl backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#22c55e] to-[#4ade80] shadow-[0_0_10px_#22c55e]" />
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              <Wallet size={14} className="text-[#22c55e]" />
              <span>SALDO DISPONÍVEL</span>
            </div>
            <div className="flex items-baseline gap-1 my-2">
              <span className="text-sm font-black text-[#4ade80]">R$</span>
              <span className="text-3xl font-black text-white">
                {saldoDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/10 text-[10px] font-bold text-[#4ade80] mb-2">
              <Clock size={11} />
              <span>FALTAM 30 DIAS PARA SACAR</span>
            </div>
            <p className="text-[10px] text-slate-400">Liberação: 29/10/2026, 01:18</p>
          </div>
          <p className="text-[10px] text-slate-500 mt-4 pt-3 border-t border-white/10">
            Ganhos acumulados através de divulgações bem-sucedidas.
          </p>
        </div>

        {/* Card 2: Vendas Realizadas */}
        <div className="bg-[#0d121f]/90 rounded-3xl p-6 border border-white/10 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              <ShoppingBag size={14} className="text-slate-400" />
              <span>VENDAS REALIZADAS</span>
            </div>
            <div className="flex items-baseline gap-1.5 my-2">
              <span className="text-3xl font-black text-white">{pedidos}</span>
              <span className="text-xs font-bold text-slate-400">pedidos</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <span>Unidades: <strong className="text-white">{pedidos}</strong></span>
            <span>Vendas: <strong className="text-white">R$ {vendasTotais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
          </div>
        </div>

        {/* Card 3: Comissão Média */}
        <div className="bg-[#0d121f]/90 rounded-3xl p-6 border border-white/10 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              <TrendingUp size={14} className="text-[#22c55e]" />
              <span>COMISSÃO MÉDIA</span>
            </div>
            <div className="flex items-baseline gap-1 my-2">
              <span className="text-sm font-black text-[#4ade80]">R$</span>
              <span className="text-3xl font-black text-white">{averageCommission}</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-4 pt-3 border-t border-white/10">
            Média de 32% por cada produto vendido.
          </p>
        </div>

        {/* Card 4: Cliques Totais */}
        <div className="bg-[#0d121f]/90 rounded-3xl p-6 border border-white/10 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              <Eye size={14} className="text-cyan-400" />
              <span>CLIQUES TOTAIS</span>
            </div>
            <div className="flex items-baseline gap-1.5 my-2">
              <span className="text-3xl font-black text-white">{cliques.toLocaleString('pt-BR')}</span>
              <span className="text-xs font-bold text-slate-400">acessos</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-4 pt-3 border-t border-white/10">
            Tráfego orgânico gerado via posts com IA.
          </p>
        </div>
      </div>

      {/* Carência & Antecipação Card */}
      <div className="bg-[#0d121f]/90 rounded-3xl p-6 md:p-8 border border-white/10 shadow-xl backdrop-blur-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#22c55e]" />
              <h3 className="text-sm font-extrabold text-white">
                Carência de Pagamento • 30 Dias Obrigatórios
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Conforme as diretrizes das plataformas de afiliados e marketplace, as comissões possuem período de garantia de entrega de 30 dias para liberação do saque normal.
            </p>
          </div>

          <button
            onClick={handleAntecipacao}
            disabled={isProcessing}
            className="flex-shrink-0 flex items-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-[#22c55e]/25 transition-all active:scale-95 disabled:opacity-70"
          >
            <Zap size={14} fill="currentColor" />
            <span>{isProcessing ? 'GERANDO PIX...' : `ANTECIPAR SALDO AGORA (TAXA R$ ${taxaAntecipacao.toFixed(2).replace('.', ',')})`}</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1 pt-2">
          <div className="flex justify-between text-[11px] text-slate-400 font-medium">
            <span>Progresso da Carência: Dia 1 de 30</span>
            <span className="text-[#4ade80] font-bold">3.3% Concluído</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#22c55e] to-[#4ade80] w-[3.3%] rounded-full shadow-[0_0_10px_#22c55e]" />
          </div>
        </div>
      </div>

      {/* Solicitação de Saque PIX Card */}
      <div className="bg-[#0d121f]/90 rounded-3xl p-6 md:p-8 border border-white/10 shadow-xl backdrop-blur-xl space-y-6">
        <div>
          <h3 className="text-sm font-extrabold text-white">
            Solicitar Saque PIX
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Cadastre sua chave PIX de mesma titularidade para transferências instantâneas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Tipo de Chave</label>
            <select
              value={pixType}
              onChange={(e) => setPixType(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-xs font-medium text-white focus:outline-none focus:border-[#22c55e]"
            >
              <option value="CPF">CPF</option>
              <option value="CNPJ">CNPJ</option>
              <option value="EMAIL">E-mail</option>
              <option value="TELEFONE">Telefone</option>
              <option value="ALEATORIA">Chave Aleatória</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Chave PIX</label>
            <input
              type="text"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              placeholder="Digite sua chave PIX"
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-xs font-medium text-white focus:outline-none focus:border-[#22c55e]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Valor do Saque (R$)</label>
            <input
              type="text"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="0,00"
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-xs font-medium text-white focus:outline-none focus:border-[#22c55e]"
            />
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Lock size={12} className="text-[#22c55e]" />
            <span>Transferências protegidas por criptografia de ponta a ponta BACEN.</span>
          </span>

          <button
            onClick={() => {
              if (parseFloat(withdrawAmount.replace(',', '.')) <= 0) {
                toast.error('Informe um valor válido para solicitar o saque');
                return;
              }
              toast.error('Saldo em período de carência de 30 dias. Utilize a antecipação para liberação imediata.');
            }}
            className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-extrabold text-xs uppercase tracking-wider transition-all"
          >
            SOLICITAR SAQUE NORMAL
          </button>
        </div>
      </div>
    </div>
  );
}
