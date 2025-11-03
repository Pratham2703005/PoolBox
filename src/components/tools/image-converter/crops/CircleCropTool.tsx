// CircleCropTool.tsx - Circle cropping tool with multi-region support
'use client';

import React, { useState } from 'react';
import { CropData, Point, CropToolProps } from './types';

interface CircleRegion {
  cx: number;
  cy: number;
  r: number;
}

export function CircleCropTool({ canvasRefs, onApplyCrop }: CropToolProps) {
  const [regions, setRegions] = useState<CircleRegion[]>([]);
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
      const dx = x - firstClick.x;
      const dy = y - firstClick.y;
      const r = Math.sqrt(dx * dx + dy * dy);
      
      const newCircle: CircleRegion = {
        cx: Math.round(firstClick.x),
        cy: Math.round(firstClick.y),
        r: Math.round(r)
      };
      
      if (e.shiftKey) {
        // Add to existing regions
        setRegions(prev => [...prev, newCircle]);
      } else {
        // Replace with new region
        setRegions([newCircle]);
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
      '#10b981', // green
      '#3b82f6', // blue
      '#f59e0b', // amber
      '#ef4444', // red
      '#8b5cf6', // violet
    ];
    
    // Draw existing regions
    regions.forEach((region, idx) => {
      const color = colors[idx % colors.length];
      ctx.beginPath();
      ctx.arc(region.cx, region.cy, region.r, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.fillStyle = `${color}33`;
      ctx.fill();
      ctx.stroke();
    });
    
    // Draw current drawing region
    const activePoint = currentMouse;
    if (firstClick && activePoint) {
      const dx = activePoint.x - firstClick.x;
      const dy = activePoint.y - firstClick.y;
      const r = Math.sqrt(dx * dx + dy * dy);
      
      ctx.beginPath();
      ctx.arc(firstClick.x, firstClick.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };

  const apply = () => {
    if (regions.length === 0) return;
    
    const crop: CropData = { 
      type: 'circle', 
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
    return { type: 'circle', data: { regions } };
  };

  const canApply = regions.length > 0;

  const instruction = !firstClick && regions.length === 0
    ? '⭕ Click to set center of circle'
    : !firstClick && regions.length > 0
    ? `✅ ${regions.length} circle(s) selected. Click to add another, or "Apply Crop"`
    : firstClick && !currentMouse
    ? '⭕ Click to set radius'
    : '⭕ Click to set radius. Hold Shift to add multiple circles.';

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