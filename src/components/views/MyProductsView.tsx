'use client';

import React, { useState, useEffect } from 'react';
import { Package, Search, Trash2, Zap, TrendingUp, AlertTriangle, ArrowRight, MessageSquare, Loader2 } from 'lucide-react';
import { mockProducts } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import SafeImage from '@/components/SafeImage';
import FindGroupsButton from '@/components/FindGroupsButton';


import { getProductsFromSupabase } from '@/app/actions';
import { Product } from '@/lib/mockData';

interface MyProductsViewProps {
  onNavigate: (view: any, product?: any) => void;
  savedProducts: string[];
  onRemove: (id: string) => void;
}

export default function MyProductsView({ onNavigate, savedProducts, onRemove }: MyProductsViewProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const result = await getProductsFromSupabase();
      if (result.success && result.data) {
        setProducts(result.data as any);
      } else {
        setProducts([]);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  const filteredProducts = products.filter(p => savedProducts.includes(p.id));

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-bold">Carregando seus produtos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
            <Package className="text-primary" size={28} /> MEUS PRODUTOS
          </h1>
          <p className="text-muted-foreground italic">
            Produtos que você está acompanhando e vendendo.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('minerador')}
            className="px-6 py-2.5 bg-primary text-black rounded-xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            MINE MAIS <Zap size={16} />
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 glass-darker rounded-[3rem] border border-dashed border-border/50">
          <div className="w-20 h-20 rounded-full bg-secondary/30 flex items-center justify-center text-muted-foreground mb-6">
            <Package size={40} />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Sua lista está vazia</h3>
          <p className="text-muted-foreground text-center max-w-sm mb-8 leading-relaxed">
            Você ainda não salvou nenhum produto. Volte ao minerador e encontre tendências agora!
          </p>
          <button 
            onClick={() => onNavigate('minerador')}
            className="px-8 py-3 bg-secondary hover:bg-secondary/80 text-foreground border border-border/50 rounded-2xl font-bold transition-all flex items-center gap-2"
          >
            Ir para o Minerador <ArrowRight size={18} />
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredProducts.map((product) => {
            const isFalling = product.status === 'CAINDO';
            const isRising = product.status === 'ALTA';

            return (
              <div key={product.id} className="group glass-darker p-8 rounded-[2.5rem] border border-border/50 hover:border-primary/20 transition-all duration-300">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-secondary/30 flex-shrink-0 border border-border/30">
                    <SafeImage 
                      src={product.image_url} 
                      alt={product.name || product.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">{product.name || product.title}</h3>
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest",
                            isRising ? "bg-green/10 text-green" : isFalling ? "bg-red/10 text-red" : "bg-yellow/10 text-yellow"
                          )}>
                            {isRising ? '🟢 EM ALTA' : isFalling ? '🔴 CAINDO' : '🟡 ESTÁVEL'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground font-bold">CATEGORIA: {(product.category || 'Geral').toUpperCase()}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-muted-foreground uppercase mb-1 tracking-widest">Score Atual</div>
                        <div className={cn("text-2xl font-black", isRising ? "text-green" : isFalling ? "text-red" : "text-yellow")}>
                          {product.hype_score || product.score}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-y border-border/30">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Google Trends</p>
                        <p className="text-sm font-bold flex items-center gap-1">
                          {isRising ? <TrendingUp size={14} className="text-green" /> : <AlertTriangle size={14} className="text-red" />}
                          {product.evidence?.google.growth || 'Estável'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Novos Vídeos</p>
                        <p className="text-sm font-bold">+20 vídeos novos</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Timing</p>
                        <p className={cn("text-sm font-bold", isRising ? "text-green" : "text-yellow")}>
                          {isRising ? 'Excelente' : 'Atenção'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                      <div className="text-primary mt-0.5"><Zap size={16} /></div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Análise Inteligente:</p>
                        <p className="text-xs text-muted-foreground leading-relaxed italic">
                          {isRising 
                            ? "Ainda está subindo! Você está no timing certo para escalar as vendas." 
                            : isFalling 
                            ? "A trend passou. Provavelmente não vale mais a pena começar anúncios novos agora." 
                            : "Produto seguro, vale manter as campanhas ativas."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col justify-between md:justify-center gap-3 md:w-56">
                    <FindGroupsButton className="w-full" />
                    <button 
                      onClick={() => onNavigate('anuncio', product)}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-4 apex-gradient rounded-2xl font-black text-sm text-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      GERAR NOVO AD <MessageSquare size={18} />
                    </button>
                    <button 
                      onClick={() => onNavigate('detalhe', product)}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-secondary/50 hover:bg-secondary rounded-2xl font-bold text-sm border border-border/50 transition-all"
                    >
                      VER ANÁLISE <ArrowRight size={18} />
                    </button>
                    <button 
                      onClick={() => onRemove(product.id)}
                      className="px-6 py-4 bg-red/5 hover:bg-red/10 text-red/60 hover:text-red rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} /> REMOVER
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredProducts.length > 0 && (
        <div className="flex justify-center pt-8">
          <button 
            onClick={() => onNavigate('minerador')}
            className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
          >
            Voltar ao Minerador <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
}
