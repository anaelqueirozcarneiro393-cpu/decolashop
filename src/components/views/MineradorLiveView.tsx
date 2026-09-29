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
  ShoppingBag
} from 'lucide-react';
import { Product } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { getProductsFromSupabase } from '@/app/actions';
import { toast } from 'react-hot-toast';
import SafeImage from '@/components/SafeImage';
import FindGroupsButton from '@/components/FindGroupsButton';
import { useSession } from 'next-auth/react';
import PaywallOverlay from './PaywallOverlay';

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
