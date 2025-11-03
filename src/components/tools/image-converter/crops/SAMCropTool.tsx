// SAMCropTool.tsx - Smart crop with AI-assisted selection
'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { CropData, Point, CropToolProps } from './types';

export function SAMCropTool({ canvasRefs, onApplyCrop, isActive }: CropToolProps) {
  const [regions, setRegions] = useState<Point[][]>([]);
  const [processing, setProcessing] = useState(false);
  const [hoverPreview, setHoverPreview] = useState<Point[] | null>(null);
  const [isHoverEnabled, setIsHoverEnabled] = useState(true);

  // Configuration state
  const [tolerance, setTolerance] = useState(50); // 20-80 range
  const [simplificationLevel, setSimplificationLevel] = useState(3); // epsilon for Douglas-Peucker
  const [maxRegionSize, setMaxRegionSize] = useState(500000); // max pixels per region

  // Debounce timer for hover preview
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const processingLockRef = useRef(false); // Prevent hover during click processing
  const lastHoverCoordsRef = useRef<{ x: number; y: number } | null>(null); // Track last hover position
  const hoverResultCacheRef = useRef<{ x: number; y: number; result: Point[] } | null>(null); // Cache hover result

  // Clear hover preview when disabled or not active
  useEffect(() => {
    if (!isHoverEnabled || !isActive) {
      setHoverPreview(null);
      hoverResultCacheRef.current = null;
    }
  }, [isHoverEnabled, isActive]);

  // Clear cache when settings change
  useEffect(() => {
    // Settings changed, invalidate cache
    hoverResultCacheRef.current = null;
    setHoverPreview(null);
  }, [tolerance, simplificationLevel, maxRegionSize]);

  const runSegmentation = useCallback(async (clickX: number, clickY: number, isPositive: boolean = true, isHover: boolean = false) => {
    if (!canvasRefs.canvasRef.current || (processing && !isHover)) return;

    if (!isHover) setProcessing(true);

    try {
      const canvas = canvasRefs.canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        if (!isHover) setProcessing(false);
        return null;
      }

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { width, height, data } = imageData;

      const getPixel = (x: number, y: number) => {
        if (x < 0 || x >= width || y < 0 || y >= height) return null;
        const idx = (y * width + x) * 4;
        return { r: data[idx], g: data[idx + 1], b: data[idx + 2], a: data[idx + 3] };
      };

      const targetPixel = getPixel(clickX, clickY);
      if (!targetPixel) {
        if (!isHover) setProcessing(false);
        return null;
      }

      // Use manual tolerance or calculate adaptive tolerance
      let adaptiveTolerance = tolerance;
      if (tolerance === 0) {
        // Auto mode: calculate adaptive tolerance
        const calculateLocalVariance = (cx: number, cy: number, radius: number = 5) => {
          let sumR = 0, sumG = 0, sumB = 0, count = 0;
          for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
              const pixel = getPixel(cx + dx, cy + dy);
              if (pixel) {
                sumR += pixel.r;
                sumG += pixel.g;
                sumB += pixel.b;
                count++;
              }
            }
          }
          const avgR = sumR / count;
          const avgG = sumG / count;
          const avgB = sumB / count;

          let variance = 0;
          for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
              const pixel = getPixel(cx + dx, cy + dy);
              if (pixel) {
                variance += Math.pow(pixel.r - avgR, 2) + Math.pow(pixel.g - avgG, 2) + Math.pow(pixel.b - avgB, 2);
              }
            }
          }
          return Math.sqrt(variance / count);
        };

        const localVariance = calculateLocalVariance(clickX, clickY);
        adaptiveTolerance = Math.max(20, Math.min(80, localVariance));
      }

      const visited = new Set<string>();
      const selectedPixels = new Set<string>();
      const queue: Point[] = [{ x: clickX, y: clickY }];

      const colorMatch = (pixel: { r: number; g: number; b: number; a: number } | null) => {
        if (!pixel || !targetPixel) return false;
        const diff = Math.sqrt(
          Math.pow(pixel.r - targetPixel.r, 2) +
          Math.pow(pixel.g - targetPixel.g, 2) +
          Math.pow(pixel.b - targetPixel.b, 2)
        );
        return diff <= adaptiveTolerance;
      };

      while (queue.length > 0 && selectedPixels.size < maxRegionSize) {
        const { x, y } = queue.shift()!;
        const key = `${x},${y}`;

        if (visited.has(key)) continue;
        visited.add(key);

        const pixel = getPixel(x, y);
        if (!colorMatch(pixel)) continue;

        selectedPixels.add(key);

        [[0, 1], [1, 0], [0, -1], [-1, 0]].forEach(([dx, dy]) => {
          const nx = x + dx;
          const ny = y + dy;
          const nkey = `${nx},${ny}`;
          if (!visited.has(nkey) && nx >= 0 && nx < width && ny >= 0 && ny < height) {
            queue.push({ x: nx, y: ny });
          }
        });
      }

      if (selectedPixels.size === 0) {
        if (!isHover) {
          alert('No object detected at this point. Try clicking on a different area.');
          setProcessing(false);
        }
        return null;
      }

      const traceBoundary = () => {
        let start: Point | null = null;
        let minY = Infinity;
        let minX = Infinity;

        for (const key of selectedPixels) {
          const [x, y] = key.split(',').map(Number);
          if (y < minY || (y === minY && x < minX)) {
            minY = y;
            minX = x;
            start = { x, y };
          }
        }

        if (!start) return [];

        const boundary: Point[] = [];
        const directions = [
          [1, 0], [1, 1], [0, 1], [-1, 1],
          [-1, 0], [-1, -1], [0, -1], [1, -1]
        ];

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

            if (selectedPixels.has(nkey)) {
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

      const boundary = traceBoundary();

      if (boundary.length > 0) {
        const simplifyPoints = (points: Point[], epsilon: number): Point[] => {
          if (points.length <= 2) return points;

          const perpDist = (point: Point, lineStart: Point, lineEnd: Point) => {
            const dx = lineEnd.x - lineStart.x;
            const dy = lineEnd.y - lineStart.y;
            const mag = Math.sqrt(dx * dx + dy * dy);
            if (mag === 0) return Math.sqrt(Math.pow(point.x - lineStart.x, 2) + Math.pow(point.y - lineStart.y, 2));
            const u = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (mag * mag);
            const closest = {
              x: lineStart.x + u * dx,
              y: lineStart.y + u * dy
            };
            return Math.sqrt(Math.pow(point.x - closest.x, 2) + Math.pow(point.y - closest.y, 2));
          };

          let maxDist = 0;
          let maxIdx = 0;
          const first = points[0];
          const last = points[points.length - 1];

          for (let i = 1; i < points.length - 1; i++) {
            const dist = perpDist(points[i], first, last);
            if (dist > maxDist) {
              maxDist = dist;
              maxIdx = i;
            }
          }

          if (maxDist > epsilon) {
            const left = simplifyPoints(points.slice(0, maxIdx + 1), epsilon);
            const right = simplifyPoints(points.slice(maxIdx), epsilon);
            return [...left.slice(0, -1), ...right];
          } else {
            return [first, last];
          }
        };

        const simplified = simplifyPoints(boundary, simplificationLevel);

        if (isHover) {
          return simplified;
        } else {
          setRegions(prev => isPositive ? [...prev, simplified] : prev);
          return simplified;
        }
      }

      return null;

    } catch (error) {
      console.error('SAM error:', error);
      if (!isHover) {
        alert('Error during smart selection. Please try again.');
      }
      return null;
    } finally {
      if (!isHover) setProcessing(false);
    }
  }, [canvasRefs, processing, tolerance, maxRegionSize, simplificationLevel]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRefs.canvasRef.current || processingLockRef.current) return;

    // Set processing lock to prevent hover interference
    processingLockRef.current = true;

    // Clear hover preview
    setHoverPreview(null);

    // Clear any pending hover timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    const canvas = canvasRefs.canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    if (!e.shiftKey) {
      setRegions([]);
    }

    // Check if we have a cached hover result for this exact position
    const cachedResult = hoverResultCacheRef.current;
    if (cachedResult &&
      cachedResult.x === x &&
      cachedResult.y === y &&
      cachedResult.result.length > 0) {
      // Use the cached result directly - this is what the user saw in the preview!
      setRegions(prev => [...prev, cachedResult.result]);
      hoverResultCacheRef.current = null;
      lastHoverCoordsRef.current = null;
      processingLockRef.current = false;
    } else {
      // No cache, run segmentation
      lastHoverCoordsRef.current = null;
      hoverResultCacheRef.current = null;

      runSegmentation(x, y, true, false).finally(() => {
        processingLockRef.current = false;
      });
    }
  };

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRefs.canvasRef.current || !isHoverEnabled || processing || processingLockRef.current) {
      setHoverPreview(null);
      return;
    }

    // Clear existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    const canvas = canvasRefs.canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    // Store the coordinates for this hover position
    lastHoverCoordsRef.current = { x, y };

    // Debounce hover preview to reduce computation
    hoverTimeoutRef.current = setTimeout(() => {
      // Only run if coordinates haven't changed (user stopped moving)
      if (lastHoverCoordsRef.current && lastHoverCoordsRef.current.x === x && lastHoverCoordsRef.current.y === y) {
        runSegmentation(x, y, true, true).then(preview => {
          if (preview && isHoverEnabled && !processingLockRef.current) {
            // Cache the hover result for this position
            hoverResultCacheRef.current = { x, y, result: preview };
            setHoverPreview(preview);
          }
        });
      }
    }, 100); // 100ms debounce
  }, [canvasRefs, isHoverEnabled, processing, runSegmentation]);

  const drawOverlay = (ctx: CanvasRenderingContext2D) => {
    // Draw hover preview first (behind selected regions)
    if (hoverPreview && isHoverEnabled) {
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
      ctx.lineWidth = 2;
      ctx.fillStyle = 'rgba(6, 182, 212, 0.1)';
      ctx.setLineDash([5, 5]);

      ctx.beginPath();
      hoverPreview.forEach((pt, i) => {
        if (i === 0) {
          ctx.moveTo(pt.x, pt.y);
        } else {
          ctx.lineTo(pt.x, pt.y);
        }
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (regions.length === 0) return;

    const colors = [
      { stroke: 'rgba(6, 182, 212, 1)', fill: 'rgba(6, 182, 212, 0.15)' },
      { stroke: 'rgba(14, 165, 233, 1)', fill: 'rgba(14, 165, 233, 0.15)' },
      { stroke: 'rgba(59, 130, 246, 1)', fill: 'rgba(59, 130, 246, 0.15)' },
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
      type: 'sam',
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
    return { type: 'sam', data: { regions: roundedRegions } };
  };

  const canApply = regions.length > 0 && !processing;

  const instruction = regions.length === 0
    ? '🖱️ Click on an object to select it. Shift+Click to select multiple objects.'
    : `✂️ Selected ${regions.length} object(s). Shift+Click to add more, or "Apply Crop" when done.`;

  const Controls = () => (
    <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg grid grid-cols-2 gap-3 text-[11px]">
  
  {/* Left: Checkboxes */}
  <div className="space-y-2">
    <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Smart Crop</p>

    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={isHoverEnabled}
        onChange={(e) => setIsHoverEnabled(e.target.checked)}
        className="w-3 h-3 accent-cyan-600"
      />
      <span>🎯 Hover Preview</span>
    </label>

    <p className="text-[10px] text-gray-500 dark:text-gray-400">⇧ Hold Shift for multi-select</p>
  </div>

  {/* Right: Sliders */}
  <div className="space-y-2">
    <div>
      <label className="block text-gray-700 dark:text-gray-300">Tolerance: {tolerance}</label>
      <input
        type="range"
        min="0"
        max="100"
        value={tolerance}
        onChange={(e) => setTolerance(parseInt(e.target.value))}
        className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer"
      />
    </div>

    <div>
      <label className="block text-gray-700 dark:text-gray-300">
        Edge: {simplificationLevel === 1 ? 'Detailed' : simplificationLevel <= 3 ? 'Medium' : 'Smooth'}
      </label>
      <input
        type="range"
        min="1"
        max="10"
        value={simplificationLevel}
        onChange={(e) => setSimplificationLevel(parseInt(e.target.value))}
        className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer"
      />
    </div>

    <div>
      <label className="block text-gray-700 dark:text-gray-300">
        Size: {(maxRegionSize / 1000).toFixed(0)}K
      </label>
      <input
        type="range"
        min="100000"
        max="1000000"
        step="50000"
        value={maxRegionSize}
        onChange={(e) => setMaxRegionSize(parseInt(e.target.value))}
        className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer"
      />
    </div>
  </div>
</div>


  );

  const handleCanvasMouseLeave = useCallback(() => {
    // Clear hover preview when mouse leaves canvas
    setHoverPreview(null);
    lastHoverCoordsRef.current = null;
    hoverResultCacheRef.current = null;

    // Clear any pending hover timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  return {
    handleCanvasClick,
    handleCanvasMouseMove,
    handleCanvasMouseLeave,
    drawOverlay,
    apply,
    reset,
    undoLast,
    getCropData,
    canApply,
    instruction,
    Controls,
    processing,
    regions,
  };
}