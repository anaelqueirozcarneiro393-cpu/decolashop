'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Sparkles, 
  Share2, 
  ExternalLink, 
  TrendingUp, 
  Filter, 
  Copy, 
  Check, 
  Heart,
  Video,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { getProductsFromSupabase } from '@/app/actions';
import { Product } from '@/lib/mockData';
import SafeImage from '@/components/SafeImage';
import { toast } from 'react-hot-toast';

interface CatalogoViewProps {
  onNavigate: (view: any, product?: any) => void;
  onSave?: (id: string) => void;
  savedProducts?: string[];
}

const CATEGORIES = [
  'Todas',
  'Eletrônicos',
  'Cozinha',
  'Beleza',
  'Setup Gamer',
  'Casa & Decoração',
  'Fitness',
  'Automotivo',
  'Moda'
];

export default function CatalogoView({ onNavigate, onSave, savedProducts = [] }: CatalogoViewProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(24);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await getProductsFromSupabase();
        if (res.success && res.data) {
          setProducts(res.data);
        }
      } catch (err) {
        console.error("Erro ao carregar catálogo:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleCopyLink = (p: Product) => {
    const affiliateUrl = `https://shopee.com.br/universal-link?aff_id=decolashop_${p.id}`;
    navigator.clipboard.writeText(affiliateUrl);
    setCopiedId(p.id);
    toast.success('Link de afiliado DecolaShop copiado!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = useMemo(() => {
    return products.filter(p => {
      const name = (p.name || p.title || '').toLowerCase();
      const matchesSearch = name.includes(search.toLowerCase());
      
      if (selectedCategory === 'Todas') {
        return matchesSearch;
      }
      
      const catLower = (p.category || '').toLowerCase();
      const selLower = selectedCategory.toLowerCase();
      const matchesCat = catLower.includes(selLower) || selLower.includes(catLower);
      return matchesSearch && matchesCat;
    });
  }, [products, search, selectedCategory]);

  const displayedProducts = useMemo(() => {
    return filtered.slice(0, visibleCount);
  }, [filtered, visibleCount]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { 'Todas': products.length };
    CATEGORIES.forEach(cat => {
      if (cat !== 'Todas') {
        const selLower = cat.toLowerCase();
        counts[cat] = products.filter(p => {
          const catLower = (p.category || '').toLowerCase();
          return catLower.includes(selLower) || selLower.includes(catLower);
        }).length;
      }
    });
    return counts;
  }, [products]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3 border border-primary/20">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Catálogo Completo & Afiliados DecolaShop</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2 text-white">
            Catálogo de <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-green-500">Produtos Vencedores</span>
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-xl">
            Mais de {products.length || 80} produtos minerados e validados com alto volume de busca no TikTok Shop, Shopee e Mercado Livre prontos para divulgar.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setVisibleCount(24);
              }}
              placeholder="Buscar produtos, categorias..."
              className="bg-secondary/30 border border-border/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 w-full transition-all"
            />
          </div>
        </div>
      </div>

      {/* Categories Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const count = categoryCounts[cat] ?? 0;
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setVisibleCount(24);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                isSelected
                  ? 'bg-primary text-black border-primary font-black shadow-lg shadow-primary/20'
                  : 'bg-secondary/40 text-muted-foreground border-border/50 hover:bg-secondary hover:text-white'
              }`}
            >
              <span>{cat}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-black/20 text-black font-black' : 'bg-white/5 text-muted-foreground'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Count & Status Bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <div>
          Mostrando <span className="font-bold text-white">{displayedProducts.length}</span> de <span className="font-bold text-primary">{filtered.length}</span> produtos encontrados
        </div>
        {filtered.length > displayedProducts.length && (
          <button 
            onClick={() => setVisibleCount(filtered.length)}
            className="text-xs text-primary hover:underline font-bold"
          >
            Exibir todos ({filtered.length})
          </button>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass rounded-3xl p-5 border border-border/40 animate-pulse space-y-4">
              <div className="w-full h-48 rounded-2xl bg-white/5" />
              <div className="h-4 bg-white/10 rounded w-3/4" />
              <div className="h-6 bg-white/10 rounded w-1/3" />
              <div className="h-10 bg-white/5 rounded-xl w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayedProducts.map((prod) => {
            const isSaved = savedProducts.includes(prod.id);
            const numPrice = typeof prod.price === 'number' 
              ? prod.price 
              : parseFloat(String(prod.price || '99.90').replace(/[^0-9.]/g, '')) || 99.90;
            
            const commissionVal = typeof prod.commission === 'string' && prod.commission.includes('R$')
              ? prod.commission
              : `R$ ${(numPrice * 0.32).toFixed(2).replace('.', ',')}`;

            const originalPrice = (numPrice * 1.55).toFixed(2).replace('.', ',');

            return (
              <div 
                key={prod.id} 
                className="glass rounded-3xl p-4 sm:p-5 border border-border/50 hover:border-primary/40 transition-all flex flex-col justify-between group hover:shadow-xl hover:shadow-primary/5 bg-[#0b101b]/80"
              >
                <div>
                  {/* Image and Badges */}
                  <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-secondary/40 border border-border/30 mb-3.5">
                    <SafeImage 
                      src={prod.image_url} 
                      alt={prod.name || prod.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
                      Comissão: {commissionVal}
                    </div>
                    {onSave && (
                      <button
                        onClick={() => onSave(prod.id)}
                        className={`absolute top-2.5 right-2.5 p-2 rounded-xl backdrop-blur-md border transition-all ${
                          isSaved ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-black/60 text-white border-white/10 hover:bg-black/80'
                        }`}
                      >
                        <Heart size={14} className={isSaved ? 'fill-current' : ''} />
                      </button>
                    )}
                  </div>

                  {/* Info */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="font-bold text-primary truncate max-w-[130px]">{prod.category || 'Geral'}</span>
                      <span className="font-black text-white px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px]">
                        🔥 {prod.hype_score || 90}/100
                      </span>
                    </div>
                    <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {prod.name || prod.title}
                    </h3>
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-lg font-black text-white">
                        R$ {numPrice.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-[10px] text-muted-foreground line-through">
                        R$ {originalPrice}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-3 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onNavigate('divulgacao-ia', prod)}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-primary text-black font-extrabold text-xs hover:bg-primary/90 transition-all shadow-md shadow-primary/20 active:scale-95"
                    >
                      <Sparkles size={13} />
                      <span>Divulgar IA</span>
                    </button>

                    <button
                      onClick={() => onNavigate('video-ia', prod)}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-secondary/80 hover:bg-secondary border border-border/50 text-white font-bold text-xs transition-all active:scale-95"
                    >
                      <Video size={13} />
                      <span>Vídeo IA</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyLink(prod)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[11px] font-semibold transition-all active:scale-95"
                    >
                      {copiedId === prod.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copiedId === prod.id ? 'Copiado!' : 'Link Afiliado'}</span>
                    </button>

                    <button
                      onClick={() => onNavigate('detalhe', prod)}
                      className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[11px] font-semibold transition-all active:scale-95"
                    >
                      Métricas
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16 glass rounded-3xl border border-border/40 p-8">
          <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="text-lg font-bold text-white mb-1">Nenhum produto encontrado</h3>
          <p className="text-muted-foreground text-xs max-w-sm mx-auto mb-4">
            Não encontramos nenhum produto para &quot;{search}&quot; nesta categoria. Tente buscar por outros termos.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('Todas');
            }}
            className="px-4 py-2 rounded-xl bg-primary text-black font-bold text-xs"
          >
            Limpar Filtros
          </button>
        </div>
      )}

      {/* Load More Button */}
      {!isLoading && filtered.length > displayedProducts.length && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6">
          <button
            onClick={() => setVisibleCount(prev => prev + 24)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-secondary/80 hover:bg-secondary border border-border/60 text-white font-bold text-xs transition-all active:scale-95 shadow-lg shadow-black/20"
          >
            <span>Carregar Mais Produtos ({filtered.length - displayedProducts.length} restantes)</span>
            <ChevronDown size={14} />
          </button>
          <button
            onClick={() => setVisibleCount(filtered.length)}
            className="text-xs text-muted-foreground hover:text-white underline font-semibold py-2"
          >
            Mostrar Todos ({filtered.length})
          </button>
        </div>
      )}
    </div>
  );
}
