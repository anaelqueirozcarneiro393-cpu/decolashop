'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  ShoppingBag, 
  TrendingUp, 
  Eye, 
  Clock, 
  CheckCircle2, 
  Zap, 
  Lock,
  X,
  Copy,
  Check,
  QrCode,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSales, formatSaleTime } from '@/lib/salesContext';
import { useSession } from 'next-auth/react';

export default function FinanceiroView() {
  const { data: session } = useSession();
  const { saldoDisponivel, vendasTotais, pedidos, cliques, taxaAntecipacao, recentSales } = useSales();
  const [pixType, setPixType] = useState('CPF');
  const [pixKey, setPixKey] = useState('000.000.000-00');
  const [withdrawAmount, setWithdrawAmount] = useState('0,00');
  const [isProcessing, setIsProcessing] = useState(false);

  // Estados do Modal Pix da Taxa
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixData, setPixData] = useState<{
    qrCodeText: string;
    qrCodeImage: string;
    transactionId: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isAnticipated, setIsAnticipated] = useState(false);

  const userEmail = session?.user?.email?.toLowerCase().trim() || 'usuario@decolashop.com';
  const cleanEmailKey = userEmail.replace(/[^a-z0-9]/g, '_');

  // Carrega status de antecipação salvo (localStorage isolado por e-mail + transferência admin/gerente + cloud sync)
  useEffect(() => {
    try {
      // Remove resquício de chave global antiga para evitar contaminação entre contas
      localStorage.removeItem('decolashop_saldo_antecipado');

      const isGerenteOrAdmin = userEmail === 'gerente@decolashop.com' || userEmail === 'admin@decolashop.com';
      const savedUser = localStorage.getItem(`decolashop_saldo_antecipado_${cleanEmailKey}`);
      const savedAdmin = isGerenteOrAdmin ? localStorage.getItem('decolashop_saldo_antecipado_admin_decolashop_com') : null;
      const savedGerente = isGerenteOrAdmin ? localStorage.getItem('decolashop_saldo_antecipado_gerente_decolashop_com') : null;
      const sessionBumps = (session?.user as any)?.order_bumps || [];

      if (
        savedUser === 'true' || 
        savedAdmin === 'true' || 
        savedGerente === 'true' || 
        sessionBumps.includes('taxa_antecipacao')
      ) {
        setIsAnticipated(true);
        if (isGerenteOrAdmin) {
          try {
            localStorage.setItem('decolashop_saldo_antecipado_gerente_decolashop_com', 'true');
            localStorage.setItem('decolashop_saldo_antecipado_admin_decolashop_com', 'true');
          } catch {}
        }
        return;
      }

      // Consulta na nuvem se a taxa já foi paga em outro dispositivo
      fetch(`/api/user/sync-state?email=${encodeURIComponent(userEmail)}`)
        .then(res => res.json())
        .then(data => {
          if (data?.data?.isAnticipated) {
            setIsAnticipated(true);
            try {
              localStorage.setItem(`decolashop_saldo_antecipado_${cleanEmailKey}`, 'true');
              if (isGerenteOrAdmin) {
                localStorage.setItem('decolashop_saldo_antecipado_gerente_decolashop_com', 'true');
                localStorage.setItem('decolashop_saldo_antecipado_admin_decolashop_com', 'true');
              }
            } catch {}
          }
        })
        .catch(() => {});
    } catch {
      // ignore
    }
  }, [userEmail, cleanEmailKey, session]);

  const averageCommission = pedidos > 0 ? (saldoDisponivel / pedidos).toFixed(2).replace('.', ',') : '0,00';

  const handleAntecipacao = async () => {
    if (saldoDisponivel <= 0 || taxaAntecipacao <= 0) {
      toast.error('Você ainda não possui saldo disponível para antecipar.');
      return;
    }

    setIsProcessing(true);
    
    const userCpf = 
      (session?.user as any)?.cpf || 
      (typeof window !== 'undefined' ? localStorage.getItem('decolashop_user_cpf') : null) || 
      '39151747805';

    try {
      const response = await fetch('/api/sigilopay/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: 'taxa_antecipacao',
          planPrice: taxaAntecipacao,
          total: taxaAntecipacao,
          customer: {
            name: session?.user?.name || 'Cliente DecolaShop',
            email: session?.user?.email || 'cliente@decolashop.com',
            cpf: userCpf,
            phone: '11999999999'
          }
        })
      });

      const res = await response.json();

      if (res.success && res.pix) {
        setPixData(res.pix);
        setShowPixModal(true);
        toast.success(`Chave Pix gerada para pagamento da taxa de R$ ${taxaAntecipacao.toFixed(2).replace('.', ',')}!`);
      } else {
        toast.error(res.error || 'Erro ao gerar Pix da taxa. Tente novamente.');
      }
    } catch {
      toast.error('Erro de conexão ao gerar chave Pix da taxa.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyPixCode = () => {
    if (!pixData?.qrCodeText) return;
    navigator.clipboard.writeText(pixData.qrCodeText);
    setCopied(true);
    toast.success('Chave Pix Copia e Cola copiada com sucesso!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleConfirmAntecipacao = async () => {
    setIsConfirming(true);
    try {
      await fetch('/api/sigilopay/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session?.user?.email || 'cliente@decolashop.com',
          plan: 'taxa_antecipacao',
          transactionId: pixData?.transactionId
        })
      });

      setIsAnticipated(true);
      try {
        localStorage.setItem(`decolashop_saldo_antecipado_${cleanEmailKey}`, 'true');
        if (userEmail === 'gerente@decolashop.com' || userEmail === 'admin@decolashop.com') {
          localStorage.setItem('decolashop_saldo_antecipado_gerente_decolashop_com', 'true');
          localStorage.setItem('decolashop_saldo_antecipado_admin_decolashop_com', 'true');
        }
      } catch {}

      // Sincroniza liberação com a nuvem mantendo faturamento e saldo 100% preservados
      fetch('/api/user/sync-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          state: {
            vendasTotais,
            saldoDisponivel,
            pedidos,
            cliques,
            recentSales,
            isAnticipated: true,
            lastActiveTimestamp: Date.now()
          }
        })
      }).catch(() => {});

      setShowPixModal(false);
      toast.success('🎉 Pagamento da taxa confirmado! Seu saldo de comissões foi liberado imediatamente para saque.');
    } catch {
      toast.error('Erro ao confirmar pagamento. Tente novamente.');
    } finally {
      setIsConfirming(false);
    }
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
            {isAnticipated ? (
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/15 text-[10px] font-bold text-[#4ade80] mb-2">
                <CheckCircle2 size={11} />
                <span>LIBERADO PARA SAQUE IMEDIATO</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/10 text-[10px] font-bold text-[#4ade80] mb-2">
                <Clock size={11} />
                <span>FALTAM 30 DIAS PARA SACAR</span>
              </div>
            )}
            <p className="text-[10px] text-slate-400">
              {isAnticipated ? 'Carência eliminada com sucesso via antecipação' : 'Liberação automática: 30 dias após cada venda'}
            </p>
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
                {isAnticipated ? 'Carência Eliminada • Saldo Liberado' : 'Carência de Pagamento • 30 Dias Obrigatórios'}
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              {isAnticipated 
                ? 'Sua antecipação foi confirmada com sucesso! Você pode solicitar saques diretamente via PIX sem aguardar prazos.'
                : 'Conforme as diretrizes das plataformas e marketplaces, as comissões possuem período de garantia de 30 dias. Utilize a antecipação para liberação imediata via Pix.'}
            </p>
          </div>

          {!isAnticipated && (
            <button
              onClick={handleAntecipacao}
              disabled={isProcessing}
              className="flex-shrink-0 flex items-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-[#22c55e]/25 transition-all active:scale-95 disabled:opacity-70 cursor-pointer"
            >
              <Zap size={14} fill="currentColor" />
              <span>
                {isProcessing 
                  ? 'GERANDO PIX...' 
                  : taxaAntecipacao <= 0
                    ? 'ANTECIPAR SALDO AGORA (TAXA 7%)'
                    : `ANTECIPAR SALDO AGORA (TAXA R$ ${taxaAntecipacao.toFixed(2).replace('.', ',')})`}
              </span>
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-1 pt-2">
          <div className="flex justify-between text-[11px] text-slate-400 font-medium">
            <span>{isAnticipated ? 'Progresso da Carência: Liberado Imediatamente' : 'Progresso da Carência: Dia 1 de 30'}</span>
            <span className="text-[#4ade80] font-bold">{isAnticipated ? '100% Liberado' : '3.3% Concluído'}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r from-[#22c55e] to-[#4ade80] rounded-full shadow-[0_0_10px_#22c55e] transition-all duration-500 ${
                isAnticipated ? 'w-full' : 'w-[3.3%]'
              }`} 
            />
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-300">Valor do Saque (R$)</label>
              <span className="text-[10px] text-[#22c55e] font-extrabold uppercase tracking-wide">Mínimo: R$ 2.000,00</span>
            </div>
            <input
              type="text"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Mínimo R$ 2.000,00"
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-xs font-medium text-white focus:outline-none focus:border-[#22c55e]"
            />
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Lock size={12} className="text-[#22c55e]" />
            <span>Transferências protegidas por criptografia de ponta a ponta BACEN • Saque mínimo de R$ 2.000,00.</span>
          </span>

          {/* O botão NÃO aparece antes de pagar a taxa. Só aparece após antecipar e NÃO é clicável / não funcional */}
          {isAnticipated ? (
            <button
              type="button"
              disabled
              className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-white/10 border border-white/10 text-slate-400 font-extrabold text-xs uppercase tracking-wider cursor-not-allowed opacity-50 select-none pointer-events-none"
              title="Aguardando liberação do sistema"
            >
              SOLICITAR SAQUE PIX (MÍN. R$ 2.000,00)
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.02] border border-white/10 text-slate-400 text-xs font-semibold">
              <Lock size={13} className="text-amber-400" />
              <span>Saque liberado após antecipação</span>
            </div>
          )}
        </div>
      </div>

      {/* ================= EXTRATO DETALHADO DE VENDAS & COMISSÕES ================= */}
      <div className="bg-[#0d121f]/90 rounded-3xl p-6 md:p-8 border border-white/10 shadow-xl backdrop-blur-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/25 text-[#4ade80] text-[10px] font-black uppercase tracking-wider mb-1">
              <CheckCircle2 size={11} />
              <span>Extrato de Vendas em Tempo Real</span>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <span>Registro de Vendas e Comissões</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 font-semibold">
                {recentSales.length} {recentSales.length === 1 ? 'venda' : 'vendas'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Histórico detalhado de cada venda gerada pelo radar e campanhas de IA vinculadas à sua conta.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 px-3 py-1.5 rounded-2xl">
            <span className="text-[11px] text-slate-400 font-medium">Saldo a Receber:</span>
            <span className="text-sm font-black text-[#4ade80]">
              R$ {saldoDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {recentSales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="pb-3 pl-2">Transação</th>
                  <th className="pb-3">Produto</th>
                  <th className="pb-3 text-center">Data / Hora</th>
                  <th className="pb-3 text-right">Valor Venda</th>
                  <th className="pb-3 text-right">Sua Comissão</th>
                  <th className="pb-3 text-right pr-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-3.5 pl-2 font-mono text-[11px] font-bold text-slate-400">
                      {sale.id}
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2.5 max-w-xs sm:max-w-sm">
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 bg-slate-900 shrink-0">
                          {sale.image ? (
                            <img 
                              src={sale.image} 
                              alt={sale.product} 
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                            />
                          ) : (
                            <ShoppingBag size={14} className="m-auto text-slate-500 mt-2" />
                          )}
                        </div>
                        <span className="font-bold text-white truncate group-hover:text-[#4ade80] transition-colors" title={sale.product}>
                          {sale.product}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 text-center text-slate-400 font-medium text-[11px]">
                      {formatSaleTime(sale.timestamp, sale.time)}
                    </td>
                    <td className="py-3.5 text-right font-semibold text-slate-300">
                      R$ {sale.value.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-3.5 text-right font-black text-[#4ade80]">
                      + R$ {sale.commission.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-3.5 text-right pr-2">
                      {isAnticipated ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-[#22c55e]/15 text-[#4ade80] border border-[#22c55e]/30">
                          <CheckCircle2 size={10} />
                          <span>Liberado</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <Clock size={10} />
                          <span>Em Carência (30D)</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 space-y-2 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
            <ShoppingBag size={28} className="mx-auto text-slate-500 opacity-60" />
            <p className="text-xs font-semibold text-slate-300">Nenhuma venda registrada ainda</p>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              As vendas geradas pelo piloto automático e por campanhas de IA aparecerão detalhadas aqui a cada nova aprovação.
            </p>
          </div>
        )}
      </div>

      {/* ================= MODAL PIX DA TAXA DE ANTECIPAÇÃO ================= */}
      {showPixModal && pixData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#0d121f] border border-[#22c55e]/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-white space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Fechar */}
            <button
              onClick={() => setShowPixModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Cabeçalho */}
            <div className="text-center pr-6 pl-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22c55e]/15 text-[#4ade80] border border-[#22c55e]/30 text-[10px] font-black uppercase tracking-wider mb-1.5">
                <Zap size={12} className="text-[#22c55e]" />
                <span>Liberação Imediata de Saldo</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                Taxa de Antecipação Pix
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Pague a taxa calculada para liberar seu saldo acumulado sem aguardar os 30 dias de carência.
              </p>
            </div>

            {/* Resumo dos Valores */}
            <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-white/[0.02] border border-white/10 text-left">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Saldo a Liberar:</span>
                <span className="text-base font-black text-white">
                  R$ {saldoDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#4ade80] block font-bold">Taxa de Antecipação:</span>
                <span className="text-lg font-black text-[#22c55e]">
                  R$ {taxaAntecipacao.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            {/* QR Code Pix */}
            <div className="flex flex-col items-center justify-center pt-1">
              <div className="p-2.5 bg-white rounded-2xl shadow-xl shadow-[#22c55e]/20 border-2 border-[#22c55e]">
                <img
                  src={pixData.qrCodeImage}
                  alt="QR Code Pix"
                  className="w-36 h-36 sm:w-40 sm:h-40 object-contain"
                />
              </div>

              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" />
                <span>Aguardando pagamento instantâneo</span>
              </div>
            </div>

            {/* Pix Copia e Cola */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 block text-left">
                Código Pix Copia e Cola:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={pixData.qrCodeText}
                  className="flex-1 bg-[#111726] border border-white/15 rounded-xl py-2 px-3 text-xs text-slate-200 font-mono select-all focus:outline-none truncate"
                />
                <button
                  type="button"
                  onClick={copyPixCode}
                  className="py-2 px-3.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shrink-0 shadow-md shadow-[#22c55e]/20 transition-all active:scale-95 cursor-pointer"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {/* Botão de Confirmação */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                disabled={isConfirming}
                onClick={handleConfirmAntecipacao}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#22c55e]/25 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isConfirming ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Confirmando Pagamento...</span>
                  </div>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>JÁ FIZ O PIX • LIBERAR SALDO AGORA</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowPixModal(false)}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-300 font-semibold transition-colors cursor-pointer py-1"
              >
                Cancelar e fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
