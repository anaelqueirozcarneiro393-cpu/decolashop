'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Zap, 
  Package, 
  Calculator,
  Truck,
  Settings, 
  TrendingUp,
  Shield,
  LogOut,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession, signOut } from 'next-auth/react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: any) => void;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

const navItems = [
  { name: 'Dashboard', id: 'dashboard', icon: LayoutDashboard },
  { name: 'Minerador Live', id: 'minerador', icon: Zap },
  { name: 'Meus Produtos', id: 'meus-produtos', icon: Package },
  { name: 'Calculadora de Margem', id: 'calculadora', icon: Calculator },
  { name: 'Fornecedores & VIP', id: 'fornecedores', icon: Truck },
  { name: 'Configurações', id: 'configuracoes', icon: Settings },
];

export default function Sidebar({ currentView, onNavigate, isOpen, setIsOpen }: SidebarProps) {
  const { data: session, status } = useSession();
  
  // @ts-ignore
  const plan = session?.user?.plan || 'free';
  const isPro = plan !== 'free';

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen w-64 glass border-r border-border transition-transform duration-300 ease-in-out",
      isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
    )}>
      <div className="flex flex-col h-full px-4 py-6">
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="w-10 h-10 rounded-xl apex-gradient flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="text-white w-6 h-6" fill="currentColor" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white block leading-tight">
                Decola<span className="apex-gradient-text">Shop</span>
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                Apex Intelligence
              </span>
            </div>
          </div>
          
          <button 
            onClick={() => setIsOpen?.(false)}
            className="p-2 rounded-lg bg-white/5 md:hidden hover:bg-white/10 transition-colors"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = currentView === item.id || (item.id === 'minerador' && (currentView === 'detalhe' || currentView === 'anuncio'));
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 w-full rounded-xl transition-all duration-200 group text-left text-sm",
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(16,185,129,0.1)] font-bold" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground font-medium"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive ? "text-primary" : "group-hover:text-foreground"
                )} />
                <span className="truncate">{item.name}</span>
                {item.id === 'minerador' && (
                  <span className="ml-auto flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-border">
          {status === 'authenticated' && (
            isPro ? (
              <div className="px-3 py-3 mb-3 rounded-xl bg-gradient-to-br from-orange-600/20 to-orange-400/10 border border-orange-500/30 relative overflow-hidden group">
                <div className="flex items-center gap-2 mb-1.5 relative z-10">
                  <div className="p-1 rounded-md bg-orange-500/20 shadow-[0_0_10px_rgba(251,146,60,0.3)]">
                    <Zap className="w-3.5 h-3.5 text-orange-400" />
                  </div>
                  <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">
                    MEMBRO VIP
                  </span>
                </div>
                <p className="text-[11px] text-orange-200/80 leading-snug relative z-10">
                  Minerador & IA Liberados
                </p>
              </div>
            ) : (
              <div 
                onClick={() => onNavigate('configuracoes')}
                className="px-3 py-3 mb-3 rounded-xl bg-secondary/50 border border-border cursor-pointer hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                    PLANO FREE
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Clique para assinar o VIP
                </p>
              </div>
            )
          )}
          
          <button 
            onClick={() => signOut()}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors group text-sm"
          >
            <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            <span className="font-medium">Sair da Conta</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
