'use client';

import React from 'react';
import { Search, Bell, User, Menu, Zap } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';
import { useSales } from '@/lib/salesContext';

interface HeaderProps {
  onMenuClick: () => void;
  session?: any;
}

export default function Header({ onMenuClick, session: propSession }: HeaderProps) {
  const { data: hookSession, status } = useSession();
  const session = propSession || hookSession;
  const isAuthenticated = !!session;
  const userEmail = session?.user?.email?.toLowerCase().trim() || '';
  const userRole = (session?.user as any)?.role || '';
  const isNormalUser = userEmail === 'usuario@decolashop.com' || userEmail === 'cliente@decolashop.com' || userEmail === 'user@decolashop.com';
  const isAdmin = !isNormalUser && (
    userEmail.includes('admin') || 
    userEmail.includes('gerente') || 
    userRole === 'gerente' || 
    userRole === 'admin'
  );
  const userBadge = isAdmin ? 'Gerente' : 'Membro VIP';
  
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between px-4 md:px-8 bg-[#090d16]/90 backdrop-blur-xl border-b border-white/10 text-white">
      <div className="flex items-center gap-3 md:hidden">
        <button 
          onClick={onMenuClick}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg overflow-hidden border border-[#22c55e]/40 shadow-sm flex-shrink-0 bg-black">
            <img src="/images/decolashop-icon.jpg" alt="DecolaShop" className="w-full h-full object-cover" />
          </div>
          <span className="font-black text-sm text-white">
            Decola<span className="text-[#22c55e]">Shop</span>
          </span>
        </div>
      </div>

      <div className="flex-1 max-w-xl hidden md:block">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#22c55e] transition-colors" />
          <input
            type="text"
            placeholder="Buscar produtos, vendas, métricas ou pedidos..."
            className="w-full bg-[#0d121f] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#22c55e]/30 focus:border-[#22c55e] transition-all placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#22c55e] rounded-full ring-2 ring-[#090d16] animate-pulse" />
        </button>
        
        <div className="h-6 w-[1px] bg-white/10 mx-1 hidden sm:block" />

        {isAuthenticated ? (
          <div className="flex items-center gap-3 pl-1 cursor-pointer group">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-xs font-bold text-slate-200 group-hover:text-[#4ade80] transition-colors">
                {session.user?.name || session.user?.email || 'admin@decolashop.com'}
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#22c55e]">
                {userBadge}
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl border border-[#22c55e]/40 overflow-hidden bg-black/50 flex items-center justify-center p-0.5 shadow-md shadow-[#22c55e]/15">
              {session.user?.image ? (
                <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <img src="/images/decolashop-icon.jpg" alt="DecolaShop" className="w-full h-full object-cover rounded-lg" />
              )}
            </div>
          </div>
        ) : (
          <button 
            onClick={() => signIn()}
            className="px-4 py-1.5 text-xs font-black bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-black rounded-xl hover:from-[#4ade80] hover:to-[#22c55e] transition-all shadow-md shadow-[#22c55e]/20"
          >
            ENTRAR
          </button>
        )}
      </div>
    </header>
  );
}
