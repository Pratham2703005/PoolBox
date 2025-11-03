'use client';

import React from 'react';
import { isValidHexColor, hexToRgb } from '@/lib/converters/base-converter';

interface HexColorPreviewProps {
  hex: string;
}

// Simple color name mapping for common hex colors
const colorNames: Record<string, string> = {
  'FF0000': 'Red',
  '00FF00': 'Lime',
  '0000FF': 'Blue',
  'FFFF00': 'Yellow',
  '00FFFF': 'Cyan',
  'FF00FF': 'Magenta',
  'FFFFFF': 'White',
  '000000': 'Black',
  '808080': 'Gray',
  'C0C0C0': 'Silver',
  'A9A9A9': 'Dark Gray',
  '800000': 'Maroon',
  '808000': 'Olive',
  '008000': 'Green',
  '800080': 'Purple',
  '008080': 'Teal',
  'FF6347': 'Tomato',
  'FFA500': 'Orange',
  'FFD700': 'Gold',
  'ADFF2F': 'Green Yellow',
};

export function HexColorPreview({ hex }: HexColorPreviewProps) {
  if (!hex.trim() || !isValidHexColor(hex)) {
    return null;
  }

  const cleanHex = hex.replace('#', '').toUpperCase();
  const rgb = hexToRgb(hex);
  const colorName = colorNames[cleanHex] || 'Custom Color';

  // Calculate luminance to determine text color
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  const textColor = luminance > 0.5 ? '#000000' : '#FFFFFF';

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-300 dark:border-gray-600">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        🎨 Color Preview
      </h3>

      <div className="space-y-3">
        {/* Color Box */}
        <div
          className="w-full h-24 rounded-lg border-2 border-gray-300 dark:border-gray-600 transition-all flex items-center justify-center text-sm font-mono"
          style={{
            backgroundColor: `#${cleanHex}`,
            color: textColor,
          }}
        >
          #{cleanHex}
        </div>

        {/* Color Info */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-white dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">Red</div>
            <div className="font-mono text-gray-900 dark:text-white">
              {rgb.r}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">Green</div>
            <div className="font-mono text-gray-900 dark:text-white">
              {rgb.g}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">Blue</div>
            <div className="font-mono text-gray-900 dark:text-white">
              {rgb.b}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">Name</div>
            <div className="font-mono text-gray-900 dark:text-white text-xs">
              {colorName}
            </div>
          </div>
        </div>

        {/* RGB Format */}
        <div className="bg-white dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            RGB Format
          </div>
          <div className="font-mono text-xs text-gray-900 dark:text-white break-all">
            rgb({rgb.r}, {rgb.g}, {rgb.b})
          </div>
        </div>
      </div>
    </div>
  );
}
