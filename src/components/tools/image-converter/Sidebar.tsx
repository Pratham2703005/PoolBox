"use client";

import React, { useState } from 'react';
import type { ImageOptions } from './ImageConverterTool';
import { useIsMounted } from '@/hooks/useIsMounted';

type SidebarProps = {
  options: ImageOptions;
  setOptions: React.Dispatch<React.SetStateAction<ImageOptions>>;
  onConvert: () => void;
  loading: boolean;
  originalSize: number | null;
  estimatedSize: number | null;
  invertSelection: boolean;
  setInvertSelection: (value: boolean) => void;
};

export function Sidebar({ options, setOptions, onConvert, loading, originalSize, estimatedSize, invertSelection, setInvertSelection }: SidebarProps) {
  const [showFeatures, setShowFeatures] = useState(false);
  const isMounted = useIsMounted()
  const formatBytes = (bytes: number | null) => {
    if (bytes == null) return '—';
    const units = ['B','KB','MB','GB'];
    let i = 0;
    let v = bytes;
    while (v >= 1024 && i < units.length-1) { v /= 1024; i++; }
    return `${v.toFixed(2)} ${units[i]}`;
  };

  return (
    <div className="sticky top-6 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Options</h3>

      <div className="text-xs text-gray-600 dark:text-gray-400">
        <div>Original size: <strong>{formatBytes(originalSize)}</strong></div>
        <div>Estimated output: <strong>{formatBytes(estimatedSize)}</strong></div>
      </div>

      <div>
        <label className="text-sm block mb-1">Output Format</label>
        <select
          value={options.toFormat}
          onChange={(e) => setOptions(prev => ({ ...prev, toFormat: e.target.value }))}
          className="w-full px-3 py-2 rounded bg-white dark:bg-gray-900 border"
        >
          <option value="png">PNG</option>
          <option value="jpeg">JPG</option>
          <option value="webp">WebP</option>
          <option value="svg">SVG (wrapper)</option>
          <option value="ico">ICO (64x64)</option>
        </select>
      </div>
      {isMounted && ( 
      <div>
        <label className="text-sm block mb-1">Quality (1-100)</label>
        <input
          type="number"
          min={1}
          max={100}
          value={options.quality}
          onChange={(e) => setOptions(prev => ({ ...prev, quality: Number(e.target.value) }))}
          className="w-full px-3 py-2 rounded bg-white dark:bg-gray-900 border"
        />
      </div>
      )}

      <div>
        <label className="text-sm block mb-1">Resize (width x height) - leave blank for original</label>
        <div className="flex gap-2">
          <input type="number" placeholder="width" value={options.width || ''} onChange={(e) => setOptions(prev => ({ ...prev, width: e.target.value ? Number(e.target.value) : null }))} className="w-1/2 px-3 py-2 rounded bg-white dark:bg-gray-900 border" />
          <input type="number" placeholder="height" value={options.height || ''} onChange={(e) => setOptions(prev => ({ ...prev, height: e.target.value ? Number(e.target.value) : null }))} className="w-1/2 px-3 py-2 rounded bg-white dark:bg-gray-900 border" />
        </div>
      </div>

      {options.crop && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
          <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Active Crop: {
              (() => {
                const crop = options.crop;
                if (!crop) return '';
                const type = crop.type;
                if (type === 'rect') return 'Rectangle(s)';
                if (type === 'circle') return 'Circle(s)';
                if (type === 'polygon') return 'Polygon(s)';
                if (type === 'magic') return 'Magic Wand Selection';
                if (type === 'selfie') return 'AI Selfie Segmentation';
                if (type === 'sam') return 'Smart Object Selection';
                if (type === 'multi') return 'Multi-Mode Crop';
                return String(type);
              })()
            }
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
            {(() => {
              const crop = options.crop;
              if (crop && crop.type === 'multi' && 'crops' in crop.data) {
                return `Combining ${crop.data.crops.length} crop types`;
              }
              return 'Crop will be applied during conversion';
            })()}
          </div>
        </div>
      )}

      {/* Invert Selection - Global control for ALL crop modes */}
      <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
        <input
          type="checkbox"
          id="globalInvert"
          checked={invertSelection}
          onChange={(e) => setInvertSelection(e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="globalInvert" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer flex-1">
          🔄 Invert Selection
        </label>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400 -mt-2 ml-2">
        For ALL crop modes: Keep everything <strong>except</strong> the selected region(s)
      </p>

      <div className="pt-2">
        <button onClick={onConvert} disabled={loading} className="w-full px-4 py-2 bg-blue-500 text-white rounded">{loading ? 'Processing...' : 'Convert'}</button>
      </div>

      {/* Features & Capabilities */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowFeatures(!showFeatures)}
          className="w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300 flex justify-between items-center"
        >
          <span>🚀 Features & Capabilities</span>
          <span>{showFeatures ? '▼' : '▶'}</span>
        </button>
        
        {showFeatures && (
          <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 space-y-2">
            <div className="font-semibold text-gray-800 dark:text-gray-200">Format Conversion:</div>
            <ul className="list-disc list-inside pl-2 space-y-1">
              <li>PNG, JPEG, WebP, SVG, ICO</li>
              <li>Quality control (1-100)</li>
              <li>Resize with aspect ratio</li>
            </ul>

            <div className="font-semibold text-gray-800 dark:text-gray-200 mt-3">Cropping Modes:</div>
            <ul className="list-disc list-inside pl-2 space-y-1">
              <li><strong>Rectangle:</strong> Multi-region selection (Shift+Click)</li>
              <li><strong>Circle:</strong> Multi-region selection (Shift+Click)</li>
              <li><strong>Polygon:</strong> Multi-region freeform shapes</li>
              <li><strong>Magic Wand:</strong> Color-based auto-selection</li>
              <li><strong>Selfie Mode:</strong> AI-powered person segmentation</li>
              <li><strong>Smart Crop (SAM):</strong> AI object detection</li>
              <li><strong>Multi-Mode:</strong> Combine different crop types!</li>
            </ul>

            <div className="font-semibold text-gray-800 dark:text-gray-200 mt-3">Advanced Features:</div>
            <ul className="list-disc list-inside pl-2 space-y-1">
              <li>Real-time preview with color-coded regions</li>
              <li>Persistent boundaries across mode switches</li>
              <li>Tolerance & feathering controls</li>
              <li>Invert selection for negative masks</li>
              <li>SVG composite masking backend</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
