'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Play, 
  Pause, 
  Maximize2, 
  Download, 
  Link, 
  Check, 
  Smartphone, 
  Film, 
  Mic, 
  Music, 
  Cpu, 
  ShieldCheck,
  Lock,
  Flame,
  Eye,
  QrCode,
  CheckCircle2,
  Copy,
  Clock,
  X,
  Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import SafeImage from '@/components/SafeImage';
import { mockProducts } from '@/lib/mockData';
import { useSession } from 'next-auth/react';
import { hasOrderBump, unlockOrderBumpsLocally } from '@/lib/orderBumps';

interface VideoIaViewProps {
  product?: any;
  onNavigate?: (view: any, product?: any) => void;
}

export default function VideoIaView({ product, onNavigate }: VideoIaViewProps) {
  const { data: session } = useSession();
  const [selectedProduct, setSelectedProduct] = useState<any>(product || mockProducts[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeAngle, setActiveAngle] = useState(1);
  const [selectedVoice, setSelectedVoice] = useState('julia');
  const [selectedMusic, setSelectedMusic] = useState('upbeat');
  const [selectedScriptType, setSelectedScriptType] = useState('achadinho');
  const [selectedModel, setSelectedModel] = useState('viral_velocity');
  const [activeViewMode, setActiveViewMode] = useState<'limpo' | 'social'>('limpo');
  const [isUnlockedCreatives, setIsUnlockedCreatives] = useState(false);

  // Status de Desbloqueio do Gerador de Vídeos IA (R$ 27,90 Vitalício)
  const [isUnlockedGenerator, setIsUnlockedGenerator] = useState(false);

  // Estados dos Modais
  const [showPixModal, setShowPixModal] = useState(false);
  const [showBetaModal, setShowBetaModal] = useState(false);
  const [isLoadingPix, setIsLoadingPix] = useState(false);
  const [isConfirmingPix, setIsConfirmingPix] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutos
  const [pixData, setPixData] = useState<{
    qrCodeText: string;
    qrCodeImage: string;
    transactionId: string;
  } | null>(null);

  useEffect(() => {
    const checkBumps = () => {
      const isGeneratorUnlocked = 
        hasOrderBump('bump_gerador_videos_ia', session) ||
        (typeof window !== 'undefined' && localStorage.getItem('decolashop_unlocked_video_ia') === 'true');
      setIsUnlockedGenerator(isGeneratorUnlocked);
      setIsUnlockedCreatives(hasOrderBump('bump_criativos', session));
    };

    checkBumps();
    window.addEventListener('decolashop_bumps_updated', checkBumps);
    return () => window.removeEventListener('decolashop_bumps_updated', checkBumps);
  }, [session]);

  useEffect(() => {
    if (!showPixModal) return;
    setTimeLeft(600);
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [showPixModal]);

  const handleOpenCheckout = async () => {
    setIsLoadingPix(true);
    const userCpf = 
      (session?.user as any)?.cpf || 
      (typeof window !== 'undefined' ? localStorage.getItem('decolashop_user_cpf') : null) || 
      '39151747805';

    try {
      const response = await fetch('/api/sigilopay/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: 'bumps_only',
          planPrice: 0,
          bumps: ['bump_gerador_videos_ia'],
          total: 27.90,
          customer: {
            name: session?.user?.name || 'Cliente DecolaShop',
            email: session?.user?.email || 'cliente@decolashop.com',
            cpf: userCpf,
            phone: '11999999999'
          }
        })
      });

      const res = await response.json();
      if (res.success && res.pix) {
        setPixData(res.pix);
        setShowPixModal(true);
        toast.success('Chave Pix de R$ 27,90 gerada com sucesso!');
      } else {
        toast.error(res.error || 'Erro ao gerar Pix. Tente novamente.');
      }
    } catch {
      toast.error('Erro de conexão com o gateway de pagamento.');
    } finally {
      setIsLoadingPix(false);
    }
  };

  const copyPixCode = () => {
    if (!pixData?.qrCodeText) return;
    navigator.clipboard.writeText(pixData.qrCodeText);
    setCopiedPix(true);
    toast.success('Código Pix Copia e Cola copiado!');
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const handleConfirmPix = async () => {
    setIsConfirmingPix(true);
    try {
      await fetch('/api/sigilopay/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session?.user?.email || 'cliente@decolashop.com',
          bumps: ['bump_gerador_videos_ia'],
          transactionId: pixData?.transactionId
        })
      });

      unlockOrderBumpsLocally('bump_gerador_videos_ia');
      if (typeof window !== 'undefined') {
        localStorage.setItem('decolashop_unlocked_video_ia', 'true');
      }
      setIsUnlockedGenerator(true);
      setShowPixModal(false);
      toast.success('🎉 Pagamento confirmado! Gerador de Vídeos com IA liberado com Acesso Vitalício!');
    } catch {
      toast.error('Erro ao confirmar pagamento. Tente novamente.');
    } finally {
      setIsConfirmingPix(false);
    }
  };

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const openBumpModal = () => {
    window.dispatchEvent(new CustomEvent('decolashop_open_bump_modal', { 
      detail: { bumpId: 'bump_acelerador' } 
    }));
  };

  const angles = [
    { id: 1, label: '01', title: 'Ângulo 1 - Visão Frontal' },
    { id: 2, label: '02', title: 'Ângulo 2 - Detalhe Frasco Dourado' },
    { id: 3, label: '03', title: 'Ângulo 3 - Textura & Válvula Spray' },
    { id: 4, label: '04', title: 'Ângulo 4 - Aplicação & Brilho' },
    { id: 5, label: '05', title: 'Ângulo 5 - Unboxing & Embalagem' },
  ];

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://appnewshop.com/v/kit-body-splash-obsession-hd');
    toast.success('🔗 Link do vídeo copiado para a área de transferência!');
  };

  const handleDownload = () => {
    toast.success('📥 Iniciando download do MP4 (1080p 60FPS)...');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {isUnlockedGenerator ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22c55e]/15 text-[#4ade80] border border-[#22c55e]/30 text-xs font-bold mb-2 shadow-[0_0_10px_rgba(34,197,94,0.15)]">
              <Check className="w-3.5 h-3.5 text-[#22c55e]" />
              <span>ACESSO VITALÍCIO ATIVO • CRIADOR INTELIGENTE IA</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold mb-2 shadow-[0_0_10px_rgba(245,158,11,0.15)]">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>RECURSO EXCLUSIVO • DESBLOQUEIO VITALÍCIO R$ 27,90</span>
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Gerar Vídeos com IA
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Transforme instantaneamente qualquer produto em vídeos de alta conversão para o TikTok, Reels, Kwai e Shorts.
          </p>
        </div>

        {!isUnlockedGenerator && (
          <button
            type="button"
            onClick={handleOpenCheckout}
            disabled={isLoadingPix}
            className="py-3 px-5 rounded-2xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#22c55e]/25 transition-all cursor-pointer self-start sm:self-auto shrink-0 active:scale-95"
          >
            <Sparkles size={15} />
            <span>Desbloquear Vitalício (R$ 27,90)</span>
          </button>
        )}
      </div>

      {/* Paywall Banner quando não desbloqueado */}
      {!isUnlockedGenerator && (
        <div className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-b from-[#0d1424] via-[#090d17] to-[#060911] border-2 border-[#22c55e]/50 shadow-2xl shadow-[#22c55e]/20 overflow-hidden text-center animate-in fade-in zoom-in-95 duration-300">
          {/* Radial glows */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#22c55e]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Badges */}
          <div className="relative z-10 flex items-center justify-center gap-2 flex-wrap mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/40 text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(34,197,94,0.25)]">
              <Sparkles size={14} className="text-[#22c55e] animate-pulse" />
              <span>FERRAMENTA EXCLUSIVA • ACESSO VITALÍCIO</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-black uppercase">
              <Flame size={12} className="text-amber-400" />
              <span>OFERTA DE LANÇAMENTO</span>
            </span>
          </div>

          {/* Title & Subtitle */}
          <div className="relative z-10 max-w-2xl mx-auto space-y-3 mb-8">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Desbloqueie o <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22c55e] via-[#4ade80] to-[#86efac]">Gerador de Vídeos com IA</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Crie anúncios e vídeos de alta conversão para o <strong>TikTok Shop, Instagram Reels, Kwai e YouTube Shorts</strong> em segundos. Sem mostrar o rosto, sem precisar gravar nada e com narração neural ultra-realista em português.
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-w-4xl mx-auto mb-8 text-left">
            <div className="p-3.5 rounded-2xl bg-[#111726]/80 border border-white/10 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#22c55e]/20 border border-[#22c55e]/40 flex items-center justify-center text-[#4ade80] shrink-0">
                <Film size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Geração Automática 1080p</p>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">Exportação em 60 FPS formato vertical (9:16) sem marca d'água.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#111726]/80 border border-white/10 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#22c55e]/20 border border-[#22c55e]/40 flex items-center justify-center text-[#4ade80] shrink-0">
                <Mic size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Vozes Neurais em Português</p>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">Entonação humana e natural com vozes masculinas e femininas.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#111726]/80 border border-white/10 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#22c55e]/20 border border-[#22c55e]/40 flex items-center justify-center text-[#4ade80] shrink-0">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Roteiros e Ganchos Virais</p>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">Modelos validados: Achadinho, Review Honesto e 3 Motivos.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#111726]/80 border border-white/10 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#22c55e]/20 border border-[#22c55e]/40 flex items-center justify-center text-[#4ade80] shrink-0">
                <Music size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Músicas & Efeitos de Retenção</p>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">Trilhas virais em alta sincronizadas com cortes dinâmicos.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#111726]/80 border border-white/10 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#22c55e]/20 border border-[#22c55e]/40 flex items-center justify-center text-[#4ade80] shrink-0">
                <Cpu size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Motor Flow AI™ Dedicado</p>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">Cluster neural de alta velocidade com renderização em nuvem.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#111726]/80 border border-white/10 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#22c55e]/20 border border-[#22c55e]/40 flex items-center justify-center text-[#4ade80] shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Acesso Vitalício Garantido</p>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">Sem mensalidades futuras ou taxas recorrentes escondidas.</p>
              </div>
            </div>
          </div>

          {/* Price Box */}
          <div className="relative z-10 max-w-md mx-auto p-5 rounded-2xl bg-[#090e18] border border-[#22c55e]/30 shadow-xl mb-6">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              VALOR PROMOCIONAL EXCLUSIVO
            </span>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-sm text-slate-400 line-through">De R$ 97,00</span>
              <span className="text-xs font-bold text-slate-300">por apenas</span>
              <span className="text-3xl sm:text-4xl font-black text-[#4ade80]">R$ 27,90</span>
            </div>
            <span className="text-[11px] font-bold text-[#22c55e] block mt-1">
              ⚡ Pagamento Único • Acesso Vitalício
            </span>
          </div>

          {/* CTA Button */}
          <div className="relative z-10 max-w-md mx-auto space-y-3">
            <button
              type="button"
              onClick={handleOpenCheckout}
              disabled={isLoadingPix}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#22c55e] via-[#16a34a] to-[#22c55e] hover:brightness-110 active:scale-95 text-black font-black text-sm uppercase tracking-wider shadow-2xl shadow-[#22c55e]/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              {isLoadingPix ? (
                <span>GERANDO CHAVE PIX...</span>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>DESBLOQUEAR GERADOR DE VÍDEOS - R$ 27,90</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 size={13} className="text-[#22c55e]" /> Liberação Imediata
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Lock size={13} className="text-[#22c55e]" /> Pagamento 100% Seguro Pix
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 items-start transition-all duration-300 ${!isUnlockedGenerator ? 'opacity-30 filter blur-[2px] pointer-events-none select-none relative' : ''}`}>
        {/* Left Column: Generation Controls & Settings (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Kit Body Splash Obsession Active Video */}
          <div className="bg-[#0d121f]/90 rounded-3xl p-6 border border-[#22c55e]/30 shadow-xl backdrop-blur-xl space-y-4">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-white">
                  Kit Body Splash Obsession
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Vídeo Oficial do Produto • Reprodução Sem Alteração
                </p>
              </div>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/40 text-[#4ade80] text-[10px] font-black uppercase shadow-[0_0_10px_rgba(34,197,94,0.15)]">
                <Check size={11} strokeWidth={3} />
                <span>ARQUIVO ORIGINAL ATIVO</span>
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              O vídeo original enviado para este produto está totalmente configurado e pronto para reprodução. Ele é exibido exatamente como no arquivo original, sem filtros artificiais, cortes ou sobreposições.
            </p>

            <div className="flex items-center gap-2 flex-wrap pt-1">
              <button
                onClick={handleTogglePlay}
                className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#22c55e]/25 active:scale-95"
              >
                <Play size={13} fill="currentColor" />
                <span>{isPlaying ? 'PAUSAR VÍDEO' : 'ASSISTIR VÍDEO ORIGINAL'}</span>
              </button>

              <button
                onClick={() => toast.success('Exibindo em modo tela cheia limpa')}
                className="flex items-center gap-1.5 py-2.5 px-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 font-bold text-xs transition-all"
              >
                <Maximize2 size={13} />
                <span>Tela Cheia Limpa</span>
              </button>

              <button
                onClick={() => toast('Selecione um arquivo de vídeo do seu dispositivo')}
                className="flex items-center gap-1.5 py-2.5 px-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 font-bold text-xs transition-all"
              >
                <span>↑ Substituir Arquivo de Vídeo</span>
              </button>
            </div>
          </div>

          {/* Step 1: Escolha o Produto */}
          <div className="bg-[#0d121f]/90 rounded-3xl p-6 border border-white/10 shadow-xl backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#22c55e] text-black font-black text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className="text-sm font-extrabold text-white">
                  Escolha o Produto
                </h3>
              </div>

              <span className="text-[10px] font-black uppercase text-[#4ade80] bg-[#22c55e]/20 px-2 py-0.5 rounded-full border border-[#22c55e]/30">
                SELECIONADO
              </span>
            </div>

            {/* Product selection preview from real catalog */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
              {mockProducts.map((p, idx) => {
                const isSelected = selectedProduct?.id === p.id || (!selectedProduct && idx === 0);
                const priceFormatted = typeof p.price === 'string' ? p.price : `R$ ${p.price?.toFixed(2) || '99,90'}`;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedProduct(p);
                      toast(`Produto selecionado: ${p.name}`);
                    }}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-2 border-[#22c55e] bg-[#22c55e]/15 shadow-[0_0_15px_rgba(34,197,94,0.15)]'
                        : 'border-white/10 bg-black/20 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex-shrink-0">
                        <SafeImage
                          src={p.image_url}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                          {p.name}
                        </p>
                        <p className="text-xs font-black text-[#4ade80]">
                          {priceFormatted}
                        </p>
                      </div>
                    </div>
                    {isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-[#22c55e] text-black flex items-center justify-center flex-shrink-0 font-bold">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Configurações de Geração */}
          <div className="bg-[#0d121f]/90 rounded-3xl p-6 border border-white/10 shadow-xl backdrop-blur-xl space-y-6">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#22c55e] text-black font-black text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="text-sm font-extrabold text-white">
                Configurações de Geração
              </h3>
            </div>

            {/* Voices and BGM Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Voz Narradora */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                  <Mic size={14} className="text-[#22c55e]" />
                  <span>Voz Narradora (IA)</span>
                </div>

                <div className="space-y-1.5">
                  {[
                    { id: 'julia', name: 'Júlia (Voz Enérgica / TikTok)', speed: 'Velocidade: 1.1x', gender: 'FEMININA' },
                    { id: 'thiago', name: 'Thiago (Voz Grave / Comercial)', speed: 'Velocidade: 1.0x', gender: 'MASCULINA' },
                    { id: 'mariana', name: 'Mariana (Voz Doce / Amigável)', speed: 'Velocidade: 1.05x', gender: 'FEMININA' },
                    { id: 'galvao', name: 'Galvão IA (Voz Emocionante)', speed: 'Velocidade: 1.2x', gender: 'MASCULINA' },
                  ].map((v) => (
                    <div
                      key={v.id}
                      onClick={() => {
                        setSelectedVoice(v.id);
                        toast(`Voz alterada para: ${v.name}`);
                      }}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        selectedVoice === v.id
                          ? 'border-[#22c55e] bg-[#22c55e]/15 font-bold shadow-[0_0_10px_rgba(34,197,94,0.1)]'
                          : 'border-white/10 bg-black/20 hover:border-white/20'
                      }`}
                    >
                      <div>
                        <p className="text-xs text-white leading-tight">{v.name}</p>
                        <p className="text-[10px] text-slate-400">{v.speed}</p>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                        {v.gender}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Música de Fundo */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                  <Music size={14} className="text-[#22c55e]" />
                  <span>Música de Fundo (Viral)</span>
                </div>

                <div className="space-y-1.5">
                  {[
                    { id: 'upbeat', name: 'TikTok Upbeat (Viral)', vol: 'Volume Médio', mood: 'ENÉRGICA' },
                    { id: 'lofi', name: 'LoFi Aesthetics (Relaxante)', vol: 'Volume Baixo', mood: 'CALMA' },
                    { id: 'cinematic', name: 'Cinematic Epic (Inspiradora)', vol: 'Volume Médio', mood: 'GRANDIOSA' },
                    { id: 'mute', name: 'Sem música (Apenas Voz)', vol: 'Volume Mudo', mood: 'SILENCIOSO' },
                  ].map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        setSelectedMusic(m.id);
                        toast(`Trilha alterada para: ${m.name}`);
                      }}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        selectedMusic === m.id
                          ? 'border-[#22c55e] bg-[#22c55e]/15 font-bold shadow-[0_0_10px_rgba(34,197,94,0.1)]'
                          : 'border-white/10 bg-black/20 hover:border-white/20'
                      }`}
                    >
                      <div>
                        <p className="text-xs text-white leading-tight">{m.name}</p>
                        <p className="text-[10px] text-slate-400">{m.vol}</p>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                        {m.mood}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modelo de Roteiro */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300">
                Modelo de Roteiro / Roteirização IA
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'achadinho', title: 'Achadinho Viral (TikTok Style)', desc: 'Foco em curiosidade extrema, gatilho de escassez e apelo visual rápido.' },
                  { id: 'review', title: 'Review Honesto (Problema vs. Solução)', desc: 'Abordagem real, autoridade, quebra de objeções e depoimento sincero.' },
                  { id: 'motivos', title: '3 Motivos para Ter Esse Produto', desc: 'Estrutura benefícios diretos, detalhes e as principais vantagens.' },
                ].map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedScriptType(s.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all text-left ${
                      selectedScriptType === s.id
                        ? 'border-[#22c55e] bg-[#22c55e]/15 ring-1 ring-[#22c55e]/40 shadow-[0_0_15px_rgba(34,197,94,0.15)]'
                        : 'border-white/10 bg-black/20 hover:border-white/20'
                    }`}
                  >
                    <p className="text-xs font-black text-white mb-1 leading-tight">{s.title}</p>
                    <p className="text-[10px] text-slate-400 leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Vídeo de Vendas / Criativo Próprio */}
            <div className="p-3.5 rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Film size={16} className="text-[#22c55e] flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    kit-body-splash-obsession.mp4 (Arquivo Oficial)
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Arquivo oficial sincronizado. Renderização automática sem alterações.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toast.success('Arquivo original restaurado')}
                  className="text-[10px] font-bold text-[#4ade80] hover:underline"
                >
                  Restaurar Original
                </button>
                <button
                  onClick={() => toast('Substituição de arquivo pronta')}
                  className="px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 text-xs font-bold text-slate-200 hover:bg-white/10"
                >
                  Substituir
                </button>
              </div>
            </div>
          </div>

          {/* Motor de Vídeo Flow AI™ Card */}
          <div className="bg-[#0d121f]/90 rounded-3xl p-6 border border-white/10 shadow-xl backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Cpu size={16} className="text-[#22c55e]" />
                <h3 className="text-sm font-extrabold text-white">
                  Motor de Vídeo Flow AI™
                </h3>
                <span className="text-[10px] font-black uppercase text-[#4ade80] bg-[#22c55e]/20 px-2 py-0.5 rounded-full border border-[#22c55e]/30">
                  CLUSTER NEURAL ATIVO
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button className="text-[11px] font-bold text-[#4ade80] hover:underline">
                  Conectar API Oficial
                </button>
                <span className="text-[10px] font-black uppercase bg-[#22c55e] text-black px-2 py-0.5 rounded-full font-black">
                  ADMIN FLOW AI ENTERPRISE
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Renderização neural de 60 FPS com integração direta ao Flow AI Studio API.
            </p>

            {/* Cluster Models */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {[
                { id: 'viral_velocity', tag: 'ALTA RETENÇÃO', fps: '60 FPS', title: 'Flow AI™ Viral Velocity (TikTok / Kwai)', desc: 'Cortes dinâmicos de 0.8s, zoom neural inteligente no produto e micro transições audiovisuais.' },
                { id: 'cinematic_4k', tag: 'COMERCIAL DE TV', fps: '60 FPS', title: 'Flow AI™ Cinematic Studio 4K', desc: 'Iluminação volumétrica realística de estúdio, destaque óptico de profundidade e transições suaves.' },
                { id: 'motion_3d', tag: 'E-COMMERCE ULTRA', fps: '60 FPS', title: 'Flow AI™ 3D Motion Highlight', desc: 'Reconstrução espacial dimensional com foco em detalhes de fabricação, textura e benefícios.' },
              ].map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    selectedModel === m.id
                      ? 'border-[#22c55e] bg-[#22c55e]/15 shadow-[0_0_15px_rgba(34,197,94,0.15)]'
                      : 'border-white/10 bg-black/20 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between text-[9px] font-black uppercase mb-1">
                    <span className="text-[#4ade80]">{m.tag}</span>
                    <span className="text-slate-400">{m.fps}</span>
                  </div>
                  <p className="text-xs font-extrabold text-white leading-tight mb-1">{m.title}</p>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/10 flex-wrap gap-2">
              <span className="font-semibold">
                Taxa & Formato: <strong className="text-white">1080x1920 Ultra HD (9:16) • 60 FPS Flow Sync</strong>
              </span>
              <span className="text-[#4ade80] font-bold flex items-center gap-1">
                <span>⚡</span> Cluster Flow AI dedicado pronto
              </span>
            </div>
          </div>

          {/* CTA Principal de Geração de Vídeo */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-[#111726] to-[#0d121f] border border-[#22c55e]/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <Sparkles size={16} className="text-[#22c55e]" />
                <span>Pronto para renderizar seu vídeo?</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Produto: <strong className="text-[#4ade80]">{selectedProduct?.name}</strong> • Resolução 1080p 60FPS
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!isUnlockedGenerator) {
                  handleOpenCheckout();
                } else {
                  setShowBetaModal(true);
                }
              }}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-[#22c55e] via-[#16a34a] to-[#22c55e] hover:brightness-110 active:scale-95 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-[#22c55e]/25 flex items-center gap-2 transition-all cursor-pointer shrink-0"
            >
              <Zap size={14} fill="currentColor" />
              <span>GERAR VÍDEO COM IA (BETA)</span>
            </button>
          </div>
        </div>

        {/* Right Column: Smartphone Video Player Mockup */}
        <div className="lg:col-span-5 space-y-6">
          {/* Top Admin Credit Status */}
          <div className="bg-[#0d121f]/90 rounded-3xl p-4 border border-white/10 shadow-xl backdrop-blur-xl flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">Créditos de IA</span>
                <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded border ${
                  isUnlockedGenerator 
                    ? 'bg-[#22c55e]/20 text-[#4ade80] border-[#22c55e]/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {isUnlockedGenerator ? 'VITALÍCIO' : 'BLOQUEADO'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                {isUnlockedGenerator ? 'Acesso Vitalício Ativo • Gerações Ilimitadas' : 'Requer desbloqueio vitalício (R$ 27,90)'}
              </p>
            </div>

            {isUnlockedGenerator ? (
              <button
                onClick={handleTogglePlay}
                className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-black font-black text-xs uppercase tracking-wide flex items-center gap-1.5 shadow-lg shadow-[#22c55e]/20 active:scale-95 transition-all cursor-pointer"
              >
                <Play size={12} fill="currentColor" />
                <span>{isPlaying ? 'PAUSAR VÍDEO' : 'REPRODUZIR VÍDEO'}</span>
              </button>
            ) : (
              <button
                onClick={handleOpenCheckout}
                className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-[#22c55e] text-black font-black text-xs uppercase tracking-wide flex items-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles size={12} fill="currentColor" />
                <span>DESBLOQUEAR (R$ 27,90)</span>
              </button>
            )}
          </div>

          {/* Mode switch tabs */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setActiveViewMode('limpo')}
              className={`py-2 px-4 rounded-xl text-xs font-extrabold transition-all uppercase tracking-wider ${
                activeViewMode === 'limpo'
                  ? 'bg-[#22c55e] text-black shadow-lg shadow-[#22c55e]/25'
                  : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              VÍDEO ORIGINAL LIMPO
            </button>

            <button
              onClick={() => setActiveViewMode('social')}
              className={`py-2 px-4 rounded-xl text-xs font-extrabold transition-all uppercase tracking-wider ${
                activeViewMode === 'social'
                  ? 'bg-[#22c55e] text-black shadow-lg shadow-[#22c55e]/25'
                  : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              MODO SOCIAL
            </button>
          </div>

          <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
            <span>🔉</span> Áudio em mudo - Toque para ativar som original
          </p>

          {/* SMARTPHONE FRAME MOCKUP */}
          <div className="relative mx-auto max-w-[320px] aspect-[9/18.5] bg-gray-950 rounded-[44px] p-3 border-4 border-slate-700 shadow-2xl flex flex-col justify-between overflow-hidden">
            {/* Camera notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-20 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-[#111] mr-3" />
              <div className="w-2 h-2 rounded-full bg-[#1a1a2e]" />
            </div>

            {/* Video Canvas Simulation */}
            <div className="relative w-full h-full rounded-[34px] overflow-hidden bg-gradient-to-b from-stone-800 via-stone-900 to-black flex flex-col justify-between p-4">
              <img
                src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600"
                alt="Kit Body Splash"
                className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${
                  isPlaying ? 'scale-105' : 'scale-100'
                }`}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/50 pointer-events-none" />

              {/* Top Overlays */}
              <div className="relative z-10 flex items-center justify-between text-[10px] text-white font-bold pt-6">
                <span className="bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                  {angles.find((a) => a.id === activeAngle)?.title}
                </span>
                <span className="bg-[#22c55e]/90 text-black px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider">
                  1080P • 60 FPS
                </span>
              </div>

              {/* Center Play Button Overlay */}
              <button
                onClick={handleTogglePlay}
                className="relative z-10 mx-auto w-14 h-14 rounded-full bg-black/60 hover:bg-black/80 border border-[#22c55e]/40 backdrop-blur-md flex items-center justify-center text-[#4ade80] transition-transform active:scale-90 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
              >
                {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-1" />}
              </button>

              {/* Bottom Product Info in Video */}
              <div className="relative z-10 space-y-2">
                <div className="bg-black/60 backdrop-blur-md p-2 rounded-xl border border-white/10 text-white text-[10px]">
                  <p className="font-extrabold text-[#4ade80]">🛍️ Embalagem Completa & Design</p>
                  <p className="text-gray-300 text-[9px]">Kit Body Splash Obsession WePink</p>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className={`h-full bg-[#22c55e] transition-all duration-300 ${isPlaying ? 'w-3/5' : 'w-1/4'}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Angles Selector */}
          <div className="space-y-1.5 text-center">
            <span className="text-xs font-bold text-slate-300">Ângulos do Produto (5):</span>
            <div className="flex items-center justify-center gap-1.5">
              {angles.map((a) => (
                <button
                  key={a.id}
                  onClick={() => {
                    setActiveAngle(a.id);
                    toast(`Exibindo ${a.title}`);
                  }}
                  className={`w-9 h-8 rounded-lg text-xs font-black transition-all ${
                    activeAngle === a.id
                      ? 'bg-[#22c55e] text-black shadow-md shadow-[#22c55e]/25'
                      : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Assistir em Tela Cheia CTA */}
          <button
            onClick={() => toast.success('Exibindo vídeo em tela cheia...')}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#22c55e]/25 active:scale-95 transition-all"
          >
            <Maximize2 size={14} />
            <span>ASSISTIR EM TELA CHEIA</span>
          </button>

          {/* Legendas e Roteiro IA */}
          <div className="bg-[#0d121f]/90 rounded-3xl p-5 border border-white/10 shadow-xl backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                Legendas e Roteiro IA
              </h3>
              <button
                onClick={() => toast('Editor de legendas habilitado')}
                className="text-[10px] font-bold text-[#4ade80] hover:underline"
              >
                Editar Roteiro
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/30 text-slate-200 leading-relaxed flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#22c55e] text-black font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                <p>Eu não acredito que estão vendendo essas duas fragrâncias da Virgínia por apenas R$ 30 aqui no TikTok Shop! 😱</p>
              </div>

              <div className="p-3 rounded-2xl bg-black/30 border border-white/5 text-slate-300 leading-relaxed flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-white/10 text-slate-300 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                <p>Gente, VF Golden e Obsessed são os favoritos da WePink e são perfumes assim de mulherão!</p>
              </div>

              <div className="p-3 rounded-2xl bg-black/30 border border-white/5 text-slate-300 leading-relaxed flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-white/10 text-slate-300 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </span>
                <p>Onde você passa vai deixar aquele rastro, aquela projeção e todo mundo vai querer saber qual é a sua fragrância.</p>
              </div>
            </div>
          </div>

          {/* Download & Copy Link Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDownload}
              className="py-3 px-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
            >
              <Download size={14} />
              <span>BAIXAR MP4 HD</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="py-3 px-4 rounded-2xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-[#22c55e]/25"
            >
              <Link size={14} />
              <span>COPIAR LINK</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= ORDER BUMP: PACK 120+ CRIATIVOS VIRAIS ================= */}
      <div className="bg-[#0d121f] rounded-3xl p-6 md:p-8 border border-[#22c55e]/30 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider mb-2">
              <Flame size={12} className="text-amber-400" />
              <span>ORDER BUMP EXCLUSIVO</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white">
              Pack 120+ Vídeos & Criativos Virais Prontos
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Vídeos gravados em alta definição prontos para rodar no TikTok Shop, Reels e Shopee sem marca d'água.
            </p>
          </div>

          {!isUnlockedCreatives ? (
            <button
              type="button"
              onClick={openBumpModal}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-[#22c55e] text-black font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Sparkles size={14} />
              <span>DESBLOQUEAR POR R$ 14,90</span>
            </button>
          ) : (
            <span className="px-3 py-1 rounded-full bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/40 text-xs font-black shrink-0 flex items-center gap-1">
              <Check size={13} /> ACERVO LIBERADO (120/120)
            </span>
          )}
        </div>

        {!isUnlockedCreatives ? (
          /* GATED LOCK VIEW FOR PACK CRIATIVOS */
          <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 bg-black/40 p-6 sm:p-10 text-center">
            {/* Blurred background preview */}
            <div className="absolute inset-0 opacity-25 filter blur-sm pointer-events-none p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { title: 'Fragrância Golden Virgínia', views: '1.8M' },
                { title: 'Mini Projetor Portátil 4K', views: '2.4M' },
                { title: 'Escova Alisadora 3 em 1', views: '950K' },
                { title: 'Luminária Flame Difusor', views: '3.1M' }
              ].map((v, i) => (
                <div key={i} className="aspect-[9/16] rounded-xl bg-slate-800 p-2 flex flex-col justify-end text-left border border-white/10">
                  <div className="text-[10px] font-bold text-white">{v.title}</div>
                  <div className="text-[9px] text-[#4ade80]">{v.views} views</div>
                </div>
              ))}
            </div>

            {/* Foreground Lock Message */}
            <div className="relative z-10 max-w-md mx-auto space-y-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center mx-auto text-amber-400 shadow-xl shadow-amber-500/20">
                <Lock size={24} />
              </div>

              <div>
                <h3 className="text-lg font-black text-white">
                  Acesso Restrito ao Order Bump
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Desbloqueie o download imediato de mais de 120 criativos virais sem marca d'água, com os ganchos mais assistidos do TikTok e Shopee Brasil.
                </p>
              </div>

              <button
                type="button"
                onClick={openBumpModal}
                className="w-full max-w-sm mx-auto py-3 rounded-xl bg-gradient-to-r from-amber-400 via-[#22c55e] to-emerald-400 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles size={14} />
                <span>DESBLOQUEAR PACK POR R$ 14,90 VIA PIX</span>
              </button>
            </div>
          </div>
        ) : (
          /* UNLOCKED VIRAL CREATIVES GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                id: 'c1',
                title: 'Viral 01: Hook Achadinho WePink',
                views: '2.4M visualizações',
                hook: '"Eu não acredito que estão vendendo por esse preço..."',
                duration: '0:34',
                thumb: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&q=80&w=300'
              },
              {
                id: 'c2',
                title: 'Viral 02: Unboxing Mini Projetor 4K',
                views: '3.1M visualizações',
                hook: '"Transformei meu quarto em cinema gastando menos de 100 reais..."',
                duration: '0:42',
                thumb: 'https://images.unsplash.com/photo-1535016120720-40c646bebbdc?auto=format&fit=crop&q=80&w=300'
              },
              {
                id: 'c3',
                title: 'Viral 03: Escova Alisadora 3 em 1',
                views: '1.9M visualizações',
                hook: '"Minha mãe nunca mais foi no salão depois disso..."',
                duration: '0:29',
                thumb: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&q=80&w=300'
              },
              {
                id: 'c4',
                title: 'Viral 04: Difusor Flame Ultrassônico',
                views: '4.2M visualizações',
                hook: '"O achadinho da Shopee mais hypado do momento..."',
                duration: '0:38',
                thumb: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&q=80&w=300'
              }
            ].map((item) => (
              <div key={item.id} className="bg-black/40 border border-[#22c55e]/30 rounded-2xl p-3 flex flex-col justify-between group hover:border-[#22c55e] transition-all">
                <div>
                  <div className="relative aspect-[9/16] rounded-xl overflow-hidden mb-2.5 bg-slate-900">
                    <img src={item.thumb} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute top-2 right-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-mono text-white">
                      {item.duration}
                    </div>
                    <div className="absolute bottom-2 left-2 bg-[#22c55e]/90 text-black text-[10px] font-black px-2 py-0.5 rounded-full">
                      {item.views}
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-white leading-snug truncate">{item.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 italic">{item.hook}</p>
                </div>

                <div className="pt-2.5 mt-2.5 border-t border-white/10 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(item.hook);
                      toast.success('Roteiro e Gancho copiado!');
                    }}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold cursor-pointer transition-colors text-center"
                  >
                    Copiar Roteiro
                  </button>

                  <button
                    type="button"
                    onClick={() => toast.success(`📥 Baixando ${item.title} (MP4 HD sem marca d'água)...`)}
                    className="py-1.5 px-2.5 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-black text-[10px] font-black flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Download size={11} />
                    <span>Baixar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= MODAL DE CHECKOUT PIX (R$ 27,90 VITALÍCIO) ================= */}
      {showPixModal && pixData && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-md bg-[#0d121f] border border-[#22c55e]/40 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-[#22c55e]/20 text-white max-h-[90vh] overflow-y-auto my-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-white/10 mb-4">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#4ade80] font-black uppercase tracking-wider mb-1">
                  <Sparkles size={14} className="text-[#22c55e]" />
                  <span>LIBERAÇÃO IMEDIATA VIA PIX</span>
                </div>
                <h3 className="text-lg font-black text-white">
                  Gerador de Vídeos com IA
                </h3>
                <span className="text-[10px] text-slate-400">
                  Acesso Vitalício Oficial • Sem Mensalidades
                </span>
              </div>
              <button
                onClick={() => setShowPixModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Price Box */}
            <div className="p-3.5 rounded-2xl bg-[#111726] border border-white/10 flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Total a pagar:</span>
                <span className="text-xs text-slate-300">Pagamento Único Vitalício</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-[#4ade80]">R$ 27,90</span>
              </div>
            </div>

            {/* QR Code Frame */}
            <div className="bg-white p-3.5 rounded-2xl max-w-[210px] mx-auto mb-4 shadow-xl flex items-center justify-center">
              {pixData.qrCodeImage ? (
                <img 
                  src={pixData.qrCodeImage} 
                  alt="QR Code Pix" 
                  className="w-full h-auto object-contain rounded-lg" 
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-black">
                  <QrCode size={130} />
                </div>
              )}
            </div>

            {/* Pix Copia e Cola */}
            <div className="space-y-1.5 mb-4">
              <label className="text-xs font-bold text-slate-300 block">
                Pix Copia e Cola:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={pixData.qrCodeText}
                  className="flex-1 bg-[#111726] border border-white/10 rounded-xl px-3 py-2 text-[11px] font-mono text-slate-300 select-all truncate"
                />
                <button
                  type="button"
                  onClick={copyPixCode}
                  className="px-3.5 py-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-black text-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-all active:scale-95 shadow-sm"
                >
                  {copiedPix ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
                  <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {/* Timer regressivo */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-4">
              <Clock size={14} className="text-amber-400" />
              <span>Chave expira em: <strong className="text-white font-mono">{formatCountdown(timeLeft)}</strong></span>
            </div>

            {/* Botão de confirmação */}
            <button
              type="button"
              onClick={handleConfirmPix}
              disabled={isConfirmingPix}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#22c55e] via-[#16a34a] to-[#22c55e] hover:brightness-110 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-[#22c55e]/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isConfirmingPix ? (
                <span>CONFIRMANDO PAGAMENTO...</span>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>JÁ FIZ O PAGAMENTO VIA PIX</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-slate-400 text-center mt-3 leading-relaxed">
              Abra o aplicativo do seu banco, selecione a opção <strong>Pix &gt; Copia e Cola</strong> ou aponte a câmera para o QR Code. Ao concluir, clique no botão acima para liberar imediatamente.
            </p>
          </div>
        </div>
      )}

      {/* ================= MODAL BETA DE CONFIGURAÇÃO DO GERADOR ================= */}
      {showBetaModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#0d121f] border border-[#22c55e]/40 rounded-3xl p-6 shadow-2xl shadow-[#22c55e]/20 text-white animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-[#22c55e]/20 border border-[#22c55e]/40 flex items-center justify-center mx-auto text-[#4ade80] mb-4 shadow-lg shadow-[#22c55e]/20">
              <Cpu size={26} className="animate-pulse text-[#22c55e]" />
            </div>

            <div className="text-center space-y-2 mb-6">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/30 text-[10px] font-black uppercase">
                MOTOR DE RENDERIZAÇÃO IA
              </span>
              <h3 className="text-xl font-black text-white">
                Renderização em Sincronização
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Os servidores neurais de geração de vídeo em nuvem estão em fase de calibração pelo administrador da plataforma.
              </p>
              <p className="text-[11px] text-[#4ade80] font-semibold leading-relaxed">
                ✓ Seu acesso vitalício já está 100% ativo e registrado. A renderização de novos vídeos customizados estará liberada nas próximas atualizações.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#111726] border border-white/10 text-xs space-y-2.5 mb-6 text-left">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Produto:</span>
                <span className="font-bold text-white truncate max-w-[200px]">{selectedProduct?.name || 'Kit Body Splash'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Voz Narradora:</span>
                <span className="font-bold text-[#4ade80] uppercase">{selectedVoice}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Resolução:</span>
                <span className="font-bold text-white">1080p 60FPS (Vertical 9:16)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Pipeline IA:</span>
                <span className="font-bold text-amber-400">Calibração Inicial Ativa</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowBetaModal(false)}
              className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Entendi, fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
