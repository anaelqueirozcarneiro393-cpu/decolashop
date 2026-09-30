'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  ShoppingBag, 
  Sparkles, 
  Video, 
  Share2, 
  BookOpen, 
  User, 
  Calculator, 
  Truck, 
  ShieldAlert, 
  LogOut, 
  X,
  Zap,
  ShoppingBasket,
  Flame,
  Megaphone
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
  { name: 'Financeiro', id: 'financeiro', icon: Wallet },
  { name: 'Catálogo', id: 'catalogo', icon: ShoppingBag },
  { name: 'Minerador Live', id: 'minerador', icon: Flame, badge: 'HOT', badgeColor: 'bg-[#ef4444]/20 text-[#f87171] border-[#ef4444]/30' },
  { name: 'Divulgação com IA', id: 'divulgacao-ia', icon: Sparkles, badge: 'IA', badgeColor: 'bg-[#22c55e]/20 text-[#4ade80] border-[#22c55e]/30' },
  { name: 'Produtos Divulgados', id: 'divulgados', icon: Megaphone, badge: 'ATIVO', badgeColor: 'bg-[#06b6d4]/20 text-[#22d3ee] border-[#06b6d4]/30' },
  { name: 'Gerar Vídeos com IA', id: 'video-ia', icon: Video, badge: 'PRO', badgeColor: 'bg-[#84cc16]/20 text-[#a3e635] border-[#84cc16]/30' },
  { name: 'Conexões e integrações', id: 'conectar', icon: Share2 },
  { name: 'Video aula', id: 'video-aula', icon: BookOpen },
  { name: 'Perfil', id: 'perfil', icon: User },
  { name: 'Fornecedores VIP', id: 'fornecedores', icon: Truck },
  { name: 'Calculadora de Margem', id: 'calculadora', icon: Calculator },
];

export default function Sidebar({ currentView, onNavigate, isOpen, setIsOpen }: SidebarProps) {
  const { data: session } = useSession();
  const userEmail = session?.user?.email || 'admin@decolashop.com';

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen w-64 bg-[#080c14]/95 backdrop-blur-2xl border-r border-[#22c55e]/15 transition-transform duration-300 ease-in-out flex flex-col",
      isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
    )}>
      <div className="flex flex-col h-full px-4 py-6 overflow-y-auto">
        {/* Brand Header */}
        <div className="flex items-center justify-between mb-8 px-2 flex-shrink-0">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('dashboard')}>
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-[#22c55e]/40 shadow-lg shadow-[#22c55e]/25 flex-shrink-0 bg-black group-hover:border-[#22c55e] transition-all group-hover:scale-105">
              <img 
                src="/images/decolashop-icon.jpg" 
                alt="DecolaShop Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white block leading-tight">
                Decola<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22c55e] to-[#4ade80]">Shop</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Escala & Vendas IA
              </span>
            </div>
          </div>
          
          <button 
            onClick={() => setIsOpen?.(false)}
            className="p-2 rounded-lg bg-white/5 md:hidden hover:bg-white/10 transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 w-full rounded-xl transition-all duration-200 group text-left text-xs font-semibold",
                  isActive 
                    ? "bg-[#22c55e]/15 text-[#4ade80] border border-[#22c55e]/35 shadow-[0_0_15px_rgba(34,197,94,0.15)] font-black" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "w-4 h-4 flex-shrink-0",
                  isActive ? "text-[#22c55e]" : "group-hover:text-white"
                )} />
                <span className="truncate flex-1">{item.name}</span>
                {item.badge && (
                  <span className={cn(
                    "text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md border",
                    item.badgeColor
                  )}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Footer matching appnewshop */}
        <div className="mt-auto pt-4 border-t border-white/10 flex-shrink-0 space-y-2">
          {/* User Email & Credits */}
          <div className="px-3 py-2 rounded-xl bg-[#0f1523] border border-white/10">
            <p className="text-xs font-bold text-white truncate">{userEmail}</p>
            <div className="flex items-center gap-1.5 text-[10px] text-[#22c55e] font-extrabold mt-0.5">
              <span>Admin Master</span>
              <span>•</span>
              <span>Créditos ∞</span>
            </div>
          </div>

          {/* Reembolso link */}
          <button
            onClick={() => onNavigate('reembolso')}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 w-full rounded-xl text-xs font-semibold transition-all text-left",
              currentView === 'reembolso' ? "bg-white/10 text-white font-bold" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            )}
          >
            <ShieldAlert size={14} className="text-[#4ade80]" />
            <span>Reembolso</span>
          </button>

          {/* Logout button */}
          <button 
            onClick={() => signOut()}
            className="flex items-center gap-2.5 px-3 py-2 w-full rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors text-xs font-semibold text-left"
          >
            <LogOut size={14} />
            <span>Encerrar sessão</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
