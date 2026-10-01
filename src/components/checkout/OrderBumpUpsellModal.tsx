'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Sparkles, 
  Flame, 
  Check, 
  QrCode, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Copy, 
  Clock,
  Truck,
  Film,
  Bot,
  AlertTriangle,
  GraduationCap,
  Headphones,
  Rocket
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { 
  ORDER_BUMPS_CATALOG, 
  getUserUnlockedBumps, 
  unlockOrderBumpsLocally, 
  OrderBumpItem 
} from '@/lib/orderBumps';

export default function OrderBumpUpsellModal() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [userBumps, setUserBumps] = useState<string[]>([]);
  const [selectedBumps, setSelectedBumps] = useState<string[]>([]);
  const [step, setStep] = useState<'offer' | 'pix' | 'success'>('offer');

  // Pix Data
  const [pixData, setPixData] = useState<{
    qrCodeText: string;
    qrCodeImage: string;
    transactionId: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Check bumps status on mount & session load
  useEffect(() => {
    if (status !== 'authenticated') return;

    const refreshBumps = () => {
      const current = getUserUnlockedBumps(session);
      setUserBumps(current);

      const missing = ORDER_BUMPS_CATALOG.filter(b => !current.includes(b.id));

      if (missing.length === 0) {
        setIsOpen(false);
        return;
      }

      // Check anti-spam cooldown (24 hours cooldown)
      const dismissedUntil = localStorage.getItem('decolashop_bump_popup_dismissed_until');
      if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
        return; // Don't spam the user
      }

      // Automatically select all missing bumps by default for best deal
      setSelectedBumps(missing.map(b => b.id));
      
      // Small delay so dashboard loads smoothly before offering
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1200);

      return () => clearTimeout(timer);
    };

    refreshBumps();

    const handleExplicitOpen = (e: any) => {
      const targetBump = e.detail?.bumpId;
      if (targetBump) {
        setSelectedBumps([targetBump]);
      } else {
        const current = getUserUnlockedBumps(session);
        const missing = ORDER_BUMPS_CATALOG.filter(b => !current.includes(b.id));
        setSelectedBumps(missing.map(b => b.id));
      }
      setStep('offer');
      setIsOpen(true);
    };

    window.addEventListener('decolashop_bumps_updated', refreshBumps);
    window.addEventListener('decolashop_open_bump_modal', handleExplicitOpen);

    return () => {
      window.removeEventListener('decolashop_bumps_updated', refreshBumps);
      window.removeEventListener('decolashop_open_bump_modal', handleExplicitOpen);
    };
  }, [status, session]);

  const missingBumps = useMemo(() => {
    return ORDER_BUMPS_CATALOG.filter(b => !userBumps.includes(b.id));
  }, [userBumps]);

  const totalPrice = useMemo(() => {
    return selectedBumps.reduce((acc, bumpId) => {
      const bump = ORDER_BUMPS_CATALOG.find(b => b.id === bumpId);
      return acc + (bump ? bump.price : 0);
    }, 0);
  }, [selectedBumps]);

  const toggleBump = (bumpId: string) => {
    setSelectedBumps(prev => 
      prev.includes(bumpId) ? prev.filter(id => id !== bumpId) : [...prev, bumpId]
    );
  };

  const handleDismiss = () => {
    // 24 hours cooldown to prevent annoying spam
    const cooldown = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem('decolashop_bump_popup_dismissed_until', cooldown.toString());
    setIsOpen(false);
  };

  const handleGeneratePix = async () => {
    if (selectedBumps.length === 0) {
      toast.error('Selecione pelo menos um pacote para desbloquear');
      return;
    }

    setIsLoading(true);
    setApiError(null);

    const userCpf = 
      (session?.user as any)?.cpf || 
      (typeof window !== 'undefined' ? localStorage.getItem('decolashop_user_cpf') : null) || 
      '39151747805';

    try {
      const response = await fetch('/api/cnpay/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: 'bumps_only',
          planPrice: 0,
          bumps: selectedBumps,
          total: totalPrice,
          customer: {
            name: session?.user?.name || 'Cliente DecolaShop',
            email: session?.user?.email || 'cliente@decolashop.com',
            cpf: userCpf,
            phone: '11999999999'
          }
        })
      });

      const res = await response.json();

      if (res.success && res.pix) {
        setPixData(res.pix);
        setStep('pix');
        setApiError(null);
        toast.success('Chave Pix gerada com sucesso!');
      } else {
        const errMsg = res.error || 'Erro ao gerar Pix. Tente novamente.';
        setApiError(errMsg);
        toast.error(errMsg, { duration: 7000 });
      }
    } catch {
      const connErr = 'Falha de conexão com a API de pagamento.';
      setApiError(connErr);
      toast.error(connErr);
    } finally {
      setIsLoading(false);
    }
  };

  const copyPixCode = () => {
    if (!pixData?.qrCodeText) return;
    navigator.clipboard.writeText(pixData.qrCodeText);
    setCopied(true);
    toast.success('Código Pix Copia e Cola copiado!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleConfirmPix = async () => {
    setIsConfirming(true);

    try {
      // 1. Activate in database
      await fetch('/api/cnpay/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session?.user?.email,
          bumps: selectedBumps,
          transactionId: pixData?.transactionId
        })
      });

      // 2. Unlock locally immediately
      unlockOrderBumpsLocally(selectedBumps);
      toast.success('🎉 Pacotes adicionais liberados na sua conta!');
      setStep('success');
    } catch {
      toast.error('Erro ao confirmar pagamento. Tente novamente.');
    } finally {
      setIsConfirming(false);
    }
  };

  if (!isOpen || missingBumps.length === 0) return null;

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap': return <GraduationCap size={18} className="text-[#22c55e]" />;
      case 'Headphones': return <Headphones size={18} className="text-amber-400" />;
      case 'Rocket': return <Rocket size={18} className="text-cyan-400" />;
      case 'Truck': return <Truck size={18} className="text-amber-400" />;
      case 'Film': return <Film size={18} className="text-[#22c55e]" />;
      case 'Bot': return <Bot size={18} className="text-cyan-400" />;
      default: return <Sparkles size={18} className="text-[#22c55e]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="max-w-md w-full bg-[#0d121f] border border-[#22c55e]/40 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl relative my-auto text-white">
        
        {/* Close / Dismiss */}
        <button
          onClick={handleDismiss}
          type="button"
          className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-xl bg-white/5 hover:bg-white/10 transition-colors z-20 cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* ================= STEP 1: OFFER MISSING BUMPS ================= */}
        {step === 'offer' && (
          <div className="space-y-3">
            <div className="text-center pr-6 pl-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider mb-1">
                <Flame size={11} className="text-amber-400" />
                <span>Oportunidade Única de Upgrade</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                Complete seu Arsenal de Vendas
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Você ainda não desbloqueou estes aceleradores. Aproveite a taxa de parceiro agora:
              </p>
            </div>

            {/* Missing Bumps List */}
            <div className="space-y-1.5 max-h-[46vh] overflow-y-auto pr-1 scrollbar-none">
              {missingBumps.map((bump) => {
                const isSelected = selectedBumps.includes(bump.id);
                return (
                  <div
                    key={bump.id}
                    onClick={() => toggleBump(bump.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-[#22c55e]/10 border-[#22c55e]/60 shadow-sm shadow-[#22c55e]/15'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20 opacity-85'
                    }`}
                  >
                    <div className="mt-0.5">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'bg-[#22c55e] border-[#22c55e]' : 'border-white/30 bg-black/40'
                      }`}>
                        {isSelected && <Check size={11} className="text-black stroke-[3]" />}
                      </div>
                    </div>

                    {bump.image && (
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/50 border border-[#22c55e]/30 shrink-0">
                        <img
                          src={bump.image}
                          alt={bump.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[8px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                          {bump.tag}
                        </span>
                        <div className="text-right">
                          <span className="text-[10px] text-red-500 font-bold line-through decoration-red-500 mr-1.5">
                            de R$ {bump.originalPrice.toFixed(2).replace('.', ',')}
                          </span>
                          <span className="text-xs font-black text-[#4ade80]">
                            por R$ {bump.price.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5 leading-snug">
                        {renderIcon(bump.icon)}
                        <span>{bump.title}</span>
                      </h4>

                      <p className="text-[10px] text-slate-400 mt-0.5 leading-tight line-clamp-2">
                        {bump.shortDesc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total and Actions */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Total a desbloquear:</span>
                <span className="text-lg font-black text-[#22c55e]">
                  R$ {totalPrice.toFixed(2).replace('.', ',')}
                </span>
              </div>

              {apiError && (
                <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-200 text-xs leading-relaxed flex items-start gap-2.5 animate-in fade-in">
                  <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-300">Aviso do Gateway SigiloPay</p>
                    <p className="text-[10px] text-amber-200/90 mt-0.5 leading-snug">{apiError}</p>
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={isLoading || selectedBumps.length === 0}
                onClick={handleGeneratePix}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#22c55e]/25 transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Gerando Pix...</span>
                  </div>
                ) : (
                  <>
                    <QrCode size={15} />
                    <span>DESBLOQUEAR VIA PIX • R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="w-full py-1 text-[11px] text-slate-500 hover:text-slate-300 font-semibold text-center block cursor-pointer transition-colors"
              >
                Agora não, continuar para o painel
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: PIX QR CODE ================= */}
        {step === 'pix' && pixData && (
          <div className="space-y-3.5 text-center py-1 animate-in fade-in duration-300">
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#22c55e]/15 text-[#4ade80] border border-[#22c55e]/30 text-[10px] font-bold mb-1">
                <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" />
                <span>Pix Gerado • Aguardando Pagamento</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Pague e Desbloqueie Imediatamente
              </h2>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="p-2 bg-white rounded-xl shadow-lg shadow-[#22c55e]/20 border-2 border-[#22c55e]">
                <img 
                  src={pixData.qrCodeImage} 
                  alt="QR Code Pix"
                  className="w-28 h-28 sm:w-32 sm:h-32 object-contain"
                />
              </div>

              <div className="mt-1.5 flex items-center gap-1 text-xs text-slate-300">
                <span>Valor do Pix:</span>
                <strong className="text-sm text-[#4ade80] font-black">
                  R$ {totalPrice.toFixed(2).replace('.', ',')}
                </strong>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 block text-left">
                Código Pix Copia e Cola:
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={pixData.qrCodeText}
                  className="flex-1 bg-[#111726] border border-white/15 rounded-lg py-1.5 px-2.5 text-[11px] text-slate-300 font-mono select-all focus:outline-none truncate"
                />
                <button
                  type="button"
                  onClick={copyPixCode}
                  className="py-1.5 px-3 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-black font-black text-xs uppercase flex items-center gap-1 shrink-0 shadow-md shadow-[#22c55e]/20 transition-all active:scale-95 cursor-pointer"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <button
                type="button"
                disabled={isConfirming}
                onClick={handleConfirmPix}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#22c55e]/25 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isConfirming ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Liberando Recursos...</span>
                  </div>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>JÁ FIZ O PIX • LIBERAR AGORA</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('offer')}
                className="text-[11px] text-slate-500 hover:text-slate-300 underline font-semibold block mx-auto cursor-pointer"
              >
                ← Voltar para as opções
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: SUCCESS ================= */}
        {step === 'success' && (
          <div className="text-center py-4 space-y-3 animate-in zoom-in-95 duration-300">
            <div className="w-12 h-12 rounded-full bg-[#22c55e]/20 border-2 border-[#22c55e] flex items-center justify-center mx-auto text-[#22c55e] shadow-lg shadow-[#22c55e]/30">
              <CheckCircle2 size={28} />
            </div>

            <h2 className="text-lg sm:text-xl font-black text-white">
              Recursos Desbloqueados com Sucesso!
            </h2>
            <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
              Todos os aceleradores selecionados agora estão liberados e integrados ao seu painel.
            </p>

            <button
              type="button"
              onClick={handleDismiss}
              className="w-full py-3 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-[#22c55e]/25 transition-all cursor-pointer"
            >
              CONTINUAR NAVEGANDO
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
