'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Sparkles, 
  Share2, 
  ExternalLink, 
  TrendingUp, 
  Filter, 
  Copy, 
  Check, 
  Heart,
  Video,
  ArrowRight
} from 'lucide-react';
import { getProductsFromSupabase } from '@/app/actions';
import { Product } from '@/lib/mockData';
import SafeImage from '@/components/SafeImage';
import { toast } from 'react-hot-toast';

interface CatalogoViewProps {
  onNavigate: (view: any, product?: any) => void;
  onSave?: (id: string) => void;
  savedProducts?: string[];
}

export default function CatalogoView({ onNavigate, onSave, savedProducts = [] }: CatalogoViewProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const res = await getProductsFromSupabase();
      if (res.success && res.data) {
        setProducts(res.data);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  const handleCopyLink = (p: Product) => {
    const affiliateUrl = `https://shopee.com.br/universal-link?aff_id=nextshop_${p.id}`;
    navigator.clipboard.writeText(affiliateUrl);
    setCopiedId(p.id);
    toast.success('Link de afiliado comissionado copiado!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = products.filter(p => {
    const matchesSearch = (p.name || p.title || '').toLowerCase().includes(search.toLowerCase());
    const catLower = (p.category || '').toLowerCase();
    const selLower = selectedCategory.toLowerCase();
    const matchesCat = selectedCategory === 'Todas' || catLower.includes(selLower) || selLower.includes(catLower);
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3 border border-primary/20">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Catálogo Completo para Venda & Afiliados</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">
            Catálogo de <span className="apex-gradient-text">Produtos Vencedores</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Selecione produtos de alta comissão para gerar anúncios e divulgações automáticas com IA.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produtos..."
              className="bg-secondary/30 border border-border/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 flex-wrap">
        {['Todas', 'Eletrônicos', 'Beleza', 'Setup Gamer', 'Cozinha', 'Casa & Decoração'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              selectedCategory === cat
                ? 'bg-primary text-black border-primary font-black shadow-lg shadow-primary/20'
                : 'bg-secondary/30 text-muted-foreground border-border/50 hover:bg-secondary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((prod) => {
          const isSaved = savedProducts.includes(prod.id);
          const commissionVal = typeof prod.price === 'number' 
            ? `R$ ${(prod.price * 0.32).toFixed(2)}`
            : prod.commission || 'R$ 35,00';

          return (
            <div 
              key={prod.id} 
              className="glass rounded-3xl p-5 border border-border/50 hover:border-primary/40 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Image and Badges */}
                <div className="relative w-full h-52 rounded-2xl overflow-hidden bg-secondary/40 border border-border/30 mb-4">
                  <SafeImage 
                    src={prod.image_url} 
                    alt={prod.name || prod.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-emerald-400 border border-white/10">
                    Comissão: {commissionVal}
                  </div>
                  {onSave && (
                    <button
                      onClick={() => onSave(prod.id)}
                      className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md border transition-all ${
                        isSaved ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-black/60 text-white border-white/10 hover:bg-black/80'
                      }`}
                    >
                      <Heart size={14} className={isSaved ? 'fill-current' : ''} />
                    </button>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="font-bold text-primary">{prod.category || 'Shopee Trend'}</span>
                    <span className="font-black text-white">Score: {prod.hype_score || 90}/100</span>
                  </div>
                  <h3 className="font-bold text-base text-white group-hover:text-primary transition-colors line-clamp-2">
                    {prod.name || prod.title}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-white">
                      {typeof prod.price === 'number' ? `R$ ${prod.price.toFixed(2)}` : prod.price}
                    </span>
                    <span className="text-[10px] text-muted-foreground line-through">
                      R$ 189,90
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-3 border-t border-white/10">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onNavigate('divulgacao-ia', prod)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-primary text-black font-extrabold text-xs hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                  >
                    <Sparkles size={14} />
                    <span>Divulgar IA</span>
                  </button>

                  <button
                    onClick={() => onNavigate('video-ia', prod)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-secondary/70 hover:bg-secondary border border-border/50 text-white font-bold text-xs transition-all"
                  >
                    <Video size={14} />
                    <span>Vídeo IA</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyLink(prod)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[11px] font-semibold transition-all"
                  >
                    {copiedId === prod.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedId === prod.id ? 'Copiado!' : 'Link Afiliado'}</span>
                  </button>

                  <button
                    onClick={() => onNavigate('detalhe', prod)}
                    className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[11px] font-semibold transition-all"
                  >
                    Métricas
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
