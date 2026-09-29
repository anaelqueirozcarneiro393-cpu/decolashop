'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ArrowRight, 
  ExternalLink, 
  ShoppingBag, 
  Eye, 
  MousePointer, 
  Package, 
  CheckCircle2, 
  Sparkles, 
  Wallet, 
  Share2, 
  Clock, 
  ChevronRight, 
  AlertCircle,
  HelpCircle,
  BarChart3,
  Flame,
  Zap
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import SafeImage from '@/components/SafeImage';

interface DashboardViewProps {
  onNavigate: (view: any, product?: any) => void;
  savedCount?: number;
}

export default function DashboardView({ onNavigate }: DashboardViewProps) {
  const { data: session } = useSession();
  const [period, setPeriod] = useState<'hoje' | '7d' | '30d' | 'tudo'>('hoje');
  const [currentTime, setCurrentTime] = useState('29/09/2026 02:01:50 (GMT-03)');

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const formatted = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR') + ' (GMT-03)';
      setCurrentTime(formatted);
    };
    updateDate();
    const interval = setInterval(updateDate, 1000);
    return () => clearInterval(interval);
  }, []);

  // Top 5 dos Produtos à Venda (conforme site oficial appnewshop)
  const top5Products = [
    {
      rank: 1,
      name: 'Mochila Notebook Impermeável',
      sales: '16 unidades vendidas',
      price: 'R$ 119,90',
      commission: 'R$ 38,36',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=400',
      category: 'Acessórios & Tech',
      growth: '+42% hoje',
    },
    {
      rank: 2,
      name: 'Kit Até 20 Painel Ripado Autocolante Decoração Adesivo...',
      sales: '13 unidades vendidas',
      price: 'R$ 139,86',
      commission: 'R$ 44,75',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=400',
      category: 'Casa & Decoração',
      growth: '+35% hoje',
    },
    {
      rank: 3,
      name: 'Smartwatch Serie 8 Ultra',
      sales: '12 unidades vendidas',
      price: 'R$ 149,90',
      commission: 'R$ 47,96',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400',
      category: 'Smart Gadgets',
      growth: '+28% hoje',
    },
    {
      rank: 4,
      name: 'Kit Álbum Copa do Mundo 2026 + 3 Envelopes',
      sales: '10 unidades vendidas',
      price: 'R$ 167,70',
      commission: 'R$ 53,66',
      image: 'https://res.cloudinary.com/dwtefghdi/image/upload/v1780320783/bandeira_brasil_2026_yhdamv.jpg',
      category: 'Colecionáveis & Trend',
      growth: '+88% hoje',
    },
    {
      rank: 5,
      name: 'Chinelo Slide Nuvem Confort',
      sales: '5 unidades vendidas',
      price: 'R$ 119,96',
      commission: 'R$ 38,38',
      image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=400',
      category: 'Moda & Conforto',
      growth: '+15% hoje',
    },
  ];

  // Horários do gráfico do appnewshop
  const chartHours = [
    { hour: '00', valHoje: 45, valOntem: 20 },
    { hour: '02', valHoje: 12, valOntem: 15 },
    { hour: '04', valHoje: 8, valOntem: 5 },
    { hour: '06', valHoje: 30, valOntem: 18 },
    { hour: '08', valHoje: 120, valOntem: 80 },
    { hour: '10', valHoje: 240, valOntem: 190 },
    { hour: '12', valHoje: 380, valOntem: 310 },
    { hour: '14', valHoje: 520, valOntem: 410 },
    { hour: '16', valHoje: 480, valOntem: 430 },
    { hour: '18', valHoje: 590, valOntem: 490 },
    { hour: '20', valHoje: 510, valOntem: 440 },
    { hour: '22', valHoje: 290, valOntem: 260 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Banner / Status Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-3xl bg-secondary/30 border border-border/50">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-primary">Estoque Sincronizado</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-slate-300">
            <span className="text-orange-400 font-black">Shopee</span>
            <span>• Vendas Totais</span>
          </div>

          <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
            {currentTime}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('conectar')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/80 hover:bg-secondary border border-border/70 text-xs font-bold text-slate-200 transition-all active:scale-95"
          >
            <Share2 size={14} className="text-primary" />
            <span>Conectar canais</span>
          </button>

          <button
            onClick={() => onNavigate('financeiro')}
            className="flex items-center gap-1.5 text-xs font-black text-primary hover:underline transition-all"
          >
            <span>Ver Métricas Detalhadas</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Main Financial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vendas Totais */}
        <div className="p-7 rounded-3xl bg-gradient-to-br from-secondary/40 via-dark-bg to-dark-bg border border-border/50 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
          
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <ShoppingBag size={16} className="text-primary" />
              Vendas Totais
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Hoje +18.4%
            </span>
          </div>

          <div className="mb-2">
            <span className="text-4xl md:text-5xl font-black text-white tracking-tight">
              R$ 2.290,35
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            Valor Acumulado de Todas as Vendas com Divulgação
          </p>
        </div>

        {/* Saldo Disponível */}
        <div className="p-7 rounded-3xl bg-gradient-to-br from-emerald-950/20 via-dark-bg to-dark-bg border border-emerald-500/20 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Wallet size={16} />
              Saldo Disponível para Saque
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
              PIX Instantâneo
            </span>
          </div>

          <div className="mb-2">
            <span className="text-4xl md:text-5xl font-black text-emerald-400 tracking-tight">
              R$ 2.290,35
            </span>
          </div>

          <button 
            onClick={() => onNavigate('financeiro')}
            className="inline-flex items-center gap-2 text-xs font-black text-primary hover:text-white transition-colors group mt-1"
          >
            <span>Ir para o Financeiro</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary flex-shrink-0">
            <Sparkles size={16} />
          </div>
          <div>
            <p className="text-slate-200 font-semibold">
              <strong className="text-primary font-black">Acesse o Financeiro</strong> para cadastrar sua chave PIX e solicitar o saque de suas comissões.
            </p>
            <p className="text-muted-foreground text-[11px] mt-0.5">
              Dados atualizados em tempo real com base nas divulgações.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('financeiro')}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-primary text-black font-black text-xs hover:bg-primary/90 transition-all flex-shrink-0 shadow-lg shadow-primary/20"
        >
          Sacar Comissões
        </button>
      </div>

      {/* Desempenho Geral - 4 KPIs */}
      <div>
        <h2 className="text-lg font-black uppercase tracking-wider mb-4 flex items-center gap-2 text-white">
          <BarChart3 size={20} className="text-primary" /> Desempenho Geral
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl glass border border-border/50">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Visitas</span>
              <Eye size={16} className="text-primary" />
            </div>
            <p className="text-3xl font-black text-white">791</p>
            <p className="text-[10px] text-muted-foreground mt-1">Tráfego orgânico & direto</p>
          </div>

          <div className="p-5 rounded-2xl glass border border-border/50">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Cliques</span>
              <MousePointer size={16} className="text-orange-400" />
            </div>
            <p className="text-3xl font-black text-white">2.159</p>
            <p className="text-[10px] text-muted-foreground mt-1">Cliques nos links divulgados</p>
          </div>

          <div className="p-5 rounded-2xl glass border border-border/50">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Pedidos</span>
              <ShoppingBag size={16} className="text-emerald-400" />
            </div>
            <p className="text-3xl font-black text-emerald-400">56</p>
            <p className="text-[10px] text-muted-foreground mt-1">Conversões aprovadas</p>
          </div>

          <div className="p-5 rounded-2xl glass border border-border/50">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Unidades</span>
              <Package size={16} className="text-cyan-400" />
            </div>
            <p className="text-3xl font-black text-white">56</p>
            <p className="text-[10px] text-muted-foreground mt-1">Itens entregues com comissão</p>
          </div>
        </div>
      </div>

      {/* Visão Geral de Vendas (Gráfico Interativo) */}
      <div className="glass rounded-3xl p-6 md:p-8 border border-border/50 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              Visão Geral de Vendas <span className="text-primary font-normal text-sm">({period === 'hoje' ? 'Hoje' : period.toUpperCase()})</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Comparativo de faturamento horário gerado pelas suas divulgações com IA
            </p>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 self-start sm:self-auto">
            {[
              { id: 'hoje', label: 'Hoje' },
              { id: '7d', label: '7 Dias' },
              { id: '30d', label: '30 Dias' },
              { id: 'tudo', label: 'Tempo Todo' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPeriod(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  period === tab.id
                    ? 'bg-primary text-black shadow-md font-black'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-primary" />
            <span className="font-bold text-white">Hoje</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-slate-600" />
            <span className="font-bold text-muted-foreground">Ontem</span>
          </div>
        </div>

        {/* CSS Bar Chart Simulation matching appnewshop 0 - 600 scale */}
        <div className="pt-4">
          <div className="h-48 flex items-end justify-between gap-2 border-b border-white/10 pb-2">
            {chartHours.map((item, idx) => {
              const maxVal = 600;
              const heightHoje = Math.min(100, Math.round((item.valHoje / maxVal) * 100));
              const heightOntem = Math.min(100, Math.round((item.valOntem / maxVal) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-10 bg-slate-900 border border-slate-700 text-[10px] font-bold py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-xl">
                    <p className="text-primary font-black">R$ {item.valHoje}</p>
                    <p className="text-slate-400">Ontem: R$ {item.valOntem}</p>
                  </div>

                  <div className="w-full flex items-end justify-center gap-1 h-full">
                    {/* Ontem Bar */}
                    <div 
                      className="w-1.5 sm:w-2 bg-slate-700/60 rounded-t-md transition-all duration-500" 
                      style={{ height: `${heightOntem}%` }} 
                    />
                    {/* Hoje Bar */}
                    <div 
                      className="w-2.5 sm:w-3.5 bg-gradient-to-t from-primary/60 to-primary rounded-t-md group-hover:brightness-125 transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                      style={{ height: `${heightHoje}%` }} 
                    />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground mt-2">{item.hour}h</span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-[10px] text-muted-foreground mt-2 font-bold uppercase">
            <span>Hora: 00h</span>
            <span>Escala: R$ 0 → R$ 600+</span>
            <span>Hora: 22h</span>
          </div>
        </div>

        {/* Shopee Tip Banner */}
        <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p className="text-orange-200">
            🔥 <strong>Dica Shopee:</strong> Os vendedores que usam os Anúncios da Shopee estão recebendo <strong>65% mais pedidos</strong> em média.
          </p>
          <button 
            onClick={() => onNavigate('divulgacao-ia')}
            className="text-xs font-black text-orange-400 hover:text-white underline whitespace-nowrap"
          >
            Crie anúncios aqui !
          </button>
        </div>
      </div>

      {/* Top 5 dos Produtos à Venda */}
      <div className="glass rounded-3xl p-6 md:p-8 border border-border/50 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Flame className="text-orange-400" size={24} /> Top 5 dos Produtos à Venda
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Baseado em seu histórico de indicações convertidas hoje.
            </p>
          </div>

          <button
            onClick={() => onNavigate('catalogo')}
            className="flex items-center gap-2 text-xs font-black text-primary hover:underline"
          >
            <span>Ver Catálogo Completo</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="space-y-4">
          {top5Products.map((prod) => (
            <div 
              key={prod.rank}
              className="p-4 rounded-2xl bg-secondary/20 hover:bg-secondary/40 border border-border/40 hover:border-primary/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-4">
                {/* Rank Badge */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${
                  prod.rank === 1 ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/30' :
                  prod.rank === 2 ? 'bg-slate-300 text-black' :
                  prod.rank === 3 ? 'bg-amber-700 text-white' : 'bg-white/10 text-white'
                }`}>
                  {prod.rank}
                </div>

                {/* Product Image */}
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-secondary/50 border border-border/30 flex-shrink-0">
                  <SafeImage 
                    src={prod.image} 
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Details */}
                <div>
                  <h4 className="font-bold text-sm text-white group-hover:text-primary transition-colors line-clamp-1">
                    {prod.name}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className="text-emerald-400 font-bold">{prod.sales}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-slate-300 font-extrabold">{prod.price}</span>
                    <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-md hidden md:inline">
                      Comissão: {prod.commission}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
                <button
                  onClick={() => onNavigate('divulgacao-ia', { title: prod.name, name: prod.name, price: prod.price, image_url: prod.image, category: prod.category })}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-primary text-black font-extrabold text-xs hover:bg-primary/90 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-1.5"
                >
                  <Sparkles size={14} />
                  <span>Divulgar com IA</span>
                </button>

                <button
                  onClick={() => onNavigate('video-ia', { title: prod.name, name: prod.name, price: prod.price, image_url: prod.image })}
                  className="px-3 py-2 rounded-xl bg-secondary/60 hover:bg-secondary border border-border/50 text-slate-300 text-xs font-bold transition-all"
                  title="Gerar Vídeo Viral com IA"
                >
                  Vídeo IA
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
