'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  Lock, 
  Copy, 
  ShieldCheck, 
  QrCode, 
  Flame, 
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
  User,
  Phone,
  Mail,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { signIn } from 'next-auth/react';
import { unlockOrderBumpsLocally } from '@/lib/orderBumps';
import { syncAffiliatesFromServer, getAffiliateRef, bindLeadEmailToAffiliate } from '@/lib/affiliateSystem';

export interface OrderBump {
  id: string;
  tag: string;
  title: string;
  shortDesc: string;
  originalPrice: number;
  price: number;
  image: string;
}

export const AVAILABLE_ORDER_BUMPS: OrderBump[] = [
  {
    id: 'bump_curso',
    tag: '🎓 20 AULAS',
    title: 'Curso Completo',
    shortDesc: 'Curso Completo com 20 aulas explicando de forma bem didática para você aprender absolutamente tudo sobre a ferramenta',
    originalPrice: 37.54,
    price: 29.90,
    image: '/images/bump-curso-completo.jpg',
  },
  {
    id: 'bump_acompanhamento',
    tag: '⭐ SUPORTE 24H',
    title: 'Acompanhamento - 1 ano',
    shortDesc: 'Acompanhamento Completo por 1 especialista durante 1 ano - 24h',
    originalPrice: 75.21,
    price: 59.90,
    image: '/images/bump-acompanhamento-1ano.jpg',
  },
  {
    id: 'bump_acelerador',
    tag: '🚀 IA DE ESCALA',
    title: 'Acelerador de Vendas',
    shortDesc: 'Conte com uma IA que acelerará suas vendas garantindo 30 vendas nas primeiras 48h!',
    originalPrice: 50.10,
    price: 39.90,
    image: '/images/bump-acelerador-vendas.jpg',
  }
];

// Official Brazilian CPF validator (Verifica os 2 dígitos verificadores oficiais)
function isValidCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i), 10) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(9), 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i), 10) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(10), 10)) return false;

  return true;
}

interface SigilopayCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlan?: 'monthly' | 'lifetime';
  onSuccess?: () => void;
}

