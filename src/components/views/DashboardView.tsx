'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Eye, 
  ShoppingCart, 
  Package, 
  Sparkles, 
  ArrowRight,
  Wallet,
  ExternalLink,
  Flame,
  TrendingUp,
  RotateCcw,
  Zap,
  Play,
  Pause,
  ShieldCheck
} from 'lucide-react';
import { ViewType } from '@/app/page';
import { useSales } from '@/lib/salesContext';
import { useSession } from 'next-auth/react';
import { Product } from '@/lib/mockData';

interface DashboardViewProps {
  onNavigate: (view: ViewType, product?: Product) => void;
  savedCount: number;
}

// Fallback safe image component
function SafeImage({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [error, setError] = useState(false);
  const fallback = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800';

  return (
    <img
      src={error || !src ? fallback : src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
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
    availableProducts
  } = useSales();

  const [period, setPeriod] = useState<'hoje' | '7d' | '30d' | 'tudo'>('hoje');

  // Use real products for the Top 5
  const topList = availableProducts.slice(0, 5).map((p, index) => {
    const rawPrice = typeof p.price === 'string' ? p.price : `R$ ${p.price?.toFixed(2).replace('.', ',') || '99,90'}`;
    const units = pedidos > 0 ? Math.max(1, Math.floor(pedidos * (0.35 - index * 0.06))) : 0;
    const marketSales = p.vendas_mes 
      ? `${p.vendas_mes.toLocaleString('pt-BR')} no radar` 
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
    <div className="relative min-h-screen text-slate-100 font-sans pb-12 sm:pb-16 overflow-hidden selection:bg-[#22c55e]/30">
      {/* Dynamic Ambient Background */}
      <div className="absolute inset-0 -z-10 bg-[#080c14] overflow-hidden pointer-events-none">
        <div className="absolute -top-24 right-1/4 w-[500px] h-[500px] bg-[#22c55e]/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/3 left-10 w-[450px] h-[450px] bg-[#10b981]/10 rounded-full blur-[160px]" />
      </div>

      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-5 md:space-y-6">

        {/* Card Vendas Totais (Topo Compacto no Mobile) */}
        <div className="relative rounded-2xl sm:rounded-3xl p-4 sm:p-7 md:p-9 bg-gradient-to-b from-[#111726]/95 via-[#0d121f]/95 to-[#0b101b] border border-[#22c55e]/30 shadow-2xl shadow-[#22c55e]/10 backdrop-blur-xl flex flex-col items-center text-center overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 sm:h-1.5 bg-gradient-to-r from-transparent via-[#22c55e] to-transparent shadow-[0_0_15px_#22c55e]" />

          <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#22c55e] mb-1 sm:mb-2 flex items-center gap-1.5">
            <Sparkles size={13} /> VENDAS TOTAIS
          </span>

          <div className="flex items-baseline justify-center mb-1 sm:mb-2">
            <span className="text-xl sm:text-2xl md:text-3xl font-black text-[#4ade80] mr-1.5 sm:mr-2">
              R$
            </span>
            <span className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#4ade80] tracking-tight drop-shadow-[0_0_20px_rgba(74,222,128,0.25)]">
              {vendasTotais.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <p className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 sm:mb-5">
            VALOR ACUMULADO DE TODAS AS VENDAS COM DIVULGAÇÃO
          </p>

          <button
            onClick={() => onNavigate('financeiro')}
            className="inline-flex items-center gap-2 border border-[#22c55e]/40 bg-[#22c55e]/10 hover:bg-[#22c55e]/20 rounded-full py-1.5 px-4 sm:py-2 sm:px-6 text-[11px] sm:text-xs font-extrabold text-[#4ade80] transition-all shadow-lg shadow-[#22c55e]/15 active:scale-95 group/btn"
          >
            <Wallet size={14} className="text-[#22c55e]" />
            <span>Saldo Disponível: <strong className="font-black text-white ml-1">R$ {saldoDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
            <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform text-[#22c55e]" />
          </button>
        </div>

        {/* 3 Colunas Inferiores Otimizadas para Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 md:gap-6 items-stretch">
          
          {/* Coluna 1: Desempenho Geral (Fita 4-col no mobile) */}
          <div className="lg:col-span-3 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 md:p-6 bg-[#0d121f]/90 border border-white/10 hover:border-[#22c55e]/30 shadow-xl backdrop-blur-xl flex flex-col justify-between transition-all">
            <div>
              <h3 className="text-xs sm:text-sm font-black text-white mb-2.5 sm:mb-4 flex items-center justify-between">
                <span>Desempenho Geral</span>
                <span className="text-[9px] text-[#22c55e] bg-[#22c55e]/10 px-2 py-0.5 rounded-full border border-[#22c55e]/20 font-bold">
                  Hoje
                </span>
              </h3>

              {/* Grid 4 colunas no mobile / 2x2 no desktop */}
              <div className="grid grid-cols-4 sm:grid-cols-2 border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-5 bg-white/[0.02]">
                {/* Visitas */}
                <div className="p-2 sm:p-3.5 flex flex-col items-center text-center border-r border-white/10 sm:border-b">
                  <Users size={15} className="text-[#22c55e] mb-1" />
                  <span className="text-[10px] sm:text-[11px] text-slate-400 mb-0.5">Visitas</span>
                  <span className="text-sm sm:text-lg md:text-xl font-black text-white">{visitas.toLocaleString('pt-BR')}</span>
                </div>

                {/* Cliques */}
                <div className="p-2 sm:p-3.5 flex flex-col items-center text-center border-r sm:border-r-0 border-white/10 sm:border-b">
                  <Eye size={15} className="text-[#4ade80] mb-1" />
                  <span className="text-[10px] sm:text-[11px] text-slate-400 mb-0.5">Cliques</span>
                  <span className="text-sm sm:text-lg md:text-xl font-black text-white">{cliques.toLocaleString('pt-BR')}</span>
                </div>

                {/* Pedidos */}
                <div className="p-2 sm:p-3.5 flex flex-col items-center text-center border-r border-white/10">
                  <ShoppingCart size={15} className="text-[#22c55e] mb-1" />
                  <span className="text-[10px] sm:text-[11px] text-slate-400 mb-0.5">Pedidos</span>
                  <span className="text-sm sm:text-lg md:text-xl font-black text-[#4ade80]">{pedidos}</span>
                </div>

                {/* Unidades */}
                <div className="p-2 sm:p-3.5 flex flex-col items-center text-center">
                  <Package size={15} className="text-[#4ade80] mb-1" />
                  <span className="text-[10px] sm:text-[11px] text-slate-400 mb-0.5">Unidades</span>
                  <span className="text-sm sm:text-lg md:text-xl font-black text-white">{unidades}</span>
                </div>
              </div>

              {/* Botão Ir para o Financeiro */}
              <button
                onClick={() => onNavigate('financeiro')}
                className="w-full py-2.5 sm:py-3.5 px-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-[#22c55e]/25 transition-all active:scale-95"
              >
                <ExternalLink size={13} />
                <span>IR PARA O FINANCEIRO</span>
              </button>
            </div>

            <p className="text-[9px] text-slate-500 text-center mt-3 hidden sm:block">
              Dados atualizados em tempo real com base nas divulgações.
            </p>
          </div>

          {/* Coluna 2: Visão Geral de Vendas (Hoje) - Gráfico Compacto no Mobile */}
          <div className="lg:col-span-5 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 md:p-6 bg-[#0d121f]/90 border border-white/10 hover:border-[#22c55e]/30 shadow-xl backdrop-blur-xl flex flex-col justify-between transition-all">
            <div>
              {/* Header com Filtros */}
              <div className="flex items-center justify-between gap-2 mb-2 sm:mb-4">
                <h3 className="text-xs sm:text-sm font-black text-white truncate">
                  Visão Geral <span className="text-[#22c55e]">({period === 'hoje' ? 'Hoje' : period.toUpperCase()})</span>
                </h3>

                <div className="flex items-center gap-1">
                  {[
                    { id: 'hoje', label: 'Hoje' },
                    { id: '7d', label: '7D' },
                    { id: '30d', label: '30D' },
                    { id: 'tudo', label: 'Tudo' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setPeriod(tab.id as any)}
                      className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold transition-all ${
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
              <div className="flex items-center gap-3 text-[10px] sm:text-[11px] mb-2 sm:mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#22c55e] shadow-[0_0_6px_#22c55e]" />
                  <span className="text-slate-300 font-bold">Hoje ({vendasTotais > 0 ? `R$ ${vendasTotais.toFixed(2)}` : 'R$ 0,00'})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  <span className="text-slate-400 font-semibold">Ontem</span>
                </div>
              </div>

              {/* Dynamic SVG Chart */}
              <div className="relative w-full h-36 sm:h-44 md:h-52 pt-1">
                <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  {[40, 80, 120, 160].map((y) => (
                    <line key={y} x1="25" y1={y} x2="495" y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                  ))}

                  {/* Vertical Hour reference lines */}
                  {hourlyData.map((h, i) => (
                    <g key={h.hour}>
                      <line x1={35 + i * 38} y1="30" x2={35 + i * 38} y2="180" stroke="rgba(255,255,255,0.03)" strokeDasharray="2 4" />
                    </g>
                  ))}

                  {vendasTotais === 0 ? (
                    <g>
                      <line x1="30" y1="180" x2="495" y2="180" stroke="#22c55e" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
                      <text x="260" y="100" textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="600">
                        Nenhuma venda registrada ainda hoje.
                      </text>
                    </g>
                  ) : (
                    <>
                      <path
                        d="M 35 178 
                           C 80 178, 120 170, 180 150 
                           C 230 130, 280 100, 340 80 
                           C 400 60, 440 45, 490 35
                           L 490 180 L 35 180 Z"
                        fill="url(#chartGradient)"
                      />
                      <path
                        d="M 35 178 
                           C 80 178, 120 170, 180 150 
                           C 230 130, 280 100, 340 80 
                           C 400 60, 440 45, 490 35"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="drop-shadow-[0_0_10px_#22c55e]"
                      />
                      <circle cx="490" cy="35" r="4.5" fill="#4ade80" className="animate-pulse" />
                    </>
                  )}
                </svg>

                {/* Eixo X - Horas */}
                <div className="flex justify-between items-center text-[8px] sm:text-[9px] text-slate-400 font-semibold pl-6 pr-1 mt-1">
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

            <p className="text-[9px] text-slate-400 leading-snug mt-3 text-center">
              Anúncios Shopee & TikTok convertem 65% mais.{' '}
              <button 
                onClick={() => onNavigate('divulgacao-ia')}
                className="text-[#4ade80] hover:underline font-bold"
              >
                Crie anúncios aqui!
              </button>
            </p>
          </div>

          {/* Coluna 3: Top Produtos Reais do Catálogo (Compacto no Mobile) */}
          <div className="lg:col-span-4 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 md:p-6 bg-[#0d121f]/90 border border-white/10 hover:border-[#22c55e]/30 shadow-xl backdrop-blur-xl flex flex-col justify-between transition-all">
            <div>
              <h3 className="text-xs sm:text-sm font-black text-white mb-2.5 sm:mb-4 flex items-center justify-between">
                <span>Top Produtos no Radar</span>
                <Flame size={15} className="text-[#22c55e]" />
              </h3>

              <div className="space-y-2 sm:space-y-3.5">
                {topList.map((item) => (
                  <div 
                    key={item.rank} 
                    onClick={() => onNavigate('catalogo')}
                    className="flex items-center justify-between gap-2.5 p-1 rounded-xl hover:bg-white/[0.03] transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                      {/* Rank Number */}
                      <span className="text-[11px] sm:text-xs font-black text-[#22c55e] w-3 flex-shrink-0 text-center">
                        {item.rank}
                      </span>

                      {/* Thumbnail Image */}
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl overflow-hidden bg-black/40 border border-white/10 flex-shrink-0">
                        <SafeImage 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>

                      {/* Title & Units */}
                      <div className="min-w-0">
                        <p className="text-[11px] sm:text-xs font-bold text-slate-200 truncate group-hover:text-[#4ade80] transition-colors max-w-[150px] sm:max-w-[200px]">
                          {item.name}
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 truncate">
                          {item.sales}
                        </p>
                      </div>
                    </div>

                    {/* Price in Neon Lime */}
                    <span className="text-[11px] sm:text-xs font-black text-[#4ade80] whitespace-nowrap flex-shrink-0">
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[9px] text-slate-500 text-center mt-3 hidden sm:block">
              Sincronizado diretamente do catálogo DecolaShop.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
