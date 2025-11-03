'use client';

import { useState } from 'react';

interface InputFormProps {
  onExtract: (figmaUrl: string, token: string) => void;
  loading: boolean;
}

export default function InputForm({ onExtract, loading }: InputFormProps) {
  const [figmaUrl, setFigmaUrl] = useState('');
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [errors, setErrors] = useState<{ url?: string; token?: string }>({});

  const validate = () => {
    const newErrors: { url?: string; token?: string } = {};

    if (!figmaUrl.trim()) {
      newErrors.url = 'Figma URL is required';
    } else if (
      !figmaUrl.includes('figma.com/file/') &&
      !figmaUrl.includes('figma.com/design/')
    ) {
      newErrors.url = 'Please enter a valid Figma file URL';
    }

    if (!token.trim()) {
      newErrors.token = 'Personal Access Token is required';
    } else if (token.length < 10) {
      newErrors.token = 'Token appears to be invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      onExtract(figmaUrl, token);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Figma URL Input */}
        <div>
          <label
            htmlFor="figma-url"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
          >
            🔗 Figma File URL
          </label>
          <input
            id="figma-url"
            type="url"
            value={figmaUrl}
            onChange={(e) => {
              setFigmaUrl(e.target.value);
              if (errors.url) setErrors({ ...errors, url: undefined });
            }}
            placeholder="https://www.figma.com/file/ABC123/Project-Name"
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.url
                ? 'border-red-300 dark:border-red-700'
                : 'border-slate-300 dark:border-slate-600'
            } bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors`}
            disabled={loading}
          />
          {errors.url && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.url}
            </p>
          )}
        </div>

        {/* Personal Access Token Input */}
        <div>
          <label
            htmlFor="pat"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
          >
            🔑 Personal Access Token
          </label>
          <div className="relative">
            <input
              id="pat"
              type={showToken ? 'text' : 'password'}
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                if (errors.token) setErrors({ ...errors, token: undefined });
              }}
              placeholder="figd_xxxxx..."
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.token
                  ? 'border-red-300 dark:border-red-700'
                  : 'border-slate-300 dark:border-slate-600'
              } bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors pr-12`}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              disabled={loading}
              aria-label={showToken ? 'Hide token' : 'Show token'}
            >
              {showToken ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.token && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.token}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span>
              Extracting...
            </>
          ) : (
            <>
              <span>🚀</span>
              Extract Components
            </>
          )}
        </button>
      </form>
    </div>
  );
}
