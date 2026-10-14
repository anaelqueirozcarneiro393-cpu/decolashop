'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Sparkles, 
  Lock, 
  Check, 
  TrendingUp, 
  Store, 
  ShieldCheck, 
  ArrowRight,
  DollarSign,
  Flame,
  Zap,
  Info
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

  // 1. Preço base do produto
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

  // 2. Margem do Fornecedor (Imutável: 55% nacional, 50% internacional)
  const supplierMarginRate = isUsd ? 0.50 : 0.55;
  const supplierCost = Math.round(basePrice * supplierMarginRate * 100) / 100;
  const supplierMarginPercent = Math.round(supplierMarginRate * 100);

  // 3. Canais de venda com dados humanizados e taxas de mercado
  const channels = useMemo(() => {
    if (isUsd) {
      return [
        {
          id: 'tiktok' as MarketplaceChannel,
          name: 'TikTok Shop US',
          tag: 'TTK SHOP',
          shortName: 'TikTok Shop',
          feeRate: 0.08,
          feeLabel: '8%',
          theme: 'cyan',
          iconColor: '#00F2FE',
          accentBorder: 'border-cyan-400',
          accentBg: 'bg-cyan-500/10',
          badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
          benefit: 'Feed viral dos EUA'
        },
        {
          id: 'amazon' as MarketplaceChannel,
          name: 'Amazon US',
          tag: 'AMAZON',
          shortName: 'Amazon',
          feeRate: 0.15,
          feeLabel: '15%',
          theme: 'amber',
          iconColor: '#F59E0B',
          accentBorder: 'border-amber-400',
          accentBg: 'bg-amber-500/10',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          benefit: '180M+ clientes Prime'
        },
        {
          id: 'shopify' as MarketplaceChannel,
          name: 'Shopify Direct',
          tag: 'SHOPIFY',
          shortName: 'Shopify',
          feeRate: 0.03,
          feeLabel: '2.9%',
          theme: 'emerald',
          iconColor: '#10B981',
          accentBorder: 'border-emerald-400',
          accentBg: 'bg-emerald-500/10',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          benefit: 'Menor taxa de gateway'
        }
      ];
    }

    return [
      {
        id: 'mercadolivre' as MarketplaceChannel,
        name: 'Mercado Livre (ML)',
        tag: 'MERCADO LIVRE',
        shortName: 'Mercado Livre',
        feeRate: 0.13,
        feeLabel: '13%',
        theme: 'yellow',
        iconColor: '#FFE600',
        accentBorder: 'border-yellow-400',
        accentBg: 'bg-yellow-500/10',
        badgeBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        benefit: 'Maior volume do Brasil'
      },
      {
        id: 'shopee' as MarketplaceChannel,
        name: 'Shopee Brasil',
        tag: 'SHOPEE',
        shortName: 'Shopee',
        feeRate: 0.14,
        feeLabel: '14%',
        theme: 'orange',
        iconColor: '#EE4D2D',
        accentBorder: 'border-orange-400',
        accentBg: 'bg-orange-500/10',
        badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
        benefit: 'Campeão em cupons'
      },
      {
        id: 'tiktok' as MarketplaceChannel,
        name: 'TikTok Shop',
        tag: 'TIKTOK SHOP',
        shortName: 'TikTok Shop',
        feeRate: 0.10,
        feeLabel: '10%',
        theme: 'cyan',
        iconColor: '#00F2FE',
        accentBorder: 'border-cyan-400',
        accentBg: 'bg-cyan-500/10',
        badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        benefit: 'Algoritmo viral com IA'
      }
    ];
  }, [isUsd]);

  const [selectedChannel, setSelectedChannel] = useState<MarketplaceChannel>(
    isUsd ? 'tiktok' : 'shopee'
  );

  const activeChannelConfig = useMemo(() => {
    return channels.find(c => c.id === selectedChannel) || channels[0];
  }, [channels, selectedChannel]);

  // 4. Margem Dela (Lucro Líquido)
  const [selectedMarginPercent, setSelectedMarginPercent] = useState<number>(35);
  const [customMarginValue, setCustomMarginValue] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Cálculo de Margem e Preço Final
  const { sellerMargin, finalSellingPrice, marketplaceFeeAmount } = useMemo(() => {
    const feeRate = activeChannelConfig.feeRate;
    
    let desiredMargin = Math.round(basePrice * (selectedMarginPercent / 100) * 100) / 100;
    if (isCustomMode && customMarginValue) {
      const parsed = parseFloat(customMarginValue.replace(',', '.'));
      if (!isNaN(parsed) && parsed > 0) {
        desiredMargin = parsed;
      }
    }

    // Fórmula: Preço Final = (Custo Fornecedor + Margem Dela) / (1 - Taxa Marketplace)
    const rawFinalPrice = (supplierCost + desiredMargin) / (1 - feeRate);
    const finalRounded = Math.round(rawFinalPrice * 100) / 100;
    const feeAmount = Math.round((finalRounded * feeRate) * 100) / 100;

    return {
      sellerMargin: desiredMargin,
      finalSellingPrice: finalRounded,
      marketplaceFeeAmount: feeAmount
    };
  }, [basePrice, selectedMarginPercent, isCustomMode, customMarginValue, supplierCost, activeChannelConfig.feeRate]);

  // Projeção Diária
  const daily5SalesProfit = Math.round(sellerMargin * 5 * 100) / 100;
  const monthly150SalesProfit = Math.round(sellerMargin * 150 * 100) / 100;

  // Porcentagens para a Barra Visual de Composição
  const supplierBarPercent = Math.max(10, Math.round((supplierCost / finalSellingPrice) * 100));
  const feeBarPercent = Math.max(8, Math.round((marketplaceFeeAmount / finalSellingPrice) * 100));
  const profitBarPercent = Math.max(10, 100 - supplierBarPercent - feeBarPercent);

  const handleSelectPreset = (pct: number) => {
    setIsCustomMode(false);
    setSelectedMarginPercent(pct);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCustomMode(false);
    setSelectedMarginPercent(parseInt(e.target.value, 10));
  };

  const handleCustomValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCustomMode(true);
    setCustomMarginValue(e.target.value);
    const num = parseFloat(e.target.value.replace(',', '.'));
    if (!isNaN(num) && num > 0 && basePrice > 0) {
      const calcPct = Math.min(80, Math.max(10, Math.round((num / basePrice) * 100)));
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0d121f] border border-white/10 rounded-[28px] p-5 sm:p-6 shadow-2xl text-slate-100 space-y-4 my-auto animate-in zoom-in-95 duration-150 overflow-hidden">
        
        {/* Glow sutil no topo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-[#22c55e]/15 to-transparent blur-2xl pointer-events-none" />

        {/* 1. Header Minimalista */}
        <div className="flex items-start justify-between gap-3 relative z-10 pb-1">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#22c55e]/10 text-[#4ade80] border border-[#22c55e]/25 text-[10px] font-black uppercase tracking-wider mb-1">
              <Sparkles size={11} />
              <span>Divulgação com IA</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Onde e quanto você deseja lucrar?
            </h2>
            <p className="text-xs text-slate-400">
              Escolha o canal de venda e sua margem líquida por pedido.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title="Fechar"
          >
            <X size={16} />
          </button>
        </div>

        {/* 2. Card do Produto (Limpo e Compacto) */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5 relative z-10">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0">
            <SafeImage
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-bold uppercase tracking-wider text-primary">
                {product.category || 'Geral'}
              </span>
              <span className="text-[9px] text-amber-300 font-bold flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                <Lock size={9} />
                <span>Custo Fornecedor: {currencySymbol} {supplierCost.toFixed(2).replace('.', ',')}</span>
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-white truncate mt-0.5" title={product.name}>
              {product.name}
            </h4>
          </div>
        </div>

        {/* 3. Seletor de Canal de Venda (Cards Modernos e Clicáveis) */}
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Store size={13} className="text-[#22c55e]" /> Canal de Venda
            </span>
            <span className="text-[10px] text-slate-400">Taxa do marketplace inclusa</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {channels.map((ch) => {
              const isSelected = selectedChannel === ch.id;
              return (
                <button
                  type="button"
                  key={ch.id}
                  onClick={() => setSelectedChannel(ch.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected 
                      ? `${ch.accentBg} ${ch.accentBorder} shadow-lg shadow-black/40 ring-1 ring-white/10` 
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="w-full flex items-center justify-between mb-1.5">
                    <span 
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: ch.iconColor }}
                    />
                    {isSelected ? (
                      <div className="w-4 h-4 rounded-full bg-[#22c55e] text-black flex items-center justify-center">
                        <Check size={10} strokeWidth={3} />
                      </div>
                    ) : (
                      <span className="text-[9px] font-bold text-slate-400">{ch.feeLabel}</span>
                    )}
                  </div>

                  <div>
                    <h5 className="text-xs font-black text-white leading-tight">
                      {ch.shortName}
                    </h5>
                    <p className="text-[10px] text-slate-400 leading-snug mt-0.5 truncate">
                      {ch.benefit}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Controle de Margem e Lucro Líquido (Design Imersivo) */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 space-y-3 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Seu Lucro Líquido por Venda
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl sm:text-3xl font-black text-[#4ade80] font-mono tracking-tight">
                  +{currencySymbol} {sellerMargin.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {selectedMarginPercent}% de margem
                </span>
              </div>
            </div>

            {/* Input customizado de valor */}
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block mb-1">Definir em {currencySymbol}:</span>
              <div className="inline-flex items-center gap-1 bg-black/60 border border-white/20 focus-within:border-[#22c55e] rounded-xl px-2.5 py-1">
                <span className="text-xs text-slate-400 font-bold">{currencySymbol}</span>
                <input
                  type="text"
                  value={isCustomMode ? customMarginValue : sellerMargin.toFixed(2).replace('.', ',')}
                  onChange={handleCustomValueChange}
                  placeholder="0,00"
                  className="w-16 bg-transparent text-xs font-black text-[#4ade80] font-mono text-right outline-none"
                />
              </div>
            </div>
          </div>

          {/* Slider de Porcentagem */}
          <div className="space-y-1.5 pt-1">
            <input
              type="range"
              min="15"
              max="65"
              step="1"
              value={selectedMarginPercent}
              onChange={handleSliderChange}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#22c55e]"
            />
          </div>

          {/* Presets Rápidos */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {[
              { pct: 20, label: '20%' },
              { pct: 30, label: '30%' },
              { pct: 38, label: '38% ⭐' },
              { pct: 50, label: '50%' }
            ].map((p) => (
              <button
                key={p.pct}
                type="button"
                onClick={() => handleSelectPreset(p.pct)}
                className={`py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                  !isCustomMode && selectedMarginPercent === p.pct
                    ? 'bg-[#22c55e] text-black shadow-md shadow-[#22c55e]/20'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Barra Visual de Composição do Preço (Apple / Stripe style) */}
        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-2.5 relative z-10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Preço Final ao Consumidor:</span>
            <span className="text-sm font-black text-white font-mono">
              {currencySymbol} {finalSellingPrice.toFixed(2).replace('.', ',')}
            </span>
          </div>

          {/* Barra Segmentada */}
          <div className="w-full h-2 rounded-full overflow-hidden flex bg-white/5 gap-0.5">
            <div 
              style={{ width: `${supplierBarPercent}%` }} 
              className="bg-slate-500 rounded-l-full transition-all duration-300" 
              title={`Fornecedor: ${currencySymbol} ${supplierCost.toFixed(2)}`}
            />
            <div 
              style={{ width: `${feeBarPercent}%` }} 
              className={`transition-all duration-300 ${
                activeChannelConfig.theme === 'yellow' ? 'bg-yellow-400' :
                activeChannelConfig.theme === 'orange' ? 'bg-orange-400' : 'bg-cyan-400'
              }`} 
              title={`Canal: ${currencySymbol} ${marketplaceFeeAmount.toFixed(2)}`}
            />
            <div 
              style={{ width: `${profitBarPercent}%` }} 
              className="bg-[#22c55e] rounded-r-full transition-all duration-300" 
              title={`Seu Lucro: ${currencySymbol} ${sellerMargin.toFixed(2)}`}
            />
          </div>

          {/* Legendas Limpas */}
          <div className="grid grid-cols-3 text-[10px] gap-2 pt-0.5">
            <div className="flex items-center gap-1.5 text-slate-400 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
              <span className="truncate">Fornecedor: <strong className="text-slate-300">{currencySymbol} {supplierCost.toFixed(2).replace('.', ',')}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 truncate">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                activeChannelConfig.theme === 'yellow' ? 'bg-yellow-400' :
                activeChannelConfig.theme === 'orange' ? 'bg-orange-400' : 'bg-cyan-400'
              }`} />
              <span className="truncate">Taxa ({activeChannelConfig.feeLabel}): <strong className="text-slate-300">{currencySymbol} {marketplaceFeeAmount.toFixed(2).replace('.', ',')}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 truncate font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shrink-0" />
              <span className="truncate">Seu Lucro: <strong className="text-[#4ade80]">+{currencySymbol} {sellerMargin.toFixed(2).replace('.', ',')}</strong></span>
            </div>
          </div>
        </div>

        {/* 6. Projeção Compacta */}
        <div className="px-3.5 py-2.5 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-between text-[11px] text-slate-300 relative z-10">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-[#4ade80] shrink-0" />
            <span>
              Projeção com <strong>5 vendas/dia</strong> no {activeChannelConfig.shortName}:
            </span>
          </div>
          <span className="font-black text-[#4ade80] font-mono text-xs">
            +{currencySymbol} {daily5SalesProfit.toFixed(2).replace('.', ',')}/dia
          </span>
        </div>

        {/* 7. Footer com Botões Diretos e Atraentes */}
        <div className="flex items-center justify-end gap-2.5 pt-1 relative z-10">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-bold transition-all cursor-pointer"
          >
            Voltar
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-[#22c55e]/25 hover:shadow-[#22c55e]/40 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <span>Divulgar no {activeChannelConfig.shortName}</span>
            <ArrowRight size={14} className="text-black" />
          </button>
        </div>

      </div>
    </div>
  );
}
