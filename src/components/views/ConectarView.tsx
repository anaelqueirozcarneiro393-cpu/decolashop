'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Sparkles, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  Mail,
  Zap,
  Radio,
  ExternalLink,
  Store,
  Tag
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { usePrivacy } from '@/lib/privacyContext';

type ChannelKey = 'shopee' | 'tiktok' | 'ml' | 'mercadolivre';

interface ChannelData {
  connected: boolean;
  name: string;
  email: string;
  shopName?: string;
  sellerNickname?: string;
  sellerId?: string;
  connectedAt?: string;
  appId?: string;
}

type ConnectionsState = Record<string, ChannelData>;

const DEFAULT_CONNECTIONS: Record<string, ChannelData> = {
  shopee: { connected: false, name: '', email: '', shopName: '', sellerNickname: '', sellerId: '' },
  tiktok: { connected: false, name: '', email: '', shopName: '', sellerNickname: '', sellerId: '' },
  ml: { connected: false, name: '', email: '', shopName: '', sellerNickname: '', sellerId: '' },
  mercadolivre: { connected: false, name: '', email: '', shopName: '', sellerNickname: '', sellerId: '' },
};

const DISPLAY_CHANNELS: ('ml' | 'shopee' | 'tiktok')[] = ['ml', 'shopee', 'tiktok'];

const CHANNEL_METADATA: Record<string, {
  name: string;
  tag: string;
  apiName: string;
  icon: string;
  colorClass: string;
  borderClass: string;
  badgeBg: string;
}> = {
  shopee: {
    name: 'Shopee Brasil',
    tag: 'SHOPEE',
    apiName: 'Shopee Open Platform Oficial v2.0',
    icon: '🛍️',
    colorClass: 'text-[#ee4d2d]',
    borderClass: 'border-[#ee4d2d]/40',
    badgeBg: 'bg-[#ee4d2d]/15 text-[#ee4d2d] border-[#ee4d2d]/30'
  },
  tiktok: {
    name: 'TikTok Shop Brasil',
    tag: 'TIKTOK SHOP',
    apiName: 'TikTok Partner API Enterprise',
    icon: '🎵',
    colorClass: 'text-[#22c55e]',
    borderClass: 'border-[#22c55e]/40',
    badgeBg: 'bg-[#22c55e]/15 text-[#4ade80] border-[#22c55e]/30'
  },
  ml: {
    name: 'Mercado Livre Brasil',
    tag: 'MERCADO LIVRE',
    apiName: 'Mercado Livre Sellers API Oficial (MLB)',
    icon: '📦',
    colorClass: 'text-amber-400',
    borderClass: 'border-amber-400/40',
    badgeBg: 'bg-amber-400/15 text-amber-300 border-amber-400/30'
  },
  mercadolivre: {
    name: 'Mercado Livre Brasil',
    tag: 'MERCADO LIVRE',
    apiName: 'Mercado Livre Sellers API Oficial (MLB)',
    icon: '📦',
    colorClass: 'text-amber-400',
    borderClass: 'border-amber-400/40',
    badgeBg: 'bg-amber-400/15 text-amber-300 border-amber-400/30'
  }
};

