'use client';

import React from 'react';
import { FiInfo } from 'react-icons/fi';
import { ConversionStats, formatFileSize } from '@/lib/converters/base64';

interface SizeStatsProps {
  stats: ConversionStats | null;
}

export function SizeStats({ stats }: SizeStatsProps) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
          <FiInfo className="w-3 h-3" />
          Original
        </p>
        <p className="text-lg font-semibold text-gray-900 dark:text-white">
          {formatFileSize(stats.originalSize)}
        </p>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
          <FiInfo className="w-3 h-3" />
          Base64
        </p>
        <p className="text-lg font-semibold text-gray-900 dark:text-white">
          {formatFileSize(stats.encodedSize)}
        </p>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
          <FiInfo className="w-3 h-3" />
          Increase
        </p>
        <p className={`text-lg font-semibold ${stats.increasePercent > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}>
          {stats.increasePercent > 0 ? '+' : ''}{stats.increasePercent}%
        </p>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
          <FiInfo className="w-3 h-3" />
          Ratio
        </p>
        <p className="text-lg font-semibold text-gray-900 dark:text-white">
          {(stats.encodedSize / stats.originalSize).toFixed(2)}x
        </p>
      </div>
    </div>
  );
}
