'use client';

import { useState } from 'react';
import axios from 'axios';
import { ExtractResponse } from '@/lib/figma/types';
import InputForm from './InputForm';
import ResultsDisplay from './ResultsDisplay';
import ProgressIndicator from './ProgressIndicator';

export default function FigmaExtractorTool() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractResponse | null>(null);
  const [progress, setProgress] = useState<{
    stage: string;
    message: string;
  }>({ stage: 'idle', message: 'Ready to extract' });

  const handleExtract = async (figmaUrl: string, token: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Update progress stages
      setProgress({ stage: 'connecting', message: 'Connecting to Figma API...' });

      const response = await axios.post<ExtractResponse>('/api/figma-extract', {
        figmaUrl,
        personalAccessToken: token,
      });

      if (response.data.success) {
        setProgress({ stage: 'complete', message: 'Extraction complete!' });
        setResult(response.data);
      } else {
        setError(response.data.error.message);
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const errorData = err.response.data as ExtractResponse;
        if (!errorData.success) {
          setError(errorData.error.message);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      setProgress({ stage: 'error', message: 'Error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            🎨 Figma to Next.js Code
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Extract Figma designs and convert to ready-to-use React/Tailwind
            components with asset URLs and raw design data
          </p>
        </div>

        {/* Input Form */}
        <div className="mb-8">
          <InputForm onExtract={handleExtract} loading={loading} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-200 mb-1">
                  Extraction Failed
                </h3>
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        {loading && <ProgressIndicator stage={progress.stage} message={progress.message} />}

        {/* Results Display */}
        {result && result.success && (
          <ResultsDisplay data={result.data} />
        )}

        {/* Help Section */}
        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
            <span>💡</span> How to Get Your Personal Access Token
          </h3>
          <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-2 list-decimal list-inside">
            <li>
              Go to{' '}
              <a
                href="https://www.figma.com/settings"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-600"
              >
                Figma Settings
              </a>
            </li>
            <li>Scroll to &quot;Personal access tokens&quot;</li>
            <li>Click &quot;Generate new token&quot;</li>
            <li>Give it a name and copy the token</li>
            <li>Paste it above and start extracting!</li>
          </ol>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-3">
            🔒 Your token is never stored and only used server-side for the API request.
          </p>
        </div>
      </div>
    </div>
  );
}
