'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Sparkles, 
  Lock, 
  Check, 
  TrendingUp, 
  HelpCircle, 
  Store, 
  Layers, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  Info,
  DollarSign,
  ShoppingBag,
  ExternalLink,
  Flame,
  Award
} from 'lucide-react';
import SafeImage from '@/components/SafeImage';
import { Product } from '@/lib/mockData';
import { toast } from 'react-hot-toast';

export type MarketplaceChannel = 'mercadolivre' | 'shopee' | 'tiktok' | 'amazon' | 'shopify';

export interface MarginConfig {
  product: Product;
  basePrice: number;
  supplierCost: number;
  supplierMarginPercent: number;
  sellerMargin: number;
  sellerMarginPercent: number;
  channel: MarketplaceChannel;
  channelLabel: string;
  marketplaceFeeRate: number;
  marketplaceFeeAmount: number;
  finalSellingPrice: number;
  currency: 'BRL' | 'USD';
}

interface MarginSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onConfirm: (config: MarginConfig) => void;
  isUsd?: boolean;
}

export default function MarginSelectionModal({
  isOpen,
  onClose,
  product,
  onConfirm,
  isUsd = false
}: MarginSelectionModalProps) {
  if (!isOpen || !product) return null;

  const currencySymbol = isUsd ? 'US$' : 'R$';

  // 1. Preço base do produto (puxado automaticamente)
  const initialBasePrice = useMemo(() => {
    if (typeof product.price === 'number') return product.price;
    if (typeof product.price === 'string') {
      const clean = product.price.replace(/[^\d.,]/g, '').replace(',', '.');
      const val = parseFloat(clean);
      return !isNaN(val) && val > 0 ? val : (isUsd ? 49.90 : 129.90);
    }
    return isUsd ? 49.90 : 129.90;
  }, [product, isUsd]);

  const [basePrice, setBasePrice] = useState<number>(initialBasePrice);

  useEffect(() => {
    setBasePrice(initialBasePrice);
  }, [initialBasePrice]);

  // 2. Margem do Fornecedor (Imutável: 55% do custo base no mercado nacional ou 50% internacional)
  const supplierMarginRate = isUsd ? 0.50 : 0.55;
  const supplierCost = Math.round(basePrice * supplierMarginRate * 100) / 100;
  const supplierMarginPercent = Math.round(supplierMarginRate * 100);

  // 3. Seleção de Canal / Marketplace
  // Mercado Livre (ML), Shopee, TikTok Shop (TTK)
  const [selectedChannel, setSelectedChannel] = useState<MarketplaceChannel>(
    isUsd ? 'tiktok' : 'shopee'
  );

  // Canais disponíveis com dados humanizados e taxas reais de mercado
  const channels = useMemo(() => {
    if (isUsd) {
      return [
        {
          id: 'tiktok' as MarketplaceChannel,
          name: 'TikTok Shop US',
          tag: 'TTK SHOP',
          shortName: 'TikTok Shop',
          feeRate: 0.08, // 8% taxa promo
          feeLabel: '8.0%',
          color: 'from-cyan-500/20 via-pink-500/10 to-transparent',
          borderColor: 'border-cyan-500/40',
          activeBg: 'bg-gradient-to-r from-cyan-500/20 to-pink-500/20 border-cyan-400',
          badgeText: '🔥 Maior Impulso Viral nos EUA',
          badgeColor: 'text-cyan-300 bg-cyan-500/15 border-cyan-500/30',
          description: 'Algoritmo viral com recomendação direta no feed ' + 'For You' + ' dos EUA.'
        },
        {
          id: 'amazon' as MarketplaceChannel,
          name: 'Amazon Global Store',
          tag: 'AMAZON US',
          shortName: 'Amazon',
          feeRate: 0.15, // 15% taxa Amazon
          feeLabel: '15.0%',
          color: 'from-amber-500/20 via-orange-500/10 to-transparent',
          borderColor: 'border-amber-500/40',
          activeBg: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-400',
          badgeText: '📦 Prime & Confiança Máxima',
          badgeColor: 'text-amber-300 bg-amber-500/15 border-amber-500/30',
          description: 'Catálogo exposto a mais de 180 milhões de membros Prime no mundo.'
        },
        {
          id: 'shopify' as MarketplaceChannel,
          name: 'Shopify Direct US',
          tag: 'SHOPIFY',
          shortName: 'Shopify',
          feeRate: 0.03, // 3% taxa de gateway
          feeLabel: '2.9%',
          color: 'from-emerald-500/20 via-green-500/10 to-transparent',
          borderColor: 'border-emerald-500/40',
          activeBg: 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-emerald-400',
          badgeText: '🛍️ Menor Taxa de Intermediação',
          badgeColor: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30',
          description: 'Venda direta sem intermediários pesados com retenção de 97% da receita.'
        }
      ];
    }

    return [
      {
        id: 'mercadolivre' as MarketplaceChannel,
        name: 'Mercado Livre (ML)',
        tag: 'MERCADO LIVRE',
        shortName: 'Mercado Livre',
        feeRate: 0.13, // 13% Clássico
        feeLabel: '13.0%',
        color: 'from-yellow-500/20 via-amber-500/10 to-transparent',
        borderColor: 'border-yellow-500/40',
        activeBg: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-400',
        badgeText: '🟡 Maior Volume do Brasil',
        badgeColor: 'text-yellow-300 bg-yellow-500/15 border-yellow-500/30',
        description: 'Líder em confiança, envio Coletas Mercado Envios e compradores prontos com cartão salvo.'
      },
      {
        id: 'shopee' as MarketplaceChannel,
        name: 'Shopee Brasil',
        tag: 'SHOPEE',
        shortName: 'Shopee',
        feeRate: 0.14, // 14%
        feeLabel: '14.0%',
        color: 'from-orange-500/20 via-red-500/10 to-transparent',
        borderColor: 'border-orange-500/40',
        activeBg: 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-400',
        badgeText: '🟠 Campeão de Cupons & Frete Grátis',
        badgeColor: 'text-orange-300 bg-orange-500/15 border-orange-500/30',
        description: 'Alta taxa de conversão diária impulsionada pelo algoritmo de busca e achadinhos virais.'
      },
      {
        id: 'tiktok' as MarketplaceChannel,
        name: 'TikTok Shop (TTK Shop)',
        tag: 'TIKTOK SHOP',
        shortName: 'TikTok Shop',
        feeRate: 0.10, // 10% promocional
        feeLabel: '10.0%',
        color: 'from-cyan-500/20 via-red-500/10 to-transparent',
        borderColor: 'border-cyan-500/40',
        activeBg: 'bg-gradient-to-r from-cyan-500/20 to-pink-500/20 border-cyan-400',
        badgeText: '⚫ Algoritmo Mais Viral para Vídeos de IA',
        badgeColor: 'text-cyan-300 bg-cyan-500/15 border-cyan-500/30',
        description: 'Tráfego explosivo no feed do TikTok com entrega direta nos vídeos gerados por IA.'
      }
    ];
  }, [isUsd]);

  const activeChannelConfig = useMemo(() => {
    return channels.find(c => c.id === selectedChannel) || channels[0];
  }, [channels, selectedChannel]);

  // 4. Margem Dela (Lucro Líquido Escolhido)
  // Presets sugeridos: 20%, 30%, 38% (Recomendado Decola), 50%
  const [selectedMarginPercent, setSelectedMarginPercent] = useState<number>(38);
  const [customMarginValue, setCustomMarginValue] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Cálculo da Margem Dela e Preço Final de Venda
  const { sellerMargin, finalSellingPrice, marketplaceFeeAmount } = useMemo(() => {
    const feeRate = activeChannelConfig.feeRate;
    
    let desiredMargin = Math.round(basePrice * (selectedMarginPercent / 100) * 100) / 100;
    if (isCustomMode && customMarginValue) {
      const parsed = parseFloat(customMarginValue.replace(',', '.'));
      if (!isNaN(parsed) && parsed > 0) {
        desiredMargin = parsed;
      }
    }

    // Fórmula equilibrada:
    // Preço Final = (Custo Fornecedor + Margem da Vendedora) / (1 - Taxa do Marketplace)
    const rawFinalPrice = (supplierCost + desiredMargin) / (1 - feeRate);
    const finalRounded = Math.round(rawFinalPrice * 100) / 100;
    const feeAmount = Math.round((finalRounded * feeRate) * 100) / 100;

    return {
      sellerMargin: desiredMargin,
      finalSellingPrice: finalRounded,
      marketplaceFeeAmount: feeAmount
    };
  }, [basePrice, selectedMarginPercent, isCustomMode, customMarginValue, supplierCost, activeChannelConfig.feeRate]);

  // Projeção Diária / Mensal Humanizada
  const daily5SalesProfit = Math.round(sellerMargin * 5 * 100) / 100;
  const monthly150SalesProfit = Math.round(sellerMargin * 150 * 100) / 100;

  const handleSelectPreset = (pct: number) => {
    setIsCustomMode(false);
    setSelectedMarginPercent(pct);
  };

  const handleCustomValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCustomMode(true);
    setCustomMarginValue(e.target.value);
    const num = parseFloat(e.target.value.replace(',', '.'));
    if (!isNaN(num) && num > 0 && basePrice > 0) {
      const calcPct = Math.round((num / basePrice) * 100);
      setSelectedMarginPercent(calcPct);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = () => {
    setIsSubmitting(true);
    try {
      const config: MarginConfig = {
        product,
        basePrice,
        supplierCost,
        supplierMarginPercent,
        sellerMargin,
        sellerMarginPercent: selectedMarginPercent,
        channel: selectedChannel,
        channelLabel: activeChannelConfig.name,
        marketplaceFeeRate: activeChannelConfig.feeRate,
        marketplaceFeeAmount,
        finalSellingPrice,
        currency: isUsd ? 'USD' : 'BRL'
      };

      onConfirm(config);
    } catch {
      toast.error('Erro ao processar configuração de margem.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0b101b] border-2 border-[#22c55e]/50 rounded-3xl p-4 sm:p-6 md:p-8 shadow-[0_0_60px_rgba(34,197,94,0.35)] text-slate-100 space-y-5 sm:space-y-6 my-auto animate-in zoom-in-95 duration-200">
        
        {/* Glow ambient background effects */}
        <div className="absolute -top-28 -left-28 w-60 h-60 bg-[#22c55e]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 -right-28 w-60 h-60 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22c55e]/15 text-[#4ade80] border border-[#22c55e]/30 text-[10px] font-black uppercase tracking-wider mb-1.5">
              <Sparkles size={12} />
              <span>Configuração de Lucro & Canal de Venda</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Personalizar Margem de Lucro</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Defina sua comissão líquida e selecione onde o robô de IA vai posicionar seu anúncio.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Resumo Visual do Produto */}
        <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-[#111726]/90 border border-white/10 backdrop-blur-sm">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-slate-900 border border-white/10 shrink-0">
            <SafeImage
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/10 text-slate-300">
                {product.category || 'Geral'}
              </span>
              <span className="text-[9px] text-[#4ade80] font-bold flex items-center gap-1 bg-[#22c55e]/15 px-2 py-0.5 rounded-md border border-[#22c55e]/30">
                <ShieldCheck size={10} />
                <span>Fornecedor Homologado DecolaShop</span>
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-white truncate" title={product.name}>
              {product.name}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Preço Base de Catálogo: <strong className="text-white font-mono">{currencySymbol} {basePrice.toFixed(2).replace('.', ',')}</strong>
            </p>
          </div>
        </div>

        {/* ================= SELEÇÃO DO CANAL DE VENDA ================= */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Store size={14} className="text-[#22c55e]" />
              <span>1. Escolha o Canal de Venda (Marketplace)</span>
            </label>
            <span className="text-[10px] text-slate-400">Onde você vai vender</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {channels.map((ch) => {
              const isSelected = selectedChannel === ch.id;
              return (
                <div
                  key={ch.id}
                  onClick={() => setSelectedChannel(ch.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isSelected 
                      ? `${ch.activeBg} shadow-lg shadow-black/40 ring-1 ring-white/20` 
                      : 'bg-white/[0.02] border-white/10 hover:border-white/25 hover:bg-white/[0.04]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${ch.badgeColor}`}>
                        {ch.tag}
                      </span>
                      {isSelected ? (
                        <div className="w-4 h-4 rounded-full bg-[#22c55e] text-black flex items-center justify-center">
                          <Check size={11} strokeWidth={3} />
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">Taxa: {ch.feeLabel}</span>
                      )}
                    </div>
                    <h5 className="text-xs sm:text-sm font-extrabold text-white leading-tight">
                      {ch.shortName}
                    </h5>
                    <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                      {ch.description}
                    </p>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Taxa estimada:</span>
                    <strong className="text-white font-mono">{ch.feeLabel}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= MARGEM DO FORNECEDOR (IMUTÁVEL) & MARGEM DELA ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {/* Box 1: Custo / Margem do Fornecedor (Imutável) */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-black/40 border border-white/10 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <span>Custo do Fornecedor</span>
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock size={10} />
                  <span>Imutável</span>
                </span>
              </div>

              <div className="flex items-baseline gap-1 my-1">
                <span className="text-xs font-black text-slate-400">{currencySymbol}</span>
                <span className="text-2xl font-black text-white font-mono">
                  {supplierCost.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-[10px] text-slate-500 ml-1">({supplierMarginPercent}% do atacado)</span>
              </div>

              <p className="text-[10px] text-slate-400 leading-snug mt-1.5">
                🔒 <strong>Valor tabelado de atacado:</strong> Cobre matéria-prima, nota fiscal emitida, embalagem especial anti-queda e logística de despacho em 24h pelos armazéns parceiros.
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-500">
              <span>Status:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Check size={11} /> Homologado & Travado
              </span>
            </div>
          </div>

          {/* Box 2: Margem Dela (Lucro Líquido Personalizado) */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-[#111c2e] to-[#0c1424] border-2 border-[#22c55e]/60 relative overflow-hidden flex flex-col justify-between shadow-lg shadow-[#22c55e]/10">
            <div>
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#4ade80] flex items-center gap-1">
                  <Flame size={12} className="text-[#22c55e]" />
                  <span>Sua Margem Líquida</span>
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider text-[#22c55e] bg-[#22c55e]/15 border border-[#22c55e]/30 px-2 py-0.5 rounded-full">
                  100% Seu
                </span>
              </div>

              <div className="flex items-baseline gap-1 my-1">
                <span className="text-xs font-black text-[#4ade80]">{currencySymbol}</span>
                <span className="text-2xl font-black text-[#4ade80] font-mono">
                  +{sellerMargin.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-xs font-bold text-slate-300 ml-1">
                  ({selectedMarginPercent}%)
                </span>
              </div>

              <p className="text-[10px] text-slate-300 leading-snug mt-1.5">
                💰 <strong>Lucro líquido garantido na sua carteira:</strong> Esse é o valor exato que é depositado no seu Saldo Disponível a cada venda gerada pelo robô de IA.
              </p>
            </div>

            {/* Presets Rápidos de Margem */}
            <div className="mt-3 pt-2.5 border-t border-white/10">
              <span className="text-[9px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">
                Ajustar Margem Desejada:
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { pct: 25, label: '25%' },
                  { pct: 35, label: '35% ⭐' },
                  { pct: 45, label: '45%' },
                  { pct: 55, label: '55%' },
                ].map(p => (
                  <button
                    key={p.pct}
                    type="button"
                    onClick={() => handleSelectPreset(p.pct)}
                    className={`py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      !isCustomMode && selectedMarginPercent === p.pct
                        ? 'bg-[#22c55e] text-black shadow-md shadow-[#22c55e]/25'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Input Livre Opcional de Margem em Reais / Dólares */}
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Award size={15} className="text-[#4ade80] shrink-0" />
            <div>
              <span className="text-xs font-extrabold text-white block">Deseja definir um valor exato de lucro por venda?</span>
              <span className="text-[10px] text-slate-400">Digite quanto quer embolsar por cada unidade vendida:</span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-bold text-slate-400">{currencySymbol}</span>
            <input
              type="text"
              value={isCustomMode ? customMarginValue : sellerMargin.toFixed(2).replace('.', ',')}
              onChange={handleCustomValueChange}
              placeholder="Ex: 45,00"
              className="w-24 bg-black/60 border border-white/20 focus:border-[#22c55e] rounded-xl py-1.5 px-3 text-xs font-black text-[#4ade80] font-mono text-center outline-none"
            />
          </div>
        </div>

        {/* ================= RESUMO TRANSPARENTE DA PRECIFICAÇÃO (HUMANIZADO) ================= */}
        <div className="p-4 rounded-2xl bg-[#090d16] border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-300 border-b border-white/10 pb-2">
            <span>Composição do Preço Final ao Cliente ({activeChannelConfig.shortName})</span>
            <span className="text-[#4ade80]">{activeChannelConfig.feeLabel} Taxa Canal</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-slate-400 block">Custo Fornecedor:</span>
              <strong className="text-white font-mono">{currencySymbol} {supplierCost.toFixed(2).replace('.', ',')}</strong>
            </div>

            <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-slate-400 block">Taxa {activeChannelConfig.shortName}:</span>
              <strong className="text-slate-300 font-mono">~{currencySymbol} {marketplaceFeeAmount.toFixed(2).replace('.', ',')}</strong>
            </div>

            <div className="p-2 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/30">
              <span className="text-[10px] text-[#4ade80] block font-bold">Seu Lucro Líquido:</span>
              <strong className="text-[#4ade80] font-mono text-sm">+{currencySymbol} {sellerMargin.toFixed(2).replace('.', ',')}</strong>
            </div>

            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30">
              <span className="text-[10px] text-blue-300 block font-bold">Preço de Venda Final:</span>
              <strong className="text-white font-mono text-sm">{currencySymbol} {finalSellingPrice.toFixed(2).replace('.', ',')}</strong>
            </div>
          </div>

          {/* Projeção Realista e Humanizada */}
          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/5 flex-wrap gap-2">
            <span>
              💡 <strong>Projeção Realista:</strong> Vendendo 5 un/dia no {activeChannelConfig.shortName}, você lucra <strong className="text-[#4ade80]">{currencySymbol} {daily5SalesProfit.toFixed(2).replace('.', ',')} por dia</strong> (~{currencySymbol} {monthly150SalesProfit.toFixed(2).replace('.', ',')} no mês).
            </span>
          </div>
        </div>

        {/* ================= BOTÕES DE AÇÃO ================= */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#22c55e] via-[#4ade80] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(34,197,94,0.45)] hover:shadow-[0_0_35px_rgba(34,197,94,0.7)] transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <Sparkles size={14} className="text-black" />
            <span>Confirmar Margem & Ativar Divulgação no {activeChannelConfig.shortName}</span>
            <ArrowRight size={14} className="text-black" />
          </button>
        </div>

      </div>
    </div>
  );
}
