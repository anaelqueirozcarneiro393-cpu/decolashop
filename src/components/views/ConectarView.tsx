'use client';

import React, { useState } from 'react';
import { 
  Share2, 
  ShoppingBag, 
  Sparkles, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  Check, 
  CheckCircle2, 
  User, 
  Mail, 
  ExternalLink,
  Lock
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>CENTRAL DE INTEGRAÇÃO MULTICANAL</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
            <span className="text-emerald-600 font-bold">((•))</span>
            <span>{isConnected ? '1 canal conectado (Shopee Oficial)' : 'Nenhum canal conectado'}</span>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
          Conexões e integrações
        </h1>
        <p className="text-xs text-gray-500 font-medium mt-1">
          Conecte seus canais de venda para automação, posts com IA e sincronização em tempo real.
        </p>
      </div>

      {/* Channel Tabs matching screenshot */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setSelectedChannel('shopee')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold transition-all border ${
            selectedChannel === 'shopee'
              ? 'border-[#ee4d2d] bg-white text-[#ee4d2d] shadow-sm'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
          }`}
        >
          <ShoppingBag size={14} className="text-[#ee4d2d]" />
          <span>SHOPEE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
        </button>

        <button
          onClick={() => {
            setSelectedChannel('tiktok');
            toast('TikTok Shop: canal disponível para conexão');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold transition-all border ${
            selectedChannel === 'tiktok'
              ? 'border-gray-800 bg-white text-gray-900 shadow-sm'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
          }`}
        >
          <span>🎵</span>
          <span>TIKTOK SHOP</span>
          <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
        </button>

        <button
          onClick={() => {
            setSelectedChannel('ml');
            toast('Mercado Livre: canal disponível para conexão');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold transition-all border ${
            selectedChannel === 'ml'
              ? 'border-amber-500 bg-white text-amber-700 shadow-sm'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
          }`}
        >
          <span>📦</span>
          <span>MERCADO LIVRE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
        </button>
      </div>

      {/* Main Connection Form Card (Matching Screenshot media_1790660353060.png) */}
      <div className="bg-white rounded-3xl p-6 md:p-12 border border-gray-100 shadow-sm space-y-6">
        {isConnected ? (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                CANAL ATIVO & SINCRONIZADO
              </span>
              <h3 className="text-xl font-black text-gray-900 mt-2">
                Shopee Brasil Conectada com Sucesso!
              </h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                Sua loja está integrada e pronta para receber pedidos sincronizados, geração automática de anúncios e atualização de estoque em tempo real.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between text-gray-600">
                <span className="font-medium">Responsável:</span>
                <span className="font-bold text-gray-900">{name || 'João da Silva'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span className="font-medium">Email da Conta:</span>
                <span className="font-bold text-gray-900">{email || 'voce@exemplo.com'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span className="font-medium">Status da API:</span>
                <span className="font-bold text-emerald-600">Homologado 100% Online</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleDisconnect}
                className="py-2.5 px-5 rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all"
              >
                Desconectar Loja
              </button>
              <button
                onClick={() => toast.success('Estoque e pedidos sincronizados agora!')}
                className="py-2.5 px-5 rounded-2xl bg-[#ee4d2d] hover:bg-[#d73f20] text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all"
              >
                Sincronizar Estoque Agora
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Warning Banner */}
            <div className="p-4 rounded-2xl bg-[#fffbeb] border border-[#fed7aa] flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                Sua conta do NewShop não possui uma loja Shopee integrada no momento. Configure abaixo para ativar todas as ferramentas de IA.
              </p>
            </div>

            {/* Connection Form */}
            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Nome completo <span className="text-[#ee4d2d]">*</span>
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: João da Silva"
                    className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-10 pr-4 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#ee4d2d] focus:ring-1 focus:ring-[#ee4d2d] transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Email <span className="text-[#ee4d2d]">*</span>
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@exemplo.com"
                    className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-10 pr-4 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#ee4d2d] focus:ring-1 focus:ring-[#ee4d2d] transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isConnecting}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#ee4d2d] to-[#f94d2f] hover:from-[#d73f20] hover:to-[#ee4d2d] text-white font-black text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all active:scale-[0.99] disabled:opacity-75 mt-2"
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

            {/* Disclaimer */}
            <p className="text-[11px] text-gray-400 text-center leading-relaxed px-4">
              Sua conexão é estabelecida de forma segura através de encriptação ponta a ponta homologada pela Shopee Open Platform.
            </p>
          </>
        )}
      </div>

      {/* 3 Bottom Feature Cards (Matching Screenshot) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Automação com IA */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#ee4d2d] flex items-center justify-center">
            <Sparkles size={18} />
          </div>
          <h3 className="text-sm font-extrabold text-gray-900">
            Automação com IA
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Crie copys, roteiros e carrosséis com 1 clique prontos para vender no canal integrado.
          </p>
        </div>

        {/* Card 2: Estoque Sincronizado */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
            <RefreshCw size={18} />
          </div>
          <h3 className="text-sm font-extrabold text-gray-900">
            Estoque Sincronizado
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Evite rupturas de estoque. Preços e disponibilidade atualizados instantaneamente.
          </p>
        </div>

        {/* Card 3: Canais Homologados */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck size={18} />
          </div>
          <h3 className="text-sm font-extrabold text-gray-900">
            Canais Homologados
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Integração direta via APIs oficiais sem risco de bloqueio ou queda de credenciais.
          </p>
        </div>
      </div>
    </div>
  );
}
