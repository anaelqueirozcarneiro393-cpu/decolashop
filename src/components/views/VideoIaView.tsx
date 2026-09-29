'use client';

import React, { useState } from 'react';
import { 
  Video, 
  Sparkles, 
  Copy, 
  Check, 
  Play, 
  Smartphone, 
  Layers, 
  Mic, 
  Download, 
  RefreshCw,
  Clapperboard,
  ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface VideoIaViewProps {
  product?: any;
  onNavigate?: (view: any) => void;
}

export default function VideoIaView({ product, onNavigate }: VideoIaViewProps) {
  const [productTitle, setProductTitle] = useState(product?.name || product?.title || 'Mochila Notebook Impermeável');
  const [videoPlatform, setVideoPlatform] = useState<'tiktok' | 'reels' | 'shopee'>('tiktok');
  const [videoStyle, setVideoStyle] = useState<'unboxing' | 'problema_solucao' | 'curiosidade'>('problema_solucao');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const [script, setScript] = useState({
    hook: '🚨 "Você sabia que 8 em cada 10 pessoas estragam o notebook por causa disso aqui?"',
    visualHook: '[Cena rápida em câmera lenta: Chuva caindo forte ou copo de café virando perto da mochila]',
    development: 'Essa é a nova versão à prova d’água com trava antifurto e compartimento acolchoado duplo. Dá pra levar tudo com 100% de segurança.',
    visualDev: '[Cenas rápidas de corte dinâmico mostrando o acabamento resistente, água escorrendo no tecido e compartimento secreto]',
    cta: 'O estoque com frete grátis tá acabando hoje. Clica no link da bio ou aqui embaixo antes que volte ao preço normal!',
    aiPrompt: 'Cinematic hyper-realistic product shot of modern waterproof backpack with raindrops rolling off fabric, 8k resolution, studio lighting, dynamic camera angle --ar 9:16',
    audioTrend: '🎵 Som Recomendado: Áudio em alta no TikTok BR (Phonk Viral / Batida Lo-Fi Comercial)',
  });

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setScript({
        hook: `🔥 "Se você ainda não tem esse ${productTitle}, você está perdendo tempo e dinheiro todo dia!"`,
        visualHook: `[Cena chamativa de 2 segundos mostrando o ${productTitle} em ação rápida com zoom dramático]`,
        development: `Ele resolve de vez o problema com acabamento premium e entrega ultra rápida. O queridinho da Shopee nessa semana.`,
        visualDev: `[Demonstração prática dos 3 maiores benefícios do produto com textos em caixa alta na tela]`,
        cta: `Garanta o seu com desconto exclusivo pelo link que deixei aqui no perfil!`,
        aiPrompt: `Hyper-realistic video of ${productTitle}, high contrast, aesthetic cinematic b-roll, modern commercial, 4k 60fps --ar 9:16`,
        audioTrend: `🎵 Som Viral de Alta Retenção (Top 1 Brasil TikTok Trends)`,
      });
      toast.success('Roteiro e Prompts de Vídeo IA Gerados!');
    }, 1000);
  };

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    toast.success('Copiado para a área de transferência!');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold mb-3 border border-orange-500/20">
          <Clapperboard className="w-3.5 h-3.5" />
          <span>Módulo PRO • Vídeos Virais para Redes Sociais</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-2">
          Gerador de Vídeos Curtos com <span className="apex-gradient-text">Inteligência Artificial</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          Crie roteiros magnéticos de 15 a 45 segundos e prompts prontos para CapCut, Runway, Kling e Pika.
        </p>
      </div>

      {/* Configuration Box */}
      <div className="glass rounded-3xl p-6 md:p-8 border border-border/50 space-y-6">
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-2">
            Nome do Produto
          </label>
          <input
            type="text"
            value={productTitle}
            onChange={(e) => setProductTitle(e.target.value)}
            className="w-full bg-secondary/30 border border-border/50 rounded-xl py-3 px-4 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
            placeholder="Ex: Mini Projetor 4K, Smartwatch..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">Plataforma Principal</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'tiktok', label: 'TikTok' },
                { id: 'reels', label: 'Instagram Reels' },
                { id: 'shopee', label: 'Shopee Vídeos' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setVideoPlatform(p.id as any)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                    videoPlatform === p.id
                      ? 'bg-primary/20 border-primary text-white font-black'
                      : 'bg-secondary/30 border-border/50 text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">Estilo do Criativo</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'problema_solucao', label: 'Dor & Solução' },
                { id: 'unboxing', label: 'Review & Unbox' },
                { id: 'curiosidade', label: 'Curiosidade Viral' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setVideoStyle(s.id as any)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                    videoStyle === s.id
                      ? 'bg-orange-500/20 border-orange-500 text-orange-400 font-black'
                      : 'bg-secondary/30 border-border/50 text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-black text-sm shadow-xl shadow-orange-500/20 transition-all active:scale-95"
        >
          {isGenerating ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
          <span>{isGenerating ? 'Criando Roteiro com IA...' : 'Gerar Roteiro & Prompts de Vídeo'}</span>
        </button>
      </div>

      {/* Generated Script Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Script Steps */}
        <div className="lg:col-span-8 glass rounded-3xl p-6 md:p-8 border border-border/50 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Clapperboard size={20} className="text-primary" /> Roteiro Estruturado de Alta Conversão
            </h3>
            <button
              onClick={() => handleCopy(`${script.hook}\n${script.development}\n${script.cta}`, 'all')}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              {copiedSection === 'all' ? <Check size={12} /> : <Copy size={12} />}
              <span>Copiar Roteiro Completo</span>
            </button>
          </div>

          {/* Hook (0 a 3s) */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-black text-orange-400 uppercase tracking-wider">
                ⚡ Passo 1: Gancho Visual & Falado (0 a 3 segundos)
              </span>
              <button 
                onClick={() => handleCopy(script.hook, 'hook')} 
                className="text-muted-foreground hover:text-white"
              >
                {copiedSection === 'hook' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
            <p className="text-sm font-bold text-white">{script.hook}</p>
            <p className="text-xs text-muted-foreground italic">{script.visualHook}</p>
          </div>

          {/* Development (3 a 12s) */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-black text-primary uppercase tracking-wider">
                ✨ Passo 2: Demonstração do Benefício (3 a 12 segundos)
              </span>
              <button 
                onClick={() => handleCopy(script.development, 'dev')} 
                className="text-muted-foreground hover:text-white"
              >
                {copiedSection === 'dev' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
            <p className="text-sm font-bold text-white">{script.development}</p>
            <p className="text-xs text-muted-foreground italic">{script.visualDev}</p>
          </div>

          {/* CTA (12 a 15s) */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-black text-emerald-400 uppercase tracking-wider">
                👉 Passo 3: Chamada para Ação / CTA (12 a 15 segundos)
              </span>
              <button 
                onClick={() => handleCopy(script.cta, 'cta')} 
                className="text-muted-foreground hover:text-white"
              >
                {copiedSection === 'cta' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
            <p className="text-sm font-bold text-white">{script.cta}</p>
          </div>

          {/* Audio trend */}
          <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/50 text-xs text-slate-300">
            {script.audioTrend}
          </div>
        </div>

        {/* AI Video Prompt Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-darker p-6 rounded-3xl border border-primary/20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-primary tracking-wider">
                Prompt para IA de Vídeo
              </span>
              <button 
                onClick={() => handleCopy(script.aiPrompt, 'prompt')}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                {copiedSection === 'prompt' ? <Check size={12} /> : <Copy size={12} />}
                <span>Copiar</span>
              </button>
            </div>

            <p className="text-xs font-mono text-slate-300 p-3 rounded-xl bg-black/60 border border-white/10 leading-relaxed">
              {script.aiPrompt}
            </p>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Cole este prompt no <strong>Runway Gen-3</strong>, <strong>Kling AI</strong>, <strong>Luma</strong> ou <strong>Midjourney</strong> para gerar os takes em alta definição.
            </p>

            <a
              href="https://capcut.com"
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/10"
            >
              <span>Abrir CapCut Web (Templates)</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
