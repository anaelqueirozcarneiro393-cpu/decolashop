'use client';

import React from 'react';
import { ExternalLink, Link2, Flame, Video as Youtube, Search as GoogleIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  title: string;
  source: 'Google Ads' | 'YouTube';
  temperature: number; // 0 to 100
  imageUrl?: string;
}

export default function ProductCard({ title, source, temperature, imageUrl }: ProductCardProps) {
  const isYouTube = source === 'YouTube';
  
  return (
    <div className="group relative glass rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]">
      {/* Image Container */}
      <div className="aspect-square w-full bg-secondary/30 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20">
          <Package size={48} />
        </div>
        
        {/* Source Badge */}
        <div className={cn(
          "absolute top-3 left-3 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg backdrop-blur-md",
          isYouTube ? "bg-destructive/20 text-destructive border border-destructive/30" : "bg-primary/20 text-primary border border-primary/30"
        )}>
          {isYouTube ? <Youtube size={12} /> : <GoogleIcon size={12} />}
          {source}
        </div>

        {/* Action Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform shadow-xl" title="Ver Anúncio">
            <ExternalLink size={20} />
          </button>
          <button className="p-3 apex-gradient text-white rounded-full hover:scale-110 transition-transform shadow-xl" title="Gerar Link de Afiliado">
            <Link2 size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-2 mb-4 h-10 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Virality Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-accent">
              <Flame size={14} className={cn(temperature > 70 && "animate-bounce")} />
              <span className="font-bold uppercase tracking-tighter">Viralidade</span>
            </div>
            <span className="font-mono text-muted-foreground">{temperature}%</span>
          </div>
          
          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-1000",
                temperature > 80 ? "bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.5)]" : 
                temperature > 50 ? "bg-accent shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-primary"
              )}
              style={{ width: `${temperature}%` }}
            />
          </div>
        </div>
        
        {/* Quick Actions Mobile (Visible always on mobile, or just use overlay for desktop) */}
        <div className="grid grid-cols-2 gap-2 mt-4 md:hidden">
           <button className="flex items-center justify-center gap-1.5 bg-secondary text-xs font-bold py-2 rounded-lg border border-border">
             <ExternalLink size={14} /> Ver
           </button>
           <button className="flex items-center justify-center gap-1.5 apex-gradient text-xs font-bold py-2 rounded-lg">
             <Link2 size={14} /> Link
           </button>
        </div>
      </div>
    </div>
  );
}

// Helper to keep Package icon available
import { Package } from 'lucide-react';
