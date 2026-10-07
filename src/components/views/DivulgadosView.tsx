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
  RotateCcw,
  Trash2
} from 'lucide-react';
import SafeImage from '@/components/SafeImage';
import FindGroupsButton from '@/components/FindGroupsButton';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { 
  DivulgadoCampaign, 
  getDivulgados, 
  saveDivulgados, 
  toggleDivulgadoStatus, 
  removeDivulgado, 
  getDivulgadosStats,
  INITIAL_DIVULGADOS,
  MAX_ACTIVE_CAMPAIGNS,
  isGerenteOrAdminEmail 
} from '@/lib/divulgados';

interface DivulgadosViewProps {
  onNavigate: (view: any, product?: any) => void;
}

export default function DivulgadosView({ onNavigate }: DivulgadosViewProps) {
  const { data: session } = useSession();
  const userEmail = session?.user?.email?.toLowerCase().trim();
  const isGerente = isGerenteOrAdminEmail(userEmail);

  const [campaigns, setCampaigns] = useState<DivulgadoCampaign[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedCampaign, setSelectedCampaign] = useState<DivulgadoCampaign | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    // Load from storage
    const loaded = getDivulgados(userEmail);
    setCampaigns(loaded);

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

  const categories = ['Todas', ...Array.from(new Set(campaigns.map(c => c.category).filter(Boolean)))];

  const filteredCampaigns = campaigns.filter(c => {
    const matchStatus = 
      statusFilter === 'all' ? true : 
      statusFilter === 'active' ? c.status === 'active' : 
      c.status === 'paused';
    
    const matchCategory = selectedCategory === 'Todas' || c.category === selectedCategory;
    const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchStatus && matchCategory && matchSearch;
  });

  const stats = getDivulgadosStats(campaigns);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22c55e]/15 text-[#4ade80] border border-[#22c55e]/30 text-xs font-bold mb-2 shadow-[0_0_10px_rgba(34,197,94,0.15)]">
            <Megaphone className="w-3.5 h-3.5 text-[#22c55e]" />
            <span>CENTRAL DE TRANSMISSÃO & TRÁFEGO</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-2">
            Produtos Divulgados
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/30 font-bold">
              {stats.activeCount} Ativos
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
            Monitore em tempo real as campanhas divulgadas pela IA nas redes sociais, impressões, cliques e conversões.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
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
            <span>Transmitindo em 6 redes</span>
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
            <span>+14.8% nas últimas 24h</span>
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
            <span>Taxa Média: 3.9% CTR</span>
          </div>
        </div>

        {/* Faturamento */}
        <div className="rounded-2xl p-4 sm:p-5 bg-[#0d121f]/90 border border-white/10 hover:border-[#22c55e]/30 transition-all shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Vendas Estimadas</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#4ade80]">
            R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1 mt-2 text-[10px] sm:text-xs text-amber-400 font-bold">
            <span>{stats.totalSales} pedidos • ROAS {stats.avgRoas}x</span>
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
              placeholder="Buscar produto divulgado..."
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
            const formattedPrice = typeof camp.price === 'string'
              ? camp.price
              : `R$ ${camp.price?.toFixed(2) || '99,90'}`;

            const isActive = camp.status === 'active';

            return (
              <div
                key={camp.id}
                className={`rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-[#0d121f]/90 border transition-all shadow-xl backdrop-blur-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5 ${
                  isActive
                    ? 'border-white/10 hover:border-[#22c55e]/40'
                    : 'border-white/5 opacity-75 hover:opacity-100 hover:border-amber-400/30'
                }`}
              >
                {/* Left: Product Info */}
                <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                  {/* Image with status badge */}
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
                  </div>

                  {/* Text details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-400">
                        {camp.category}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock size={11} />
                        {new Date(camp.createdAt).toLocaleDateString('pt-BR')} às {new Date(camp.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
                      {camp.name}
                    </h3>

                    <div className="flex items-center gap-3 mt-1.5 text-xs">
                      <span className="font-black text-[#4ade80] text-sm">
                        {formattedPrice}
                      </span>
                      {camp.commission && (
                        <span className="text-slate-400 text-[11px]">
                          Comissão: <strong className="text-white">{camp.commission}</strong>
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
                      R$ {camp.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
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
                  {typeof selectedCampaign.price === 'string' ? selectedCampaign.price : `R$ ${selectedCampaign.price?.toFixed(2)}`}
                  {selectedCampaign.commission && (
                    <span className="text-slate-400 font-normal ml-2">Comissão: {selectedCampaign.commission}</span>
                  )}
                </p>
              </div>
            </div>

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
                <span className="text-sm font-black text-[#4ade80] mt-1 block">R$ {selectedCampaign.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
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
    </div>
  );
}
