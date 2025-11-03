'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { FiRotateCcw } from 'react-icons/fi';
import {
  encodeToBase64,
  decodeFromBase64,
  calculateStats,
  ConversionStats,
  Base64Content,
  isLikelyBase64,
  detectContentType,
  detectImageMimeType,
  isValidJSON,
} from '@/lib/converters/base64';
import { useIsMounted } from '@/hooks/useIsMounted';
import { Base64Input } from './Base64Input';
import { OutputDisplay } from './OutputDisplay';
import { SizeStats } from './SizeStats';

type ConversionMode = 'encode' | 'decode' | 'auto';

export function Base64Converter() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<ConversionMode>('auto');
  const isMounted = useIsMounted();

  // Determine what to do with input
  const { output, stats, parsedContent } = useMemo(() => {
    if (!input.trim()) {
      return { output: '', stats: null, parsedContent: null };
    }

    try {
      const trimmedInput = input.trim();
      
      // Use robust base64 detection
      const inputIsBase64 = isLikelyBase64(trimmedInput);

      let result = '';
      let stats: ConversionStats | null = null;
      let parsedContent: Base64Content | null = null;

      if (mode === 'encode' || (mode === 'auto' && !inputIsBase64)) {
        // Encode mode: convert input to Base64
        result = encodeToBase64(input);
        stats = calculateStats(input, result);
      } else {
        // Decode mode: convert Base64 to readable content
        // Detect content type WITHOUT trying to decode first
        try {
          const contentType = detectContentType(trimmedInput);
          
          if (contentType === 'image') {
            // Image - show as-is without decoding
            const mimeType = detectImageMimeType(trimmedInput);
            const format = mimeType?.split("/")[1] || "png";
            parsedContent = {
              type: 'image',
              data: trimmedInput,
              mimeType: mimeType || "image/png",
              format,
            };
            result = trimmedInput;
          } else if (contentType === 'text' || contentType === 'unknown') {
            // Text or unknown - try to decode
            try {
              result = decodeFromBase64(trimmedInput);
              stats = calculateStats(result, trimmedInput);
              
              // Check if decoded content is actually JSON
              if (isValidJSON(result)) {
                parsedContent = { type: 'json', data: result, mimeType: 'application/json' };
              } else {
                parsedContent = { type: 'text', data: result };
              }
            } catch {
              // Decode failed - show error
              parsedContent = { type: 'unknown', data: trimmedInput };
              result = '';
            }
          } else {
            // Unknown - show error
            parsedContent = { type: 'unknown', data: trimmedInput };
            result = '';
          }
        } catch {
          // Fallback error state
          parsedContent = { type: 'unknown', data: trimmedInput };
          result = '';
        }
      }

      return { output: result, stats, parsedContent };
    } catch {
      return { output: '', stats: null, parsedContent: null };
    }
  }, [input, mode]);

  const handleReset = useCallback(() => {
    setInput('');
    setMode('auto');
  }, []);

  if (!isMounted) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Mode Selector */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setMode('auto')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              mode === 'auto'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            title="Automatically detect whether input is text or Base64"
          >
            Auto Detect
          </button>
          <button
            onClick={() => setMode('encode')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              mode === 'encode'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            title="Force encode text to Base64"
          >
            Encode
          </button>
          <button
            onClick={() => setMode('decode')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              mode === 'decode'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            title="Force decode Base64 to text/image/JSON"
          >
            Decode
          </button>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium transition"
        >
          <FiRotateCcw className="w-4 h-4" />
          Clear
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {mode === 'encode' ? 'Text to Encode' : mode === 'decode' ? 'Base64 to Decode' : 'Input'}
          </h2>
          <Base64Input
            value={input}
            onInput={setInput}
            placeholder={
              mode === 'encode'
                ? 'Enter text, paste JSON, or upload any file...'
                : 'Paste Base64 encoded data here...'
            }
          />
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {mode === 'encode' ? 'Base64 Output' : 'Decoded Output'}
          </h2>
          {output ? (
            <OutputDisplay
              content={
                mode === 'encode'
                  ? {
                      type: 'base64-encoded',
                      data: output,
                      mimeType: 'text/plain',
                    }
                  : parsedContent || null
              }
            />
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg">
              Output will appear here
            </div>
          )}
        </div>
      </div>

      {/* Size Stats */}
      {stats && <SizeStats stats={stats} />}

      {/* Tips Section */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
        <h3 className="font-semibold text-gray-900 dark:text-white">Tips:</h3>
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
          <li>
            <strong>Auto Detect:</strong> Automatically determines if input is Base64 or plain text
          </li>
          <li>
            <strong>Image Preview:</strong> Base64 images are automatically detected and previewed
          </li>
          <li>
            <strong>JSON Formatting:</strong> Decoded JSON is automatically formatted for readability
          </li>
          <li>
            <strong>File Upload:</strong> Drag and drop any file to convert it to Base64
          </li>
          <li>
            <strong>Real-time:</strong> Conversion happens instantly as you type or paste
          </li>
          <li>
            <strong>Clipboard Helpers:</strong> Copy as Base64, Data URL, or HTML img tag
          </li>
        </ul>
      </div>
    </div>
  );
}
