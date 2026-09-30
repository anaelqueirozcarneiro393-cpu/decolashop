'use client';

import React, { useState } from 'react';
import { signIn } from "next-auth/react";
import { Mail, Lock, Key, ExternalLink, ShieldCheck, Sparkles, Crown, Rocket, X, Check, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import CnpayCheckoutModal from '@/components/checkout/CnpayCheckoutModal';

export default function LoginView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [purchaseCode, setPurchaseCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlanModal, setSelectedPlanModal] = useState<'lifetime' | 'monthly' | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Informe seu e-mail');
      return;
    }

    setIsLoading(true);
    try {
      const res = await signIn('credentials', {
        email: email.trim(),
        password: password.trim(),
        purchaseCode: purchaseCode.trim(),
        redirect: false,
      });

      if (res?.error) {
        toast.error('Erro ao autenticar. Verifique seus dados.');
      } else {
        toast.success(
          (email.toLowerCase().includes('admin') || email.toLowerCase().includes('gerente'))
            ? '🚀 Bem-vindo ao DecolaShop, Gerente!' 
            : 'Login realizado com sucesso!'
        );
        window.location.reload();
      }
    } catch {
      toast.error('Erro na conexão com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const fillGerente = () => {
    setEmail('gerente@decolashop.com');
    setPassword('admin123');
    setPurchaseCode('GERENTE-VIP');
    toast.success('Credenciais de Gerente preenchidas! Clique em Entrar.');
  };

  const fillUser = () => {
    setEmail('usuario@decolashop.com');
    setPassword('user123');
    setPurchaseCode('');
    toast.success('Credenciais de Usuário Comum preenchidas! Clique em Entrar.');
  };

  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-4 selection:bg-[#22c55e]/30 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] bg-[#22c55e]/15 rounded-full blur-[140px] -z-10 animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] bg-[#10b981]/15 rounded-full blur-[140px] -z-10 animate-pulse pointer-events-none" />

      {/* Central Login Card */}
      <div className="max-w-[430px] w-full bg-[#111726] border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-2xl relative z-10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center gap-3 mb-2">
            {/* DecolaShop Official Logo */}
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-[#22c55e]/40 shadow-xl shadow-[#22c55e]/25 flex-shrink-0 bg-black">
              <img 
                src="/images/decolashop-icon.jpg" 
                alt="DecolaShop Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">
              Decola<span className="text-[#22c55e]">Shop</span>
            </h1>
          </div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            PLATAFORMA COM FORNECEDORES INTEGRADOS
          </p>
        </div>

        {/* Heading & Cadastre-se */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-2xl font-black text-white leading-none mb-1">
              Entrar
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Acesse sua conta DecolaShop.
            </p>
          </div>
          <button 
            type="button"
            onClick={() => setSelectedPlanModal('lifetime')}
            className="flex items-center gap-1 text-[11px] font-black uppercase text-[#22c55e] hover:text-[#4ade80] tracking-wider transition-colors pt-0.5 cursor-pointer"
            title="Cadastre-se e ative seu acesso"
          >
            CADASTRE-SE <ArrowRight size={12} className="stroke-[2.5]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* E-mail */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              E-mail
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-slate-500 pointer-events-none">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full pl-10 pr-4 py-3 bg-[#0d131f] border border-white/10 rounded-2xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/20 transition-all font-medium"
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Senha
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-slate-500 pointer-events-none">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-[#0d131f] border border-white/10 rounded-2xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/20 transition-all font-medium"
              />
            </div>
          </div>

          {/* Código de Compra */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Código de Compra
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-slate-500 pointer-events-none">
                <Key size={18} />
              </div>
              <input
                type="text"
                value={purchaseCode}
                onChange={(e) => setPurchaseCode(e.target.value)}
                placeholder="Insira seu código de compra"
                className="w-full pl-10 pr-4 py-3 bg-[#0d131f] border border-white/10 rounded-2xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/20 transition-all font-medium"
              />
            </div>
          </div>

          {/* Botão Entrar */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-[#22c55e] hover:bg-[#16a34a] active:scale-[0.99] text-[#080c14] font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-[#22c55e]/25 hover:shadow-xl hover:shadow-[#22c55e]/35 transition-all duration-200 flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-70"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-[#080c14] border-t-transparent rounded-full animate-spin" />
            ) : (
              'ENTRAR NA DECOLASHOP'
            )}
          </button>

          {/* Direct Cadastre-se Link */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => setSelectedPlanModal('lifetime')}
              className="text-xs text-slate-300 hover:text-[#4ade80] transition-colors cursor-pointer font-medium"
            >
              Não tem uma conta? <strong className="text-[#22c55e] underline underline-offset-4">Cadastre-se aqui</strong>
            </button>
          </div>
        </form>

        {/* Separator / Plans Header */}
        <div className="text-center my-5">
          <p className="text-[11px] font-bold text-slate-400 leading-tight">
            Ainda não possui o código de compra definitivo? Escolha um plano:
          </p>
        </div>

        {/* Plan Cards Grid (Clicar aqui ABRE A OPÇÃO DE COMPRA, NÃO LOGA!) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card Vitalício */}
          <div
            onClick={() => setSelectedPlanModal('lifetime')}
            className="bg-gradient-to-b from-[#22c55e]/20 to-[#15803d]/20 border border-[#22c55e]/40 hover:border-[#22c55e] active:scale-[0.98] text-white rounded-2xl p-3.5 text-center shadow-md cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-wider mb-1 text-[#4ade80]">
                <Crown size={12} className="stroke-[2.5]" />
                <span>MAIS ESCOLHIDO</span>
              </div>
              <h3 className="font-black text-sm mb-1 tracking-tight text-white group-hover:text-[#4ade80] transition-colors">
                Plano Vitalício
              </h3>
              <div className="flex items-center justify-center gap-1.5 my-1">
                <span className="text-[11px] text-slate-400 line-through font-bold">R$ 297</span>
                <span className="text-base font-black text-white">R$ 179,90</span>
              </div>
            </div>
            <p className="text-[9px] text-[#4ade80] font-semibold mt-1">
              Pague 1x • 250% Créditos/dia
            </p>
          </div>

          {/* Card Mensal */}
          <div
            onClick={() => setSelectedPlanModal('monthly')}
            className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 active:scale-[0.98] text-white rounded-2xl p-3.5 text-center shadow-sm cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-[#4ade80] mb-1">
                <Sparkles size={12} className="stroke-[2.5]" />
                <span>RECORRENTE</span>
              </div>
              <h3 className="font-black text-sm mb-1 text-white group-hover:text-slate-200 tracking-tight">
                Plano Mensal
              </h3>
              <div className="flex items-baseline justify-center gap-1 my-1">
                <span className="text-base font-black text-white">R$ 89,90</span>
                <span className="text-[11px] text-slate-400 font-medium">/ mês</span>
              </div>
            </div>
            <p className="text-[9px] text-slate-400 font-semibold mt-1">
              Assinatura Mensal • 100% Créditos/dia
            </p>
          </div>
        </div>

        {/* Quick Login Helpers (Gerente & Usuário Comum) */}
        <div className="mt-4 pt-3 border-t border-white/5 space-y-2 text-[11px] text-slate-400 font-medium">
          {/* Gerente */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-[#22c55e]" />
              <span className="font-bold text-slate-300">Gerente:</span>
              <code className="text-[#22c55e] font-mono text-[10px] bg-[#22c55e]/10 px-1.5 py-0.5 rounded border border-[#22c55e]/20">
                gerente@decolashop.com
              </code>
            </div>
            <button
              type="button"
              onClick={fillGerente}
              className="text-[#22c55e] hover:text-[#4ade80] font-black text-[10px] uppercase cursor-pointer"
            >
              Preencher
            </button>
          </div>

          {/* Usuário Normal */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Mail size={13} className="text-cyan-400" />
              <span className="font-bold text-slate-300">Usuário:</span>
              <code className="text-cyan-400 font-mono text-[10px] bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                usuario@decolashop.com
              </code>
            </div>
            <button
              type="button"
              onClick={fillUser}
              className="text-cyan-400 hover:text-cyan-300 font-black text-[10px] uppercase cursor-pointer"
            >
              Preencher
            </button>
          </div>
        </div>

      </div>

      {/* Checkout Nativo Transparente com Order Bumps & CN Pay Pix */}
      <CnpayCheckoutModal
        isOpen={!!selectedPlanModal}
        onClose={() => setSelectedPlanModal(null)}
        defaultPlan={selectedPlanModal || 'lifetime'}
        onSuccess={() => {
          setSelectedPlanModal(null);
          toast.success('Acesso liberado! Digite seu e-mail para acessar o painel.');
        }}
      />

    </div>
  );
}
