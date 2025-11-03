'use client';

import React from 'react';
import { BaseConverterTool } from '@/components/tools/base-converter/BaseConverterTool';

export default function BaseConverterPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Base Converter
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Convert between different number bases and text encodings with real-time conversion
          </p>
        </div>
        
        <BaseConverterTool />
      </div>
    </div>
  );
}
