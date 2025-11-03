/**
 * Base Converter Store
 * Zustand store for managing base converter state
 */

import { create } from 'zustand';
import { ConversionState, NumberBase, ConversionMode } from '@/types/base-converter';

interface BaseConverterStore extends ConversionState {
  setInput: (input: string) => void;
  setBase: (base: NumberBase) => void;
  setMode: (mode: ConversionMode) => void;
  setDetectedBase: (base: NumberBase | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: ConversionState = {
  input: '',
  base: 10,
  mode: 'number',
  numberResults: null,
  textResults: null,
  detectedBase: null,
  error: null,
};

export const useBaseConverterStore = create<BaseConverterStore>((set) => ({
  ...initialState,
  
  setInput: (input: string) => set({ input, error: null }),
  
  setBase: (base: NumberBase) => set({ base }),
  
  setMode: (mode: ConversionMode) => set({ mode, error: null }),
  
  setDetectedBase: (base: NumberBase | null) => set({ detectedBase: base }),
  
  setError: (error: string | null) => set({ error }),
  
  reset: () => set(initialState),
}));
