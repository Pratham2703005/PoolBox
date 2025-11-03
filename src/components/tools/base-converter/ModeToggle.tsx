'use client';

import React from 'react';

interface ModeToggleProps {
  mode: 'number' | 'text';
  onModeChange: (mode: 'number' | 'text') => void;
}

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onModeChange('number')}
        className={`px-4 py-2 rounded-lg font-medium transition ${
          mode === 'number'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        Number
      </button>
      <button
        onClick={() => onModeChange('text')}
        className={`px-4 py-2 rounded-lg font-medium transition ${
          mode === 'text'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        Text
      </button>
    </div>
  );
}
