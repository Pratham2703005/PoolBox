'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';

type CropData = 
  | { type: 'rect'; data: { left: number; top: number; width: number; height: number; w: number; h: number } }
  | { type: 'circle'; data: { cx: number; cy: number; r: number } }
  | { type: 'polygon'; data: { points: Array<{ x: number; y: number }> } }
  | { type: 'magic'; data: { regions: Array<Array<{ x: number; y: number }>>; invert?: boolean } }
  | { type: 'selfie'; data: { regions: Array<Array<{ x: number; y: number }>>; invert?: boolean } }
  | { type: 'sam'; data: { regions: Array<Array<{ x: number; y: number }>>; invert?: boolean } };

type PreviewProps = {
  previewUrl: string | null;
  convertedUrl: string | null;
  loading: boolean;
  onApplyCrop?: (c: CropData) => void;
  onClearCrop?: () => void;
};

export function Preview({ previewUrl, convertedUrl, loading, onApplyCrop, onClearCrop }: PreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [cropMode, setCropMode] = useState<'rect' | 'circle' | 'polygon' | 'magic' | 'selfie' | 'sam'>('rect');
  const [firstClick, setFirstClick] = useState<{ x: number; y: number } | null>(null);
  const [secondClick, setSecondClick] = useState<{ x: number; y: number } | null>(null);
  const [currentMouse, setCurrentMouse] = useState<{ x: number; y: number } | null>(null);
  const [polygonPoints, setPolygonPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [magicWandRegions, setMagicWandRegions] = useState<Array<Array<{ x: number; y: number }>>>([]);
  const [tolerance, setTolerance] = useState<number>(32); // Color tolerance for magic wand
  const [invertMagicWand, setInvertMagicWand] = useState<boolean>(false); // Invert magic wand selection
  const [selfieProcessing, setSelfieProcessing] = useState<boolean>(false); // Selfie segmentation processing state
  const [samProcessing, setSamProcessing] = useState<boolean>(false); // SAM processing state
  const [samRegions, setSamRegions] = useState<Array<Array<{ x: number; y: number }>>>([]);

  // Magic wand - finds ALL regions of matching color across entire image
  const findAllColorRegions = useCallback((startX: number, startY: number, imageData: ImageData, tolerance: number) => {
    const { width, height, data } = imageData;
    const globalVisited = new Set<string>();
    const allRegions: Array<Array<{ x: number; y: number }>> = [];
    
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
    
    // Helper function to flood fill one connected region
    const floodFillRegion = (seedX: number, seedY: number): Set<string> => {
      const filledPixels = new Set<string>();
      const queue: Array<{ x: number; y: number }> = [{ x: seedX, y: seedY }];
      const visited = new Set<string>();
      
      while (queue.length > 0) {
        const { x, y } = queue.shift()!;
        const key = `${x},${y}`;
        
        if (visited.has(key)) continue;
        if (!colorMatch(x, y)) continue;
        
        visited.add(key);
        filledPixels.add(key);
        globalVisited.add(key);
        
        // Add neighbors to queue
        [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].forEach(([nx, ny]) => {
          const nkey = `${nx},${ny}`;
          if (!visited.has(nkey)) {
            queue.push({ x: nx, y: ny });
          }
        });
        
        // Limit iterations to prevent infinite loop - reduced for better performance
        if (visited.size > 50000) {
          console.warn('Magic wand: Region too large, stopping at', visited.size, 'pixels');
          break;
        }
      }
      
      return filledPixels;
    };
    
    // Helper function to trace boundary of a region
    const traceBoundary = (filledPixels: Set<string>): Array<{ x: number; y: number }> => {
      if (filledPixels.size === 0) return [];
      
      // Find the leftmost point to start boundary tracing
      let startPoint: { x: number; y: number } | null = null;
      let minX = width;
      
      filledPixels.forEach((key) => {
        const [x, y] = key.split(',').map(Number);
        if (x < minX) {
          minX = x;
          startPoint = { x, y } as { x: number; y: number };
        }
      });
      
      if (!startPoint) return [];
      
      // Type narrowing helper - explicit type to overcome TypeScript's forEach limitation
      const start: { x: number; y: number } = startPoint;
      
      // Trace boundary using Moore-Neighbor tracing
      const boundary: Array<{ x: number; y: number }> = [];
      const directions = [
        [0, -1],  // N
        [1, -1],  // NE
        [1, 0],   // E
        [1, 1],   // SE
        [0, 1],   // S
        [-1, 1],  // SW
        [-1, 0],  // W
        [-1, -1]  // NW
      ];
      
      let current: { x: number; y: number } = start;
      let dir = 7; // Start looking west
      const boundarySet = new Set<string>();
      
      do {
        boundary.push({ x: current.x, y: current.y });
        boundarySet.add(`${current.x},${current.y}`);
        
        // Look for next boundary pixel
        let found: boolean = false;
        let nextPoint: { x: number; y: number } | null = null;
        let nextDir: number = dir;
        
        for (let i = 0; i < 8; i++) {
          const checkDir = (dir + i) % 8;
          const [dx, dy] = directions[checkDir];
          const nx = current.x + dx;
          const ny = current.y + dy;
          const nkey = `${nx},${ny}`;
          
          if (filledPixels.has(nkey)) {
            nextPoint = { x: nx, y: ny };
            nextDir = (checkDir + 5) % 8; // Turn left
            found = true;
            break;
          }
        }
        
        if (!found || !nextPoint) break;
        current = nextPoint;
        dir = nextDir;
        
        const { x: currX, y: currY } = current;
        if (boundarySet.has(`${currX},${currY}`) && boundary.length > 2) break;
        if (boundary.length > 10000) break; // Safety limit
        
        // Check if we've returned to start
        const backAtStart = (currX === start.x && currY === start.y && boundary.length >= 3);
        if (backAtStart) break;
        
      } while (true);
      
      return boundary;
    };
    
    // Simplify boundary using Douglas-Peucker algorithm
    const simplifyBoundary = (points: Array<{ x: number; y: number }>, epsilon: number): Array<{ x: number; y: number }> => {
      if (points.length <= 2) return points;
      
      const perpendicularDistance = (point: { x: number; y: number }, lineStart: { x: number; y: number }, lineEnd: { x: number; y: number }) => {
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
    
    // Step 1: Find all matching pixels across entire image
    let regionCount = 0;
    const maxRegions = 10; // Limit to 10 largest regions to avoid performance issues
    const minRegionSize = 50; // Skip small regions (noise) - increased to 100 pixels
    const regionSizes: Array<{ region: Array<{ x: number; y: number }>; size: number }> = [];
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const key = `${x},${y}`;
        
        // Skip if already visited or doesn't match color
        if (globalVisited.has(key)) continue;
        if (!colorMatch(x, y)) continue;
        
        // Found a new region! Flood fill it
        const regionPixels = floodFillRegion(x, y);
        
        // Skip tiny regions (likely noise)
        if (regionPixels.size < minRegionSize) continue;
        
        if (regionPixels.size > 0) {
          // Trace boundary of this region
          const boundary = traceBoundary(regionPixels);
          
          if (boundary.length > 0) {
            // Simplify aggressively to reduce points (tolerance 5 instead of 2)
            const simplified = simplifyBoundary(boundary, 5);
            regionSizes.push({ region: simplified, size: regionPixels.size });
            regionCount++;
          }
        }
      }
    }
    
    // Sort by size (largest first) and take only the top maxRegions
    regionSizes.sort((a, b) => b.size - a.size);
    const topRegions = regionSizes.slice(0, maxRegions).map(item => item.region);
    allRegions.push(...topRegions);
    
    console.log('Magic wand: Found', regionCount, 'total regions, kept', allRegions.length, 'largest for color', targetColor, 'scanned', globalVisited.size, 'pixels');
    
    return allRegions;
  }, []);

  // Selfie segmentation using MediaPipe
  const runSelfieSegmentation = useCallback(async () => {
    if (!canvasRef.current || !imgRef.current) return;
    
    setSelfieProcessing(true);
    
    try {
      // Dynamically import MediaPipe (lazy load)
      const { SelfieSegmentation } = await import('@mediapipe/selfie_segmentation');
      
      const selfieSegmentation = new SelfieSegmentation({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
      });
      
      selfieSegmentation.setOptions({
        modelSelection: 0, // 0 = general (256x256) - better for multiple people, 1 = landscape (256x144) for single selfie
      });
      
      const canvas = canvasRef.current;
      const img = imgRef.current;
      
      // Create a temporary canvas for processing
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;
      
      tempCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      selfieSegmentation.onResults((results) => {
        if (!results.segmentationMask) {
          setSelfieProcessing(false);
          return;
        }
        
        // Convert segmentation mask to regions
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = results.segmentationMask.width;
        maskCanvas.height = results.segmentationMask.height;
        const maskCtx = maskCanvas.getContext('2d');
        if (!maskCtx) return;
        
        maskCtx.drawImage(results.segmentationMask, 0, 0);
        const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
        
        // Scale mask coordinates to match canvas size
        const scaleX = canvas.width / maskCanvas.width;
        const scaleY = canvas.height / maskCanvas.height;
        
        // Find person region (where mask value > threshold)
        const threshold = 64; // 0-255, lowered to 64 to catch more people (was 128)
        const personPixels = new Set<string>();
        
        for (let y = 0; y < maskCanvas.height; y++) {
          for (let x = 0; x < maskCanvas.width; x++) {
            const idx = (y * maskCanvas.width + x) * 4;
            // The mask is a grayscale image, check red channel
            if (maskData.data[idx] > threshold) {
              const scaledX = Math.round(x * scaleX);
              const scaledY = Math.round(y * scaleY);
              personPixels.add(`${scaledX},${scaledY}`);
            }
          }
        }
        
        console.log('Selfie segmentation: Found', personPixels.size, 'person pixels');
        
        if (personPixels.size === 0) {
          console.warn('Selfie segmentation: No people detected! Try adjusting the image or use a different crop mode.');
          setSelfieProcessing(false);
          selfieSegmentation.close();
          alert('No people detected in the image. The AI model works best with clear photos of people. Try using Magic Wand or other crop modes instead.');
          return;
        }
        
        // Trace boundary of person region (similar to magic wand)
        if (personPixels.size > 0) {
          // Helper to trace boundary from filled pixels
          const traceBoundaryFromPixels = (pixels: Set<string>) => {
            // Find leftmost point
            let minX = canvas.width;
            let startPoint: { x: number; y: number } | null = null;
            
            pixels.forEach((key) => {
              const [x, y] = key.split(',').map(Number);
              if (x < minX) {
                minX = x;
                startPoint = { x, y };
              }
            });
            
            if (!startPoint) return [];
            
            const boundary: Array<{ x: number; y: number }> = [];
            const directions = [
              [0, -1], [1, -1], [1, 0], [1, 1],
              [0, 1], [-1, 1], [-1, 0], [-1, -1]
            ];
            
            const start: { x: number; y: number } = startPoint;
            let current: { x: number; y: number } = start;
            let dir = 7;
            const boundarySet = new Set<string>();
            
            do {
              boundary.push({ x: current.x, y: current.y });
              boundarySet.add(`${current.x},${current.y}`);
              
              let found: boolean = false;
              let nextPoint: { x: number; y: number } | null = null;
              let nextDir: number = dir;
              
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
              
              const { x: currX, y: currY } = current;
              if (boundarySet.has(`${currX},${currY}`) && boundary.length > 2) break;
              if (boundary.length > 10000) break;
              
              const backAtStart = (currX === start.x && currY === start.y && boundary.length >= 3);
              if (backAtStart) break;
              
            } while (true);
            
            return boundary;
          };
          
          const boundary = traceBoundaryFromPixels(personPixels);
          
          if (boundary.length > 0) {
            // Simplify boundary using Douglas-Peucker algorithm
            const simplifyPoints = (points: Array<{ x: number; y: number }>, epsilon: number): Array<{ x: number; y: number }> => {
              if (points.length <= 2) return points;
              
              const perpDist = (point: { x: number; y: number }, lineStart: { x: number; y: number }, lineEnd: { x: number; y: number }) => {
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
            
            const simplified = simplifyPoints(boundary, 5);
            setMagicWandRegions([simplified]);
            console.log('Selfie segmentation: Created boundary with', simplified.length, 'points');
          }
        }
        
        setSelfieProcessing(false);
        selfieSegmentation.close();
      });
      
      // Send image to selfie segmentation
      await selfieSegmentation.send({ image: tempCanvas });
      
    } catch (error) {
      console.error('Selfie segmentation error:', error);
      setSelfieProcessing(false);
    }
  }, []);

  // SAM (Segment Anything Model) - Click to select objects
  const runSAMSegmentation = useCallback(async (clickX: number, clickY: number, isPositive: boolean = true) => {
    if (!canvasRef.current || samProcessing) return;
    
    setSamProcessing(true);
    console.log('Running SAM segmentation at point:', clickX, clickY, 'positive:', isPositive);
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setSamProcessing(false);
        return;
      }
      
      // Smart selection: Use flood fill with edge detection for object selection
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { width, height, data } = imageData;
      
      const getPixel = (x: number, y: number) => {
        if (x < 0 || x >= width || y < 0 || y >= height) return null;
        const idx = (y * width + x) * 4;
        return { r: data[idx], g: data[idx + 1], b: data[idx + 2], a: data[idx + 3] };
      };
      
      const targetPixel = getPixel(clickX, clickY);
      if (!targetPixel) {
        setSamProcessing(false);
        return;
      }
      
      // Smart selection: Use adaptive threshold based on local variance
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
      const adaptiveTolerance = Math.max(20, Math.min(80, localVariance));
      
      console.log('SAM using adaptive tolerance:', adaptiveTolerance, 'based on variance:', localVariance);
      
      // Flood fill with adaptive tolerance
      const visited = new Set<string>();
      const selectedPixels = new Set<string>();
      const queue: Array<{ x: number; y: number }> = [{ x: clickX, y: clickY }];
      
      const colorMatch = (pixel: { r: number; g: number; b: number; a: number } | null) => {
        if (!pixel || !targetPixel) return false;
        const diff = Math.sqrt(
          Math.pow(pixel.r - targetPixel.r, 2) +
          Math.pow(pixel.g - targetPixel.g, 2) +
          Math.pow(pixel.b - targetPixel.b, 2)
        );
        return diff <= adaptiveTolerance;
      };
      
      while (queue.length > 0 && selectedPixels.size < 500000) {
        const { x, y } = queue.shift()!;
        const key = `${x},${y}`;
        
        if (visited.has(key)) continue;
        visited.add(key);
        
        const pixel = getPixel(x, y);
        if (!colorMatch(pixel)) continue;
        
        selectedPixels.add(key);
        
        // Add neighbors (4-connected)
        [[0, 1], [1, 0], [0, -1], [-1, 0]].forEach(([dx, dy]) => {
          const nx = x + dx;
          const ny = y + dy;
          const nkey = `${nx},${ny}`;
          if (!visited.has(nkey) && nx >= 0 && nx < width && ny >= 0 && ny < height) {
            queue.push({ x: nx, y: ny });
          }
        });
      }
      
      console.log('SAM selected pixels:', selectedPixels.size);
      
      if (selectedPixels.size === 0) {
        alert('No object detected at this point. Try clicking on a different area.');
        setSamProcessing(false);
        return;
      }
      
      // Trace boundary using Moore-Neighbor algorithm
      const traceBoundary = () => {
        // Find topmost-leftmost pixel
        let start: { x: number; y: number } | null = null;
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
        
        const boundary: Array<{ x: number; y: number }> = [];
        const directions = [
          [1, 0], [1, 1], [0, 1], [-1, 1],
          [-1, 0], [-1, -1], [0, -1], [1, -1]
        ];
        
        let current: { x: number; y: number } = start;
        let dir = 7;
        const boundarySet = new Set<string>();
        
        do {
          boundary.push({ x: current.x, y: current.y });
          boundarySet.add(`${current.x},${current.y}`);
          
          let found = false;
          let nextPoint: { x: number; y: number } | null = null;
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
        // Simplify boundary
        const simplifyPoints = (points: Array<{ x: number; y: number }>, epsilon: number): Array<{ x: number; y: number }> => {
          if (points.length <= 2) return points;
          
          const perpDist = (point: { x: number; y: number }, lineStart: { x: number; y: number }, lineEnd: { x: number; y: number }) => {
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
        
        const simplified = simplifyPoints(boundary, 3);
        console.log('SAM boundary simplified from', boundary.length, 'to', simplified.length, 'points');
        
        // Add to regions or replace based on positive/negative
        setSamRegions(prev => isPositive ? [...prev, simplified] : prev);
      }
      
    } catch (error) {
      console.error('SAM error:', error);
      alert('Error during smart selection. Please try again.');
    } finally {
      setSamProcessing(false);
    }
  }, [samProcessing]);

  // Trigger selfie segmentation when mode changes to 'selfie'
  useEffect(() => {
    if (cropMode === 'selfie' && previewUrl && !selfieProcessing) {
      runSelfieSegmentation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropMode, previewUrl]); // Only run when cropMode or previewUrl changes

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !imgRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Get click position relative to canvas display
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);
    
    console.log('Canvas click:', { x, y, natW: canvas.width, natH: canvas.height, mode: cropMode });

    if (cropMode === 'sam') {
      // SAM mode: Click to select object
      // Shift+Click to add multiple selections
      // Regular click replaces selection
      if (!e.shiftKey) {
        setSamRegions([]); // Clear previous selections
      }
      runSAMSegmentation(x, y, true);
      return;
    }

    if (cropMode === 'magic') {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const allRegions = findAllColorRegions(x, y, imageData, tolerance);
      
      if (allRegions.length > 0) {
        // If shift key is held, add all found regions to existing; otherwise replace
        if (e.shiftKey && magicWandRegions.length > 0) {
          // Add all new regions
          setMagicWandRegions(prev => [...prev, ...allRegions]);
          console.log('Magic wand added', allRegions.length, 'regions, total regions:', magicWandRegions.length + allRegions.length);
        } else {
          // Replace with all new regions
          setMagicWandRegions(allRegions);
          console.log('Magic wand found', allRegions.length, 'regions');
        }
      }
      return;
    }

    if (cropMode === 'polygon') {
      setPolygonPoints((prev) => [...prev, { x, y }]);
      return;
    }

    if (cropMode === 'rect' || cropMode === 'circle') {
      if (!firstClick) {
        setFirstClick({ x, y });
        setSecondClick(null);
      } else {
        setSecondClick({ x, y });
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !firstClick || secondClick) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setCurrentMouse({ x, y });
  };

  // Draw image and overlays on canvas
  React.useEffect(() => {
    if (!canvasRef.current || !imgRef.current || !previewUrl) return;
    
    const canvas = canvasRef.current;
    const img = imgRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawCanvas = () => {
      // Get natural dimensions
      let naturalWidth = img.naturalWidth || 0;
      let naturalHeight = img.naturalHeight || 0;
      
      // For SVG or images without natural dimensions, set a reasonable default
      if (naturalWidth === 0 || naturalHeight === 0) {
        naturalWidth = 1200;
        naturalHeight = 900;
        console.log('SVG detected, using default dimensions:', naturalWidth, 'x', naturalHeight);
      }
      
      // Limit canvas size to prevent huge canvases
      const MAX_CANVAS_SIZE = 2400; // Max width or height
      let canvasWidth = naturalWidth;
      let canvasHeight = naturalHeight;
      
      // Scale down if too large
      if (canvasWidth > MAX_CANVAS_SIZE || canvasHeight > MAX_CANVAS_SIZE) {
        const scale = Math.min(MAX_CANVAS_SIZE / canvasWidth, MAX_CANVAS_SIZE / canvasHeight);
        canvasWidth = Math.floor(canvasWidth * scale);
        canvasHeight = Math.floor(canvasHeight * scale);
        console.log('Scaling down large image from', naturalWidth, 'x', naturalHeight, 'to', canvasWidth, 'x', canvasHeight);
      }
      
      // Set canvas to calculated size for 1:1 pixel mapping
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      
      // Draw image
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      
      // Draw overlays
      const activePoint = secondClick || currentMouse;
      
      if (cropMode === 'rect' && firstClick && activePoint) {
        const x = Math.min(firstClick.x, activePoint.x);
        const y = Math.min(firstClick.y, activePoint.y);
        const w = Math.abs(activePoint.x - firstClick.x);
        const h = Math.abs(activePoint.y - firstClick.y);
        
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
        ctx.fillRect(x, y, w, h);
        ctx.strokeRect(x, y, w, h);
      }
      
      if (cropMode === 'circle' && firstClick && activePoint) {
        const dx = activePoint.x - firstClick.x;
        const dy = activePoint.y - firstClick.y;
        const r = Math.sqrt(dx * dx + dy * dy);
        
        ctx.beginPath();
        ctx.arc(firstClick.x, firstClick.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
        ctx.fill();
        ctx.stroke();
      }
      
      if (cropMode === 'polygon' && polygonPoints.length > 0) {
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 3;
        ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
        
        ctx.beginPath();
        ctx.moveTo(polygonPoints[0].x, polygonPoints[0].y);
        for (let i = 1; i < polygonPoints.length; i++) {
          ctx.lineTo(polygonPoints[i].x, polygonPoints[i].y);
        }
        if (polygonPoints.length >= 3) {
          ctx.closePath();
          ctx.fill();
        }
        ctx.stroke();
        
        // Draw points
        polygonPoints.forEach((pt) => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#a855f7';
          ctx.fill();
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      }
      
      // Draw each magic wand region with different colors
      if ((cropMode === 'magic' || cropMode === 'selfie') && magicWandRegions.length > 0) {
        const colors = [
          { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.2)' }, // amber
          { stroke: '#ef4444', fill: 'rgba(239, 68, 68, 0.2)' },  // red
          { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.2)' }, // green
          { stroke: '#3b82f6', fill: 'rgba(59, 130, 246, 0.2)' }, // blue
          { stroke: '#8b5cf6', fill: 'rgba(139, 92, 246, 0.2)' }, // violet
          { stroke: '#ec4899', fill: 'rgba(236, 72, 153, 0.2)' }, // pink
        ];
        
        // Use pink highlight for selfie mode
        if (cropMode === 'selfie') {
          magicWandRegions.forEach((region) => {
            ctx.strokeStyle = '#ec4899'; // pink
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
        } else {
          // Magic wand mode - use multi-colored regions
          magicWandRegions.forEach((region, regionIndex) => {
            const colorSet = colors[regionIndex % colors.length];
            ctx.strokeStyle = colorSet.stroke;
            ctx.lineWidth = 2;
            ctx.fillStyle = colorSet.fill;
            
            // Draw boundary outline for this region
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
        }
      }

      // Draw SAM regions (cyan with different shades)
      if (cropMode === 'sam' && samRegions.length > 0) {
        const samColors = [
          { stroke: 'rgba(6, 182, 212, 1)', fill: 'rgba(6, 182, 212, 0.15)' },
          { stroke: 'rgba(14, 165, 233, 1)', fill: 'rgba(14, 165, 233, 0.15)' },
          { stroke: 'rgba(59, 130, 246, 1)', fill: 'rgba(59, 130, 246, 0.15)' },
        ];
        
        samRegions.forEach((region, regionIndex) => {
          const colorSet = samColors[regionIndex % samColors.length];
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
      }
    };

    if (img.complete) {
      drawCanvas();
    } else {
      img.onload = drawCanvas;
    }
  }, [previewUrl, cropMode, firstClick, secondClick, currentMouse, polygonPoints, magicWandRegions, samRegions]);

  const applyCrop = () => {
    if (!canvasRef.current) return;

    if (cropMode === 'rect' && firstClick && secondClick) {
      const left = Math.round(Math.min(firstClick.x, secondClick.x));
      const top = Math.round(Math.min(firstClick.y, secondClick.y));
      const width = Math.round(Math.abs(secondClick.x - firstClick.x));
      const height = Math.round(Math.abs(secondClick.y - firstClick.y));
      
      const crop: CropData = { 
        type: 'rect' as const, 
        data: { left, top, width, height, w: width, h: height } 
      };
      console.log('Applying RECT crop:', crop);
      if (onApplyCrop) onApplyCrop(crop);
      
      // Keep the selection visible for comparison - don't clear it
    } else if (cropMode === 'circle' && firstClick && secondClick) {
      const dx = secondClick.x - firstClick.x;
      const dy = secondClick.y - firstClick.y;
      const r = Math.sqrt(dx * dx + dy * dy);
      
      const crop: CropData = { 
        type: 'circle' as const, 
        data: { 
          cx: Math.round(firstClick.x), 
          cy: Math.round(firstClick.y), 
          r: Math.round(r) 
        } 
      };
      console.log('Applying CIRCLE crop:', crop);
      if (onApplyCrop) onApplyCrop(crop);
      
      // Keep the selection visible for comparison - don't clear it
    } else if (cropMode === 'polygon' && polygonPoints.length >= 3) {
      const points = polygonPoints.map(pt => ({
        x: Math.round(pt.x),
        y: Math.round(pt.y)
      }));
      
      const crop: CropData = { type: 'polygon' as const, data: { points } };
      console.log('Applying POLYGON crop:', crop);
      if (onApplyCrop) onApplyCrop(crop);
      
      // Keep the selection visible for comparison - don't clear it
    } else if (cropMode === 'magic' && magicWandRegions.length > 0) {
      // Send each region as a separate polygon
      const regions = magicWandRegions.map(region => 
        region.map(pt => ({
          x: Math.round(pt.x),
          y: Math.round(pt.y)
        }))
      );
      
      const crop: CropData = { 
        type: 'magic' as const, 
        data: { 
          regions,
          invert: invertMagicWand 
        } 
      };
      console.log('Applying MAGIC WAND crop:', magicWandRegions.length, 'regions, inverted:', invertMagicWand);
      if (onApplyCrop) onApplyCrop(crop);
      
      // Keep the selection visible for comparison - don't clear it
    } else if (cropMode === 'selfie' && magicWandRegions.length > 0) {
      // Send selfie segmentation regions (reusing magicWandRegions state)
      const regions = magicWandRegions.map(region => 
        region.map(pt => ({
          x: Math.round(pt.x),
          y: Math.round(pt.y)
        }))
      );
      
      const crop: CropData = { 
        type: 'selfie' as const, 
        data: { 
          regions,
          invert: invertMagicWand 
        } 
      };
      console.log('Applying SELFIE crop:', magicWandRegions.length, 'regions, inverted:', invertMagicWand);
      if (onApplyCrop) onApplyCrop(crop);
      
      // Keep the selection visible for comparison - don't clear it
    } else if (cropMode === 'sam' && samRegions.length > 0) {
      const regions = samRegions.map(region => region.map(pt => ({ x: Math.round(pt.x), y: Math.round(pt.y) })));
      
      const crop: CropData = { 
        type: 'sam' as const, 
        data: { 
          regions,
          invert: invertMagicWand 
        } 
      };
      console.log('Applying SAM crop:', samRegions.length, 'regions, inverted:', invertMagicWand);
      if (onApplyCrop) onApplyCrop(crop);
      
      // Keep the selection visible for comparison - don't clear it
    }
  };

  const clearCrop = () => {
    setFirstClick(null);
    setSecondClick(null);
    setCurrentMouse(null);
    setPolygonPoints([]);
    setMagicWandRegions([]);
    setSamRegions([]);
    if (onClearCrop) onClearCrop();
  };

  const resetSelection = () => {
    setFirstClick(null);
    setSecondClick(null);
    setCurrentMouse(null);
    setPolygonPoints([]);
    setMagicWandRegions([]);
    setSamRegions([]);
  };

  const undoLastPoint = () => {
    if (cropMode === 'polygon') {
      setPolygonPoints((prev) => prev.slice(0, -1));
    } else if (cropMode === 'magic') {
      setMagicWandRegions((prev) => prev.slice(0, -1));
    } else if (cropMode === 'sam') {
      setSamRegions((prev) => prev.slice(0, -1));
    }
  };

  return (
    <div className="space-y-3">
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-gray-900 dark:text-white">Original Preview</h4>
          
          {/* Crop mode selector */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => { setCropMode('rect'); clearCrop(); }}
              className={`px-3 py-1 rounded text-sm ${cropMode === 'rect' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'}`}
            >
              Rectangle
            </button>
            <button
              onClick={() => { setCropMode('circle'); clearCrop(); }}
              className={`px-3 py-1 rounded text-sm ${cropMode === 'circle' ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'}`}
            >
              Circle
            </button>
            <button
              onClick={() => { setCropMode('polygon'); clearCrop(); }}
              className={`px-3 py-1 rounded text-sm ${cropMode === 'polygon' ? 'bg-purple-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'}`}
            >
              Polygon
            </button>
            <button
              onClick={() => { setCropMode('magic'); clearCrop(); }}
              className={`px-3 py-1 rounded text-sm ${cropMode === 'magic' ? 'bg-amber-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'}`}
              title="Magic Wand - Click on a color to select similar pixels"
            >
              🪄 Magic Wand
            </button>
            <button
              onClick={() => { setCropMode('selfie'); clearCrop(); }}
              className={`px-3 py-1 rounded text-sm ${cropMode === 'selfie' ? 'bg-pink-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'}`}
              title="AI Selfie Segmentation - Auto-detect and crop people"
              disabled={selfieProcessing}
            >
              {selfieProcessing ? '⏳ Processing...' : '🤳 AI Selfie'}
            </button>
            <button
              onClick={() => { setCropMode('sam'); clearCrop(); }}
              className={`px-3 py-1 rounded text-sm ${cropMode === 'sam' ? 'bg-cyan-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'}`}
              title="🖱️ Click to select object - Smart crop with AI assistance"
              disabled={samProcessing}
            >
              {samProcessing ? '⏳ Processing...' : '✂️ Smart Crop'}
            </button>
          </div>
        </div>

        {/* Tolerance slider for magic wand */}
        {cropMode === 'magic' && (
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
            
            {/* Multi-selection tip */}
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
              <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                💡 Tip: Hold <kbd className="px-1 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">Shift</kbd> while clicking to add multiple regions to your selection
              </p>
            </div>
            
            {/* Invert selection checkbox */}
            <div className="mt-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="invertMagicWand"
                checked={invertMagicWand}
                onChange={(e) => setInvertMagicWand(e.target.checked)}
                className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 dark:focus:ring-amber-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="invertMagicWand" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                Invert Selection
              </label>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 ml-6">
              Keep everything except the selected region
            </p>
          </div>
        )}

        {previewUrl ? (
          <div className="flex justify-center items-center flex-col" style={{ maxHeight: '600px', overflow: 'auto' }}>
            {/* Hidden image for loading */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              ref={imgRef} 
              src={previewUrl} 
              alt="source" 
              className="hidden"
            />
            
            {/* Canvas for display and interaction */}
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={() => setCurrentMouse(null)}
              className="cursor-crosshair border border-gray-300 dark:border-gray-600 rounded"
              style={{ imageRendering: 'auto', maxWidth: '100%', maxHeight: '600px', display: 'block' }}
            />

            {/* Instructions */}
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              {cropMode === 'rect' && !firstClick && 'Click to set first corner, then click again to set second corner'}
              {cropMode === 'rect' && firstClick && !secondClick && 'Click to set second corner'}
              {cropMode === 'rect' && firstClick && secondClick && 'Selection complete! Click "Apply Crop"'}
              {cropMode === 'circle' && !firstClick && 'Click to set center, then click again to set radius'}
              {cropMode === 'circle' && firstClick && !secondClick && 'Click to set radius (distance from center)'}
              {cropMode === 'circle' && firstClick && secondClick && 'Circle complete! Click "Apply Crop"'}
              {cropMode === 'polygon' && 'Click to add points (min 3). Click "Apply Crop" when done.'}
              {cropMode === 'magic' && magicWandRegions.length === 0 && !invertMagicWand && 'Click on any color to select. Hold Shift to add multiple regions.'}
              {cropMode === 'magic' && magicWandRegions.length === 0 && invertMagicWand && 'Click on a color to REMOVE it. Hold Shift to remove multiple regions.'}
              {cropMode === 'magic' && magicWandRegions.length > 0 && !invertMagicWand && `Selected ${magicWandRegions.length} region(s). Shift+Click to add more, or "Apply Crop" when done.`}
              {cropMode === 'magic' && magicWandRegions.length > 0 && invertMagicWand && `Will remove ${magicWandRegions.length} region(s). Shift+Click to add more, or "Apply Crop".`}
              {cropMode === 'sam' && samRegions.length === 0 && '🖱️ Click on an object to select it. Shift+Click to select multiple objects.'}
              {cropMode === 'sam' && samRegions.length > 0 && `✂️ Selected ${samRegions.length} object(s). Shift+Click to add more, or "Apply Crop" when done.`}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 mt-3">No image uploaded yet.</p>
        )}

        <div className="flex gap-2 mt-3 flex-wrap">
          <button
            onClick={applyCrop}
            disabled={
              (cropMode === 'rect' && (!firstClick || !secondClick)) ||
              (cropMode === 'circle' && (!firstClick || !secondClick)) ||
              (cropMode === 'polygon' && polygonPoints.length < 3) ||
              (cropMode === 'magic' && magicWandRegions.length === 0) ||
              (cropMode === 'sam' && samRegions.length === 0)
            }
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply Crop
          </button>
          <button
            onClick={resetSelection}
            disabled={!firstClick && polygonPoints.length === 0}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset Selection
          </button>
          <button
            onClick={clearCrop}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
          >
            Clear Crop
          </button>
          {cropMode === 'polygon' && polygonPoints.length > 0 && (
            <button
              onClick={undoLastPoint}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded"
            >
              Undo Last Point
            </button>
          )}
          {cropMode === 'magic' && magicWandRegions.length > 0 && (
            <button
              onClick={undoLastPoint}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded"
            >
              Remove Last Region ({magicWandRegions.length})
            </button>
          )}
          {cropMode === 'sam' && samRegions.length > 0 && (
            <button
              onClick={undoLastPoint}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded"
            >
              Remove Last Object ({samRegions.length})
            </button>
          )}
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 dark:text-white">Converted Result</h4>
        {loading ? (
          <p className="text-gray-500 mt-3">Processing...</p>
        ) : convertedUrl ? (
          <div className="mt-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={convertedUrl} alt="converted" className="max-h-96 object-contain w-full" />
            <a href={convertedUrl} download className="inline-block mt-3 px-4 py-2 bg-blue-500 text-white rounded">Download</a>
          </div>
        ) : (
          <p className="text-gray-500 mt-3">No converted image yet.</p>
        )}
      </div>

      {/* Tool Features Dropdown */}
      <details className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <summary className="font-medium text-gray-900 dark:text-white cursor-pointer">
          📚 Tool Features
        </summary>
        <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <strong className="text-gray-900 dark:text-white">Format Conversion:</strong>
            <p>Convert between PNG, JPEG, WebP, SVG, and ICO formats with adjustable quality settings.</p>
          </div>
          <div>
            <strong className="text-gray-900 dark:text-white">Image Resizing:</strong>
            <p>Resize images by width, height, or both. Maintains aspect ratio when only one dimension is specified.</p>
          </div>
          <div>
            <strong className="text-gray-900 dark:text-white">Cropping Modes:</strong>
            <ul className="list-disc list-inside ml-2">
              <li><span className="text-blue-600 dark:text-blue-400">Rectangle:</span> Click two corners to define a rectangular crop area</li>
              <li><span className="text-green-600 dark:text-green-400">Circle:</span> Click center point, then click to set radius for circular crop</li>
              <li><span className="text-purple-600 dark:text-purple-400">Polygon:</span> Click to add points (minimum 3) for custom polygon crop</li>
            </ul>
          </div>
          
        </div>
      </details>

      {/* API Documentation Dropdown */}
      <details className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <summary className="font-medium text-gray-900 dark:text-white cursor-pointer">
          🔌 API Documentation
        </summary>
        <div className="mt-3 space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <strong className="text-gray-900 dark:text-white">Endpoint:</strong>
            <code className="ml-2 px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded">POST /api/image-convert</code>
          </div>
          
          <div>
            <strong className="text-gray-900 dark:text-white">Request Format:</strong>
            <p className="ml-2">Multipart form-data with two fields:</p>
            <ul className="list-disc list-inside ml-4">
              <li><code>file</code>: Image file (required)</li>
              <li><code>options</code>: JSON string with conversion settings (required)</li>
            </ul>
          </div>

          <div>
            <strong className="text-gray-900 dark:text-white">Options Object:</strong>
            <pre className="ml-2 mt-1 p-2 bg-gray-200 dark:bg-gray-800 rounded overflow-x-auto text-xs">
{`{
  "toFormat": "png|jpeg|webp|svg|ico",
  "quality": 1-100,
  "width": number | null,
  "height": number | null,
  "crop": {
    "type": "rect|circle|polygon",
    "data": {
      // Rectangle: { left, top, width, height }
      // Circle: { cx, cy, r }
      // Polygon: { points: [{x, y}, ...] }
    }
  }
}`}</pre>
          </div>

          <div>
            <strong className="text-gray-900 dark:text-white">Response:</strong>
            <p className="ml-2">Binary image data with appropriate Content-Type header and download filename.</p>
          </div>

          <div>
            <strong className="text-gray-900 dark:text-white">Example Usage:</strong>
            <pre className="ml-2 mt-1 p-2 bg-gray-200 dark:bg-gray-800 rounded overflow-x-auto text-xs">
{`const formData = new FormData();
formData.append('file', imageFile);
formData.append('options', JSON.stringify({
  toFormat: 'png',
  quality: 90,
  width: 800,
  crop: {
    type: 'circle',
    data: { cx: 400, cy: 300, r: 150 }
  }
}));

const response = await fetch('/api/image-convert', {
  method: 'POST',
  body: formData
});
const blob = await response.blob();`}</pre>
          </div>
        </div>
      </details>
    </div>
  );
}
