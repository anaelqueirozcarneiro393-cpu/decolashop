'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, Menu, Zap, Volume2, VolumeX, CheckCircle, X } from 'lucide-react';
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

  const { isSoundEnabled, toggleSound, recentSales } = useSales();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between px-4 md:px-8 bg-[#090d16]/90 backdrop-blur-xl border-b border-white/10 text-white">
      <div className="flex items-center gap-3 md:hidden">
        <button 
          onClick={onMenuClick}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
          title="Abrir Menu"
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

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Som de Notificação Toggle */}
        <button
          onClick={toggleSound}
          title={isSoundEnabled ? "Som ativado (clique para silenciar)" : "Som desativado (clique para ativar)"}
          className={`p-2 rounded-xl border transition-all ${
            isSoundEnabled 
              ? 'bg-[#22c55e]/10 border-[#22c55e]/30 text-[#4ade80] hover:bg-[#22c55e]/20' 
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Notificações Bell com Dropdown Popover */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`relative p-2 rounded-xl transition-colors ${
              isNotifOpen ? 'bg-[#22c55e]/20 text-[#4ade80]' : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
            }`}
            title="Notificações de Vendas"
          >
            <Bell className="w-4 h-4" />
            {recentSales.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#22c55e] rounded-full ring-2 ring-[#090d16] animate-pulse" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-[#0c1220]/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3.5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" />
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Notificações de Vendas
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#22c55e]/20 text-[#4ade80] font-black border border-[#22c55e]/30">
                    {recentSales.length}
                  </span>
                </div>
                <button 
                  onClick={() => setIsNotifOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                {recentSales.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">
                    <p className="text-xs">Nenhuma notificação nova no momento.</p>
                    <p className="text-[10px] text-slate-500 mt-1">Vendas aprovadas aparecerão aqui automaticamente.</p>
                  </div>
                ) : (
                  recentSales.slice(0, 10).map((sale) => (
                    <div key={sale.id} className="p-3 hover:bg-white/[0.03] transition-colors flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-black/40 border border-white/10 flex-shrink-0 flex items-center justify-center">
                        {sale.image ? (
                          <img src={sale.image} alt={sale.product} className="w-full h-full object-cover" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-[#22c55e]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-bold text-white truncate">{sale.product}</p>
                          <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">{sale.time}</span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-[10px] text-slate-400">
                            Venda: <strong className="text-slate-300 font-mono">R$ {sale.value.toFixed(2).replace('.', ',')}</strong>
                          </span>
                          <span className="text-xs font-black text-[#22c55e] font-mono">
                            +R$ {sale.commission.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="h-6 w-[1px] bg-white/10 mx-1 hidden sm:block" />

        {isAuthenticated ? (
          <div className="flex items-center gap-3 pl-1 cursor-pointer group">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-xs font-bold text-slate-200 group-hover:text-[#4ade80] transition-colors">
                {session.user?.name || session.user?.email || 'gerente@decolashop.com'}
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
