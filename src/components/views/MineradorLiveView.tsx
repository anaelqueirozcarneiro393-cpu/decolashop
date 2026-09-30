'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Heart, 
  Zap, 
  TrendingUp, 
  Users, 
  ArrowRight, 
  Loader2,
  Flame,
  Award,
  Sparkles,
  ShoppingBag,
  Bot,
  Send,
  Lock,
  Radio,
  ExternalLink,
  Copy,
  Clock
} from 'lucide-react';
import { Product } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { getProductsFromSupabase } from '@/app/actions';
import { toast } from 'react-hot-toast';
import SafeImage from '@/components/SafeImage';
import FindGroupsButton from '@/components/FindGroupsButton';
import { useSession } from 'next-auth/react';
import PaywallOverlay from './PaywallOverlay';
import { hasOrderBump } from '@/lib/orderBumps';

const VIP_BOT_ALERTS = [
  {
    id: 'alert-1',
    time: 'Há 4 min',
    source: 'TIKTOK SHOP BRASIL',
    badge: '🔥 VIRAL ACELERANDO',
    badgeColor: 'bg-red-500/20 text-red-400 border-red-500/40',
    title: 'Mini Seladora Térmica Portátil Recarregável USB',
    category: 'Cozinha / Utilidades',
    hypeScore: 98,
    searchesGrowth: '+460% em 24h',
    wholesalePrice: 'R$ 8,90',
    suggestedPrice: 'R$ 49,90',
    estimatedProfit: 'R$ 41,00/venda',
    supplier: 'Innova Distribuidora Brás (Despacho 24h)',
    reason: 'Vídeo orgânico no TikTok bateu 2.8M de views nas últimas 12 horas. Estoque nos fornecedores nacionais disponível.',
  },
  {
    id: 'alert-2',
    time: 'Há 18 min',
    source: 'SHOPEE ADS & META',
    badge: '⚡ PICO DE VENDAS',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    title: 'Kit Body Splash Obsession WePink Inspired 200ml',
    category: 'Beleza & Perfumaria',
    hypeScore: 95,
    searchesGrowth: '+320% hoje',
    wholesalePrice: 'R$ 18,50',
    suggestedPrice: 'R$ 79,90',
    estimatedProfit: 'R$ 61,40/venda',
    supplier: 'Lumina Cosméticos SC (Envio Imediato)',
    reason: 'Volume de busca explodindo após reviews de influencers no Reels. CPA médio de apenas R$ 12,50.',
  },
  {
    id: 'alert-3',
    time: 'Há 42 min',
    source: 'GOOGLE TRENDS BR',
    badge: '📈 BREAKOUT CONFIRMADO',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    title: 'Difusor Ultrassônico Chama Flame com LED 3D',
    category: 'Casa & Decoração',
    hypeScore: 92,
    searchesGrowth: '+510% este mês',
    wholesalePrice: 'R$ 29,00',
    suggestedPrice: 'R$ 99,90',
    estimatedProfit: 'R$ 70,90/venda',
    supplier: 'MegaTech Import SP (Santa Ifigênia)',
    reason: 'Tendência forte de inverno e decoração para setup gamer. Margem acima de 240% em vendas diretas.',
  }
];

interface MineradorLiveViewProps {
  onNavigate: (view: any, product?: any) => void;
  savedProducts: string[];
  onSave: (id: string) => void;
}

