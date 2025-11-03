'use client';

import React from 'react';
import { toDataURL } from '@/lib/converters/base64';

interface ImagePreviewProps {
  base64: string;
  mimeType?: string;
}

export function ImagePreview({ base64, mimeType = 'image/png' }: ImagePreviewProps) {
  const dataUrl = toDataURL(base64, mimeType);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="max-w-full max-h-96 overflow-auto rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={dataUrl}
          alt="Preview"
          className="max-w-full h-auto"
          onError={() => {
            // Image failed to load
          }}
        />
      </div>
    </div>
  );
}
