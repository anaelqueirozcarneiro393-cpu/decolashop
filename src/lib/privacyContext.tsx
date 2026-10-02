'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface PrivacyContextType {
  hideEmail: boolean;
  toggleHideEmail: () => void;
  maskEmail: (email: string) => string;
}

const PrivacyContext = createContext<PrivacyContextType>({
  hideEmail: false,
  toggleHideEmail: () => {},
  maskEmail: (email: string) => email,
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
          ? '🛡️ Modo Gravação: E-mail da conta ocultado com sucesso!' 
          : '👁️ E-mail da conta visível novamente.', 
        {
          duration: 3000,
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
    const parts = email.split('@');
    if (parts.length !== 2) return '••••••••••••';
    const [user, domain] = parts;
    const firstChar = user[0] || '';
    const lastChar = user.length > 1 ? user[user.length - 1] : '';
    const domainParts = domain.split('.');
    const tld = domainParts.length > 1 ? '.' + domainParts[domainParts.length - 1] : '.com';
    return `${firstChar}••••••${lastChar}@••••••${tld}`;
  };

  return (
    <PrivacyContext.Provider value={{ hideEmail, toggleHideEmail, maskEmail }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export const usePrivacy = () => useContext(PrivacyContext);
