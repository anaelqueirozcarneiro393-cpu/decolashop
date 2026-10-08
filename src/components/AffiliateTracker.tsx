'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { captureAffiliateFromUrl, getAffiliateRef } from '@/lib/affiliateSystem';

function TrackerInternal() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // 1. First attempt via useSearchParams
    const af = searchParams?.get('af') || searchParams?.get('ref') || searchParams?.get('afiliado');
    if (af) {
      captureAffiliateFromUrl();
      return;
    }

    // 2. Fallback check directly via window.location
    if (typeof window !== 'undefined' && window.location.search) {
      captureAffiliateFromUrl();
    } else {
      // 3. Self-heal and synchronize storage across session and cookie
      getAffiliateRef();
    }
  }, [searchParams]);

  return null;
}

export default function AffiliateTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerInternal />
    </Suspense>
  );
}
