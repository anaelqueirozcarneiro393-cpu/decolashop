'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import OnboardingView from '@/components/views/OnboardingView';
import DashboardView from '@/components/views/DashboardView';
import MineradorLiveView from '@/components/views/MineradorLiveView';
import ProductDetailView from '@/components/views/ProductDetailView';
import AdGeneratorView from '@/components/views/AdGeneratorView';
import MyProductsView from '@/components/views/MyProductsView';
import ProfitCalculatorView from '@/components/views/ProfitCalculatorView';
import SuppliersView from '@/components/views/SuppliersView';
import FinanceiroView from '@/components/views/FinanceiroView';
import CatalogoView from '@/components/views/CatalogoView';
import VideoIaView from '@/components/views/VideoIaView';
import ConectarView from '@/components/views/ConectarView';
import VideoAulaView from '@/components/views/VideoAulaView';
import PerfilView from '@/components/views/PerfilView';
import ReembolsoView from '@/components/views/ReembolsoView';
import SettingsView from '@/components/views/SettingsView';
import DivulgadosView from '@/components/views/DivulgadosView';
import AfiliadosView from '@/components/views/AfiliadosView';
import AdminQuickActions from '@/components/AdminQuickActions';
import { Product } from '@/lib/mockData';
import { Toaster, toast } from 'react-hot-toast';

import LoginView from '@/components/views/LoginView';
import OrderBumpUpsellModal from '@/components/checkout/OrderBumpUpsellModal';
import LiveSocialProofNotification from '@/components/LiveSocialProofNotification';
import MobileBottomNav from '@/components/MobileBottomNav';

export type ViewType = 
  | 'dashboard' 
  | 'financeiro' 
  | 'afiliados'
  | 'catalogo' 
  | 'divulgacao-ia' 
  | 'divulgados'
  | 'video-ia' 
  | 'conectar' 
  | 'video-aula' 
  | 'perfil' 
  | 'reembolso' 
  | 'minerador' 
  | 'detalhe' 
  | 'anuncio' 
  | 'meus-produtos' 
  | 'calculadora' 
  | 'fornecedores' 
  | 'configuracoes';

