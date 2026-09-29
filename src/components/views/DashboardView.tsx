'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Eye, 
  ShoppingCart, 
  Package, 
  ExternalLink, 
  Wallet
} from 'lucide-react';
import SafeImage from '@/components/SafeImage';

interface DashboardViewProps {
  onNavigate: (view: any, product?: any) => void;
  savedCount?: number;
}

export default function DashboardView({ onNavigate }: DashboardViewProps) {
  const [period, setPeriod] = useState<'hoje' | '7d' | '30d' | 'tudo'>('hoje');

  const top5 = [
    {
      rank: 1,
      name: 'Mochila Notebook Impermeável',
      sales: '16 unidades vendidas',
      price: 'R$ 119,90',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=200',
    },
    {
      rank: 2,
      name: 'Kit Até 20 Painel Ripado Autocolante...',
      sales: '13 unidades vendidas',
      price: 'R$ 139,86',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=200',
    },
    {
      rank: 3,
      name: 'Smartwatch Serie 8 Ultra',
      sales: '12 unidades vendidas',
      price: 'R$ 149,90',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200',
    },
    {
      rank: 4,
      name: 'Kit Álbum Copa do Mundo 2026 + 3 ...',
      sales: '10 unidades vendidas',
      price: 'R$ 167,70',
      image: 'https://res.cloudinary.com/dwtefghdi/image/upload/v1780320783/bandeira_brasil_2026_yhdamv.jpg',
    },
    {
      rank: 5,
      name: 'Chinelo Slide Nuvem Confort',
      sales: '5 unidades vendidas',
      price: 'R$ 119,96',
      image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=200',
    },
  ];

  return (
    <div className="-mt-4 md:-mt-8 -mx-4 md:-mx-8 bg-[#f5f6fa] min-h-screen text-slate-800 pb-16 font-sans">
      {/* Top Orange Header Banner */}
      <div className="bg-[#ee4d2d] w-full pt-6 pb-28 px-4 md:px-8 relative overflow-hidden">
        {/* Subtle Shopee background curve accent */}
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 space-y-6">
        {/* Card Vendas Totais (Topo) */}
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">
            VENDAS TOTAIS
          </span>

          <div className="flex items-start justify-center mb-2">
            <span className="text-xl md:text-2xl font-black text-[#ee4d2d] mr-1.5 mt-1 md:mt-2">
              R$
            </span>
            <span className="text-5xl md:text-6xl font-black text-[#ee4d2d] tracking-tight">
              2.290,35
            </span>
          </div>

          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-5">
            VALOR ACUMULADO DE TODAS AS VENDAS COM DIVULGAÇÃO
          </p>

          <button
            onClick={() => onNavigate('financeiro')}
            className="inline-flex items-center gap-2 border border-orange-200/90 bg-white hover:bg-orange-50/50 rounded-full py-2 px-5 text-xs font-bold text-[#ee4d2d] transition-all shadow-sm active:scale-95"
          >
            <Wallet size={14} className="text-[#ee4d2d]" />
            <span>Saldo Disponível: <strong className="font-black text-[#ee4d2d]">R$ 2.290,35</strong></span>
          </button>
        </div>

        {/* 3 Colunas Inferiores */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Coluna 1: Desempenho Geral */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-5">
                Desempenho Geral
              </h3>

              {/* 2x2 Grid with Cross Dividers */}
              <div className="grid grid-cols-2 border border-gray-100 rounded-2xl overflow-hidden mb-6">
                {/* Visitas */}
                <div className="p-4 flex flex-col items-center text-center border-r border-b border-gray-100">
                  <Users size={18} className="text-[#ee4d2d] mb-1.5" />
                  <span className="text-[11px] text-gray-400 mb-1">Visitas</span>
                  <span className="text-lg font-black text-gray-900">791</span>
                </div>

                {/* Cliques */}
                <div className="p-4 flex flex-col items-center text-center border-b border-gray-100">
                  <Eye size={18} className="text-[#ee4d2d] mb-1.5" />
                  <span className="text-[11px] text-gray-400 mb-1">Cliques</span>
                  <span className="text-lg font-black text-gray-900">2.159</span>
                </div>

                {/* Pedidos */}
                <div className="p-4 flex flex-col items-center text-center border-r border-gray-100">
                  <ShoppingCart size={18} className="text-[#ee4d2d] mb-1.5" />
                  <span className="text-[11px] text-gray-400 mb-1">Pedidos</span>
                  <span className="text-lg font-black text-gray-900">56</span>
                </div>

                {/* Unidades */}
                <div className="p-4 flex flex-col items-center text-center">
                  <Package size={18} className="text-[#ee4d2d] mb-1.5" />
                  <span className="text-[11px] text-gray-400 mb-1">Unidades</span>
                  <span className="text-lg font-black text-gray-900">56</span>
                </div>
              </div>

              {/* Botão Ir para o Financeiro */}
              <button
                onClick={() => onNavigate('financeiro')}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#ee4d2d] hover:bg-[#d94121] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 transition-all active:scale-95"
              >
                <ExternalLink size={14} />
                <span>IR PARA O FINANCEIRO</span>
              </button>

              <p className="text-[10px] text-gray-400 text-center leading-relaxed mt-3 px-1">
                Acesse para cadastrar sua chave PIX e solicitar o saque de suas comissões.
              </p>
            </div>

            <p className="text-[9px] text-gray-400 text-center mt-6">
              Dados atualizados em tempo real com base nas divulgações.
            </p>
          </div>

          {/* Coluna 2: Visão Geral de Vendas (Hoje) - Gráfico */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              {/* Header com Filtros */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h3 className="text-sm font-bold text-gray-900">
                  Visão Geral de Vendas (Hoje)
                </h3>

                {/* Period Pills */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPeriod('hoje')}
                    className={`px-3 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                      period === 'hoje'
                        ? 'border border-[#ee4d2d] text-[#ee4d2d] bg-orange-50/40'
                        : 'border border-gray-200 text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Hoje
                  </button>
                  <button
                    onClick={() => setPeriod('7d')}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                      period === '7d'
                        ? 'border border-[#ee4d2d] text-[#ee4d2d] bg-orange-50/40'
                        : 'border border-gray-200 text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    7 Dias
                  </button>
                  <button
                    onClick={() => setPeriod('30d')}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                      period === '30d'
                        ? 'border border-[#ee4d2d] text-[#ee4d2d] bg-orange-50/40'
                        : 'border border-gray-200 text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    30 Dias
                  </button>
                  <button
                    onClick={() => setPeriod('tudo')}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                      period === 'tudo'
                        ? 'border border-[#ee4d2d] text-[#ee4d2d] bg-orange-50/40'
                        : 'border border-gray-200 text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Tempo Todo
                  </button>
                </div>
              </div>

              {/* Legenda Hoje vs Ontem */}
              <div className="flex items-center gap-4 text-[11px] mb-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ee4d2d]" />
                  <span className="text-gray-500 font-semibold">Hoje</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2563eb]" />
                  <span className="text-gray-500 font-semibold">Ontem</span>
                </div>
              </div>

              {/* SVG Spline Line Chart matching appnewshop */}
              <div className="relative w-full h-56 pt-2">
                <svg viewBox="0 0 500 220" className="w-full h-full overflow-visible">
                  {/* Grid Lines Horizontais Dotted */}
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
                        stroke="#e5e7eb"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                    </g>
                  ))}

                  {/* Curva Azul Suave de Vendas (Ontem/Trend) */}
                  <path
                    d="M 35 198 
                       C 60 198, 90 200, 115 195 
                       C 140 190, 160 170, 190 145 
                       C 215 125, 235 90, 260 90 
                       C 285 90, 295 120, 315 110 
                       C 335 100, 350 45, 380 40 
                       C 405 35, 415 55, 435 95 
                       C 450 125, 465 160, 480 180"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Linha Vermelha / Ponto Vermelho (Hoje) */}
                  <line
                    x1="35"
                    y1="198"
                    x2="65"
                    y2="200"
                    stroke="#ee4d2d"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="35" cy="198" r="3.5" fill="#ee4d2d" />
                </svg>

                {/* Eixo X - Horas */}
                <div className="flex justify-between items-center text-[9px] text-gray-400 font-semibold pl-7 pr-1 mt-2">
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
                  <span className="font-bold text-gray-500">Hora</span>
                </div>
              </div>
            </div>

            {/* Shopee Callout Banner */}
            <p className="text-[10px] text-gray-500 leading-snug mt-6 text-center">
              Os vendedores que usam os Anúncios da Shopee estão recebendo 65% mais pedidos em média.{' '}
              <button 
                onClick={() => onNavigate('divulgacao-ia')}
                className="text-[#2563eb] hover:underline font-bold"
              >
                Crie anúncios aqui !
              </button>
            </p>
          </div>

          {/* Coluna 3: Top 5 dos Produtos à Venda */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-5">
                Top 5 dos Produtos à Venda
              </h3>

              <div className="space-y-4">
                {top5.map((item) => (
                  <div key={item.rank} className="flex items-center justify-between gap-3 group">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Rank Number */}
                      <span className="text-xs font-black text-[#ee4d2d] w-3 flex-shrink-0 text-center">
                        {item.rank}
                      </span>

                      {/* Thumbnail Image */}
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-200/60 flex-shrink-0">
                        <SafeImage 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>

                      {/* Title & Units */}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate group-hover:text-[#ee4d2d] transition-colors">
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

            <p className="text-[9px] text-gray-400 text-center mt-6">
              Baseado em seu histórico de indicações convertidas hoje.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
