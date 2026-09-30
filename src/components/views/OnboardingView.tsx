'use client';

import React from 'react';
import { X, TrendingUp, Zap, MessageSquare, Target, Rocket } from 'lucide-react';

interface OnboardingViewProps {
  onClose: () => void;
  onStart: () => void;
}

export default function OnboardingView({ onClose, onStart }: OnboardingViewProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md my-auto bg-[#111726] rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 p-5 sm:p-6 text-center">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Icon & Title */}
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-[#22c55e] to-[#4ade80] mb-3 shadow-lg shadow-[#22c55e]/25 text-[#080c14]">
          <Rocket className="w-5 h-5 fill-current stroke-[2.5]" />
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
          Bem-vindo ao <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22c55e] to-[#4ade80]">DecolaShop</span>!
        </h2>
        
        <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto leading-relaxed">
          Descubra produtos que estão <strong className="text-white font-bold">viralizando agora</strong> para vender no Shopee e Mercado Livre.
        </p>

        {/* 3 Step Mini Cards */}
        <div className="grid grid-cols-3 gap-2 text-left my-4">
          <div className="p-2.5 rounded-xl bg-[#0d131f] border border-white/10 flex flex-col justify-between">
            <div className="w-5 h-5 rounded bg-[#22c55e]/20 flex items-center justify-center text-[#22c55e] font-black text-[10px] mb-1.5">
              1
            </div>
            <h3 className="font-bold flex items-center gap-1 text-white text-[11px] leading-tight">
              <Zap size={12} className="text-[#22c55e] shrink-0" />
              <span>Minerador</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-1 leading-snug">
              Produtos em trend em tempo real.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-[#0d131f] border border-white/10 flex flex-col justify-between">
            <div className="w-5 h-5 rounded bg-[#22c55e]/20 flex items-center justify-center text-[#22c55e] font-black text-[10px] mb-1.5">
              2
            </div>
            <h3 className="font-bold flex items-center gap-1 text-white text-[11px] leading-tight">
              <TrendingUp size={12} className="text-[#22c55e] shrink-0" />
              <span>Garimpo</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-1 leading-snug">
              Alta busca no Google e YouTube.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-[#0d131f] border border-white/10 flex flex-col justify-between">
            <div className="w-5 h-5 rounded bg-[#22c55e]/20 flex items-center justify-center text-[#22c55e] font-black text-[10px] mb-1.5">
              3
            </div>
            <h3 className="font-bold flex items-center gap-1 text-white text-[11px] leading-tight">
              <MessageSquare size={12} className="text-[#22c55e] shrink-0" />
              <span>Anúncio IA</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-1 leading-snug">
              Copy e vídeos que convertem.
            </p>
          </div>
        </div>

        {/* Result highlight */}
        <div className="bg-[#22c55e]/10 border border-[#22c55e]/25 rounded-xl p-2.5 mb-4 text-center">
          <p className="text-xs text-slate-200 leading-snug">
            <strong className="text-[#4ade80]">🎯 Demanda Comprovada:</strong> Venda baseado em dados reais, não em sorte.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <button 
            onClick={onStart}
            className="flex-1 py-2.5 px-4 bg-[#22c55e] hover:bg-[#16a34a] active:scale-95 text-[#080c14] rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-[#22c55e]/20 cursor-pointer"
          >
            Vamos Começar →
          </button>
          <button 
            onClick={onClose}
            className="py-2.5 px-3.5 text-slate-400 hover:text-white font-bold text-xs rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            Pular
          </button>
        </div>
      </div>
    </div>
  );
}
