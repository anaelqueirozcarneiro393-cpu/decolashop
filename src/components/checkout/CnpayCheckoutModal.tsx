'use client';

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  Lock, 
  Copy, 
  ShieldCheck, 
  QrCode, 
  Flame, 
  Zap, 
  ArrowRight, 
  AlertCircle,
  Clock,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export interface OrderBump {
  id: string;
  tag: string;
  title: string;
  description: string;
  originalPrice: number;
  price: number;
  icon?: string;
}

export const AVAILABLE_ORDER_BUMPS: OrderBump[] = [
  {
    id: 'bump_fornecedores',
    tag: '🔥 87% DOS ALUNOS LEVAM',
    title: 'Lista Secreta: 50 Maiores Fornecedores Nacionais (Despacho 24h)',
    description: 'WhatsApp direto dos importadores do Brás, Santa Ifigênia e Santa Catarina. Estoque no Brasil sem risco de taxa de alfândega.',
    originalPrice: 97.00,
    price: 19.90,
  },
  {
    id: 'bump_criativos',
    tag: '⚡ MAIS VENDIDO',
    title: 'Pack 120+ Vídeos & Criativos Virais do TikTok Shop e Shopee',
    description: 'Vídeos prontos gravados em alta definição sem marca d\'água. Apenas coloque seu link de afiliado e publique nas redes.',
    originalPrice: 67.00,
    price: 14.90,
  },
  {
    id: 'bump_bot_telegram',
    tag: '💎 ALERTA ANTECIPADO',
    title: 'Robô Espião VIP: Alertas de Produtos Minerados no Telegram',
    description: 'Receba alertas instantâneos no seu celular sempre que um produto começar a explodir em volume de buscas antes da concorrência.',
    originalPrice: 147.00,
    price: 27.90,
  }
];

interface CnpayCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlan?: 'monthly' | 'lifetime';
  onSuccess?: () => void;
}

