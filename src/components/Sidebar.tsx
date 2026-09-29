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
  ShoppingBasket
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
  { name: 'Divulgação com IA', id: 'divulgacao-ia', icon: Sparkles, badge: 'IA', badgeColor: 'bg-orange-100 text-[#ee4d2d] border-orange-200' },
  { name: 'Gerar Vídeos com IA', id: 'video-ia', icon: Video, badge: 'PRO', badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { name: 'Conexões e integrações', id: 'conectar', icon: Share2 },
  { name: 'Video aula', id: 'video-aula', icon: BookOpen },
  { name: 'Perfil', id: 'perfil', icon: User },
  { name: 'Fornecedores VIP', id: 'fornecedores', icon: Truck },
  { name: 'Calculadora de Margem', id: 'calculadora', icon: Calculator },
];

export default function Sidebar({ currentView, onNavigate, isOpen, setIsOpen }: SidebarProps) {
  const { data: session } = useSession();
  const userEmail = session?.user?.email || 'nextshopsaas@gmail.com';

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen w-64 bg-white/95 backdrop-blur-2xl border-r border-gray-100 shadow-sm transition-transform duration-300 ease-in-out flex flex-col",
      isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
    )}>
      <div className="flex flex-col h-full px-4 py-6 overflow-y-auto">
        {/* Brand Header */}
        <div className="flex items-center justify-between mb-8 px-2 flex-shrink-0">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ee4d2d] to-[#ff5722] flex items-center justify-center shadow-lg shadow-orange-500/25 text-white">
              <ShoppingBasket className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-gray-900 block leading-tight">
                Decola<span className="text-[#ee4d2d]">Shop</span>
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                NextShop SaaS
              </span>
            </div>
          </div>
          
          <button 
            onClick={() => setIsOpen?.(false)}
            className="p-2 rounded-xl bg-gray-50 md:hidden hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-gray-500" />
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
                  "flex items-center gap-3 px-3.5 py-2.5 w-full rounded-2xl transition-all duration-200 group text-left text-xs font-semibold",
                  isActive 
                    ? "bg-orange-50 text-[#ee4d2d] border border-orange-200/80 font-black shadow-sm" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className={cn(
                  "w-4 h-4 flex-shrink-0 transition-colors",
                  isActive ? "text-[#ee4d2d]" : "text-gray-400 group-hover:text-gray-700"
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
        <div className="mt-auto pt-4 border-t border-gray-100 flex-shrink-0 space-y-2">
          {/* User Email & Credits */}
          <div className="px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200/80">
            <p className="text-xs font-bold text-gray-900 truncate">{userEmail}</p>
            <div className="flex items-center gap-1.5 text-[10px] text-[#ee4d2d] font-black mt-0.5">
              <span>Admin Master</span>
              <span>•</span>
              <span>Créditos ∞</span>
            </div>
          </div>

          {/* Reembolso link */}
          <button
            onClick={() => onNavigate('reembolso')}
            className={cn(
              "flex items-center gap-2.5 px-3.5 py-2 w-full rounded-xl text-xs font-semibold transition-all text-left",
              currentView === 'reembolso' ? "bg-gray-100 text-gray-900 font-bold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
            )}
          >
            <ShieldAlert size={14} className="text-[#ee4d2d]" />
            <span>Reembolso</span>
          </button>

          {/* Logout button */}
          <button 
            onClick={() => signOut()}
            className="flex items-center gap-2.5 px-3.5 py-2 w-full rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors text-xs font-semibold text-left"
          >
            <LogOut size={14} />
            <span>Encerrar sessão</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
