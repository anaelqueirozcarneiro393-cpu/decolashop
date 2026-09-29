'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, Copy, Check, MessageSquare, Smartphone, ShoppingBag, Edit3, RefreshCw, X, Loader2, Download, Image as ImageIcon } from 'lucide-react';
import { Product } from '@/lib/mockData';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { generateAdAction, generateAdImagePromptAction } from '@/app/actions';

interface AdGeneratorViewProps {
  product?: Product | null;
  onNavigate: (view: any, product?: any) => void;
}

const defaultProductFallback: Product = {
  id: 'top-1',
  name: 'Mochila Notebook Impermeável',
  title: 'Mochila Notebook Impermeável',
  price: 'R$ 119,90',
  image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800',
  hype_score: 95,
  category: 'Acessórios & Tech',
  url: 'https://shopee.com.br',
};

export default function AdGeneratorView({ product: initialProduct, onNavigate }: AdGeneratorViewProps) {
  const product = initialProduct || defaultProductFallback;
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [customCopy, setCustomCopy] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [cacheBuster, setCacheBuster] = useState(Date.now());

  // Auto-generate on load
  useEffect(() => {
    if (!hasGenerated) {
      handleAiRegenerate();
      setHasGenerated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasGenerated]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('✅ Copiado! Agora é só colar');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAiRegenerate = async () => {
    setIsGenerating(true);
    setIsGeneratingImage(true);
    setAiImageUrl(null);
    setImageLoaded(false);
    setImageError(false);
    setCacheBuster(Date.now());

    // Use the actual title, or fallback to the product name
    const titleToUse = product.name || product.title || '';
    const result = await generateAdAction(titleToUse, product.category || 'Geral');
    setIsGenerating(false);

    if (result.success && result.copy) {
      setCustomCopy(result.copy);
      setEditingId('custom');
      toast.success('✨ Copy IA gerada com sucesso!');

      // Now generate the AI Image Prompt (Background scenario)
      const promptResult = await generateAdImagePromptAction(titleToUse, result.copy);
      if (promptResult.success && promptResult.prompt) {
        const bgPrompt = encodeURIComponent(promptResult.prompt.replace(/\s+/g, '_')); // Cloudinary prefers underscores for spaces in prompts
        let finalProductImageUrl = product.image_url || '';
        
        // NOTA: A substituição generativa de fundo do Cloudinary (e_gen_background_replace)
        // foi comentada por padrão porque a cota de recursos de IA da conta do Cloudinary está esgotada (retornando erro 400).
        // Se você fizer upgrade no plano do Cloudinary, pode descomentar este bloco para reativar os fundos de IA!
        /*
        if (finalProductImageUrl.includes('res.cloudinary.com')) {
          // Example: https://res.cloudinary.com/cloud/image/upload/v123/img.jpg
          // Becomes: https://res.cloudinary.com/cloud/image/upload/e_gen_background_replace:prompt_luxury_studio/v123/img.jpg
          finalProductImageUrl = finalProductImageUrl.replace(
            '/upload/', 
            `/upload/e_gen_background_replace:prompt_${bgPrompt}/`
          );
        }
        */

        // Pass this AI-enhanced product shot to Satori to build the Complete Ad (with text, badges, price)
        const satoriAdUrl = `/api/ad-image?title=${encodeURIComponent(titleToUse)}&price=${encodeURIComponent(product.price || '')}&image=${encodeURIComponent(finalProductImageUrl)}&t=${cacheBuster}`;
        
        setAiImageUrl(satoriAdUrl);
      } else {
        setIsGeneratingImage(false);
        toast.error('Erro ao gerar a arte da IA');
      }
    } else {
      setIsGeneratingImage(false);
      toast.error(result.error || 'Erro ao gerar copy IA');
    }
  };

  // Fallback to the old generator if AI image is not ready or failed
  const fallbackAdImageUrl = `/api/ad-image?title=${encodeURIComponent(product.name || product.title || '')}&price=${encodeURIComponent(product.price || '')}&image=${encodeURIComponent(product.image_url || '')}&t=${cacheBuster}`;
  const finalImageUrl = aiImageUrl || fallbackAdImageUrl;

  const downloadImage = async () => {
    try {
      const response = await fetch(finalImageUrl);
      if (!response.ok) throw new Error('Falha ao gerar imagem');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `anuncio-${(product.name || 'produto').toLowerCase().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('📥 Imagem baixada com sucesso!');
    } catch (error) {
      toast.error('Erro ao baixar imagem');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => onNavigate('detalhe', product)}
          className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar ao Produto
        </button>
        <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-widest border border-primary/20">
          <Sparkles size={12} /> IA POWERED
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
            <MessageSquare className="text-primary" size={28} /> Anúncio Gerado para <span className="apex-gradient-text">{product.title || product.name}</span>
          </h1>
          <p className="text-muted-foreground">
            A IA criou a copy e a imagem prontas para você faturar.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: AI Text Copy */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="text-primary" size={20} /> COPY GERADA (TEXTO)
            </h2>
          </div>

          <div className="glass-darker p-8 rounded-[2rem] border border-border/50 shadow-2xl relative overflow-hidden">
            {isGenerating && (
              <div className="absolute inset-0 bg-dark-bg/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                <Loader2 size={40} className="animate-spin text-primary mb-4" />
                <p className="text-primary font-bold animate-pulse">A IA está escrevendo o anúncio perfeito...</p>
              </div>
            )}
            
            <textarea 
              value={editingId ? customCopy : ''}
              onChange={(e) => setCustomCopy(e.target.value)}
              placeholder="O texto do anúncio aparecerá aqui..."
              className="w-full h-[450px] bg-secondary/20 border border-border/50 rounded-2xl p-6 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none font-sans"
            />
            
            <div className="flex flex-wrap gap-3 mt-4">
              <button 
                disabled={!customCopy || isGenerating}
                onClick={() => handleCopy(customCopy, 'custom')}
                className="px-6 py-3 bg-primary text-black rounded-xl font-black text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
              >
                {copiedId === 'custom' ? <Check size={16} /> : <Copy size={16} />}
                {copiedId === 'custom' ? 'COPIADO' : 'COPIAR TEXTO'}
              </button>
              <button 
                disabled={isGenerating}
                onClick={handleAiRegenerate}
                className="px-6 py-3 bg-secondary/50 text-foreground rounded-xl font-bold text-sm flex items-center gap-2 border border-border/50 hover:bg-secondary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw size={16} className={cn(isGenerating && "animate-spin")} />
                REGENERAR TEXTO
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Image Creative */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ImageIcon className="text-primary" size={20} /> CRIATIVO (IMAGEM)
            </h2>
          </div>

          <div className="glass p-6 rounded-[2rem] border border-primary/20 bg-primary/5 flex flex-col items-center justify-center space-y-6">
            <div className="w-full aspect-square rounded-2xl overflow-hidden border-2 border-border shadow-2xl relative bg-black flex items-center justify-center">
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10 space-y-3">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">
                    {isGeneratingImage ? "Criando Imagem IA..." : "Gerando Arte..."}
                  </p>
                </div>
              )}
              
              {imageError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/20 z-20 space-y-3 p-6 text-center">
                  <X className="w-12 h-12 text-destructive" />
                  <p className="text-sm font-bold text-foreground">Erro ao carregar imagem</p>
                  <p className="text-xs text-muted-foreground">A imagem do produto falhou ao ser gerada ou está em um formato não suportado.</p>
                </div>
              ) : (
                <img 
                  src={finalImageUrl} 
                  alt="Ad Creative" 
                  className={cn("w-full h-full object-cover relative z-20 transition-opacity duration-500", imageLoaded ? "opacity-100" : "opacity-0")}
                  onLoad={() => {
                    setImageLoaded(true);
                    setIsGeneratingImage(false);
                  }}
                  onError={() => {
                    setImageError(true);
                    setImageLoaded(true);
                  }}
                />
              )}
            </div>
            
            <button 
              onClick={downloadImage}
              className="w-full px-6 py-4 bg-primary text-black rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
            >
              <Download size={18} />
              BAIXAR IMAGEM (PNG)
            </button>
            
            <p className="text-[10px] text-muted-foreground italic text-center px-4">
              Imagem gerada dinamicamente com os dados do produto, pronta para Facebook Ads e Instagram.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
