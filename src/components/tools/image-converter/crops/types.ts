// types.ts - Shared type definitions

export type CropDataSingle = 
  | { type: 'rect'; data: { regions: Array<{ left: number; top: number; width: number; height: number }> } }
  | { type: 'circle'; data: { regions: Array<{ cx: number; cy: number; r: number }> } }
  | { type: 'polygon'; data: { regions: Array<Array<{ x: number; y: number }>> } }
  | { type: 'magic'; data: { regions: Array<Array<{ x: number; y: number }>> } }
  | { type: 'selfie'; data: { regions: Array<Array<{ x: number; y: number }>> } }
  | { type: 'sam'; data: { regions: Array<Array<{ x: number; y: number }>> } };

export type CropData = CropDataSingle | { type: 'multi'; data: { crops: CropDataSingle[] } };

export type CropMode = 'rect' | 'circle' | 'polygon' | 'magic' | 'selfie' | 'sam';

export interface Point {
  x: number;
  y: number;
}

export interface CanvasRefs {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  imgRef: React.RefObject<HTMLImageElement | null>;
}

export interface CropToolProps {
  canvasRefs: CanvasRefs;
  onApplyCrop: (crop: CropData) => void;
  isActive: boolean;
  invert?: boolean; // Optional: for tools that support invert selection (magic, selfie, sam)
}