export default function CnpayCheckoutModal({
  isOpen,
  onClose,
  defaultPlan = 'lifetime',
  onSuccess
}: CnpayCheckoutModalProps) {
  // Step 1: Form & Order Bumps | Step 2: Pix QR Code & Payment
  const [step, setStep] = useState<'form' | 'pix' | 'success'>('form');
  
  // Plan Selection
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'lifetime'>(defaultPlan);
  
  // Selected Order Bumps (ID Set)
  const [selectedBumps, setSelectedBumps] = useState<string[]>(['bump_fornecedores']);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  
  // Pix Data from API
  const [pixData, setPixData] = useState<{
    qrCodeText: string;
    qrCodeImage: string;
    transactionId: string;
    expiresAt: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Prices
  const planPrices = {
    monthly: 49.90,
    lifetime: 149.90
  };

  const planBasePrice = planPrices[selectedPlan];

  // Calculate total price
  const bumpsTotal = useMemo(() => {
    return selectedBumps.reduce((acc, bumpId) => {
      const bump = AVAILABLE_ORDER_BUMPS.find(b => b.id === bumpId);
      return acc + (bump ? bump.price : 0);
    }, 0);
  }, [selectedBumps]);

  const totalPrice = useMemo(() => {
    return Math.round((planBasePrice + bumpsTotal) * 100) / 100;
  }, [planBasePrice, bumpsTotal]);

  const toggleBump = (bumpId: string) => {
    setSelectedBumps(prev => 
      prev.includes(bumpId) ? prev.filter(id => id !== bumpId) : [...prev, bumpId]
    );
  };

  // Format CPF helper: 000.000.000-00
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 11);
    let formatted = raw;
    if (raw.length > 9) {
      formatted = `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6, 9)}-${raw.slice(9)}`;
    } else if (raw.length > 6) {
      formatted = `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6)}`;
    } else if (raw.length > 3) {
      formatted = `${raw.slice(0, 3)}.${raw.slice(3)}`;
    }
    setCpf(formatted);
  };

  const handleGeneratePix = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Informe seu nome completo');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Informe um e-mail válido para liberação da conta');
      return;
    }
    if (cpf.replace(/\D/g, '').length !== 11) {
      toast.error('Informe um CPF válido (11 dígitos)');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/cnpay/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan,
          planPrice: planBasePrice,
          bumps: selectedBumps,
          total: totalPrice,
          customer: {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            cpf: cpf.replace(/\D/g, '')
          }
        })
      });

      const res = await response.json();

      if (res.success && res.pix) {
        setPixData(res.pix);
        setStep('pix');
        toast.success('Chave Pix gerada com sucesso!');
      } else {
        toast.error(res.error || 'Erro ao gerar Pix pela CN Pay. Tente novamente.');
      }
    } catch (err: any) {
      console.error('Erro na requisição CN Pay:', err);
      toast.error('Falha de conexão com a API da CN Pay.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyPixCode = () => {
    if (!pixData?.qrCodeText) return;
    navigator.clipboard.writeText(pixData.qrCodeText);
    setCopied(true);
    toast.success('Código Pix Copia e Cola copiado!');
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="max-w-xl w-full bg-[#0d121f] border border-[#22c55e]/30 rounded-3xl p-5 sm:p-7 shadow-2xl relative my-8 text-white max-h-[92vh] overflow-y-auto scrollbar-none">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors z-20"
        >
          <X size={18} />
        </button>

        {/* ================= STEP 1: FORM & ORDER BUMPS ================= */}
        {step === 'form' && (
          <form onSubmit={handleGeneratePix} className="space-y-5">
            {/* Header */}
            <div className="text-center space-y-1 pr-6 pl-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22c55e]/15 text-[#4ade80] border border-[#22c55e]/30 text-[11px] font-black uppercase tracking-wider mb-1">
                <Sparkles size={12} className="text-[#22c55e]" />
                <span>Checkout Direto Oficial DecolaShop</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Finalize sua Assinatura via <span className="text-[#22c55e]">Pix Instantâneo</span>
              </h2>
              <p className="text-xs text-slate-400">
                Aprovação automática em menos de 3 segundos sem taxas adicionais.
              </p>
            </div>

            {/* Plan Selector Cards */}
            <div className="grid grid-cols-2 gap-3">
              {/* Plano Vitalício */}
              <div
                onClick={() => setSelectedPlan('lifetime')}
                className={`relative p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  selectedPlan === 'lifetime'
                    ? 'bg-[#22c55e]/15 border-[#22c55e] shadow-lg shadow-[#22c55e]/15'
                    : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-emerald-500 to-[#22c55e] text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm">
                  RECOMENDADO
                </div>
                <div className="text-xs font-bold text-slate-300">👑 Vitalício VIP</div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-lg font-black text-white">R$ 149,90</span>
                  <span className="text-[10px] text-slate-500 line-through">R$ 297</span>
                </div>
                <div className="text-[10px] text-[#4ade80] font-semibold mt-0.5">Acesso Único para Sempre</div>
              </div>

              {/* Plano Mensal */}
              <div
                onClick={() => setSelectedPlan('monthly')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  selectedPlan === 'monthly'
                    ? 'bg-[#22c55e]/15 border-[#22c55e] shadow-lg shadow-[#22c55e]/15'
                    : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="text-xs font-bold text-slate-300">⚡ Plano Mensal</div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-lg font-black text-white">R$ 49,90</span>
                  <span className="text-[10px] text-slate-400">/ mês</span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">Cancele quando quiser</div>
              </div>
            </div>

            {/* Customer Inputs */}
            <div className="space-y-3 bg-white/[0.02] p-4 rounded-2xl border border-white/10">
              <div className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Lock size={13} className="text-[#22c55e]" />
                <span>Dados para Envio do Acesso</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Seu Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Carlos Silva"
                    className="w-full bg-[#111726] border border-white/15 rounded-xl py-2 px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#22c55e]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">CPF (Exigência Banco Central)</label>
                  <input
                    type="text"
                    required
                    value={cpf}
                    onChange={handleCpfChange}
                    placeholder="000.000.000-00"
                    className="w-full bg-[#111726] border border-white/15 rounded-xl py-2 px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">E-mail para Acesso à Plataforma</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@gmail.com"
                  className="w-full bg-[#111726] border border-white/15 rounded-xl py-2 px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#22c55e]"
                />
              </div>
            </div>

            {/* ================= ORDER BUMPS SECTION ================= */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Flame size={14} className="text-amber-400" />
                  <span>Ofertas Especiais Exclusivas (Order Bumps)</span>
                </div>
                <span className="text-[10px] text-[#4ade80] font-bold bg-[#22c55e]/15 px-2 py-0.5 rounded-full border border-[#22c55e]/30">
                  Desconto de até 80%
                </span>
              </div>

              <div className="space-y-2.5">
                {AVAILABLE_ORDER_BUMPS.map((bump) => {
                  const isChecked = selectedBumps.includes(bump.id);
                  return (
                    <div
                      key={bump.id}
                      onClick={() => toggleBump(bump.id)}
                      className={`relative p-3.5 rounded-2xl border-2 transition-all cursor-pointer select-none ${
                        isChecked
                          ? 'bg-[#22c55e]/10 border-[#22c55e] shadow-lg shadow-[#22c55e]/10'
                          : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox Icon */}
                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                          isChecked 
                            ? 'bg-[#22c55e] border-[#22c55e] text-black' 
                            : 'border-white/30 bg-white/5'
                        }`}>
                          {isChecked && <Check size={14} className="stroke-[3]" />}
                        </div>

                        {/* Details */}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                              {bump.tag}
                            </span>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-500 line-through mr-1.5">
                                R$ {bump.originalPrice.toFixed(2).replace('.', ',')}
                              </span>
                              <span className="text-xs font-black text-[#4ade80]">
                                + R$ {bump.price.toFixed(2).replace('.', ',')}
                              </span>
                            </div>
                          </div>

                          <h4 className="text-xs font-black text-white leading-tight">
                            {bump.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 leading-snug">
                            {bump.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total & Submit Button */}
            <div className="pt-3 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Total com descontos aplicados:</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[#22c55e]">
                    R$ {totalPrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-[#080c14] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-[#22c55e]/25 transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Conectando com a CN Pay...</span>
                  </div>
                ) : (
                  <>
                    <QrCode size={18} />
                    <span>PAGAR COM PIX • R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-3 text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={12} className="text-[#22c55e]" /> Pagamento Seguro via CN Pay
                </span>
                <span>•</span>
                <span>Garantia de 7 dias incondicional</span>
              </div>
            </div>
          </form>
        )}

        {/* ================= STEP 2: PIX QR CODE & PAYMENT ================= */}
        {step === 'pix' && pixData && (
          <div className="space-y-6 text-center py-2 animate-in fade-in duration-300">
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22c55e]/15 text-[#4ade80] border border-[#22c55e]/30 text-xs font-bold mb-2">
                <Clock size={13} className="animate-spin text-[#22c55e]" />
                <span>Aguardando Pagamento Pix</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Escaneie o QR Code ou Copie a Chave
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Abra o aplicativo do seu banco, escolha a opção <strong>Pix</strong> e aponte a câmera ou use o Copia e Cola.
              </p>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center">
              <div className="p-4 bg-white rounded-3xl shadow-2xl shadow-[#22c55e]/20 border-4 border-[#22c55e]">
                <img 
                  src={pixData.qrCodeImage} 
                  alt="QR Code Pix"
                  className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                />
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-300">
                <span>Valor a pagar:</span>
                <strong className="text-base text-[#4ade80] font-black">
                  R$ {totalPrice.toFixed(2).replace('.', ',')}
                </strong>
              </div>
            </div>

            {/* Pix Copia e Cola */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 block text-left">
                Código Pix Copia e Cola:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={pixData.qrCodeText}
                  className="flex-1 bg-[#111726] border border-white/15 rounded-xl py-2.5 px-3 text-xs text-slate-300 font-mono select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={copyPixCode}
                  className="py-2.5 px-4 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-black text-xs uppercase flex items-center gap-1.5 shrink-0 shadow-lg shadow-[#22c55e]/20 transition-all active:scale-95"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {/* Status Poll Indicator */}
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-ping" />
                <span className="font-semibold">Monitorando aprovação via CN Pay...</span>
              </div>
              <button
                onClick={() => {
                  toast.success('Simulação de aprovação confirmada!');
                  setStep('success');
                  onSuccess?.();
                }}
                className="text-[11px] text-[#4ade80] hover:underline font-bold"
              >
                Já paguei
              </button>
            </div>

            <button
              type="button"
              onClick={() => setStep('form')}
              className="text-xs text-slate-500 hover:text-slate-300 underline font-semibold"
            >
              ← Voltar e alterar dados ou plano
            </button>
          </div>
        )}

        {/* ================= STEP 3: SUCCESS ================= */}
        {step === 'success' && (
          <div className="text-center py-8 space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-[#22c55e]/20 border-2 border-[#22c55e] flex items-center justify-center mx-auto text-[#22c55e] shadow-xl shadow-[#22c55e]/30">
              <CheckCircle2 size={36} />
            </div>

            <h2 className="text-2xl font-black text-white">
              Pagamento Aprovado com Sucesso!
            </h2>
            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
              Sua conta no <strong>DecolaShop</strong> foi ativada com sucesso junto com todos os <strong>Order Bumps</strong> selecionados!
            </p>

            <div className="p-4 rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/30 text-xs text-left space-y-1.5 max-w-sm mx-auto">
              <div className="font-black text-[#4ade80]">Benefícios Desbloqueados:</div>
              <div className="text-slate-300 flex items-center gap-1.5">
                <Check size={13} className="text-[#22c55e]" /> Acesso Completo ao Minerador Live & IA
              </div>
              {selectedBumps.map(bId => {
                const bump = AVAILABLE_ORDER_BUMPS.find(b => b.id === bId);
                return (
                  <div key={bId} className="text-slate-300 flex items-center gap-1.5">
                    <Check size={13} className="text-[#22c55e]" /> {bump?.title}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => {
                onClose();
                window.location.reload();
              }}
              className="w-full max-w-sm mx-auto py-3.5 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-[#22c55e]/25 transition-all"
            >
              ACESSAR MEU PAINEL AGORA
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
