"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Lock, CreditCard, Zap, Check } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function PaywallOverlay() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // @ts-ignore
  const plan = session?.user?.plan || 'free';

  if (plan !== 'free') return null;

  return (
    <>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[4px] rounded-2xl z-40" />
      
      {mounted && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/50 rounded-2xl p-8 shadow-2xl flex flex-col md:flex-row gap-8 pointer-events-auto ml-0 md:ml-64 mt-20 md:mt-0">
            
            <div className="flex-1 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-sm font-medium mb-4">
                <Lock className="w-4 h-4" />
                <span>Conteúdo Exclusivo</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Já tem um plano?</h2>
              <p className="text-slate-400 leading-relaxed">
                Descubra os produtos mais lucrativos da internet antes de todo mundo. Desbloqueie o Minerador Live e o Gerador de Anúncios IA.
              </p>
            </div>

            <div className="space-y-3">
              {[
                "Acesso ilimitado ao Minerador Live",
                "Gerador de Anúncios IA de Alta Conversão",
                "Análise de Mercado e Validação",
                "Suporte Prioritário"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-slate-300 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <a 
              href="https://go.ironpayapp.com.br/fntuuvix6m" 
              target="_blank"
              rel="noreferrer"
              className="block w-full"
            >
              <div className="w-full bg-slate-800 border border-slate-700 hover:border-orange-500/50 transition-all rounded-xl p-5 cursor-pointer group">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-white group-hover:text-orange-400 transition-colors">Plano Mensal</h3>
                  <span className="text-xl font-bold text-white">R$ 147<span className="text-sm text-slate-400 font-normal">/mês</span></span>
                </div>
                <p className="text-slate-400 text-sm">Acesso completo por 30 dias.</p>
              </div>
            </a>

            <a 
              href="https://go.ironpayapp.com.br/evspnrga7y" 
              target="_blank"
              rel="noreferrer"
              className="block w-full"
            >
              <div className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 transition-all rounded-xl p-5 cursor-pointer shadow-lg shadow-orange-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-white/20 px-3 py-1 rounded-bl-xl text-xs font-bold text-white backdrop-blur-sm">
                  MAIS POPULAR
                </div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-white">Plano Anual</h3>
                  <div className="text-right">
                    <span className="block text-xs text-orange-200 line-through">R$ 1.764</span>
                    <span className="text-xl font-bold text-white">R$ 249<span className="text-sm text-orange-100 font-normal">/ano</span></span>
                  </div>
                </div>
                <p className="text-orange-100 text-sm">Economize R$ 1.515 no ano.</p>
              </div>
            </a>

            <p className="text-center text-xs text-slate-500 mt-4 flex items-center justify-center gap-2">
              <CreditCard className="w-4 h-4" /> Pagamento 100% Seguro via IronPay
            </p>
          </div>

        </div>
        </div>,
        document.body
      )}
    </>
  );
}
