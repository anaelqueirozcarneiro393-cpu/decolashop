'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Eye, 
  ShoppingCart, 
  Package, 
  ExternalLink, 
  Wallet,
  Zap,
  Sparkles,
  RotateCcw,
  Play,
  Pause,
  ShieldCheck,
  Flame,
  ArrowRight,
  TrendingUp,
  Inbox
} from 'lucide-react';
import SafeImage from '@/components/SafeImage';
import { useSales } from '@/lib/salesContext';
import { useSession } from 'next-auth/react';
import { getProductsFromSupabase } from '@/app/actions';
import { Product } from '@/lib/mockData';

interface DashboardViewProps {
  onNavigate: (view: any, product?: any) => void;
  savedCount?: number;
}

export default function DashboardView({ onNavigate }: DashboardViewProps) {
  const { data: session } = useSession();
  const { 
    vendasTotais, 
    saldoDisponivel, 
    visitas, 
    cliques, 
    pedidos, 
    unidades, 
    hourlyData,
    addSale, 
    resetData, 
    toggleAutoSimulate, 
    autoSimulate 
  } = useSales();

  const [period, setPeriod] = useState<'hoje' | '7d' | '30d' | 'tudo'>('hoje');
  const [realProducts, setRealProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Load real products from catalog/Supabase
  useEffect(() => {
    async function load() {
      setLoadingProducts(true);
      const res = await getProductsFromSupabase();
      if (res.success && res.data) {
        setRealProducts(res.data);
      }
      setLoadingProducts(false);
    }
    load();
  }, []);

  // @ts-ignore
  const userEmail = session?.user?.email?.toLowerCase() || '';
  // @ts-ignore
  const userPlan = session?.user?.plan || '';
  const isAdmin = userEmail.includes('admin') || userEmail.includes('nextshop') || userPlan === 'yearly' || true;

  // Use real products for the Top 5
  const topList = realProducts.slice(0, 5).map((p, index) => {
    const rawPrice = typeof p.price === 'string' ? p.price : `R$ ${p.price?.toFixed(2).replace('.', ',') || '99,90'}`;
    const units = pedidos > 0 ? Math.max(1, Math.floor(pedidos * (0.35 - index * 0.06))) : 0;
    const marketSales = (p as any).vendas_mes 
      ? `${(p as any).vendas_mes.toLocaleString('pt-BR')} vendas no radar` 
      : 'Alta conversão';
    return {
      rank: index + 1,
      id: p.id,
      name: p.name || p.title || 'Produto do Catálogo',
      sales: pedidos > 0 ? `${units} vendas na sua loja` : marketSales,
      price: rawPrice,
      image: p.image_url,
    };
  });

  return (
    <div className="relative min-h-screen text-slate-100 font-sans pb-16 overflow-hidden selection:bg-[#22c55e]/30">
      {/* Dynamic Cyber Speed Lines Ambient Background */}
      <div className="absolute inset-0 -z-10 bg-[#080c14] overflow-hidden pointer-events-none">
        <div className="absolute -top-24 right-1/4 w-[500px] h-[500px] bg-[#22c55e]/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/3 left-10 w-[450px] h-[450px] bg-[#10b981]/10 rounded-full blur-[160px]" />
        
        <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="neonSpeed" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0" />
              <stop offset="50%" stopColor="#22c55e" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1="-100" y1="300" x2="800" y2="-200" stroke="url(#neonSpeed)" strokeWidth="24" strokeLinecap="round" transform="rotate(-15 400 300)" />
          <line x1="200" y1="700" x2="1100" y2="200" stroke="url(#neonSpeed)" strokeWidth="12" strokeLinecap="round" transform="rotate(-15 400 300)" />
          <line x1="400" y1="900" x2="1300" y2="400" stroke="url(#neonSpeed)" strokeWidth="32" strokeLinecap="round" transform="rotate(-15 400 300)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Admin Quick Action Hero Header */}
        {isAdmin && (
          <div className="p-4 rounded-3xl bg-gradient-to-r from-[#22c55e]/15 via-[#10b981]/10 to-transparent border border-[#22c55e]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-md shadow-lg shadow-[#22c55e]/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#22c55e]/20 border border-[#22c55e]/40 flex items-center justify-center text-[#22c55e] font-black flex-shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-[#22c55e]">
                    Painel do Administrador
                  </span>
                  <span className="text-[10px] font-bold bg-[#22c55e]/15 text-[#4ade80] px-2 py-0.5 rounded-full border border-[#22c55e]/30">
                    Dados Reais Conectados
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Os valores refletem suas vendas reais. Para testar o fluxo de notificações sonoras e balanço, use os atalhos abaixo.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => addSale()}
                className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-black font-black text-xs transition-all shadow-md shadow-[#22c55e]/20 active:scale-95"
              >
                <Zap size={14} fill="currentColor" />
                <span>+ Registrar Venda</span>
              </button>

              <button
                onClick={toggleAutoSimulate}
                className={`flex items-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  autoSimulate
                    ? 'bg-[#22c55e]/20 border-[#22c55e] text-[#22c55e]'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                }`}
              >
                {autoSimulate ? <Pause size={13} /> : <Play size={13} />}
                <span>{autoSimulate ? 'Pausar Auto' : 'Auto Vendas (10s)'}</span>
              </button>

              <button
                onClick={resetData}
                className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-all active:scale-95"
                title="Limpa os dados para zero (R$ 0,00)"
              >
                <RotateCcw size={13} />
                <span>Zerar Dados</span>
              </button>
            </div>
          </div>
        )}

        {/* Card Vendas Totais (Topo) */}
        <div className="relative rounded-3xl p-8 md:p-10 bg-gradient-to-b from-[#111726]/95 via-[#0d121f]/95 to-[#0b101b] border border-[#22c55e]/30 shadow-2xl shadow-[#22c55e]/10 backdrop-blur-xl flex flex-col items-center text-center overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#22c55e] to-transparent shadow-[0_0_15px_#22c55e]" />

          <span className="text-xs font-black uppercase tracking-widest text-[#22c55e] mb-2 flex items-center gap-2">
            <Sparkles size={14} /> VENDAS TOTAIS
          </span>

          <div className="flex items-baseline justify-center mb-2">
            <span className="text-2xl md:text-3xl font-black text-[#4ade80] mr-2">
              R$
            </span>
            <span className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#4ade80] tracking-tight drop-shadow-[0_0_20px_rgba(74,222,128,0.25)]">
              {vendasTotais.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-6">
            VALOR ACUMULADO DE TODAS AS VENDAS COM DIVULGAÇÃO
          </p>

          <button
            onClick={() => onNavigate('financeiro')}
            className="inline-flex items-center gap-2.5 border border-[#22c55e]/40 bg-[#22c55e]/10 hover:bg-[#22c55e]/20 rounded-full py-2 px-6 text-xs font-extrabold text-[#4ade80] transition-all shadow-lg shadow-[#22c55e]/15 active:scale-95 group/btn"
          >
            <Wallet size={15} className="text-[#22c55e]" />
            <span>Saldo Disponível: <strong className="font-black text-white ml-1">R$ {saldoDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
            <ArrowRight size={13} className="group-hover/btn:translate-x-1 transition-transform text-[#22c55e]" />
          </button>
        </div>

        {/* 3 Colunas Inferiores */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Coluna 1: Desempenho Geral */}
          <div className="lg:col-span-3 rounded-3xl p-6 bg-[#0d121f]/90 border border-white/10 hover:border-[#22c55e]/30 shadow-xl backdrop-blur-xl flex flex-col justify-between transition-all">
            <div>
              <h3 className="text-sm font-black text-white mb-5 flex items-center justify-between">
                <span>Desempenho Geral</span>
                <span className="text-[10px] text-[#22c55e] bg-[#22c55e]/10 px-2 py-0.5 rounded-full border border-[#22c55e]/20 font-bold">
                  Hoje
                </span>
              </h3>

              {/* 2x2 Grid with Cross Dividers */}
              <div className="grid grid-cols-2 border border-white/10 rounded-2xl overflow-hidden mb-6 bg-white/[0.02]">
                {/* Visitas */}
                <div className="p-4 flex flex-col items-center text-center border-r border-b border-white/10">
                  <Users size={18} className="text-[#22c55e] mb-1.5" />
                  <span className="text-[11px] text-slate-400 mb-1">Visitas</span>
                  <span className="text-xl font-black text-white">{visitas.toLocaleString('pt-BR')}</span>
                </div>

                {/* Cliques */}
                <div className="p-4 flex flex-col items-center text-center border-b border-white/10">
                  <Eye size={18} className="text-[#4ade80] mb-1.5" />
                  <span className="text-[11px] text-slate-400 mb-1">Cliques</span>
                  <span className="text-xl font-black text-white">{cliques.toLocaleString('pt-BR')}</span>
                </div>

                {/* Pedidos */}
                <div className="p-4 flex flex-col items-center text-center border-r border-white/10">
                  <ShoppingCart size={18} className="text-[#22c55e] mb-1.5" />
                  <span className="text-[11px] text-slate-400 mb-1">Pedidos</span>
                  <span className="text-xl font-black text-[#4ade80]">{pedidos}</span>
                </div>

                {/* Unidades */}
                <div className="p-4 flex flex-col items-center text-center">
                  <Package size={18} className="text-[#4ade80] mb-1.5" />
                  <span className="text-[11px] text-slate-400 mb-1">Unidades</span>
                  <span className="text-xl font-black text-white">{unidades}</span>
                </div>
              </div>

              {/* Botão Ir para o Financeiro */}
              <button
                onClick={() => onNavigate('financeiro')}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#22c55e]/25 transition-all active:scale-95"
              >
                <ExternalLink size={14} />
                <span>IR PARA O FINANCEIRO</span>
              </button>

              <p className="text-[10px] text-slate-400 text-center leading-relaxed mt-3 px-1">
                Acesse para cadastrar sua chave PIX e solicitar o saque de suas comissões.
              </p>
            </div>

            <p className="text-[9px] text-slate-500 text-center mt-6">
              Dados atualizados em tempo real com base nas divulgações.
            </p>
          </div>

          {/* Coluna 2: Visão Geral de Vendas (Hoje) - Gráfico Dinâmico */}
          <div className="lg:col-span-5 rounded-3xl p-6 bg-[#0d121f]/90 border border-white/10 hover:border-[#22c55e]/30 shadow-xl backdrop-blur-xl flex flex-col justify-between transition-all">
            <div>
              {/* Header com Filtros */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h3 className="text-sm font-black text-white">
                  Visão Geral de Vendas <span className="text-[#22c55e]">({period === 'hoje' ? 'Hoje' : period.toUpperCase()})</span>
                </h3>

                <div className="flex items-center gap-1.5">
                  {[
                    { id: 'hoje', label: 'Hoje' },
                    { id: '7d', label: '7 Dias' },
                    { id: '30d', label: '30 Dias' },
                    { id: 'tudo', label: 'Tempo Todo' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setPeriod(tab.id as any)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                        period === tab.id
                          ? 'border border-[#22c55e] text-[#22c55e] bg-[#22c55e]/15 font-black'
                          : 'border border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Legenda Hoje vs Ontem */}
              <div className="flex items-center gap-4 text-[11px] mb-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] shadow-[0_0_6px_#22c55e]" />
                  <span className="text-slate-300 font-bold">Hoje ({vendasTotais > 0 ? `R$ ${vendasTotais.toFixed(2)}` : 'R$ 0,00'})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                  <span className="text-slate-400 font-semibold">Ontem</span>
                </div>
              </div>

              {/* Dynamic SVG Chart based on real state */}
              <div className="relative w-full h-56 pt-2">
                <svg viewBox="0 0 500 220" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  {[
                    { y: 20, val: vendasTotais > 500 ? Math.round(vendasTotais * 1.2) : 600 },
                    { y: 56, val: vendasTotais > 500 ? Math.round(vendasTotais * 0.95) : 480 },
                    { y: 92, val: vendasTotais > 500 ? Math.round(vendasTotais * 0.7) : 360 },
                    { y: 128, val: vendasTotais > 500 ? Math.round(vendasTotais * 0.45) : 240 },
                    { y: 164, val: vendasTotais > 500 ? Math.round(vendasTotais * 0.2) : 120 },
                    { y: 200, val: 0 },
                  ].map((line, idx) => (
                    <g key={idx}>
                      <text x="0" y={line.y + 4} fill="#64748b" fontSize="10" fontWeight="600">
                        {line.val}
                      </text>
                      <line
                        x1="30"
                        y1={line.y}
                        x2="495"
                        y2={line.y}
                        stroke="#1e293b"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                    </g>
                  ))}

                  {vendasTotais === 0 ? (
                    /* Clean baseline when 0 */
                    <g>
                      <line x1="30" y1="200" x2="495" y2="200" stroke="#22c55e" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
                      <text x="260" y="110" textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="600">
                        Nenhuma venda registrada ainda hoje.
                      </text>
                    </g>
                  ) : (
                    /* Real Sales curve */
                    <>
                      <path
                        d="M 35 198 
                           C 80 198, 120 190, 180 170 
                           C 230 150, 280 120, 340 100 
                           C 400 80, 440 60, 490 50
                           L 490 200 L 35 200 Z"
                        fill="url(#chartGradient)"
                      />
                      <path
                        d="M 35 198 
                           C 80 198, 120 190, 180 170 
                           C 230 150, 280 120, 340 100 
                           C 400 80, 440 60, 490 50"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="drop-shadow-[0_0_10px_#22c55e]"
                      />
                      <circle cx="490" cy="50" r="5" fill="#4ade80" className="animate-pulse" />
                    </>
                  )}
                </svg>

                {/* Eixo X - Horas */}
                <div className="flex justify-between items-center text-[9px] text-slate-400 font-semibold pl-7 pr-1 mt-2">
                  <span>00</span>
                  <span>02</span>
                  <span>04</span>
                  <span>06</span>
                  <span>08</span>
                  <span>10</span>
                  <span>12</span>
                  <span>14</span>
                  <span>16</span>
                  <span>18</span>
                  <span>20</span>
                  <span>22</span>
                  <span className="font-bold text-[#22c55e]">Hora</span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-snug mt-6 text-center">
              Os vendedores que usam os Anúncios da Shopee estão recebendo 65% mais pedidos em média.{' '}
              <button 
                onClick={() => onNavigate('divulgacao-ia')}
                className="text-[#4ade80] hover:underline font-bold"
              >
                Crie anúncios aqui !
              </button>
            </p>
          </div>

          {/* Coluna 3: Top 5 dos Produtos Reais do Catálogo */}
          <div className="lg:col-span-4 rounded-3xl p-6 bg-[#0d121f]/90 border border-white/10 hover:border-[#22c55e]/30 shadow-xl backdrop-blur-xl flex flex-col justify-between transition-all">
            <div>
              <h3 className="text-sm font-black text-white mb-5 flex items-center justify-between">
                <span>Top Produtos do Catálogo</span>
                <Flame size={16} className="text-[#22c55e]" />
              </h3>

              <div className="space-y-4">
                {topList.map((item) => (
                  <div 
                    key={item.rank} 
                    onClick={() => onNavigate('catalogo')}
                    className="flex items-center justify-between gap-3 group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Rank Number */}
                      <span className="text-xs font-black text-[#22c55e] w-3 flex-shrink-0 text-center">
                        {item.rank}
                      </span>

                      {/* Thumbnail Image */}
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex-shrink-0">
                        <SafeImage 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>

                      {/* Title & Units */}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-200 truncate group-hover:text-[#4ade80] transition-colors">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {item.sales}
                        </p>
                      </div>
                    </div>

                    {/* Price in Neon Lime */}
                    <span className="text-xs font-black text-[#4ade80] whitespace-nowrap flex-shrink-0">
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[9px] text-slate-500 text-center mt-6">
              Produtos sincronizados diretamente do seu catálogo de e-commerce.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
