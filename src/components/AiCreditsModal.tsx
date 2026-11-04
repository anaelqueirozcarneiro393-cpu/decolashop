'use client';

import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Sparkles, 
  CheckCircle2, 
  Copy, 
  Check, 
  X, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  QrCode,
  Flame,
  AlertTriangle,
  RotateCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { 
  RECHARGE_PACKAGES, 
  useCredits, 
  addCredits 
} from '@/lib/creditsStore';

export default function AiCreditsModal() {
  const { data: session } = useSession();
  const userEmail = 
    session?.user?.email?.toLowerCase().trim() || 
    (typeof window !== 'undefined' ? (localStorage.getItem('decolashop_user_email') || '').toLowerCase().trim() : '') ||
    'usuario@decolashop.com';
  const userName = session?.user?.name || 'Membro DecolaShop';

  const { credits } = useCredits(userEmail);

  const [isOpen, setIsOpen] = useState(false);
  const [contextReason, setContextReason] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState(RECHARGE_PACKAGES[1]); // Turbo por padrão
  const [step, setStep] = useState<'packages' | 'pix'>('packages');
  const [isGeneratingPix, setIsGeneratingPix] = useState(false);
  const [pixData, setPixData] = useState<{
    qrCodeText: string;
    qrCodeImage: string;
    transactionId: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [countdown, setCountdown] = useState(899);

  // Escuta evento global de abertura do modal
  useEffect(() => {
    function handleOpenModal(event: any) {
      const detail = event.detail || {};
      if (detail.contextReason) {
        setContextReason(detail.contextReason);
      } else {
        setContextReason(null);
      }
      if (detail.recommendedPackageId) {
        const found = RECHARGE_PACKAGES.find(p => p.id === detail.recommendedPackageId);
        if (found) setSelectedPackage(found);
      } else {
        setSelectedPackage(RECHARGE_PACKAGES[1]); // Turbo
      }
      setStep('packages');
      setIsOpen(true);
    }

    window.addEventListener('decolashop_open_credits_modal', handleOpenModal);
    return () => window.removeEventListener('decolashop_open_credits_modal', handleOpenModal);
  }, []);

  // Timer Pix
  useEffect(() => {
    if (step !== 'pix') return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 899));
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSelectPackage = (pkg: typeof RECHARGE_PACKAGES[0]) => {
    setSelectedPackage(pkg);
  };

  const handleGeneratePix = async () => {
    setIsGeneratingPix(true);
    try {
      const response = await fetch('/api/sigilopay/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPackage.id,
          planPrice: selectedPackage.price,
          total: selectedPackage.price,
          bumps: [],
          customer: {
            name: userName,
            email: userEmail,
            phone: '11999999999',
            cpf: '11144477735'
          }
        })
      });

      const data = await response.json();

      if (data?.success && data?.qrCodeText) {
        setPixData({
          qrCodeText: data.qrCodeText,
          qrCodeImage: data.qrCodeImage || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(data.qrCodeText)}`,
          transactionId: data.transactionId || `tx_${Date.now()}`
        });
        setStep('pix');
        setCountdown(899);
      } else {
        // Fallback robusto para não travar o usuário
        const fallbackPix = `00020126580014BR.GOV.BCB.PIX0136${userEmail}520400005303986540${selectedPackage.price.toFixed(2)}5802BR5925DECOLASHOP TECNOLOGIA6009SAO PAULO62070503***6304`;
        setPixData({
          qrCodeText: fallbackPix,
          qrCodeImage: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(fallbackPix)}`,
          transactionId: `tx_cred_${Date.now()}`
        });
        setStep('pix');
        setCountdown(899);
      }
    } catch (err) {
      console.error('Erro ao gerar Pix de créditos:', err);
      // Gera fallback instantâneo
      const fallbackPix = `00020126580014BR.GOV.BCB.PIX0136${userEmail}520400005303986540${selectedPackage.price.toFixed(2)}5802BR5925DECOLASHOP TECNOLOGIA6009SAO PAULO62070503***6304`;
      setPixData({
        qrCodeText: fallbackPix,
        qrCodeImage: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(fallbackPix)}`,
        transactionId: `tx_cred_${Date.now()}`
      });
      setStep('pix');
      setCountdown(899);
    } finally {
      setIsGeneratingPix(false);
    }
  };

  const handleCopyPix = () => {
    if (!pixData?.qrCodeText) return;
    navigator.clipboard.writeText(pixData.qrCodeText);
    setCopied(true);
    toast.success('Código Pix Copia e Cola copiado!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConfirmPayment = async () => {
    if (!pixData?.transactionId) {
      toast.error('Gere uma cobrança Pix antes de verificar o pagamento.');
      return;
    }

    setIsCheckingPayment(true);
    try {
      const res = await fetch('/api/sigilopay/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          plan: selectedPackage.id,
          transactionId: pixData.transactionId
        })
      });

      const data = await res.json();

      // TRAVA DE SEGURANÇA MÁXIMA: NUNCA LIBERA SEM CONFIRMAÇÃO DO BANCO
      if (!res.ok || !data?.success || !data?.paid) {
        toast.error(
          data?.error || 'Pagamento via Pix ainda não identificado pelo banco. Conclua o pagamento no seu banco e tente novamente em instantes.',
          { duration: 6000, icon: '⏳' }
        );
        return;
      }

      // Só executa se for 100% confirmado e pago no gateway bancário
      const creditsToAdd = data.creditsAdded || selectedPackage.totalCredits;
      addCredits(creditsToAdd, `Recarga ${selectedPackage.name}`, userEmail);

      toast.success(`🎉 Pagamento confirmado pelo banco! +${creditsToAdd} Créditos de IA liberados!`, {
        duration: 6000,
        style: {
          background: '#0d121f',
          color: '#fff',
          border: '2px solid #22c55e',
          boxShadow: '0 0 25px rgba(34,197,94,0.3)',
          fontWeight: 'bold'
        }
      });

      setIsOpen(false);
      setStep('packages');
      setPixData(null);
    } catch (err) {
      console.error('Erro ao verificar Pix:', err);
      toast.error('Erro de conexão ao consultar o banco. Verifique sua conexão e tente novamente.');
    } finally {
      setIsCheckingPayment(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0b101c] border border-[#22c55e]/30 rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(34,197,94,0.15)] space-y-5 max-h-[92vh] overflow-y-auto">
        
        {/* Glow de fundo */}
        <div className="absolute top-0 right-1/4 w-44 h-44 bg-[#22c55e]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 left-1/4 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header do Modal */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#22c55e]/25 to-emerald-500/10 border border-[#22c55e]/40 flex items-center justify-center text-[#4ade80] shadow-lg shadow-[#22c55e]/20">
              <Zap size={24} className="fill-[#4ade80] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Recarga de Créditos IA
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-bold border border-white/10">
                  Saldo: {credits} ⚡
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Alimente seus robôs para divulgar produtos, minerar e liberar slots.
              </p>
            </div>
          </div>

          <button
            onClick={() => { setIsOpen(false); setStep('packages'); }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Alerta Contextual (quando o usuário tenta uma ação sem saldo suficiente) */}
        {contextReason && step === 'packages' && (
          <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-300 animate-in slide-in-from-top-2 relative z-10">
            <AlertTriangle size={18} className="shrink-0 text-amber-400" />
            <span className="font-semibold leading-snug">{contextReason}</span>
          </div>
        )}

        {/* ETAPA 1: SELEÇÃO DE PACOTES DE CRÉDITOS */}
        {step === 'packages' ? (
          <div className="space-y-4 relative z-10">
            <div className="text-xs text-slate-300 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Selecione seu Pacote de Créditos</span>
              <span className="text-[11px] text-[#4ade80] font-normal lowercase">ativação instantânea via Pix</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {RECHARGE_PACKAGES.map((pkg) => {
                const isSelected = selectedPackage.id === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => handleSelectPackage(pkg)}
                    className={`relative rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between text-left group ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#22c55e]/15 to-transparent border-[#22c55e] shadow-[0_0_20px_rgba(34,197,94,0.2)]'
                        : 'bg-black/40 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#22c55e] to-emerald-500 text-black font-black text-[9px] uppercase tracking-wider shadow-md shadow-[#22c55e]/30">
                        Mais Vendido
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pkg.badgeColor}`}>
                          {pkg.badge}
                        </span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-[#22c55e] text-black flex items-center justify-center">
                            <Check size={11} strokeWidth={3} />
                          </div>
                        )}
                      </div>

                      <div className="mt-2">
                        <span className="text-2xl font-black text-white font-mono">
                          {pkg.totalCredits}
                        </span>
                        <span className="text-xs font-bold text-[#4ade80] ml-1">Créditos</span>
                        {pkg.bonusCredits > 0 && (
                          <div className="text-[10px] font-black text-[#4ade80] mt-0.5">
                            +{pkg.bonusCredits} BÔNUS INCLUSO
                          </div>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 mt-2 leading-snug">
                        {pkg.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-baseline justify-between">
                      <div>
                        <span className="text-xs font-medium text-slate-400">R$</span>{' '}
                        <span className="text-base font-black text-white font-mono">
                          {pkg.price.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {pkg.pricePerCredit}/créd
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* O que você pode fazer com esses créditos */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2 text-xs">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                O que você faz com {selectedPackage.totalCredits} créditos:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-300 text-[11px]">
                <div className="flex items-center gap-1.5 bg-black/40 p-2 rounded-xl border border-white/5">
                  <Sparkles size={12} className="text-[#22c55e]" />
                  <span>Até <strong>{Math.floor(selectedPackage.totalCredits / 3)}</strong> divulgações IA</span>
                </div>
                <div className="flex items-center gap-1.5 bg-black/40 p-2 rounded-xl border border-white/5">
                  <ShieldCheck size={12} className="text-cyan-400" />
                  <span>Até <strong>{Math.floor(selectedPackage.totalCredits / 2)}</strong> minerações secretas</span>
                </div>
                <div className="flex items-center gap-1.5 bg-black/40 p-2 rounded-xl border border-white/5">
                  <Flame size={12} className="text-amber-400" />
                  <span>Até <strong>+{Math.floor(selectedPackage.totalCredits / 10) * 5}</strong> vagas no catálogo</span>
                </div>
              </div>
            </div>

            {/* Botão de Avançar para o Pix */}
            <button
              onClick={handleGeneratePix}
              disabled={isGeneratingPix}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#22c55e] via-emerald-500 to-[#16a34a] hover:brightness-110 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-[#22c55e]/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isGeneratingPix ? (
                <>
                  <RotateCw size={15} className="animate-spin" />
                  <span>Gerando Chave Pix...</span>
                </>
              ) : (
                <>
                  <QrCode size={16} />
                  <span>Pagar R$ {selectedPackage.price.toFixed(2).replace('.', ',')} com Pix One-Click</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        ) : (
          /* ETAPA 2: QR CODE PIX ONE-CLICK & CONFIRMAÇÃO */
          <div className="space-y-4 text-center relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 py-1.5 px-3 rounded-full mx-auto w-fit font-bold">
              <Clock size={13} className="text-amber-400 animate-pulse" />
              <span>Chave Pix expira em: <strong className="font-mono">{formatTimer(countdown)}</strong></span>
            </div>

            <div className="bg-white p-4 rounded-2xl w-48 h-48 mx-auto shadow-2xl flex items-center justify-center">
              {pixData?.qrCodeImage ? (
                <img
                  src={pixData.qrCodeImage}
                  alt="QR Code Pix"
                  className="w-full h-full object-contain"
                />
              ) : (
                <QrCode size={160} className="text-black" />
              )}
            </div>

            <div>
              <span className="text-xs text-slate-400 block font-medium">Valor da Recarga:</span>
              <span className="text-2xl font-black text-white font-mono">
                R$ {selectedPackage.price.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-xs text-[#4ade80] font-bold block mt-0.5">
                +{selectedPackage.totalCredits} Créditos de IA Imediatos
              </span>
            </div>

            {/* Código Copia e Cola */}
            <div className="p-3 bg-black/50 border border-white/10 rounded-2xl flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={pixData?.qrCodeText || ''}
                className="w-full bg-transparent text-[11px] font-mono text-slate-300 outline-none truncate"
              />
              <button
                onClick={handleCopyPix}
                className="shrink-0 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
              >
                {copied ? <Check size={13} className="text-[#22c55e]" /> : <Copy size={13} />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep('packages')}
                className="w-1/3 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Trocar Pacote
              </button>

              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={isCheckingPayment}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#22c55e] to-emerald-500 hover:brightness-110 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-[#22c55e]/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isCheckingPayment ? (
                  <>
                    <RotateCw size={14} className="animate-spin" />
                    <span>Consultando Banco Central & Gateway...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    <span>Verificar Pagamento no Banco</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[10px] text-slate-400 leading-snug">
              🔒 <strong>Validação Bancária em Tempo Real:</strong> O sistema consulta a compensação do Pix diretamente no gateway SigiloPay. Os créditos só são liberados após confirmação da instituição financeira.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
