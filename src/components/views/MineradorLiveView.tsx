'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, Heart, Zap, TrendingUp, Users, ArrowRight, Loader2 } from 'lucide-react';
import { mockProducts, Product } from '@/lib/mockData';
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
  const plan = session?.user?.plan || 'free';
  const isFree = plan === 'free';

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    setIsLoading(true);
    const result = await getProductsFromSupabase();
    if (result.success && result.data) {
      // @ts-ignore
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
    toast.success('Lista atualizada!');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
            <Search className="text-primary" size={28} /> MINERADOR <span className="apex-gradient-text">LIVE</span>
          </h1>
          <p className="text-muted-foreground italic">
            Descubra produtos que estão viralizando agora.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Buscar tendência..." 
              className="bg-secondary/30 border border-border/50 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all w-full md:w-64"
            />
          </div>
          <button 
            onClick={handleRefresh}
            className={cn(
              "p-2.5 rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary transition-all",
              isRefreshing && "animate-spin text-primary"
            )}
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {['Todos', 'Eletrônicos', 'Beleza', 'Setup Gamer', 'Cozinha'].map((cat) => (
          <button 
            key={cat}
            onClick={() => setFilter(cat.toLowerCase())}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-bold border transition-all",
              filter === cat.toLowerCase() 
                ? "bg-primary text-black border-primary" 
                : "bg-secondary/30 text-muted-foreground border-border/50 hover:border-primary/30"
            )}
          >
            {cat}
          </button>
        ))}
        <div className="h-6 w-px bg-border/50 mx-2" />
        <button className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-secondary/30 text-muted-foreground border border-border/50 hover:border-primary/30 transition-all">
          <Filter size={14} /> Mais Filtros
        </button>
      </div>

      {/* Product List */}
      <div className="relative">
        {isFree && <PaywallOverlay />}
        <div className={cn("space-y-6", isFree && "blur-[8px] pointer-events-none opacity-60 select-none transition-all duration-1000")}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 glass rounded-[2rem] border border-border/50">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">Sincronizando com o n8n...</p>
            </div>
          ) : products.length > 0 ? (
            products.filter(p => p.name).map((product, index) => {
              const isSaved = savedProducts.includes(product.id);
            const score = product.hype_score || 0;
            const scoreColor = score >= 90 ? 'text-green' : score >= 70 ? 'text-yellow' : 'text-red';
            const scoreBg = score >= 90 ? 'bg-green/10' : score >= 70 ? 'bg-yellow/10' : 'bg-red/10';
            const scoreBorder = score >= 90 ? 'border-green/20' : score >= 70 ? 'border-yellow/20' : 'border-red/20';

            return (
            <div 
              key={product.id}
              className={cn(
                "group relative glass-darker p-1 rounded-[2rem] transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5",
                index === 0 ? "border-2 border-primary/20" : "border border-border/50"
              )}
            >
              {index === 0 && (
                <div className="absolute -top-3 left-8 px-3 py-1 bg-primary text-black text-[10px] font-black rounded-full uppercase tracking-tighter animate-bounce z-10">
                  📌 TOP 1 - OPORTUNIDADE GIGANTE
                </div>
              )}

              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-48 h-48 rounded-2xl overflow-hidden bg-secondary/30 relative flex-shrink-0 border border-border/30">
                  <SafeImage 
                    src={product.image_url} 
                    alt={product.name || product.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                     <span className="text-[10px] font-bold text-white uppercase tracking-widest">Ver Produto</span>
                  </div>
                </div>

                {/* Main Info */}
                <div className="flex-1 space-y-6">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-1 group-hover:text-primary transition-colors line-clamp-2">{product.name}</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">{product.category || 'Geral'}</p>
                        <span className="h-1 w-1 rounded-full bg-border" />
                        <p className="text-xs font-black text-primary uppercase tracking-widest">{typeof product.price === 'number' ? `R$ ${product.price.toFixed(2)}` : product.price || 'Preço sob consulta'}</p>
                      </div>
                    </div>
                    <div className={cn("flex flex-col items-center justify-center w-20 h-20 rounded-2xl border flex-shrink-0 shadow-lg", scoreBg, scoreColor, scoreBorder)}>
                      <span className="text-2xl font-black">{product.hype_score}</span>
                      <span className="text-[10px] font-bold uppercase tracking-tighter">SCORE</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 p-3 rounded-xl bg-secondary/20 border border-border/20">
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                        <TrendingUp size={14} className="text-primary" /> ANÁLISE DE MERCADO
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 italic">
                        {product.description || "Produto minerado com sucesso. Tendência identificada pelo ApexFinder via n8n."}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col justify-center p-3 rounded-xl bg-secondary/20 border border-border/20">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">STATUS</span>
                        <span className="text-xs font-black text-green">EM ALTA</span>
                      </div>
                      <div className="flex flex-col justify-center p-3 rounded-xl bg-secondary/20 border border-border/20">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">FONTE</span>
                        <span className="text-xs font-black text-primary">N8N LIVE</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-border/30">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">OPORTUNIDADE:</span>
                      <span className="text-[10px] font-black px-2 py-0.5 bg-green/10 text-green rounded-md uppercase tracking-tighter border border-green/20">Demanda Validada</span>
                    </div>
                    {product.url && (
                       <a href={product.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1">
                         <Search size={12} /> ORIGEM DO PRODUTO
                       </a>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row md:flex-col justify-between md:justify-center gap-3 md:w-48">
                  <FindGroupsButton className="w-full" />
                  <button 
                    onClick={() => onSave(product.id)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all border",
                      isSaved ? "bg-red/5 text-red border-red/20" : "bg-secondary/30 text-muted-foreground border-border/50 hover:border-red/30 hover:text-red"
                    )}
                  >
                    <Heart size={18} className={cn(isSaved && "fill-current animate-heart")} /> {isSaved ? 'Salvo' : 'Salvar'}
                  </button>
                  <button 
                    onClick={() => onNavigate('detalhe', product)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-secondary/50 hover:bg-secondary rounded-xl font-bold text-sm transition-all border border-border/50"
                  >
                    Ver Análise
                  </button>
                  <button 
                    onClick={() => onNavigate('anuncio', product)}
                    className="flex-[2] md:flex-none flex items-center justify-center gap-2 px-4 py-3 apex-gradient rounded-xl font-black text-sm text-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    GERAR AD →
                  </button>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-20 glass rounded-[2rem] border border-border/50">
          <p className="text-muted-foreground">Nenhum produto minerado ainda.</p>
        </div>
      )}
      </div>
      </div>

      <div className="flex justify-center py-12">
        <button className="px-8 py-3 rounded-2xl bg-secondary/30 border border-border/50 text-sm font-bold text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all flex items-center gap-2 group">
          Carregar Mais Oportunidades <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </div>
    </div>
  );
}
