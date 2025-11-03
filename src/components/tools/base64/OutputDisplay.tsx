'use client';

import React, { useState } from 'react';
import { FiCopy, FiDownload, FiEye, FiCode } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Base64Content, toImgTag, toDataURL, downloadBase64 } from '@/lib/converters/base64';
import { ImagePreview } from './ImagePreview';
import { JSONViewer } from './JSONViewer';

interface OutputDisplayProps {
  content: Base64Content | null;
  originalText?: string;
}

type PreviewMode = 'auto' | 'raw' | 'json' | 'image';

export function OutputDisplay({ content }: OutputDisplayProps) {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('auto');

  if (!content) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Enter some content to see the output
      </div>
    );
  }

  const determinePreviewMode = (): PreviewMode => {
    if (previewMode === 'auto') {
      if (content.type === 'image') return 'image';
      if (content.type === 'json') return 'json';
      return 'raw';
    }
    return previewMode;
  };

  const mode = determinePreviewMode();

  const handleCopyBase64 = () => {
    navigator.clipboard.writeText(content.data).then(() => {
      toast.success('Base64 copied!');
    });
  };

  const handleCopyDataURL = () => {
    const dataUrl = toDataURL(content.data, content.mimeType || 'text/plain');
    navigator.clipboard.writeText(dataUrl).then(() => {
      toast.success('Data URL copied!');
    });
  };

  const handleCopyImgTag = () => {
    if (content.type === 'image') {
      const imgTag = toImgTag(content.data, content.mimeType || 'image/png');
      navigator.clipboard.writeText(imgTag).then(() => {
        toast.success('IMG tag copied!');
      });
    }
  };

  const handleDownload = () => {
    if (content.type === 'image') {
      downloadBase64(content.data, `image.${content.format || 'png'}`, content.mimeType || 'image/png');
    } else if (content.type === 'json') {
      downloadBase64(content.data, 'data.json', 'application/json');
    } else {
      downloadBase64(content.data, 'data.txt', 'text/plain');
    }
    toast.success('Download started!');
  };

  return (
    <div className="space-y-4">
      {/* Header with type badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Output</h3>
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
            {content.type.toUpperCase()}
          </span>
        </div>
        <div className="flex gap-1">
          {/* Preview mode buttons */}
          <button
            onClick={() => setPreviewMode('auto')}
            className={`p-2 rounded-lg transition ${
              previewMode === 'auto'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            title="Auto detect preview mode"
          >
            <FiEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPreviewMode('raw')}
            className={`p-2 rounded-lg transition ${
              previewMode === 'raw'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            title="Raw text view"
          >
            <FiCode className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
        {content.type === 'unknown' ? (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
            <p className="text-red-800 dark:text-red-200 font-medium mb-2">⚠️ Invalid or Unrecognized Input</p>
            <p className="text-red-700 dark:text-red-300 text-sm mb-3">
              The input does not appear to be valid Base64. Try:
            </p>
            <ul className="text-sm text-red-700 dark:text-red-300 list-disc list-inside space-y-1">
              <li>Paste a complete Base64 string (or data:image/png;base64,xxxxx)</li>
              <li>Switch to <strong>Encode</strong> mode to convert text to Base64</li>
              <li>Check that you are pasting the entire Base64 data</li>
            </ul>
          </div>
        ) : mode === 'image' && content.type === 'image' ? (
          <ImagePreview base64={content.data} mimeType={content.mimeType} />
        ) : mode === 'json' && content.type === 'json' ? (
          <JSONViewer content={content.data} />
        ) : (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 max-h-96 overflow-auto">
            <pre className="font-mono text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap wrap-break-word">
              {content.data}
            </pre>
          </div>
        )}
      </div>

      {/* Action Buttons - Only show if content is valid */}
      {content.type !== 'unknown' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={handleCopyBase64}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition text-sm font-medium text-gray-900 dark:text-white"
            title="Copy Base64 to clipboard"
          >
            <FiCopy className="w-4 h-4" />
            <span className="hidden sm:inline">Copy B64</span>
          </button>

          <button
            onClick={handleCopyDataURL}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition text-sm font-medium text-gray-900 dark:text-white"
            title="Copy as data URL"
          >
            <FiCopy className="w-4 h-4" />
            <span className="hidden sm:inline">Data URL</span>
          </button>

          {content.type === 'image' && (
            <button
              onClick={handleCopyImgTag}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition text-sm font-medium text-gray-900 dark:text-white"
              title="Copy HTML img tag"
            >
              <FiCopy className="w-4 h-4" />
              <span className="hidden sm:inline">IMG Tag</span>
            </button>
          )}

          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition text-sm font-medium text-white"
            title="Download output"
          >
            <FiDownload className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      )}
    </div>
  );
}
