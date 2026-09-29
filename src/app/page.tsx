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
import AdminQuickActions from '@/components/AdminQuickActions';
import { Product } from '@/lib/mockData';
import { Toaster, toast } from 'react-hot-toast';

import LoginView from '@/components/views/LoginView';

export type ViewType = 
  | 'dashboard' 
  | 'financeiro' 
  | 'catalogo' 
  | 'divulgacao-ia' 
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

  useEffect(() => {
    const seenOnboarding = localStorage.getItem('apexfinder_seen_onboarding');
    if (!seenOnboarding) {
      setShowOnboarding(true);
    }

    const saved = localStorage.getItem('apexfinder_saved_products');
    if (saved) {
      setSavedProducts(JSON.parse(saved));
    }
  }, []);

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
    localStorage.setItem('apexfinder_saved_products', JSON.stringify(newSaved));
  };

  const navigateToView = (view: ViewType, product?: Product) => {
    if (product) setSelectedProduct(product);
    setCurrentView(view);
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

  if (status === "unauthenticated") {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-dark-bg text-foreground selection:bg-primary/30">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#14192f',
            color: '#f8fafc',
            border: '1px solid #1a1f3a',
          },
        }} 
      />
      
      {showOnboarding && (
        <OnboardingView 
          onClose={() => {
            setShowOnboarding(false);
            localStorage.setItem('apexfinder_seen_onboarding', 'true');
          }} 
          onStart={() => {
            setShowOnboarding(false);
            localStorage.setItem('apexfinder_seen_onboarding', 'true');
            navigateToView('minerador');
          }}
        />
      )}

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
        
        <main className="flex-1 md:ml-64 min-h-screen bg-[#090d16] text-slate-100 relative">
          <Header onMenuClick={() => setIsSidebarOpen(true)} session={session} />
          
          <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24">
            {currentView === 'dashboard' && (
              <DashboardView 
                onNavigate={navigateToView} 
                savedCount={savedProducts.length}
              />
            )}

            {currentView === 'financeiro' && (
              <FinanceiroView />
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
    </div>
  );
}
