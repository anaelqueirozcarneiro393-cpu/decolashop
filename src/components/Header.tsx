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
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between px-4 md:px-8 bg-dark-bg/50 backdrop-blur-md border-b border-border/50">
      <div className="flex items-center gap-4 md:hidden">
        <button 
          onClick={onMenuClick}
          className="p-2 rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary transition-colors"
        >
          <Menu className="w-6 h-6 text-foreground" />
        </button>
      </div>

      <div className="flex-1 max-w-xl hidden md:block">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Buscar produtos, fontes ou nichos..."
            className="w-full bg-secondary/30 border border-border/50 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2.5 rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary transition-colors group">
          <Bell className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-dark-bg animate-pulse" />
        </button>
        
        <div className="h-8 w-[1px] bg-border/50 mx-1 hidden sm:block" />

        {isAuthenticated ? (
          <div className="flex items-center gap-3 pl-2 cursor-pointer group">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{session.user?.name || 'Usuário'}</span>
              <span className={`text-[10px] font-black uppercase tracking-widest opacity-90 ${
                // @ts-ignore
                session.user?.plan !== 'free' ? 'text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]' : 'text-primary'
              }`}>
                {/* @ts-ignore */}
                {session.user?.plan !== 'free' ? 'MEMBRO VIP' : 'PLANO FREE'}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl border border-border/50 group-hover:border-primary transition-all overflow-hidden bg-secondary/30 flex items-center justify-center p-0.5">
              {session.user?.image ? (
                <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover rounded-[10px]" />
              ) : (
                <User className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
          </div>
        ) : (
          <button 
            onClick={() => signIn()}
            className="px-6 py-2.5 text-sm font-black bg-primary text-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
          >
            ENTRAR
          </button>
        )}
      </div>
    </header>
  );
}
