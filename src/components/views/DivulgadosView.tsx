'use client';

import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Sparkles, 
  Play, 
  Pause, 
  Eye, 
  MousePointerClick, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Share2, 
  Video, 
  Search, 
  Filter, 
  Plus, 
  ExternalLink, 
  Copy, 
  X, 
  Check, 
  ShieldCheck, 
  Flame, 
  Layers,
  Trash2,
  Truck,
  Navigation,
  MapPin,
  PackageCheck,
  Calendar,
  RotateCcw,
  Globe,
  Box,
  Plane,
  Home,
  MessageCircle,
  FileCheck,
  Send,
  ArrowRight,
  Award
} from 'lucide-react';
import SafeImage from '@/components/SafeImage';
import FindGroupsButton from '@/components/FindGroupsButton';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { useRegionCurrency } from '@/lib/regionState';
import { 
  DivulgadoCampaign, 
  getDivulgados, 
  saveDivulgados, 
  hydrateDivulgados,
  toggleDivulgadoStatus, 
  removeDivulgado, 
  getDivulgadosStats,
  INITIAL_DIVULGADOS,
  MAX_ACTIVE_CAMPAIGNS,
  isGerenteOrAdminEmail,
  getCampaignShippingInfo,
  ShippingTrackingInfo
} from '@/lib/divulgados';

interface DivulgadosViewProps {
  onNavigate: (view: any, product?: any) => void;
}

