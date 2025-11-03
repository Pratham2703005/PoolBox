import { useEffect } from 'react';
import { useHydrationStore } from '@/lib/stores/hydration';

/**
 * Hook to ensure component is only rendered after hydration
 * Prevents hydration mismatches in Next.js
 */
export function useIsMounted() {
  const { isMounted, setMounted } = useHydrationStore();

  useEffect(() => {
    setMounted(true);
  }, [setMounted]);

  return isMounted;
}
