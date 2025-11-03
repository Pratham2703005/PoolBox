'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { UploadDropzone } from './UploadDropzone';
import { Preview } from './Preview';
import { CropData } from './crops/types';

export type ImageOptions = {
  toFormat: 'png' | 'jpeg' | 'webp' | 'svg' | 'ico' | string;
  quality: number; // 1-100
  width: number | null;
  height: number | null;
  crop: null | CropData;
  invertSelection?: boolean; // Global invert applied at conversion time
  originalFormat?: string;
};

export function ImageConverterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [options, setOptions] = useState<ImageOptions>({ toFormat: 'png', quality: 100, width: null, height: null, crop: null });
  const [loading, setLoading] = useState(false);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [estimatedSize, setEstimatedSize] = useState<number | null>(null);
  const [invertSelection, setInvertSelection] = useState(false);

  // Auto-clear crop when new image is uploaded
  useEffect(() => {
    // Clear crop whenever file changes (new upload)
    setOptions((prev) => ({ ...prev, crop: null }));
  }, [file]);

  const handleFile = (f: File) => {
    setFile(f);
    setConvertedUrl(null);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
    // auto-detect original mime/extension and store
    const mime = f.type || '';
    const extMatch = f.name.match(/\.([^.]+)$/);
    const ext = extMatch ? extMatch[1].toLowerCase() : '';
    setOptions((prev) => ({ ...prev, originalFormat: mime || ext }));
    setOriginalSize(f.size);
  };

  // Estimate resulting size using an in-browser canvas encode (works for jpeg/webp/png)
  const estimateSize = async (file: File, opts: ImageOptions) => {
    if (!file) return null;
    const toFormat = (opts.toFormat || 'png').toLowerCase();
    if (toFormat === 'svg' || toFormat === 'ico') return null; // estimation not supported for these

    // use createImageBitmap for more accurate pixel dimensions and orientation handling
    let bitmap: ImageBitmap | null = null;
    try {
      // modern browsers support passing File/Blob directly
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore createImageBitmap may not be available in some TS lib defs
      bitmap = await createImageBitmap(file as unknown as Blob);
  } catch {
      // fallback to Image object
      const dataUrl = await new Promise<string>((res, rej) => {
        const fr = new FileReader();
        fr.onload = () => res(String(fr.result));
        fr.onerror = rej;
        fr.readAsDataURL(file);
      });
      const img = await new Promise<HTMLImageElement>((res, rej) => {
        const image = new Image();
        image.onload = () => res(image);
        image.onerror = rej;
        image.src = dataUrl;
      });
      bitmap = await createImageBitmap(img);
    }

    if (!bitmap) return null;

    // Note: Size estimation doesn't account for complex crops (multi-region, circles, polygons, etc.)
    // It provides a rough estimate based on resize dimensions
    const sourceBitmap: ImageBitmap = bitmap as ImageBitmap;

    const origW = sourceBitmap.width;
    const origH = sourceBitmap.height;
    let targetW = opts.width || null;
    let targetH = opts.height || null;

    if (targetW && !targetH) {
      // compute H preserving aspect ratio
      targetH = Math.round((targetW / origW) * origH);
    } else if (!targetW && targetH) {
      targetW = Math.round((targetH / origH) * origW);
    } else if (!targetW && !targetH) {
      targetW = origW;
      targetH = origH;
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetW as number;
    canvas.height = targetH as number;
    const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  // enable high quality scaling
  ctx.imageSmoothingEnabled = true;
  // set high quality smoothing when available
  (ctx as CanvasRenderingContext2D & { imageSmoothingQuality?: 'low' | 'medium' | 'high' }).imageSmoothingQuality = 'high';
  // draw the (possibly cropped) image bitmap into canvas, letting the browser handle scaling
  ctx.drawImage(sourceBitmap as ImageBitmap, 0, 0, canvas.width, canvas.height);

    // For estimating PNG with reduced "quality" we approximate using webp encoding because
    // browser PNG encoders ignore the quality parameter. This gives a better estimate of final size
    // when the user reduces quality for PNG (server-side may use quantization/compression differently).
  const mime = toFormat === 'jpeg' || toFormat === 'jpg' ? 'image/jpeg' : toFormat === 'webp' ? 'image/webp' : 'image/png';
  let usedForEstimate = mime;
    if (mime === 'image/png' && (opts.quality ?? 100) < 100) {
      // approximate PNG quality-reduction with WebP estimation
      usedForEstimate = 'image/webp';
    }
  const quality = Math.max(0.01, Math.min(1, ((opts.quality ?? 100) as number) / 100));

    const blob = await new Promise<Blob | null>((resolve) => {
      // toBlob exists in browsers; use the mime we chose for estimation
  (canvas as HTMLCanvasElement & { toBlob?: (cb: (b: Blob | null) => void, type?: string, quality?: number | undefined) => void }).toBlob?.((b: Blob | null) => resolve(b), usedForEstimate, quality);
    });

    return blob ? blob.size : null;
  };

  // Recompute estimated size when file or relevant options change
  const optsKey = `${options.toFormat}-${options.quality}-${options.width || ''}-${options.height || ''}`;
  const cropKey = React.useMemo(() => JSON.stringify(options.crop || {}), [options.crop]);

  React.useEffect(() => {
    let mounted = true;
    if (!file) {
      setEstimatedSize(null);
      setOriginalSize(null);
      return;
    }

    setOriginalSize(file.size);
    estimateSize(file, options).then((s) => {
      if (!mounted) return;
      setEstimatedSize(s as number | null);
    }).catch(() => {
      if (!mounted) return;
      setEstimatedSize(null);
    });

    return () => { mounted = false; };
  }, [file, optsKey, cropKey, options]);

  const handleConvert = async () => {
    if (!file) return;
    setLoading(true);
    setConvertedUrl(null);
    try {
      // Include invertSelection in options sent to API
      const optionsWithInvert = { ...options, invertSelection };
      console.log('Converting with options:', optionsWithInvert);
      const fd = new FormData();
      fd.append('file', file);
      fd.append('options', JSON.stringify(optionsWithInvert));

      const res = await fetch('/api/image-convert', { method: 'POST', body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'failed' }));
        console.error('convert error - Status:', res.status, 'Error:', err);
        alert(`Conversion failed: ${err.error || 'Unknown error'}`);
        setLoading(false);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setConvertedUrl(url);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCrop = (crop: CropData) => {
    console.debug('Applying crop', crop);
    setOptions((prev) => ({ ...prev, crop }));
  };

  const handleClearCrop = () => {
    setOptions((prev) => ({ ...prev, crop: null }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="col-span-1">
        <Sidebar
          options={options}
          setOptions={setOptions}
          onConvert={handleConvert}
          loading={loading}
          originalSize={originalSize}
          estimatedSize={estimatedSize}
          invertSelection={invertSelection}
          setInvertSelection={setInvertSelection}
        />
      </div>
      <div className="col-span-1 lg:col-span-3 space-y-4">
        <UploadDropzone onFile={handleFile} accept="image/*" />
        <Preview 
          previewUrl={previewUrl} 
          convertedUrl={convertedUrl} 
          loading={loading} 
          onApplyCrop={handleApplyCrop} 
          onClearCrop={handleClearCrop}
          invertSelection={invertSelection}
          setInvertSelection={setInvertSelection}
        />
      </div>
    </div>
  );
}
