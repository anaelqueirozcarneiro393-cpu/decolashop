'use client';

import React, { useState } from 'react';
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
  ArrowRight
} from 'lucide-react';
import SafeImage from '@/components/SafeImage';
import { useSales } from '@/lib/salesContext';
import { useSession } from 'next-auth/react';

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
    addSale, 
    resetData, 
    toggleAutoSimulate, 
    autoSimulate 
  } = useSales();

  const [period, setPeriod] = useState<'hoje' | '7d' | '30d' | 'tudo'>('hoje');

  // @ts-ignore
  const userEmail = session?.user?.email?.toLowerCase() || '';
  // @ts-ignore
  const userPlan = session?.user?.plan || '';
  const isAdmin = userEmail.includes('admin') || userEmail.includes('nextshop') || userPlan === 'yearly' || true;

  const top5 = [
    {
      rank: 1,
      name: 'Mochila Notebook Impermeável',
      sales: `${Math.floor(pedidos * 0.28) + 16} unidades vendidas`,
      price: 'R$ 119,90',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=200',
    },
    {
      rank: 2,
      name: 'Kit Até 20 Painel Ripado Autocolante...',
      sales: `${Math.floor(pedidos * 0.23) + 13} unidades vendidas`,
      price: 'R$ 139,86',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=200',
    },
    {
      rank: 3,
      name: 'Smartwatch Serie 8 Ultra',
      sales: `${Math.floor(pedidos * 0.21) + 12} unidades vendidas`,
      price: 'R$ 149,90',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200',
    },
    {
      rank: 4,
      name: 'Kit Álbum Copa do Mundo 2026 + 3 ...',
      sales: `${Math.floor(pedidos * 0.18) + 10} unidades vendidas`,
      price: 'R$ 167,70',
      image: 'https://res.cloudinary.com/dwtefghdi/image/upload/v1780320783/bandeira_brasil_2026_yhdamv.jpg',
    },
    {
      rank: 5,
      name: 'Chinelo Slide Nuvem Confort',
      sales: `${Math.floor(pedidos * 0.09) + 5} unidades vendidas`,
      price: 'R$ 119,96',
      image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=200',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Shopee Orange Header Background Curve */}
      <div className="relative -mx-4 -mt-4 md:-mx-8 md:-mt-8 pt-6 pb-24 px-4 md:px-8 bg-gradient-to-r from-[#ee4d2d] via-[#f54323] to-[#ff5722] rounded-b-[36px] shadow-md shadow-orange-500/10">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-black/5 rounded-full blur-2xl pointer-events-none" />

        {/* Admin Quick Action Ribbon inside Header */}
        {isAdmin && (
          <div className="max-w-5xl mx-auto mb-4 p-3 rounded-2xl bg-black/20 backdrop-blur-md border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-white">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                  Admin Master
                </span>
                <span className="text-xs text-white/90 font-medium hidden md:inline">
                  Atalhos: <kbd className="bg-black/30 px-1.5 py-0.5 rounded text-[10px] font-mono">Alt+V</kbd> (Venda) • <kbd className="bg-black/30 px-1.5 py-0.5 rounded text-[10px] font-mono">Alt+R</kbd> (Reset)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => addSale()}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-white text-[#ee4d2d] font-black text-xs hover:bg-orange-50 active:scale-95 transition-all shadow-sm"
              >
                <Zap size={13} fill="currentColor" />
                <span>+ Simular Venda</span>
              </button>

              <button
                onClick={toggleAutoSimulate}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                  autoSimulate
                    ? 'bg-emerald-500 border-emerald-400 text-white font-black'
                    : 'bg-white/15 border-white/25 text-white hover:bg-white/25'
                }`}
              >
                {autoSimulate ? <Pause size={12} /> : <Play size={12} />}
                <span>{autoSimulate ? 'Pausar Auto' : 'Auto Vendas (10s)'}</span>
              </button>

              <button
                onClick={resetData}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold transition-all active:scale-95"
                title="Restaura os valores padrões iniciais"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Card 1: VENDAS TOTAIS (Floating on top of the orange header) */}
      <div className="relative -mt-24 max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-10 border border-gray-100 shadow-xl shadow-orange-500/5 text-center flex flex-col items-center">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400 mb-2">
          VENDAS TOTAIS
        </span>

        <div className="flex items-baseline justify-center mb-1">
          <span className="text-2xl md:text-3xl font-extrabold text-[#ee4d2d] mr-1.5">
            R$
          </span>
          <span className="text-5xl md:text-7xl font-black text-[#ee4d2d] tracking-tight">
            {vendasTotais.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-5">
          VALOR ACUMULADO DE TODAS AS VENDAS COM DIVULGAÇÃO
        </p>

        <button
          onClick={() => onNavigate('financeiro')}
          className="inline-flex items-center gap-2 border border-[#ee4d2d]/30 bg-[#fff5f2] hover:bg-[#ffece6] rounded-full py-1.5 px-5 text-xs font-semibold text-gray-700 transition-all hover:scale-[1.02] active:scale-95 shadow-sm"
        >
          <Wallet size={14} className="text-[#ee4d2d]" />
          <span>
            Saldo Disponível: <strong className="font-extrabold text-[#ee4d2d]">R$ {saldoDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </span>
        </button>
      </div>

      {/* 3 Colunas Inferiores (Matching media_1790658562163.png) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch pt-2">
        {/* Coluna 1: Desempenho Geral (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 mb-4">
              Desempenho Geral
            </h3>

            {/* 2x2 Grid with Cross Dividers */}
            <div className="grid grid-cols-2 border border-gray-100 rounded-2xl overflow-hidden mb-6 bg-white">
              {/* Visitas */}
              <div className="p-4 flex flex-col items-center text-center border-r border-b border-gray-100">
                <Users size={18} className="text-[#ee4d2d] mb-1.5" />
                <span className="text-[11px] font-medium text-gray-400 mb-1">Visitas</span>
                <span className="text-xl font-black text-gray-800">{visitas.toLocaleString('pt-BR')}</span>
              </div>

              {/* Cliques */}
              <div className="p-4 flex flex-col items-center text-center border-b border-gray-100">
                <Eye size={18} className="text-[#ee4d2d] mb-1.5" />
                <span className="text-[11px] font-medium text-gray-400 mb-1">Cliques</span>
                <span className="text-xl font-black text-gray-800">{cliques.toLocaleString('pt-BR')}</span>
              </div>

              {/* Pedidos */}
              <div className="p-4 flex flex-col items-center text-center border-r border-gray-100">
                <ShoppingCart size={18} className="text-[#ee4d2d] mb-1.5" />
                <span className="text-[11px] font-medium text-gray-400 mb-1">Pedidos</span>
                <span className="text-xl font-black text-gray-800">{pedidos}</span>
              </div>

              {/* Unidades */}
              <div className="p-4 flex flex-col items-center text-center">
                <Package size={18} className="text-[#ee4d2d] mb-1.5" />
                <span className="text-[11px] font-medium text-gray-400 mb-1">Unidades</span>
                <span className="text-xl font-black text-gray-800">{unidades}</span>
              </div>
            </div>

            {/* Botão Ir para o Financeiro */}
            <button
              onClick={() => onNavigate('financeiro')}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#ee4d2d] hover:bg-[#d73f20] text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 transition-all active:scale-95"
            >
              <ExternalLink size={14} />
              <span>IR PARA O FINANCEIRO</span>
            </button>

            <p className="text-[11px] text-gray-400 text-center leading-relaxed mt-3 px-1">
              Acesse para cadastrar sua chave PIX e solicitar o saque de suas comissões.
            </p>
          </div>

          <p className="text-[9px] text-gray-400 text-center mt-6">
            Dados atualizados em tempo real com base nas divulgações.
          </p>
        </div>

        {/* Coluna 2: Visão Geral de Vendas (Hoje) - Spline Line Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            {/* Header com Filtros */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-sm font-extrabold text-gray-900">
                Visão Geral de Vendas <span className="font-bold text-gray-600">(Hoje)</span>
              </h3>

              {/* Period Pills */}
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
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                      period === tab.id
                        ? 'border border-[#ee4d2d] text-[#ee4d2d] bg-orange-50 font-bold'
                        : 'border border-gray-200 text-gray-400 hover:text-gray-700'
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
                <span className="w-2.5 h-2.5 rounded-full bg-[#ee4d2d]" />
                <span className="text-gray-700 font-semibold">Hoje</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]" />
                <span className="text-gray-500 font-medium">Ontem</span>
              </div>
            </div>

            {/* SVG Spline Line Chart exactly matching screenshot */}
            <div className="relative w-full h-56 pt-2">
              <svg viewBox="0 0 500 220" className="w-full h-full overflow-visible">
                {/* Horizontal Dashed Grid Lines */}
                {[
                  { y: 20, val: 600 },
                  { y: 56, val: 480 },
                  { y: 92, val: 360 },
                  { y: 128, val: 240 },
                  { y: 164, val: 120 },
                  { y: 200, val: 0 },
                ].map((line, idx) => (
                  <g key={idx}>
                    <text x="0" y={line.y + 4} fill="#9ca3af" fontSize="10" fontWeight="500">
                      {line.val}
                    </text>
                    <line
                      x1="30"
                      y1={line.y}
                      x2="495"
                      y2={line.y}
                      stroke="#f3f4f6"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                  </g>
                ))}

                {/* Smooth Blue Spline Curve */}
                <path
                  d="M 35 198 
                     C 65 198, 90 195, 115 190 
                     C 140 185, 170 160, 200 130 
                     C 225 105, 250 80, 275 80 
                     C 300 80, 315 105, 335 100 
                     C 355 95, 370 45, 400 38 
                     C 425 32, 445 55, 465 100 
                     C 475 125, 485 150, 495 160"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Orange Dot for Today */}
                <circle cx="35" cy="198" r="4.5" fill="#ee4d2d" />
              </svg>

              {/* X Axis Hours */}
              <div className="flex justify-between items-center text-[9px] text-gray-400 font-medium pl-7 pr-1 mt-2">
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
                <span className="font-semibold text-gray-500">Hora</span>
              </div>
            </div>
          </div>

          {/* Shopee Callout Banner */}
          <p className="text-[11px] text-gray-400 leading-snug mt-6 text-center">
            Os vendedores que usam os Anúncios da Shopee estão recebendo 65% mais pedidos em média.{' '}
            <button 
              onClick={() => onNavigate('divulgacao-ia')}
              className="text-[#0284c7] hover:underline font-bold"
            >
              Crie anúncios aqui !
            </button>
          </p>
        </div>

        {/* Coluna 3: Top 5 dos Produtos à Venda (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 mb-5">
              Top 5 dos Produtos à Venda
            </h3>

            <div className="space-y-4">
              {top5.map((item) => (
                <div key={item.rank} className="flex items-center justify-between gap-3 group">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Rank Number in Orange */}
                    <span className="text-xs font-black text-[#ee4d2d] w-3 flex-shrink-0 text-center">
                      {item.rank}
                    </span>

                    {/* Thumbnail Image */}
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                      <SafeImage 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>

                    {/* Title & Units */}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {item.sales}
                      </p>
                    </div>
                  </div>

                  {/* Price in Orange */}
                  <span className="text-xs font-black text-[#ee4d2d] whitespace-nowrap flex-shrink-0">
                    {item.price}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-gray-400 text-center mt-6">
            Baseado em seu histórico de indicações convertidas hoje.
          </p>
        </div>
      </div>
    </div>
  );
}
