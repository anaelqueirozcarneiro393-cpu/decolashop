'use client';

import React, { useState } from 'react';
import { User, Shield, Key, Sparkles, Mail, CheckCircle2, Lock, Zap } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

export default function PerfilView() {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name || 'Administrador Master');
  const [email, setEmail] = useState(session?.user?.email || 'nextshopsaas@gmail.com');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Perfil atualizado com sucesso!');
    }, 600);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3 border border-primary/20">
          <User className="w-3.5 h-3.5" />
          <span>Configurações do Perfil</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-2">
          Meu <span className="apex-gradient-text">Perfil & Credenciais</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          Gerencie suas informações de acesso e nível de permissões no sistema.
        </p>
      </div>

      {/* User Status Card */}
      <div className="glass rounded-3xl p-6 md:p-8 border border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl apex-gradient flex items-center justify-center text-white shadow-xl shadow-primary/20">
            <User size={32} />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">{name}</h3>
            <p className="text-xs text-muted-foreground">{email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/30 px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.15)]">
                Admin Master
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-primary/20 text-primary border border-primary/30 px-2.5 py-0.5 rounded-full">
                Créditos ∞ (Ilimitado)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="glass rounded-3xl p-6 md:p-8 border border-border/50">
        <h3 className="text-lg font-black text-white mb-6">Informações Pessoais</h3>
        <form onSubmit={handleSave} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Nome Completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-secondary/30 border border-border/50 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">E-mail Cadastrado</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full bg-secondary/15 border border-border/30 rounded-xl py-3 px-4 text-sm text-slate-400 cursor-not-allowed"
            />
            <p className="text-[11px] text-muted-foreground mt-1">E-mail principal vinculado ao faturamento e saques.</p>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-primary text-black font-extrabold text-xs hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </div>
    </div>
  );
}
