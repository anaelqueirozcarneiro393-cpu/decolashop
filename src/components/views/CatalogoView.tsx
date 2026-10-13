'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Sparkles, 
  Copy, 
  Check, 
  Heart,
  Video,
  ChevronDown,
  Truck,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Globe
} from 'lucide-react';
import { Product, mockProducts } from '@/lib/mockData';
import { 
  ALL_SUPPLIER_PRODUCTS, 
  getProductsByActivatedSuppliers, 
  SUPPLIER_METADATA 
} from '@/lib/supplierCatalogData';
import {
  ALL_INTERNATIONAL_PRODUCTS,
  INTERNATIONAL_SUPPLIER_METADATA,
  getInternationalProductsByActivatedSuppliers
} from '@/lib/internationalCatalogData';
import { useRegionCurrency } from '@/lib/regionState';
import SafeImage from '@/components/SafeImage';
import { toast } from 'react-hot-toast';

interface CatalogoViewProps {
  onNavigate: (view: any, product?: any) => void;
  onSave?: (id: string) => void;
  savedProducts?: string[];
}

const CATEGORIES = [
  'Todas',
  'Eletrônicos',
  'Esportes',
  'Beleza',
  'Setup Gamer',
  'Casa & Decoração',
  'Cozinha',
  'Fitness',
  'Moda',
  'Automotivo',
  'Pet'
];

