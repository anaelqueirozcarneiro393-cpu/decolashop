'use client';

import React, { useState } from 'react';
import { signIn } from "next-auth/react";
import { Mail, Lock, Key, ExternalLink, ShieldCheck, Sparkles, Crown } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LoginView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [purchaseCode, setPurchaseCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent, customCredentials?: { email?: string; password?: string; purchaseCode?: string; demoPlan?: string }) => {
    if (e) e.preventDefault();

    const targetEmail = customCredentials?.email || email || 'admin@newshop.com';
    const targetPassword = customCredentials?.password ?? password ?? 'admin123';
    const targetCode = customCredentials?.purchaseCode ?? purchaseCode;
    const targetPlan = customCredentials?.demoPlan;

    setIsLoading(true);
    try {
      const res = await signIn('credentials', {
        email: targetEmail,
        password: targetPassword,
        purchaseCode: targetCode,
        demoPlan: targetPlan,
        redirect: false,
      });

      if (res?.error) {
        toast.error('Erro ao autenticar. Verifique seus dados.');
      } else {
        toast.success(
          targetEmail.includes('admin') 
            ? '🚀 Bem-vindo, Administrador NewShop!' 
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

  const fillAdmin = () => {
    setEmail('admin@newshop.com');
    setPassword('admin123');
    setPurchaseCode('ADMIN-VIP');
    toast.success('Credenciais de Administrador preenchidas!');
  };

  return (
    <div className="min-h-screen bg-[#ea580c] flex items-center justify-center p-4 selection:bg-[#ea580c]/30">
      {/* Central Login Card */}
      <div className="max-w-[420px] w-full bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl relative">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center gap-2 mb-1.5">
            {/* Custom NewShop Shopping Bag / Cart Logo */}
            <div className="relative w-9 h-9 flex items-center justify-center">
              <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Cart Body */}
                <path d="M6 10H12L16.5 32H38L42 16H15" stroke="#ea580c" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                {/* Wheels */}
                <circle cx="19" cy="39" r="3" fill="#ea580c" />
                <circle cx="35" cy="39" r="3" fill="#ea580c" />
                {/* Blue Rocket / Fast Arrow */}
                <path d="M22 28L32 14M32 14H24M32 14V22" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              New<span className="text-[#2563eb]">Shop</span>
            </h1>
          </div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
            PLATAFORMA COM FORNECEDORES INTEGRADOS
          </p>
        </div>

        {/* Heading & Cadastre-se */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-2xl font-black text-slate-900 leading-none mb-1">
              Entrar
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Acesse sua conta NewShop.
            </p>
          </div>
          <button 
            type="button"
            onClick={fillAdmin}
            className="flex items-center gap-1 text-[11px] font-black uppercase text-[#ea580c] hover:text-[#c2410c] tracking-wider transition-colors pt-0.5"
            title="Preencher dados de Administrador"
          >
            CADASTRE-SE <ExternalLink size={12} className="stroke-[2.5]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
          {/* E-mail */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              E-mail
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50/70 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#ea580c] focus:bg-white focus:ring-2 focus:ring-[#ea580c]/20 transition-all font-medium"
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Senha
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-50/70 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#ea580c] focus:bg-white focus:ring-2 focus:ring-[#ea580c]/20 transition-all font-medium"
              />
            </div>
          </div>

          {/* Código de Compra */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Código de Compra
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                <Key size={18} />
              </div>
              <input
                type="text"
                value={purchaseCode}
                onChange={(e) => setPurchaseCode(e.target.value)}
                placeholder="Insira seu código de compra"
                className="w-full pl-10 pr-4 py-3 bg-slate-50/70 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#ea580c] focus:bg-white focus:ring-2 focus:ring-[#ea580c]/20 transition-all font-medium"
              />
            </div>
          </div>

          {/* Botão Entrar */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-[#ea580c] hover:bg-[#c2410c] active:scale-[0.99] text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-[#ea580c]/30 hover:shadow-xl hover:shadow-[#ea580c]/40 transition-all duration-200 flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-70"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'ENTRAR NA NEWSHOP'
            )}
          </button>
        </form>

        {/* Separator / Plans Header */}
        <div className="text-center my-5">
          <p className="text-[11px] font-bold text-slate-600 leading-tight">
            Ainda não possui o código de compra definitivo? Escolha um plano:
          </p>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card Vitalício (Laranja) */}
          <div
            onClick={() => handleLogin(undefined, { email: 'vip@newshop.com', password: 'demo', demoPlan: 'yearly', purchaseCode: 'VITALICIO-VIP' })}
            className="bg-[#ea580c] hover:bg-[#d94600] active:scale-[0.98] text-white rounded-2xl p-3.5 text-center shadow-md cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-wider mb-1 opacity-95">
                <Crown size={12} className="stroke-[2.5]" />
                <span>MAIS ESCOLHIDO</span>
              </div>
              <h3 className="font-black text-sm mb-1 tracking-tight">
                Plano Vitalício
              </h3>
              <div className="flex items-center justify-center gap-1.5 my-1">
                <span className="text-[11px] text-orange-200 line-through font-bold">R$ 297</span>
                <span className="text-base font-black text-white">R$ 179,90</span>
              </div>
            </div>
            <p className="text-[9px] text-orange-100 font-semibold mt-1">
              Pague 1x • 250% Créditos/dia
            </p>
          </div>

          {/* Card Mensal (Claro) */}
          <div
            onClick={() => handleLogin(undefined, { email: 'mensal@newshop.com', password: 'demo', demoPlan: 'yearly', purchaseCode: 'MENSAL-PRO' })}
            className="bg-white hover:bg-slate-50 border border-slate-200 active:scale-[0.98] text-slate-800 rounded-2xl p-3.5 text-center shadow-sm cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-[#ea580c] mb-1">
                <Sparkles size={12} className="stroke-[2.5]" />
                <span>RECORRENTE</span>
              </div>
              <h3 className="font-black text-sm mb-1 text-slate-900 tracking-tight">
                Plano Mensal
              </h3>
              <div className="flex items-baseline justify-center gap-1 my-1">
                <span className="text-base font-black text-slate-900">R$ 89,90</span>
                <span className="text-[11px] text-slate-500 font-medium">/ mês</span>
              </div>
            </div>
            <p className="text-[9px] text-slate-500 font-semibold mt-1">
              Assinatura Mensal • 100% Créditos/dia
            </p>
          </div>
        </div>

        {/* Quick Admin Helper Badge */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <div className="flex items-center gap-1 text-slate-500">
            <ShieldCheck size={13} className="text-[#ea580c]" />
            <span>Admin:</span>
            <code className="text-slate-700 font-bold bg-slate-100 px-1 py-0.5 rounded">admin@newshop.com</code>
          </div>
          <button
            type="button"
            onClick={fillAdmin}
            className="text-[#ea580c] hover:underline font-bold text-[10px] uppercase cursor-pointer"
          >
            Auto-Preencher
          </button>
        </div>

      </div>
    </div>
  );
}
