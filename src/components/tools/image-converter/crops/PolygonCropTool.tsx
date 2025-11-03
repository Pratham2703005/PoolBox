// PolygonCropTool.tsx - Polygon cropping tool with multi-region support
'use client';

import React, { useState } from 'react';
import { CropData, Point, CropToolProps } from './types';

export function PolygonCropTool({ canvasRefs, onApplyCrop }: CropToolProps) {
  const [regions, setRegions] = useState<Point[][]>([]);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRefs.canvasRef.current) return;
    
    const canvas = canvasRefs.canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    setCurrentPoints(prev => [...prev, { x, y }]);
  };

  const handleCanvasMouseMove = (_e: React.MouseEvent<HTMLCanvasElement>) => {
    // Not used for polygon
  };

  const drawOverlay = (ctx: CanvasRenderingContext2D) => {
    const colors = [
      '#a855f7', // violet
      '#3b82f6', // blue
      '#10b981', // green
      '#f59e0b', // amber
      '#ef4444', // red
    ];
    
    // Draw completed regions
    regions.forEach((region, idx) => {
      const color = colors[idx % colors.length];
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.fillStyle = `${color}33`;
      
      ctx.beginPath();
      ctx.moveTo(region[0].x, region[0].y);
      for (let i = 1; i < region.length; i++) {
        ctx.lineTo(region[i].x, region[i].y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Draw points for completed regions
      region.forEach((pt) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });
    });
    
    // Draw current polygon in progress
    if (currentPoints.length > 0) {
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
      
      ctx.beginPath();
      ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
      for (let i = 1; i < currentPoints.length; i++) {
        ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
      }
      if (currentPoints.length >= 3) {
        ctx.closePath();
        ctx.fill();
      }
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw points for current polygon
      currentPoints.forEach((pt) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#a855f7';
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }
  };

  const apply = () => {
    if (regions.length === 0 && currentPoints.length < 3) return;
    
    // Finalize current polygon if it exists
    const finalRegions = currentPoints.length >= 3 
      ? [...regions, currentPoints.map(pt => ({ x: Math.round(pt.x), y: Math.round(pt.y) }))]
      : regions;
    
    const crop: CropData = { 
      type: 'polygon', 
      data: { regions: finalRegions }
    };
    onApplyCrop(crop);
  };

  const reset = () => {
    setRegions([]);
    setCurrentPoints([]);
  };

  const undoLast = () => {
    if (currentPoints.length > 0) {
      setCurrentPoints(prev => prev.slice(0, -1));
    } else if (regions.length > 0) {
      setRegions(prev => prev.slice(0, -1));
    }
  };

  const finishCurrent = () => {
    if (currentPoints.length >= 3) {
      setRegions(prev => [...prev, currentPoints]);
      setCurrentPoints([]);
    }
  };

  const getCropData = (): CropData | null => {
    const allRegions = [...regions];
    if (currentPoints.length >= 3) {
      allRegions.push(currentPoints);
    }
    if (allRegions.length === 0) return null;
    return { type: 'polygon', data: { regions: allRegions } };
  };

  const canApply = regions.length > 0 || currentPoints.length >= 3;

  const instruction = currentPoints.length === 0 && regions.length === 0
    ? '📐 Click to add points (min 3 for a polygon)'
    : currentPoints.length > 0 && currentPoints.length < 3
    ? `📐 Added ${currentPoints.length} point(s). Need ${3 - currentPoints.length} more`
    : currentPoints.length >= 3
    ? '✅ Polygon ready! Click "Finish Current" to start another, or "Apply Crop"'
    : `✅ ${regions.length} polygon(s) selected. Click to start another.`;

  const Controls = () => (
    <>
      {currentPoints.length >= 3 && (
        <button
          onClick={finishCurrent}
          className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
        >
          Finish Current Polygon
        </button>
      )}
    </>
  );

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
    processing: false,
    Controls
  };
}