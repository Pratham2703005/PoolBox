// Preview.tsx - Main preview component (refactored)
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { CropData, CropDataSingle, CropMode, CanvasRefs } from './crops/types';
import { RectCropTool } from './crops/RectCropTool';
import { CircleCropTool } from './crops/CircleCropTool';
import { PolygonCropTool } from './crops/PolygonCropTool';
import { MagicWandCropTool } from './crops/MagicWandCropTool';
import { SelfieCropTool } from './crops/SelfieCropTool';
import { SAMCropTool } from './crops/SAMCropTool';

type PreviewProps = {
  previewUrl: string | null;
  convertedUrl: string | null;
  loading: boolean;
  onApplyCrop?: (c: CropData) => void;
  onClearCrop?: () => void;
  invertSelection: boolean;
  setInvertSelection: (value: boolean) => void;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Preview({ previewUrl, convertedUrl, loading, onApplyCrop, onClearCrop, invertSelection, setInvertSelection }: PreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [cropMode, setCropMode] = useState<CropMode>('rect');

  const canvasRefs: CanvasRefs = { canvasRef, imgRef };

  // Initialize crop tools
  const rectTool = RectCropTool({ canvasRefs, onApplyCrop: onApplyCrop!, isActive: cropMode === 'rect' });
  const circleTool = CircleCropTool({ canvasRefs, onApplyCrop: onApplyCrop!, isActive: cropMode === 'circle' });
  const polygonTool = PolygonCropTool({ canvasRefs, onApplyCrop: onApplyCrop!, isActive: cropMode === 'polygon' });
  const magicTool = MagicWandCropTool({ canvasRefs, onApplyCrop: onApplyCrop!, isActive: cropMode === 'magic' });
  const selfieTool = SelfieCropTool({ canvasRefs, onApplyCrop: onApplyCrop!, isActive: cropMode === 'selfie' });
  const samTool = SAMCropTool({ canvasRefs, onApplyCrop: onApplyCrop!, isActive: cropMode === 'sam' });

  // Get current tool
  const getCurrentTool = () => {
    switch (cropMode) {
      case 'rect': return rectTool;
      case 'circle': return circleTool;
      case 'polygon': return polygonTool;
      case 'magic': return magicTool;
      case 'selfie': return selfieTool;
      case 'sam': return samTool;
      default: return rectTool;
    }
  };

  const currentTool = getCurrentTool();

  // Handle canvas interactions
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    currentTool.handleCanvasClick(e);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    currentTool.handleCanvasMouseMove(e);
  };

  const handleMouseLeave = () => {
    // Call tool's mouse leave handler if available
    if ('handleCanvasMouseLeave' in currentTool && typeof currentTool.handleCanvasMouseLeave === 'function') {
      currentTool.handleCanvasMouseLeave();
    }
  };

  // Draw image and overlays
  useEffect(() => {
    if (!canvasRef.current || !imgRef.current || !previewUrl) return;
    
    const canvas = canvasRef.current;
    const img = imgRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawCanvas = () => {
      let naturalWidth = img.naturalWidth || 0;
      let naturalHeight = img.naturalHeight || 0;
      
      if (naturalWidth === 0 || naturalHeight === 0) {
        naturalWidth = 1200;
        naturalHeight = 900;
      }
      
      const MAX_CANVAS_SIZE = 2400;
      let canvasWidth = naturalWidth;
      let canvasHeight = naturalHeight;
      
      if (canvasWidth > MAX_CANVAS_SIZE || canvasHeight > MAX_CANVAS_SIZE) {
        const scale = Math.min(MAX_CANVAS_SIZE / canvasWidth, MAX_CANVAS_SIZE / canvasHeight);
        canvasWidth = Math.floor(canvasWidth * scale);
        canvasHeight = Math.floor(canvasHeight * scale);
      }
      
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      
      // Draw all tools' overlays (to show multi-mode regions)
      rectTool.drawOverlay(ctx);
      circleTool.drawOverlay(ctx);
      polygonTool.drawOverlay(ctx);
      magicTool.drawOverlay(ctx);
      samTool.drawOverlay(ctx);
      selfieTool.drawOverlay(ctx);
    };

    if (img.complete) {
      drawCanvas();
    } else {
      img.onload = drawCanvas;
    }
  }, [previewUrl, cropMode, currentTool, rectTool, circleTool, polygonTool, magicTool, samTool, selfieTool]);

  const applyCrop = () => {
    // Collect crop data from all tools (only single types, not multi)
    // Note: invert selection is now applied at conversion time, not here
    const allCrops: CropDataSingle[] = [];
    
    const rectData = rectTool.getCropData();
    if (rectData && rectData.type !== 'multi') allCrops.push(rectData);
    
    const circleData = circleTool.getCropData();
    if (circleData && circleData.type !== 'multi') allCrops.push(circleData);
    
    const polygonData = polygonTool.getCropData();
    if (polygonData && polygonData.type !== 'multi') allCrops.push(polygonData);
    
    const magicData = magicTool.getCropData();
    if (magicData && magicData.type !== 'multi') allCrops.push(magicData);
    
    const samData = samTool.getCropData();
    if (samData && samData.type !== 'multi') allCrops.push(samData);
    
    const selfieData = selfieTool.getCropData();
    if (selfieData && selfieData.type !== 'multi') allCrops.push(selfieData);
    
    // If no crops at all, return
    if (allCrops.length === 0) return;
    
    // If only one crop type, send it directly
    if (allCrops.length === 1) {
      if (onApplyCrop) onApplyCrop(allCrops[0]);
      return;
    }
    
    // Multiple crop types - send as multi
    const multiCrop: CropData = {
      type: 'multi',
      data: { crops: allCrops }
    };
    if (onApplyCrop) onApplyCrop(multiCrop);
  };

  const clearCrop = () => {
    // Clear only current tool's boundaries
    currentTool.reset();
    if (onClearCrop) onClearCrop();
  };

  const resetSelection = () => {
    // Reset ALL tools - remove all selections from all modes
    rectTool.reset();
    circleTool.reset();
    polygonTool.reset();
    magicTool.reset();
    samTool.reset();
    selfieTool.reset();
  };

  // Check if any tool has data
  const hasAnySelection = () => {
    return rectTool.canApply || circleTool.canApply || polygonTool.canApply || 
           magicTool.canApply || samTool.canApply || selfieTool.canApply;
  };

  const undoLastPoint = () => {
    if ('undoLast' in currentTool) {
      currentTool.undoLast();
    }
  };

  const changeCropMode = (mode: CropMode) => {
    // Don't reset - allow multi-mode cropping
    setCropMode(mode);
  };

  return (
    <div className="space-y-3">
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-gray-900 dark:text-white">Original Preview</h4>
          
          {/* Crop mode selector */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => changeCropMode('rect')}
              className={`px-3 py-1 rounded text-sm ${cropMode === 'rect' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'}`}
            >
              Rectangle
            </button>
            <button
              onClick={() => changeCropMode('circle')}
              className={`px-3 py-1 rounded text-sm ${cropMode === 'circle' ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'}`}
            >
              Circle
            </button>
            <button
              onClick={() => changeCropMode('polygon')}
              className={`px-3 py-1 rounded text-sm ${cropMode === 'polygon' ? 'bg-purple-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'}`}
            >
              Polygon
            </button>
            <button
              onClick={() => changeCropMode('magic')}
              className={`px-3 py-1 rounded text-sm ${cropMode === 'magic' ? 'bg-amber-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'}`}
              title="Magic Wand - Click on a color to select similar pixels"
            >
              Magic Wand
            </button>
            <button
              onClick={() => changeCropMode('selfie')}
              className={`px-3 py-1 rounded text-sm ${cropMode === 'selfie' ? 'bg-pink-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'}`}
              title="AI Selfie Segmentation - Auto-detect and crop people"
              disabled={'processing' in selfieTool && selfieTool.processing}
            >
              {'processing' in selfieTool && selfieTool.processing ? 'Processing...' : 'AI Selfie'}
            </button>
            <button
              onClick={() => changeCropMode('sam')}
              className={`px-3 py-1 rounded text-sm ${cropMode === 'sam' ? 'bg-cyan-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'}`}
              title="🖱️ Click to select object - Smart crop with AI assistance"
              disabled={'processing' in samTool && samTool.processing}
            >
              {'processing' in samTool && samTool.processing ? 'Processing...' : 'SAM'}
            </button>
          </div>
        </div>

        {/* Tool-specific controls */}
        {'Controls' in currentTool && <currentTool.Controls />}

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
              onMouseLeave={handleMouseLeave}
              className="cursor-crosshair border border-gray-300 dark:border-gray-600 rounded"
              style={{ imageRendering: 'auto', maxWidth: '100%', maxHeight: '600px', display: 'block' }}
            />

            {/* Instructions */}
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              {currentTool.instruction}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 mt-3">No image uploaded yet.</p>
        )}

        <div className="flex gap-2 mt-3 flex-wrap">
          <button
            onClick={applyCrop}
            disabled={!hasAnySelection()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply Crop
          </button>
          <button
            onClick={clearCrop}
            disabled={!currentTool.canApply}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear Current Mode
          </button>
          <button
            onClick={resetSelection}
            disabled={!hasAnySelection()}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🗑️ Reset All Modes
          </button>
          
          {/* Undo button for tools that support it */}
          {(cropMode === 'rect' || cropMode === 'circle' || cropMode === 'polygon') && currentTool.canApply && (
            <button
              onClick={undoLastPoint}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded"
            >
              Undo Last
            </button>
          )}
          {cropMode === 'magic' && 'regions' in magicTool && magicTool.regions.length > 0 && (
            <button
              onClick={undoLastPoint}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded"
            >
              Remove Last Region ({magicTool.regions.length})
            </button>
          )}
          {cropMode === 'sam' && 'regions' in samTool && samTool.regions.length > 0 && (
            <button
              onClick={undoLastPoint}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded"
            >
              Remove Last Object ({samTool.regions.length})
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
              <li><span className="text-amber-600 dark:text-amber-400">Magic Wand:</span> Click on a color to select all similar regions. Adjustable tolerance and invert option.</li>
              <li><span className="text-pink-600 dark:text-pink-400">AI Selfie:</span> Automatically detect and segment people using MediaPipe AI</li>
              <li><span className="text-cyan-600 dark:text-cyan-400">Smart Crop:</span> Click to intelligently select objects with adaptive color matching</li>
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
    "type": "rect|circle|polygon|magic|selfie|sam",
    "data": {
      // Rectangle: { left, top, width, height }
      // Circle: { cx, cy, r }
      // Polygon: { points: [{x, y}, ...] }
      // Magic/Selfie/SAM: { regions: [[{x,y},...]], invert?: boolean }
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