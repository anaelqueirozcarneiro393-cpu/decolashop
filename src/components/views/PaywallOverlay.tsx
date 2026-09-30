'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Lock, Sparkles, Check, QrCode, ShieldCheck } from 'lucide-react';
import CnpayCheckoutModal from '@/components/checkout/CnpayCheckoutModal';

export default function PaywallOverlay() {
  const [mounted, setMounted] = useState(false);
  const [selectedPlanModal, setSelectedPlanModal] = useState<'monthly' | 'lifetime' | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    'Acesso Ilimitado ao Minerador Live',
    'Filtros Avançados por Margem e Volume',
    'Gerador de Cópias e Anúncios com IA',
    'Visualização de Fornecedores Verificados',
    'Suporte VIP via WhatsApp'
  ];

  return (
    <>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[6px] rounded-2xl z-40" />
      
      {mounted && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div className="relative w-full max-w-3xl bg-[#0d121f] border border-[#22c55e]/30 rounded-3xl p-8 shadow-2xl shadow-[#22c55e]/10 flex flex-col md:flex-row gap-8 pointer-events-auto ml-0 md:ml-64 mt-20 md:mt-0 backdrop-blur-xl">
            
            <div className="flex-1 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#22c55e]/15 text-[#4ade80] border border-[#22c55e]/30 text-xs font-bold mb-4 shadow-[0_0_10px_rgba(34,197,94,0.15)]">
                  <Lock className="w-3.5 h-3.5 text-[#22c55e]" />
                  <span>Conteúdo Exclusivo</span>
                </div>
                <h2 className="text-3xl font-black text-white mb-2">Já tem um plano?</h2>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Descubra os produtos mais lucrativos da internet antes de todo mundo. Desbloqueie o Minerador Live e o Gerador de Anúncios IA.
                </p>
              </div>

              <div className="space-y-3">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/40 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-[#4ade80]" />
                    </div>
                    <span className="text-slate-300 text-xs font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <button 
                type="button"
                onClick={() => setSelectedPlanModal('monthly')}
                className="block w-full text-left"
              >
                <div className="w-full bg-black/40 border border-white/10 hover:border-[#22c55e]/40 transition-all rounded-2xl p-5 cursor-pointer group hover:bg-black/60">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-base font-bold text-white group-hover:text-[#4ade80] transition-colors">Plano Mensal</h3>
                    <span className="text-lg font-black text-white">R$ 49,90<span className="text-xs text-slate-400 font-normal">/mês</span></span>
                  </div>
                  <p className="text-slate-400 text-xs">Acesso completo mensal com cancelamento a qualquer momento.</p>
                </div>
              </button>

              <button 
                type="button"
                onClick={() => setSelectedPlanModal('lifetime')}
                className="block w-full text-left"
              >
                <div className="w-full bg-gradient-to-r from-[#22c55e] via-[#4ade80] to-[#16a34a] hover:brightness-110 transition-all rounded-2xl p-5 cursor-pointer shadow-lg shadow-[#22c55e]/25 relative overflow-hidden group text-black">
                  <div className="absolute top-0 right-0 bg-black/30 px-3 py-1 rounded-bl-xl text-[10px] font-black uppercase text-white backdrop-blur-sm">
                    MAIS POPULAR
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-base font-black text-black">Plano Vitalício VIP</h3>
                    <div className="text-right">
                      <span className="block text-[11px] text-black/60 line-through">R$ 297,00</span>
                      <span className="text-xl font-black text-black">R$ 149,90<span className="text-xs text-black/80 font-bold"> único</span></span>
                    </div>
                  </div>
                  <p className="text-black/80 text-xs font-semibold">Acesso definitivo sem mensalidades.</p>
                </div>
              </button>

              <p className="text-center text-[10px] text-slate-500 mt-4 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#22c55e]" /> Pagamento Instantâneo via CN Pay (Pix & Order Bumps)
              </p>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* In-App CN Pay Checkout Modal with Order Bumps */}
      <CnpayCheckoutModal
        isOpen={!!selectedPlanModal}
        onClose={() => setSelectedPlanModal(null)}
        defaultPlan={selectedPlanModal || 'lifetime'}
      />
    </>
  );
}
