'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Crown, 
  Search, 
  Check, 
  CheckCircle2, 
  Loader2, 
  ShoppingBag,
  Zap
} from 'lucide-react';
import SafeImage from '@/components/SafeImage';
import { toast } from 'react-hot-toast';
import { useSales } from '@/lib/salesContext';
import { getProductsFromSupabase } from '@/app/actions';
import { Product, mockProducts } from '@/lib/mockData';

interface AdGeneratorViewProps {
  product?: any;
  onNavigate: (view: any, product?: any) => void;
}

export default function AdGeneratorView({ product: initialProduct, onNavigate }: AdGeneratorViewProps) {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [selectedProduct, setSelectedProduct] = useState<Product>(initialProduct || mockProducts[0]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);
  const [publishedNetwork, setPublishedNetwork] = useState('');
  const { addSale } = useSales();

  useEffect(() => {
    async function load() {
      const res = await getProductsFromSupabase();
      if (res.success && res.data && res.data.length > 0) {
        setProducts(res.data);
        if (!initialProduct) {
          setSelectedProduct(res.data[0]);
        }
      }
    }
    load();
  }, [initialProduct]);

  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category || 'Geral')))];

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchSearch = (p.name || p.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleStartPublishing = () => {
    setIsPublishing(true);
    setPublishProgress(10);
    setPublishedNetwork('Otimizando criativos com IA...');

    setTimeout(() => {
      setPublishProgress(35);
      setPublishedNetwork('Publicando no Kwai e TikTok Ads...');
    }, 700);

    setTimeout(() => {
      setPublishProgress(70);
      setPublishedNetwork('Propagando no Facebook, Instagram e WhatsApp...');
    }, 1500);

    setTimeout(() => {
      setPublishProgress(100);
      setPublishedNetwork('Finalizado! 6 redes conectadas e gerando tráfego.');
      setIsPublishing(false);
      toast.success('🚀 Divulgação com IA iniciada com sucesso em todas as redes!');
      
      const rawPrice = typeof selectedProduct.price === 'string'
        ? parseFloat(selectedProduct.price.replace('R$', '').replace('.', '').replace(',', '.').trim()) || 99.90
        : (selectedProduct.price || 99.90);
      addSale(selectedProduct, rawPrice);
    }, 2400);
  };

  const currentPriceFormatted = typeof selectedProduct.price === 'string'
    ? selectedProduct.price
    : `R$ ${selectedProduct.price?.toFixed(2) || '99,90'}`;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22c55e]/15 text-[#4ade80] border border-[#22c55e]/30 text-xs font-bold mb-2 shadow-[0_0_10px_rgba(34,197,94,0.15)]">
          <Sparkles className="w-3.5 h-3.5 text-[#22c55e]" />
          <span>INTELIGÊNCIA ARTIFICIAL</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
          Divulgação com IA
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Sua central inteligente para propagar produtos do catálogo automaticamente por toda a internet.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Créditos de IA */}
          <div className="bg-[#0d121f]/90 rounded-3xl p-6 border border-white/10 shadow-xl backdrop-blur-xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#22c55e]/15 border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e]">
                  <Crown size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white leading-tight">
                    Créditos de IA
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Acesso Ilimitado Liberado
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase bg-[#22c55e]/20 text-[#4ade80] px-2 py-0.5 rounded-md border border-[#22c55e]/30">
                  ADMIN
                </span>
                <span className="text-[10px] font-black uppercase border border-[#22c55e]/30 text-[#4ade80] px-2 py-0.5 rounded-md">
                  ∞ ILIMITADO
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-400 font-medium">Status do Limite</span>
                <span className="text-[#4ade80] font-black">ILIMITADO (∞)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-r from-[#22c55e] to-[#4ade80] rounded-full shadow-[0_0_10px_#22c55e]" />
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              ✓ Conta de Administrador: Divulgações ilimitadas sem nenhum consumo de créditos.
            </p>

            <button className="w-full py-2.5 px-4 rounded-2xl bg-[#22c55e]/15 hover:bg-[#22c55e]/25 border border-[#22c55e]/40 text-[#4ade80] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(34,197,94,0.15)]">
              <Crown size={14} />
              <span>CRÉDITOS INFINITOS ATIVOS</span>
            </button>
          </div>

          {/* Card 2: Produto Selecionado */}
          <div className="bg-[#0d121f]/90 rounded-3xl p-6 border border-white/10 shadow-xl backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-300 uppercase tracking-wider">
              <ShoppingBag size={14} className="text-[#22c55e]" />
              <span>PRODUTO SELECIONADO</span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-black/40 border border-white/10 flex-shrink-0">
                <SafeImage
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name || selectedProduct.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-extrabold text-white leading-snug line-clamp-2">
                  {selectedProduct.name || selectedProduct.title}
                </h4>
                <p className="text-sm font-black text-[#4ade80] mt-1">
                  {currentPriceFormatted}
                </p>
              </div>
            </div>

            {/* Evidence/Hype score box */}
            <div className="bg-black/30 rounded-2xl p-3.5 border border-white/5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Score de Viralização:</span>
                <span className="text-[#4ade80] font-bold">{selectedProduct.hype_score || 90}/100</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Categoria:</span>
                <span className="text-white font-semibold">{selectedProduct.category || 'Geral'}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Status no Mercado:</span>
                <span className="text-[#22c55e] font-semibold">{selectedProduct.status || 'EM ALTA'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Step 1 */}
        <div className="lg:col-span-8 bg-[#0d121f]/90 rounded-3xl p-6 md:p-8 border border-white/10 shadow-xl backdrop-blur-xl space-y-6">
          <div>
            <h2 className="text-base font-black text-white">
              Passo 1: Escolha o Produto & Divulgue com IA
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Selecione um produto real do seu catálogo para que os modelos gerem copys e campanhas otimizadas.
            </p>
          </div>

          {/* Search & Categories Bar */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <div className="relative flex-shrink-0">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar produto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-32 focus:w-48 text-xs font-medium pl-8 pr-3 py-1.5 rounded-full border border-white/10 focus:outline-none focus:border-[#22c55e] transition-all bg-black/40 text-white placeholder:text-slate-500"
                />
              </div>

              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-black shadow-md shadow-[#22c55e]/25'
                      : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid from Real Catalog */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
            {filteredProducts.map((p) => {
              const isSelected = selectedProduct.id === p.id;
              const priceText = typeof p.price === 'string' ? p.price : `R$ ${p.price?.toFixed(2) || '99,90'}`;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-[#22c55e] bg-[#22c55e]/15 ring-1 ring-[#22c55e]/40 shadow-[0_0_15px_rgba(34,197,94,0.15)]'
                      : 'border-white/10 bg-black/20 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex-shrink-0">
                      <SafeImage
                        src={p.image_url}
                        alt={p.name || p.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-200 truncate">
                        {p.name || p.title}
                      </p>
                      <p className="text-xs font-black text-[#4ade80] mt-0.5">
                        {priceText}
                      </p>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-[#22c55e] text-black flex items-center justify-center font-bold">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-white/20" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Social Network Callout */}
          <p className="text-xs text-slate-300 leading-relaxed pt-2">
            Sua inteligência artificial integrada publicará automaticamente o produto selecionado em massa nas redes sociais:{' '}
            <strong className="text-[#4ade80] font-extrabold">Kwai</strong>,{' '}
            <strong className="text-[#4ade80] font-extrabold">TikTok</strong>,{' '}
            <strong className="text-[#4ade80] font-extrabold">Facebook</strong>,{' '}
            <strong className="text-[#4ade80] font-extrabold">WhatsApp</strong>,{' '}
            <strong className="text-[#4ade80] font-extrabold">Instagram</strong> e{' '}
            <strong className="text-[#4ade80] font-extrabold">Twitter</strong>.
          </p>

          {/* Big Action Button */}
          <button
            onClick={handleStartPublishing}
            disabled={isPublishing}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#22c55e] via-[#4ade80] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-black font-black text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#22c55e]/25 transition-all active:scale-[0.99] disabled:opacity-75"
          >
            {isPublishing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{publishedNetwork} ({publishProgress}%)</span>
              </>
            ) : (
              <>
                <span>▶</span>
                <span>DIVULGAÇÃO AUTOMÁTICA (CONSOME 25%)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Card */}
      <div className="bg-[#0d121f]/90 rounded-3xl p-6 border border-white/10 shadow-xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-extrabold text-white">
            Rede de Tráfego Global Ativa
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            As publicações são distribuídas em perfis otimizados de nichos específicos para maximizar taxas de cliques.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {['Kwai', 'TikTok', 'Facebook', 'WhatsApp', 'Instagram', 'Twitter'].map((net) => (
            <div
              key={net}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-slate-300"
            >
              <CheckCircle2 size={13} className="text-[#22c55e]" />
              <span>{net}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
