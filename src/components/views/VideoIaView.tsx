'use client';

import React, { useState } from 'react';
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
  ShieldCheck
} from 'lucide-react';
import SafeImage from '@/components/SafeImage';
import { toast } from 'react-hot-toast';

interface VideoIaViewProps {
  product?: any;
  onNavigate?: (view: any, product?: any) => void;
}

export default function VideoIaView({ onNavigate }: VideoIaViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeAngle, setActiveAngle] = useState(1);
  const [selectedVoice, setSelectedVoice] = useState('julia');
  const [selectedMusic, setSelectedMusic] = useState('upbeat');
  const [selectedScriptType, setSelectedScriptType] = useState('achadinho');
  const [selectedModel, setSelectedModel] = useState('viral_velocity');
  const [activeViewMode, setActiveViewMode] = useState<'limpo' | 'social'>('limpo');

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
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22c55e]/15 text-[#4ade80] border border-[#22c55e]/30 text-xs font-bold mb-2 shadow-[0_0_10px_rgba(34,197,94,0.15)]">
          <Film className="w-3.5 h-3.5 text-[#22c55e]" />
          <span>CRIADOR INTELIGENTE</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
          Gerar Vídeos com IA
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Transforme instantaneamente qualquer produto em vídeos de alta conversão para o TikTok, Reels, Kwai e Shorts.
        </p>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
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

            {/* Product selection preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl border-2 border-[#22c55e] bg-[#22c55e]/15 flex items-center justify-between gap-3 shadow-[0_0_15px_rgba(34,197,94,0.15)]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex-shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=200"
                      alt="Kit Body Splash"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      Kit Body Splash Obsession
                    </p>
                    <p className="text-xs font-black text-[#4ade80]">
                      R$ 30,00
                    </p>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full bg-[#22c55e] text-black flex items-center justify-center flex-shrink-0 font-bold">
                  <Check size={12} strokeWidth={3} />
                </div>
              </div>

              <div className="p-3 rounded-2xl border border-white/10 bg-black/20 flex items-center justify-between gap-3 opacity-60">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex-shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&q=80&w=200"
                      alt="Jogo Camisas"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      Jogo Camisas Futebol 53P
                    </p>
                    <p className="text-xs font-black text-slate-400">
                      R$ 1.489,90
                    </p>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0" />
              </div>
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
        </div>

        {/* Right Column: Smartphone Video Player Mockup */}
        <div className="lg:col-span-5 space-y-6">
          {/* Top Admin Credit Status */}
          <div className="bg-[#0d121f]/90 rounded-3xl p-4 border border-white/10 shadow-xl backdrop-blur-xl flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">Créditos de IA</span>
                <span className="text-[10px] font-black uppercase bg-[#22c55e]/20 text-[#4ade80] px-1.5 py-0.5 rounded border border-[#22c55e]/30">
                  ADMIN
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Admin ∞ Ilimitado • Uso Vitalício ∞</p>
            </div>

            <button
              onClick={handleTogglePlay}
              className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-black font-black text-xs uppercase tracking-wide flex items-center gap-1.5 shadow-lg shadow-[#22c55e]/20 active:scale-95 transition-all"
            >
              <Play size={12} fill="currentColor" />
              <span>REPRODUZIR VÍDEO DO KIT OBSESSION</span>
            </button>
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

      {/* Bottom Distribution Info Card */}
      <div className="bg-[#0d121f]/90 rounded-3xl p-6 border border-white/10 shadow-xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-extrabold text-white">
            Distribuição Inteligente Ativada
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Nossos vídeos com IA são formatados nativamente com aspect ratio 9:16 vertical, prontos para impulsionar o algoritmo orgânico do TikTok, Shorts e Reels e converter telespectadores em compradores.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
          <span className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-slate-300">
            ✓ Renderização 60FPS
          </span>
          <span className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-slate-300">
            ✓ Voz Neural Ativa
          </span>
        </div>
      </div>
    </div>
  );
}
