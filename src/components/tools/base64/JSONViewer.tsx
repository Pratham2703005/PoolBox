'use client';

import React from 'react';
import { formatJSON } from '@/lib/converters/base64';

interface JSONViewerProps {
  content: string;
  indent?: number;
}

export function JSONViewer({ content, indent = 2 }: JSONViewerProps) {
  const formatted = formatJSON(content, indent);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        JSON Preview
      </label>
      <pre className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm overflow-auto max-h-96 text-gray-900 dark:text-gray-100">
        <code>{formatted}</code>
      </pre>
    </div>
  );
}
