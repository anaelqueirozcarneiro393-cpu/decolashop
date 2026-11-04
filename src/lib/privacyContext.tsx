'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface PrivacyContextType {
  hideEmail: boolean;
  toggleHideEmail: () => void;
  maskEmail: (email: string) => string;
  maskName: (name?: string | null) => string;
  maskBadge: (badge?: string) => string;
  maskPlan: (plan?: string) => string;
}

const PrivacyContext = createContext<PrivacyContextType>({
  hideEmail: false,
  toggleHideEmail: () => {},
  maskEmail: (email: string) => email,
  maskName: (name?: string | null) => name || 'Membro DecolaShop',
  maskBadge: (badge?: string) => badge || 'Membro VIP',
  maskPlan: (plan?: string) => plan || 'Plano Vitalício',
});

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [hideEmail, setHideEmail] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('decolashop_hide_email');
      if (saved === 'true') {
        setHideEmail(true);
      }
    } catch {}
  }, []);

  const toggleHideEmail = () => {
    setHideEmail((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('decolashop_hide_email', String(next));
      } catch {}
      
      toast(
        next 
          ? '🛡️ Modo Gravação: Perfil exibido como membro comum e dados ocultos!' 
          : '👁️ Modo Gravação desativado: Visualização original restaurada.', 
        {
          duration: 3200,
          icon: next ? '🔒' : '👁️',
          style: {
            background: '#0d121f',
            color: '#fff',
            border: next ? '1px solid #22c55e' : '1px solid #64748b',
            fontSize: '12px',
            fontWeight: 'bold',
          }
        }
      );

      return next;
    });
  };

  const maskEmail = (email: string): string => {
    if (!email) return '••••••••••••';
    const lower = email.toLowerCase().trim();
    // Se for conta de gerente ou admin, mascara para e-mail neutro de membro comum
    if (lower.includes('gerente') || lower.includes('admin')) {
      return 'm••••••p@••••••.com';
    }
    const parts = email.split('@');
    if (parts.length !== 2) return '••••••••••••';
    const [user, domain] = parts;
    const firstChar = user[0] || '';
    const lastChar = user.length > 1 ? user[user.length - 1] : '';
    const domainParts = domain.split('.');
    const tld = domainParts.length > 1 ? '.' + domainParts[domainParts.length - 1] : '.com';
    return `${firstChar}••••••${lastChar}@••••••${tld}`;
  };

  const maskName = (name?: string | null): string => {
    if (!name) return 'Membro DecolaShop';
    const lower = name.toLowerCase().trim();
    if (lower.includes('gerente') || lower.includes('admin') || lower.includes('administrador')) {
      return 'Membro DecolaShop';
    }
    return name;
  };

  const maskBadge = (badge?: string): string => {
    if (!badge) return 'Membro VIP';
    const lower = badge.toLowerCase().trim();
    if (lower.includes('gerente') || lower.includes('admin') || lower.includes('administrador')) {
      return 'Membro VIP';
    }
    return badge;
  };

  const maskPlan = (plan?: string): string => {
    if (!plan) return 'Plano Vitalício';
    const lower = plan.toLowerCase().trim();
    if (lower.includes('total') || lower.includes('ilimitado') || lower.includes('infinito')) {
      return 'Plano Vitalício';
    }
    return plan;
  };

  return (
    <PrivacyContext.Provider value={{ 
      hideEmail, 
      toggleHideEmail, 
      maskEmail,
      maskName,
      maskBadge,
      maskPlan
    }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export const usePrivacy = () => useContext(PrivacyContext);
