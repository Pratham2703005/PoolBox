'use client';

import React, { useState, useMemo } from 'react';
import { FiCopy } from 'react-icons/fi';
import { reverseHexToText, reverseBinaryToText } from '@/lib/converters/base-converter';

type ReverseMode = 'hex-to-text' | 'binary-to-text';

export function ReverseConverter() {
  const [mode, setMode] = useState<ReverseMode>('hex-to-text');
  const [input, setInput] = useState('');

  const { result, error } = useMemo(() => {
    if (!input.trim()) return { result: '', error: null };

    try {
      let converted = '';

      if (mode === 'hex-to-text') {
        converted = reverseHexToText(input);
      } else {
        converted = reverseBinaryToText(input);
      }

      return { result: converted, error: null };
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Conversion failed';
      return { result: '', error: errorMsg };
    }
  }, [input, mode]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-300 dark:border-gray-600">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        🔄 Reverse Converter
      </h3>

      {/* Mode Selector */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('hex-to-text')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
            mode === 'hex-to-text'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Hex → Text
        </button>
        <button
          onClick={() => setMode('binary-to-text')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
            mode === 'binary-to-text'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Binary → Text
        </button>
      </div>

      {/* Input/Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {mode === 'hex-to-text' ? 'Hex String' : 'Binary String'}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === 'hex-to-text'
                ? 'e.g., 48656C6C6F or 48 65 6C 6C 6F'
                : 'e.g., 0100100001100101 or 01001000 01100101'
            }
            className={`w-full h-32 px-3 py-2 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white ${
              error
                ? 'border-red-500 dark:border-red-400'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        {/* Output */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Text Output
          </label>
          <div className="relative">
            <textarea
              value={result}
              readOnly
              placeholder="Result will appear here"
              className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm resize-none dark:bg-gray-900 dark:text-white bg-gray-100"
            />
            {result && (
              <button
                onClick={() => copyToClipboard(result)}
                className="absolute top-2 right-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition"
                title="Copy"
              >
                <FiCopy className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-4 p-3 bg-white dark:bg-gray-900 rounded-lg text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
        {mode === 'hex-to-text' ? (
          <p>
            <strong>Hex to Text:</strong> Enter hex characters with or without spaces.
            (e.g., <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">48656C6C6F</code> {' = '}
            &quot;Hello&quot;)
          </p>
        ) : (
          <p>
            <strong>Binary to Text:</strong> Enter binary digits (8-bit groups recommended).
            (e.g., <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">01001000</code> {' = '}
            &quot;H&quot;)
          </p>
        )}
      </div>
    </div>
  );
}
