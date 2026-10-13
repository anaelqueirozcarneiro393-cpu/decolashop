'use client';

import React, { useState } from 'react';
import { User, Shield, Key, Sparkles, Mail, CheckCircle2, Lock, Zap, Eye, EyeOff } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { usePrivacy } from '@/lib/privacyContext';

export default function PerfilView() {
  const { data: session } = useSession();
  
  // Resolução prioritária do e-mail real do usuário (Sessão > localStorage > padrão)
  const getInitialEmail = () => {
    if (session?.user?.email) return session.user.email;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('decolashop_user_email') || localStorage.getItem('decolashop_active_user_email');
      if (stored) return stored;
    }
    return 'usuario@decolashop.com';
  };

  const getInitialName = (currentEmail: string) => {
    if (session?.user?.name) return session.user.name;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('decolashop_user_name');
      if (stored) return stored;
    }
    if (currentEmail && currentEmail !== 'usuario@decolashop.com') {
      return currentEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
    return 'Membro DecolaShop';
  };

  const [email, setEmail] = useState(getInitialEmail);
  const [name, setName] = useState(() => getInitialName(getInitialEmail()));
  const [isSaving, setIsSaving] = useState(false);
  const { hideEmail, toggleHideEmail, maskEmail } = usePrivacy();

  // Atualização reativa assim que a sessão NextAuth ou o localStorage carrega
  React.useEffect(() => {
    const realEmail = 
      session?.user?.email || 
      (typeof window !== 'undefined' ? (localStorage.getItem('decolashop_user_email') || localStorage.getItem('decolashop_active_user_email')) : null);

    if (realEmail) {
      setEmail(realEmail);
      if (typeof window !== 'undefined') {
        localStorage.setItem('decolashop_user_email', realEmail);
      }
    }

    const realName = 
      session?.user?.name || 
      (typeof window !== 'undefined' ? localStorage.getItem('decolashop_user_name') : null) || 
      (realEmail && realEmail !== 'usuario@decolashop.com' ? realEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : null);

    if (realName) {
      setName(realName);
      if (typeof window !== 'undefined') {
        localStorage.setItem('decolashop_user_name', realName);
      }
    }

    // Carrega dados salvos na nuvem se disponíveis
    if (realEmail) {
      fetch(`/api/user/sync-state?email=${encodeURIComponent(realEmail)}`)
        .then(r => r.json())
        .then(data => {
          if (data?.data?.userName && typeof data.data.userName === 'string') {
            setName(data.data.userName);
            if (typeof window !== 'undefined') {
              localStorage.setItem('decolashop_user_name', data.data.userName);
            }
          }
        })
        .catch(() => {});
    }
  }, [session]);

  const userEmail = email.toLowerCase().trim();
  const userRole = ((session?.user as any)?.role || '').toLowerCase();
  const isCarlos = userEmail.includes('carlos') || userEmail.includes('souza');
  const isNormalUser = userEmail === 'usuario@decolashop.com' || isCarlos;
  const isAdmin = !isNormalUser && (
    userEmail === 'gerente@decolashop.com' ||
    userEmail.includes('admin') || 
    userEmail.includes('gerente') || 
    userRole === 'gerente' || 
    userRole === 'admin'
  );
  const isSuperAdmin = userRole === 'admin' || userEmail.includes('admin');
  const userBadge = isAdmin ? (isSuperAdmin ? 'Administrador' : 'Gerente') : 'Membro VIP';
  const planBadge = isAdmin ? 'Acesso Total ∞ (Ilimitado)' : 'Plano Vitalício Ativo';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (typeof window !== 'undefined') {
      localStorage.setItem('decolashop_user_name', trimmedName);
      localStorage.setItem('decolashop_user_email', trimmedEmail);
      localStorage.setItem('decolashop_active_user_email', trimmedEmail);
    }

    // Sincroniza o perfil atualizado na nuvem para manter no celular e outros dispositivos
    fetch('/api/user/sync-state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: trimmedEmail,
        state: {
          userName: trimmedName,
          userEmail: trimmedEmail
        }
      })
    }).catch(() => {});

    setTimeout(() => {
      setIsSaving(false);
      toast.success('Perfil atualizado e sincronizado com sucesso!');
    }, 400);
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
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground font-mono">
                {hideEmail ? maskEmail(email) : email}
              </p>
              <button
                type="button"
                onClick={toggleHideEmail}
                className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                title={hideEmail ? "Mostrar e-mail" : "Ocultar e-mail (Modo Gravação)"}
              >
                {hideEmail ? <EyeOff size={13} className="text-[#22c55e]" /> : <Eye size={13} />}
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/30 px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.15)]">
                {userBadge}
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-primary/20 text-primary border border-primary/30 px-2.5 py-0.5 rounded-full">
                {planBadge}
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-300">E-mail Cadastrado</label>
              <button
                type="button"
                onClick={toggleHideEmail}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 cursor-pointer"
                title={hideEmail ? "Mostrar e-mail" : "Ocultar e-mail para gravação de tela"}
              >
                {hideEmail ? <EyeOff size={13} className="text-[#22c55e]" /> : <Eye size={13} />}
                <span className={hideEmail ? "text-[#4ade80] font-semibold" : ""}>
                  {hideEmail ? 'Modo Gravação: Oculto' : 'Ocultar E-mail'}
                </span>
              </button>
            </div>
            <div className="relative">
              <input
                type={hideEmail ? "password" : "email"}
                value={hideEmail ? maskEmail(email) : email}
                onChange={(e) => {
                  if (!hideEmail) setEmail(e.target.value);
                }}
                readOnly={hideEmail}
                className="w-full bg-secondary/30 border border-border/50 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 pr-10 font-mono"
              />
              <button
                type="button"
                onClick={toggleHideEmail}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                title={hideEmail ? "Mostrar e-mail" : "Ocultar e-mail"}
              >
                {hideEmail ? <EyeOff size={16} className="text-[#22c55e]" /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              E-mail principal vinculado ao faturamento e saques. Ocultado durante gravações de vídeo.
            </p>
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
