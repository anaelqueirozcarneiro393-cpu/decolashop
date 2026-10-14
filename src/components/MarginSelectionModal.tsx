'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Sparkles, 
  Lock, 
  Check, 
  ArrowRight,
  TrendingUp,
  Sliders,
  DollarSign
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

  // Preço base
  const initialBasePrice = useMemo(() => {
    if (typeof product.price === 'number') return product.price;
    if (typeof product.price === 'string') {
      const clean = product.price.replace(/[^\d.,]/g, '').replace(',', '.');
      const val = parseFloat(clean);
      return !isNaN(val) && val > 0 ? val : (isUsd ? 49.90 : 99.90);
    }
    return isUsd ? 49.90 : 99.90;
  }, [product, isUsd]);

  const [basePrice, setBasePrice] = useState<number>(initialBasePrice);

  useEffect(() => {
    setBasePrice(initialBasePrice);
  }, [initialBasePrice]);

  // Custo Fornecedor (Imutável: 55% nacional, 50% internacional)
  const supplierMarginRate = isUsd ? 0.50 : 0.55;
  const supplierCost = Math.round(basePrice * supplierMarginRate * 100) / 100;
  const supplierMarginPercent = Math.round(supplierMarginRate * 100);

  // Canais disponíveis
  const channels = useMemo(() => {
    if (isUsd) {
      return [
        {
          id: 'tiktok' as MarketplaceChannel,
          name: 'TikTok Shop US',
          shortName: 'TikTok Shop',
          feeRate: 0.08,
          feeLabel: '8% taxa',
          color: '#00F2FE',
          badge: 'Viral US',
          accentBorder: 'border-cyan-400/50 bg-cyan-500/10'
        },
        {
          id: 'amazon' as MarketplaceChannel,
          name: 'Amazon US',
          shortName: 'Amazon',
          feeRate: 0.15,
          feeLabel: '15% taxa',
          color: '#F59E0B',
          badge: 'Prime',
          accentBorder: 'border-amber-400/50 bg-amber-500/10'
        },
        {
          id: 'shopify' as MarketplaceChannel,
          name: 'Shopify US',
          shortName: 'Shopify',
          feeRate: 0.03,
          feeLabel: '2.9% taxa',
          color: '#10B981',
          badge: 'Direto',
          accentBorder: 'border-emerald-400/50 bg-emerald-500/10'
        }
      ];
    }

    return [
      {
        id: 'mercadolivre' as MarketplaceChannel,
        name: 'Mercado Livre (ML)',
        shortName: 'Mercado Livre',
        feeRate: 0.13,
        feeLabel: '13% taxa',
        color: '#FFE600',
        badge: 'Mais Vendido',
        accentBorder: 'border-yellow-400/50 bg-yellow-400/10'
      },
      {
        id: 'shopee' as MarketplaceChannel,
        name: 'Shopee Brasil',
        shortName: 'Shopee',
        feeRate: 0.14,
        feeLabel: '14% taxa',
        color: '#EE4D2D',
        badge: 'Cupons & Frete',
        accentBorder: 'border-orange-500/50 bg-orange-500/10'
      },
      {
        id: 'tiktok' as MarketplaceChannel,
        name: 'TikTok Shop',
        shortName: 'TikTok Shop',
        feeRate: 0.10,
        feeLabel: '10% taxa',
        color: '#00F2FE',
        badge: 'Vídeos Virais',
        accentBorder: 'border-cyan-400/50 bg-cyan-500/10'
      }
    ];
  }, [isUsd]);

  const [selectedChannel, setSelectedChannel] = useState<MarketplaceChannel>(
    isUsd ? 'tiktok' : 'shopee'
  );

  const activeChannel = useMemo(() => {
    return channels.find(c => c.id === selectedChannel) || channels[0];
  }, [channels, selectedChannel]);

  // Margem Dela
  const [selectedMarginPercent, setSelectedMarginPercent] = useState<number>(35);
  const [isEditingValue, setIsEditingValue] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');

  // Cálculo
  const { sellerMargin, finalSellingPrice, marketplaceFeeAmount } = useMemo(() => {
    const feeRate = activeChannel.feeRate;
    let desiredMargin = Math.round(basePrice * (selectedMarginPercent / 100) * 100) / 100;

    if (isEditingValue && inputValue) {
      const parsed = parseFloat(inputValue.replace(',', '.'));
      if (!isNaN(parsed) && parsed > 0) {
        desiredMargin = parsed;
      }
    }

    const rawFinal = (supplierCost + desiredMargin) / (1 - feeRate);
    const finalRounded = Math.round(rawFinal * 100) / 100;
    const feeAmount = Math.round((finalRounded * feeRate) * 100) / 100;

    return {
      sellerMargin: desiredMargin,
      finalSellingPrice: finalRounded,
      marketplaceFeeAmount: feeAmount
    };
  }, [basePrice, selectedMarginPercent, isEditingValue, inputValue, supplierCost, activeChannel.feeRate]);

  const handleSelectPreset = (pct: number) => {
    setIsEditingValue(false);
    setSelectedMarginPercent(pct);
  };

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsEditingValue(false);
    setSelectedMarginPercent(parseInt(e.target.value, 10));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsEditingValue(true);
    setInputValue(e.target.value);
    const num = parseFloat(e.target.value.replace(',', '.'));
    if (!isNaN(num) && num > 0 && basePrice > 0) {
      const pct = Math.min(80, Math.max(10, Math.round((num / basePrice) * 100)));
      setSelectedMarginPercent(pct);
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
        channelLabel: activeChannel.name,
        marketplaceFeeRate: activeChannel.feeRate,
        marketplaceFeeAmount,
        finalSellingPrice,
        currency: isUsd ? 'USD' : 'BRL'
      };
      onConfirm(config);
    } catch {
      toast.error('Erro ao confirmar configuração.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#0e1422] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl text-white space-y-4 animate-in zoom-in-95 duration-150">
        
        {/* Glow sutil */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-16 bg-[#22c55e]/15 blur-2xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#22c55e]/15 border border-[#22c55e]/30 flex items-center justify-center text-[#4ade80]">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Configurar Divulgação</h3>
              <p className="text-[11px] text-slate-400">Escolha o marketplace e sua margem líquida</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Produto Selecionado */}
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 relative z-10">
          <div className="w-11 h-11 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0">
            <SafeImage
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{product.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-slate-400">
                Preço base: <strong className="text-slate-200">{currencySymbol} {basePrice.toFixed(2).replace('.', ',')}</strong>
              </span>
              <span className="text-[9px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded flex items-center gap-1">
                <Lock size={9} /> Fornecedor: {currencySymbol} {supplierCost.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>
        </div>

        {/* Seleção do Canal */}
        <div className="space-y-1.5 relative z-10">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            1. Onde você vai vender?
          </span>
          <div className="grid grid-cols-3 gap-2">
            {channels.map((ch) => {
              const isSelected = selectedChannel === ch.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setSelectedChannel(ch.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? `${ch.accentBorder} shadow-lg shadow-black/40 ring-1 ring-white/10`
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    {/* Ícone vetorizado do marketplace */}
                    {ch.id === 'mercadolivre' && (
                      <div className="w-6 h-6 rounded-lg bg-[#FFE600]/20 flex items-center justify-center">
                        <span className="text-xs font-black text-[#FFE600]">ML</span>
                      </div>
                    )}
                    {ch.id === 'shopee' && (
                      <div className="w-6 h-6 rounded-lg bg-[#EE4D2D]/20 flex items-center justify-center">
                        <span className="text-xs font-black text-[#EE4D2D]">S</span>
                      </div>
                    )}
                    {ch.id === 'tiktok' && (
                      <div className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                        <span className="text-xs font-black text-cyan-300">TT</span>
                      </div>
                    )}
                    {ch.id === 'amazon' && (
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <span className="text-xs font-black text-amber-300">AZ</span>
                      </div>
                    )}
                    {ch.id === 'shopify' && (
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <span className="text-xs font-black text-emerald-300">SP</span>
                      </div>
                    )}

                    {isSelected ? (
                      <div className="w-4 h-4 rounded-full bg-[#22c55e] text-black flex items-center justify-center">
                        <Check size={10} strokeWidth={3} />
                      </div>
                    ) : (
                      <span className="text-[9px] text-slate-500 font-medium">{ch.feeLabel}</span>
                    )}
                  </div>

                  <div>
                    <span className="text-xs font-black text-white block leading-tight">{ch.shortName}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{ch.badge}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Definição da Margem Dela */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              2. Sua Margem Líquida
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              100% creditado a você
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#4ade80] font-mono">
                +{currencySymbol} {sellerMargin.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-xs font-bold text-slate-400">
                ({selectedMarginPercent}%)
              </span>
            </div>

            {/* Input para valor livre */}
            <div className="flex items-center gap-1 bg-black/50 border border-white/15 focus-within:border-[#22c55e] rounded-xl px-2.5 py-1">
              <span className="text-xs text-slate-400 font-medium">{currencySymbol}</span>
              <input
                type="text"
                value={isEditingValue ? inputValue : sellerMargin.toFixed(2).replace('.', ',')}
                onChange={handleInputChange}
                className="w-16 bg-transparent text-xs font-black text-[#4ade80] font-mono text-right outline-none"
              />
            </div>
          </div>

          {/* Slider moderno */}
          <input
            type="range"
            min="15"
            max="60"
            step="1"
            value={selectedMarginPercent}
            onChange={handleSlider}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#22c55e]"
          />

          {/* Presets rápidos */}
          <div className="grid grid-cols-4 gap-1.5 pt-0.5">
            {[
              { pct: 20, label: '20%' },
              { pct: 30, label: '30%' },
              { pct: 35, label: '35% ⭐' },
              { pct: 45, label: '45%' },
            ].map((p) => (
              <button
                key={p.pct}
                type="button"
                onClick={() => handleSelectPreset(p.pct)}
                className={`py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                  !isEditingValue && selectedMarginPercent === p.pct
                    ? 'bg-[#22c55e] text-black shadow-md shadow-[#22c55e]/25'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resumo Transparente do Preço Final */}
        <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between text-xs relative z-10">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Preço Final na {activeChannel.shortName}</span>
            <div className="text-sm font-black text-white font-mono mt-0.5">
              {currencySymbol} {finalSellingPrice.toFixed(2).replace('.', ',')}
            </div>
          </div>
          <div className="text-right text-[11px] text-slate-400">
            <span>Custo ({currencySymbol} {supplierCost.toFixed(2)}) + Taxa (~{currencySymbol} {marketplaceFeeAmount.toFixed(2)})</span>
          </div>
        </div>

        {/* Footer com Ações */}
        <div className="flex items-center gap-2 pt-1 relative z-10">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-1/3 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            Voltar
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-[#22c55e]/25 hover:shadow-[#22c55e]/40 transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <span>Divulgar na {activeChannel.shortName}</span>
            <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
}
