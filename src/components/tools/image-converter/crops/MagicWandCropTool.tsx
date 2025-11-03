// MagicWandCropTool.tsx - Magic wand color selection tool
'use client';

import React, { useState, useCallback } from 'react';
import { CropData, Point, CropToolProps } from './types';

export function MagicWandCropTool({ canvasRefs, onApplyCrop }: CropToolProps) {
  const [regions, setRegions] = useState<Point[][]>([]);
  const [tolerance, setTolerance] = useState(32);

  const findAllColorRegions = useCallback((startX: number, startY: number, imageData: ImageData, tolerance: number) => {
    const { width, height, data } = imageData;
    const globalVisited = new Set<string>();
    const allRegions: Point[][] = [];
    
    const getPixel = (x: number, y: number) => {
      const idx = (y * width + x) * 4;
      return { r: data[idx], g: data[idx + 1], b: data[idx + 2], a: data[idx + 3] };
    };
    
    const targetColor = getPixel(startX, startY);
    
    const colorMatch = (x: number, y: number) => {
      if (x < 0 || x >= width || y < 0 || y >= height) return false;
      const pixel = getPixel(x, y);
      const diff = Math.abs(pixel.r - targetColor.r) + Math.abs(pixel.g - targetColor.g) + Math.abs(pixel.b - targetColor.b);
      return diff <= tolerance;
    };
    
    const floodFillRegion = (seedX: number, seedY: number): Set<string> => {
      const filledPixels = new Set<string>();
      const queue: Point[] = [{ x: seedX, y: seedY }];
      const visited = new Set<string>();
      
      while (queue.length > 0) {
        const { x, y } = queue.shift()!;
        const key = `${x},${y}`;
        
        if (visited.has(key)) continue;
        if (!colorMatch(x, y)) continue;
        
        visited.add(key);
        filledPixels.add(key);
        globalVisited.add(key);
        
        [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].forEach(([nx, ny]) => {
          const nkey = `${nx},${ny}`;
          if (!visited.has(nkey)) {
            queue.push({ x: nx, y: ny });
          }
        });
        
        if (visited.size > 50000) {
          console.warn('Magic wand: Region too large, stopping at', visited.size, 'pixels');
          break;
        }
      }
      
      return filledPixels;
    };
    
    const traceBoundary = (filledPixels: Set<string>): Point[] => {
      if (filledPixels.size === 0) return [];
      
      let startPoint: Point | null = null;
      let minX = width;
      
      filledPixels.forEach((key) => {
        const [x, y] = key.split(',').map(Number);
        if (x < minX) {
          minX = x;
          startPoint = { x, y };
        }
      });
      
      if (!startPoint) return [];
      
      const initialPoint: Point = startPoint; // Non-null assertion for type safety
      const boundary: Point[] = [];
      const directions = [
        [0, -1], [1, -1], [1, 0], [1, 1],
        [0, 1], [-1, 1], [-1, 0], [-1, -1]
      ];
      
      let current: Point = initialPoint;
      let dir = 7;
      const boundarySet = new Set<string>();
      
      do {
        boundary.push({ x: current.x, y: current.y });
        boundarySet.add(`${current.x},${current.y}`);
        
        let found = false;
        let nextPoint: Point | null = null;
        let nextDir = dir;
        
        for (let i = 0; i < 8; i++) {
          const checkDir = (dir + i) % 8;
          const [dx, dy] = directions[checkDir];
          const nx = current.x + dx;
          const ny = current.y + dy;
          const nkey = `${nx},${ny}`;
          
          if (filledPixels.has(nkey)) {
            nextPoint = { x: nx, y: ny };
            nextDir = (checkDir + 5) % 8;
            found = true;
            break;
          }
        }
        
        if (!found || !nextPoint) break;
        current = nextPoint;
        dir = nextDir;
        
        if (boundarySet.has(`${current.x},${current.y}`) && boundary.length > 2) break;
        if (boundary.length > 10000) break;
        if (current.x === initialPoint.x && current.y === initialPoint.y && boundary.length >= 3) break;
        
      } while (true);
      
      return boundary;
    };
    
    const simplifyBoundary = (points: Point[], epsilon: number): Point[] => {
      if (points.length <= 2) return points;
      
      const perpendicularDistance = (point: Point, lineStart: Point, lineEnd: Point) => {
        const dx = lineEnd.x - lineStart.x;
        const dy = lineEnd.y - lineStart.y;
        const norm = Math.sqrt(dx * dx + dy * dy);
        if (norm === 0) return Math.sqrt((point.x - lineStart.x) ** 2 + (point.y - lineStart.y) ** 2);
        return Math.abs(dy * point.x - dx * point.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x) / norm;
      };
      
      let maxDist = 0;
      let maxIndex = 0;
      const end = points.length - 1;
      
      for (let i = 1; i < end; i++) {
        const dist = perpendicularDistance(points[i], points[0], points[end]);
        if (dist > maxDist) {
          maxDist = dist;
          maxIndex = i;
        }
      }
      
      if (maxDist > epsilon) {
        const left = simplifyBoundary(points.slice(0, maxIndex + 1), epsilon);
        const right = simplifyBoundary(points.slice(maxIndex), epsilon);
        return [...left.slice(0, -1), ...right];
      } else {
        return [points[0], points[end]];
      }
    };
    
    const maxRegions = 10;
    const minRegionSize = 50;
    const regionSizes: Array<{ region: Point[]; size: number }> = [];
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const key = `${x},${y}`;
        
        if (globalVisited.has(key)) continue;
        if (!colorMatch(x, y)) continue;
        
        const regionPixels = floodFillRegion(x, y);
        
        if (regionPixels.size < minRegionSize) continue;
        
        if (regionPixels.size > 0) {
          const boundary = traceBoundary(regionPixels);
          
          if (boundary.length > 0) {
            const simplified = simplifyBoundary(boundary, 5);
            regionSizes.push({ region: simplified, size: regionPixels.size });
          }
        }
      }
    }
    
    regionSizes.sort((a, b) => b.size - a.size);
    const topRegions = regionSizes.slice(0, maxRegions).map(item => item.region);
    allRegions.push(...topRegions);
    
    console.log('Magic wand: Found', regionSizes.length, 'total regions, kept', allRegions.length, 'largest');
    
    return allRegions;
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRefs.canvasRef.current) return;
    
    const canvas = canvasRefs.canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const allRegions = findAllColorRegions(x, y, imageData, tolerance);
    
    if (allRegions.length > 0) {
      if (e.shiftKey && regions.length > 0) {
        setRegions(prev => [...prev, ...allRegions]);
      } else {
        setRegions(allRegions);
      }
    }
  };

  const handleCanvasMouseMove = () => {
    // Not used for magic wand
  };

  const drawOverlay = (ctx: CanvasRenderingContext2D) => {
    if (regions.length === 0) return;

    const colors = [
      { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.2)' },
      { stroke: '#ef4444', fill: 'rgba(239, 68, 68, 0.2)' },
      { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.2)' },
      { stroke: '#3b82f6', fill: 'rgba(59, 130, 246, 0.2)' },
      { stroke: '#8b5cf6', fill: 'rgba(139, 92, 246, 0.2)' },
      { stroke: '#ec4899', fill: 'rgba(236, 72, 153, 0.2)' },
    ];
    
    regions.forEach((region, regionIndex) => {
      const colorSet = colors[regionIndex % colors.length];
      ctx.strokeStyle = colorSet.stroke;
      ctx.lineWidth = 2;
      ctx.fillStyle = colorSet.fill;
      
      ctx.beginPath();
      region.forEach((pt, i) => {
        if (i === 0) {
          ctx.moveTo(pt.x, pt.y);
        } else {
          ctx.lineTo(pt.x, pt.y);
        }
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
  };

  const apply = () => {
    if (regions.length === 0) return;

    const roundedRegions = regions.map(region => 
      region.map(pt => ({ x: Math.round(pt.x), y: Math.round(pt.y) }))
    );
    
    const crop: CropData = { 
      type: 'magic', 
      data: { regions: roundedRegions } 
    };
    onApplyCrop(crop);
  };

  const reset = () => {
    setRegions([]);
  };

  const undoLast = () => {
    setRegions(prev => prev.slice(0, -1));
  };

  const getCropData = (): CropData | null => {
    if (regions.length === 0) return null;
    const roundedRegions = regions.map(region => 
      region.map(pt => ({ x: Math.round(pt.x), y: Math.round(pt.y) }))
    );
    return { type: 'magic', data: { regions: roundedRegions } };
  };

  const canApply = regions.length > 0;

  const instruction = regions.length === 0
    ? 'Click on any color to select. Hold Shift to add multiple regions.'
    : `Selected ${regions.length} region(s). Shift+Click to add more, or "Apply Crop" when done.`;

  const Controls = () => (
    <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded">
      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
        Color Tolerance: {tolerance}
      </label>
      <input
        type="range"
        min="0"
        max="255"
        value={tolerance}
        onChange={(e) => setTolerance(Number(e.target.value))}
        className="w-full"
      />
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
        Lower = more precise, Higher = more inclusive color matching
      </p>
      
      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
        <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
          💡 Tip: Hold <kbd className="px-1 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">Shift</kbd> while clicking to add multiple regions
        </p>
      </div>
    </div>
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
    Controls,
    regions,
  };
}