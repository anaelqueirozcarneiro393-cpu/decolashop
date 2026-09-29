'use client';

import React from 'react';
import { ArrowLeft, TrendingUp, Zap, Users, DollarSign, CheckCircle2, Play, ExternalLink, Heart, Target } from 'lucide-react';
import { Product } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import SafeImage from '@/components/SafeImage';
import FindGroupsButton from '@/components/FindGroupsButton';


interface ProductDetailViewProps {
  product: Product;
  isSaved: boolean;
  onSave: (id: string) => void;
  onNavigate: (view: any, product?: any) => void;
}

export default function ProductDetailView({ product, isSaved, onSave, onNavigate }: ProductDetailViewProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => onNavigate('minerador')}
          className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar ao Minerador
        </button>
        <button 
          onClick={() => onSave(product.id)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border",
            isSaved ? "bg-red/5 text-red border-red/20" : "bg-secondary/30 text-muted-foreground border-border/50"
          )}
        >
          <Heart size={16} className={cn(isSaved && "fill-current animate-heart")} /> {isSaved ? 'Salvo' : 'Salvar'}
        </button>
      </div>

      {/* Main Header */}
      <div className="glass-darker p-8 md:p-12 rounded-[2.5rem] border border-border/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-[2rem] overflow-hidden bg-secondary/30 flex-shrink-0 border border-border/30 shadow-2xl">
            <SafeImage 
              src={product.image_url} 
              alt={product.name || product.title} 
              className="w-full h-full object-cover transition-transform duration-1000 hover:scale-110" 
            />
          </div>

          <div className="flex-1 space-y-4">
            <div className="inline-block px-4 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-widest border border-primary/20">
              ANÁLISE COMPLETA
            </div>
            <h1 className="text-3xl md:text-5xl font-black">{product.name || product.title}</h1>
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-2 text-xl font-bold">
                Score de Oportunidade: <span className="text-primary">{product.hype_score || product.score}/100</span>
              </div>
              <p className="text-muted-foreground italic">"{product.description || "Este produto está EXPLODINDO no mercado - O timing é agora."}"</p>
            </div>
          </div>
        </div>
      </div>

      {/* Evidence Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google Trends */}
        {product.evidence?.google && (
          <div className="glass p-8 rounded-3xl border border-border/50 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <TrendingUp size={24} />
              </div>
              <div>
                <h3 className="font-bold">EVIDÊNCIA #1: GOOGLE TRENDS</h3>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Interesse de Compra</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-dark-bg/50 border border-border/30 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">Interesse em Alta</span>
                <span className="text-lg font-black text-green">↑↑↑ {product.evidence.google.growth}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">Tendência</span>
                <span className="text-xs font-bold px-2 py-1 bg-green/10 text-green rounded-md uppercase tracking-tighter">🟢 {product.evidence.google.label}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">Interesse Geral</span>
                <span className="text-sm font-black">{product.evidence.google.interest}/100</span>
              </div>

              <div className="pt-4 border-t border-border/30">
                <div className="flex gap-2 text-sm">
                  <span className="text-primary font-bold">💡</span>
                  <p className="text-xs text-muted-foreground italic">
                    <strong>O que significa?</strong> Pessoas ESTÃO PROCURANDO por este produto no Google. Isso indica demanda real e consciente.
                  </p>
                </div>
              </div>
            </div>
            
            <button className="w-full py-3 text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2">
              Ver no Google Trends <ExternalLink size={12} />
            </button>
          </div>
        )}

        {/* YouTube */}
        {product.evidence?.youtube && (
          <div className="glass p-8 rounded-3xl border border-border/50 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Play size={24} />
              </div>
              <div>
                <h3 className="font-bold">EVIDÊNCIA #2: YOUTUBE VIRAL</h3>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Engajamento de Vídeo</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-dark-bg/50 border border-border/30 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">Vídeos Encontrados</span>
                <span className="text-sm font-black">{product.evidence.youtube.videos}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">Total de Views</span>
                <span className="text-sm font-black">{product.evidence.youtube.views}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">Crescimento</span>
                <span className="text-xs font-black text-primary">📈 RÁPIDO ({product.evidence.youtube.growth})</span>
              </div>

              <div className="space-y-2 pt-4 border-t border-border/30">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Top Vídeos:</p>
                {product.evidence.youtube.topVideos.map((video, i) => (
                  <div key={i} className="flex justify-between items-center text-[11px] bg-secondary/20 p-2 rounded-lg">
                    <span className="truncate max-w-[150px] font-medium italic">"{video.title}"</span>
                    <span className="font-bold text-primary">{video.views} views</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border/30">
                <div className="flex gap-2 text-sm">
                  <span className="text-primary font-bold">💡</span>
                  <p className="text-xs text-muted-foreground italic">
                    <strong>O que significa?</strong> Criadores de conteúdo estão gerando engajamento massivo. Isso leva a vendas diretas via prova social.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Communities */}
        {product.evidence?.communities && (
          <div className="glass p-8 rounded-3xl border border-border/50 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Users size={24} />
              </div>
              <div>
                <h3 className="font-bold">EVIDÊNCIA #3: COMUNIDADES</h3>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Conversas e Desejo</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-dark-bg/50 border border-border/30 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">Grupos Mencionando</span>
                <span className="text-sm font-black">{product.evidence.communities.groups}+</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">Engajamento</span>
                <span className="text-xs font-black text-orange">🔥 {product.evidence.communities.engagement}</span>
              </div>

              <div className="space-y-2 pt-4 border-t border-border/30 text-[11px]">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Exemplos de conversas:</p>
                {product.evidence.communities.examples.map((ex, i) => (
                  <div key={i} className="flex gap-2 bg-secondary/20 p-2 rounded-lg">
                    <span className="text-primary">•</span>
                    <span className="text-muted-foreground">{ex}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border/30">
                <div className="flex gap-2 text-sm">
                  <span className="text-primary font-bold">💡</span>
                  <p className="text-xs text-muted-foreground italic">
                    <strong>O que significa?</strong> Pessoas estão falando, perguntando e querendo. É um sinalizador claro de demanda em movimento e rápida conversão.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Financial */}
        <div className="glass p-8 rounded-3xl border border-border/50 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green/10 flex items-center justify-center text-green">
              <DollarSign size={24} />
            </div>
            <div>
              <h3 className="font-bold">OPORTUNIDADE FINANCEIRA</h3>
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Potencial de Lucro</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-dark-bg/50 border border-border/30 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold">Comissão Estimada</span>
              <span className="text-xl font-black text-green">{product.commission || product.price || 'R$ --'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold">Fácil de Vender?</span>
              <span className="text-xs font-bold text-green flex items-center gap-1">🟢 SIM (EM TREND)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold">Competição</span>
              <span className="text-xs font-bold text-yellow flex items-center gap-1">🟡 MÉDIA</span>
            </div>

            <div className="pt-4 border-t border-border/30">
              <div className="flex gap-2 text-sm">
                <span className="text-green font-bold">💡</span>
                <p className="text-xs text-muted-foreground italic">
                  <strong>Análise:</strong> Você venderia para quem JÁ ESTÁ PROCURANDO. Não precisa convencer, a demanda já existe. É só facilitar a compra.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-xl text-[11px] text-muted-foreground italic">
            <CheckCircle2 size={14} className="text-green flex-shrink-0" />
            "Produto ideal para quem está começando hoje."
          </div>
        </div>
      </div>

      {/* TL;DR Summary */}
      <div className="glass-darker p-8 rounded-[2rem] border border-primary/20 bg-primary/5">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Target className="text-primary" size={24} /> RESUMO (TL;DR)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="flex items-center gap-2 text-sm font-bold">
            <CheckCircle2 className="text-green" size={16} /> Google Trends (+250%)
          </div>
          <div className="flex items-center gap-2 text-sm font-bold">
            <CheckCircle2 className="text-green" size={16} /> YouTube (500k views)
          </div>
          <div className="flex items-center gap-2 text-sm font-bold">
            <CheckCircle2 className="text-green" size={16} /> Comunidades (12+ grupos)
          </div>
          <div className="flex items-center gap-2 text-sm font-bold">
            <CheckCircle2 className="text-green" size={16} /> Comissão Alta ({product.commission})
          </div>
        </div>

        <div className="flex flex-col items-center text-center space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-primary">CONCLUSÃO: OPORTUNIDADE EXCELENTE!</h3>
            <p className="text-muted-foreground text-sm max-w-2xl">
              Você venderia para quem <strong>JÁ QUER COMPRAR</strong>. Não teria que convencer ninguém. Só teria que colocar o anúncio na frente do olho certo.
            </p>
          </div>
          
          <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
            <FindGroupsButton className="w-full py-4" />
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <button 
                onClick={() => onNavigate('anuncio', product)}
                className="px-8 py-4 apex-gradient rounded-2xl font-black text-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                GERAR ANÚNCIO COM IA →
              </button>
              <button 
                onClick={() => onNavigate('calculadora')}
                className="px-6 py-4 bg-secondary/70 hover:bg-secondary border border-border/50 rounded-2xl font-bold text-sm transition-all text-white flex items-center justify-center gap-2"
              >
                📊 Calcular Margem & ROI
              </button>
              <button 
                onClick={() => onNavigate('fornecedores')}
                className="px-6 py-4 bg-secondary/50 hover:bg-secondary border border-border/50 rounded-2xl font-bold text-sm transition-all text-slate-300 flex items-center justify-center gap-2"
              >
                🚚 Ver Fornecedores
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
