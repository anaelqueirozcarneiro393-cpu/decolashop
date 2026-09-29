'use client';

import React from 'react';
import { X, Sparkles, TrendingUp, Zap, MessageSquare, Target } from 'lucide-react';

interface OnboardingViewProps {
  onClose: () => void;
  onStart: () => void;
}

export default function OnboardingView({ onClose, onStart }: OnboardingViewProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-start md:items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-500 overflow-y-auto">
      <div className="relative w-full max-w-2xl my-auto glass-darker rounded-3xl border border-border/50 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8 md:p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl apex-gradient mb-6 shadow-lg shadow-primary/20">
            <Sparkles className="text-white w-8 h-8" />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            🔥 BEM-VINDO AO <span className="apex-gradient-text">APEXFINDER</span>! 🔥
          </h2>
          
          <p className="text-lg text-muted-foreground mb-10 max-w-lg mx-auto leading-relaxed">
            "Você descobrirá produtos que estão <strong>VIRALIZANDO AGORA</strong> para vender no Shopee."
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-12">
            <div className="space-y-3 p-4 rounded-2xl bg-secondary/30 border border-border/50">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">1</div>
              <h3 className="font-bold flex items-center gap-2">
                <Zap size={16} className="text-primary" /> ABRE MINERADOR
              </h3>
              <p className="text-xs text-muted-foreground">Vê lista de produtos em trend em tempo real.</p>
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-secondary/30 border border-border/50">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">2</div>
              <h3 className="font-bold flex items-center gap-2">
                <TrendingUp size={16} className="text-primary" /> ESCOLHE O PRODUTO
              </h3>
              <p className="text-xs text-muted-foreground">O que está subindo no Google e YouTube agora.</p>
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-secondary/30 border border-border/50">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">3</div>
              <h3 className="font-bold flex items-center gap-2">
                <MessageSquare size={16} className="text-primary" /> GERA ANÚNCIO
              </h3>
              <p className="text-xs text-muted-foreground">Nossa IA escreve a copy que converte pra você.</p>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-10">
            <h4 className="flex items-center justify-center gap-2 font-bold text-primary mb-2 italic">
              <Target size={18} /> O RESULTADO?
            </h4>
            <p className="text-sm text-muted-foreground">
              Você vende algo com <strong>DEMANDA COMPROVADA</strong>. <br className="hidden md:block" />
              Não no escuro. Não por sorte. <strong>Por dados.</strong>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onStart}
              className="w-full sm:w-auto px-10 py-4 apex-gradient rounded-xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
            >
              VAMOS COMEÇAR →
            </button>
            <button 
              onClick={onClose}
              className="w-full sm:w-auto px-8 py-4 text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              Pular por agora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
