'use client';

import React from 'react';
import { LayoutDashboard, ShoppingBag, Megaphone, Wallet, Sparkles } from 'lucide-react';
import { ViewType } from '@/app/page';
import { useSales } from '@/lib/salesContext';

interface MobileBottomNavProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
}

export default function MobileBottomNav({ currentView, onNavigate }: MobileBottomNavProps) {
  const { saldoDisponivel, pedidos } = useSales();

  const navItems = [
    {
      id: 'dashboard' as ViewType,
      label: 'Início',
      icon: LayoutDashboard,
    },
    {
      id: 'catalogo' as ViewType,
      label: 'Catálogo',
      icon: ShoppingBag,
    },
    {
      id: 'divulgados' as ViewType,
      label: 'Divulgados',
      icon: Megaphone,
      badge: pedidos > 0 ? String(pedidos) : undefined,
    },
    {
      id: 'financeiro' as ViewType,
      label: 'Financeiro',
      icon: Wallet,
      hasDot: saldoDisponivel > 0,
    },
  ];

  return (
    <nav
      aria-label="Navegação móvel"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090d16]/95 backdrop-blur-2xl border-t border-white/10 px-2 py-1.5 shadow-[0_-8px_30px_rgba(0,0,0,0.8)]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'text-[#22c55e] scale-105' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon size={20} className={isActive ? 'drop-shadow-[0_0_8px_#22c55e]' : ''} />
                
                {/* Active neon dot */}
                {item.hasDot && !isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                )}

                {/* Badge count */}
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 px-1 py-0.2 min-w-[14px] text-[8px] font-black rounded-full bg-[#22c55e] text-black text-center shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] mt-1 font-bold ${
                isActive ? 'text-[#4ade80] font-black' : 'text-slate-400'
              }`}>
                {item.label}
              </span>

              {/* Active Pill Indicator */}
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#22c55e] mt-0.5 shadow-[0_0_6px_#22c55e]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
