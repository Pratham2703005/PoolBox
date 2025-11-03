'use client';

import React from 'react';
import { FiCopy } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { TextConversionResult } from '@/types/base-converter';

interface TextConverterProps {
  value: string;
  onChange: (value: string) => void;
  error: string | null;
  textResults: TextConversionResult | null;
}

export function TextConverter({
  value,
  onChange,
  error,
  textResults,
}: TextConverterProps) {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied!`);
    });
  };

  const copyAll = () => {
    if (!textResults) return;
    navigator.clipboard.writeText(JSON.stringify(textResults, null, 2)).then(() => {
      toast.success('All results copied!');
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Text Input</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Enter Text
          </label>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter any text to convert..."
            className={`w-full h-40 px-3 py-2 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white ${
              error
                ? 'border-red-500 dark:border-red-400'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          />
        </div>
        {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
      </div>

      {/* Output */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Text Encodings</h2>
        {textResults ? (
          <div className="space-y-2">
            {/* Base32 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-300 dark:border-gray-600">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Base32
                </label>
                <button
                  onClick={() => copyToClipboard(textResults.base32, 'Base32')}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
                  title="Copy"
                >
                  <FiCopy className="w-3 h-3" />
                </button>
              </div>
              <p className="font-mono text-xs text-gray-900 dark:text-white break-all overflow-hidden max-h-12">
                {textResults.base32}
              </p>
            </div>

            {/* Base58 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-300 dark:border-gray-600">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Base58
                </label>
                <button
                  onClick={() => copyToClipboard(textResults.base58, 'Base58')}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
                  title="Copy"
                >
                  <FiCopy className="w-3 h-3" />
                </button>
              </div>
              <p className="font-mono text-xs text-gray-900 dark:text-white break-all overflow-hidden max-h-12">
                {textResults.base58}
              </p>
            </div>

            {/* Base64 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-300 dark:border-gray-600">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Base64
                </label>
                <button
                  onClick={() => copyToClipboard(textResults.base64, 'Base64')}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
                  title="Copy"
                >
                  <FiCopy className="w-3 h-3" />
                </button>
              </div>
              <p className="font-mono text-xs text-gray-900 dark:text-white break-all overflow-hidden max-h-12">
                {textResults.base64}
              </p>
            </div>

            {/* ASCII */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-300 dark:border-gray-600">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  ASCII Codes
                </label>
                <button
                  onClick={() => copyToClipboard(textResults.ascii, 'ASCII')}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
                  title="Copy"
                >
                  <FiCopy className="w-3 h-3" />
                </button>
              </div>
              <p className="font-mono text-xs text-gray-900 dark:text-white break-all overflow-hidden max-h-12">
                {textResults.ascii}
              </p>
            </div>

            {/* UTF-8 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-300 dark:border-gray-600">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  UTF-8 Hex
                </label>
                <button
                  onClick={() => copyToClipboard(textResults.utf8, 'UTF-8')}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
                  title="Copy"
                >
                  <FiCopy className="w-3 h-3" />
                </button>
              </div>
              <p className="font-mono text-xs text-gray-900 dark:text-white break-all overflow-hidden max-h-12">
                {textResults.utf8}
              </p>
            </div>

            {/* Copy All */}
            <button
              onClick={copyAll}
              className="w-full px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg font-medium transition flex items-center justify-center gap-2 text-sm"
            >
              <FiCopy className="w-4 h-4" />
              Copy All as JSON
            </button>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg">
            {error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <p>Enter text to see all encodings</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
