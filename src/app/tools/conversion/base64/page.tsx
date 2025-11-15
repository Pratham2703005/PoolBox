import React from 'react';
import { Base64Converter } from '@/components/tools/base64/Base64Converter';

export const metadata = {
  title: 'Base64 Encoder/Decoder',
  description: 'Encode and decode Base64 with smart detection for images, JSON, and files. Real-time conversion with preview modes and clipboard helpers.',
};

export default function Base64Page() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="container max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🔐 Base64 Encoder/Decoder
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Encode and decode Base64 with smart detection for images, JSON, and files
          </p>
        </div>

       

        {/* Converter */}
        <Base64Converter />
      </div>
    </div>
  );
}
