'use client';

import React from 'react';
import { Lock, Zap, CheckCircle2 } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function UpgradeBlocker({ user }: { user?: any }) {
  const isAuthenticated = !!user;
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border glass-darker p-8 md:p-12 text-center animate-in fade-in zoom-in duration-500">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 blur-[100px] -z-10" />
      
      <div className="max-w-md mx-auto space-y-6">
        <div className="inline-flex p-4 rounded-2xl bg-secondary/50 border border-border shadow-xl">
          <Lock className="w-10 h-10 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Acesso <span className="apex-gradient-text">Restrito</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {isAuthenticated 
              ? <>O Minerador Live de alta performance está disponível apenas para membros do plano <span className="text-foreground font-semibold">Apex Pro</span>.</>
              : <>Faça login para acessar o Minerador Live de alta performance e encontrar produtos virais.</>
            }
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 text-left py-6">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
            <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
            <span className="text-sm font-medium">Produtos minerados em tempo real (YouTube/Google)</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
            <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
            <span className="text-sm font-medium">Filtros avançados de volume e viralidade</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
            <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
            <span className="text-sm font-medium">Links de afiliado gerados automaticamente via IA</span>
          </div>
        </div>

        <button 
          onClick={() => isAuthenticated ? null : signIn()}
          className="group relative w-full py-4 rounded-xl font-bold text-lg overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="absolute inset-0 apex-gradient" />
          <div className="relative flex items-center justify-center gap-2">
            <Zap className="w-5 h-5 fill-current" />
            {isAuthenticated ? 'Upgrade para Apex Pro' : 'Login para Acessar'}
          </div>
        </button>
        
        <p className="text-xs text-muted-foreground italic">
          Liberte o poder da mineração assimétrica hoje mesmo.
        </p>
      </div>
    </div>
  );
}
