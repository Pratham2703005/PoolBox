'use client';

import React, { useRef, useState } from 'react';
import { FiUploadCloud, FiFileText, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useIsMounted } from '@/hooks/useIsMounted';

interface FileUploadProps {
  onFileUpload: (content: string, fileName: string) => void;
  accepted?: string[];
  maxSize?: number; // in MB
}

export function FileUpload({
  onFileUpload,
  accepted = ['.csv', '.json', '.txt'],
  maxSize = 10,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number } | null>(null);
  const isMounted = useIsMounted();

  const processFile = (file: File) => {
    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      toast.error(`File is too large. Maximum size is ${maxSize}MB`);
      return;
    }

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!accepted.includes(fileExtension) && !accepted.includes(file.type)) {
      toast.error(`File type not supported. Accepted: ${accepted.join(', ')}`);
      return;
    }

    // Read file
    const reader = new FileReader();

    reader.onprogress = e => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 100);
        setUploadProgress(progress);
      }
    };

    reader.onload = e => {
      const content = e.target?.result as string;
      setUploadedFile({ name: file.name, size: file.size });
      setUploadProgress(100);
      onFileUpload(content, file.name);
      setTimeout(() => setUploadProgress(0), 1000);
    };

    reader.onerror = () => {
      toast.error('Failed to read file');
      setUploadProgress(0);
    };

    reader.readAsText(file);
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Clear uploaded file
  const clearFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="rounded-lg bg-gray-700 overflow-hidden">
      {uploadedFile ? (
        // Uploaded File Display
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiFileText className="text-blue-600" size={24} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">{uploadedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(uploadedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <button
              onClick={clearFile}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition"
            >
              <FiX size={20} />
            </button>
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600">Uploading...</span>
                <span className="text-xs font-medium text-gray-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {uploadProgress === 100 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
              ✓ File uploaded successfully!
            </div>
          )}
        </div>
      ) : (
        // Upload Area
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-8 cursor-pointer transition ${
            isDragging
              ? 'bg-gray-800 border-2 border-blue-400'
              : 'border-2 border-dashed border-gray-700 hover:border-gray-400 bg-gray-700'
          }`}
        >
          {isMounted && (
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept={accepted.join(',')}
              className="hidden"
              aria-label="File upload"
            />
          )}

          <div className="text-center">
            <div className="flex justify-center mb-3">
              <FiUploadCloud
                size={40}
                className={isDragging ? 'text-blue-600' : 'text-gray-100'}
              />
            </div>

            <h3 className="font-semibold text-gray-100 mb-1">
              {isDragging ? 'Drop file here' : 'Upload CSV or JSON file'}
            </h3>

            <p className="text-sm text-gray-300 mb-3">
              Drag and drop or click to browse
            </p>

            <p className="text-xs text-gray-200">
              Supported formats: {accepted.join(', ')} • Max size: {maxSize}MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
