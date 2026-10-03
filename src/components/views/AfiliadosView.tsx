'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Percent, 
  Wallet, 
  Copy, 
  Check, 
  ExternalLink, 
  DollarSign, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  ArrowUpRight, 
  Sparkles, 
  Lock, 
  Clock, 
  CheckCircle2, 
  Share2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { 
  Affiliate, 
  AffiliateSale, 
  getAffiliates, 
  saveAffiliates, 
  getAffiliateSales, 
  addAffiliate, 
  updateAffiliate, 
  deleteAffiliate, 
  updateAffiliateCommission, 
  markCommissionPaid, 
  getAffiliateLink,
  syncAffiliatesFromServer
} from '@/lib/affiliateSystem';

const BUMP_NAMES: Record<string, string> = {
  bump_curso: '🎓 Curso Completo',
  bump_acompanhamento: '⭐ Acompanhamento 1 Ano',
  bump_acelerador: '🚀 Acelerador de Vendas',
  bump_fornecedores: '📦 Fornecedores VIP'
};

export default function AfiliadosView() {
  const { data: session, status } = useSession();
  const rawEmail = session?.user?.email || '';
  const userEmail = rawEmail.toLowerCase().trim();
  const userRole = (session?.user as any)?.role || '';

  const isNormalUser = userEmail === 'usuario@decolashop.com' || userEmail === 'cliente@decolashop.com' || userEmail === 'user@decolashop.com';
  const isAuthorized = !isNormalUser && (
    userEmail === 'gerente@decolashop.com' || 
    userEmail.includes('gerente') || 
    userEmail.includes('admin') || 
    userRole === 'gerente' || 
    userRole === 'admin'
  );

  const [affiliates, setAffiliates] = useState<Affiliate[]>(() => getAffiliates());
  const [sales, setSales] = useState<AffiliateSale[]>(() => getAffiliateSales());
  const [searchTerm, setSearchTerm] = useState('');
  const [salesFilter, setSalesFilter] = useState<'all' | 'pending' | 'paid' | 'self_purchase'>('all');
  
  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingAffiliate, setEditingAffiliate] = useState<Affiliate | null>(null);
  const [payingAffiliate, setPayingAffiliate] = useState<Affiliate | null>(null);
  
  // Form fields for create / edit
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    email: '',
    phone: '',
    pixKey: '',
    pixKeyType: 'cpf' as Affiliate['pixKeyType'],
    commissionPercent: 50
  });

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedPix, setCopiedPix] = useState<string | null>(null);

  // Load and subscribe to updates
  const loadData = () => {
    setAffiliates(getAffiliates());
    setSales(getAffiliateSales());
  };

  useEffect(() => {
    loadData();

    // 1. Initial server sync
    syncAffiliatesFromServer().then(({ affiliates: affs, sales: sls }) => {
      setAffiliates(affs);
      setSales(sls);
    });

    // 2. Real-time background polling every 3 seconds for instant updates across devices
    const pollInterval = setInterval(() => {
      syncAffiliatesFromServer().then(({ affiliates: affs, sales: sls }) => {
        setAffiliates(affs);
        setSales(sls);
      });
    }, 3000);

    const handleUpdate = () => loadData();
    window.addEventListener('decolashop_affiliates_updated', handleUpdate);
    window.addEventListener('decolashop_affiliate_sales_updated', handleUpdate);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('decolashop_affiliates_updated', handleUpdate);
      window.removeEventListener('decolashop_affiliate_sales_updated', handleUpdate);
    };
  }, []);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalAffiliateRevenue = affiliates.reduce((acc, a) => acc + (a.totalRevenue || 0), 0);
    const totalPendingCommission = affiliates.reduce((acc, a) => acc + (a.pendingCommission || 0), 0);
    const totalPaidCommission = affiliates.reduce((acc, a) => acc + (a.paidCommission || 0), 0);
    const totalSalesCount = affiliates.reduce((acc, a) => acc + (a.totalSalesCount || 0), 0);
    const selfPurchaseCount = sales.filter(s => s.isSelfPurchase).length;

    return {
      totalAffiliateRevenue,
      totalPendingCommission,
      totalPaidCommission,
      totalSalesCount,
      selfPurchaseCount,
      affiliatesCount: affiliates.length
    };
  }, [affiliates, sales]);

  // Filtered affiliates
  const filteredAffiliates = useMemo(() => {
    if (!searchTerm.trim()) return affiliates;
    const term = searchTerm.toLowerCase().trim();
    return affiliates.filter(a => 
      a.name.toLowerCase().includes(term) ||
      a.code.toLowerCase().includes(term) ||
      a.email.toLowerCase().includes(term) ||
      a.pixKey.includes(term)
    );
  }, [affiliates, searchTerm]);

  // Filtered sales
  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      if (salesFilter === 'pending') return s.status === 'confirmed';
      if (salesFilter === 'paid') return s.status === 'paid_to_affiliate';
      if (salesFilter === 'self_purchase') return s.isSelfPurchase;
      return true;
    });
  }, [sales, salesFilter]);

  // Handlers
  const handleCopyLink = (code: string) => {
    const link = getAffiliateLink(code);
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    toast.success(`Link copiado: ?af=${code}`);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const handleCopyPix = (pix: string) => {
    navigator.clipboard.writeText(pix);
    setCopiedPix(pix);
    toast.success('Chave Pix copiada com sucesso!');
    setTimeout(() => setCopiedPix(null), 3000);
  };

  const handleQuickCommission = (affiliateId: string, current: number, delta: number) => {
    const nextVal = Math.max(0, Math.min(100, current + delta));
    updateAffiliateCommission(affiliateId, nextVal);
    toast.success(`Comissão atualizada para ${nextVal}%`);
  };

  const handleOpenCreateModal = () => {
    setFormData({
      name: '',
      code: '',
      email: '',
      phone: '',
      pixKey: '',
      pixKeyType: 'cpf',
      commissionPercent: 50
    });
    setEditingAffiliate(null);
    setIsNewModalOpen(true);
  };

  const handleOpenEditModal = (aff: Affiliate) => {
    setEditingAffiliate(aff);
    setFormData({
      name: aff.name,
      code: aff.code,
      email: aff.email,
      phone: aff.phone || '',
      pixKey: aff.pixKey,
      pixKeyType: aff.pixKeyType,
      commissionPercent: aff.commissionPercent
    });
    setIsNewModalOpen(true);
  };

  const handleSaveAffiliate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Informe o nome do afiliado');
      return;
    }
    if (!formData.code.trim()) {
      toast.error('Defina o código do link (?af=...)');
      return;
    }
    if (!formData.pixKey.trim()) {
      toast.error('Informe a chave Pix para repasses');
      return;
    }

    try {
      if (editingAffiliate) {
        updateAffiliate(editingAffiliate.id, {
          name: formData.name.trim(),
          code: formData.code.trim().toLowerCase(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          pixKey: formData.pixKey.trim(),
          pixKeyType: formData.pixKeyType,
          commissionPercent: Number(formData.commissionPercent)
        });
        toast.success('Afiliado atualizado com sucesso!');
      } else {
        addAffiliate({
          name: formData.name.trim(),
          code: formData.code.trim().toLowerCase(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          pixKey: formData.pixKey.trim(),
          pixKeyType: formData.pixKeyType,
          commissionPercent: Number(formData.commissionPercent)
        });
        toast.success('Novo afiliado cadastrado!');
      }
      setIsNewModalOpen(false);
      setEditingAffiliate(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar afiliado');
    }
  };

  const handleDeleteAffiliate = (aff: Affiliate) => {
    if (confirm(`Tem certeza que deseja remover o afiliado "${aff.name}"?`)) {
      deleteAffiliate(aff.id);
      toast.success('Afiliado removido');
      loadData();
    }
  };

  const handleConfirmPayCommission = () => {
    if (!payingAffiliate) return;
    markCommissionPaid(payingAffiliate.id);
    toast.success(`💸 Repasse de R$ ${payingAffiliate.pendingCommission.toFixed(2).replace('.', ',')} marcado como pago!`);
    setPayingAffiliate(null);
    loadData();
  };

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 space-y-4 animate-in fade-in duration-200">
        <div className="w-10 h-10 border-3 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Carregando dados dos afiliados...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-[#0d121f] rounded-2xl border border-red-500/20 max-w-xl mx-auto mt-12">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4 text-red-400">
          <Lock size={32} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Acesso Exclusivo à Gerência</h2>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          O painel de afiliados e controle de comissões está restrito à conta <span className="text-[#22c55e] font-semibold">gerente@decolashop.com</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d121f]/90 border border-[#22c55e]/20 rounded-2xl p-5 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#22c55e]/15 text-[#4ade80] border border-[#22c55e]/30 text-[10px] font-black uppercase tracking-wider">
              Painel Gerente
            </span>
            <span className="text-xs text-slate-400 font-semibold">• Sistema de Afiliados</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Gestão de <span className="text-[#22c55e]">Afiliados & Comissões</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Controle de links, cálculo de comissões sobre assinaturas + bumps de entrada e repasses manuais via Pix.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-black font-extrabold text-xs shadow-lg shadow-[#22c55e]/25 transition-all transform active:scale-95 cursor-pointer flex-shrink-0"
        >
          <UserPlus size={16} className="stroke-[2.5]" />
          <span>+ Cadastrar Novo Afiliado</span>
        </button>
      </div>

      {/* Security & Rules Banner */}
      <div className="bg-gradient-to-r from-[#0f172a] to-[#0d121f] border border-[#22c55e]/30 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#4ade80] flex-shrink-0 mt-0.5">
            <ShieldCheck size={22} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Blindagem de Lucro & Regras Ativas</h3>
              <span className="px-2 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold border border-emerald-500/25">
                Protegido
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              • <strong className="text-white">Comissão no Checkout Inicial:</strong> Calculada sobre o total do plano (Mensal/Vitalício) + Order Bumps antes do cadastro.<br />
              • <strong className="text-emerald-400">0% de Comissão dentro do SaaS:</strong> Cobranças internas (ex: taxa de antecipação R$ 68,90) são 100% lucro seu.<br />
              • <strong className="text-white">Saques Blindados:</strong> Pagamentos são feitos manualmente pelo seu app do banco e confirmados aqui com 1 clique (sem risco de API).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0 text-xs font-bold text-slate-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
          <Clock size={14} className="text-[#22c55e]" />
          <span>Cookies: 60 Dias</span>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Affiliate Revenue */}
        <div className="p-4 rounded-2xl bg-[#0d121f] border border-white/10 hover:border-[#22c55e]/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">Faturamento Afiliados</span>
            <div className="p-2 rounded-xl bg-[#22c55e]/10 text-[#4ade80]">
              <DollarSign size={16} />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white tracking-tight">
            R$ {metrics.totalAffiliateRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">
            Total bruto gerado por parceiros
          </p>
        </div>

        {/* Pending Commission to Pay */}
        <div className="p-4 rounded-2xl bg-[#0d121f] border border-amber-500/30 hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-400">Comissões a Pagar</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Wallet size={16} />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-400 tracking-tight">
            R$ {metrics.totalPendingCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">
            Saldo pendente de repasse via Pix
          </p>
        </div>

        {/* Paid Commission */}
        <div className="p-4 rounded-2xl bg-[#0d121f] border border-white/10 hover:border-[#22c55e]/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">Comissões Já Pagas</span>
            <div className="p-2 rounded-xl bg-white/5 text-slate-300">
              <CheckCircle2 size={16} className="text-[#22c55e]" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white tracking-tight">
            R$ {metrics.totalPaidCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">
            Total histórico já quitado aos parceiros
          </p>
        </div>

        {/* Total Orders & Affiliates Count */}
        <div className="p-4 rounded-2xl bg-[#0d121f] border border-white/10 hover:border-[#22c55e]/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">Vendas & Parceiros</span>
            <div className="p-2 rounded-xl bg-white/5 text-slate-300">
              <Users size={16} className="text-cyan-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {metrics.totalSalesCount}
            </p>
            <span className="text-xs font-bold text-slate-400">pedidos</span>
            <span className="text-xs text-slate-600">•</span>
            <span className="text-xs font-bold text-[#22c55e]">{metrics.affiliatesCount} afiliados</span>
          </div>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">
            {metrics.selfPurchaseCount > 0 ? (
              <span className="text-amber-400 font-bold">⚠️ {metrics.selfPurchaseCount} autocompra detectada</span>
            ) : (
              '100% vendas externas qualificadas'
            )}
          </p>
        </div>
      </div>

      {/* Affiliates Management Table */}
      <div className="bg-[#0d121f] border border-white/10 rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Users size={20} className="text-[#22c55e]" />
              <span>Lista de Afiliados Cadastrados</span>
            </h2>
            <p className="text-xs text-slate-400">
              Gerencie a porcentagem de comissão, copie links de divulgação e quite saldos pendentes via Pix.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, código ou pix..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#22c55e]"
            />
          </div>
        </div>

        {filteredAffiliates.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-black/20 rounded-xl border border-white/5 p-6">
            <Users size={36} className="mx-auto mb-2 opacity-40 text-slate-500" />
            <p className="text-sm font-bold text-white">Nenhum parceiro cadastrado no momento</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Cadastre seus afiliados para gerar links exclusivos de divulgação com porcentagem de comissão personalizada.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-black font-extrabold text-xs shadow-lg shadow-[#22c55e]/20 transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <UserPlus size={14} className="stroke-[2.5]" />
              <span>+ Cadastrar Primeiro Afiliado</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Afiliado</th>
                  <th className="py-3 px-3">Link de Divulgação</th>
                  <th className="py-3 px-3 text-center">Comissão (%)</th>
                  <th className="py-3 px-3">Chave Pix</th>
                  <th className="py-3 px-3 text-right">Faturamento</th>
                  <th className="py-3 px-3 text-right">A Pagar</th>
                  <th className="py-3 px-3 text-right">Já Pago</th>
                  <th className="py-3 px-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAffiliates.map((aff) => {
                  const isCopied = copiedCode === aff.code;
                  const isPixCopied = copiedPix === aff.pixKey;
                  const hasPending = aff.pendingCommission > 0;

                  return (
                    <tr key={aff.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Name & Contact */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-white text-xs">{aff.name}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[180px]">{aff.email}</div>
                        {aff.phone && (
                          <div className="text-[10px] text-slate-500">{aff.phone}</div>
                        )}
                      </td>

                      {/* Link & Code */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono text-[11px] text-white">
                            ?af={aff.code}
                          </span>
                          <button
                            onClick={() => handleCopyLink(aff.code)}
                            title="Copiar link completo de divulgação"
                            className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                          >
                            {isCopied ? <Check size={13} className="text-[#22c55e]" /> : <Copy size={13} />}
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[170px]">
                          {getAffiliateLink(aff.code)}
                        </div>
                      </td>

                      {/* Commission % with Quick Adjust */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="inline-flex items-center gap-1 bg-black/40 border border-white/10 rounded-lg p-1">
                          <button
                            onClick={() => handleQuickCommission(aff.id, aff.commissionPercent, -5)}
                            title="Diminuir 5%"
                            className="w-5 h-5 rounded flex items-center justify-center bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white font-black text-xs transition-colors"
                          >
                            -
                          </button>
                          <span className="px-2 font-mono font-black text-xs text-[#22c55e]">
                            {aff.commissionPercent}%
                          </span>
                          <button
                            onClick={() => handleQuickCommission(aff.id, aff.commissionPercent, 5)}
                            title="Aumentar 5%"
                            className="w-5 h-5 rounded flex items-center justify-center bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white font-black text-xs transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Pix Key */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] text-slate-200 truncate max-w-[140px]">
                            {aff.pixKey}
                          </span>
                          <button
                            onClick={() => handleCopyPix(aff.pixKey)}
                            title="Copiar Chave Pix"
                            className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                          >
                            {isPixCopied ? <Check size={13} className="text-[#22c55e]" /> : <Copy size={13} />}
                          </button>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          {aff.pixKeyType}
                        </span>
                      </td>

                      {/* Total Revenue */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="font-bold text-white text-xs">
                          R$ {aff.totalRevenue.toFixed(2).replace('.', ',')}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {aff.totalSalesCount} {aff.totalSalesCount === 1 ? 'venda' : 'vendas'}
                        </div>
                      </td>

                      {/* Pending Commission */}
                      <td className="py-3.5 px-3 text-right">
                        <div className={`font-black text-xs ${hasPending ? 'text-amber-400' : 'text-slate-400'}`}>
                          R$ {aff.pendingCommission.toFixed(2).replace('.', ',')}
                        </div>
                        {hasPending && (
                          <button
                            onClick={() => setPayingAffiliate(aff)}
                            className="mt-1 px-2 py-0.5 rounded bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-[10px] transition-colors inline-block"
                          >
                            💸 Pagar Pix
                          </button>
                        )}
                      </td>

                      {/* Paid Commission */}
                      <td className="py-3.5 px-3 text-right font-medium text-slate-400 text-xs">
                        R$ {aff.paidCommission.toFixed(2).replace('.', ',')}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(aff)}
                            title="Editar Afiliado"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteAffiliate(aff)}
                            title="Remover Afiliado"
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sales Transactions History */}
      <div className="bg-[#0d121f] border border-white/10 rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-[#22c55e]" />
              <span>Extrato Detalhado de Vendas de Afiliados</span>
            </h2>
            <p className="text-xs text-slate-400">
              Histórico de checkouts confirmados, comissão gerada e verificação de autocompra.
            </p>
          </div>

          {/* Sales Filter Tabs */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setSalesFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                salesFilter === 'all' ? 'bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todas ({sales.length})
            </button>
            <button
              onClick={() => setSalesFilter('pending')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                salesFilter === 'pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pendentes ({sales.filter(s => s.status === 'confirmed').length})
            </button>
            <button
              onClick={() => setSalesFilter('paid')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                salesFilter === 'paid' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pagas ({sales.filter(s => s.status === 'paid_to_affiliate').length})
            </button>
            <button
              onClick={() => setSalesFilter('self_purchase')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                salesFilter === 'self_purchase' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Autocompra ({sales.filter(s => s.isSelfPurchase).length})
            </button>
          </div>
        </div>

        {filteredSales.length === 0 ? (
          <div className="text-center py-10 text-slate-400 bg-black/20 rounded-xl border border-white/5 p-6">
            <TrendingUp size={28} className="mx-auto mb-2 opacity-40 text-slate-500" />
            <p className="text-xs font-bold text-slate-300">Nenhuma venda de afiliado registrada ainda</p>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto mt-1">
              Quando um cliente concluir uma assinatura usando o link (?af=codigo) de um afiliado e o Pix for confirmado, os detalhes do pedido e o valor exato da comissão aparecerão aqui automaticamente.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Data / Hora</th>
                  <th className="py-2.5 px-3">Afiliado</th>
                  <th className="py-2.5 px-3">Cliente</th>
                  <th className="py-2.5 px-3">Itens Comprados (Checkout)</th>
                  <th className="py-2.5 px-3 text-right">Total Pedido</th>
                  <th className="py-2.5 px-3 text-right">Comissão Afiliado</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSales.map((sale) => {
                  const dateStr = new Date(sale.createdAt).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <tr key={sale.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Date */}
                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                        {dateStr}
                      </td>

                      {/* Affiliate */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-white text-xs">{sale.affiliateName}</div>
                        <span className="font-mono text-[10px] text-[#22c55e]">?af={sale.affiliateCode}</span>
                      </td>

                      {/* Customer & Self Purchase Alert */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-200 text-xs">{sale.customerName}</div>
                        <div className="text-[11px] text-slate-400">{sale.customerEmail}</div>
                        {sale.isSelfPurchase && (
                          <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-black animate-pulse">
                            <AlertTriangle size={11} />
                            <span>Possível Autocompra</span>
                          </div>
                        )}
                      </td>

                      {/* Purchased Items (Plan + Bumps) */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-white text-xs">
                          {sale.plan === 'lifetime' ? '💎 Plano Vitalício (R$ 179,90)' : '⚡ Plano Mensal (R$ 89,90)'}
                        </div>
                        {sale.bumps && sale.bumps.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {sale.bumps.map(bId => (
                              <span key={bId} className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-slate-300 font-semibold border border-white/5">
                                {BUMP_NAMES[bId] || bId}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Total Amount */}
                      <td className="py-3 px-3 text-right font-black text-white text-xs">
                        R$ {sale.totalAmount.toFixed(2).replace('.', ',')}
                      </td>

                      {/* Commission */}
                      <td className="py-3 px-3 text-right">
                        <div className="font-black text-emerald-400 text-xs">
                          R$ {sale.commissionAmount.toFixed(2).replace('.', ',')}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {sale.commissionPercent}% do total
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        {sale.status === 'paid_to_affiliate' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                            <CheckCircle2 size={11} />
                            <span>Pago</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                            <Clock size={11} />
                            <span>A Pagar</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: Cadastrar / Editar Afiliado */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-[#0d121f] border border-[#22c55e]/30 rounded-2xl p-6 shadow-2xl relative text-white">
            <button
              onClick={() => setIsNewModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-[#22c55e]/15 text-[#4ade80]">
                <UserPlus size={18} />
              </div>
              <h3 className="text-lg font-black text-white">
                {editingAffiliate ? 'Editar Afiliado' : 'Cadastrar Novo Afiliado'}
              </h3>
            </div>

            <form onSubmit={handleSaveAffiliate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Código do Link de Afiliado (URL)
                </label>
                <div className="flex items-center rounded-xl border border-white/10 bg-black/40 overflow-hidden focus-within:border-[#22c55e]">
                  <span className="px-3 text-xs text-slate-400 font-mono bg-white/5 py-2 border-r border-white/10">
                    ?af=
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="joao"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                    className="flex-1 px-3 py-2 bg-transparent text-xs text-white font-mono focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Link final: {getAffiliateLink(formData.code || 'codigo')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">E-mail de Contato</label>
                  <input
                    type="email"
                    required
                    placeholder="joao@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">WhatsApp / Telefone</label>
                  <input
                    type="text"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tipo Pix</label>
                  <select
                    value={formData.pixKeyType}
                    onChange={(e) => setFormData({ ...formData, pixKeyType: e.target.value as any })}
                    className="w-full px-2.5 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#22c55e]"
                  >
                    <option value="cpf" className="bg-[#0d121f]">CPF</option>
                    <option value="cnpj" className="bg-[#0d121f]">CNPJ</option>
                    <option value="email" className="bg-[#0d121f]">E-mail</option>
                    <option value="phone" className="bg-[#0d121f]">Telefone</option>
                    <option value="random" className="bg-[#0d121f]">Aleatória</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">Chave Pix</label>
                  <input
                    type="text"
                    required
                    placeholder="Chave Pix para pagamento"
                    value={formData.pixKey}
                    onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
              </div>

              {/* Commission % Selector */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300">
                    Porcentagem de Comissão
                  </label>
                  <span className="text-xs font-black text-[#22c55e]">
                    {formData.commissionPercent}% sobre o total
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={formData.commissionPercent}
                  onChange={(e) => setFormData({ ...formData, commissionPercent: Number(e.target.value) })}
                  className="w-full accent-[#22c55e] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>0% (Próprio)</span>
                  <button type="button" onClick={() => setFormData({ ...formData, commissionPercent: 40 })} className="hover:text-white">40%</button>
                  <button type="button" onClick={() => setFormData({ ...formData, commissionPercent: 50 })} className="text-[#22c55e] font-bold">50%</button>
                  <button type="button" onClick={() => setFormData({ ...formData, commissionPercent: 60 })} className="hover:text-white">60%</button>
                  <span>100%</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-black font-extrabold text-xs shadow-lg shadow-[#22c55e]/20"
                >
                  {editingAffiliate ? 'Salvar Alterações' : 'Criar Afiliado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Pagar Comissão (Manual Pix) */}
      {payingAffiliate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-[#0d121f] border border-amber-500/40 rounded-2xl p-6 shadow-2xl relative text-white">
            <button
              onClick={() => setPayingAffiliate(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400">
                <Wallet size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Repasse de Comissão Pix</h3>
                <p className="text-xs text-slate-400">Afiliado: {payingAffiliate.name}</p>
              </div>
            </div>

            <div className="bg-black/50 border border-white/10 rounded-xl p-4 space-y-3 mb-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Valor Total a Transferir:</span>
                <span className="text-xl font-black text-amber-400">
                  R$ {payingAffiliate.pendingCommission.toFixed(2).replace('.', ',')}
                </span>
              </div>

              <div className="border-t border-white/5 pt-3">
                <span className="text-[11px] text-slate-400 font-bold block mb-1">
                  Chave Pix ({payingAffiliate.pixKeyType.toUpperCase()}):
                </span>
                <div className="flex items-center justify-between gap-2 p-2.5 bg-white/5 rounded-lg border border-white/10">
                  <span className="font-mono text-xs text-white truncate">
                    {payingAffiliate.pixKey}
                  </span>
                  <button
                    onClick={() => handleCopyPix(payingAffiliate.pixKey)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#22c55e]/20 text-[#4ade80] hover:bg-[#22c55e]/30 text-xs font-bold transition-colors flex-shrink-0"
                  >
                    <Copy size={12} />
                    <span>Copiar</span>
                  </button>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed mb-5">
              💡 Abra o aplicativo do seu banco (ex: Nubank, Inter, Itaú), faça o Pix com o valor acima e clique no botão abaixo para registrar a quitação.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPayingAffiliate(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleConfirmPayCommission}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs shadow-lg shadow-amber-500/20"
              >
                Confirmar que já paguei o Pix
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
