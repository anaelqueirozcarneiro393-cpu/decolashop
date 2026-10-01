'use client';

import React, { useState } from 'react';
import { Settings, Shield, User, CreditCard, Sparkles, Check, ExternalLink, RefreshCw, Key } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import CnpayCheckoutModal from '@/components/checkout/CnpayCheckoutModal';

export default function SettingsView() {
  const { data: session, update } = useSession();
  // @ts-ignore
  const plan = session?.user?.plan || 'free';
  const isVip = plan !== 'free';

  const [isUpdating, setIsUpdating] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const toggleTestPlan = async () => {
    setIsUpdating(true);
    const newPlan = isVip ? 'free' : 'yearly';
    try {
      await update({ plan: newPlan });
      toast.success(newPlan === 'yearly' ? 'Plano alterado para VIP (Teste)!' : 'Plano alterado para Free (Teste)!');
      window.location.reload();
    } catch {
      toast.error('Erro ao alternar plano');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 text-muted-foreground text-xs font-bold mb-3 border border-border/50">
          <Settings className="w-3.5 h-3.5" />
          <span>Preferências da Conta</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-2">
          Configurações & <span className="apex-gradient-text">Assinatura</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          Gerencie os dados da sua conta, status do plano e integrações de IA e pagamento.
        </p>
      </div>

      {/* User Card */}
      <div className="glass rounded-3xl p-6 md:p-8 border-border/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-secondary/40 border border-border/50 overflow-hidden flex items-center justify-center p-1">
            {session?.user?.image ? (
              <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <User className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{session?.user?.name || 'Membro DecolaShop'}</h3>
            <p className="text-xs text-muted-foreground">{session?.user?.email || 'email@exemplo.com'}</p>
            <div className="mt-2 inline-flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                isVip
                  ? 'bg-[#22c55e]/20 text-[#4ade80] border-[#22c55e]/30'
                  : 'bg-primary/10 text-primary border-primary/20'
              }`}>
                {isVip ? '★ MEMBRO VIP ANUAL' : 'PLANO GRATUITO'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => signOut()}
          className="px-4 py-2 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-white transition-all text-xs font-bold"
        >
          Encerrar Sessão
        </button>
      </div>

      {/* Subscription Card */}
      <div className="glass rounded-3xl p-6 md:p-8 border-border/50 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#22c55e]/15 flex items-center justify-center text-[#4ade80] border border-[#22c55e]/30">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white">Status da Assinatura</h3>
              <p className="text-xs text-muted-foreground">Processamento instantâneo via Pix Seguro (SigiloPay)</p>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-black ${
            isVip ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-secondary/40 text-muted-foreground border border-border/50'
          }`}>
            {isVip ? 'ATIVO & REGULAR' : 'CONTA GRATUITA'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Plano Atual:</span>
            <span className="font-bold text-white capitalize">{isVip ? 'VIP Vitalício (Acesso Ilimitado)' : 'Gratuito (Limitado)'}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Minerador Live em Tempo Real:</span>
            <span className="font-bold text-emerald-400">{isVip ? 'Liberado Ilimitado' : 'Bloqueado (Paywall)'}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Gerador de Anúncios e Criativos IA:</span>
            <span className="font-bold text-emerald-400">{isVip ? 'Gemini 2.5 + Llama 3.3' : 'Bloqueado'}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {!isVip ? (
            <button
              type="button"
              onClick={() => setShowUpgradeModal(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-black font-extrabold text-xs hover:from-[#4ade80] hover:to-[#22c55e] transition-all shadow-lg shadow-[#22c55e]/25 active:scale-95"
            >
              <Sparkles size={16} /> Fazer Upgrade com Order Bumps (Pix Seguro)
            </button>
          ) : (
            <div className="flex-1 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <Check size={16} /> Você já possui todos os recursos premium liberados!
            </div>
          )}

          {/* Developer test toggle */}
          <button
            onClick={toggleTestPlan}
            disabled={isUpdating}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-secondary/50 hover:bg-secondary text-slate-300 font-bold text-xs border border-border/50 transition-all"
          >
            <RefreshCw size={14} className={isUpdating ? 'animate-spin' : ''} />
            <span>Alternar Plano para Teste ({isVip ? 'Mudar para Free' : 'Mudar para VIP'})</span>
          </button>
        </div>
      </div>

      {/* CN Pay Native Checkout Modal with Order Bumps */}
      <CnpayCheckoutModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        defaultPlan="lifetime"
      />

      {/* Connected AI Models Status */}
      <div className="glass rounded-3xl p-6 md:p-8 border-border/50 space-y-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Key size={18} className="text-primary" /> Motores de Inteligência Artificial Ativos
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <p className="font-bold text-white">Google Gemini 2.5 Flash</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Geração de Copy & Prompts de Cena</p>
            </div>
            <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/30">CONECTADO</span>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <p className="font-bold text-white">Groq (Llama 3.3 70B & 8B)</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Fallback de Alta Velocidade</p>
            </div>
            <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/30">CONECTADO</span>
          </div>
        </div>
      </div>
    </div>
  );
}
