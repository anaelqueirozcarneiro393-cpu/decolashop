'use client';

import React, { useState, useEffect } from 'react';

interface SafeImageProps {
  src?: string | null;
  alt?: string | null;
  className?: string;
}

// Guaranteed 100% online studio product fallback
const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800';

export default function SafeImage({ src, alt, className }: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(src || DEFAULT_FALLBACK_IMAGE);
  const [hasError, setHasError] = useState(false);
  const displayAlt = alt || 'Produto';

  useEffect(() => {
    let clean = src || '';
    if (clean.includes('%3A%2F%2F') || clean.includes('%3a%2f%2f')) {
      try {
        clean = decodeURIComponent(clean);
      } catch {}
    }
    setCurrentSrc(clean || DEFAULT_FALLBACK_IMAGE);
    setHasError(false);
  }, [src]);

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
      setCurrentSrc(DEFAULT_FALLBACK_IMAGE);
    }
  };

  return (
    <img
      src={currentSrc || DEFAULT_FALLBACK_IMAGE}
      alt={displayAlt}
      className={className}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={handleImageError}
    />
  );
}