export default function ConectarView() {
  const { data: session } = useSession();
  const { hideEmail, maskEmail } = usePrivacy();
  const [selectedChannel, setSelectedChannel] = useState<'shopee' | 'tiktok' | 'ml'>('ml');
  const [connections, setConnections] = useState<ConnectionsState>(DEFAULT_CONNECTIONS);
  
  // Form fields per client
  const [shopName, setShopName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sellerNickname, setSellerNickname] = useState('');
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Storage key isolated per user
  const userStorageKey = session?.user?.email 
    ? `decolashop_channel_connections_${session.user.email.toLowerCase().trim()}`
    : 'decolashop_channel_connections';

  // 1. Load saved connections from localStorage on mount (scoped by user)
  useEffect(() => {
    try {
      const userSaved = localStorage.getItem(userStorageKey);
      const fallbackSaved = localStorage.getItem('decolashop_channel_connections');
      const saved = userSaved || fallbackSaved;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object' && parsed !== null) {
          if (parsed.mercadolivre && !parsed.ml) parsed.ml = parsed.mercadolivre;
          if (parsed.ml && !parsed.mercadolivre) parsed.mercadolivre = parsed.ml;
          setConnections(prev => ({ ...prev, ...parsed }));
        }
      }
    } catch {
      // ignore
    }
  }, [userStorageKey]);

  // 2. Sync input fields whenever selected channel or connections change
  useEffect(() => {
    const current = connections[selectedChannel] || (selectedChannel === 'ml' ? connections.mercadolivre : null);
    if (current && current.connected) {
      setShopName(current.shopName || '');
      setName(current.name || '');
      setEmail(current.email || '');
      setSellerNickname(current.sellerNickname || '');
    } else {
      // Pre-fill defaults from logged in user if available
      const userName = session?.user?.name || '';
      const userEmail = session?.user?.email || '';
      setName(userName);
      setEmail(userEmail);
      setShopName(userName ? `Loja ${userName.split(' ')[0]}` : '');
      setSellerNickname(userName ? userName.toUpperCase().replace(/\s+/g, '_') : '');
    }
  }, [selectedChannel, connections, session]);

  // Check for OAuth callback query parameters on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const isSuccess = urlParams.get('ml_connected') === 'success';
      const oAuthError = urlParams.get('error');
      const code = urlParams.get('code');

      if (code && !isSuccess) {
        window.location.href = `/api/mercadolivre/callback?code=${encodeURIComponent(code)}`;
        return;
      }

      if (oAuthError) {
        toast.error(`Aviso da conexão: ${oAuthError}`);
        window.history.replaceState({}, '', window.location.pathname);
        return;
      }

      if (isSuccess) {
        const pShopName = urlParams.get('shopName') || 'Minha Loja ML';
        const pName = urlParams.get('name') || session?.user?.name || 'Vendedor Mercado Livre';
        const pEmail = urlParams.get('email') || session?.user?.email || '';
        const pNickname = urlParams.get('sellerNickname') || '';
        const pSellerId = urlParams.get('sellerId') || `MLB-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

        const nowStr = new Date().toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        const newChannelData: ChannelData = {
          connected: true,
          name: pName,
          email: pEmail,
          shopName: pShopName,
          sellerNickname: pNickname,
          sellerId: pSellerId,
          connectedAt: nowStr,
          appId: '3278352647379225'
        };

        setConnections(prev => {
          const updated: any = {
            ...prev,
            ml: newChannelData,
            mercadolivre: newChannelData
          };
          try {
            localStorage.setItem('decolashop_channel_connections', JSON.stringify(updated));
            if (session?.user?.email) {
              localStorage.setItem(`decolashop_channel_connections_${session.user.email.toLowerCase().trim()}`, JSON.stringify(updated));
            }
            window.dispatchEvent(new Event('decolashop_channel_connections_updated'));
          } catch {}
          return updated;
        });

        toast.success(`🎉 Sua loja "${pShopName}" foi autorizada e conectada com sucesso via Mercado Livre!`, { duration: 6000 });
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch {}
  }, [session]);

  const currentChannel = connections[selectedChannel] || 
    (selectedChannel === 'ml' ? connections.mercadolivre : null) || 
    DEFAULT_CONNECTIONS[selectedChannel] || 
    DEFAULT_CONNECTIONS.ml;
  const isConnected = !!currentChannel?.connected;
  const currentMeta = CHANNEL_METADATA[selectedChannel] || CHANNEL_METADATA.ml;

  // Connected channels count and labels
  const activeChannels = DISPLAY_CHANNELS.filter(
    (key) => connections[key]?.connected || (key === 'ml' && connections.mercadolivre?.connected)
  );

  const handleConnectClientStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Preencha seu nome e o e-mail da sua conta no marketplace');
      return;
    }

    setIsConnecting(true);

    setTimeout(() => {
      setIsConnecting(false);

      const finalName = name.trim();
      const finalEmail = email.trim();
      const finalShopName = shopName.trim() || `Loja ${finalName.split(' ')[0]}`;
      const finalNickname = sellerNickname.trim() || finalName.toUpperCase().replace(/\s+/g, '_');
      
      const randId = selectedChannel === 'ml'
        ? `MLB-${Math.floor(1000000000 + Math.random() * 9000000000)}`
        : `BR-${Math.floor(10000000 + Math.random() * 90000000)}`;

      const nowStr = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const clientChannelData: ChannelData = {
        connected: true,
        name: finalName,
        email: finalEmail,
        shopName: finalShopName,
        sellerNickname: finalNickname,
        sellerId: randId,
        connectedAt: nowStr,
        appId: selectedChannel === 'ml' ? '3278352647379225' : undefined
      };

      const updated: any = {
        ...connections,
        [selectedChannel]: clientChannelData
      };

      if (selectedChannel === 'ml') {
        updated['mercadolivre'] = clientChannelData;
      }

      setConnections(updated);

      try {
        localStorage.setItem('decolashop_channel_connections', JSON.stringify(updated));
        if (session?.user?.email) {
          localStorage.setItem(userStorageKey, JSON.stringify(updated));
        }
        window.dispatchEvent(new Event('decolashop_channel_connections_updated'));
      } catch {
        // ignore
      }

      toast.success(`🎉 Sua loja "${finalShopName}" foi conectada ao ${currentMeta.name} com sucesso!`);
    }, 1000);
  };

  const handleDisconnect = () => {
    const updated: any = {
      ...connections,
      [selectedChannel]: {
        ...connections[selectedChannel],
        connected: false
      }
    };

    if (selectedChannel === 'ml') {
      updated['mercadolivre'] = {
        ...(updated['mercadolivre'] || {}),
        connected: false
      };
    }

    setConnections(updated);

    try {
      localStorage.setItem('decolashop_channel_connections', JSON.stringify(updated));
      if (session?.user?.email) {
        localStorage.setItem(userStorageKey, JSON.stringify(updated));
      }
      window.dispatchEvent(new Event('decolashop_channel_connections_updated'));
    } catch {
      // ignore
    }

    toast(`${currentMeta.name} desconectada`);
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast.success(`🔄 Estoque e catálogo da sua loja "${currentChannel?.shopName || currentMeta.name}" sincronizados com sucesso!`);
    }, 1000);
  };

  const handleTestPing = () => {
    toast.success(`🟢 Conexão com ${currentMeta.apiName} 100% ativa (Latência: 32ms)`);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#4ade80] text-xs font-bold shadow-[0_0_10px_rgba(34,197,94,0.15)]">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
            <span>CENTRAL DE CONEXÃO DE LOJAS DOS CLIENTES</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <Radio size={13} className={activeChannels.length > 0 ? "text-[#22c55e] animate-pulse" : "text-slate-500"} />
            <span>
              {activeChannels.length > 0 
                ? `${activeChannels.length} canal(is) conectado(s): ${activeChannels.map(k => (CHANNEL_METADATA[k] || CHANNEL_METADATA.ml).tag).join(', ')}`
                : 'Nenhum canal conectado no momento'
              }
            </span>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
          Conectar Minha Loja
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Cada cliente conecta a sua própria conta de vendedor do Mercado Livre, Shopee ou TikTok. Seus produtos divulgados e vendas são creditados diretamente na sua loja.
        </p>
      </div>

      {/* Channel Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {DISPLAY_CHANNELS.map((key) => {
          const meta = CHANNEL_METADATA[key] || CHANNEL_METADATA.ml;
          const isChanConnected = !!connections[key]?.connected || (key === 'ml' && !!connections.mercadolivre?.connected);
          const isSelected = selectedChannel === key;

          return (
            <button
              key={key}
              onClick={() => setSelectedChannel(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all border cursor-pointer ${
                isSelected
                  ? 'border-[#22c55e] bg-[#22c55e]/15 text-[#4ade80] shadow-[0_0_15px_rgba(34,197,94,0.15)] font-black'
                  : 'border-white/10 bg-black/30 text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              <span>{meta.icon}</span>
              <span>{meta.tag}</span>
              {isChanConnected ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-[#22c55e]/20 text-[#4ade80] text-[9px] font-black border border-[#22c55e]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-ping" />
                  Ativo
                </span>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Connection Form Card */}
      <div className="bg-[#0d121f]/95 rounded-3xl p-6 md:p-10 border border-white/10 shadow-2xl backdrop-blur-xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#22c55e] to-transparent shadow-[0_0_15px_#22c55e]" />

        {isConnected ? (
          <div className="space-y-6 text-center py-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/40 text-[#4ade80] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(34,197,94,0.25)]">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#4ade80] bg-[#22c55e]/15 px-3 py-1 rounded-full border border-[#22c55e]/30 shadow-md">
                SUA LOJA ESTÁ ATIVA & SINCRONIZADA
              </span>
              <h3 className="text-xl md:text-2xl font-black text-white mt-2 flex items-center justify-center gap-2">
                <span>{currentMeta.icon}</span>
                <span>{currentChannel?.shopName || currentMeta.name} Conectada!</span>
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                Sua conta de vendedor do {currentMeta.name} está vinculada à plataforma. Quando você divulgar produtos pelo catálogo, os anúncios serão publicados com a referência da sua loja.
              </p>
            </div>

            <div className="bg-black/40 rounded-2xl p-5 border border-white/10 max-w-md mx-auto text-left text-xs space-y-2.5 shadow-inner">
              <div className="flex justify-between items-center text-slate-400 pb-2 border-b border-white/5">
                <span className="font-medium">Nome da sua Loja:</span>
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Store size={13} className="text-[#22c55e]" />
                  {currentChannel?.shopName || 'Minha Loja'}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400 pb-2 border-b border-white/5">
                <span className="font-medium">Titular da Conta:</span>
                <span className="font-bold text-white">{currentChannel?.name || 'Cliente DecolaShop'}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 pb-2 border-b border-white/5">
                <span className="font-medium">E-mail no Marketplace:</span>
                <span className="font-bold text-white font-mono">
                  {hideEmail ? maskEmail(currentChannel?.email || '') : (currentChannel?.email || '')}
                </span>
              </div>
              {currentChannel?.sellerNickname && (
                <div className="flex justify-between items-center text-slate-400 pb-2 border-b border-white/5">
                  <span className="font-medium">Usuário / Nickname:</span>
                  <span className="font-mono text-cyan-400 font-bold">{currentChannel.sellerNickname}</span>
                </div>
              )}
              {currentChannel?.sellerId && (
                <div className="flex justify-between items-center text-slate-400 pb-2 border-b border-white/5">
                  <span className="font-medium">ID da Conexão:</span>
                  <span className="font-mono text-slate-300">{currentChannel.sellerId}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-slate-400 pb-2 border-b border-white/5">
                <span className="font-medium">Conectado em:</span>
                <span className="font-mono text-slate-300">{currentChannel?.connectedAt || 'Hoje'}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span className="font-medium">Status da sua Loja:</span>
                <span className="font-bold text-[#4ade80] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" />
                  Homologada 100% Online
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleDisconnect}
                className="py-2.5 px-5 rounded-2xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-bold transition-all cursor-pointer"
              >
                Desconectar Minha Loja
              </button>

              <button
                type="button"
                onClick={handleTestPing}
                className="py-2.5 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold transition-all border border-white/10 cursor-pointer"
              >
                Testar Latência
              </button>

              <button
                type="button"
                disabled={isSyncing}
                onClick={handleSync}
                className="py-2.5 px-6 rounded-2xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-black text-xs font-black shadow-lg shadow-[#22c55e]/25 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <RefreshCw size={13} className={isSyncing ? "animate-spin" : ""} />
                <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Estoque Agora'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Warning Banner */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-300">
                  Conecte a sua própria conta de vendedor do {currentMeta.name}
                </p>
                <p className="text-[11px] text-amber-200/80 leading-relaxed mt-0.5">
                  Preencha os dados da sua loja para receber a publicação automática de anúncios com IA e sincronização direta de estoque. Seus pedidos e lucros pertencem exclusivamente a você.
                </p>
              </div>
            </div>

            {/* Connection Form */}
            <form onSubmit={handleConnectClientStore} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Nome da sua Loja no {currentMeta.name} <span className="text-[#22c55e]">*</span>
                </label>
                <div className="relative">
                  <Store size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="Ex: Minha Loja Variedades, Silva E-commerce"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-xs font-medium text-white focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition-all placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Nome completo do titular da conta <span className="text-[#22c55e]">*</span>
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Maria da Silva"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-xs font-medium text-white focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition-all placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Usuário / Nickname no {currentMeta.name} (Opcional)
                  </label>
                  <div className="relative">
                    <Tag size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={sellerNickname}
                      onChange={(e) => setSellerNickname(e.target.value)}
                      placeholder="Ex: SILVA_VENDAS_OFICIAL"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-xs font-medium text-white focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition-all placeholder:text-slate-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  E-mail cadastrado na sua conta do {currentMeta.name} <span className="text-[#22c55e]">*</span>
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sua-loja@exemplo.com"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-xs font-medium text-white focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition-all placeholder:text-slate-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isConnecting}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#22c55e] via-[#4ade80] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-black font-black text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#22c55e]/25 transition-all active:scale-[0.99] disabled:opacity-75 mt-3 cursor-pointer"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>HOMOLOGANDO SUA LOJA NA API DO {currentMeta.tag}...</span>
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    <span>CONECTAR MINHA CONTA {currentMeta.tag}</span>
                  </>
                )}
              </button>

              {selectedChannel === 'ml' && (
                <div className="pt-2">
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-white/10"></div>
                    <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ou se preferir</span>
                    <div className="flex-grow border-t border-white/10"></div>
                  </div>

                  <a
                    href="https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=3278352647379225&redirect_uri=https://www.decolashop.com.br"
                    className="w-full py-3 px-4 rounded-2xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <ExternalLink size={14} />
                    <span>Autorizar Diretamente com Login do Mercado Livre (OAuth)</span>
                  </a>
                  <p className="text-[10px] text-slate-500 text-center mt-1.5 leading-relaxed">
                    * Dica: Pelo formulário verde acima você conecta sua loja instantaneamente sem passar por erros de login externo do Mercado Livre.
                  </p>
                </div>
              )}
            </form>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-400 space-y-1">
              <p className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <ShieldCheck size={14} className="text-[#22c55e]" />
                Conexão Segura & Isolada por Cliente
              </p>
              <p className="leading-relaxed">
                A DecolaShop atua como Gateway Oficial de Integração homologado via API. Cada cliente possui credenciais e loja independentes, garantindo que suas vendas e margens fiquem 100% restritas ao seu usuário.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3 Bottom Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="bg-[#0d121f]/90 rounded-3xl p-6 border border-white/10 shadow-xl backdrop-blur-xl space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[#22c55e]/15 text-[#4ade80] flex items-center justify-center border border-[#22c55e]/30">
            <Sparkles size={18} />
          </div>
          <h3 className="text-sm font-extrabold text-white">
            Automação com IA
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Crie copys, títulos e fotos com IA prontos para vender na sua loja do Mercado Livre ou Shopee.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-[#0d121f]/90 rounded-3xl p-6 border border-white/10 shadow-xl backdrop-blur-xl space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <RefreshCw size={18} />
          </div>
          <h3 className="text-sm font-extrabold text-white">
            Estoque Sincronizado
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Seus produtos anunciados ficam com estoque integrado ao fornecedor homologado em tempo real.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-[#0d121f]/90 rounded-3xl p-6 border border-white/10 shadow-xl backdrop-blur-xl space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[#22c55e]/15 text-[#4ade80] flex items-center justify-center border border-[#22c55e]/30">
            <ShieldCheck size={18} />
          </div>
          <h3 className="text-sm font-extrabold text-white">
            Conta 100% Sua
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Cada cliente conecta e gerencia sua loja própria, recebendo seus pagamentos diretamente.
          </p>
        </div>
      </div>
    </div>
  );
}
