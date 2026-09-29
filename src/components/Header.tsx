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
  const { data: hookSession } = useSession();
  const session = propSession || hookSession;
  const isAuthenticated = !!session;
  const { addSale } = useSales();
  
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between px-4 md:px-8 bg-white/95 backdrop-blur-xl border-b border-gray-100 text-gray-900 shadow-sm">
      <div className="flex items-center gap-4 md:hidden">
        <button 
          onClick={onMenuClick}
          className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 max-w-xl hidden md:block">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#ee4d2d] transition-colors" />
          <input
            type="text"
            placeholder="Buscar produtos, vendas, métricas ou pedidos..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#ee4d2d]/20 focus:border-[#ee4d2d] transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick sale button for Admin */}
        <button
          onClick={() => addSale()}
          className="hidden sm:flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-[#ee4d2d] text-xs font-black transition-all active:scale-95 shadow-sm"
          title="Atalho: Simular Nova Venda (Alt + V)"
        >
          <Zap size={13} fill="currentColor" />
          <span>+ Venda</span>
        </button>

        <button className="relative p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ee4d2d] rounded-full ring-2 ring-white animate-pulse" />
        </button>
        
        <div className="h-6 w-[1px] bg-gray-200 mx-1 hidden sm:block" />

        {isAuthenticated ? (
          <div className="flex items-center gap-3 pl-1 cursor-pointer group">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-xs font-bold text-gray-800 group-hover:text-[#ee4d2d] transition-colors">
                {session.user?.name || 'nextshopsaas@gmail.com'}
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#ee4d2d]">
                Admin Master
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl border border-orange-200 overflow-hidden bg-orange-50 flex items-center justify-center p-0.5">
              {session.user?.image ? (
                <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <User className="w-4 h-4 text-gray-600" />
              )}
            </div>
          </div>
        ) : (
          <button 
            onClick={() => signIn()}
            className="px-4 py-1.5 text-xs font-black bg-[#ee4d2d] hover:bg-[#d73f20] text-white rounded-xl transition-all shadow-md shadow-orange-500/20"
          >
            ENTRAR
          </button>
        )}
      </div>
    </header>
  );
}
