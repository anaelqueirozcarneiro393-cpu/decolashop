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
  const { saldoDisponivel, vendasTotais, pedidos, cliques } = useSales();
  const [pixType, setPixType] = useState('CPF');
  const [pixKey, setPixKey] = useState('000.000.000-00');
  const [withdrawAmount, setWithdrawAmount] = useState('0,00');
  const [isProcessing, setIsProcessing] = useState(false);

  const userEmail = session?.user?.email || 'nextshopsaas@gmail.com';
  const averageCommission = pedidos > 0 ? (saldoDisponivel / pedidos).toFixed(2).replace('.', ',') : '40,90';

  const handleAntecipacao = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast.success('⚡ Antecipação solicitada! Chave PIX gerada para pagamento da taxa de R$ 50,00.');
    }, 800);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500 font-sans text-slate-800 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[11px] font-black uppercase tracking-wider mb-2 border border-blue-200">
          <span>$</span>
          <span>CONTROLE DE COMISSÕES</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Financeiro</h1>
        <p className="text-xs text-gray-500 mt-1">
          Acompanhe suas vendas, comissões recebidas e solicite saques diretamente para sua conta via PIX.
        </p>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Saldo Disponível */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ee4d2d] to-orange-400" />
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              <Wallet size={14} className="text-[#ee4d2d]" />
              <span>SALDO DISPONÍVEL</span>
            </div>
            <div className="flex items-baseline gap-1 my-2">
              <span className="text-sm font-black text-[#ee4d2d]">R$</span>
              <span className="text-3xl font-black text-gray-900">
                {saldoDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-orange-200 bg-orange-50/50 text-[10px] font-bold text-[#ee4d2d] mb-2">
              <Clock size={11} />
              <span>FALTAM 30 DIAS PARA SACAR</span>
            </div>
            <p className="text-[10px] text-gray-400">Liberação: 29/10/2026, 01:18</p>
          </div>
          <p className="text-[10px] text-gray-400 mt-4 pt-3 border-t border-gray-100">
            Ganhos acumulados através de divulgações bem-sucedidas.
          </p>
        </div>

        {/* Card 2: Vendas Realizadas */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              <ShoppingBag size={14} className="text-gray-500" />
              <span>VENDAS REALIZADAS</span>
            </div>
            <div className="flex items-baseline gap-1.5 my-2">
              <span className="text-3xl font-black text-gray-900">{pedidos}</span>
              <span className="text-xs font-bold text-gray-400">pedidos</span>
            </div>
          </div>
          <div className="text-[10px] text-gray-400 mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span>Unidades: <strong className="text-gray-700">{pedidos}</strong></span>
            <span>Vendas: <strong className="text-gray-700">R$ {vendasTotais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
          </div>
        </div>

        {/* Card 3: Comissão Média */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              <TrendingUp size={14} className="text-gray-500" />
              <span>COMISSÃO MÉDIA</span>
            </div>
            <div className="flex items-baseline gap-1 my-2">
              <span className="text-sm font-black text-gray-500">R$</span>
              <span className="text-3xl font-black text-gray-900">{averageCommission}</span>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-4 pt-3 border-t border-gray-100">
            Média de comissão recebida por pedido.
          </p>
        </div>

        {/* Card 4: Cliques / Visualizações */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              <Eye size={14} className="text-gray-500" />
              <span>CLIQUES / VISUALIZAÇÕES</span>
            </div>
            <div className="flex items-baseline gap-1.5 my-2">
              <span className="text-3xl font-black text-gray-900">{cliques.toLocaleString('pt-BR')}</span>
              <span className="text-[10px] font-bold text-gray-400">visualizações</span>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-4 pt-3 border-t border-gray-100">
            Conversão média estimada de cliques em vendas.
          </p>
        </div>
      </div>

      {/* Main Card: Solicitar Saque via PIX */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Wallet className="text-[#ee4d2d]" size={18} />
          <span>Solicitar Saque via PIX</span>
        </h3>

        {/* Yellow Notice Box matching screenshot */}
        <div className="rounded-2xl p-5 md:p-6 bg-[#fffdf5] border border-amber-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                <Clock size={16} />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-gray-900">Aviso de Saque & Regras de Liberação</span>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  {userEmail}
                </span>
              </div>
            </div>

            <span className="self-start sm:self-auto text-[10px] font-black uppercase tracking-wider bg-amber-100/90 text-amber-800 px-3 py-1 rounded-full border border-amber-300">
              FALTAM 30 DIAS
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[11px] font-bold text-gray-700">
              <span>Carência para Saque Convencional:</span>
              <span>0 de 30 dias (faltam 30 dias)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-amber-100 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-[#ee4d2d] w-[2%]" />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 pt-0.5">
              <span>Início registrado: 29/09/2026, 01:18</span>
              <span>Liberação prevista: 29/10/2026, 01:18</span>
            </div>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            O prazo mínimo para liberação e realização de saque convencional é de <strong>apenas após 30 dias</strong> a partir do seu primeiro acesso. Atualmente <span className="underline decoration-amber-500 font-bold">faltam 30 dias</span> para a liberação gratuita da sua conta.
          </p>

          <p className="text-xs text-gray-600 leading-relaxed">
            Caso queira uma <strong>antecipação de valores</strong> sem esperar os 30 dias, poderá pagar a taxa fixa de <strong>R$ 50,00</strong> e o valor será liberado <strong>instantaneamente via PIX na sua conta</strong>.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-amber-200/60">
            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Zap size={14} className="text-[#ee4d2d] fill-current" /> Liberação imediata via PIX após confirmação da taxa
            </span>

            <button
              onClick={handleAntecipacao}
              className="px-5 py-2.5 rounded-xl bg-[#ee4d2d] hover:bg-[#d94121] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 transition-all active:scale-95"
            >
              <span>QUERO A ANTECIPAÇÃO</span>
              <ExternalLink size={13} />
            </button>
          </div>
        </div>

        {/* Input: Valor a Sacar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-gray-700">
            <span>Valor a Sacar</span>
            <span className="text-gray-400 font-normal">
              Disponível: R$ {saldoDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (sem valor mínimo)
            </span>
          </div>

          <div className="relative">
            <input
              type="text"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-sm font-black text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#ee4d2d]/20 focus:border-[#ee4d2d]"
            />
          </div>

          <p className="text-[10px] text-gray-400 flex items-center gap-1">
            <Clock size={11} /> Faltam 30 dias para o saque convencional gratuito (29/10/2026, 01:18).
          </p>
        </div>

        {/* Inputs: Tipo de Chave & Chave PIX */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Tipo de Chave</label>
            <select
              value={pixType}
              onChange={(e) => setPixType(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#ee4d2d]/20 focus:border-[#ee4d2d]"
            >
              <option value="CPF">CPF</option>
              <option value="CNPJ">CNPJ</option>
              <option value="EMAIL">E-mail</option>
              <option value="TELEFONE">Telefone</option>
              <option value="ALEATORIA">Chave Aleatória</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Chave PIX destinatária</label>
            <input
              type="text"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              placeholder="000.000.000-00"
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#ee4d2d]/20 focus:border-[#ee4d2d]"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3 pt-2">
          {/* Saque Convencional bloqueado */}
          <button
            disabled
            className="w-full py-3.5 px-4 rounded-2xl bg-gray-100 text-gray-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed border border-gray-200"
          >
            <Clock size={14} />
            <span>SAQUE CONVENCIONAL LIBERADO EM 30 DIAS (29/10/2026, 01:18)</span>
          </button>

          {/* Quero Antecipação Instantânea */}
          <button
            onClick={handleAntecipacao}
            disabled={isProcessing}
            className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-[#ee4d2d] to-orange-500 hover:from-[#d94121] hover:to-[#ee4d2d] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-orange-500/25 transition-all active:scale-95"
          >
            <Zap size={15} fill="currentColor" />
            <span>QUERO A ANTECIPAÇÃO INSTANTÂNEA (R$ 50,00)</span>
            <ExternalLink size={14} />
          </button>

          <p className="text-[10px] text-gray-400 text-center">
            Libere o saque de R$ {saldoDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} imediatamente sem esperar os 30 dias.
          </p>
        </div>
      </div>

      {/* Termos de Faturamento e Segurança */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-gray-800 flex items-center gap-2">
          <Lock size={14} className="text-gray-400" /> TERMOS DE FATURAMENTO E SEGURANÇA
        </h4>

        <ul className="space-y-2 text-xs text-gray-500 leading-relaxed list-disc list-inside">
          <li>Os saques são faturados diretamente para sua conta bancária PIX cadastrada.</li>
          <li>Por questões de segurança e integridade das contas, é exigida apenas a carência padrão de <strong>30 dias</strong> a partir do primeiro login para o saque convencional gratuito. A antecipação de valores está disponível a qualquer momento mediante taxa fixa de R$ 50,00 com liberação instantânea via PIX.</li>
          <li>As comissões de produtos reembolsados ou cancelados na Shopee são deduzidas automaticamente do balanço geral.</li>
        </ul>
      </div>
    </div>
  );
}
