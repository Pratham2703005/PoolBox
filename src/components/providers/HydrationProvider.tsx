'use client';

import React, { useEffect } from 'react';
import { useHydrationStore } from '@/lib/stores/hydration';

/**
 * Root hydration provider
 * Sets mounted state to true when component mounts
 * Prevents hydration mismatches in Next.js
 */
export function HydrationProvider({ children }: { children: React.ReactNode }) {
  const setMounted = useHydrationStore(state => state.setMounted);

  useEffect(() => {
    setMounted(true);
  }, [setMounted]);

  return <>{children}</>;
}
