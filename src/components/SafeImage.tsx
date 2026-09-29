'use client';

import React, { useState } from 'react';
import { Zap } from 'lucide-react';

interface SafeImageProps {
  src?: string | null;
  alt?: string | null;
  className?: string;
}

export default function SafeImage({ src, alt, className }: SafeImageProps) {
  const [tryProxy, setTryProxy] = useState(false);
  const [error, setError] = useState(false);
  const displayAlt = alt || 'Produto';

  // If the image had an error loading or has an empty URL, show a beautiful dark gradient with a Zap icon
  if (error || !src) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-secondary/40 to-secondary/10 text-muted-foreground/30 p-4 text-center select-none animate-in fade-in duration-300">
        <Zap size={32} className="text-muted-foreground/20 mb-2 animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40 line-clamp-2 max-w-[90%]">
          {displayAlt}
        </span>
      </div>
    );
  }

  // Robust URL parsing: 
  // 1. If the URL is already url-encoded (contains %3A%2F%2F), decode it first to get the clean URL.
  let cleanUrl = src;
  if (cleanUrl.includes('%3A%2F%2F') || cleanUrl.includes('%3a%2f%2f')) {
    try {
      cleanUrl = decodeURIComponent(cleanUrl);
    } catch (e) {
      console.warn("Failed to decode image URL:", cleanUrl, e);
    }
  }

  // 2. Prepare the proxy URL as backup
  let absoluteUrl = cleanUrl;
  if (cleanUrl.startsWith('/') && typeof window !== 'undefined') {
    absoluteUrl = `${window.location.origin}${cleanUrl}`;
  }
  const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(absoluteUrl)}`;

  const handleImageError = () => {
    if (!tryProxy) {
      // Direct load failed, let's try the proxy as a backup
      setTryProxy(true);
    } else {
      // Proxy failed too, show the beautiful fallback
      setError(true);
    }
  };

  // Use direct URL with no-referrer policy first, then try proxy on error, and finally fallback
  return (
    <img
      src={tryProxy ? proxyUrl : cleanUrl}
      alt={displayAlt}
      className={className}
      referrerPolicy="no-referrer"
      onError={handleImageError}
    />
  );
}