export default function CatalogoView({ onNavigate, onSave, savedProducts = [] }: CatalogoViewProps) {
  const { currency, isUsd, setCurrency } = useRegionCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [activatedSuppliers, setActivatedSuppliers] = useState<string[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('todos');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(24);

  // Combina e filtra produtos garantindo unicidade absoluta de imagens e títulos
  const combineUniqueProducts = (supplierIds: string[]) => {
    const matched = getProductsByActivatedSuppliers(supplierIds);
    const combined: Product[] = [];
    const seenImages = new Set<string>();
    const seenNames = new Set<string>();

    const allCandidates = [...matched, ...mockProducts];
    for (const p of allCandidates) {
      if (!p || !p.image_url) continue;

      // Normalização estrita da URL da imagem para evitar duplicatas por parâmetros de query
      const normUrl = p.image_url.split('?')[0].trim().toLowerCase();
      // Normalização do nome
      const normName = (p.name || p.title || '').trim().toLowerCase().slice(0, 30);

      if (seenImages.has(normUrl) || seenNames.has(normName)) {
        continue;
      }

      seenImages.add(normUrl);
      seenNames.add(normName);
      combined.push(p);
    }

    return combined;
  };

  // Carrega fornecedores ativados e produtos únicos do catálogo (Nacional vs Exterior)
  const loadSuppliersAndProducts = () => {
    setIsLoading(true);

    if (isUsd) {
      // MODO EXTERIOR / GLOBAL: Fornecedores internacionais exclusivos em USD
      const intlSupplierIds = Object.keys(INTERNATIONAL_SUPPLIER_METADATA);
      setActivatedSuppliers(intlSupplierIds);
      const intlProducts = getInternationalProductsByActivatedSuppliers(intlSupplierIds);
      setProducts(intlProducts);
      setIsLoading(false);
      return;
    }

    // MODO NACIONAL: Fornecedores homologados brasileiros em R$
    let activeIds: string[] = [];
    try {
      const saved = localStorage.getItem('decolashop_activated_suppliers_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          activeIds = parsed;
        }
      }
    } catch {
      activeIds = [];
    }

    if (activeIds.length === 0) {
      activeIds = Object.keys(SUPPLIER_METADATA);
      try {
        localStorage.setItem('decolashop_activated_suppliers_v3', JSON.stringify(activeIds));
      } catch {}
    }

    setActivatedSuppliers(activeIds);
    const uniqueList = combineUniqueProducts(activeIds);
    setProducts(uniqueList);
    setIsLoading(false);
  };

  useEffect(() => {
    setSelectedSupplier('todos');
    loadSuppliersAndProducts();

    const handleUpdate = () => {
      loadSuppliersAndProducts();
    };

    window.addEventListener('decolashop_suppliers_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('decolashop_suppliers_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [isUsd]);

  const handleActivateAllSuppliers = () => {
    if (isUsd) {
      const allIds = Object.keys(INTERNATIONAL_SUPPLIER_METADATA);
      setActivatedSuppliers(allIds);
      const uniqueList = getInternationalProductsByActivatedSuppliers(allIds);
      setProducts(uniqueList);
      toast.success('🎉 Todos os 8 fornecedores globais ativados com catálogo em Dólar (US$)!');
      return;
    }

    const allIds = Object.keys(SUPPLIER_METADATA);
    setActivatedSuppliers(allIds);
    try {
      localStorage.setItem('decolashop_activated_suppliers_v3', JSON.stringify(allIds));
      window.dispatchEvent(new CustomEvent('decolashop_suppliers_updated'));
    } catch {}
    const uniqueList = combineUniqueProducts(allIds);
    setProducts(uniqueList);
    toast.success('🎉 Todos os 8 fornecedores homologados foram ativados com catálogo completo e fotos exclusivas!');
  };


  const handleCopyLink = (p: Product) => {
    const affiliateUrl = `https://shopee.com.br/universal-link?aff_id=decolashop_${p.id}`;
    navigator.clipboard.writeText(affiliateUrl);
    setCopiedId(p.id);
    toast.success('Link de afiliado DecolaShop copiado!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = useMemo(() => {
    return products.filter(p => {
      const name = (p.name || p.title || '').toLowerCase();
      const matchesSearch = name.includes(search.toLowerCase());
      
      const matchesSupplier = 
        selectedSupplier === 'todos' || 
        (p.supplierId || '').toLowerCase() === selectedSupplier.toLowerCase();

      if (selectedCategory === 'Todas') {
        return matchesSearch && matchesSupplier;
      }
      
      const catLower = (p.category || '').toLowerCase();
      const selLower = selectedCategory.toLowerCase();
      const matchesCat = catLower.includes(selLower) || selLower.includes(catLower);
      return matchesSearch && matchesSupplier && matchesCat;
    });
  }, [products, search, selectedCategory, selectedSupplier]);

  const displayedProducts = useMemo(() => {
    return filtered.slice(0, visibleCount);
  }, [filtered, visibleCount]);

  // Compute category counts based on current products and supplier filter
  const categoryCounts = useMemo(() => {
    const supplierScoped = products.filter(p => 
      selectedSupplier === 'todos' || (p.supplierId || '').toLowerCase() === selectedSupplier.toLowerCase()
    );

    const counts: Record<string, number> = { 'Todas': supplierScoped.length };
    CATEGORIES.forEach(cat => {
      if (cat !== 'Todas') {
        const selLower = cat.toLowerCase();
        counts[cat] = supplierScoped.filter(p => {
          const catLower = (p.category || '').toLowerCase();
          return catLower.includes(selLower) || selLower.includes(catLower);
        }).length;
      }
    });
    return counts;
  }, [products, selectedSupplier]);

  const activeMetadata = isUsd ? (INTERNATIONAL_SUPPLIER_METADATA as any) : (SUPPLIER_METADATA as any);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3 border border-primary/20">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isUsd ? 'Catálogo Internacional Global • US$' : 'Catálogo Completo & Afiliados DecolaShop'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2 text-white flex items-center gap-2.5 flex-wrap">
            <span>Catálogo de</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-green-500">
              {isUsd ? 'Produtos Globais (US$)' : 'Produtos Vencedores'}
            </span>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
              isUsd 
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' 
                : 'bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/40'
            }`}>
              {isUsd ? '🗽 Vender no Exterior' : '🇧🇷 Mercado Nacional'}
            </span>
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-xl">
            {isUsd
              ? `Catálogo Global: ${products.length} produtos de alta conversão em Dólar integrados aos armazéns prioritários dos EUA e Europa com fulfillment rápido.`
              : `${products.length} produtos minerados e integrados diretamente com seus fornecedores homologados nacionais.`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Seletor de Vender para o Exterior: Brasil (R$) vs Exterior (US$) */}
          <div className="flex items-center p-1 rounded-xl bg-black/60 border border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => {
                setCurrency('BRL');
                toast.success('🇧🇷 Catálogo Nacional em Reais (R$) ativado!', { duration: 2500 });
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                !isUsd
                  ? 'bg-[#22c55e] text-black shadow-md font-black'
                  : 'text-slate-400 hover:text-white font-bold'
              }`}
            >
              <span>🇧🇷</span>
              <span>Brasil (R$)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrency('USD');
                toast.success('🇺🇸 Modo Vender no Exterior ativado! Fornecedores e catálogo global em Dólar (US$).', { duration: 3000 });
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                isUsd
                  ? 'bg-blue-500 text-white shadow-md font-black shadow-blue-500/30'
                  : 'text-slate-400 hover:text-white font-bold'
              }`}
            >
              <span>🇺🇸</span>
              <span>Vender no Exterior (US$)</span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setVisibleCount(24);
              }}
              placeholder={isUsd ? "Buscar produto global, US warehouse..." : "Buscar por produto, modelo, especificação..."}
              className="bg-secondary/30 border border-border/50 rounded-xl py-2 pl-10 pr-4 text-xs sm:text-sm text-white placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 w-full transition-all"
            />
          </div>
        </div>
      </div>

      {/* Banner de Fornecedores Desativados (Apenas se nacional e vazio) */}
      {!isUsd && activatedSuppliers.length === 0 && !isLoading && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-[#111726] to-[#0d121f] border border-amber-500/40 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase">
                <AlertTriangle size={12} />
                <span>FORNECEDORES HOMOLOGADOS NÃO ATIVADOS</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Ative seus fornecedores para liberar o catálogo completo
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                Os fornecedores nacionais possuem produtos minerados com fotos fiéis e despacho em até 24h.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleActivateAllSuppliers}
                className="py-3 px-5 rounded-2xl bg-gradient-to-r from-[#22c55e] via-[#16a34a] to-[#22c55e] hover:brightness-110 active:scale-95 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-[#22c55e]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles size={14} fill="currentColor" />
                <span>Ativar Todos os Fornecedores</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('fornecedores')}
                className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Ver Fornecedores</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barra de Status e Filtro por Fornecedores Ativos */}
      {activatedSuppliers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Truck size={14} className={isUsd ? "text-cyan-400" : "text-[#22c55e]"} />
                {isUsd ? 'Filtrar por Hub Internacional (EUA / Europa):' : 'Filtrar por Fornecedor Homologado:'}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black border ${
                isUsd 
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
                  : 'bg-[#22c55e]/20 text-[#4ade80] border-[#22c55e]/30'
              }`}>
                {activatedSuppliers.length} {isUsd ? 'HUBS GLOBAIS' : 'FORNECEDORES ATIVOS'}
              </span>
            </div>

            <button
              onClick={() => onNavigate('fornecedores')}
              className="text-xs text-[#4ade80] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>{isUsd ? 'Ver Fornecedores Internacionais' : 'Gerenciar Fornecedores'}</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => {
                setSelectedSupplier('todos');
                setVisibleCount(24);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 cursor-pointer ${
                selectedSupplier === 'todos'
                  ? (isUsd ? 'bg-blue-500 text-white border-blue-500 font-black shadow-md shadow-blue-500/25' : 'bg-primary text-black border-primary font-black shadow-md shadow-primary/20')
                  : 'bg-secondary/40 text-slate-300 border-border/50 hover:bg-secondary hover:text-white'
              }`}
            >
              <span>Todos os {isUsd ? 'Hubs Globais' : 'Ativos'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedSupplier === 'todos' ? 'bg-black/20 text-current font-black' : 'bg-white/10 text-slate-400'}`}>
                {products.length}
              </span>
            </button>

            {activatedSuppliers.map((supId) => {
              const meta = activeMetadata[supId];
              if (!meta) return null;
              const isSelected = selectedSupplier === supId;
              const count = products.filter(p => (p.supplierId || '').toLowerCase() === supId.toLowerCase()).length;

              const shortName = isUsd 
                ? (supId === 'cjdropshipping' ? 'CJ US Hub 🇺🇸' : supId === 'hypersku' ? 'HyperSKU 🌐' : supId === 'zendrop' ? 'Zendrop US 🇺🇸' : supId === 'autods' ? 'AutoDS 🇪🇺' : supId === 'fastship' ? 'FastShip Miami 🇺🇸' : supId === 'eurofulfill' ? 'EuroFulfill 🇪🇺' : supId === 'apextech' ? 'Apex Wholesale 🇺🇸' : 'TrendVibe NY 🇺🇸')
                : meta.name.split(' ')[0];

              return (
                <button
                  key={supId}
                  type="button"
                  onClick={() => {
                    setSelectedSupplier(supId);
                    setVisibleCount(24);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isSelected
                      ? (isUsd ? 'bg-blue-500 text-white border-blue-500 font-black shadow-md shadow-blue-500/25' : 'bg-[#22c55e] text-black border-[#22c55e] font-black shadow-md shadow-[#22c55e]/20')
                      : 'bg-secondary/40 text-slate-300 border-border/50 hover:bg-secondary hover:text-white'
                  }`}
                >
                  <span>{shortName}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-black/20 text-current font-black' : 'bg-white/10 text-slate-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Categories Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const count = categoryCounts[cat] ?? 0;
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setVisibleCount(24);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-primary text-black border-primary font-black shadow-lg shadow-primary/20'
                  : 'bg-secondary/40 text-muted-foreground border-border/50 hover:bg-secondary hover:text-white'
              }`}
            >
              <span>{cat}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-black/20 text-black font-black' : 'bg-white/5 text-muted-foreground'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Count & Status Bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <div>
          Mostrando <span className="font-bold text-white">{displayedProducts.length}</span> de <span className="font-bold text-primary">{filtered.length}</span> produtos encontrados
          {selectedSupplier !== 'todos' && (
            <span className="ml-1 text-slate-400">
              (Hub / Fornecedor: <strong className="text-white">{activeMetadata[selectedSupplier]?.name}</strong>)
            </span>
          )}
        </div>
        {filtered.length > displayedProducts.length && (
          <button 
            onClick={() => setVisibleCount(filtered.length)}
            className="text-xs text-primary hover:underline font-bold cursor-pointer"
          >
            Exibir todos ({filtered.length})
          </button>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass rounded-3xl p-5 border border-border/40 animate-pulse space-y-4">
              <div className="w-full h-48 rounded-2xl bg-white/5" />
              <div className="h-4 bg-white/10 rounded w-3/4" />
              <div className="h-6 bg-white/10 rounded w-1/3" />
              <div className="h-10 bg-white/5 rounded-xl w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayedProducts.map((prod) => {
            const isSaved = savedProducts.includes(prod.id);
            const numPrice = typeof prod.price === 'number' 
              ? prod.price 
              : parseFloat(String(prod.price || '99.90').replace(/[^0-9.]/g, '')) || 99.90;
            
            const commissionVal = typeof prod.commission === 'string' && (prod.commission.includes('R$') || prod.commission.includes('US$'))
              ? prod.commission
              : (isUsd ? `US$ ${(numPrice * 0.32).toFixed(2)}` : `R$ ${(numPrice * 0.32).toFixed(2).replace('.', ',')}`);

            const displayPrice = isUsd 
              ? `US$ ${numPrice.toFixed(2)}`
              : `R$ ${numPrice.toFixed(2).replace('.', ',')}`;

            const originalPrice = isUsd
              ? `US$ ${(numPrice * 1.45).toFixed(2)}`
              : `R$ ${(numPrice * 1.55).toFixed(2).replace('.', ',')}`;

            return (
              <div 
                key={prod.id} 
                className="glass rounded-3xl p-4 sm:p-5 border border-border/50 hover:border-primary/40 transition-all flex flex-col justify-between group hover:shadow-xl hover:shadow-primary/5 bg-[#0b101b]/80"
              >
                <div>
                  {/* Image and Badges */}
                  <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-secondary/40 border border-border/30 mb-3.5">
                    <SafeImage 
                      src={prod.image_url} 
                      alt={prod.name || prod.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className={`absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                      isUsd ? 'text-blue-300 border-blue-500/40' : 'text-emerald-400 border-emerald-500/30'
                    }`}>
                      Comissão: {commissionVal}
                    </div>
                    {onSave && (
                      <button
                        onClick={() => onSave(prod.id)}
                        className={`absolute top-2.5 right-2.5 p-2 rounded-xl backdrop-blur-md border transition-all ${
                          isSaved ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-black/60 text-white border-white/10 hover:bg-black/80'
                        }`}
                      >
                        <Heart size={14} className={isSaved ? 'fill-current' : ''} />
                      </button>
                    )}
                  </div>

                  {/* Info */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="font-bold text-primary truncate max-w-[130px]">{prod.category || 'Geral'}</span>
                      <span className="font-black text-white px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px]">
                        🔥 {prod.hype_score || 90}/100
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 font-medium truncate flex items-center gap-1">
                      <Truck size={10} className={isUsd ? "text-cyan-400 shrink-0" : "text-[#22c55e] shrink-0"} />
                      <span className="truncate">{prod.shippingOrigin || prod.supplier || (isUsd ? 'US Fulfillment Hub' : 'Distribuidora SP')}</span>
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {prod.name || prod.title}
                    </h3>
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-lg font-black text-white">
                        {displayPrice}
                      </span>
                      <span className="text-[10px] text-muted-foreground line-through">
                        {originalPrice}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-3 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onNavigate('divulgacao-ia', prod)}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-primary text-black font-extrabold text-xs hover:bg-primary/90 transition-all shadow-md shadow-primary/20 active:scale-95 cursor-pointer"
                    >
                      <Sparkles size={13} />
                      <span>Divulgar IA</span>
                    </button>

                    <button
                      onClick={() => onNavigate('video-ia', prod)}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-secondary/80 hover:bg-secondary border border-border/50 text-white font-bold text-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <Video size={13} />
                      <span>Vídeo IA</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyLink(prod)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[11px] font-semibold transition-all active:scale-95 cursor-pointer"
                    >
                      {copiedId === prod.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copiedId === prod.id ? 'Copiado!' : 'Link Afiliado'}</span>
                    </button>

                    <button
                      onClick={() => onNavigate('detalhe', prod)}
                      className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[11px] font-semibold transition-all active:scale-95 cursor-pointer"
                    >
                      Métricas
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16 glass rounded-3xl border border-border/40 p-8">
          <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="text-lg font-bold text-white mb-1">
            {activatedSuppliers.length === 0 ? 'Nenhum fornecedor conectado' : 'Nenhum produto encontrado'}
          </h3>
          <p className="text-muted-foreground text-xs max-w-sm mx-auto mb-4">
            {activatedSuppliers.length === 0
              ? 'Conecte seus fornecedores homologados para visualizar e divulgar os produtos vencedores.'
              : `Não encontramos nenhum produto para "${search}" com os filtros atuais.`}
          </p>
          {activatedSuppliers.length === 0 ? (
            <button
              onClick={handleActivateAllSuppliers}
              className="px-4 py-2.5 rounded-xl bg-primary text-black font-bold text-xs cursor-pointer shadow-md shadow-primary/20"
            >
              Ativar Fornecedores Agora
            </button>
          ) : (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('Todas');
                setSelectedSupplier('todos');
              }}
              className="px-4 py-2 rounded-xl bg-primary text-black font-bold text-xs cursor-pointer"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      )}

      {/* Load More Button */}
      {!isLoading && filtered.length > displayedProducts.length && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6">
          <button
            onClick={() => setVisibleCount(prev => prev + 24)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-secondary/80 hover:bg-secondary border border-border/60 text-white font-bold text-xs transition-all active:scale-95 shadow-lg shadow-black/20 cursor-pointer"
          >
            <span>Carregar Mais Produtos ({filtered.length - displayedProducts.length} restantes)</span>
            <ChevronDown size={14} />
          </button>
          <button
            onClick={() => setVisibleCount(filtered.length)}
            className="text-xs text-muted-foreground hover:text-white underline font-semibold py-2 cursor-pointer"
          >
            Mostrar Todos ({filtered.length})
          </button>
        </div>
      )}
    </div>
  );
}
