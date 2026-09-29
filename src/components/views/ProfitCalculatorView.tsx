'use client';

import React, { useState } from 'react';
import { Calculator, DollarSign, TrendingUp, Percent, ShoppingBag, ShieldCheck, ArrowRight, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface MarketplacePreset {
  name: string;
  commission: number; // percentage
  fixedFee: number; // R$
}

const MARKETPLACES: Record<string, MarketplacePreset> = {
  shopee: { name: 'Shopee (Padrão)', commission: 14, fixedFee: 4 },
  shopee_frete_gratis: { name: 'Shopee (Com Frete Grátis Extra)', commission: 20, fixedFee: 4 },
  mercado_livre_classico: { name: 'Mercado Livre Clássico', commission: 13, fixedFee: 6 },
  mercado_livre_premium: { name: 'Mercado Livre Premium', commission: 18, fixedFee: 6 },
  amazon: { name: 'Amazon Brasil', commission: 15, fixedFee: 0 },
  loja_propria: { name: 'Loja Própria (Nuvemshop/Shopify)', commission: 3.5, fixedFee: 1 },
};

export default function ProfitCalculatorView() {
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>('shopee');
  const [costPrice, setCostPrice] = useState<number>(35);
  const [sellingPrice, setSellingPrice] = useState<number>(99.90);
  const [shippingPackaging, setShippingPackaging] = useState<number>(6.00);
  const [taxRate, setTaxRate] = useState<number>(4.0); // Simples Nacional %
  const [marketingSpend, setMarketingSpend] = useState<number>(10.00); // Tráfego Pago / Anúncios por venda

  const mp = MARKETPLACES[selectedMarketplace];
  const marketplaceCommissionAmount = (sellingPrice * (mp.commission / 100)) + mp.fixedFee;
  const taxAmount = sellingPrice * (taxRate / 100);
  const totalCosts = costPrice + marketplaceCommissionAmount + taxAmount + shippingPackaging + marketingSpend;
  const netProfit = sellingPrice - totalCosts;
  const netMargin = sellingPrice > 0 ? (netProfit / sellingPrice) * 100 : 0;
  const roi = totalCosts > 0 ? (netProfit / totalCosts) * 100 : 0;
  const markup = costPrice > 0 ? sellingPrice / costPrice : 0;

  const handleCopySummary = () => {
    const summary = `📊 Análise de Viabilidade - DecolaShop
• Preço de Venda: R$ ${sellingPrice.toFixed(2)}
• Custo do Produto: R$ ${costPrice.toFixed(2)}
• Taxa Marketplace (${mp.name}): R$ ${marketplaceCommissionAmount.toFixed(2)}
• Imposto (${taxRate}%): R$ ${taxAmount.toFixed(2)}
• Embalagem/Frete: R$ ${shippingPackaging.toFixed(2)}
• Tráfego Pago (CPA): R$ ${marketingSpend.toFixed(2)}
━━━━━━━━━━━━━━━━━━
💰 Lucro Líquido por Venda: R$ ${netProfit.toFixed(2)}
📈 Margem Líquida: ${netMargin.toFixed(1)}%
🎯 ROI: ${roi.toFixed(1)}%`;

    navigator.clipboard.writeText(summary);
    toast.success('Resumo copiado para a área de transferência!');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3 border border-primary/20">
          <Calculator className="w-3.5 h-3.5" />
          <span>Ferramenta Essencial de E-commerce</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-2">
          Calculadora de <span className="apex-gradient-text">Margem & Lucro</span>
        </h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Simule com precisão o lucro real no bolso antes de anunciar na Shopee, Mercado Livre ou dropshipping.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Inputs */}
        <div className="lg:col-span-7 glass rounded-3xl p-6 md:p-8 border-border/50 space-y-6">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-2">
              Plataforma de Venda
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(MARKETPLACES).map(([key, data]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedMarketplace(key)}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                    selectedMarketplace === key
                      ? 'bg-primary/20 border-primary text-white shadow-lg shadow-primary/10'
                      : 'bg-secondary/30 border-border/50 text-muted-foreground hover:bg-secondary/60'
                  }`}
                >
                  <p className="font-extrabold text-foreground truncate">{data.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{data.commission}% + R$ {data.fixedFee}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Custo de Aquisição do Produto (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">R$</span>
                <input
                  type="number"
                  step="0.10"
                  min="0"
                  value={costPrice}
                  onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-secondary/30 border border-border/50 rounded-xl py-2.5 pl-10 pr-4 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Preço no fornecedor ou fábrica</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Preço de Venda Final (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary text-xs font-bold">R$</span>
                <input
                  type="number"
                  step="0.10"
                  min="0"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-secondary/30 border border-border/50 rounded-xl py-2.5 pl-10 pr-4 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Preço anunciado ao cliente</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Embalagem / Envio (R$)
              </label>
              <input
                type="number"
                step="0.50"
                min="0"
                value={shippingPackaging}
                onChange={(e) => setShippingPackaging(parseFloat(e.target.value) || 0)}
                className="w-full bg-secondary/30 border border-border/50 rounded-xl py-2.5 px-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Imposto Simples (%)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="50"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="w-full bg-secondary/30 border border-border/50 rounded-xl py-2.5 px-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                CPA Tráfego Pago (R$)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={marketingSpend}
                onChange={(e) => setMarketingSpend(parseFloat(e.target.value) || 0)}
                className="w-full bg-secondary/30 border border-border/50 rounded-xl py-2.5 px-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
              />
            </div>
          </div>

          {/* Quick presets */}
          <div className="pt-2 border-t border-border/30">
            <span className="text-[11px] font-bold text-muted-foreground mr-2">Exemplos Rápidos:</span>
            <div className="inline-flex gap-2 flex-wrap mt-1">
              <button
                type="button"
                onClick={() => { setCostPrice(28); setSellingPrice(79.90); setMarketingSpend(8); }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
              >
                Eletrônico Ticket Baixo
              </button>
              <button
                type="button"
                onClick={() => { setCostPrice(85); setSellingPrice(249.00); setMarketingSpend(35); }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
              >
                Gadget Ticket Médio
              </button>
              <button
                type="button"
                onClick={() => { setCostPrice(12); setSellingPrice(49.90); setMarketingSpend(5); }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
              >
                Beleza / Cosmético
              </button>
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className={`p-8 rounded-3xl border transition-all ${
            netProfit > 0
              ? 'bg-gradient-to-br from-emerald-950/40 via-dark-bg to-dark-bg border-emerald-500/30 shadow-2xl shadow-emerald-500/10'
              : 'bg-gradient-to-br from-red-950/40 via-dark-bg to-dark-bg border-red-500/30 shadow-2xl shadow-red-500/10'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Resultado Financeiro
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-black ${
                netProfit > 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {netProfit > 0 ? '🟢 OPERAÇÃO LUCRATIVA' : '🔴 OPERAÇÃO NO PREJUÍZO'}
              </span>
            </div>

            <div className="mb-6">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Lucro Líquido por Venda</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl md:text-5xl font-black tracking-tight ${
                  netProfit > 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  R$ {netProfit.toFixed(2)}
                </span>
                <span className="text-sm font-bold text-muted-foreground">/ unidade</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 mb-6 text-center">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-black">Margem Líquida</p>
                <p className={`text-lg font-black mt-0.5 ${netMargin >= 20 ? 'text-emerald-400' : netMargin > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {netMargin.toFixed(1)}%
                </p>
              </div>
              <div className="border-x border-white/10">
                <p className="text-[10px] text-muted-foreground uppercase font-black">Markup</p>
                <p className="text-lg font-black mt-0.5 text-primary">
                  {markup.toFixed(2)}x
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-black">ROI</p>
                <p className={`text-lg font-black mt-0.5 ${roi >= 30 ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {roi.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-2.5 text-xs text-slate-300 border-t border-white/10 pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Comissão Plataforma ({mp.commission}% + R$ {mp.fixedFee}):</span>
                <span className="font-bold text-red-400">- R$ {marketplaceCommissionAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Impostos ({taxRate}%):</span>
                <span className="font-bold text-red-400">- R$ {taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Custo de Produto:</span>
                <span className="font-bold text-red-400">- R$ {costPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Embalagem + Tráfego:</span>
                <span className="font-bold text-red-400">- R$ {(shippingPackaging + marketingSpend).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCopySummary}
              className="mt-6 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-black font-extrabold text-xs hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
              <Sparkles size={14} />
              Copiar Relatório de Viabilidade
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50 text-xs text-muted-foreground flex items-center gap-3">
            <ShieldCheck size={20} className="text-primary flex-shrink-0" />
            <p>
              <strong className="text-foreground">Dica DecolaShop:</strong> Recomendamos buscar produtos com margem líquida superior a <strong>25%</strong> e markup mínimo de <strong>2.5x</strong> para suportar escala de anúncios.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