export default function AppContainer() {
  const { data: session, status } = useSession();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [savedProducts, setSavedProducts] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const rawEmail = session?.user?.email || '';
  const userEmail = rawEmail.toLowerCase().trim();
  const userRole = ((session?.user as any)?.role || '').toLowerCase();
  const isCarlos = userEmail.includes('carlos') || userEmail.includes('souza');
  const isMasterAccount = 
    userEmail === 'gerente@decolashop.com' || 
    userEmail === 'admin@decolashop.com' || 
    userEmail === 'usuario@decolashop.com' ||
    userEmail.includes('admin') ||
    userRole === 'admin' ||
    isCarlos;

  const userPlan = (session?.user as any)?.plan;
  const isPaidPlan = userPlan === 'lifetime' || userPlan === 'monthly' || isMasterAccount;

  const isNormalUser = userEmail === 'usuario@decolashop.com' || isCarlos;
  const isAdmin = !isNormalUser && (
    userEmail === 'gerente@decolashop.com' || 
    userEmail.includes('gerente') || 
    userEmail.includes('admin') || 
    userRole === 'gerente' || 
    userRole === 'admin'
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const rawPath = window.location.pathname.replace(/^\//, '').toLowerCase();
      const validViews: ViewType[] = [
        'dashboard', 
        'financeiro', 
        'afiliados',
        'catalogo', 
        'divulgacao-ia', 
        'divulgados',
        'video-ia', 
        'conectar', 
        'video-aula', 
        'perfil', 
        'reembolso', 
        'minerador', 
        'detalhe', 
        'anuncio', 
        'meus-produtos', 
        'calculadora', 
        'fornecedores', 
        'configuracoes'
      ];
      if (rawPath && validViews.includes(rawPath as ViewType)) {
        if (rawPath === 'afiliados') {
          // Só redireciona se a sessão já foi validada e o usuário definitivamente não for admin
          if (status === 'authenticated' && !isAdmin) {
            setCurrentView('dashboard');
          } else {
            setCurrentView('afiliados');
          }
        } else {
          setCurrentView(rawPath as ViewType);
        }
      }
    }

    const seenOnboarding = localStorage.getItem('decolashop_seen_onboarding') || localStorage.getItem('apexfinder_seen_onboarding');
    if (!seenOnboarding) {
      setShowOnboarding(true);
    }

    const saved = localStorage.getItem('decolashop_saved_products') || localStorage.getItem('apexfinder_saved_products');
    if (saved) {
      setSavedProducts(JSON.parse(saved));
    }

    const handleCustomNavigate = (e: any) => {
      const targetView = e.detail;
      if (targetView && validViews.includes(targetView as ViewType)) {
        if (targetView === 'afiliados' && !isAdmin) {
          toast.error('Acesso restrito ao Administrador');
          return;
        }
        setCurrentView(targetView as ViewType);
      }
    };

    window.addEventListener('decolashop_navigate', handleCustomNavigate);
    return () => {
      window.removeEventListener('decolashop_navigate', handleCustomNavigate);
    };
  }, [isAdmin, status]);

  const handleSaveProduct = (id: string) => {
    let newSaved = [...savedProducts];
    if (newSaved.includes(id)) {
      newSaved = newSaved.filter(pId => pId !== id);
      toast.success('Removido dos favoritos');
    } else {
      newSaved.push(id);
      toast.success('Salvo! Você já pode gerar anúncios.');
    }
    setSavedProducts(newSaved);
    localStorage.setItem('decolashop_saved_products', JSON.stringify(newSaved));
  };

  const navigateToView = (view: ViewType, product?: Product) => {
    if (view === 'afiliados' && !isAdmin) {
      toast.error('Acesso exclusivo à gerência.');
      return;
    }
    if (product) setSelectedProduct(product);
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `/${view}`);
    }
    window.scrollTo(0, 0);
  };

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-dark-bg">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-muted-foreground animate-pulse tracking-widest text-xs uppercase">Carregando dados de mercado...</p>
      </div>
    );
  }

  // Se não estiver autenticado OU se não possuir plano pago nem conta autorizada, bloqueia e exibe LoginView
  if (status === "unauthenticated" || (status === "authenticated" && !isPaidPlan)) {
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      const search = window.location.search || '';
      window.history.replaceState(null, '', '/' + search);
    }
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 selection:bg-[#22c55e]/30">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#111726',
            color: '#f8fafc',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.5), 0 0 20px rgba(34, 197, 94, 0.15)',
            fontWeight: 600,
            fontSize: '13px',
          },
        }} 
      />
      
      {showOnboarding && (
        <OnboardingView 
          onClose={() => {
            setShowOnboarding(false);
            localStorage.setItem('decolashop_seen_onboarding', 'true');
          }} 
          onStart={() => {
            setShowOnboarding(false);
            localStorage.setItem('decolashop_seen_onboarding', 'true');
            navigateToView('minerador');
          }}
        />
      )}

      {/* Automatic Non-Spam Order Bump Upsell for Logged In Users */}
      <OrderBumpUpsellModal />

      {/* Live Social Proof Notification (Saques Pix e Comissões a cada 3 a 20 min) */}
      <LiveSocialProofNotification />

      <div className="flex relative">
        {/* Mobile Backdrop */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-35 md:hidden transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <Sidebar 
          currentView={currentView} 
          onNavigate={(view) => {
            navigateToView(view);
            setIsSidebarOpen(false);
          }} 
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />
        
        <main className="flex-1 md:ml-64 min-h-screen bg-[#080c14] text-slate-100 relative">
          <Header onMenuClick={() => setIsSidebarOpen(true)} session={session} />
          
          <div className="p-2.5 sm:p-4 md:p-8 max-w-7xl mx-auto pb-28 sm:pb-28 md:pb-16">
            {currentView === 'dashboard' && (
              <DashboardView 
                onNavigate={navigateToView} 
                savedCount={savedProducts.length}
              />
            )}

            {currentView === 'financeiro' && (
              <FinanceiroView />
            )}

            {currentView === 'afiliados' && (
              <AfiliadosView />
            )}

            {currentView === 'catalogo' && (
              <CatalogoView 
                onNavigate={navigateToView}
                onSave={handleSaveProduct}
                savedProducts={savedProducts}
              />
            )}

            {(currentView === 'divulgacao-ia' || currentView === 'anuncio') && (
              <AdGeneratorView 
                product={selectedProduct}
                onNavigate={navigateToView}
              />
            )}

            {currentView === 'divulgados' && (
              <DivulgadosView 
                onNavigate={navigateToView}
              />
            )}

            {currentView === 'video-ia' && (
              <VideoIaView 
                product={selectedProduct}
                onNavigate={navigateToView}
              />
            )}

            {currentView === 'conectar' && (
              <ConectarView />
            )}

            {currentView === 'video-aula' && (
              <VideoAulaView />
            )}

            {currentView === 'perfil' && (
              <PerfilView />
            )}

            {currentView === 'reembolso' && (
              <ReembolsoView onNavigate={navigateToView} />
            )}
            
            {currentView === 'minerador' && (
              <MineradorLiveView 
                onNavigate={navigateToView}
                savedProducts={savedProducts}
                onSave={handleSaveProduct}
              />
            )}
            
            {currentView === 'detalhe' && selectedProduct && (
              <ProductDetailView 
                product={selectedProduct} 
                isSaved={savedProducts.includes(selectedProduct.id)}
                onSave={handleSaveProduct}
                onNavigate={navigateToView}
              />
            )}
            
            {currentView === 'meus-produtos' && (
              <MyProductsView 
                onNavigate={navigateToView} 
                savedProducts={savedProducts}
                onRemove={handleSaveProduct}
              />
            )}
            
            {currentView === 'calculadora' && (
              <ProfitCalculatorView />
            )}
            
            {currentView === 'fornecedores' && (
              <SuppliersView />
            )}
            
            {currentView === 'configuracoes' && (
              <SettingsView />
            )}
          </div>

          <AdminQuickActions />
        </main>
      </div>

      {/* Modern Fixed Mobile Bottom Navigation Bar */}
      <MobileBottomNav currentView={currentView} onNavigate={navigateToView} />
    </div>
  );
}
