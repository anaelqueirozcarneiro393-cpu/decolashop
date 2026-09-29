'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Zap, ArrowRight, Lightbulb, Package, MessageSquare, Clock, Loader2 } from 'lucide-react';
import { mockProducts, tips, Product } from '@/lib/mockData';
import { getProductsFromSupabase } from '@/app/actions';
import SafeImage from '@/components/SafeImage';
import FindGroupsButton from '@/components/FindGroupsButton';
import { useSession } from 'next-auth/react';
import PaywallOverlay from './PaywallOverlay';
import { cn } from '@/lib/utils';

interface DashboardViewProps {
  onNavigate: (view: any, product?: any) => void;
  savedCount: number;
}

export default function DashboardView({ onNavigate, savedCount }: DashboardViewProps) {
  const { data: session } = useSession();
  // @ts-ignore
  const plan = session?.user?.plan || 'free';
  const isFree = plan === 'free';

  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      const result = await getProductsFromSupabase();
      if (result.success && result.data) {
        // @ts-ignore
        setTopProducts(result.data.slice(0, 2));
      } else {
        setTopProducts([]);
      }
      setIsLoading(false);
    }
    loadProducts();
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            🔥 Produtos em Trend <span className="apex-gradient-text">AGORA</span>
          </h1>
          <p className="text-muted-foreground">
            Estes estão viralizando - venda o hype e evite o escuro.
          </p>
        </div>
        <button 
          onClick={() => onNavigate('minerador')}
          className="flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all"
        >
          Ver Minerador Completo <ArrowRight size={16} />
        </button>
      </div>

      {/* Featured Products */}
      <div className="relative">
        {isFree && <PaywallOverlay />}
        <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6", isFree && "blur-[8px] pointer-events-none opacity-60 select-none transition-all duration-1000")}>
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 glass rounded-3xl border border-border/50">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
              <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Minerando tendências...</p>
            </div>
          ) : topProducts.filter(p => p.name).map((product) => (
            <div key={product.id} className="group glass-darker p-6 rounded-3xl border border-border/50 hover:border-primary/30 transition-all duration-300">
              <div className="flex gap-6 mb-6">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-secondary/30 flex-shrink-0 border border-border/30">
                  <SafeImage 
                    src={product.image_url} 
                    alt={product.name || product.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-2">{product.name || product.title}</h3>
                  </div>
                  <div className="flex flex-col items-start mt-2">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                      (product.hype_score || product.score || 0) >= 90 ? 'bg-green/10 text-green border border-green/20' : 'bg-yellow/10 text-yellow border border-yellow/20'
                    }`}>
                      Score: {product.hype_score || product.score || 0}/100 {(product.hype_score || product.score || 0) >= 90 ? '🟢 EXCELENTE' : '🟡 BOM'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp size={14} className="text-primary" />
                  <span>Google: <strong>{product.evidence?.google.growth || 'Alta'}</strong></span>
                  <span className="text-border mx-1">|</span>
                  <Zap size={14} className="text-primary" />
                  <span>YouTube: <strong>{product.evidence?.youtube.views || 'Explodindo'}</strong></span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <FindGroupsButton className="w-full" />
                <div className="flex gap-3">
                  <button 
                    onClick={() => onNavigate('detalhe', product)}
                    className="flex-1 px-4 py-3 bg-secondary/50 hover:bg-secondary rounded-xl text-sm font-bold transition-colors"
                  >
                    Ver Detalhes
                  </button>
                  <button 
                    onClick={() => onNavigate('anuncio', product)}
                    className="flex-1 px-4 py-3 apex-gradient rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Gerar Anúncio →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress & Tip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass p-8 rounded-3xl border border-border/50">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="text-primary" size={20} /> SEU PROGRESSO
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-4 rounded-2xl bg-dark-bg/50 border border-border/30">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Produtos Salvos</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{savedCount}</span>
                <Package size={14} className="text-primary" />
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-dark-bg/50 border border-border/30">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Anúncios IA</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{savedCount * 3}</span>
                <MessageSquare size={14} className="text-primary" />
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-dark-bg/50 border border-border/30">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Tempo Salvo</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">~{savedCount * 2}h</span>
                <Clock size={14} className="text-primary" />
              </div>
            </div>
          </div>
          
          <div className="mt-8 p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <ArrowRight size={20} />
              </div>
              <div>
                <p className="text-sm font-bold">🎯 PRÓXIMO PASSO:</p>
                <p className="text-xs text-muted-foreground">Começar a vender o produto com maior Score.</p>
              </div>
            </div>
            <button className="text-xs font-bold text-primary hover:underline">Ver Guia</button>
          </div>
        </div>

        <div className="glass p-8 rounded-3xl border border-border/50 bg-primary/5">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Lightbulb className="text-yellow" size={20} /> DICA DO DIA
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed italic">
            "{randomTip}"
          </p>
        </div>
      </div>
    </div>
  );
}
