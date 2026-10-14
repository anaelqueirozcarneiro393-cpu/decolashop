'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  ShoppingBag, 
  TrendingUp, 
  Eye, 
  Clock, 
  CheckCircle2, 
  Zap, 
  Lock,
  X,
  Copy,
  Check,
  QrCode,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Receipt,
  Mail,
  Globe
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSales, formatSaleTime } from '@/lib/salesContext';
import { useRegionCurrency } from '@/lib/regionState';
import { useSession } from 'next-auth/react';

export default function FinanceiroView() {
  const { data: session } = useSession();
  const { 
    saldoDisponivel, 
    vendasTotais, 
    pedidos, 
    cliques, 
    taxaAntecipacao, 
    recentSales,
    saldoDisponivelUSD,
    vendasTotaisUSD,
    pedidosUSD,
    cliquesUSD,
    recentSalesUSD
  } = useSales();
  const { currency, isUsd, setCurrency } = useRegionCurrency();

  const [pixType, setPixType] = useState('CPF');
  const [pixKey, setPixKey] = useState('000.000.000-00');
  const [withdrawAmount, setWithdrawAmount] = useState('0,00');
  const [intlMethod, setIntlMethod] = useState<'PAYPAL' | 'WISE' | 'SWIFT'>('PAYPAL');
  const [intlAccount, setIntlAccount] = useState('');
  const [intlWithdrawAmount, setIntlWithdrawAmount] = useState('0,00');
  const [isProcessing, setIsProcessing] = useState(false);

  // Estados do Modal Pix da Taxa e Confirmação de Saque
  const [showWithdrawConfirmModal, setShowWithdrawConfirmModal] = useState(false);
  const [showFirstWithdrawalModal, setShowFirstWithdrawalModal] = useState(false);
  const [hasCompletedFirstWithdrawal, setHasCompletedFirstWithdrawal] = useState(false);
  const [activeFee, setActiveFee] = useState<number>(150);
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixData, setPixData] = useState<{
    qrCodeText: string;
    qrCodeImage: string;
    transactionId: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isAnticipated, setIsAnticipated] = useState(false);
  const [countdown, setCountdown] = useState(899);

  // Estados de cálculo dinâmico da Carência de 30 dias baseado na data de criação da conta
  const [accountCreatedAt, setAccountCreatedAt] = useState<number | null>(null);
  const [elapsedDays, setElapsedDays] = useState<number>(0);
  const [elapsedDaysDisplay, setElapsedDaysDisplay] = useState<number>(1);
  const [daysRemaining, setDaysRemaining] = useState<number>(30);
  const [carenciaPercent, setCarenciaPercent] = useState<number>(3.3);
  const [isCarenciaCompleted, setIsCarenciaCompleted] = useState<boolean>(false);

  useEffect(() => {
    if (!showFirstWithdrawalModal) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 899));
    }, 1000);
    return () => clearInterval(interval);
  }, [showFirstWithdrawalModal]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const userEmail = 
    session?.user?.email?.toLowerCase().trim() || 
    (typeof window !== 'undefined' ? (localStorage.getItem('decolashop_user_email') || localStorage.getItem('decolashop_active_user_email') || '').toLowerCase().trim() : '') ||
    'usuario@decolashop.com';
  const [userWithdrawEmail, setUserWithdrawEmail] = useState<string>(() => {
    if (session?.user?.email) return session.user.email;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('decolashop_user_email') || localStorage.getItem('decolashop_active_user_email') || '';
    }
    return '';
  });

  useEffect(() => {
    const valid = 
      session?.user?.email || 
      (typeof window !== 'undefined' ? (localStorage.getItem('decolashop_user_email') || localStorage.getItem('decolashop_active_user_email')) : '');
    if (valid) {
      setUserWithdrawEmail(valid);
    }
  }, [session]);
  const userRole = (session?.user as any)?.role || '';
  const cleanEmailKey = userEmail.replace(/[^a-z0-9]/g, '_');

  const isGerenteOrAdmin = 
    userEmail === 'gerente@decolashop.com' || 
    userEmail === 'admin@decolashop.com' ||
    userEmail.startsWith('gerente@') ||
    userEmail.includes('gerente') ||
    userEmail.includes('admin') ||
    userRole === 'gerente' ||
    userRole === 'admin';

  // Métricas de taxas de saque pagas (Exclusivo Gerente)
  const [managerFeesData, setManagerFeesData] = useState<{
    totalCount: number;
    totalAmount: number;
    fees: Array<{
      id: string;
      transactionId?: string;
      customerEmail: string;
      customerName?: string;
      amount: number;
      paidAt: number;
      status: string;
    }>;
  }>({ totalCount: 0, totalAmount: 0, fees: [] });
  const [showManagerFeesModal, setShowManagerFeesModal] = useState(false);
  const [managerFeesLoading, setManagerFeesLoading] = useState(false);

  const fetchManagerFees = () => {
    if (!isGerenteOrAdmin) return;
    setManagerFeesLoading(true);
    fetch(`/api/gerente/taxas-saque?email=${encodeURIComponent(userEmail)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setManagerFeesData({
            totalCount: data.totalCount || 0,
            totalAmount: data.totalAmount || 0,
            fees: data.fees || []
          });
        }
      })
      .catch(() => {})
      .finally(() => setManagerFeesLoading(false));
  };

  useEffect(() => {
    if (isGerenteOrAdmin) {
      fetchManagerFees();
      const interval = setInterval(fetchManagerFees, 10000);
      return () => clearInterval(interval);
    }
  }, [isGerenteOrAdmin, userEmail]);

  // Notificação automática ao atingir R$ 250 de saldo líquido
  const [hasNotifiedUnlock, setHasNotifiedUnlock] = useState(false);

  useEffect(() => {
    try {
      const savedNotified = localStorage.getItem(`decolashop_notified_unlock_250_${cleanEmailKey}`);
      if (savedNotified === 'true') {
        setHasNotifiedUnlock(true);
        return;
      }
    } catch {}

    if (saldoDisponivel >= 250 && !isAnticipated && !hasNotifiedUnlock) {
      setHasNotifiedUnlock(true);
      try {
        localStorage.setItem(`decolashop_notified_unlock_250_${cleanEmailKey}`, 'true');
      } catch {}

      toast.success(
        '🎉 Parabéns! Você atingiu R$ 250,00 de saldo líquido e seu saque já está disponível para liberação imediata!',
        {
          duration: 8000,
          icon: '🚀',
          style: {
            background: '#0d121f',
            color: '#fff',
            border: '2px solid #22c55e',
            boxShadow: '0 0 30px rgba(34,197,94,0.4)',
            fontWeight: 'bold',
            fontSize: '13px'
          }
        }
      );
    }
  }, [saldoDisponivel, isAnticipated, hasNotifiedUnlock, cleanEmailKey]);

  // Carrega status de antecipação salvo (localStorage isolado por e-mail + transferência admin/gerente + cloud sync)
  useEffect(() => {
    try {
      // Remove resquício de chave global antiga para evitar contaminação entre contas
      localStorage.removeItem('decolashop_saldo_antecipado');

      const isGerenteOrAdmin = userEmail === 'gerente@decolashop.com' || userEmail === 'admin@decolashop.com';
      const savedUser = localStorage.getItem(`decolashop_saldo_antecipado_${cleanEmailKey}`);
      const savedPaid = localStorage.getItem(`decolashop_saldo_antecipado_pago_${cleanEmailKey}`);
      const savedFirstWithdrawal = localStorage.getItem(`decolashop_has_withdrawn_${cleanEmailKey}`);
      if (savedFirstWithdrawal === 'true' || savedPaid === 'true') {
        setHasCompletedFirstWithdrawal(true);
      }
      const savedAdmin = isGerenteOrAdmin ? localStorage.getItem('decolashop_saldo_antecipado_admin_decolashop_com') : null;
      const savedGerente = isGerenteOrAdmin ? localStorage.getItem('decolashop_saldo_antecipado_gerente_decolashop_com') : null;
      const sessionBumps = (session?.user as any)?.order_bumps || [];

      // Se for membro comum e não houver confirmação real de pagamento efetuado, mantém o estado normal (carência de 30 dias)
      if (!isGerenteOrAdmin && savedUser === 'true' && savedPaid !== 'true') {
        localStorage.removeItem(`decolashop_saldo_antecipado_${cleanEmailKey}`);
        setIsAnticipated(false);
        return;
      }

      if (
        savedPaid === 'true' || 
        (isGerenteOrAdmin && (savedUser === 'true' || savedAdmin === 'true' || savedGerente === 'true')) ||
        sessionBumps.includes('taxa_antecipacao')
      ) {
        setIsAnticipated(true);
        if (isGerenteOrAdmin) {
          try {
            localStorage.setItem('decolashop_saldo_antecipado_gerente_decolashop_com', 'true');
            localStorage.setItem('decolashop_saldo_antecipado_admin_decolashop_com', 'true');
          } catch {}
        }
        return;
      }

      // Consulta na nuvem se a taxa já foi paga em outro dispositivo
      fetch(`/api/user/sync-state?email=${encodeURIComponent(userEmail)}`)
        .then(res => res.json())
        .then(data => {
          if (data?.data?.isAnticipated) {
            // Membro normal só ativa via nuvem se isAnticipatedPaid for true
            if (!isGerenteOrAdmin && data.data?.isAnticipatedPaid !== true) {
              return;
            }
            setIsAnticipated(true);
            try {
              localStorage.setItem(`decolashop_saldo_antecipado_${cleanEmailKey}`, 'true');
              localStorage.setItem(`decolashop_saldo_antecipado_pago_${cleanEmailKey}`, 'true');
              if (isGerenteOrAdmin) {
                localStorage.setItem('decolashop_saldo_antecipado_gerente_decolashop_com', 'true');
                localStorage.setItem('decolashop_saldo_antecipado_admin_decolashop_com', 'true');
              }
            } catch {}
          }
        })
        .catch(() => {});
    } catch {
      // ignore
    }
  }, [userEmail, cleanEmailKey, session]);

  // Carrega e sincroniza a data de criação da conta para cálculo em tempo real da carência
  useEffect(() => {
    if (!userEmail) return;

    let isMounted = true;

    const applyCreationTimestamp = (ts: number) => {
      if (!isMounted || !ts || isNaN(ts) || ts <= 0) return;
      setAccountCreatedAt(ts);
      try {
        localStorage.setItem(`decolashop_account_created_${cleanEmailKey}`, String(ts));
      } catch {}

      const now = Date.now();
      const elapsedMs = Math.max(0, now - ts);
      const days = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
      const remaining = Math.max(0, 30 - days);
      const displayDay = Math.min(30, Math.max(1, days + 1));
      const percent = remaining === 0 ? 100 : Math.min(99, Math.max(3.3, Math.round(((30 - remaining) / 30) * 100)));
      const completed = remaining === 0;

      setElapsedDays(days);
      setElapsedDaysDisplay(displayDay);
      setDaysRemaining(remaining);
      setCarenciaPercent(percent);
      setIsCarenciaCompleted(completed);
    };

    // 1. Tenta recuperar do localStorage local deste cliente
    let savedLocalTs: number | null = null;
    try {
      const stored = localStorage.getItem(`decolashop_account_created_${cleanEmailKey}`) ||
                     localStorage.getItem(`decolashop_user_created_at_${cleanEmailKey}`);
      if (stored) {
        const num = Number(stored);
        if (!isNaN(num) && num > 0) {
          savedLocalTs = num;
          applyCreationTimestamp(num);
        }
      }
    } catch {}

    // 2. Consulta data oficial no servidor / banco Supabase
    fetch(`/api/user/account-created?email=${encodeURIComponent(userEmail)}`)
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        if (data?.success && typeof data.accountCreatedAt === 'number' && data.accountCreatedAt > 0) {
          // Se o servidor tiver a data original ou anterior à local, adota a mais antiga (mais fiel à criação)
          const chosenTs = savedLocalTs ? Math.min(savedLocalTs, data.accountCreatedAt) : data.accountCreatedAt;
          applyCreationTimestamp(chosenTs);
          // Se a data local era mais antiga que a do servidor, sincroniza no servidor
          if (savedLocalTs && savedLocalTs < data.accountCreatedAt) {
            fetch('/api/user/account-created', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: userEmail, accountCreatedAt: chosenTs })
            }).catch(() => {});
          }
          return;
        }

        // 3. Fallback: Se não encontrou no endpoint específico, consulta sync-state
        fetch(`/api/user/sync-state?email=${encodeURIComponent(userEmail)}`)
          .then(r => r.json())
          .then(syncData => {
            if (!isMounted) return;
            const syncTs = syncData?.accountCreatedAt || syncData?.data?.accountCreatedAt;
            if (typeof syncTs === 'number' && syncTs > 0) {
              const chosenTs = savedLocalTs ? Math.min(savedLocalTs, syncTs) : syncTs;
              applyCreationTimestamp(chosenTs);
              fetch('/api/user/account-created', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail, accountCreatedAt: chosenTs })
              }).catch(() => {});
              return;
            }

            // 4. Fallback: Menor timestamp entre as vendas recentes registradas
            if (recentSales && recentSales.length > 0) {
              const saleTimes = recentSales
                .map(s => s.timestamp)
                .filter((t): t is number => typeof t === 'number' && t > 0);
              if (saleTimes.length > 0) {
                const earliestSale = Math.min(...saleTimes);
                const chosenTs = savedLocalTs ? Math.min(savedLocalTs, earliestSale) : earliestSale;
                applyCreationTimestamp(chosenTs);
                fetch('/api/user/account-created', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: userEmail, accountCreatedAt: chosenTs })
                }).catch(() => {});
                return;
              }
            }

            if (savedLocalTs) {
              // Persiste o savedLocalTs existente no banco Supabase
              fetch('/api/user/account-created', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail, accountCreatedAt: savedLocalTs })
              }).catch(() => {});
              return;
            }

            // 5. Fallback final: Usuário novo criado agora
            const freshNow = Date.now();
            applyCreationTimestamp(freshNow);
            fetch('/api/user/account-created', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: userEmail, accountCreatedAt: freshNow })
            }).catch(() => {});
          })
          .catch(() => {});
      })
      .catch(() => {
        if (!isMounted) return;
        if (!savedLocalTs) {
          const freshNow = Date.now();
          applyCreationTimestamp(freshNow);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [userEmail, cleanEmailKey, recentSales]);

  const currentSaldo = isUsd ? saldoDisponivelUSD : saldoDisponivel;
  const currentVendas = isUsd ? vendasTotaisUSD : vendasTotais;
  const currentPedidos = isUsd ? pedidosUSD : pedidos;
  const currentCliques = isUsd ? cliquesUSD : cliques;
  const currentRecentSales = isUsd ? recentSalesUSD : recentSales;
  const currentSymbol = isUsd ? 'US$' : 'R$';
  const averageCommission = currentPedidos > 0 
    ? (currentSaldo / currentPedidos).toFixed(2).replace('.', ',') 
    : '0,00';

  const handleAntecipacao = async (customFee?: number) => {
    const feeToCharge = typeof customFee === 'number' && customFee > 0 ? customFee : (taxaAntecipacao > 0 ? taxaAntecipacao : 150);
    setActiveFee(feeToCharge);

    if (saldoDisponivel < 250 || feeToCharge <= 0) {
      toast.error('Você precisa de no mínimo R$ 250,00 de saldo líquido para antecipar.');
      setShowWithdrawConfirmModal(false);
      setShowFirstWithdrawalModal(false);
      return;
    }

    const emailToSend = (
      userWithdrawEmail ||
      session?.user?.email ||
      (typeof window !== 'undefined' ? (localStorage.getItem('decolashop_user_email') || localStorage.getItem('decolashop_active_user_email') || '') : '')
    ).trim().toLowerCase();

    if (!emailToSend || !emailToSend.includes('@')) {
      toast.error('Por favor, informe seu e-mail para geração da chave Pix de liberação.');
      setShowFirstWithdrawalModal(true);
      return;
    }

    setIsProcessing(true);
    
    const userCpf = 
      (session?.user as any)?.cpf || 
      (typeof window !== 'undefined' ? localStorage.getItem('decolashop_user_cpf') : null) || 
      '39151747805';

    const userNameToSend = 
      session?.user?.name || 
      (typeof window !== 'undefined' ? localStorage.getItem('decolashop_user_name') : null) || 
      'Cliente DecolaShop';

    const userPhoneToSend = 
      (session?.user as any)?.phone || 
      (typeof window !== 'undefined' ? localStorage.getItem('decolashop_user_phone') : null) || 
      '11999999999';

    try {
      const response = await fetch('/api/sigilopay/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: 'taxa_antecipacao',
          planPrice: feeToCharge,
          total: feeToCharge,
          customer: {
            name: userNameToSend,
            email: emailToSend,
            cpf: userCpf,
            phone: userPhoneToSend
          }
        })
      });

      const res = await response.json();

      if (res.success && res.pix) {
        setPixData(res.pix);
        setShowWithdrawConfirmModal(false);
        setShowFirstWithdrawalModal(false);
        setShowPixModal(true);
        toast.success(`Chave Pix gerada para pagamento da taxa de R$ ${feeToCharge.toFixed(2).replace('.', ',')}!`);
      } else {
        toast.error(res.error || 'Erro ao gerar Pix da taxa. Tente novamente.');
      }
    } catch {
      toast.error('Erro de conexão ao gerar chave Pix da taxa.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyPixCode = () => {
    if (!pixData?.qrCodeText) return;
    navigator.clipboard.writeText(pixData.qrCodeText);
    setCopied(true);
    toast.success('Chave Pix Copia e Cola copiada com sucesso!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleConfirmAntecipacao = async () => {
    setIsConfirming(true);
    try {
      const confirmRes = await fetch('/api/sigilopay/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session?.user?.email || '',
          plan: 'taxa_antecipacao',
          transactionId: pixData?.transactionId
        })
      });

      const confirmData = await confirmRes.json();

      if (!confirmRes.ok || !confirmData.success) {
        toast.error(confirmData.error || 'Pagamento via PIX ainda não identificado. Conclua a transferência no app do seu banco e tente novamente em instantes.');
        return;
      }

      setIsAnticipated(true);
      setHasCompletedFirstWithdrawal(true);
      try {
        localStorage.setItem(`decolashop_saldo_antecipado_${cleanEmailKey}`, 'true');
        localStorage.setItem(`decolashop_saldo_antecipado_pago_${cleanEmailKey}`, 'true');
        localStorage.setItem(`decolashop_has_withdrawn_${cleanEmailKey}`, 'true');
        if (userEmail === 'gerente@decolashop.com' || userEmail === 'admin@decolashop.com') {
          localStorage.setItem('decolashop_saldo_antecipado_gerente_decolashop_com', 'true');
          localStorage.setItem('decolashop_saldo_antecipado_admin_decolashop_com', 'true');
        }
      } catch {}

      // Sincroniza liberação com a nuvem mantendo faturamento e saldo 100% preservados
      fetch('/api/user/sync-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          state: {
            vendasTotais,
            saldoDisponivel,
            pedidos,
            cliques,
            recentSales,
            isAnticipated: true,
            isAnticipatedPaid: true,
            lastActiveTimestamp: Date.now()
          }
        })
      }).catch(() => {});

      setShowPixModal(false);
      toast.success('🎉 Pagamento da taxa confirmado! Seu saldo de comissões foi liberado imediatamente para saque.');
    } catch {
      toast.error('Erro ao verificar pagamento. Tente novamente.');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500 font-sans text-slate-100 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22c55e]/15 text-[#4ade80] text-[11px] font-black uppercase tracking-wider mb-2 border border-[#22c55e]/30 shadow-[0_0_10px_rgba(34,197,94,0.15)]">
          <span>$</span>
          <span>CONTROLE DE COMISSÕES</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Financeiro</h1>
        <p className="text-xs text-slate-400 mt-1">
          Acompanhe suas vendas, comissões recebidas e solicite saques diretamente para sua conta.
        </p>
      </div>

      {/* Seletor de Carteira: Brasil (R$) vs Internacional (US$) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-[#0d121f]/90 border border-white/10 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
            isUsd 
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
              : 'bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/40 shadow-[0_0_15px_rgba(34,197,94,0.25)]'
          }`}>
            <Wallet size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-black text-white">
                {isUsd ? 'Carteira Internacional (US$)' : 'Carteira Nacional (R$)'}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                isUsd 
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' 
                  : 'bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/40'
              }`}>
                {isUsd ? 'Saldo em Dólar' : 'Saldo em Reais'}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
              {isUsd 
                ? 'Saldos e comissões da operação internacional nos EUA e Europa (100% separados da carteira nacional).' 
                : 'Saldos e comissões das vendas de produtos com estoque nacional no Brasil.'}
            </p>
          </div>
        </div>

        {/* Toggle Switch Pills */}
        <div className="flex items-center p-1 rounded-xl bg-black/60 border border-white/10 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setCurrency('BRL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              !isUsd
                ? 'bg-[#22c55e] text-black shadow-md font-black'
                : 'text-slate-400 hover:text-white font-bold'
            }`}
          >
            <span>🇧🇷</span>
            <span>Carteira Nacional (R$)</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrency('USD')}
            className={`px-3.5 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              isUsd
                ? 'bg-blue-500 text-white shadow-md font-black shadow-blue-500/30'
                : 'text-slate-400 hover:text-white font-bold'
            }`}
          >
            <span>🇺🇸</span>
            <span>Carteira Internacional (US$)</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Saldo Disponível */}
        <div className="bg-[#0d121f]/90 rounded-3xl p-6 border border-white/10 shadow-xl backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${isUsd ? 'from-blue-500 to-cyan-400 shadow-[0_0_10px_#3b82f6]' : 'from-[#22c55e] to-[#4ade80] shadow-[0_0_10px_#22c55e]'}`} />
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              <Wallet size={14} className={isUsd ? 'text-blue-400' : 'text-[#22c55e]'} />
              <span>SALDO DISPONÍVEL {isUsd ? '(INTERNACIONAL)' : ''}</span>
            </div>
            <div className="flex items-baseline gap-1 my-2">
              <span className={`text-sm font-black ${isUsd ? 'text-blue-400' : 'text-[#4ade80]'}`}>{currentSymbol}</span>
              <span className="text-3xl font-black text-white">
                {currentSaldo.toLocaleString(isUsd ? 'en-US' : 'pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            {isUsd ? (
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-blue-500/30 bg-blue-500/15 text-[10px] font-bold text-blue-300 mb-2">
                <Globe size={11} />
                <span>CARTEIRA GLOBAL ATIVA • DÓLAR</span>
              </div>
            ) : isAnticipated ? (
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/15 text-[10px] font-bold text-[#4ade80] mb-2">
                <CheckCircle2 size={11} />
                <span>LIBERADO PARA SAQUE IMEDIATO</span>
              </div>
            ) : isCarenciaCompleted ? (
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/15 text-[10px] font-bold text-[#4ade80] mb-2">
                <CheckCircle2 size={11} />
                <span>CARÊNCIA DE 30 DIAS CONCLUÍDA • LIBERADO</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-[10px] font-bold text-amber-300 mb-2">
                <Clock size={11} />
                <span>{daysRemaining === 1 ? 'FALTA 1 DIA PARA SACAR' : `FALTAM ${daysRemaining} DIAS PARA SACAR`}</span>
              </div>
            )}
            <p className="text-[10px] text-slate-400">
              {isUsd
                ? 'Comissões internacionais de vendas nos EUA e Europa creditadas diretamente em Dólar (US$).'
                : isAnticipated 
                ? 'Carência eliminada com sucesso via antecipação' 
                : isCarenciaCompleted
                ? 'Prazo regulamentar de 30 dias cumprido: saldo liberado para saque'
                : `Liberação automática em ${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'} (Dia ${elapsedDaysDisplay} de 30)`}
            </p>
          </div>
          <p className="text-[10px] text-slate-500 mt-4 pt-3 border-t border-white/10">
            {isUsd ? 'Ganhos acumulados através de campanhas internacionais.' : 'Ganhos acumulados através de divulgações bem-sucedidas no Brasil.'}
          </p>
        </div>

        {/* Card 2: Vendas Realizadas */}
        <div className="bg-[#0d121f]/90 rounded-3xl p-6 border border-white/10 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              <ShoppingBag size={14} className="text-slate-400" />
              <span>{isUsd ? 'VENDAS GLOBAIS' : 'VENDAS REALIZADAS'}</span>
            </div>
            <div className="flex items-baseline gap-1.5 my-2">
              <span className="text-3xl font-black text-white">{currentPedidos}</span>
              <span className="text-xs font-bold text-slate-400">pedidos</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <span>Unidades: <strong className="text-white">{currentPedidos}</strong></span>
            <span>Vendas: <strong className="text-white">{currentSymbol} {currentVendas.toLocaleString(isUsd ? 'en-US' : 'pt-BR', { minimumFractionDigits: 2 })}</strong></span>
          </div>
        </div>

        {/* Card 3: Comissão Média */}
        <div className="bg-[#0d121f]/90 rounded-3xl p-6 border border-white/10 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              <TrendingUp size={14} className={isUsd ? 'text-blue-400' : 'text-[#22c55e]'} />
              <span>COMISSÃO MÉDIA</span>
            </div>
            <div className="flex items-baseline gap-1 my-2">
              <span className={`text-sm font-black ${isUsd ? 'text-blue-400' : 'text-[#4ade80]'}`}>{currentSymbol}</span>
              <span className="text-3xl font-black text-white">{averageCommission}</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-4 pt-3 border-t border-white/10">
            {isUsd ? 'Média de 32% por cada produto internacional vendido.' : 'Média de 32% por cada produto vendido no Brasil.'}
          </p>
        </div>

        {/* Card 4: Cliques Totais */}
        <div className="bg-[#0d121f]/90 rounded-3xl p-6 border border-white/10 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              <Eye size={14} className="text-cyan-400" />
              <span>{isUsd ? 'CLIQUES GLOBAIS' : 'CLIQUES TOTAIS'}</span>
            </div>
            <div className="flex items-baseline gap-1.5 my-2">
              <span className="text-3xl font-black text-white">{currentCliques.toLocaleString('pt-BR')}</span>
              <span className="text-xs font-bold text-slate-400">acessos</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-4 pt-3 border-t border-white/10">
            {isUsd ? 'Tráfego internacional gerado via anúncios em Dólar.' : 'Tráfego orgânico gerado via posts com IA.'}
          </p>
        </div>
      </div>

      {/* PAINEL EXCLUSIVO DO GERENTE: Taxas de Saque Pagas */}
      {isGerenteOrAdmin && (
        <div className="rounded-3xl p-6 md:p-8 bg-gradient-to-br from-[#0c1824] via-[#0d121f] to-[#111c2e] border-2 border-[#38bdf8]/40 shadow-2xl shadow-[#38bdf8]/10 relative overflow-hidden space-y-5 animate-in fade-in duration-300">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#38bdf8] via-[#0ea5e9] to-[#0284c7] shadow-[0_0_15px_#38bdf8]" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#38bdf8]/15 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8] shadow-[0_0_15px_rgba(56,189,248,0.2)] flex-shrink-0">
                <Receipt size={24} />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#38bdf8]/15 text-[#38bdf8] text-[10px] font-black uppercase tracking-wider mb-1 border border-[#38bdf8]/30">
                  <ShieldCheck size={11} />
                  <span>EXCLUSIVO CONTA GERENTE</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  Taxas de Saque Pagas
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/30 font-bold">
                    100% da Plataforma
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Controle de taxas de antecipação pagas pelos clientes. <strong className="text-slate-200">Zero comissão para afiliados</strong> (100% retido pela plataforma).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => {
                  fetchManagerFees();
                  setShowManagerFeesModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#38bdf8]/20 hover:bg-[#38bdf8]/30 text-[#38bdf8] border border-[#38bdf8]/40 text-xs font-bold transition-all cursor-pointer shadow-lg shadow-[#38bdf8]/10"
              >
                <Eye size={14} />
                <span>Ver Extrato Completo</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {/* Métrica 1: Quantidade de taxas pagas */}
            <div className="bg-[#080d18]/80 rounded-2xl p-4 border border-[#38bdf8]/20">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                QUANTIDADE DE TAXAS PAGAS
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-white">
                  {managerFeesData.totalCount}
                </span>
                <span className="text-xs font-bold text-[#38bdf8]">
                  {managerFeesData.totalCount === 1 ? 'taxa paga' : 'taxas pagas'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">
                Total de antecipações quitadas via Pix
              </p>
            </div>

            {/* Métrica 2: Faturamento Total com Taxas */}
            <div className="bg-[#080d18]/80 rounded-2xl p-4 border border-[#22c55e]/20">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                FATURAMENTO TOTAL COM TAXAS
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-black text-[#4ade80]">R$</span>
                <span className="text-2xl sm:text-3xl font-black text-white">
                  {managerFeesData.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">
                Receita líquida retida integralmente no cofre
              </p>
            </div>

            {/* Métrica 3: Blindagem de Afiliados */}
            <div className="bg-[#080d18]/80 rounded-2xl p-4 border border-emerald-500/20">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                BLINDAGEM DE AFILIADOS
              </span>
              <div className="flex items-center gap-1.5 my-1 text-emerald-400 font-black text-base sm:text-lg">
                <ShieldCheck size={18} />
                <span>100% Blindado</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">
                Taxas de saque jamais geram comissões a afiliados
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Carência & Antecipação Card */}
      <div className="bg-[#0d121f]/90 rounded-3xl p-6 md:p-8 border border-white/10 shadow-xl backdrop-blur-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock size={16} className={isAnticipated || isCarenciaCompleted ? "text-[#22c55e]" : "text-amber-400"} />
              <h3 className="text-sm font-extrabold text-white">
                {isAnticipated 
                  ? 'Carência Eliminada • Saldo Liberado' 
                  : isCarenciaCompleted
                  ? 'Carência Concluída • Saldo Liberado para Saque'
                  : `Carência de Pagamento • ${daysRemaining} ${daysRemaining === 1 ? 'Dia Restante' : 'Dias Restantes'}`}
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              {isAnticipated 
                ? 'Sua antecipação foi confirmada com sucesso! Você pode solicitar saques diretamente via PIX sem aguardar prazos.'
                : isCarenciaCompleted
                ? 'Parabéns! O período legal de 30 dias da sua conta foi integralmente concluído. Suas comissões estão liberadas para solicitação de saque.'
                : `Sua conta está ativa há ${elapsedDays} ${elapsedDays === 1 ? 'dia' : 'dias'}. Conforme as diretrizes das plataformas e marketplaces, as comissões possuem período de garantia de 30 dias. Utilize a antecipação para liberação imediata via Pix.`}
            </p>
          </div>

          {!isAnticipated && !isCarenciaCompleted && (
            <div className="flex flex-col items-end">
              <button
                onClick={() => {
                  if (saldoDisponivel < 250) {
                    toast.error('Antecipação bloqueada: você precisa de no mínimo R$ 250,00 de saldo líquido para solicitar o saque.', {
                      icon: '🔒',
                      style: {
                        background: '#0d121f',
                        color: '#fff',
                        border: '1px solid #ef4444'
                      }
                    });
                    return;
                  }
                  setShowWithdrawConfirmModal(true);
                }}
                disabled={isProcessing}
                className={
                  saldoDisponivel >= 250
                    ? "flex-shrink-0 flex items-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#22c55e] via-[#4ade80] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_30px_rgba(34,197,94,0.85)] border-2 border-[#86efac] animate-bounce cursor-pointer active:scale-95 transition-all"
                    : "flex-shrink-0 flex items-center gap-2 py-3 px-5 rounded-2xl bg-[#061a0e] border border-[#144726]/60 text-[#22c55e]/40 font-black text-xs uppercase tracking-wider cursor-not-allowed shadow-none select-none transition-all"
                }
              >
                <Zap size={14} fill={saldoDisponivel >= 250 ? "currentColor" : "none"} className={saldoDisponivel >= 250 ? "text-black" : "text-[#22c55e]/40"} />
                <span>
                  {isProcessing 
                    ? 'GERANDO PIX...' 
                    : 'ANTECIPAR SALDO AGORA (TAXA DE 7%)'}
                </span>
              </button>
              {saldoDisponivel < 250 && (
                <span className="text-[10px] text-slate-500 font-medium mt-1">
                  Liberado a partir de R$ 250,00 de saldo
                </span>
              )}
            </div>
          )}

          {!isAnticipated && isCarenciaCompleted && (
            <div className="flex-shrink-0 flex items-center gap-2 py-3 px-5 rounded-2xl bg-[#22c55e]/15 border border-[#22c55e]/40 text-[#4ade80] font-black text-xs uppercase tracking-wider">
              <CheckCircle2 size={16} className="text-[#22c55e]" />
              <span>CARÊNCIA DE 30 DIAS CUMPRIDA</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-1 pt-2">
          <div className="flex justify-between text-[11px] text-slate-400 font-medium">
            <span>
              {isAnticipated 
                ? 'Progresso da Carência: Liberado Imediatamente' 
                : isCarenciaCompleted
                ? 'Progresso da Carência: 30 de 30 Dias (Concluído)'
                : `Progresso da Carência: Dia ${elapsedDaysDisplay} de 30`}
            </span>
            <span className="text-[#4ade80] font-bold">
              {isAnticipated || isCarenciaCompleted ? '100% Liberado' : `${carenciaPercent}% Concluído`}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#22c55e] to-[#4ade80] rounded-full shadow-[0_0_10px_#22c55e] transition-all duration-500" 
              style={{ width: `${isAnticipated || isCarenciaCompleted ? 100 : Math.max(3.3, carenciaPercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Seção de Saque: Internacional (US$) vs Nacional (R$ com Carência/PIX) */}
      {isUsd ? (
        /* Solicitação de Saque Internacional (Dólar US$) */
        <div className="bg-[#0d121f]/90 rounded-3xl p-6 md:p-8 border border-blue-500/30 shadow-xl backdrop-blur-xl space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 text-[10px] font-black uppercase tracking-wider mb-2 border border-blue-500/30">
              <Globe size={11} />
              <span>SAQUE INTERNACIONAL (US$)</span>
            </div>
            <h3 className="text-sm font-extrabold text-white">
              Solicitar Saque da Carteira Global
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cadastre sua conta internacional (PayPal Global, Wise USD ou Transferência Bancária Swift) para recebimento das comissões em Dólar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Método de Recebimento</label>
              <select
                value={intlMethod}
                onChange={(e) => setIntlMethod(e.target.value as any)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-xs font-medium text-white focus:outline-none focus:border-blue-500"
              >
                <option value="PAYPAL">PayPal Global (E-mail)</option>
                <option value="WISE">Wise Multi-Currency (Chave/E-mail)</option>
                <option value="SWIFT">Wire Transfer / SWIFT (IBAN)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {intlMethod === 'PAYPAL' ? 'E-mail da Conta PayPal' : intlMethod === 'WISE' ? 'Chave ou E-mail Wise' : 'Código IBAN / Swift'}
              </label>
              <input
                type="text"
                value={intlAccount}
                onChange={(e) => setIntlAccount(e.target.value)}
                placeholder={intlMethod === 'PAYPAL' ? 'seu-email@paypal.com' : intlMethod === 'WISE' ? 'email-wise@exemplo.com' : 'IBAN BR32...'}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-xs font-medium text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300">Valor do Saque (US$)</label>
                <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-wide">Mínimo: US$ 500,00</span>
              </div>
              <input
                type="text"
                value={intlWithdrawAmount}
                onChange={(e) => setIntlWithdrawAmount(e.target.value)}
                placeholder="Mínimo US$ 500,00"
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-xs font-medium text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Lock size={12} className="text-blue-400" />
              <span>Transferências internacionais protegidas por conformidade KYC / AML global • Saque mínimo de US$ 500,00.</span>
            </span>

            <button
              type="button"
              disabled
              className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-white/5 border border-white/10 text-slate-500 font-extrabold text-xs uppercase tracking-wider cursor-not-allowed opacity-50 select-none pointer-events-none flex items-center justify-center gap-2"
              title="Função de saque temporariamente inativa"
            >
              <Lock size={13} className="text-slate-500" />
              <span>SOLICITAR SAQUE INTERNACIONAL (MÍN. US$ 500,00)</span>
            </button>
          </div>
        </div>
      ) : (
        /* Solicitação de Saque PIX Card (Nacional) */
        <div className="bg-[#0d121f]/90 rounded-3xl p-6 md:p-8 border border-white/10 shadow-xl backdrop-blur-xl space-y-6">
          <div>
            <h3 className="text-sm font-extrabold text-white">
              Solicitar Saque PIX
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cadastre sua chave PIX de mesma titularidade para transferências instantâneas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Tipo de Chave</label>
              <select
                value={pixType}
                onChange={(e) => setPixType(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-xs font-medium text-white focus:outline-none focus:border-[#22c55e]"
              >
                <option value="CPF">CPF</option>
                <option value="CNPJ">CNPJ</option>
                <option value="EMAIL">E-mail</option>
                <option value="TELEFONE">Telefone</option>
                <option value="ALEATORIA">Chave Aleatória</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Chave PIX</label>
              <input
                type="text"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="Digite sua chave PIX"
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-xs font-medium text-white focus:outline-none focus:border-[#22c55e]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300">Valor do Saque (R$)</label>
                <span className="text-[10px] text-[#22c55e] font-extrabold uppercase tracking-wide">Mínimo: R$ 2.000,00</span>
              </div>
              <input
                type="text"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Mínimo R$ 2.000,00"
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-xs font-medium text-white focus:outline-none focus:border-[#22c55e]"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Lock size={12} className="text-[#22c55e]" />
              <span>Transferências protegidas por criptografia de ponta a ponta BACEN • Saque mínimo de R$ 2.000,00.</span>
            </span>

            {/* Botão de Solicitar Saque PIX mantido 100% INATIVO conforme solicitado */}
            <button
              type="button"
              disabled
              className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-white/5 border border-white/10 text-slate-500 font-extrabold text-xs uppercase tracking-wider cursor-not-allowed opacity-50 select-none pointer-events-none flex items-center justify-center gap-2"
              title="Função de saque temporariamente inativa"
            >
              <Lock size={13} className="text-slate-500" />
              <span>SOLICITAR SAQUE PIX (MÍN. R$ 2.000,00)</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= EXTRATO DETALHADO DE VENDAS & COMISSÕES ================= */}
      <div className="bg-[#0d121f]/90 rounded-3xl p-6 md:p-8 border border-white/10 shadow-xl backdrop-blur-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full ${isUsd ? 'bg-blue-500/10 border border-blue-500/25 text-blue-300' : 'bg-[#22c55e]/10 border border-[#22c55e]/25 text-[#4ade80]'} text-[10px] font-black uppercase tracking-wider mb-1`}>
              <CheckCircle2 size={11} />
              <span>{isUsd ? 'Extrato Global em Tempo Real (US$)' : 'Extrato de Vendas em Tempo Real (R$)'}</span>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <span>Registro de Vendas e Comissões</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 font-semibold">
                {currentRecentSales.length} {currentRecentSales.length === 1 ? 'venda' : 'vendas'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isUsd 
                ? 'Histórico detalhado de cada venda internacional em Dólar vinculada à sua conta.'
                : 'Histórico detalhado de cada venda gerada pelo radar e campanhas de IA vinculadas à sua conta.'}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 px-3 py-1.5 rounded-2xl">
            <span className="text-[11px] text-slate-400 font-medium">Saldo a Receber:</span>
            <span className={`text-sm font-black ${isUsd ? 'text-blue-400' : 'text-[#4ade80]'}`}>
              {currentSymbol} {currentSaldo.toLocaleString(isUsd ? 'en-US' : 'pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {currentRecentSales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="pb-3 pl-2">Transação</th>
                  <th className="pb-3">Produto</th>
                  <th className="pb-3 text-center">Data / Hora</th>
                  <th className="pb-3 text-right">Valor Venda</th>
                  <th className="pb-3 text-right">Sua Comissão</th>
                  <th className="pb-3 text-right pr-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {currentRecentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-3.5 pl-2 font-mono text-[11px] font-bold text-slate-400">
                      {sale.id}
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2.5 max-w-xs sm:max-w-sm">
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 bg-slate-900 shrink-0">
                          {sale.image ? (
                            <img 
                              src={sale.image} 
                              alt={sale.product} 
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                            />
                          ) : (
                            <ShoppingBag size={14} className="m-auto text-slate-500 mt-2" />
                          )}
                        </div>
                        <span className={`font-bold text-white truncate ${isUsd ? 'group-hover:text-blue-400' : 'group-hover:text-[#4ade80]'} transition-colors`} title={sale.product}>
                          {sale.product}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 text-center text-slate-400 font-medium text-[11px]">
                      {formatSaleTime(sale.timestamp, sale.time)}
                    </td>
                    <td className="py-3.5 text-right font-semibold text-slate-300">
                      {currentSymbol} {sale.value.toFixed(2).replace('.', ',')}
                    </td>
                    <td className={`py-3.5 text-right font-black ${isUsd ? 'text-blue-400' : 'text-[#4ade80]'}`}>
                      + {currentSymbol} {sale.commission.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-3.5 text-right pr-2">
                      {isUsd ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                          <CheckCircle2 size={10} />
                          <span>Global Liberado</span>
                        </span>
                      ) : isAnticipated || isCarenciaCompleted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-[#22c55e]/15 text-[#4ade80] border border-[#22c55e]/30">
                          <CheckCircle2 size={10} />
                          <span>Liberado</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <Clock size={10} />
                          <span>Em Carência ({daysRemaining}D)</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 space-y-2 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
            <ShoppingBag size={28} className="mx-auto text-slate-500 opacity-60" />
            <p className="text-xs font-semibold text-slate-300">Nenhuma venda registrada ainda</p>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              As vendas geradas pelo piloto automático e por campanhas de IA aparecerão detalhadas aqui a cada nova aprovação.
            </p>
          </div>
        )}
      </div>

      {/* ================= POP-UP SUPER CHAMATIVO DE CONFIRMAÇÃO DE SAQUE ================= */}
      {showWithdrawConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#0d121f] border-2 border-[#22c55e] rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(34,197,94,0.35)] text-center text-white space-y-6 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Efeitos Glow de Fundo */}
            <div className="absolute -top-24 -left-24 w-52 h-52 bg-[#22c55e]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-52 h-52 bg-[#4ade80]/20 rounded-full blur-3xl pointer-events-none" />

            {/* Fechar */}
            <button
              onClick={() => setShowWithdrawConfirmModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer z-10"
            >
              <X size={20} />
            </button>

            {/* Selo Chamativo */}
            <div className="relative z-10 flex justify-center">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/40 text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(34,197,94,0.25)]">
                <Sparkles size={14} className="text-[#22c55e]" />
                <span>Saque Imediato Disponível</span>
              </div>
            </div>

            {/* Pergunta Exigida */}
            <div className="relative z-10 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                Deseja sacar seu lucro agora?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-sm mx-auto">
                Suas comissões acumuladas estão prontas para serem transferidas diretamente para sua conta bancária.
              </p>
            </div>

            {/* Card Focado EXCLUSIVAMENTE no Valor Líquido a Sacar */}
            <div className="relative z-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#22c55e]/15 to-[#22c55e]/5 border-2 border-[#22c55e]/50 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
              <span className="text-[11px] sm:text-xs font-black text-[#4ade80] uppercase tracking-widest block mb-2">
                VALOR LÍQUIDO PARA SER SACADO
              </span>
              <div className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#22c55e] via-[#4ade80] to-[#86efac] drop-shadow-[0_0_25px_rgba(34,197,94,0.5)] py-1">
                R$ {saldoDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                <CheckCircle2 size={14} className="text-[#22c55e]" />
                <span>100% liberado • Transferência instantânea via Pix</span>
              </div>
            </div>

            {/* Botão de Confirmação Super Chamativo */}
            <div className="relative z-10 space-y-2 pt-1">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => {
                  if (saldoDisponivel < 250) {
                    toast.error('Você precisa de no mínimo R$ 250,00 de saldo líquido.');
                    setShowWithdrawConfirmModal(false);
                    return;
                  }
                  setShowWithdrawConfirmModal(false);
                  if (!hasCompletedFirstWithdrawal) {
                    setShowFirstWithdrawalModal(true);
                  } else {
                    handleAntecipacao(taxaAntecipacao);
                  }
                }}
                className="w-full py-4 sm:py-5 px-6 rounded-2xl bg-gradient-to-r from-[#22c55e] via-[#4ade80] to-[#22c55e] hover:brightness-110 text-black font-black text-sm sm:text-base uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-[0_0_35px_rgba(34,197,94,0.55)] transition-all active:scale-95 disabled:opacity-60 cursor-pointer animate-pulse"
              >
                <span>SIM, QUERO SACAR MEU LUCRO AGORA 🚀</span>
                <ArrowRight size={20} strokeWidth={3} />
              </button>

              <button
                type="button"
                onClick={() => setShowWithdrawConfirmModal(false)}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-300 font-semibold transition-colors cursor-pointer py-1.5"
              >
                Agora não, continuar acumulando vendas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= NOVO POP-UP: PRIMEIRO SAQUE COM OS 3 GATILHOS ================= */}
      {showFirstWithdrawalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#0d121f] border-2 border-[#22c55e] rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(34,197,94,0.35)] text-center text-white space-y-5 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Efeitos Glow de Fundo */}
            <div className="absolute -top-24 -left-24 w-52 h-52 bg-[#22c55e]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-52 h-52 bg-[#4ade80]/20 rounded-full blur-3xl pointer-events-none" />

            {/* Fechar */}
            <button
              onClick={() => setShowFirstWithdrawalModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer z-10"
            >
              <X size={20} />
            </button>

            {/* Selo e Gatilho 1: URGÊNCIA ARTIFICIAL (Cronômetro Regressivo) */}
            <div className="relative z-10 flex flex-col items-center gap-1.5">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/40 text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(34,197,94,0.25)]">
                <Sparkles size={14} className="text-[#22c55e]" />
                <span>Primeiro Saque da Conta</span>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/35 text-rose-400 text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(244,63,94,0.2)] animate-pulse mt-1">
                <Clock size={13} className="text-rose-400 shrink-0" />
                <span>Taxa promocional expira em: <strong className="font-mono text-white text-xs">{formatTimer(countdown)}</strong></span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Após o término do prazo, a taxa volta para o valor normal de R$ 250,00</span>
            </div>

            {/* Título Principal */}
            <div className="relative z-10 space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                Liberação do 1º Saque
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-md mx-auto leading-relaxed">
                Como este é o seu <strong>primeiro saque</strong>, sua taxa de liberação foi reduzida para apenas <strong className="text-[#4ade80]">R$ 150,00</strong>.
              </p>
            </div>

            {/* Gatilho 2: ÂNCORA DE COMPARAÇÃO (Pague R$ 150 → Receba no Pix) */}
            <div className="relative z-10 p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-[#22c55e]/15 to-[#22c55e]/5 border-2 border-[#22c55e]/50 shadow-[0_0_30px_rgba(34,197,94,0.2)] space-y-3.5">
              <div className="grid grid-cols-2 gap-3 items-center bg-black/45 rounded-2xl p-3.5 border border-white/10 text-left">
                <div>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Você Paga Hoje:</span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-white">R$ 150</span>
                    <span className="text-xs text-slate-500 line-through">R$ 250</span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-bold block mt-0.5">Taxa única promocional</span>
                </div>

                <div className="border-l border-white/10 pl-3">
                  <span className="text-[10px] text-[#4ade80] font-extrabold uppercase tracking-wider block">Você Recebe no Pix:</span>
                  <div className="text-2xl sm:text-3xl font-black text-[#22c55e] mt-0.5 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]">
                    R$ {saldoDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-[#4ade80] font-bold block mt-0.5">100% Líquido na sua conta</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-300 font-medium">
                <CheckCircle2 size={14} className="text-[#22c55e] shrink-0" />
                <span>Pague <strong>R$ 150,00</strong> → Receba <strong>R$ {saldoDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> instantaneamente</span>
              </div>
            </div>

            {/* Gatilho 3: PROVA SOCIAL NO MODAL */}
            <div className="relative z-10 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-slate-300">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]"></span>
              </span>
              <span><strong>142 afiliados</strong> já sacaram hoje • Último saque: Mariana R. (R$ 420,00) há 3 min</span>
            </div>

            {/* Confirmação e Edição do E-mail de Notificação */}
            <div className="relative z-10 text-left bg-black/45 border border-white/10 rounded-2xl p-3.5 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Mail size={13} className="text-[#22c55e]" />
                  <span>E-mail para liberação do saque:</span>
                </span>
                <span className="text-[10px] text-[#4ade80] font-semibold">Conta vinculada</span>
              </label>
              <input
                type="email"
                value={userWithdrawEmail}
                onChange={(e) => {
                  const val = e.target.value;
                  setUserWithdrawEmail(val);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('decolashop_user_email', val);
                  }
                }}
                placeholder="seuemail@exemplo.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#22c55e] transition-colors"
              />
              <p className="text-[10px] text-slate-400">
                A chave Pix de liberação será gerada com os dados vinculados a este e-mail.
              </p>
            </div>

            {/* Botões: "Sim, quero meu lucro agora" e "Não, quero acumular mais vendas" */}
            <div className="relative z-10 space-y-2.5 pt-1">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleAntecipacao(150)}
                className="w-full py-4 sm:py-5 px-6 rounded-2xl bg-gradient-to-r from-[#22c55e] via-[#4ade80] to-[#22c55e] hover:brightness-110 text-black font-black text-sm sm:text-base uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-[0_0_35px_rgba(34,197,94,0.55)] transition-all active:scale-95 disabled:opacity-60 cursor-pointer animate-pulse"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>GERANDO PIX DE R$ 150,00...</span>
                  </div>
                ) : (
                  <>
                    <span>Sim, quero meu lucro agora</span>
                    <ArrowRight size={20} strokeWidth={3} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowFirstWithdrawalModal(false)}
                className="w-full py-3 px-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-slate-200 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Não, quero acumular mais vendas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL PIX DA TAXA DE ANTECIPAÇÃO ================= */}
      {showPixModal && pixData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#0d121f] border border-[#22c55e]/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-white space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Fechar */}
            <button
              onClick={() => setShowPixModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Cabeçalho */}
            <div className="text-center pr-6 pl-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22c55e]/15 text-[#4ade80] border border-[#22c55e]/30 text-[10px] font-black uppercase tracking-wider mb-1.5">
                <Zap size={12} className="text-[#22c55e]" />
                <span>Liberação Imediata de Saldo</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                Taxa de Antecipação Pix
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Pague a taxa calculada para liberar seu saldo acumulado sem aguardar os {daysRemaining} dias de carência restantes.
              </p>
            </div>

            {/* Resumo dos Valores */}
            <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-white/[0.02] border border-white/10 text-left">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Saldo a Liberar:</span>
                <span className="text-base font-black text-white">
                  R$ {saldoDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#4ade80] block font-bold">Taxa de Antecipação:</span>
                <span className="text-lg font-black text-[#22c55e]">
                  R$ {activeFee.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            {/* QR Code Pix */}
            <div className="flex flex-col items-center justify-center pt-1">
              <div className="p-2.5 bg-white rounded-2xl shadow-xl shadow-[#22c55e]/20 border-2 border-[#22c55e]">
                <img
                  src={pixData.qrCodeImage}
                  alt="QR Code Pix"
                  className="w-36 h-36 sm:w-40 sm:h-40 object-contain"
                />
              </div>

              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" />
                <span>Aguardando pagamento instantâneo</span>
              </div>
            </div>

            {/* Pix Copia e Cola */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 block text-left">
                Código Pix Copia e Cola:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={pixData.qrCodeText}
                  className="flex-1 bg-[#111726] border border-white/15 rounded-xl py-2 px-3 text-xs text-slate-200 font-mono select-all focus:outline-none truncate"
                />
                <button
                  type="button"
                  onClick={copyPixCode}
                  className="py-2 px-3.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shrink-0 shadow-md shadow-[#22c55e]/20 transition-all active:scale-95 cursor-pointer"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {/* Botão de Confirmação */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                disabled={isConfirming}
                onClick={handleConfirmAntecipacao}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#22c55e]/25 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isConfirming ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Confirmando Pagamento...</span>
                  </div>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>JÁ FIZ O PIX • LIBERAR SALDO AGORA</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowPixModal(false)}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-300 font-semibold transition-colors cursor-pointer py-1"
              >
                Cancelar e fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Extrato de Taxas de Saque Pagas (Exclusivo Gerente) */}
      {showManagerFeesModal && isGerenteOrAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0d121f] rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-[#38bdf8]/40 shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#38bdf8]/20 border border-[#38bdf8]/40 flex items-center justify-center text-[#38bdf8]">
                  <Receipt size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Extrato de Taxas de Saque Pagas</h3>
                  <p className="text-xs text-slate-400">
                    Histórico detalhado das taxas de antecipação quitadas (somente conta de gerente)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowManagerFeesModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[#080d18] border border-white/5 text-xs text-slate-300">
              <span>Total de Taxas Pagas: <strong className="text-white font-bold">{managerFeesData.totalCount}</strong></span>
              <span>Total Arrecadado: <strong className="text-[#4ade80] font-bold">R$ {managerFeesData.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1 custom-scrollbar">
              {managerFeesData.fees.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  <Receipt size={36} className="mx-auto mb-2 text-slate-600 opacity-60" />
                  Nenhuma taxa de saque registrada ainda.
                </div>
              ) : (
                managerFeesData.fees.map((fee, idx) => (
                  <div key={fee.id || idx} className="p-3.5 rounded-2xl bg-[#080d18]/90 border border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{fee.customerEmail}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#22c55e]/20 text-[#4ade80] font-bold">PAGO</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {fee.customerName ? `${fee.customerName} • ` : ''}
                        {new Date(fee.paidAt).toLocaleString('pt-BR')}
                        {fee.transactionId ? ` • ID: ${fee.transactionId}` : ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-[#4ade80]">
                        R$ {Number(fee.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-[10px] text-slate-500">100% Plataforma (0% Afiliados)</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowManagerFeesModal(false)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