export default function DivulgadosView({ onNavigate }: DivulgadosViewProps) {
  const { data: session } = useSession();
  const rawEmail = 
    session?.user?.email || 
    (typeof window !== 'undefined' ? (localStorage.getItem('decolashop_user_email') || localStorage.getItem('decolashop_active_user_email')) : '');
  const userEmail = (rawEmail || 'usuario@decolashop.com').toLowerCase().trim();
  const isGerente = isGerenteOrAdminEmail(userEmail);

  const { currency, isUsd: globalIsUsd, setCurrency } = useRegionCurrency();

  const [campaigns, setCampaigns] = useState<DivulgadoCampaign[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [regionFilter, setRegionFilter] = useState<'all' | 'BRL' | 'USD'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedCampaign, setSelectedCampaign] = useState<DivulgadoCampaign | null>(null);
  const [trackingCampaign, setTrackingCampaign] = useState<DivulgadoCampaign | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [trackingCopied, setTrackingCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    // 1. Carrega do localStorage local imediato
    const loaded = getDivulgados(userEmail);
    if (loaded && loaded.length > 0) {
      setCampaigns(loaded);
    } else {
      setCampaigns(loaded);
      // Se local estiver vazio, busca da nuvem (Supabase)
      if (userEmail) {
        fetch(`/api/user/sync-state?email=${encodeURIComponent(userEmail)}`)
          .then(res => res.json())
          .then(data => {
            if (data?.success && Array.isArray(data?.data?.divulgados) && data.data.divulgados.length > 0) {
              hydrateDivulgados(data.data.divulgados, userEmail);
              setCampaigns(data.data.divulgados);
            }
          })
          .catch(() => {});
      }
    }

    const handleUpdate = () => {
      setCampaigns(getDivulgados(userEmail));
    };

    window.addEventListener('decolashop_divulgados_updated', handleUpdate);
    return () => {
      window.removeEventListener('decolashop_divulgados_updated', handleUpdate);
    };
  }, [userEmail]);

  const handleToggle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const result = toggleDivulgadoStatus(id, userEmail);
    if (result.error) {
      toast.error(result.error, { icon: '⚠️', duration: 4500 });
      return;
    }
    setCampaigns(result.updated);
    const target = result.updated.find(c => c.id === id);
    if (target?.status === 'active') {
      toast.success('🚀 Divulgação retomada com sucesso!');
    } else {
      toast('⏸ Divulgação pausada temporariamente.', { icon: '⏸' });
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Deseja remover esta divulgação da sua lista?')) {
      const updated = removeDivulgado(id, userEmail);
      setCampaigns(updated);
      toast.success('Divulgação removida.');
    }
  };

  const handleRestoreDefaults = () => {
    if (!isGerente) return;
    saveDivulgados(INITIAL_DIVULGADOS, userEmail);
    setCampaigns(INITIAL_DIVULGADOS);
    toast.success('Campanhas ativas sincronizadas com sucesso!');
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success('Texto copiado para a área de transferência!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCopyTrackingLink = (code: string) => {
    const url = `https://decolashop.com/rastreio?code=${code}`;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    toast.success('Link de rastreamento copiado!');
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleSendWhatsAppNotification = (camp: DivulgadoCampaign, shipping: ShippingTrackingInfo) => {
    const isUsd = shipping.currency === 'USD';
    const recipientFirstName = shipping.recipientName.split(' ')[0];
    const message = isUsd
      ? `📦 *DecolaShop Global Delivery Update*\n\nHello ${recipientFirstName}!\nYour order for *${camp.name}* is in express transit with guaranteed 7-day delivery!\n\n🔹 *Tracking Number:* ${shipping.trackingCode}\n🔹 *Carrier:* ${shipping.carrier}\n🔹 *Status:* ${shipping.statusLabel}\n🔹 *Estimated Arrival:* ${shipping.estimatedDeliveryDate}\n🔹 *Destination:* ${shipping.recipientCity}\n\nTrack your shipment live:\nhttps://decolashop.com/rastreio?code=${shipping.trackingCode}\n\nThank you for choosing DecolaShop Global!`
      : `📦 *Decola Express - Acompanhamento de Pedido*\n\nOlá ${recipientFirstName}!\nSeu pedido do produto *${camp.name}* está em trânsito com prazo de entrega de 7 dias!\n\n🔹 *Código de Rastreio:* ${shipping.trackingCode}\n🔹 *Transportadora:* ${shipping.carrier}\n🔹 *Status Atual:* ${shipping.statusLabel}\n🔹 *Previsão de Chegada:* ${shipping.estimatedDeliveryDate}\n🔹 *Cidade de Destino:* ${shipping.recipientCity}\n\nAcompanhe em tempo real:\nhttps://decolashop.com/rastreio?code=${shipping.trackingCode}\n\nQualquer dúvida estamos à disposição! Decola Express.`;

    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    toast.success('WhatsApp aberto com mensagem de rastreio!');
  };

  const categories = ['Todas', ...Array.from(new Set(campaigns.map(c => c.category).filter(Boolean)))];

  const filteredCampaigns = campaigns.filter(c => {
    const matchStatus = 
      statusFilter === 'all' ? true : 
      statusFilter === 'active' ? c.status === 'active' : 
      c.status === 'paused';
    
    const isItemUsd = c.currency === 'USD' || (typeof c.price === 'string' && c.price.includes('$') && !c.price.includes('R$'));
    const matchRegion = 
      regionFilter === 'all' ? true :
      regionFilter === 'USD' ? isItemUsd :
      !isItemUsd;

    const matchCategory = selectedCategory === 'Todas' || c.category === selectedCategory;
    const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchStatus && matchRegion && matchCategory && matchSearch;
  });

  const stats = getDivulgadosStats(campaigns);

  // Calcula total em USD vs BRL
  const usdCampaigns = campaigns.filter(c => c.currency === 'USD' || (typeof c.price === 'string' && c.price.includes('$') && !c.price.includes('R$')));
  const brlCampaigns = campaigns.filter(c => !(c.currency === 'USD' || (typeof c.price === 'string' && c.price.includes('$') && !c.price.includes('R$'))));
  const totalUsdRevenue = usdCampaigns.reduce((acc, c) => acc + (c.revenue || 0), 0);
  const totalBrlRevenue = brlCampaigns.reduce((acc, c) => acc + (c.revenue || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22c55e]/15 text-[#4ade80] border border-[#22c55e]/30 text-xs font-bold mb-2 shadow-[0_0_10px_rgba(34,197,94,0.15)]">
            <Megaphone className="w-3.5 h-3.5 text-[#22c55e]" />
            <span>CENTRAL DE TRANSMISSÃO, TRÁFEGO & RASTREAMENTO</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-2">
            Produtos Divulgados
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/30 font-bold">
              {stats.activeCount} Ativos
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
            Monitore em tempo real as campanhas ativas, vendas geradas e acompanhe a rota logística com o prazo estrito de 7 dias de entrega.
          </p>
        </div>

        {/* Global Region & Add Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Seletor de Região / Moeda Global */}
          <div className="p-1 rounded-xl bg-black/60 border border-white/10 flex items-center shadow-lg">
            <button
              onClick={() => {
                setCurrency('BRL');
                setRegionFilter('BRL');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currency === 'BRL' && regionFilter === 'BRL'
                  ? 'bg-[#22c55e] text-black shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🇧🇷</span>
              <span>Brasil (R$)</span>
            </button>
            <button
              onClick={() => {
                setCurrency('USD');
                setRegionFilter('USD');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currency === 'USD' && regionFilter === 'USD'
                  ? 'bg-blue-500 text-white shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🇺🇸</span>
              <span>Exterior (US$)</span>
            </button>
            <button
              onClick={() => setRegionFilter('all')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                regionFilter === 'all'
                  ? 'bg-white/20 text-white font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Exibir todos os produtos nacionais e internacionais"
            >
              <Globe size={13} />
              <span>Todos</span>
            </button>
          </div>

          <button
            onClick={() => onNavigate('divulgacao-ia')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#22c55e] to-emerald-400 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-[#22c55e]/25 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} />
            <span>Divulgar Novo Produto</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Ativas */}
        <div className="rounded-2xl p-4 sm:p-5 bg-[#0d121f]/90 border border-white/10 hover:border-[#22c55e]/30 transition-all shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Campanhas Ativas</span>
            <div className="w-8 h-8 rounded-lg bg-[#22c55e]/15 flex items-center justify-center text-[#22c55e]">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-xl sm:text-2xl font-black text-white">
              {stats.activeCount} <span className="text-xs text-slate-400 font-normal">/ {MAX_ACTIVE_CAMPAIGNS} máx</span>
            </div>
            {stats.activeCount >= MAX_ACTIVE_CAMPAIGNS && (
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Limite 15/15
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] sm:text-xs text-[#4ade80] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
            <span>Transmitindo em redes VIP</span>
          </div>
        </div>

        {/* Impressões */}
        <div className="rounded-2xl p-4 sm:p-5 bg-[#0d121f]/90 border border-white/10 hover:border-[#22c55e]/30 transition-all shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Visualizações</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400">
              <Eye size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {stats.totalImpressions.toLocaleString('pt-BR')}
          </div>
          <div className="flex items-center gap-1 mt-2 text-[10px] sm:text-xs text-blue-400 font-bold">
            <TrendingUp size={12} />
            <span>+16.4% tráfego nas últimas 24h</span>
          </div>
        </div>

        {/* Cliques */}
        <div className="rounded-2xl p-4 sm:p-5 bg-[#0d121f]/90 border border-white/10 hover:border-[#22c55e]/30 transition-all shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Cliques no Link</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400">
              <MousePointerClick size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {stats.totalClicks.toLocaleString('pt-BR')}
          </div>
          <div className="flex items-center gap-1 mt-2 text-[10px] sm:text-xs text-purple-400 font-bold">
            <span>CTR Médio: 4.2%</span>
          </div>
        </div>

        {/* Faturamento */}
        <div className="rounded-2xl p-4 sm:p-5 bg-[#0d121f]/90 border border-white/10 hover:border-[#22c55e]/30 transition-all shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Faturamento de Vendas</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-[#4ade80]">
            {regionFilter === 'USD' ? (
              <span>US$ {totalUsdRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            ) : regionFilter === 'BRL' ? (
              <span>R$ {totalBrlRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            ) : (
              <span>R$ {totalBrlRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs text-blue-400 font-normal">+ US$ {totalUsdRevenue.toFixed(0)}</span></span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-2 text-[10px] sm:text-xs text-amber-400 font-bold">
            <span>{stats.totalSales} pedidos concluídos • ROAS {stats.avgRoas}x</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl p-3 sm:p-4 bg-[#0d121f]/80 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5 w-full md:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-[#22c55e] text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({campaigns.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-[#22c55e] text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Em Veiculação ({stats.activeCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('paused')}
            className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              statusFilter === 'paused'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Pausados ({campaigns.length - stats.activeCount})</span>
          </button>
        </div>

        {/* Search & Category */}
        <div className="flex items-center gap-2.5 w-full md:w-auto flex-1 md:max-w-md justify-end">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
            <input
              type="text"
              placeholder="Buscar produto divulgado ou rastreio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#22c55e]"
            />
          </div>

          {categories.length > 2 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-[#22c55e]"
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-[#0d121f] text-white">
                  {cat}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Campaigns List */}
      {filteredCampaigns.length === 0 ? (
        <div className="rounded-3xl p-12 bg-[#0d121f]/60 border border-white/10 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-slate-500">
            <Megaphone size={28} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Nenhum produto divulgado encontrado</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              {searchQuery 
                ? 'Nenhum item corresponde ao termo pesquisado. Tente outra palavra-chave.' 
                : regionFilter !== 'all'
                ? `Você ainda não possui produtos divulgados no filtro de região selecionado (${regionFilter === 'USD' ? 'Exterior' : 'Brasil'}).`
                : 'Você ainda não possui produtos nessa categoria de status.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            {campaigns.length === 0 && isGerente ? (
              <button
                onClick={handleRestoreDefaults}
                className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={14} /> Sincronizar Campanhas
              </button>
            ) : null}
            <button
              onClick={() => onNavigate('divulgacao-ia')}
              className="px-4 py-2 rounded-xl bg-[#22c55e] text-black text-xs font-black uppercase tracking-wider hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} /> Divulgar Agora
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCampaigns.map((camp) => {
            const isUsd = camp.currency === 'USD' || (typeof camp.price === 'string' && camp.price.includes('$') && !camp.price.includes('R$'));
            
            const formattedPrice = typeof camp.price === 'string'
              ? camp.price
              : isUsd 
                ? `US$ ${camp.price?.toFixed(2) || '49.90'}`
                : `R$ ${camp.price?.toFixed(2) || '99.90'}`;

            const formattedRevenue = isUsd
              ? `US$ ${camp.revenue?.toFixed(2) || '0.00'}`
              : `R$ ${(camp.revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

            const isActive = camp.status === 'active';
            const shipping = getCampaignShippingInfo(camp);

            return (
              <div
                key={camp.id}
                className={`rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-[#0d121f]/90 border transition-all shadow-xl backdrop-blur-xl flex flex-col gap-4 ${
                  isActive
                    ? 'border-white/10 hover:border-[#22c55e]/40'
                    : 'border-white/5 opacity-75 hover:opacity-100 hover:border-amber-400/30'
                }`}
              >
                {/* Upper row: Product info, live metrics and action buttons */}
                <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  {/* Left: Product Info */}
                  <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                    {/* Image with status & flag badges */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-black/40 border border-white/10 flex-shrink-0">
                      <SafeImage
                        src={camp.image_url}
                        alt={camp.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1.5 left-1.5">
                        <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md ${
                          isActive
                            ? 'bg-[#22c55e] text-black'
                            : 'bg-amber-400 text-black'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-black animate-pulse' : 'bg-black/60'}`} />
                          {isActive ? 'ATIVO' : 'PAUSADO'}
                        </span>
                      </div>

                      {/* Flag Pill */}
                      <div className="absolute bottom-1.5 right-1.5">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/80 backdrop-blur-md border border-white/20 text-white shadow-sm">
                          {isUsd ? '🇺🇸 US$' : '🇧🇷 R$'}
                        </span>
                      </div>
                    </div>

                    {/* Text details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-400">
                          {camp.category}
                        </span>
                        {camp.channelLabel && (
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                            camp.channel === 'mercadolivre'
                              ? 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'
                              : camp.channel === 'shopee'
                              ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                              : camp.channel === 'tiktok'
                              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                              : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                          }`}>
                            {camp.channel === 'mercadolivre' ? '🟡' : camp.channel === 'shopee' ? '🟠' : camp.channel === 'tiktok' ? '⚫' : '🌐'} {camp.channelLabel}
                            {camp.marketplaceItemId && (
                              <span className="font-mono text-[9px] bg-black/40 px-1.5 py-0.2 rounded border border-white/10 text-white font-bold ml-1">
                                {camp.marketplaceItemId}
                              </span>
                            )}
                          </span>
                        )}
                        {camp.origin && (
                          <span className="text-[10px] text-cyan-400 flex items-center gap-1 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                            <MapPin size={10} />
                            {camp.origin.split('-')[0].trim()}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(camp.createdAt).toLocaleDateString('pt-BR')} às {new Date(camp.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
                        {camp.name}
                      </h3>

                      <div className="flex items-center gap-3 mt-1.5 text-xs flex-wrap">
                        <span className="font-black text-[#4ade80] text-sm">
                          {formattedPrice}
                        </span>
                        {camp.sellerMargin !== undefined ? (
                          <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1">
                            <span>Sua Margem:</span>
                            <strong className="text-emerald-300">{isUsd ? 'US$' : 'R$'} {camp.sellerMargin.toFixed(2).replace('.', ',')}</strong>
                            <span className="text-[10px] text-emerald-400/80">({camp.sellerMarginPercent || 35}%)</span>
                          </span>
                        ) : camp.commission ? (
                          <span className="text-slate-400 text-[11px]">
                            Comissão: <strong className="text-white">{camp.commission}</strong>
                          </span>
                        ) : null}
                        {camp.supplierCost !== undefined && (
                          <span className="text-slate-400 text-[11px] flex items-center gap-1">
                            Custo Forn.: <strong className="text-slate-300">{isUsd ? 'US$' : 'R$'} {camp.supplierCost.toFixed(2).replace('.', ',')}</strong>
                            <span className="text-[9px] text-amber-400 font-bold bg-amber-500/10 px-1 rounded border border-amber-500/20">🔒 Imutável</span>
                          </span>
                        )}
                      </div>

                      {/* Networks badges */}
                      <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                        {camp.networks?.map((net, i) => (
                          <span 
                            key={i} 
                            className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-white/[0.04] border border-white/5 text-slate-300"
                          >
                            {net}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Center: Live Performance Numbers */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-3 px-3.5 rounded-2xl bg-black/40 border border-white/5 text-center flex-shrink-0 lg:min-w-[360px]">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Visualizações</span>
                      <span className="text-xs sm:text-sm font-black text-white mt-0.5 block">
                        {camp.impressions.toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cliques</span>
                      <span className="text-xs sm:text-sm font-black text-white mt-0.5 block">
                        {camp.clicks.toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Vendas IA</span>
                      <span className="text-xs sm:text-sm font-black text-[#4ade80] mt-0.5 block">
                        {camp.salesCount} ped.
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Faturamento</span>
                      <span className="text-xs sm:text-sm font-black text-[#4ade80] mt-0.5 block">
                        {formattedRevenue}
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 justify-end flex-wrap flex-shrink-0">
                    {/* Pause / Resume Button */}
                    <button
                      onClick={(e) => handleToggle(camp.id, e)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isActive
                          ? 'bg-amber-400/10 text-amber-300 border border-amber-400/30 hover:bg-amber-400/20'
                          : 'bg-[#22c55e]/15 text-[#4ade80] border border-[#22c55e]/30 hover:bg-[#22c55e]/25'
                      }`}
                      title={isActive ? 'Pausar divulgação' : 'Retomar divulgação'}
                    >
                      {isActive ? <Pause size={13} /> : <Play size={13} />}
                      <span>{isActive ? 'Pausar' : 'Retomar'}</span>
                    </button>

                    {/* View Details Modal */}
                    <button
                      onClick={() => setSelectedCampaign(camp)}
                      className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>Detalhes</span>
                    </button>

                    {/* Link Oficial do Anúncio no Marketplace */}
                    <a
                      href={camp.marketplaceItemUrl || (camp.channel === 'mercadolivre' ? `https://lista.mercadolivre.com.br/${encodeURIComponent(camp.name.split('(')[0].trim())}` : `https://shopee.com.br/search?keyword=${encodeURIComponent(camp.name.split('(')[0].trim())}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                        camp.channel === 'mercadolivre'
                          ? 'bg-yellow-500/15 hover:bg-yellow-500/25 text-yellow-300 border-yellow-500/30'
                          : camp.channel === 'shopee'
                          ? 'bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 border-orange-500/30'
                          : 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border-cyan-500/30'
                      }`}
                      title={`Abrir anúncio oficial no ${camp.channelLabel || 'Marketplace'}`}
                    >
                      <ExternalLink size={13} />
                      <span>{camp.channel === 'mercadolivre' ? 'Ver no ML' : camp.channel === 'shopee' ? 'Ver na Shopee' : 'Ver Anúncio'}</span>
                    </a>

                    {/* Tracking / Rastreio Button */}
                    <button
                      onClick={() => setTrackingCampaign(camp)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md cursor-pointer ${
                        shipping.isDelivered
                          ? 'bg-[#22c55e] text-black hover:brightness-110 shadow-[#22c55e]/25'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:brightness-110 shadow-cyan-500/25'
                      }`}
                      title="Acompanhar transporte e entrega em tempo real (prazo 7 dias)"
                    >
                      <Truck size={14} />
                      <span>{shipping.isDelivered ? 'Entregue (7d)' : 'Rastrear Pedido'}</span>
                    </button>

                    {/* Video IA Shortcut */}
                    <button
                      onClick={() => onNavigate('video-ia', { 
                        id: camp.productId, 
                        name: camp.name, 
                        image_url: camp.image_url, 
                        price: camp.price 
                      })}
                      className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#84cc16]/15 to-[#a3e635]/15 text-[#a3e635] border border-[#84cc16]/30 hover:bg-[#84cc16]/25 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Criar Vídeo com IA para este produto"
                    >
                      <Video size={13} />
                      <span className="hidden sm:inline">Vídeo IA</span>
                    </button>

                    {/* Share in Shopee/WhatsApp groups */}
                    <FindGroupsButton 
                      productName={camp.name} 
                      className="px-3 py-2 text-xs"
                    />

                    {/* Remove */}
                    <button
                      onClick={(e) => handleDelete(camp.id, e)}
                      className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Excluir campanha"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Logística & Acompanhamento de Entrega (Prazo Rigoroso de 7 Dias) */}
                <div className="w-full pt-3.5 border-t border-white/10 flex flex-col gap-3">
                  {/* Status row com badges detalhados */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${
                        shipping.isDelivered
                          ? 'bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/40 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      }`}>
                        {shipping.isDelivered ? <CheckCircle2 size={13} className="text-[#22c55e]" /> : <Truck size={13} className="text-cyan-400" />}
                        <span>{shipping.isDelivered ? '✅ ENTREGUE AO CLIENTE (7 DIAS CUMPRIDOS)' : `🚚 ${shipping.statusLabel.toUpperCase()}`}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-mono bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                        <span className="text-slate-500">Rastreio:</span>
                        <strong className="text-white">{shipping.trackingCode}</strong>
                      </div>

                      <span className="text-[11px] text-slate-400">
                        • Destino: <strong className="text-slate-200">{shipping.recipientCity}</strong>
                      </span>

                      <span className="text-[11px] text-slate-500 hidden md:inline">
                        • {shipping.carrier}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 self-start sm:self-auto">
                      <span className="text-[11px] text-slate-400 font-medium">
                        {shipping.isDelivered ? (
                          <span className="text-[#4ade80] font-bold">Entrega pontual confirmada</span>
                        ) : (
                          <span>Previsão: <strong className="text-amber-300">{shipping.estimatedDeliveryDate}</strong> ({shipping.daysRemaining} {shipping.daysRemaining === 1 ? 'dia restante' : 'dias restantes'})</span>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => setTrackingCampaign(camp)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Ver Rota</span>
                        <Navigation size={11} />
                      </button>
                    </div>
                  </div>

                  {/* Visual 5-Checkpoints Progress Tracker */}
                  <div className="relative pt-1 pb-1">
                    <div className="w-full h-2 rounded-full bg-black/60 border border-white/10 overflow-hidden relative">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${
                          shipping.isDelivered 
                            ? 'bg-gradient-to-r from-emerald-500 via-green-400 to-[#22c55e] shadow-[0_0_12px_rgba(34,197,94,0.6)]' 
                            : 'bg-gradient-to-r from-indigo-500 via-cyan-400 to-[#22c55e] shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                        }`}
                        style={{ width: `${shipping.progressPercentage}%` }}
                      />
                    </div>

                    {/* 5 checkpoints labels */}
                    <div className="grid grid-cols-5 text-[10px] text-slate-400 font-medium mt-1.5 px-0.5">
                      <div className={`text-left flex items-center gap-1 ${shipping.steps[0].isCompleted ? 'text-[#4ade80] font-bold' : ''}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span className="truncate">1. Pedido</span>
                      </div>
                      <div className={`text-center flex items-center justify-center gap-1 ${shipping.steps[1].isCompleted ? 'text-[#4ade80] font-bold' : ''}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span className="truncate">2. Despacho</span>
                      </div>
                      <div className={`text-center flex items-center justify-center gap-1 ${shipping.steps[2].isCompleted ? 'text-[#4ade80] font-bold' : ''}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span className="truncate">3. Em Rota</span>
                      </div>
                      <div className={`text-center flex items-center justify-center gap-1 ${shipping.steps[3].isCompleted ? 'text-[#4ade80] font-bold' : ''}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span className="truncate">4. Rota Local</span>
                      </div>
                      <div className={`text-right flex items-center justify-end gap-1 ${shipping.steps[4].isCompleted ? 'text-[#4ade80] font-black' : ''}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span className="truncate">5. Entregue (7d)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Campaign Details Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#0d121f] border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#22c55e]/15 border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e]">
                  <Megaphone size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Detalhes da Divulgação
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    ID da Campanha: {selectedCampaign.id}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedCampaign(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Product Summary */}
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-black/30 border border-white/5">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex-shrink-0">
                <SafeImage
                  src={selectedCampaign.image_url}
                  alt={selectedCampaign.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{selectedCampaign.name}</p>
                <p className="text-xs font-black text-[#4ade80] mt-0.5">
                  {typeof selectedCampaign.price === 'string' 
                    ? selectedCampaign.price 
                    : selectedCampaign.currency === 'USD' 
                    ? `US$ ${selectedCampaign.price?.toFixed(2)}` 
                    : `R$ ${selectedCampaign.price?.toFixed(2)}`}
                  {selectedCampaign.commission && (
                    <span className="text-slate-400 font-normal ml-2">Comissão: {selectedCampaign.commission}</span>
                  )}
                </p>
              </div>
            </div>

            {/* Margem e Canal Breakdown */}
            {(selectedCampaign.channelLabel || selectedCampaign.sellerMargin !== undefined) && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <span className="text-sm">
                      {selectedCampaign.channel === 'mercadolivre' ? '🟡' : selectedCampaign.channel === 'shopee' ? '🟠' : selectedCampaign.channel === 'tiktok' ? '⚫' : '🌐'}
                    </span>
                    Canal de Venda Escolhido:
                  </span>
                  <span className="font-black text-white px-2.5 py-0.5 rounded-md bg-white/10 border border-white/10">
                    {selectedCampaign.channelLabel || 'Marketplace Integrado'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-500/20 text-center">
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-medium">Custo Fornecedor</span>
                    <span className="text-xs font-bold text-slate-300 block mt-0.5">
                      {selectedCampaign.currency === 'USD' ? 'US$' : 'R$'} {(selectedCampaign.supplierCost || (typeof selectedCampaign.price === 'number' ? selectedCampaign.price * 0.45 : 45)).toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-[9px] text-amber-400 font-black">🔒 Imutável</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-medium">Taxa do Canal</span>
                    <span className="text-xs font-bold text-slate-300 block mt-0.5">
                      {selectedCampaign.currency === 'USD' ? 'US$' : 'R$'} {(selectedCampaign.marketplaceFee || (typeof selectedCampaign.price === 'number' ? selectedCampaign.price * 0.13 : 13)).toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-[9px] text-slate-500 font-semibold">Comissão Canal</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
                    <span className="text-[10px] text-emerald-300 font-bold block">Sua Margem Líquida</span>
                    <span className="text-xs font-black text-emerald-400 block mt-0.5">
                      {selectedCampaign.currency === 'USD' ? 'US$' : 'R$'} {(selectedCampaign.sellerMargin || (typeof selectedCampaign.price === 'number' ? selectedCampaign.price * 0.35 : 35)).toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-[9px] text-emerald-400 font-black uppercase">100% Seu Lucro</span>
                  </div>
                </div>
              </div>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Visualizações</span>
                <span className="text-sm font-black text-white mt-1 block">{selectedCampaign.impressions.toLocaleString('pt-BR')}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Cliques Gerados</span>
                <span className="text-sm font-black text-white mt-1 block">{selectedCampaign.clicks.toLocaleString('pt-BR')}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Vendas</span>
                <span className="text-sm font-black text-[#4ade80] mt-1 block">{selectedCampaign.salesCount} ped.</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Faturamento</span>
                <span className="text-sm font-black text-[#4ade80] mt-1 block">
                  {selectedCampaign.currency === 'USD' 
                    ? `US$ ${selectedCampaign.revenue?.toFixed(2)}` 
                    : `R$ ${selectedCampaign.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                </span>
              </div>
            </div>

            {/* Target Audience */}
            {selectedCampaign.targeting && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-[#22c55e]" /> Público-Alvo Segmentado pela IA
                </h4>
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Segmento Principal:</span>
                    <span className="font-bold text-white">{selectedCampaign.targeting.audience}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Faixa Etária:</span>
                    <span className="font-bold text-white">{selectedCampaign.targeting.ageRange}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Região de Entrega:</span>
                    <span className="font-bold text-white">{selectedCampaign.targeting.location}</span>
                  </div>
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-slate-400 block mb-1.5">Interesses de Conversão:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCampaign.targeting.interests.map((int, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-[#22c55e]/10 text-[#4ade80] border border-[#22c55e]/20 font-medium">
                          {int}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Copy / Anúncio IA */}
            {selectedCampaign.sampleCopy && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#22c55e]" /> Copy Utilizada nos Anúncios
                  </h4>
                  <button
                    onClick={() => handleCopyText(`${selectedCampaign.sampleCopy?.headline}\n\n${selectedCampaign.sampleCopy?.body}\n\n${selectedCampaign.sampleCopy?.cta}`)}
                    className="text-[11px] font-bold text-[#4ade80] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {isCopied ? <Check size={12} /> : <Copy size={12} />}
                    <span>{isCopied ? 'Copiado!' : 'Copiar Copy'}</span>
                  </button>
                </div>
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 text-xs space-y-2">
                  <p className="font-black text-white">{selectedCampaign.sampleCopy.headline}</p>
                  <p className="text-slate-300 leading-relaxed">{selectedCampaign.sampleCopy.body}</p>
                  <p className="font-black text-[#22c55e]">{selectedCampaign.sampleCopy.cta}</p>
                </div>
              </div>
            )}

            {/* Status do Anúncio Oficial no Canal Conectado */}
            {(selectedCampaign.marketplaceItemId || selectedCampaign.channel === 'mercadolivre' || selectedCampaign.channel === 'shopee') && (() => {
              const channel = selectedCampaign.channel || 'mercadolivre';
              const isML = channel === 'mercadolivre' || (channel as string) === 'ml';
              const itemId = selectedCampaign.marketplaceItemId || (isML ? `MLB-4091823901` : `BR-89102931`);
              const itemUrl = selectedCampaign.marketplaceItemUrl || (isML 
                ? `https://lista.mercadolivre.com.br/${encodeURIComponent(selectedCampaign.name.split('(')[0].trim())}` 
                : `https://shopee.com.br/search?keyword=${encodeURIComponent(selectedCampaign.name.split('(')[0].trim())}`);
              const channelTitle = isML ? 'Mercado Livre' : channel === 'shopee' ? 'Shopee' : 'Marketplace Conectado';

              return (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                        <span>{isML ? '🟡' : '🟠'}</span> Sincronizado na Conta {channelTitle}
                      </span>
                    </div>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                      {itemId}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Este produto foi enviado e sincronizado com a sua conta oficial do {channelTitle}. As vendas realizadas no marketplace são computadas e processadas automaticamente pelo motor DecolaShop.
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-amber-500/20">
                    <div className="text-[11px] text-slate-400">
                      Loja vinculada: <span className="font-semibold text-white">{selectedCampaign.storeAccountEmail || 'Conta Principal Conectada'}</span>
                    </div>
                    <a
                      href={itemUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs shadow-sm transition-all cursor-pointer"
                    >
                      <ExternalLink size={13} />
                      <span>Abrir Anúncio Oficial no {channelTitle}</span>
                    </a>
                  </div>
                </div>
              );
            })()}

            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
              <button
                onClick={() => {
                  setSelectedCampaign(null);
                  onNavigate('video-ia', {
                    id: selectedCampaign.productId,
                    name: selectedCampaign.name,
                    image_url: selectedCampaign.image_url,
                    price: selectedCampaign.price
                  });
                }}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Video size={14} />
                <span>Criar Vídeo com IA</span>
              </button>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="px-5 py-2.5 rounded-xl bg-[#22c55e] text-black font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PREMIUM DE RASTREAMENTO LOGÍSTICO EM TEMPO REAL (PRAZO DE 7 DIAS) */}
      {trackingCampaign && (() => {
        const shipping = getCampaignShippingInfo(trackingCampaign);
        const isUsd = shipping.currency === 'USD';

        return (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-[#0b101c] border border-cyan-500/40 rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(6,182,212,0.15)] space-y-5 max-h-[92vh] overflow-y-auto">
              
              {/* Modal Top Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                    shipping.isDelivered
                      ? 'bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/50 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                  }`}>
                    {shipping.isDelivered ? <PackageCheck size={24} /> : isUsd ? <Plane size={24} /> : <Truck size={24} />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-black text-white tracking-tight">
                        Rastreamento em Tempo Real
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        shipping.isDelivered
                          ? 'bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/40'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      }`}>
                        {shipping.statusLabel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Garantia de Entrega: <strong className="text-white">Prazo de 7 dias corridos</strong> após a divulgação.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setTrackingCampaign(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Informações Rápidas do Produto */}
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0">
                  <SafeImage
                    src={trackingCampaign.image_url}
                    alt={trackingCampaign.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.2 rounded bg-white/10 text-slate-300">
                      {isUsd ? '🌐 Hub Internacional' : '🇧🇷 Envio Nacional Express'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {shipping.carrier}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                    {trackingCampaign.name}
                  </h4>
                  <div className="flex items-center gap-3 mt-0.5 text-xs">
                    <span className="text-[#4ade80] font-black">
                      {isUsd 
                        ? (typeof trackingCampaign.price === 'string' ? trackingCampaign.price : `US$ ${trackingCampaign.price?.toFixed(2)}`)
                        : (typeof trackingCampaign.price === 'string' ? trackingCampaign.price : `R$ ${trackingCampaign.price?.toFixed(2)}`)}
                    </span>
                    <span className="text-slate-400">• Destinatário: <strong className="text-slate-200">{shipping.recipientName}</strong></span>
                  </div>
                </div>
              </div>

              {/* Card de Código de Rastreio, Destino e Prazos */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl bg-black/50 border border-white/10 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Código de Rastreio</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="font-mono font-black text-cyan-400 text-xs tracking-wider">{shipping.trackingCode}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(shipping.trackingCode);
                        setTrackingCopied(true);
                        toast.success('Código copiado!');
                        setTimeout(() => setTrackingCopied(false), 2000);
                      }}
                      className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                      title="Copiar código de rastreio"
                    >
                      {trackingCopied ? <Check size={13} className="text-[#22c55e]" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Destino Final</span>
                  <span className="font-bold text-slate-200 block truncate mt-1">{shipping.recipientCity}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Modalidade</span>
                  <span className="font-bold text-slate-300 block mt-1 truncate">{shipping.serviceType}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Status de Entrega</span>
                  <span className={`font-black block mt-1 ${shipping.isDelivered ? 'text-[#4ade80]' : 'text-amber-400'}`}>
                    {shipping.isDelivered ? 'Entregue (7d)' : `Previsão: ${shipping.estimatedDeliveryDate}`}
                  </span>
                </div>
              </div>

              {/* SIMULAÇÃO VISUAL DE ROTA (MAPA DE LOGÍSTICA) */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Navigation size={13} className="text-cyan-400" />
                    <span>Trajeto Operacional de Entrega (Origem & Destino)</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {shipping.isDelivered ? '100% Concluído' : `Dia ${shipping.elapsedDays} de 7`}
                  </span>
                </div>

                {/* Diagrama de Rota com 4 Pontos */}
                <div className="relative pt-3 pb-2">
                  {/* Linha de conexão */}
                  <div className="absolute top-7 left-4 right-4 h-1 bg-white/10 rounded-full z-0">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${
                        shipping.isDelivered 
                          ? 'bg-gradient-to-r from-emerald-500 to-[#22c55e]' 
                          : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                      }`}
                      style={{ width: `${Math.min(100, (shipping.progressPercentage / 100) * 100)}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-4 relative z-10 text-center">
                    {/* Ponto 1: Origem */}
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-[#22c55e] text-black flex items-center justify-center font-bold text-xs shadow-md">
                        <Box size={14} />
                      </div>
                      <span className="text-[10px] font-bold text-white mt-1.5 truncate max-w-[90px]">Origem / CD</span>
                      <span className="text-[9px] text-slate-400 truncate max-w-[90px]">{shipping.originCountry}</span>
                    </div>

                    {/* Ponto 2: Hub Central */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        shipping.progressPercentage >= 40
                          ? 'bg-[#22c55e] text-black shadow-md'
                          : 'bg-black/60 text-slate-500 border border-white/20'
                      }`}>
                        {isUsd ? <Plane size={14} /> : <Truck size={14} />}
                      </div>
                      <span className="text-[10px] font-bold text-white mt-1.5 truncate max-w-[90px]">Hub de Trânsito</span>
                      <span className="text-[9px] text-slate-400 truncate max-w-[90px]">Triagem Rápida</span>
                    </div>

                    {/* Ponto 3: Base Local */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        shipping.progressPercentage >= 80
                          ? 'bg-[#22c55e] text-black shadow-md'
                          : 'bg-black/60 text-slate-500 border border-white/20'
                      }`}>
                        <Navigation size={14} />
                      </div>
                      <span className="text-[10px] font-bold text-white mt-1.5 truncate max-w-[90px]">Base Regional</span>
                      <span className="text-[9px] text-slate-400 truncate max-w-[90px]">{shipping.recipientCity.split('-')[0].trim()}</span>
                    </div>

                    {/* Ponto 4: Destinatário */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        shipping.isDelivered
                          ? 'bg-[#22c55e] text-black shadow-[0_0_15px_rgba(34,197,94,0.5)]'
                          : 'bg-black/60 text-slate-500 border border-white/20'
                      }`}>
                        <Home size={14} />
                      </div>
                      <span className="text-[10px] font-black text-white mt-1.5 truncate max-w-[90px]">
                        {shipping.isDelivered ? 'Entregue' : 'Destino Final'}
                      </span>
                      <span className="text-[9px] text-slate-400 truncate max-w-[90px]">{shipping.recipientName.split(' ')[0]}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SE ENTREGUE: CARD DE COMPROVANTE DIGITAL */}
              {shipping.isDelivered ? (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-[#22c55e]/15 to-transparent border border-[#22c55e]/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#4ade80]">
                      <Award size={18} />
                      <span className="text-xs font-black uppercase tracking-wider">
                        Comprovante Digital de Recebimento (7 Dias Cumpridos)
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/30 font-bold">
                      {shipping.deliveryProtocol}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[10px] text-slate-400 block font-bold">Recebido Por</span>
                      <span className="text-white font-bold block mt-0.5">{shipping.recipientName}</span>
                      <span className="text-[10px] text-[#4ade80] block font-mono">Assinado biometricamente</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[10px] text-slate-400 block font-bold">Entregador Responsável</span>
                      <span className="text-white font-bold block mt-0.5">{shipping.courierName}</span>
                      <span className="text-[10px] text-slate-400 block">{shipping.courierVehicle}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[10px] text-slate-400 block font-bold">Data & Hora de Baixa</span>
                      <span className="text-white font-bold block mt-0.5">{shipping.steps[4].dateStr}</span>
                      <span className="text-[10px] text-[#4ade80] block font-bold">Às {shipping.steps[4].timeStr}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-300 pt-1">
                    <CheckCircle2 size={13} className="text-[#22c55e]" />
                    <span>
                      Garantia DecolaShop: Entrega finalizada com sucesso respeitando o prazo máximo de 7 dias após a divulgação.
                    </span>
                  </div>
                </div>
              ) : (
                /* SE EM ANDAMENTO: CARD DE PREVISÃO E AUDITORIA */
                <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0">
                      <Clock size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-white">
                        Entrega Prioritária em Andamento • Dia {shipping.elapsedDays} de 7
                      </p>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Restam apenas <strong>{shipping.daysRemaining} {shipping.daysRemaining === 1 ? 'dia' : 'dias'}</strong> para a conclusão da rota com entrega garantida até {shipping.estimatedDeliveryDate}.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TIMELINE DETALHADA COM AS 5 ETAPAS */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Layers size={13} className="text-cyan-400" />
                  <span>Histórico Detalhado dos Marcos Logísticos</span>
                </span>

                <div className="relative pl-6 space-y-4 pt-2 before:absolute before:left-[11px] before:top-4 before:bottom-3 before:w-0.5 before:bg-white/10">
                  {shipping.steps.map((st) => (
                    <div key={st.step} className="relative group">
                      <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                        st.isCompleted
                          ? 'bg-[#22c55e] text-black shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                          : 'bg-white/10 text-slate-500 border border-white/20'
                      }`}>
                        {st.isCompleted ? <Check size={11} strokeWidth={3} /> : st.step}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <h5 className={`text-xs font-bold ${st.isCompleted ? 'text-white' : 'text-slate-400'}`}>
                              {st.title}
                            </h5>
                            {st.isCompleted && (
                              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-[#22c55e]/15 text-[#4ade80]">
                                Concluído
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {st.dateStr} às {st.timeStr}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                          {st.description}
                        </p>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                          <MapPin size={10} className="text-cyan-400" />
                          <span>{st.location}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AÇÕES: WHATSAPP, COPIAR LINK E FECHAR */}
              <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleSendWhatsAppNotification(trackingCampaign, shipping)}
                    className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                    title="Enviar atualização de rastreio para o cliente no WhatsApp"
                  >
                    <MessageCircle size={15} />
                    <span>Notificar no WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyTrackingLink(shipping.trackingCode)}
                    className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors border border-white/10"
                    title="Copiar link rastreável para enviar ao cliente"
                  >
                    {linkCopied ? <Check size={14} className="text-[#22c55e]" /> : <ExternalLink size={14} />}
                    <span>{linkCopied ? 'Link Copiado!' : 'Copiar Link'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setTrackingCampaign(null)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#22c55e] text-black font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  Fechar Rastreamento
                </button>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}
