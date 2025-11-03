// SelfieCropTool.tsx - AI selfie segmentation tool
'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { CropData, Point, CropToolProps } from './types';

export function SelfieCropTool({ canvasRefs, onApplyCrop, isActive }: CropToolProps) {
  const [regions, setRegions] = useState<Point[][]>([]);
  const [processing, setProcessing] = useState(false);
  const hasProcessedRef = useRef(false); // Prevent duplicate processing

  const runSegmentation = useCallback(async () => {
    if (!canvasRefs.canvasRef.current || !canvasRefs.imgRef.current) return;
    
    // Prevent duplicate processing using ref (not state to avoid dependency)
    if (hasProcessedRef.current) return;
    
    hasProcessedRef.current = true;
    setProcessing(true);
    
    try {
      const { SelfieSegmentation } = await import('@mediapipe/selfie_segmentation');
      
      const selfieSegmentation = new SelfieSegmentation({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
      });
      
      selfieSegmentation.setOptions({
        modelSelection: 0,
      });
      
      const canvas = canvasRefs.canvasRef.current;
      const img = canvasRefs.imgRef.current;
      
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;
      
      tempCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      selfieSegmentation.onResults((results) => {
        if (!results.segmentationMask) {
          setProcessing(false);
          return;
        }
        
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = results.segmentationMask.width;
        maskCanvas.height = results.segmentationMask.height;
        const maskCtx = maskCanvas.getContext('2d');
        if (!maskCtx) return;
        
        maskCtx.drawImage(results.segmentationMask, 0, 0);
        const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
        
        const scaleX = canvas.width / maskCanvas.width;
        const scaleY = canvas.height / maskCanvas.height;
        
        const threshold = 64;
        const personPixels = new Set<string>();
        
        for (let y = 0; y < maskCanvas.height; y++) {
          for (let x = 0; x < maskCanvas.width; x++) {
            const idx = (y * maskCanvas.width + x) * 4;
            if (maskData.data[idx] > threshold) {
              const scaledX = Math.round(x * scaleX);
              const scaledY = Math.round(y * scaleY);
              personPixels.add(`${scaledX},${scaledY}`);
            }
          }
        }
        
        if (personPixels.size === 0) {
          setProcessing(false);
          selfieSegmentation.close();
          toast.error('No people detected in the image. Try using Magic Wand or other crop modes instead.', {
            duration: 4000,
            icon: '🚫',
          });
          return;
        }
        
        const traceBoundary = (pixels: Set<string>) => {
          let minX = canvas.width;
          let startPoint: Point | null = null;
          
          pixels.forEach((key) => {
            const [x, y] = key.split(',').map(Number);
            if (x < minX) {
              minX = x;
              startPoint = { x, y };
            }
          });
          
          if (!startPoint) return [];
          
          const boundary: Point[] = [];
          const directions = [
            [0, -1], [1, -1], [1, 0], [1, 1],
            [0, 1], [-1, 1], [-1, 0], [-1, -1]
          ];
          
          const start: Point = startPoint;
          let current: Point = start;
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
              
              if (pixels.has(nkey)) {
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
            if (current.x === start.x && current.y === start.y && boundary.length >= 3) break;
            
          } while (true);
          
          return boundary;
        };
        
        const simplifyPoints = (points: Point[], epsilon: number): Point[] => {
          if (points.length <= 2) return points;
          
          const perpDist = (point: Point, lineStart: Point, lineEnd: Point) => {
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
            const dist = perpDist(points[i], points[0], points[end]);
            if (dist > maxDist) {
              maxDist = dist;
              maxIndex = i;
            }
          }
          
          if (maxDist > epsilon) {
            const left = simplifyPoints(points.slice(0, maxIndex + 1), epsilon);
            const right = simplifyPoints(points.slice(maxIndex), epsilon);
            return [...left.slice(0, -1), ...right];
          } else {
            return [points[0], points[end]];
          }
        };
        
        const boundary = traceBoundary(personPixels);
        
        if (boundary.length > 0) {
          const simplified = simplifyPoints(boundary, 5);
          setRegions([simplified]);
          toast.success('Person detected successfully!', {
            duration: 2000,
            icon: '✅',
          });
        }
        
        setProcessing(false);
        selfieSegmentation.close();
      });
      
      await selfieSegmentation.send({ image: tempCanvas });
      
    } catch (error) {
      console.error('Selfie segmentation error:', error);
      toast.error('Failed to process selfie segmentation. Please try again.', {
        duration: 3000,
        icon: '❌',
      });
      setProcessing(false);
      hasProcessedRef.current = false; // Allow retry on error
    }
  }, [canvasRefs]);

  useEffect(() => {
    if (isActive && !processing && regions.length === 0) {
      runSegmentation();
    }
  }, [isActive, processing, regions.length, runSegmentation]);

  const handleCanvasClick = (_e: React.MouseEvent<HTMLCanvasElement>) => {
    // Auto-segmentation, no manual clicks needed
  };

  const handleCanvasMouseMove = (_e: React.MouseEvent<HTMLCanvasElement>) => {
    // Not used
  };

  const drawOverlay = (ctx: CanvasRenderingContext2D) => {
    if (regions.length === 0) return;

    regions.forEach((region) => {
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 3;
      ctx.fillStyle = 'rgba(236, 72, 153, 0.3)';
      
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
      type: 'selfie', 
      data: { regions: roundedRegions } 
    };
    onApplyCrop(crop);
  };

  const reset = () => {
    setRegions([]);
    hasProcessedRef.current = false; // Allow re-processing after reset
  };

  const getCropData = (): CropData | null => {
    if (regions.length === 0) return null;
    const roundedRegions = regions.map(region => 
      region.map(pt => ({ x: Math.round(pt.x), y: Math.round(pt.y) }))
    );
    return { type: 'selfie', data: { regions: roundedRegions } };
  };

  const canApply = regions.length > 0 && !processing;

  const instruction = processing 
    ? '⏳ Processing selfie segmentation...'
    : regions.length === 0
    ? 'Waiting for AI to detect people...'
    : 'Person detected! Click "Apply Crop" to continue.';

  const Controls = () => (
    <div className="mb-3 p-2 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded">
      <p className="text-xs text-gray-600 dark:text-gray-400">
        AI automatically detects people in your image using MediaPipe Selfie Segmentation.
      </p>
    </div>
  );

  return {
    handleCanvasClick,
    handleCanvasMouseMove,
    drawOverlay,
    apply,
    reset,
    getCropData,
    canApply,
    instruction,
    Controls,
    processing,
    regions,
  };
}