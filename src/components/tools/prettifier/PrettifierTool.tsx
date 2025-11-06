"use client";
import React, { useState } from 'react';
import { detectFormat, prettify, type DetectedFormat } from '../../../lib/prettifier';
import { useIsMounted } from '@/hooks/useIsMounted';

export default function PrettifierTool() {
  const [input, setInput] = useState('');
  const [detected, setDetected] = useState<DetectedFormat>('unknown');
  const [indent, setIndent] = useState(2);
  const [output, setOutput] = useState('');
  const isMounted = useIsMounted()

  function onAutoDetect() {
    const d = detectFormat(input || '');
    setDetected(d);
  }

  function onPrettify() {
    const fmt = detected === 'unknown' ? detectFormat(input || '') : detected;
    setDetected(fmt);
    const pretty = prettify(input || '', fmt, indent);
    setOutput(pretty);
  }

  function onClear() {
    setInput('');
    setOutput('');
    setDetected('unknown');
  }

  async function copyOutput() {
    try {
      await navigator.clipboard.writeText(output);
    } catch {
      // ignore
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 ">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Code Prettifier</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Paste your code, select format, and prettify it instantly
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-4 items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <button 
          onClick={onAutoDetect} 
          type="button"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Auto-Detect
        </button>
        <select 
          value={detected} 
          onChange={e => setDetected(e.target.value as DetectedFormat)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="unknown">Auto</option>
          <option value="json">JSON</option>
          <option value="html">HTML</option>
          <option value="xml">XML</option>
          <option value="css">CSS</option>
          <option value="csv">CSV</option>
        </select>
        <label className="flex gap-2 items-center">
          <span className="text-sm font-medium">Indent:</span>
          <input 
            type="number" 
            value={indent} 
            min={0} 
            max={8} 
            onChange={e => setIndent(Number(e.target.value))} 
            className="w-16 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
          />
        </label>
        <button 
          onClick={onPrettify} 
          type="button"
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
        >
          Prettify
        </button>
        <button 
          onClick={onClear} 
          type="button"
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
        >
          Clear
        </button>
        <div className="ml-auto text-sm">
          <span className="text-gray-500 dark:text-gray-400">Detected: </span>
          <span className="font-medium text-gray-700 dark:text-gray-300">{detected}</span>
        </div>
      </div>

      {/* Side-by-side layout */}
      {isMounted && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            Input
          </label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste your code here..."
            className="flex-1 min-h-[400px] p-4 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Output */}
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Output
            </label>
            <button 
              onClick={copyOutput} 
              disabled={!output}
              className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Copy Output
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Prettified output will appear here..."
            className="flex-1 min-h-[400px] p-4 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none"
          />
        </div>
      </div>
      )}
    </div>
  );
}
