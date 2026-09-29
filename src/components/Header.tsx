'use client';

import React from 'react';
import { Search, Bell, User, Menu } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';

interface HeaderProps {
  onMenuClick: () => void;
  session?: any;
}

export default function Header({ onMenuClick, session: propSession }: HeaderProps) {
  const { data: hookSession, status } = useSession();
  const session = propSession || hookSession;
  const isAuthenticated = !!session;
  
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between px-4 md:px-8 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="flex items-center gap-4 md:hidden">
        <button 
          onClick={onMenuClick}
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 max-w-xl hidden md:block">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#ee4d2d] transition-colors" />
          <input
            type="text"
            placeholder="Buscar produtos, vendas ou pedidos..."
            className="w-full bg-gray-100/80 border border-gray-200/80 rounded-xl py-2 pl-10 pr-4 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#ee4d2d]/20 focus:border-[#ee4d2d] transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
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
            <div className="w-8 h-8 rounded-xl border border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
              {session.user?.image ? (
                <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-gray-500" />
              )}
            </div>
          </div>
        ) : (
          <button 
            onClick={() => signIn()}
            className="px-4 py-1.5 text-xs font-black bg-[#ee4d2d] text-white rounded-xl hover:bg-[#d94121] transition-all shadow-md shadow-orange-500/20"
          >
            ENTRAR
          </button>
        )}
      </div>
    </header>
  );
}
