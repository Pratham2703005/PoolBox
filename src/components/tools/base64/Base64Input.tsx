'use client';

import React, { useRef, useState } from 'react';
import { FiUploadCloud } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { fileToBase64 } from '@/lib/converters/base64';

interface Base64InputProps {
  onInput: (content: string) => void;
  placeholder?: string;
  value?: string;
}

export function Base64Input({ onInput, placeholder, value = '' }: Base64InputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleTextInput = (text: string) => {
    onInput(text);
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    try {
      // For text-based files, read as text
      // For binary files, read as Base64
      const isTextFile = 
        file.type.startsWith('text/') ||
        file.type === 'application/json' ||
        /\.(js|ts|tsx|jsx|json|txt|csv|xml|html|css)$/i.test(file.name);

      let content: string;
      if (isTextFile) {
        // Read text files as plain text
        content = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsText(file);
        });
      } else {
        // Read binary files as Base64
        content = await fileToBase64(file);
      }

      onInput(content);
      toast.success(`File "${file.name}" loaded`);
    } catch {
      toast.error('Failed to load file');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Text Input Area */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Input
        </label>
        <textarea
          value={value}
          onChange={(e) => handleTextInput(e.target.value)}
          placeholder={placeholder || 'Paste Base64, text, or JSON here...'}
          className="w-full h-40 p-4 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* File Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-2">
          <FiUploadCloud className="w-8 h-8 text-gray-400" />
          <div>
            <p className="font-medium text-gray-700 dark:text-gray-300">
              Drag files here or click to select
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Any file type supported (images, documents, etc.)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
