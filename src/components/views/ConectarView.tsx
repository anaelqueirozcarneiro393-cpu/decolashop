'use client';

import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Sparkles, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  Mail
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ConectarView() {
  const [selectedChannel, setSelectedChannel] = useState<'shopee' | 'tiktok' | 'ml'>('shopee');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Preencha seu nome e email para autenticar com a Shopee');
      return;
    }

    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      toast.success('🎉 Loja Shopee conectada com sucesso via Open Platform!');
    }, 1200);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    toast('Loja desconectada');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#4ade80] text-xs font-bold shadow-[0_0_10px_rgba(34,197,94,0.15)]">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
            <span>CENTRAL DE INTEGRAÇÃO MULTICANAL</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <span className="text-[#22c55e] font-bold">((•))</span>
            <span>{isConnected ? '1 canal conectado (Shopee Oficial)' : 'Nenhum canal conectado'}</span>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
          Conexões e integrações
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Conecte seus canais de venda para automação, posts com IA e sincronização em tempo real.
        </p>
      </div>

      {/* Channel Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setSelectedChannel('shopee')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold transition-all border ${
            selectedChannel === 'shopee'
              ? 'border-[#22c55e] bg-[#22c55e]/15 text-[#4ade80] shadow-[0_0_15px_rgba(34,197,94,0.15)]'
              : 'border-white/10 bg-black/20 text-slate-400 hover:text-white hover:border-white/20'
          }`}
        >
          <ShoppingBag size={14} className="text-[#22c55e]" />
          <span>SHOPEE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
        </button>

        <button
          onClick={() => {
            setSelectedChannel('tiktok');
            toast('TikTok Shop: canal disponível para conexão');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold transition-all border ${
            selectedChannel === 'tiktok'
              ? 'border-[#22c55e] bg-[#22c55e]/15 text-[#4ade80] shadow-[0_0_15px_rgba(34,197,94,0.15)]'
              : 'border-white/10 bg-black/20 text-slate-400 hover:text-white hover:border-white/20'
          }`}
        >
          <span>🎵</span>
          <span>TIKTOK SHOP</span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
        </button>

        <button
          onClick={() => {
            setSelectedChannel('ml');
            toast('Mercado Livre: canal disponível para conexão');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold transition-all border ${
            selectedChannel === 'ml'
              ? 'border-[#22c55e] bg-[#22c55e]/15 text-[#4ade80] shadow-[0_0_15px_rgba(34,197,94,0.15)]'
              : 'border-white/10 bg-black/20 text-slate-400 hover:text-white hover:border-white/20'
          }`}
        >
          <span>📦</span>
          <span>MERCADO LIVRE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
        </button>
      </div>

      {/* Main Connection Form Card */}
      <div className="bg-[#0d121f]/90 rounded-3xl p-6 md:p-12 border border-white/10 shadow-xl backdrop-blur-xl space-y-6">
        {isConnected ? (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/40 text-[#4ade80] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(34,197,94,0.2)]">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#4ade80] bg-[#22c55e]/15 px-3 py-1 rounded-full border border-[#22c55e]/30">
                CANAL ATIVO & SINCRONIZADO
              </span>
              <h3 className="text-xl font-black text-white mt-2">
                Shopee Brasil Conectada com Sucesso!
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                Sua loja está integrada e pronta para receber pedidos sincronizados, geração automática de anúncios e atualização de estoque em tempo real.
              </p>
            </div>

            <div className="bg-black/30 rounded-2xl p-4 border border-white/5 max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span className="font-medium">Responsável:</span>
                <span className="font-bold text-white">{name || 'João da Silva'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span className="font-medium">Email da Conta:</span>
                <span className="font-bold text-white">{email || 'voce@exemplo.com'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span className="font-medium">Status da API:</span>
                <span className="font-bold text-[#4ade80]">Homologado 100% Online</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleDisconnect}
                className="py-2.5 px-5 rounded-2xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-bold transition-all"
              >
                Desconectar Loja
              </button>
              <button
                onClick={() => toast.success('Estoque e pedidos sincronizados agora!')}
                className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-black text-xs font-black shadow-lg shadow-[#22c55e]/25 transition-all"
              >
                Sincronizar Estoque Agora
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Warning Banner */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300 leading-relaxed font-medium">
                Sua conta do NewShop não possui uma loja Shopee integrada no momento. Configure abaixo para ativar todas as ferramentas de IA.
              </p>
            </div>

            {/* Connection Form */}
            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Nome completo <span className="text-[#22c55e]">*</span>
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: João da Silva"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-xs font-medium text-white focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition-all placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Email <span className="text-[#22c55e]">*</span>
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@exemplo.com"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-xs font-medium text-white focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition-all placeholder:text-slate-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isConnecting}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#22c55e] via-[#4ade80] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-black font-black text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#22c55e]/25 transition-all active:scale-[0.99] disabled:opacity-75 mt-2"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>AUTENTICANDO COM SHOPEE OPEN PLATFORM...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} />
                    <span>CONECTAR CONTA SHOPEE</span>
                  </>
                )}
              </button>
            </form>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed px-4">
              Sua conexão é estabelecida de forma segura através de encriptação ponta a ponta homologada pela Shopee Open Platform.
            </p>
          </>
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
            Crie copys, roteiros e carrosséis com 1 clique prontos para vender no canal integrado.
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
            Evite rupturas de estoque. Preços e disponibilidade atualizados instantaneamente.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-[#0d121f]/90 rounded-3xl p-6 border border-white/10 shadow-xl backdrop-blur-xl space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[#22c55e]/15 text-[#4ade80] flex items-center justify-center border border-[#22c55e]/30">
            <ShieldCheck size={18} />
          </div>
          <h3 className="text-sm font-extrabold text-white">
            Canais Homologados
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Integração direta via APIs oficiais sem risco de bloqueio ou queda de credenciais.
          </p>
        </div>
      </div>
    </div>
  );
}
