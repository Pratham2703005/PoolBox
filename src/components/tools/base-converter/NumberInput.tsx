'use client';
import React from 'react';
interface NumberInputProps {
  value: string;
  base: 2 | 8 | 10 | 16;
  onChange: (value: string) => void;
  onBaseChange: (base: 2 | 8 | 10 | 16) => void;
  error: string | null;
}

export function NumberInput({
  value,
  base,
  onChange,
  onBaseChange,
  error,
}: NumberInputProps) {
  

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.currentTarget.select();
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Base
          </label>
          <select
            value={base}
            onChange={(e) =>
              onBaseChange(parseInt(e.target.value) as 2 | 8 | 10 | 16)
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={2}>Binary (Base 2)</option>
            <option value={8}>Octal (Base 8)</option>
            <option value={10}>Decimal (Base 10)</option>
            <option value={16}>Hexadecimal (Base 16)</option>
          </select>
        </div>

       

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Number
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Enter a ${base}-base number...`}
          className={`w-full h-32 px-3 py-2 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white ${
            error
              ? 'border-red-500 dark:border-red-400'
              : 'border-gray-300 dark:border-gray-600'
          }`}
        />
      </div>

      {error && (
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
