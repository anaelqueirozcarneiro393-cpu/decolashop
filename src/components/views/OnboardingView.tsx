'use client';

import React from 'react';
import { X, TrendingUp, Zap, MessageSquare, Target, Rocket } from 'lucide-react';

interface OnboardingViewProps {
  onClose: () => void;
  onStart: () => void;
}

export default function OnboardingView({ onClose, onStart }: OnboardingViewProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-start md:items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-500 overflow-y-auto">
      <div className="relative w-full max-w-2xl my-auto bg-[#111726] rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8 md:p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#22c55e] to-[#4ade80] mb-6 shadow-xl shadow-[#22c55e]/25 text-[#080c14]">
            <Rocket className="w-8 h-8 fill-current stroke-[2.5]" />
          </div>

          <h2 className="text-3xl md:text-4xl font-black mb-4 text-white tracking-tight">
            🔥 BEM-VINDO AO <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22c55e] to-[#4ade80]">DECOLA SHOP</span>! 🔥
          </h2>
          
          <p className="text-base md:text-lg text-slate-400 mb-10 max-w-lg mx-auto leading-relaxed">
            "Você descobrirá produtos que estão <strong className="text-slate-100 font-black">VIRALIZANDO AGORA</strong> para vender no Shopee e Mercado Livre."
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 text-left mb-10">
            <div className="space-y-3 p-4 rounded-2xl bg-[#0d131f] border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-[#22c55e]/20 flex items-center justify-center text-[#22c55e] font-black text-sm">1</div>
              <h3 className="font-bold flex items-center gap-2 text-white text-sm">
                <Zap size={16} className="text-[#22c55e]" /> ABRE MINERADOR
              </h3>
              <p className="text-xs text-slate-400">Vê lista de produtos em trend em tempo real.</p>
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-[#0d131f] border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-[#22c55e]/20 flex items-center justify-center text-[#22c55e] font-black text-sm">2</div>
              <h3 className="font-bold flex items-center gap-2 text-white text-sm">
                <TrendingUp size={16} className="text-[#22c55e]" /> ESCOLHE O PRODUTO
              </h3>
              <p className="text-xs text-slate-400">O que está subindo no Google e YouTube agora.</p>
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-[#0d131f] border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-[#22c55e]/20 flex items-center justify-center text-[#22c55e] font-black text-sm">3</div>
              <h3 className="font-bold flex items-center gap-2 text-white text-sm">
                <MessageSquare size={16} className="text-[#22c55e]" /> GERA ANÚNCIO
              </h3>
              <p className="text-xs text-slate-400">Nossa IA escreve a copy que converte pra você.</p>
            </div>
          </div>

          <div className="bg-[#22c55e]/5 border border-[#22c55e]/20 rounded-2xl p-6 mb-10 text-center">
            <h4 className="flex items-center justify-center gap-2 font-bold text-[#22c55e] mb-2 italic text-sm">
              <Target size={18} /> O RESULTADO?
            </h4>
            <p className="text-sm text-slate-300">
              Você vende algo com <strong className="text-white font-bold">DEMANDA COMPROVADA</strong>. <br className="hidden md:block" />
              Não no escuro. Não por sorte. <strong className="text-[#22c55e] font-bold">Por dados.</strong>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onStart}
              className="w-full sm:w-auto px-10 py-4 bg-[#22c55e] hover:bg-[#16a34a] active:scale-95 text-[#080c14] rounded-2xl font-black text-base transition-all shadow-lg shadow-[#22c55e]/25 cursor-pointer"
            >
              VAMOS COMEÇAR →
            </button>
            <button 
              onClick={onClose}
              className="w-full sm:w-auto px-8 py-4 text-slate-400 hover:text-white font-medium text-sm transition-colors cursor-pointer"
            >
              Pular por agora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