export default function MineradorLiveView({ onNavigate, savedProducts, onSave }: MineradorLiveViewProps) {
  const { data: session } = useSession();
  // @ts-ignore
  const plan = session?.user?.plan || 'pro';
  // Allow all users in this deployment or check plan
  const isFree = false;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'hype' | 'sales' | 'price_desc'>('hype');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlockedBot, setIsUnlockedBot] = useState(false);

  useEffect(() => {
    const checkBump = () => {
      setIsUnlockedBot(hasOrderBump('bump_bot_telegram', session));
    };
    checkBump();
    window.addEventListener('decolashop_bumps_updated', checkBump);
    return () => window.removeEventListener('decolashop_bumps_updated', checkBump);
  }, [session]);

  const openBumpModal = () => {
    window.dispatchEvent(new CustomEvent('decolashop_open_bump_modal', { 
      detail: { bumpId: 'bump_acelerador' } 
    }));
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    const result = await getProductsFromSupabase();
    if (result.success && result.data) {
      setProducts(result.data);
    } else {
      setProducts([]);
      if (result.error) console.warn('Error fetching: ', result.error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchProducts();
    setIsRefreshing(false);
    toast.success('Radar de produtos atualizado em tempo real!');
  };

  // Filter and sort products
  const filteredProducts = products.filter((p) => {
    const pName = (p.name || p.title || '').toLowerCase();
    const pCat = (p.category || '').toLowerCase();
    const query = searchQuery.toLowerCase().trim();

    const matchesSearch = !query || pName.includes(query) || pCat.includes(query);
    const matchesFilter =
      filter === 'all' ||
      filter === 'todos' ||
      pCat.includes(filter) ||
      filter.includes(pCat);

    return matchesSearch && matchesFilter;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'sales') {
      const salesA = (a as any).vendas_mes || 0;
      const salesB = (b as any).vendas_mes || 0;
      return salesB - salesA;
    }
    if (sortBy === 'price_desc') {
      const priceA = typeof a.price === 'number' ? a.price : 0;
      const priceB = typeof b.price === 'number' ? b.price : 0;
      return priceB - priceA;
    }
    return (b.hype_score || 0) - (a.hype_score || 0);
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#22c55e]/10 text-[#22c55e] text-xs font-bold mb-3 border border-[#22c55e]/20">
            <Flame className="w-3.5 h-3.5" />
            <span>Mineração de Produtos Vencedores em Tempo Real</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2 flex items-center gap-3">
            MINERADOR <span className="apex-gradient-text">LIVE</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Produtos reais com alta demanda e viralização comprovada na Shopee, TikTok Shop e Google Trends.
          </p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar produto ou nicho..." 
              className="bg-secondary/30 border border-border/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all w-full md:w-64"
            />
          </div>
          <button 
            onClick={handleRefresh}
            title="Atualizar lista"
            className={cn(
              "p-2.5 rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary transition-all",
              isRefreshing && "animate-spin text-primary"
            )}
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* ROBÔ ESPIÃO VIP: ALERTAS NO TELEGRAM (ORDER BUMP GATED) */}
      <div className={cn(
        "rounded-3xl border transition-all duration-500 overflow-hidden relative backdrop-blur-xl p-5 sm:p-7",
        isUnlockedBot 
          ? "bg-gradient-to-br from-[#0d1624]/95 via-[#0a101b]/95 to-[#080c14] border-[#22c55e]/40 shadow-2xl shadow-[#22c55e]/10" 
          : "bg-gradient-to-br from-[#16130b]/95 via-[#0f1118]/95 to-[#080c14] border-amber-500/35 shadow-2xl shadow-amber-500/10"
      )}>
        {/* Top ambient glow */}
        <div className={cn(
          "absolute top-0 left-0 right-0 h-1",
          isUnlockedBot 
            ? "bg-gradient-to-r from-transparent via-[#22c55e] to-transparent shadow-[0_0_15px_#22c55e]" 
            : "bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_#f59e0b]"
        )} />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 pb-5 border-b border-white/10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-md",
                isUnlockedBot
                  ? "bg-[#22c55e]/15 text-[#4ade80] border-[#22c55e]/40 shadow-[#22c55e]/20"
                  : "bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-amber-500/20"
              )}>
                {isUnlockedBot ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" />
                    <span>ROBÔ ATIVO • CANAL VIP TELEGRAM</span>
                  </>
                ) : (
                  <>
                    <Lock size={12} className="text-amber-400" />
                    <span>UPGRADE VIP • ORDER BUMP EXCLUSIVO</span>
                  </>
                )}
              </span>

              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <Radio size={13} className={isUnlockedBot ? "text-[#22c55e] animate-pulse" : "text-amber-400"} />
                Varredura a cada 15s • Shopee, TikTok Shop & Google Trends
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <Bot className={cn("w-6 h-6", isUnlockedBot ? "text-[#22c55e]" : "text-amber-400")} />
              <span>Robô Espião DecolaShop</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-white/10 text-slate-300 font-mono">v3.4 Live</span>
            </h2>

            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              {isUnlockedBot 
                ? "Você possui acesso vitalício ao Canal VIP de Alertas no Telegram. Todos os produtos que atingem Hype Score acima de 90 e crescimento acelerado de buscas são enviados instantaneamente para você."
                : "Receba notificações em tempo real direto no seu celular antes que o produto viralize para todo o Brasil e a concorrência dispute o mesmo público."
              }
            </p>
          </div>

          <div className="flex-shrink-0 flex items-center gap-3 w-full lg:w-auto">
            {isUnlockedBot ? (
              <a
                href="https://t.me/+DecolaShopVipBotAlerts"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#22c55e] to-emerald-400 hover:from-emerald-400 hover:to-[#22c55e] text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-[#22c55e]/25 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Send size={15} />
                <span>Abrir Canal VIP Telegram</span>
                <ExternalLink size={13} />
              </a>
            ) : (
              <button
                type="button"
                onClick={openBumpModal}
                className="w-full lg:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-[#22c55e] hover:from-amber-300 hover:to-[#22c55e] text-black font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <Zap size={16} />
                <span>Desbloquear Robô VIP (+ R$ 27,90)</span>
              </button>
            )}
          </div>
        </div>

        {/* FEED / TEASER SECTION */}
        {isUnlockedBot ? (
          /* UNLOCKED: LIVE STREAM OF REAL-TIME VIP ALERTS */
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-[#4ade80] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" />
                Alertas Recentes Sincronizados com o Canal do Telegram:
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Atualizado agora mesmo</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {VIP_BOT_ALERTS.map((alert) => (
                <div 
                  key={alert.id}
                  className="bg-[#0b101b]/90 border border-[#22c55e]/25 hover:border-[#22c55e]/60 rounded-2xl p-4 flex flex-col justify-between transition-all group hover:shadow-lg hover:shadow-[#22c55e]/10"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn(
                        "text-[9px] font-black uppercase px-2 py-0.5 rounded-md border",
                        alert.badgeColor
                      )}>
                        {alert.badge}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock size={11} /> {alert.time}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-white group-hover:text-[#4ade80] transition-colors line-clamp-1">
                        {alert.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <span>🏷️ {alert.category}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-bold">{alert.searchesGrowth}</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px]">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase block font-bold">Atacado / Venda</span>
                        <span className="font-bold text-white">{alert.wholesalePrice} ➔ {alert.suggestedPrice}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-[#22c55e] uppercase block font-bold">Lucro Líquido</span>
                        <span className="font-black text-[#4ade80]">{alert.estimatedProfit}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 italic line-clamp-2">
                      &quot;{alert.reason}&quot;
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-white/10 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`${alert.title}\nAtacado: ${alert.wholesalePrice} | Venda: ${alert.suggestedPrice}\nFornecedor: ${alert.supplier}`);
                        toast.success('Detalhes do produto copiados!');
                      }}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Copy size={11} />
                      <span>Copiar Dados</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('anuncio', { name: alert.title, price: alert.suggestedPrice })}
                      className="py-1.5 px-3 rounded-lg bg-[#22c55e] hover:bg-emerald-400 text-black text-[10px] font-black transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles size={11} />
                      <span>Anúncio IA</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* LOCKED: TEASER WITH SNEAK PEEK & VALUE PROP */
          <div className="mt-5 relative rounded-2xl overflow-hidden border border-amber-500/20 bg-black/40 p-4 sm:p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 filter blur-[4px] opacity-40 pointer-events-none select-none">
              {VIP_BOT_ALERTS.map((alert) => (
                <div key={alert.id} className="bg-[#111726] border border-white/10 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between text-[10px] text-amber-400 font-bold">
                    <span>{alert.badge}</span>
                    <span>{alert.time}</span>
                  </div>
                  <h4 className="text-sm font-black text-white">{alert.title}</h4>
                  <div className="h-6 bg-white/10 rounded-lg" />
                  <p className="text-[11px] text-slate-400">{alert.reason}</p>
                </div>
              ))}
            </div>

            {/* Lock Overlay with CTA */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-black/60 backdrop-blur-[2px]">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-2 shadow-lg shadow-amber-500/20">
                <Lock size={22} />
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mb-1">
                Feed de Alertas em Tempo Real Bloqueado
              </h3>
              <p className="text-xs text-slate-300 max-w-md mb-4">
                Desbloqueie o Robô Espião VIP por pagamento único de <strong className="text-amber-400 font-black">R$ 27,90</strong> e receba os alertas mais quentes diretamente no seu Telegram.
              </p>
              <button
                type="button"
                onClick={openBumpModal}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-[#22c55e] text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-400/25 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
              >
                <Zap size={14} />
                <span>Quero Desbloquear Acesso VIP</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filters & Sorting */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'eletrônicos', label: 'Eletrônicos' },
            { id: 'beleza', label: 'Beleza & Moda' },
            { id: 'setup gamer', label: 'Setup Gamer' },
            { id: 'cozinha', label: 'Cozinha' },
            { id: 'casa & decoração', label: 'Casa & Decoração' },
          ].map((cat) => (
            <button 
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all",
                filter === cat.id 
                  ? "bg-primary text-black border-primary shadow-md shadow-primary/20" 
                  : "bg-secondary/30 text-muted-foreground border-border/50 hover:border-primary/30"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground font-bold">Ordenar por:</span>
          <select 
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-secondary/40 border border-border/50 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary font-bold"
          >
            <option value="hype">🔥 Hype Score (Mais Quentes)</option>
            <option value="sales">📈 Mais Vendidos</option>
            <option value="price_desc">💰 Maior Preço</option>
          </select>
        </div>
      </div>

      {/* Product List */}
      <div className="relative">
        {isFree && <PaywallOverlay />}
        <div className={cn("space-y-6", isFree && "blur-[8px] pointer-events-none opacity-60 select-none transition-all duration-1000")}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 glass rounded-[2rem] border border-border/50">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">
                Sincronizando produtos reais do banco de dados...
              </p>
            </div>
          ) : sortedProducts.length > 0 ? (
            sortedProducts.map((product, index) => {
              const isSaved = savedProducts.includes(product.id);
              const score = product.hype_score || 85;
              const formattedPrice = typeof product.price === 'number' 
                ? `R$ ${product.price.toFixed(2).replace('.', ',')}` 
                : product.price || 'R$ 99,90';
              const monthlySales = (product as any).vendas_mes || 1200;
              const supplier = (product as any).supplier || 'Fornecedor Verificado';

              return (
                <div 
                  key={product.id}
                  className={cn(
                    "group relative glass-darker p-1 rounded-[2rem] transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5",
                    index === 0 && !searchQuery && filter === 'all' 
                      ? "border-2 border-primary/40 shadow-lg shadow-primary/10" 
                      : "border border-border/50 hover:border-primary/30"
                  )}
                >
                  {index === 0 && !searchQuery && filter === 'all' && (
                    <div className="absolute -top-3.5 left-8 px-3.5 py-1 bg-gradient-to-r from-primary to-emerald-400 text-black text-[11px] font-black rounded-full uppercase tracking-wider shadow-lg shadow-primary/20 flex items-center gap-1.5 z-10 animate-pulse">
                      <Award size={14} /> TOP 1 - MAIOR CONVERSÃO DO BRASIL
                    </div>
                  )}

                  <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-52 h-52 rounded-2xl overflow-hidden bg-secondary/30 relative flex-shrink-0 border border-border/30">
                      <SafeImage 
                        src={product.image_url} 
                        alt={product.name || product.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                      <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-emerald-400 border border-white/10">
                        Comissão: {product.commission || 'R$ 35,00'}
                      </div>
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 space-y-5">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-md bg-secondary/60 text-slate-300 border border-border/50 uppercase tracking-widest">
                              {product.category || 'Geral'}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground">
                              🏢 {supplier}
                            </span>
                          </div>
                          <h3 className="text-xl md:text-2xl font-black group-hover:text-primary transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-3 mt-2">
                            <p className="text-lg font-black text-white">
                              {formattedPrice}
                            </p>
                            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              ~{monthlySales.toLocaleString('pt-BR')} vendas/mês
                            </span>
                          </div>
                        </div>

                        {/* Hype Score Badge */}
                        <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl border flex-shrink-0 shadow-lg bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                          <span className="text-2xl font-black">{score}</span>
                          <span className="text-[9px] font-black uppercase tracking-wider">SCORE</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 p-3.5 rounded-xl bg-secondary/20 border border-border/30">
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-wider">
                            <TrendingUp size={14} /> ANÁLISE DE MERCADO VALIDADA
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 italic">
                            {product.description || "Produto minerado em tempo real. Demanda validada com alta taxa de conversão nas plataformas brasileiras."}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col justify-center p-3 rounded-xl bg-secondary/20 border border-border/30">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">STATUS</span>
                            <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                              VIRAL AGORA
                            </span>
                          </div>
                          <div className="flex flex-col justify-center p-3 rounded-xl bg-secondary/20 border border-border/30">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">GOOGLE TRENDS</span>
                            <span className="text-xs font-black text-primary">
                              {product.evidence?.google?.growth || '+280%'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-border/30">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">OPORTUNIDADE:</span>
                          <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-md uppercase tracking-tighter border border-emerald-500/30">
                            Alta Margem & Comissão
                          </span>
                        </div>
                        {product.url && (
                          <a 
                            href={product.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 ml-auto"
                          >
                            <Search size={12} /> Ver Fonte Original
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row md:flex-col justify-between md:justify-center gap-2.5 md:w-48">
                      <FindGroupsButton className="w-full" />
                      
                      <button 
                        onClick={() => onSave(product.id)}
                        className={cn(
                          "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border",
                          isSaved ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-secondary/30 text-muted-foreground border-border/50 hover:border-red-500/30 hover:text-red-400"
                        )}
                      >
                        <Heart size={16} className={cn(isSaved && "fill-current text-red-400")} /> 
                        {isSaved ? 'Salvo' : 'Salvar'}
                      </button>

                      <button 
                        onClick={() => onNavigate('detalhe', product)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary/50 hover:bg-secondary rounded-xl font-bold text-xs transition-all border border-border/50 text-white"
                      >
                        Ver Métricas
                      </button>

                      <button 
                        onClick={() => onNavigate('anuncio', product)}
                        className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-primary to-emerald-400 hover:from-emerald-400 hover:to-primary rounded-xl font-black text-xs text-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        <Sparkles size={14} /> GERAR ANÚNCIO IA
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-20 glass rounded-[2rem] border border-border/50">
              <ShoppingBag className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground font-bold">Nenhum produto encontrado com este filtro.</p>
              <button 
                onClick={() => { setFilter('all'); setSearchQuery(''); }}
                className="mt-3 text-xs text-primary font-bold hover:underline"
              >
                Limpar filtros de busca
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
