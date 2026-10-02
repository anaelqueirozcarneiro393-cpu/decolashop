'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Lock, Sparkles, Check, QrCode, ShieldCheck } from 'lucide-react';
import SigilopayCheckoutModal from '@/components/checkout/SigilopayCheckoutModal';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pointer-events-none">
          <div className="relative w-full max-w-xl bg-[#0d121f] border border-[#22c55e]/30 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl shadow-[#22c55e]/15 flex flex-col sm:flex-row gap-5 pointer-events-auto backdrop-blur-xl animate-in zoom-in-95 duration-200">
            
            {/* Left Col: Info & Features */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#22c55e]/15 text-[#4ade80] border border-[#22c55e]/30 text-[10px] font-black uppercase tracking-wider mb-2">
                  <Lock className="w-3 h-3 text-[#22c55e]" />
                  <span>Conteúdo Exclusivo</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  Desbloqueie Todo o Potencial
                </h2>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  Descubra os produtos mais lucrativos da internet antes de todo mundo com dados em tempo real.
                </p>
              </div>

              <div className="space-y-2">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/40 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 text-[#4ade80]" />
                    </div>
                    <span className="text-slate-300 text-xs font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Col: Plans */}
            <div className="flex-1 space-y-2.5 flex flex-col justify-center">
              <button 
                type="button"
                onClick={() => setSelectedPlanModal('lifetime')}
                className="block w-full text-left"
              >
                <div className="w-full bg-gradient-to-r from-[#22c55e] via-[#4ade80] to-[#16a34a] hover:brightness-110 transition-all rounded-xl p-3 cursor-pointer shadow-md shadow-[#22c55e]/25 relative overflow-hidden group text-black">
                  <div className="absolute top-0 right-0 bg-black/40 px-2 py-0.5 rounded-bl-lg text-[9px] font-black uppercase text-white backdrop-blur-sm">
                    POPULAR
                  </div>
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className="text-xs font-black text-black">Vitalício VIP</h3>
                    <div className="text-right">
                      <span className="block text-[10px] text-black/60 line-through">R$ 297,00</span>
                      <span className="text-base font-black text-black">R$ 179,90</span>
                    </div>
                  </div>
                  <p className="text-black/80 text-[10px] font-bold">Acesso definitivo sem mensalidades.</p>
                </div>
              </button>

              <button 
                type="button"
                onClick={() => setSelectedPlanModal('monthly')}
                className="block w-full text-left"
              >
                <div className="w-full bg-black/40 border border-white/10 hover:border-[#22c55e]/40 transition-all rounded-xl p-3 cursor-pointer group hover:bg-black/60">
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className="text-xs font-bold text-white group-hover:text-[#4ade80] transition-colors">Plano Mensal</h3>
                    <span className="text-sm font-black text-white">R$ 89,90<span className="text-[10px] text-slate-400 font-normal">/mês</span></span>
                  </div>
                  <p className="text-slate-400 text-[10px]">Acesso mensal com cancelamento a qualquer momento.</p>
                </div>
              </button>

              <p className="text-center text-[10px] text-slate-400 pt-1 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#22c55e]" /> Pagamento Instantâneo via Pix Seguro (SigiloPay)
              </p>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* In-App SigiloPay Checkout Modal with Order Bumps */}
      <SigilopayCheckoutModal
        isOpen={!!selectedPlanModal}
        onClose={() => setSelectedPlanModal(null)}
        defaultPlan={selectedPlanModal || 'lifetime'}
      />
    </>
  );
}