export default function SigilopayCheckoutModal({
  isOpen,
  onClose,
  defaultPlan = 'lifetime',
  onSuccess
}: SigilopayCheckoutModalProps) {
  // Reset step whenever modal is reopened
  const [step, setStep] = useState<'form' | 'pix' | 'success'>('form');
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'lifetime'>(defaultPlan);
  const [selectedBumps, setSelectedBumps] = useState<string[]>(['bump_fornecedores']);
  
  // Customer inputs
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [isInternational, setIsInternational] = useState(false);
  const [isNoCpf, setIsNoCpf] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Pix Data
  const [pixData, setPixData] = useState<{
    qrCodeText: string;
    qrCodeImage: string;
    transactionId: string;
    expiresAt: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Synchronize plan & reset state on open
  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setSelectedPlan(defaultPlan);
      setCopied(false);
      setIsLoading(false);
      setIsConfirming(false);
      setApiError(null);
    }
  }, [isOpen, defaultPlan]);

  // Standardized platform pricing
  const planPrices = {
    monthly: 89.90,
    lifetime: 179.90
  };

  const planBasePrice = planPrices[selectedPlan];

  // Calculate total price with order bumps
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

  // Format CPF helper (Suporta CPF e Documento Internacional)
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isNoCpf) {
      setCpf(e.target.value.slice(0, 25));
      return;
    }
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

  // Format Phone helper (Suporta Brasil e Internacional)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    // Se começar com '+' ou já estiver no modo internacional
    if (val.startsWith('+') || isInternational) {
      if (!isInternational && val.startsWith('+')) {
        setIsInternational(true);
      }
      let cleaned = val.replace(/[^\d+() -]/g, '');
      if (cleaned.startsWith('+')) {
        cleaned = '+' + cleaned.slice(1).replace(/\+/g, '');
      }
      setPhone(cleaned.slice(0, 22));
      return;
    }

    const digitsOnly = val.replace(/\D/g, '');

    // Se digitar mais de 11 dígitos, é internacional
    if (digitsOnly.length > 11) {
      setIsInternational(true);
      setPhone('+' + digitsOnly.slice(0, 18));
      return;
    }

    // Formatação padrão brasileira (XX) XXXXX-XXXX
    let formatted = digitsOnly;
    if (digitsOnly.length > 10) {
      formatted = `(${digitsOnly.slice(0, 2)}) ${digitsOnly.slice(2, 7)}-${digitsOnly.slice(7, 11)}`;
    } else if (digitsOnly.length > 6) {
      formatted = `(${digitsOnly.slice(0, 2)}) ${digitsOnly.slice(2, 6)}-${digitsOnly.slice(6)}`;
    } else if (digitsOnly.length > 2) {
      formatted = `(${digitsOnly.slice(0, 2)}) ${digitsOnly.slice(2)}`;
    }
    setPhone(formatted);
  };

  const toggleInternationalPhone = () => {
    const next = !isInternational;
    setIsInternational(next);
    if (next) {
      if (!phone.startsWith('+')) {
        const clean = phone.replace(/\D/g, '');
        setPhone(clean ? `+${clean}` : '+');
      }
    } else {
      const clean = phone.replace(/\D/g, '').slice(0, 11);
      let formatted = clean;
      if (clean.length > 10) {
        formatted = `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
      } else if (clean.length > 6) {
        formatted = `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
      } else if (clean.length > 2) {
        formatted = `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
      }
      setPhone(formatted);
    }
  };

  const handleGeneratePix = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Informe seu nome completo');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 7) {
      toast.error('Informe seu número de WhatsApp / telefone');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Informe um e-mail válido para liberação da conta');
      return;
    }
    if (!isNoCpf && !isValidCPF(cpf)) {
      toast.error('CPF inválido. Se você mora no exterior e não possui CPF, clique em "Não tenho CPF".');
      return;
    }
    if (isNoCpf && !cpf.trim()) {
      toast.error('Informe seu passaporte ou documento de identificação');
      return;
    }
    if (!password || password.length < 6) {
      toast.error('Crie uma senha de acesso com no mínimo 6 caracteres');
      return;
    }

    setIsLoading(true);
    setApiError(null);

    try {
      const cleanEmail = email.trim().toLowerCase();
      bindLeadEmailToAffiliate(cleanEmail);

      const response = await fetch('/api/sigilopay/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan,
          planPrice: planBasePrice,
          bumps: selectedBumps,
          total: totalPrice,
          affiliateCode: getAffiliateRef(),
          customer: {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            cpf: isNoCpf ? (cpf.trim() || 'EXTERIOR') : cpf.replace(/\D/g, ''),
            phone: phone.trim(),
            password: password.trim()
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
    } catch (err: any) {
      console.error('Erro na requisição SigiloPay:', err);
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

  // Polling automático a cada 3.5s para detectar pagamento Pix instantaneamente
  useEffect(() => {
    if (step !== 'pix' || !pixData?.transactionId || !isOpen) return;

    let isPolling = true;
    const interval = setInterval(async () => {
      if (!isPolling) return;
      try {
        const confirmRes = await fetch('/api/sigilopay/confirm-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            name: name.trim(),
            cpf: cpf.replace(/\D/g, ''),
            phone: phone.replace(/\D/g, ''),
            password: password,
            plan: selectedPlan,
            bumps: selectedBumps,
            total: totalPrice,
            transactionId: pixData?.transactionId,
            affiliateCode: getAffiliateRef()
          })
        });

        const confirmData = await confirmRes.json();
        if (confirmData.success && isPolling) {
          isPolling = false;
          clearInterval(interval);

          if (selectedBumps && selectedBumps.length > 0) {
            unlockOrderBumpsLocally(selectedBumps);
          }

          const cleanUserEmail = email.trim().toLowerCase();
          const cleanUserName = name.trim();
          const cleanUserCpf = isNoCpf ? (cpf.trim() || 'EXTERIOR') : cpf.replace(/\D/g, '');
          const cleanUserPhone = phone.trim();

          if (typeof window !== 'undefined') {
            localStorage.setItem('decolashop_user_email', cleanUserEmail);
            localStorage.setItem('decolashop_active_user_email', cleanUserEmail);
            localStorage.setItem('decolashop_user_name', cleanUserName);
            localStorage.setItem('decolashop_user_cpf', cleanUserCpf);
            localStorage.setItem('decolashop_user_phone', cleanUserPhone);
            localStorage.setItem('decolashop_user_plan', selectedPlan);
            localStorage.setItem('decolashop_user_role', 'user');
            localStorage.setItem('decolashop_logged_in', 'true');
          }

          try {
            await signIn('credentials', {
              email: cleanUserEmail,
              password: password,
              redirect: false
            });
          } catch {}

          toast.success('🎉 Pagamento confirmado! Acesso VIP liberado com sucesso!');
          setStep('success');
          onSuccess?.();
        }
      } catch {}
    }, 3500);

    return () => {
      isPolling = false;
      clearInterval(interval);
    };
  }, [step, pixData?.transactionId, isOpen, email, name, cpf, phone, password, selectedPlan, selectedBumps, totalPrice, onSuccess]);

  // Immediate Account Activation and Auto-Login on "Já Paguei"
  const handleConfirmPayment = async () => {
    setIsConfirming(true);

    try {
      // 1. Activate account in database
      const confirmRes = await fetch('/api/sigilopay/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          name: name.trim(),
          cpf: isNoCpf ? (cpf.trim() || 'EXTERIOR') : cpf.replace(/\D/g, ''),
          phone: phone.trim(),
          password: password,
          plan: selectedPlan,
          bumps: selectedBumps,
          total: totalPrice,
          transactionId: pixData?.transactionId,
          affiliateCode: getAffiliateRef()
        })
      });

      const confirmData = await confirmRes.json();

      if (confirmData.success) {
        // Sincroniza dados com o banco Supabase (onde a venda já foi validada e gravada com segurança pelo servidor)
        try {
          syncAffiliatesFromServer();
        } catch (affErr) {
          console.error('Erro ao sincronizar dados de afiliado:', affErr);
        }

        // Unlock order bumps locally for immediate client-side access
        if (selectedBumps && selectedBumps.length > 0) {
          unlockOrderBumpsLocally(selectedBumps);
        }

        const cleanUserEmail = email.trim().toLowerCase();
        const cleanUserName = name.trim();
        const cleanUserCpf = isNoCpf ? (cpf.trim() || 'EXTERIOR') : cpf.replace(/\D/g, '');
        const cleanUserPhone = phone.trim();

        if (typeof window !== 'undefined') {
          localStorage.setItem('decolashop_user_email', cleanUserEmail);
          localStorage.setItem('decolashop_active_user_email', cleanUserEmail);
          localStorage.setItem('decolashop_user_name', cleanUserName);
          localStorage.setItem('decolashop_user_cpf', cleanUserCpf);
          localStorage.setItem('decolashop_user_phone', cleanUserPhone);
          localStorage.setItem('decolashop_user_plan', selectedPlan);
          localStorage.setItem('decolashop_user_role', 'user');
          localStorage.setItem('decolashop_logged_in', 'true');
        }

        // 2. Automatically log the user in via NextAuth
        try {
          await signIn('credentials', {
            email: cleanUserEmail,
            password: password,
            redirect: false
          });
        } catch {
          // ignore signin error if session persists
        }

        toast.success('🎉 Pagamento confirmado e conta liberada!');
        setStep('success');
        onSuccess?.();
      } else {
        toast.error(confirmData.error || 'Não foi possível confirmar o pagamento ainda.');
      }
    } catch {
      toast.error('Erro ao verificar pagamento. Tente em alguns instantes.');
    } finally {
      setIsConfirming(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
      <div className="max-w-lg w-full bg-[#0d121f] border border-[#22c55e]/30 rounded-2xl sm:rounded-3xl shadow-2xl relative text-white max-h-[92dvh] sm:max-h-[88vh] flex flex-col min-h-0 overflow-hidden">
        
        {/* Global Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 text-slate-400 hover:text-white p-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors z-30 cursor-pointer"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        {/* ================= STEP 1: FORM & ORDER BUMPS ================= */}
        {step === 'form' && (
          <form onSubmit={handleGeneratePix} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Pinned Header */}
            <div className="px-4 pt-4 pb-2.5 sm:px-6 sm:pt-5 sm:pb-3 shrink-0 border-b border-white/5 pr-14 text-left">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#22c55e]/15 text-[#4ade80] border border-[#22c55e]/30 text-[10px] font-black uppercase tracking-wider mb-1">
                <Sparkles size={11} className="text-[#22c55e]" />
                <span>Checkout Direto DecolaShop</span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-white leading-tight">
                Cadastre-se & Ative seu <span className="text-[#22c55e]">Acesso VIP</span>
              </h2>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-3 sm:px-6 sm:py-4 space-y-3.5 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
              {/* Plan Selector (Horizontal Pills) */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlan('lifetime')}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedPlan === 'lifetime'
                      ? 'bg-[#22c55e]/15 border-[#22c55e] shadow-sm shadow-[#22c55e]/20'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-white flex items-center gap-1">
                      👑 Vitalício VIP
                    </span>
                    <span className="text-[9px] bg-[#22c55e] text-black font-black px-1.5 py-0.2 rounded-full uppercase">
                      Popular
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-sm font-black text-[#4ade80]">R$ 179,90</span>
                    <span className="text-[9px] text-slate-400 line-through">R$ 297</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPlan('monthly')}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedPlan === 'monthly'
                      ? 'bg-[#22c55e]/15 border-[#22c55e] shadow-sm shadow-[#22c55e]/20'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-slate-300">⚡ Mensal</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-sm font-black text-white">R$ 89,90</span>
                    <span className="text-[9px] text-slate-400">/mês</span>
                  </div>
                </button>
              </div>

              {/* Customer Inputs (Compact 2x2 + Password) */}
              <div className="space-y-2 bg-white/[0.02] p-3 rounded-xl border border-white/10">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1">
                  <Lock size={12} className="text-[#22c55e]" />
                  <span>Dados de Cadastro & Login</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 block mb-0.5">Nome Completo</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Carlos Silva"
                      className="w-full bg-[#111726] border border-white/15 rounded-lg py-1.5 px-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#22c55e]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[10px] font-bold text-slate-300 block">WhatsApp / Tel</label>
                      <button
                        type="button"
                        onClick={toggleInternationalPhone}
                        className="text-[9px] text-[#4ade80] hover:underline flex items-center gap-0.5 cursor-pointer font-bold transition-colors"
                        title="Alternar entre número brasileiro e internacional"
                      >
                        {isInternational ? '🇧🇷 Brasil' : '🌍 Outro País'}
                      </button>
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder={isInternational ? "+351 912 345 678 ou +1 ..." : "(11) 99999-9999"}
                      className="w-full bg-[#111726] border border-white/15 rounded-lg py-1.5 px-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#22c55e]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 block mb-0.5">E-mail de Acesso</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => {
                        if (email && email.includes('@')) {
                          bindLeadEmailToAffiliate(email.trim().toLowerCase());
                        }
                      }}
                      placeholder="seuemail@gmail.com"
                      className="w-full bg-[#111726] border border-white/15 rounded-lg py-1.5 px-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#22c55e]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[10px] font-bold text-slate-300 block">
                        {isNoCpf ? 'Passaporte / Doc' : 'CPF (Válido)'}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const next = !isNoCpf;
                          setIsNoCpf(next);
                          if (next && !cpf) {
                            setCpf('EXTERIOR');
                          } else if (!next && cpf === 'EXTERIOR') {
                            setCpf('');
                          }
                        }}
                        className="text-[9px] text-slate-400 hover:text-[#4ade80] hover:underline cursor-pointer transition-colors"
                        title="Se você mora fora e não tem CPF brasileiro"
                      >
                        {isNoCpf ? 'Tenho CPF' : 'Não tenho CPF'}
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={cpf}
                      onChange={handleCpfChange}
                      placeholder={isNoCpf ? "Passaporte ou doc exterior" : "000.000.000-00"}
                      className="w-full bg-[#111726] border border-white/15 rounded-lg py-1.5 px-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#22c55e]"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <label className="text-[10px] font-bold text-slate-300 block mb-0.5">Crie sua Senha de Acesso</label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 dígitos (usará para logar no site)"
                      className="w-full bg-[#111726] border border-white/15 rounded-lg py-1.5 pl-2.5 pr-8 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#22c55e]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* ================= ULTRA-COMPACT ORDER BUMPS ================= */}
              <div className="space-y-1.5 pb-1">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1">
                    <Flame size={12} className="text-amber-400" />
                    <span>Turbine sua Operação (Order Bumps)</span>
                  </div>
                  <span className="text-[9px] text-[#4ade80] font-black bg-[#22c55e]/15 px-1.5 py-0.5 rounded-full border border-[#22c55e]/30">
                    Desconto de até 80%
                  </span>
                </div>

                <div className="space-y-1.5">
                  {AVAILABLE_ORDER_BUMPS.map((bump) => {
                    const isSelected = selectedBumps.includes(bump.id);
                    return (
                      <div
                        key={bump.id}
                        onClick={() => toggleBump(bump.id)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-2.5 ${
                          isSelected
                            ? 'bg-[#22c55e]/15 border-[#22c55e] shadow-md shadow-[#22c55e]/15'
                            : 'bg-white/[0.02] border-white/10 hover:border-white/20 opacity-85'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          {/* Custom Checkbox */}
                          <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? 'bg-[#22c55e] border-[#22c55e]' : 'border-white/30 bg-black/40'
                          }`}>
                            {isSelected && <Check size={11} className="text-black stroke-[3]" />}
                          </div>

                          {/* Bump Neon Icon Thumbnail */}
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/50 border border-[#22c55e]/30 flex-shrink-0">
                            <img
                              src={bump.image}
                              alt={bump.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-[8px] font-black px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 shrink-0">
                                {bump.tag}
                              </span>
                              <h4 className="text-xs font-bold text-white truncate">
                                {bump.title}
                              </h4>
                            </div>
                            <p className="text-[10px] text-slate-400 line-clamp-1 leading-tight">
                              {bump.shortDesc}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-red-500 font-bold line-through decoration-red-500 block">
                            de R$ {bump.originalPrice.toFixed(2).replace('.', ',')}
                          </span>
                          <span className="text-xs font-black text-[#4ade80]">
                            por R$ {bump.price.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Docked Action Footer (Always 100% visible on mobile) */}
            <div className="shrink-0 p-3 sm:p-4 bg-[#090d17]/95 backdrop-blur-md border-t border-white/10 space-y-2 z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-slate-400 text-[11px]">Total com descontos:</span>
                <span className="text-lg sm:text-xl font-black text-[#22c55e]">
                  R$ {totalPrice.toFixed(2).replace('.', ',')}
                </span>
              </div>

              {apiError && (
                <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-200 text-xs leading-relaxed flex items-start gap-2 animate-in fade-in">
                  <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-200/90 leading-snug">{apiError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-[#080c14] font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#22c55e]/25 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Gerando Pix Seguro...</span>
                  </div>
                ) : (
                  <>
                    <QrCode size={18} />
                    <span>GERAR PIX • R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[9px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={11} className="text-[#22c55e]" /> Pagamento 100% Seguro via Pix Instantâneo
                </span>
                <span>•</span>
                <span>Liberação Automática</span>
              </div>
            </div>
          </form>
        )}

        {/* ================= STEP 2: PIX QR CODE & PAYMENT ================= */}
        {step === 'pix' && pixData && (
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Pinned Header */}
            <div className="px-4 pt-4 pb-2.5 sm:px-6 sm:pt-5 sm:pb-3 shrink-0 border-b border-white/5 pr-14 text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#22c55e]/15 text-[#4ade80] border border-[#22c55e]/30 text-[10px] font-bold mb-1">
                <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" />
                <span>Pix Gerado • Aguardando Pagamento</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Escaneie o QR Code ou Copie o Código
              </h2>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-3 sm:px-6 sm:py-4 space-y-3.5 text-center [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
              {/* QR Code Container (Responsive & Clear) */}
              <div className="flex flex-col items-center justify-center">
                <div className="p-2.5 bg-white rounded-2xl shadow-xl shadow-[#22c55e]/20 border-2 border-[#22c55e]">
                  <img 
                    src={pixData.qrCodeImage} 
                    alt="QR Code Pix"
                    className="w-32 h-32 sm:w-40 sm:h-40 object-contain"
                  />
                </div>

                <div className="mt-2 flex items-center gap-1 text-xs text-slate-300">
                  <span>Valor:</span>
                  <strong className="text-base text-[#4ade80] font-black">
                    R$ {totalPrice.toFixed(2).replace('.', ',')}
                  </strong>
                </div>
              </div>

              {/* Pix Copia e Cola */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block text-left">
                  Código Pix Copia e Cola:
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={pixData.qrCodeText}
                    className="flex-1 bg-[#111726] border border-white/15 rounded-lg py-2 px-2.5 text-[11px] text-slate-300 font-mono select-all focus:outline-none truncate"
                  />
                  <button
                    type="button"
                    onClick={copyPixCode}
                    className="py-2 px-3 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-black font-black text-xs uppercase flex items-center gap-1 shrink-0 shadow-md shadow-[#22c55e]/20 transition-all active:scale-95 cursor-pointer"
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Docked Action Footer */}
            <div className="shrink-0 p-3 sm:p-4 bg-[#090d17]/95 backdrop-blur-md border-t border-white/10 space-y-2 z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
              <button
                type="button"
                disabled={isConfirming}
                onClick={handleConfirmPayment}
                className="w-full py-3.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-black font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#22c55e]/25 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isConfirming ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Liberando seu Acesso...</span>
                  </div>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>JÁ FIZ O PIX • LIBERAR MINHA CONTA</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-[11px] text-slate-400 hover:text-white underline font-semibold block mx-auto cursor-pointer py-0.5"
              >
                ← Voltar e alterar dados ou plano
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: SUCCESS & CREDENTIALS ================= */}
        {step === 'success' && (
          <div className="flex flex-col flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 text-center space-y-3.5 justify-center [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
            <div className="w-12 h-12 rounded-full bg-[#22c55e]/20 border-2 border-[#22c55e] flex items-center justify-center mx-auto text-[#22c55e] shadow-lg shadow-[#22c55e]/30">
              <CheckCircle2 size={28} />
            </div>

            <h2 className="text-lg sm:text-xl font-black text-white">
              Conta Criada & Acesso Liberado!
            </h2>
            <p className="text-[11px] text-slate-300 max-w-xs mx-auto leading-relaxed">
              Seu pagamento foi confirmado e todos os recursos VIP foram liberados na sua conta.
            </p>

            {/* Display Credentials */}
            <div className="p-3.5 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/30 text-xs text-left space-y-1.5 max-w-sm w-full mx-auto">
              <div className="font-black text-[#4ade80] text-[11px] flex items-center gap-1">
                <Lock size={12} /> Seus Dados de Acesso:
              </div>
              <div className="text-slate-300 text-[11px] flex items-center justify-between">
                <span>E-mail:</span>
                <strong className="text-white font-mono">{email}</strong>
              </div>
              <div className="text-slate-300 text-[11px] flex items-center justify-between">
                <span>Senha:</span>
                <strong className="text-[#4ade80] font-mono">{password || '••••••••'}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                window.location.href = '/';
              }}
              className="w-full max-w-sm mx-auto py-3.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-[#22c55e]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>ACESSAR MEU PAINEL AGORA</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

