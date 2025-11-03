'use client';

import React, { useState } from 'react';
import { FiCopy, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { BaseConversionResult } from '@/types/base-converter';
import { getBitExplanations, getByteGroups } from '@/lib/converters/base-converter';
import { HexColorPreview } from './HexColorPreview';
import { CodeSnippetGenerator } from './CodeSnippetGenerator';

interface NumberOutputProps {
  results: BaseConversionResult;
  originalInput: string;
  originalBase: 2 | 8 | 10 | 16;
}

export function NumberOutput({ results, originalInput, originalBase }: NumberOutputProps) {
  const [expandedExplanation, setExpandedExplanation] = useState(false);
  const [expandedBytes, setExpandedBytes] = useState(false);
  const [expandedSnippets, setExpandedSnippets] = useState(false);

  const [copyFormat, setCopyFormat] = useState<'json' | 'keyvalue'>('json');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied!`);
    });
  };

  const copyAll = () => {
    const allResults = {
      binary: results.binary,
      octal: results.octal,
      decimal: results.decimal,
      hex: results.hex,
    };

    let formatted = '';
    if (copyFormat === 'json') {
      formatted = JSON.stringify(allResults, null, 2);
    } else {
      formatted = Object.entries(allResults)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
    }

    navigator.clipboard.writeText(formatted).then(() => {
      toast.success(`All results copied as ${copyFormat === 'json' ? 'JSON' : 'key:value pairs'}!`);
    });
  };

  const bitExplanations = getBitExplanations(results.binary);
  const byteGroups = getByteGroups(results.binary);

  return (
    <div className="space-y-4">
      {/* Results Grid */}
      <div className="grid grid-cols-1 gap-3">
        {/* Binary */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-300 dark:border-gray-600">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Binary (Base 2)
            </label>
            <button
              onClick={() => copyToClipboard(results.binary, 'Binary')}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition flex items-center gap-1 text-sm"
            >
              <FiCopy className="w-4 h-4" />
              Copy
            </button>
          </div>
          <p className="font-mono text-gray-900 dark:text-white break-all">{results.binary}</p>
        </div>

        {/* Octal */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-300 dark:border-gray-600">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Octal (Base 8)
            </label>
            <button
              onClick={() => copyToClipboard(results.octal, 'Octal')}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition flex items-center gap-1 text-sm"
            >
              <FiCopy className="w-4 h-4" />
              Copy
            </button>
          </div>
          <p className="font-mono text-gray-900 dark:text-white break-all">{results.octal}</p>
        </div>

        {/* Decimal */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-300 dark:border-gray-600">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Decimal (Base 10)
            </label>
            <button
              onClick={() => copyToClipboard(results.decimal, 'Decimal')}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition flex items-center gap-1 text-sm"
            >
              <FiCopy className="w-4 h-4" />
              Copy
            </button>
          </div>
          <p className="font-mono text-gray-900 dark:text-white break-all">{results.decimal}</p>
        </div>

        {/* Hexadecimal */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-300 dark:border-gray-600">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Hexadecimal (Base 16)
            </label>
            <button
              onClick={() => copyToClipboard('0x' + results.hex, 'Hex with prefix')}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition flex items-center gap-1 text-sm"
            >
              <FiCopy className="w-4 h-4" />
              Copy
            </button>
          </div>
          <p className="font-mono text-gray-900 dark:text-white break-all">0x{results.hex}</p>
        </div>
      </div>

      {/* Copy Format Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setCopyFormat('json')}
          className={`flex-1 px-3 py-2 rounded-lg font-medium transition text-sm ${
            copyFormat === 'json'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          JSON
        </button>
        <button
          onClick={() => setCopyFormat('keyvalue')}
          className={`flex-1 px-3 py-2 rounded-lg font-medium transition text-sm ${
            copyFormat === 'keyvalue'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Key:Value
        </button>
      </div>

      {/* Copy All */}
      <button
        onClick={copyAll}
        className="w-full px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg font-medium transition flex items-center justify-center gap-2"
      >
        <FiCopy className="w-4 h-4" />
        Copy All ({copyFormat === 'json' ? 'JSON' : 'Key:Value'})
      </button>

      {/* Advanced Features Section */}
      <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
        {/* Hex Color Preview */}
        <HexColorPreview hex={`#${results.hex}`} />

        {/* Binary Explanation */}
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedExplanation(!expandedExplanation)}
            className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center justify-between"
          >
            <span className="font-medium text-gray-900 dark:text-white">
              📊 Bit Explanation
            </span>
            {expandedExplanation ? (
              <FiChevronUp className="w-5 h-5" />
            ) : (
              <FiChevronDown className="w-5 h-5" />
            )}
          </button>
          {expandedExplanation && (
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-300 dark:border-gray-600">
              <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                {bitExplanations.map((bit) => (
                  <div
                    key={bit.position}
                    className={`px-2 py-1 rounded border ${
                      bit.isSet
                        ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-100'
                        : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-500'
                    }`}
                  >
                    <div>2^{bit.power} = {bit.decimal}</div>
                    <div className="text-xs opacity-75">{bit.binary}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm text-gray-700 dark:text-gray-300">
                <strong>Sum:</strong> {bitExplanations.filter(b => b.isSet).map(b => b.decimal).join(' + ')} = {results.decimal}
              </div>
            </div>
          )}
        </div>

        {/* Byte Visualizer */}
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedBytes(!expandedBytes)}
            className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center justify-between"
          >
            <span className="font-medium text-gray-900 dark:text-white">
              💾 Byte Visualizer
            </span>
            {expandedBytes ? (
              <FiChevronUp className="w-5 h-5" />
            ) : (
              <FiChevronDown className="w-5 h-5" />
            )}
          </button>
          {expandedBytes && (
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-300 dark:border-gray-600">
              <div className="space-y-2">
                {byteGroups.map((group, idx) => (
                  <div key={idx} className="flex gap-2 items-center font-mono text-sm">
                    <div className="flex-1 flex items-center gap-2">
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 px-2 py-1 rounded font-mono">
                        {group.byte}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">→</span>
                      <span>Dec: <strong>{group.decimal}</strong></span>
                      <span className="text-gray-600 dark:text-gray-400">→</span>
                      <span>Hex: <strong>0x{group.hex}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Code Snippets Dropdown */}
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedSnippets(!expandedSnippets)}
            className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center justify-between"
          >
            <span className="font-medium text-gray-900 dark:text-white">
              💻 Code Snippets
            </span>
            {expandedSnippets ? (
              <FiChevronUp className="w-5 h-5" />
            ) : (
              <FiChevronDown className="w-5 h-5" />
            )}
          </button>
          {expandedSnippets && (
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-300 dark:border-gray-600">
              <CodeSnippetGenerator originalInput={originalInput} originalBase={originalBase} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
