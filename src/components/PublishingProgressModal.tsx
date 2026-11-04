'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, CheckCircle2, ShoppingBag } from 'lucide-react';
import SafeImage from '@/components/SafeImage';

interface PublishingProgressModalProps {
  isOpen: boolean;
  product: {
    name?: string;
    title?: string;
    image_url?: string;
    price?: number | string;
    category?: string;
  } | null;
  channelLabel: string;
  isUsd?: boolean;
  onComplete: () => void;
}

export default function PublishingProgressModal({
  isOpen,
  product,
  channelLabel,
  isUsd = false,
  onComplete
}: PublishingProgressModalProps) {
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const intervalRef = useRef<any>(null);

  const steps = [
    { title: `Conectando ao canal ${channelLabel}...`, desc: 'Autenticando API de catálogo e verificando permissões de vendedor' },
    { title: 'Sincronizando estoque com fábrica homologada...', desc: isUsd ? 'Verificando centro de distribuição em New Jersey - EUA' : 'Verificando estoque real no centro de distribuição em São Paulo - SP' },
    { title: 'Otimizando anúncio com Inteligência Artificial...', desc: 'Gerando tags virais, fotos de alta conversão e copy persuasiva' },
    { title: 'Indexando nos motores de busca e tráfego pago...', desc: 'Conectando campanha ao Google Shopping, Meta Ads e redes parceiras' },
  ];

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setCurrentStepIndex(0);
      setIsFinished(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    setProgress(0);
    setCurrentStepIndex(0);
    setIsFinished(false);

    const totalDurationMs = 3800; // 3.8s total
    const startTime = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / totalDurationMs) * 100));
      setProgress(pct);

      const stepIdx = Math.min(steps.length - 1, Math.floor((pct / 100) * steps.length));
      setCurrentStepIndex(stepIdx);

      if (elapsed >= totalDurationMs) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setProgress(100);
        setIsFinished(true);

        setTimeout(() => {
          onComplete();
        }, 800);
      }
    }, 40);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const currentStep = steps[currentStepIndex] || steps[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0d121f] border border-[#22c55e]/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl shadow-[#22c55e]/20 relative overflow-hidden text-center">
        
        {/* Glow */}
        <div className="absolute top-0 right-1/4 w-40 h-40 bg-[#22c55e]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-[#22c55e]/15 border border-[#22c55e]/30 flex items-center justify-center mx-auto mb-4 text-[#22c55e] shadow-[0_0_20px_rgba(34,197,94,0.3)]">
          {isFinished ? (
            <CheckCircle2 size={32} className="text-[#22c55e] animate-bounce" />
          ) : (
            <Sparkles size={28} className="text-[#22c55e] animate-pulse" />
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-black text-white tracking-tight mb-1">
          {isFinished ? '🎉 Anúncio Publicado com Sucesso!' : currentStep.title}
        </h3>

        {/* Subtitle */}
        <p className="text-xs text-slate-400 mb-6 leading-relaxed min-h-[36px]">
          {isFinished ? 'Campanha ativada no seu painel de vendas.' : currentStep.desc}
        </p>

        {/* Progress bar */}
        <div className="flex items-center justify-between text-xs font-bold mb-2 px-1">
          <span className="text-slate-300 font-semibold text-[11px]">Progresso do Disparo IA</span>
          <span className="text-[#4ade80] font-black font-mono text-xs">{progress}%</span>
        </div>

        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 mb-5 shadow-inner">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] transition-all duration-150 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
            style={{ width: `${Math.max(4, progress)}%` }}
          />
        </div>

        {/* Product Snapshot */}
        <div className="bg-black/50 border border-white/10 rounded-2xl p-3 flex items-center gap-3 text-left">
          <div className="w-11 h-11 rounded-xl overflow-hidden bg-black shrink-0 border border-white/10">
            <SafeImage 
              src={product.image_url} 
              alt={product.name || product.title || ''} 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">
              {product.name || product.title}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Canal: <strong className="text-[#4ade80]">{channelLabel}</strong>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
