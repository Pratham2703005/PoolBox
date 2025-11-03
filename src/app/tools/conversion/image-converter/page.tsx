import React from 'react';
import { ImageConverterTool } from '@/components/tools/image-converter/ImageConverterTool';

export default function ImageConverterPage() {

  return ( 
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4">Image Format Converter</h1>
         <ImageConverterTool />
      </div>
    </div>
  )
}
