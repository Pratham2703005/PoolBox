import { create } from 'zustand';

interface HydrationStore {
  isMounted: boolean;
  setMounted: (mounted: boolean) => void;
}

export const useHydrationStore = create<HydrationStore>((set) => ({
  isMounted: false,
  setMounted: (mounted: boolean) => set({ isMounted: mounted }),
}));
