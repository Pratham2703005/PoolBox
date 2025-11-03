'use client';

import React, { useMemo } from 'react';
import { FiRotateCcw } from 'react-icons/fi';
import { useIsMounted } from '@/hooks/useIsMounted';
import {
  convertNumberToAllBases,
  convertTextToAllEncodings,
} from '@/lib/converters/base-converter';
import { NumberInput } from './NumberInput';
import { NumberOutput } from './NumberOutput';
import { TextConverter } from './TextConverter';
import { ModeToggle } from './ModeToggle';
import { ReverseConverter } from './ReverseConverter';

export function BaseConverterTool() {
  const isMounted = useIsMounted();
  const [input, setInput] = React.useState('');
  const [base, setBase] = React.useState<2 | 8 | 10 | 16>(10);
  const [mode, setMode] = React.useState<'number' | 'text'>('number');

  const results = useMemo(() => {
    if (!input.trim()) {
      return { numberResults: null, textResults: null, error: null };
    }

    try {
      if (mode === 'number') {
        const numberResults = convertNumberToAllBases(input, base);
        return { numberResults, textResults: null, error: null };
      } else {
        const textResults = convertTextToAllEncodings(input);
        return { numberResults: null, textResults, error: null };
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Conversion failed';
      return { numberResults: null, textResults: null, error: errorMsg };
    }
  }, [input, base, mode]);

  const handleReset = () => {
    setInput('');
    setBase(10);
    setMode('number');
  };

  if (!isMounted) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between">
        <ModeToggle mode={mode} onModeChange={setMode} />

        {/* Reset Button */}
        <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium transition"
        >
            <FiRotateCcw className="w-4 h-4" />
            Clear
        </button>
      </div>

      {/* Main Content */}
      {mode === 'number' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Input</h2>
            <NumberInput
              value={input}
              base={base}
              onChange={setInput}
              onBaseChange={setBase}
              error={results.error}
            />
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Results</h2>
            {results.numberResults ? (
              <NumberOutput results={results.numberResults} originalInput={input} originalBase={base} />
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg">
                {results.error ? (
                  <p className="text-red-500">{results.error}</p>
                ) : (
                  <p>Enter a number to see conversions</p>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <TextConverter value={input} onChange={setInput} error={results.error} textResults={results.textResults} />
      )}

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">🔄 Additional Tools</h2>
        <ReverseConverter />
      </div>
    </div>
  );
}
