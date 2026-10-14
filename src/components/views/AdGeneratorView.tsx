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
  Zap,
  Megaphone,
  ArrowRight
} from 'lucide-react';
import SafeImage from '@/components/SafeImage';
import { toast } from 'react-hot-toast';
import { useSales } from '@/lib/salesContext';
import { getProductsFromSupabase } from '@/app/actions';
import { Product, mockProducts } from '@/lib/mockData';
import { useSession } from 'next-auth/react';
import { addDivulgado, getDivulgados, MAX_ACTIVE_CAMPAIGNS, getConnectedChannelInfo, generateMarketplacePublishData } from '@/lib/divulgados';
import { useRegionCurrency } from '@/lib/regionState';
import MarginSelectionModal, { MarginConfig } from '@/components/MarginSelectionModal';

interface AdGeneratorViewProps {
  product?: any;
  onNavigate: (view: any, product?: any) => void;
}

export default function AdGeneratorView({ product: initialProduct, onNavigate }: AdGeneratorViewProps) {
  const { data: session } = useSession();
  const userEmail = session?.user?.email?.toLowerCase().trim();
  const { isUsd } = useRegionCurrency();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [selectedProduct, setSelectedProduct] = useState<Product>(initialProduct || mockProducts[0]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(60);
  const [isPublishFinished, setIsPublishFinished] = useState(false);
  const [isMarginModalOpen, setIsMarginModalOpen] = useState(false);
  const [customMarginConfig, setCustomMarginConfig] = useState<MarginConfig | null>(null);
  const publishIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const { addSale, triggerDelayedCampaignSales } = useSales();

  useEffect(() => {
    return () => {
      if (publishIntervalRef.current) clearInterval(publishIntervalRef.current);
    };
  }, []);

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

  const getPublishStage = (pct: number) => {
    if (pct < 18) {
      return {
        channel: 'Redes Sociais',
        subtitle: 'Otimizando mensagem para Redes Sociais...',
        activeChannels: ['Kwai']
      };
    }
    if (pct < 38) {
      return {
        channel: 'Instagram & Facebook Ads',
        subtitle: 'Segmentando compradores de alta intenção com IA...',
        activeChannels: ['Kwai', 'Instagram']
      };
    }
    if (pct < 58) {
      return {
        channel: 'TikTok Shop & Kwai Ads',
        subtitle: 'Gerando criativos virais e copies de alta conversão...',
        activeChannels: ['Kwai', 'Instagram', 'TikTok']
      };
    }
    if (pct < 78) {
      return {
        channel: 'WhatsApp Grupos VIP',
        subtitle: 'Conectando link de afiliado DecolaShop com disparo automático...',
        activeChannels: ['Kwai', 'Instagram', 'TikTok', 'WhatsApp']
      };
    }
    if (pct < 94) {
      return {
        channel: 'Google Shopping & Shopee',
        subtitle: 'Indexando produto nos motores de busca e feeds em alta...',
        activeChannels: ['Kwai', 'Instagram', 'TikTok', 'WhatsApp', 'Facebook']
      };
    }
    return {
      channel: 'Rede Global de Tráfego',
      subtitle: 'Finalizando disparo e ativando robô de vendas...',
      activeChannels: ['Kwai', 'Instagram', 'TikTok', 'WhatsApp', 'Facebook', 'Twitter']
    };
  };

  const handleStartPublishing = () => {
    const currentCampaigns = getDivulgados(userEmail);
    const activeCount = currentCampaigns.filter(c => c.status === 'active').length;
    if (activeCount >= MAX_ACTIVE_CAMPAIGNS) {
      toast.error(`Limite atingido: você já possui ${MAX_ACTIVE_CAMPAIGNS} campanhas ativas! Acesse "Divulgados" e pause ou remova uma campanha antes de ativar uma nova.`, {
        duration: 5500,
        icon: '⚠️'
      });
      return;
    }

    // Se o usuário ainda não configurou canal e margem, abre o modal
    if (!customMarginConfig) {
      setIsMarginModalOpen(true);
      return;
    }

    startPublishingWithConfig(customMarginConfig);
  };

  const handleConfirmMargin = (config: MarginConfig) => {
    setCustomMarginConfig(config);
    setIsMarginModalOpen(false);
    startPublishingWithConfig(config);
  };

  const startPublishingWithConfig = (config: MarginConfig) => {
    if (publishIntervalRef.current) clearInterval(publishIntervalRef.current);

    // Duração entre 50 e 70 segundos (exatamente 60 segundos)
    const totalDurationSec = 60;
    const totalDurationMs = totalDurationSec * 1000;
    const startTime = Date.now();

    setIsPublishing(true);
    setPublishProgress(0);
    setRemainingSeconds(totalDurationSec);
    setIsPublishFinished(false);

    publishIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.floor((elapsed / totalDurationMs) * 100));
      const leftSec = Math.max(0, Math.ceil((totalDurationMs - elapsed) / 1000));

      setPublishProgress(progress);
      setRemainingSeconds(leftSec);

      if (elapsed >= totalDurationMs) {
        if (publishIntervalRef.current) clearInterval(publishIntervalRef.current);
        setPublishProgress(100);
        setRemainingSeconds(0);
        setIsPublishFinished(true);

        const prodIsUsd = isUsd || (selectedProduct as any)?.currency === 'USD' || 
          (typeof selectedProduct.price === 'string' && selectedProduct.price.includes('$') && !selectedProduct.price.includes('R$'));

        const sellingPrice = config.finalSellingPrice;

        // Ativa vendas com cadência natural usando o preço final e a margem líquida dela
        triggerDelayedCampaignSales(selectedProduct, sellingPrice);

        const networks = [
          config.channelLabel,
          prodIsUsd ? 'Meta Ads (US)' : 'Meta Ads (Instagram & Facebook)',
          prodIsUsd ? 'Google Shopping Global' : 'Google Shopping',
          prodIsUsd ? 'Shopify US' : 'WhatsApp Grupos VIP'
        ];

        const targetingLocation = prodIsUsd 
          ? 'Estados Unidos & Europa (Envio Prioritário Internacional)'
          : 'Brasil (Entrega Rápida 7 Dias)';

        const storeInfo = getConnectedChannelInfo(config.channel);
        const isStoreConnected = !!storeInfo?.connected;
        const pubData = generateMarketplacePublishData(
          config.channel, 
          selectedProduct.name || selectedProduct.title || 'Produto Viral DecolaShop'
        );

        addDivulgado({
          productId: selectedProduct.id,
          name: selectedProduct.name || selectedProduct.title || 'Produto Viral DecolaShop',
          image_url: selectedProduct.image_url,
          category: selectedProduct.category || 'Geral',
          price: sellingPrice,
          commission: `${prodIsUsd ? 'US$' : 'R$'} ${config.sellerMargin.toFixed(2).replace('.', ',')}`,
          currency: prodIsUsd ? 'USD' : 'BRL',
          origin: (selectedProduct as any)?.origin || (prodIsUsd ? 'East Brunswick, New Jersey - EUA' : 'São Paulo - SP (Hub Nacional)'),
          status: 'active',
          channel: config.channel,
          channelLabel: config.channelLabel,
          supplierCost: config.supplierCost,
          sellerMargin: config.sellerMargin,
          sellerMarginPercent: config.sellerMarginPercent,
          marketplaceFee: config.marketplaceFeeAmount,
          marketplaceItemId: pubData.marketplaceItemId,
          marketplaceItemUrl: pubData.marketplaceItemUrl,
          isPublishedToStore: isStoreConnected,
          storeAccountEmail: storeInfo?.email,
          storeAccountName: storeInfo?.name || storeInfo?.shopName,
          networks,
          impressions: Math.floor(Math.random() * 1500) + 950,
          clicks: Math.floor(Math.random() * 90) + 50,
          salesCount: 0,
          revenue: 0,
          roas: 4.6,
          conversionRate: 3.8,
          targeting: {
            audience: `Compradores engajados no ${config.channelLabel} na categoria ${selectedProduct.category || 'Geral'}`,
            ageRange: '18 - 50 anos',
            location: targetingLocation,
            interests: [config.channelLabel, selectedProduct.category || 'Compras Online', 'Tendências']
          },
          sampleCopy: {
            headline: `🔥 OFERTA OFICIAL NO ${config.channelLabel.toUpperCase()}: ${selectedProduct.name || selectedProduct.title}`,
            body: selectedProduct.description || (prodIsUsd ? 'Top-rated product with 7-day express delivery and 100% satisfaction guarantee.' : 'Produto validado com alta taxa de satisfação e pronta entrega para todo o Brasil.'),
            cta: `👉 COMPRAR COM DESCONTO NO ${config.channelLabel.toUpperCase()}`
          }
        }, userEmail);

        window.dispatchEvent(new Event('decolashop_divulgados_updated'));

        if (isStoreConnected) {
          toast.success(
            `🚀 Publicado na sua conta ${config.channelLabel}! Anúncio ${pubData.marketplaceItemId} ativo no seu painel de vendas.`,
            { duration: 6000, icon: '✅' }
          );
        } else {
          toast.success(
            `🚀 Anúncio publicado no ${config.channelLabel}! Sua margem de lucro de ${prodIsUsd ? 'US$' : 'R$'} ${config.sellerMargin.toFixed(2)} por venda está garantida.`,
            { duration: 5000 }
          );
        }
      }
    }, 150);
  };

  const handleCancelPublishing = () => {
    if (publishIntervalRef.current) clearInterval(publishIntervalRef.current);
    setIsPublishing(false);
    setPublishProgress(0);
    setIsPublishFinished(false);
    toast('Disparo cancelado pelo usuário.');
  };

  const currentStage = getPublishStage(publishProgress);

  const currentPriceFormatted = typeof selectedProduct.price === 'string'
    ? selectedProduct.price
    : `R$ ${selectedProduct.price?.toFixed(2) || '99,90'}`;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

        <button
          onClick={() => onNavigate('divulgados')}
          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto hover:border-[#22c55e]/40 shadow-lg"
        >
          <Megaphone size={15} className="text-[#22c55e]" />
          <span>Ver Produtos Divulgados</span>
        </button>
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
                  GERENTE
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
              ✓ Conta de Gerente: Divulgações ilimitadas sem nenhum consumo de créditos.
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

          {/* Configuração de Margem e Canal Ativo */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#22c55e]" /> Canal & Margem de Lucro
              </span>
              <button
                type="button"
                onClick={() => setIsMarginModalOpen(true)}
                className="text-xs font-bold text-[#4ade80] hover:text-[#22c55e] transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>{customMarginConfig ? 'Alterar' : 'Configurar'}</span>
                <ArrowRight size={12} />
              </button>
            </div>

            {customMarginConfig ? (
              <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-black/40 border border-white/5 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                    customMarginConfig.channel === 'mercadolivre' ? 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30' :
                    customMarginConfig.channel === 'shopee' ? 'bg-orange-500/15 text-orange-400 border-orange-500/30' :
                    customMarginConfig.channel === 'tiktok' ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' :
                    'bg-blue-500/15 text-blue-300 border-blue-500/30'
                  }`}>
                    {customMarginConfig.channel === 'mercadolivre' ? '🟡' : customMarginConfig.channel === 'shopee' ? '🟠' : customMarginConfig.channel === 'tiktok' ? '⚫' : '🌐'} {customMarginConfig.channelLabel}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Custo: {isUsd ? 'US$' : 'R$'} {customMarginConfig.supplierCost.toFixed(2)} (🔒)
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400">Seu Lucro:</span>
                  <span className="text-xs font-black text-[#4ade80] font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                    +{isUsd ? 'US$' : 'R$'} {customMarginConfig.sellerMargin.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => setIsMarginModalOpen(true)}
                className="p-2.5 rounded-xl bg-black/30 border border-dashed border-white/15 hover:border-[#22c55e]/40 transition-all cursor-pointer flex items-center justify-between gap-2"
              >
                <span className="text-xs text-slate-400">
                  Defina onde divulgar (🟡 ML, 🟠 Shopee, ⚫ TikTok) e sua comissão
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#4ade80] bg-[#22c55e]/15 px-2 py-1 rounded-md shrink-0">
                  Escolher →
                </span>
              </div>
            )}
          </div>

          {/* Big Action Button */}
          <button
            onClick={handleStartPublishing}
            disabled={isPublishing}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#22c55e] via-[#4ade80] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-black font-black text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#22c55e]/25 transition-all active:scale-[0.99] disabled:opacity-75 cursor-pointer"
          >
            {isPublishing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>DIVULGANDO NO CANAL {currentStage.channel.toUpperCase()} ({publishProgress}%)</span>
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

      {/* ================= MODAL DE LOAD DE DISPARO AUTOMÁTICO (50-70 SEGUNDOS) ================= */}
      {isPublishing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#0d121f] border border-[#22c55e]/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl shadow-[#22c55e]/15 relative overflow-hidden text-center">
            
            {/* Background Glow */}
            <div className="absolute top-0 right-1/4 w-48 h-48 bg-[#22c55e]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 left-10 w-48 h-48 bg-[#10b981]/10 rounded-full blur-3xl pointer-events-none" />

            {!isPublishFinished ? (
              <>
                {/* Top Center Icon (Matching reference image in DecolaShop green) */}
                <div className="w-16 h-16 rounded-full bg-[#22c55e]/15 border border-[#22c55e]/30 flex items-center justify-center mx-auto mb-4 text-[#22c55e] shadow-[0_0_20px_rgba(34,197,94,0.25)]">
                  <Sparkles size={28} className="text-[#22c55e] animate-pulse" />
                </div>

                {/* Dynamic Title (Matching screenshot wording: "Divulgando no canal Redes Sociais...") */}
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-1.5">
                  Divulgando no canal {currentStage.channel}...
                </h3>

                {/* Dynamic Subtitle (Matching screenshot wording: "Otimizando mensagem para Redes Sociais...") */}
                <p className="text-xs sm:text-sm text-slate-400 mb-6 max-w-md mx-auto leading-relaxed">
                  {currentStage.subtitle}
                </p>

                {/* Progress Labels (Exact match to screenshot layout) */}
                <div className="flex items-center justify-between text-xs font-bold mb-2 px-0.5">
                  <span className="text-slate-300 font-semibold">Progresso do Disparo</span>
                  <span className="text-[#4ade80] font-black font-mono">{publishProgress}%</span>
                </div>

                {/* Progress Bar (Matching reference in DecolaShop green) */}
                <div className="w-full h-3.5 bg-white/10 rounded-full overflow-hidden p-0.5 mb-5 shadow-inner">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] transition-all duration-300 shadow-[0_0_12px_rgba(34,197,94,0.6)]"
                    style={{ width: `${Math.max(3, publishProgress)}%` }}
                  />
                </div>

                {/* Product Snapshot Info */}
                <div className="bg-black/40 border border-white/5 rounded-2xl p-3 flex items-center gap-3 text-left mb-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-black shrink-0 border border-white/10">
                    <SafeImage 
                      src={selectedProduct.image_url} 
                      alt={selectedProduct.name || selectedProduct.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-white truncate">
                      {selectedProduct.name || selectedProduct.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-extrabold text-[#4ade80]">
                        {currentPriceFormatted}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        • {selectedProduct.category || 'Geral'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Active Channels Grid */}
                <div className="grid grid-cols-3 gap-1.5 mb-4">
                  {['Kwai', 'TikTok', 'Meta Ads', 'WhatsApp', 'Instagram', 'Twitter'].map((net) => {
                    const isPassed = currentStage.activeChannels.includes(net);
                    return (
                      <div
                        key={net}
                        className={`py-1.5 px-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                          isPassed
                            ? 'bg-[#22c55e]/15 text-[#4ade80] border border-[#22c55e]/30 font-black'
                            : 'bg-white/5 text-slate-500 border border-white/5'
                        }`}
                      >
                        {isPassed ? <Check size={10} strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />}
                        <span>{net}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Micro Timer Footer */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/10">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" />
                    Robô IA propagando anúncios
                  </span>
                  <span className="font-mono text-slate-300">
                    ~{remainingSeconds}s restantes
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCancelPublishing}
                  className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors mx-auto block mt-4 cursor-pointer"
                >
                  Cancelar disparo
                </button>
              </>
            ) : (
              /* Success Celebration State */
              <div className="py-2 animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-full bg-[#22c55e]/20 border-2 border-[#22c55e] flex items-center justify-center mx-auto mb-4 text-[#22c55e] shadow-[0_0_25px_rgba(34,197,94,0.3)]">
                  <Check size={32} strokeWidth={3} />
                </div>

                <h3 className="text-2xl font-black text-white tracking-tight mb-2">
                  Disparo Concluído com Sucesso!
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 mb-6 max-w-sm mx-auto leading-relaxed">
                  Seu produto foi propagado em massa nas 6 redes homologadas. A 1ª venda está prevista para os próximos <strong>10 minutos</strong>.
                </p>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPublishing(false);
                      onNavigate('divulgados');
                    }}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-black font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#22c55e]/25 cursor-pointer transition-all active:scale-95"
                  >
                    <span>Ver Campanha nos Divulgados</span>
                    <ArrowRight size={15} strokeWidth={3} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPublishing(false)}
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Divulgar Outro Produto
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Modal de Seleção de Margem e Canal */}
      <MarginSelectionModal
        isOpen={isMarginModalOpen}
        onClose={() => setIsMarginModalOpen(false)}
        product={selectedProduct}
        onConfirm={handleConfirmMargin}
        isUsd={isUsd}
      />
    </div>
  );
}
