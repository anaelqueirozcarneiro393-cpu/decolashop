'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

/**
 * AntiInspectionShield
 * Proteção avançada contra inspeção (DevTools, botão direito, atalhos de desenvolvedor)
 * e contra clonagem para usuários comuns.
 * 
 * Para contas ADMINISTRADOR e GERENTE: TODOS os atalhos de desenvolvedor, 
 * F12, DevTools e botão direito são 100% LIBERADOS.
 */
export default function AntiInspectionShield() {
  const { data: session } = useSession();
  const userEmail = session?.user?.email?.toLowerCase().trim() || '';
  const userRole = ((session?.user as any)?.role || '').toLowerCase().trim();

  // Verifica se a conta é Admin ou Gerente
  const isAdminOrGerente = Boolean(
    userEmail === 'admin@decolashop.com' ||
    userEmail === 'gerente@decolashop.com' ||
    userEmail.startsWith('admin@') ||
    userEmail.startsWith('gerente@') ||
    userEmail.includes('admin') ||
    userRole === 'admin' ||
    userRole === 'gerente'
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Se for Administrador ou Gerente, NÃO aplica NENHUM bloqueio! Atalhos 100% livres!
    if (isAdminOrGerente) {
      return;
    }

    // Verificação auxiliar via localStorage para evitar bloqueio durante transições
    try {
      const localEmail = (localStorage.getItem('decolashop_user_email') || '').toLowerCase().trim();
      if (
        localEmail === 'admin@decolashop.com' ||
        localEmail === 'gerente@decolashop.com' ||
        localEmail.includes('admin') ||
        localEmail.includes('gerente')
      ) {
        return;
      }
    } catch {}

    // 1. Anti-Frame / Anti-Iframe Cloning (Framebusting)
    try {
      if (window.top && window.top !== window.self) {
        window.top.location.href = window.self.location.href;
      }
    } catch {
      // Bloqueio se estiver encapsulado em domínio de terceiros
      document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#0a0e27;color:#fff;font-family:sans-serif;"><h2>Acesso não autorizado via iframe.</h2></div>';
    }

    // 2. Bloqueio de Botão Direito (Context Menu) - Permite em inputs para colar/digitar
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target && 
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
    };

    // 3. Bloqueio de Teclas de Atalho de Desenvolvedor e Cópia de Código
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 (DevTools)
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // Ctrl+Shift+I / Cmd+Option+I (Inspecionar)
      // Ctrl+Shift+J / Cmd+Option+J (Console)
      // Ctrl+Shift+C / Cmd+Option+C (Inspecionar Elemento)
      // Ctrl+Shift+K (Console Firefox)
      if (isCtrlOrMeta && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c', 'K', 'k'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+U / Cmd+Option+U (Exibir Código Fonte da Página)
      if (isCtrlOrMeta && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+S / Cmd+S (Salvar Página Completa / Assets)
      if (isCtrlOrMeta && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+P / Cmd+P (Imprimir / Salvar em PDF)
      if (isCtrlOrMeta && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // 4. Bloqueio de Arrastar Imagens (Anti-Download rápido de assets)
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.tagName === 'IMG') {
        e.preventDefault();
      }
    };

    // 5. Aviso de Segurança no Console e Limpeza
    const printConsoleWarning = () => {
      try {
        console.clear();
        console.log(
          '%c⛔ ACESSO RESTRITO ⛔',
          'color: #ef4444; font-size: 24px; font-weight: 900;'
        );
        console.log(
          '%cEsta aplicação é protegida por direitos autorais e sistemas anti-clonagem. Qualquer tentativa de inspeção não autorizada é registrada.',
          'color: #22c55e; font-size: 12px; font-weight: bold;'
        );
      } catch {}
    };

    printConsoleWarning();

    // 6. Anti-Debugger Loop quando DevTools estiver aberta
    const debuggerInterval = setInterval(() => {
      const threshold = 160;
      const isDevToolsOpen =
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold;

      if (isDevToolsOpen) {
        printConsoleWarning();
        try {
          (function() { return false; }['constructor']('debugger')());
        } catch {}
      }
    }, 1500);

    // Registra listeners globais
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('dragstart', handleDragStart, true);

    return () => {
      clearInterval(debuggerInterval);
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('dragstart', handleDragStart, true);
    };
  }, []);

  return null;
}
