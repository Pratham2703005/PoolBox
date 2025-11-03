'use client';

import React, { useRef } from 'react';

type UploadDropzoneProps = { onFile: (f: File) => void; accept?: string };

export function UploadDropzone({ onFile, accept = 'image/*' }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
 
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    onFile(f);
  };

  return (
    <div>
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center" onClick={() => inputRef.current?.click()}>
        <p className="text-gray-600 dark:text-gray-400">Drag & drop an image here, or click to upload</p>
        <p className="text-sm text-gray-500 mt-2">Supported: jpg/jpeg, png, webp, svg, ico</p>
        
          <input ref={inputRef} type="file" accept={accept} onChange={(e) => handleFiles(e.target.files)} className="hidden" />
       
      </div>
    </div>
  );
}
