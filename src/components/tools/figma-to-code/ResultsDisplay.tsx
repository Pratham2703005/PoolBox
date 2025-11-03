'use client';

import { useState } from 'react';
import { ExtractResult } from '@/lib/figma/types';

interface ResultsDisplayProps {
  data: ExtractResult['data'];
}

export default function ResultsDisplay({ data }: ResultsDisplayProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const component = data.components[activeTab];
    if (component) {
      await navigator.clipboard.writeText(component.jsx);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadJSON = () => {
    const json = JSON.stringify(data.rawData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.metadata.fileName}-structure.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">✅ Extraction Complete!</h2>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span>📄</span>
            <span>{data.metadata.fileName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📦</span>
            <span>{data.metadata.totalPages} page(s)</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🖼️</span>
            <span>{data.metadata.totalAssets} asset(s)</span>
          </div>
          <div className="flex items-center gap-2">
            <span>⏱️</span>
            <span>{data.metadata.processingTime.toFixed(2)}s</span>
          </div>
        </div>
      </div>

      {/* Component Tabs */}
      {data.components.length > 1 && (
        <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <div className="flex overflow-x-auto">
            {data.components.map((component, index) => (
              <button
                key={component.nodeId}
                onClick={() => setActiveTab(index)}
                className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === index
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {component.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Code Display */}
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Generated Component
          </h3>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            {copied ? '✅ Copied!' : '📋 Copy Code'}
          </button>
        </div>

        <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-slate-100">
            <code>{data.components[activeTab]?.jsx}</code>
          </pre>
        </div>
      </div>

      {/* Download Section */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-6 bg-slate-50 dark:bg-slate-900">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          📥 Download Options
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDownloadJSON}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <span>📄</span>
            Download Structure JSON
          </button>

          {data.assets.length > 0 && (
            <button
              onClick={() => {
                data.assets.forEach((asset) => {
                  window.open(asset.url, '_blank');
                });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <span>🖼️</span>
              Open All Assets ({data.assets.length})
            </button>
          )}
        </div>

        <p className="mt-4 text-xs text-slate-600 dark:text-slate-400">
          ⚠️ Note: Figma asset URLs expire after ~14 days. Download or save them
          soon!
        </p>
      </div>
    </div>
  );
}
