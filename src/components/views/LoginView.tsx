'use client';

import React, { useState } from 'react';
import { signIn } from "next-auth/react";
import { LogIn, Zap, Shield, TrendingUp, Sparkles, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LoginView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState<string | null>(null);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Informe seu e-mail');
      return;
    }
    setIsLoading(true);
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        toast.error('Erro ao autenticar. Verifique seus dados.');
      } else {
        toast.success('Login realizado com sucesso!');
        window.location.reload();
      }
    } catch {
      toast.error('Erro na conexão');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (plan: 'yearly' | 'free') => {
    setIsDemoLoading(plan);
    try {
      const demoEmail = plan === 'yearly' ? 'vip@decolashop.com' : 'visitante@decolashop.com';
      const res = await signIn('credentials', {
        email: demoEmail,
        password: 'demo',
        demoPlan: plan,
        redirect: false,
      });
      if (res?.error) {
        toast.error('Erro ao iniciar sessão demo');
      } else {
        toast.success(plan === 'yearly' ? '✨ Bem-vindo ao DecolaShop VIP!' : 'Modo Visitante iniciado!');
        window.location.reload();
      }
    } catch {
      toast.error('Falha ao autenticar demo');
    } finally {
      setIsDemoLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] bg-[#22c55e]/15 rounded-full blur-[140px] -z-10 animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] bg-[#10b981]/15 rounded-full blur-[140px] -z-10 animate-pulse" />

      <div className="max-w-lg w-full glass rounded-3xl p-8 md:p-10 border-white/10 shadow-2xl relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#22c55e] to-[#15803d] rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-[#22c55e]/25 border border-white/20 text-black">
            <Zap className="text-black w-9 h-9 fill-current" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">
            Decola<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22c55e] to-[#4ade80]">Shop</span>
          </h1>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">
            Mineração de Produtos & Anúncios Virais com IA
          </p>
        </div>

        {/* 1-Click Fast Access Boxes */}
        <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span>Acesso Rápido para Teste</span>
            <span className="text-[10px] text-[#4ade80] bg-[#22c55e]/15 px-2 py-0.5 rounded-full border border-[#22c55e]/30">1-Clique</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleDemoLogin('yearly')}
              disabled={!!isDemoLoading || isLoading}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-br from-[#22c55e]/20 to-[#10b981]/20 hover:from-[#22c55e]/30 hover:to-[#10b981]/30 border border-[#22c55e]/40 text-white font-bold text-xs transition-all hover:scale-[1.02] active:scale-95 text-center shadow-lg"
            >
              <div className="flex items-center gap-1 text-[#4ade80] font-black text-xs mb-1">
                <Sparkles size={14} /> VIP Completo
              </div>
              <span className="text-[11px] text-slate-300 font-medium">Sem paywall, IA liberada</span>
            </button>

            <button
              onClick={() => handleDemoLogin('free')}
              disabled={!!isDemoLoading || isLoading}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-secondary/40 hover:bg-secondary/70 border border-border/50 text-white font-bold text-xs transition-all hover:scale-[1.02] active:scale-95 text-center"
            >
              <div className="flex items-center gap-1 text-slate-300 font-bold text-xs mb-1">
                <CheckCircle2 size={14} /> Modo Gratuito
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Testar Paywall e Checkout</span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
          <span className="relative bg-dark-bg px-3 text-xs text-muted-foreground uppercase font-bold tracking-wider">ou acesse sua conta</span>
        </div>

        {/* Form Login */}
        <form onSubmit={handleCredentialsLogin} className="space-y-3 mb-4">
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu-email@exemplo.com"
              className="w-full bg-secondary/30 border border-border/50 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-white placeholder:text-muted-foreground/50 transition-all"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha (opcional para teste)"
              className="w-full bg-secondary/30 border border-border/50 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-white placeholder:text-muted-foreground/50 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !!isDemoLoading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-black font-extrabold py-3.5 px-6 rounded-xl hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/20 text-sm"
          >
            {isLoading ? 'Entrando...' : 'Entrar com E-mail'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Google OAuth Button */}
        <button
          onClick={() => signIn('google')}
          className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-slate-100 transition-all active:scale-95 shadow-md text-sm border border-slate-200"
        >
          <LogIn className="w-4 h-4" />
          Continuar com Google
        </button>

        <p className="mt-6 text-center text-[11px] text-muted-foreground leading-relaxed">
          Ao prosseguir, você concorda com nossos <br className="hidden sm:block" />
          <span className="underline cursor-pointer hover:text-primary transition-colors">Termos de Uso</span> 
          <span className="mx-2">e</span>
          <span className="underline cursor-pointer hover:text-primary transition-colors">Política de Privacidade</span>.
        </p>
      </div>

      {/* Trust Badges */}
      <div className="mt-8 flex flex-wrap justify-center items-center gap-4 text-muted-foreground/60 text-xs font-bold uppercase tracking-wider">
        <span className="flex items-center gap-1.5"><TrendingUp size={14} className="text-primary" /> Tendências em Tempo Real</span>
        <span>•</span>
        <span className="flex items-center gap-1.5"><Sparkles size={14} className="text-[#4ade80]" /> IA Gemini & Llama Integradas</span>
        <span>•</span>
        <span className="flex items-center gap-1.5"><Shield size={14} className="text-emerald-400" /> Pagamento Seguro IronPay</span>
      </div>
    </div>
  );
}

