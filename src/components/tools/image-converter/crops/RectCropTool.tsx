// RectCropTool.tsx - Rectangle cropping tool with multi-region support
'use client';

import React, { useState } from 'react';
import { CropData, Point, CropToolProps } from './types';

interface RectRegion {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function RectCropTool({ canvasRefs, onApplyCrop }: CropToolProps) {
  const [regions, setRegions] = useState<RectRegion[]>([]);
  const [firstClick, setFirstClick] = useState<Point | null>(null);
  const [currentMouse, setCurrentMouse] = useState<Point | null>(null);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRefs.canvasRef.current) return;
    
    const canvas = canvasRefs.canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    if (!firstClick) {
      setFirstClick({ x, y });
    } else {
      const newRect: RectRegion = {
        left: Math.round(Math.min(firstClick.x, x)),
        top: Math.round(Math.min(firstClick.y, y)),
        width: Math.round(Math.abs(x - firstClick.x)),
        height: Math.round(Math.abs(y - firstClick.y))
      };
      
      if (e.shiftKey) {
        // Add to existing regions
        setRegions(prev => [...prev, newRect]);
      } else {
        // Replace with new region
        setRegions([newRect]);
      }
      
      setFirstClick(null);
      setCurrentMouse(null);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRefs.canvasRef.current || !firstClick) return;
    
    const canvas = canvasRefs.canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setCurrentMouse({ x, y });
  };

  const drawOverlay = (ctx: CanvasRenderingContext2D) => {
    const colors = [
      '#3b82f6', // blue
      '#10b981', // green
      '#f59e0b', // amber
      '#ef4444', // red
      '#8b5cf6', // violet
    ];
    
    // Draw existing regions
    regions.forEach((region, idx) => {
      const color = colors[idx % colors.length];
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.fillStyle = color.replace(')', ', 0.2)').replace('rgb', 'rgba').replace('#', 'rgba(') + '30, 0.2)';
      
      // Simple fill for existing regions
      ctx.fillStyle = `${color}33`;
      ctx.fillRect(region.left, region.top, region.width, region.height);
      ctx.strokeRect(region.left, region.top, region.width, region.height);
    });
    
    // Draw current drawing region
    const activePoint = currentMouse;
    if (firstClick && activePoint) {
      const x = Math.min(firstClick.x, activePoint.x);
      const y = Math.min(firstClick.y, activePoint.y);
      const w = Math.abs(activePoint.x - firstClick.x);
      const h = Math.abs(activePoint.y - firstClick.y);
      
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);
    }
  };

  const apply = () => {
    if (regions.length === 0) return;
    
    const crop: CropData = { 
      type: 'rect', 
      data: { regions }
    };
    onApplyCrop(crop);
  };

  const reset = () => {
    setRegions([]);
    setFirstClick(null);
    setCurrentMouse(null);
  };

  const undoLast = () => {
    setRegions(prev => prev.slice(0, -1));
  };

  const getCropData = (): CropData | null => {
    if (regions.length === 0) return null;
    return { type: 'rect', data: { regions } };
  };

  const canApply = regions.length > 0;

  const instruction = !firstClick && regions.length === 0
    ? '🔲 Click to set first corner of rectangle'
    : !firstClick && regions.length > 0
    ? `✅ ${regions.length} rectangle(s) selected. Click to add another, or "Apply Crop"`
    : firstClick && !currentMouse
    ? '🔲 Click to set second corner'
    : '🔲 Click to set second corner. Hold Shift to add multiple rectangles.';

  return {
    handleCanvasClick,
    handleCanvasMouseMove,
    drawOverlay,
    apply,
    reset,
    undoLast,
    getCropData,
    canApply,
    instruction,
    processing: false
  };
}