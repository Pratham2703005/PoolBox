import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import sharp from 'sharp';

// Configure route for Node.js runtime (required for sharp)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Max execution time in seconds for Vercel

interface CropRect {
  type: 'rect';
  data: {
    regions: Array<{ left: number; top: number; width: number; height: number }>;
  };
}

interface CropCircle {
  type: 'circle';
  data: {
    regions: Array<{ cx: number; cy: number; r: number }>;
  };
}

interface CropPolygon {
  type: 'polygon';
  data: {
    regions: Array<Array<{ x: number; y: number }>>;
  };
}

interface CropMagic {
  type: 'magic';
  data: {
    regions: Array<Array<{ x: number; y: number }>>;
  };
}

interface CropMagicLegacy {
  type: 'magic';
  data: {
    points: Array<{ x: number; y: number }>;
    invert?: boolean; // Keep for legacy compatibility
  };
}

interface CropSelfie {
  type: 'selfie';
  data: {
    regions: Array<Array<{ x: number; y: number }>>;
  };
}

interface CropSAM {
  type: 'sam';
  data: {
    regions: Array<Array<{ x: number; y: number }>>;
  };
}

type CropDataSingle = CropRect | CropCircle | CropPolygon | CropMagic | CropMagicLegacy | CropSelfie | CropSAM;

interface CropMulti {
  type: 'multi';
  data: {
    crops: CropDataSingle[];
  };
}

type CropData = CropDataSingle | CropMulti;

interface ProcessOptions {
  toFormat?: 'png' | 'jpeg' | 'webp' | 'ico' | 'svg';
  quality?: number;
  width?: number | null;
  height?: number | null;
  resizeMode?: string;
  originalFormat?: string;
  crop?: CropData;
  invertSelection?: boolean; // Global invert applied to all crops at conversion time
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let fileBuffer: Buffer | null = null;
    let filename = 'image';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const options = formData.get('options') as string | null;

      if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

      filename = file.name || filename;
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);

      const opts = options ? JSON.parse(options) : {};
      return await processAndRespond(fileBuffer, opts, filename);
    }

    // If JSON with base64
    const body = await request.json().catch(() => null);
    if (body && body.image) {
      const matches = body.image.match(/^data:(.+);base64,(.+)$/);
      let buffer: Buffer;
      if (matches) {
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(body.image, 'base64');
      }
      fileBuffer = buffer;
      const opts = body.options || {};
      filename = body.filename || filename;
      return await processAndRespond(fileBuffer, opts, filename);
    }

    return NextResponse.json({ error: 'Unsupported content or missing image' }, { status: 400 });
  } catch (e) {
    console.error('image-convert error:', e);
    const errorMessage = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: errorMessage, details: String(e) }, { status: 500 });
  }
}

async function processAndRespond(fileBuffer: Buffer, opts: ProcessOptions, filename: string) {
  try {
    // options: { toFormat: 'png'|'jpeg'|'webp'|'ico'|'svg', quality: 80, width, height, resizeMode, crop: { type: 'rect'|'circle'|'polygon', data: ... } }
    const toFormat = (opts.toFormat || 'png').toLowerCase();
    const quality = typeof opts.quality === 'number' ? opts.quality : 80;
    const width = opts.width || null;
    const height = opts.height || null;

  // If the user requests PNG and the original was PNG and there are no transformations
  // (no resize, no crop) and quality is effectively 100, return the original buffer to avoid re-encoding
  const origFormat = (opts.originalFormat || '').toString().toLowerCase();
  const isOrigPng = origFormat === 'png' || origFormat === 'image/png';
  const noTransform = !opts.crop && !width && !height;
  if (toFormat === 'png' && isOrigPng && (quality >= 100) && noTransform) {
    return new NextResponse(new Uint8Array(fileBuffer), { status: 200, headers: { 'Content-Type': 'image/png', 'Content-Disposition': `attachment; filename="${filename.replace(/\.[^.]+$/, '')}.png"` } });
  }

  // Create sharp instance with special handling for SVG
  let image;
  const isOrigSvg = origFormat === 'svg' || origFormat === 'image/svg+xml' || origFormat.includes('svg');
  
  if (isOrigSvg) {
    // For SVG, limit the size to prevent huge rasterizations
    const MAX_SVG_SIZE = 2400;
    const svgDensity = 150; // DPI for rasterization
    
    image = sharp(fileBuffer, { 
      density: svgDensity,
      failOnError: false 
    });
    
    // Limit to max size if no specific dimensions requested
    if (!width && !height) {
      image = image.resize(MAX_SVG_SIZE, MAX_SVG_SIZE, { 
        fit: 'inside', 
        withoutEnlargement: true 
      });
    }
    
    console.log('image-convert: processing SVG with density', svgDensity, 'max size:', MAX_SVG_SIZE);
  } else {
    // For raster images, apply rotation to normalize orientation
    image = sharp(fileBuffer, { failOnError: false }).rotate();
  }

  // Cropping - all types now support multi-region via SVG masking
  if (opts.crop && (opts.crop.type === 'rect' || opts.crop.type === 'circle' || opts.crop.type === 'polygon' || opts.crop.type === 'magic' || opts.crop.type === 'selfie' || opts.crop.type === 'sam' || opts.crop.type === 'multi')) {
    // First, ensure the image has an alpha channel for masking to work
    image = image.ensureAlpha();
    
    const metadata = await image.metadata();
    const wMet = metadata.width || 100;
    const hMet = metadata.height || 100;

    console.log('image-convert: GLOBAL invertSelection =', opts.invertSelection);

    let maskBuffer = null;
    let extractBox = null;
    
    if (opts.crop.type === 'rect' && Array.isArray(opts.crop.data?.regions)) {
      // Multi-region rectangle crop
      const regions = opts.crop.data.regions;
      const isInverted = opts.invertSelection === true;
      console.log('image-convert: rect multi-region crop', regions.length, 'regions, inverted:', isInverted);
      
      if (isInverted) {
        // For inverted, use full image
        extractBox = { left: 0, top: 0, width: wMet, height: hMet };
        
        const rectsSVG = regions.map((r: { left: number; top: number; width: number; height: number }) => 
          `<rect x="${r.left}" y="${r.top}" width="${r.width}" height="${r.height}" fill="black"/>`
        ).join('');
        
        const maskSvg = `<svg width="${extractBox.width}" height="${extractBox.height}" xmlns="http://www.w3.org/2000/svg"><rect width="${extractBox.width}" height="${extractBox.height}" fill="white"/>${rectsSVG}</svg>`;
        maskBuffer = await sharp(Buffer.from(maskSvg)).png().toBuffer();
      } else {
        // Calculate bounding box of all rectangles
        const allPoints = regions.flatMap((r: { left: number; top: number; width: number; height: number }) => [
          { x: r.left, y: r.top },
          { x: r.left + r.width, y: r.top + r.height }
        ]);
        const xs = allPoints.map(p => p.x);
        const ys = allPoints.map(p => p.y);
        const minX = Math.max(0, Math.floor(Math.min(...xs)));
        const minY = Math.max(0, Math.floor(Math.min(...ys)));
        const maxX = Math.min(wMet, Math.ceil(Math.max(...xs)));
        const maxY = Math.min(hMet, Math.ceil(Math.max(...ys)));
        
        extractBox = { 
          left: minX, 
          top: minY, 
          width: Math.max(1, maxX - minX), 
          height: Math.max(1, maxY - minY) 
        };
        
        // Create SVG with all rectangles
        const rectsSVG = regions.map((r: { left: number; top: number; width: number; height: number }) => 
          `<rect x="${r.left - minX}" y="${r.top - minY}" width="${r.width}" height="${r.height}" fill="white"/>`
        ).join('');
        
        const maskSvg = `<svg width="${extractBox.width}" height="${extractBox.height}" xmlns="http://www.w3.org/2000/svg">${rectsSVG}</svg>`;
        maskBuffer = await sharp(Buffer.from(maskSvg)).png().toBuffer();
      }
      
    } else if (opts.crop.type === 'circle' && Array.isArray(opts.crop.data?.regions)) {
      // Multi-region circle crop
      const regions = opts.crop.data.regions;
      const isInverted = opts.invertSelection === true;
      console.log('image-convert: circle multi-region crop', regions.length, 'regions, inverted:', isInverted);
      
      if (isInverted) {
        // For inverted, use full image
        extractBox = { left: 0, top: 0, width: wMet, height: hMet };
        
        const circlesSVG = regions.map((c: { cx: number; cy: number; r: number }) => 
          `<circle cx="${c.cx}" cy="${c.cy}" r="${c.r}" fill="black"/>`
        ).join('');
        
        const maskSvg = `<svg width="${extractBox.width}" height="${extractBox.height}" xmlns="http://www.w3.org/2000/svg"><rect width="${extractBox.width}" height="${extractBox.height}" fill="white"/>${circlesSVG}</svg>`;
        maskBuffer = await sharp(Buffer.from(maskSvg)).png().toBuffer();
      } else {
        // Calculate bounding box of all circles
        const allPoints = regions.flatMap((c: { cx: number; cy: number; r: number }) => [
          { x: c.cx - c.r, y: c.cy - c.r },
          { x: c.cx + c.r, y: c.cy + c.r }
        ]);
        const xs = allPoints.map(p => p.x);
        const ys = allPoints.map(p => p.y);
        const minX = Math.max(0, Math.floor(Math.min(...xs)));
        const minY = Math.max(0, Math.floor(Math.min(...ys)));
        const maxX = Math.min(wMet, Math.ceil(Math.max(...xs)));
        const maxY = Math.min(hMet, Math.ceil(Math.max(...ys)));
        
        extractBox = { 
          left: minX, 
          top: minY, 
          width: Math.max(1, maxX - minX), 
          height: Math.max(1, maxY - minY) 
        };
        
        // Create SVG with all circles
        const circlesSVG = regions.map((c: { cx: number; cy: number; r: number }) => 
          `<circle cx="${c.cx - minX}" cy="${c.cy - minY}" r="${c.r}" fill="white"/>`
        ).join('');
        
        const maskSvg = `<svg width="${extractBox.width}" height="${extractBox.height}" xmlns="http://www.w3.org/2000/svg">${circlesSVG}</svg>`;
        maskBuffer = await sharp(Buffer.from(maskSvg)).png().toBuffer();
      }
      
    } else if (opts.crop.type === 'polygon' && Array.isArray(opts.crop.data?.regions)) {
      // Multi-region polygon crop
      const regions = opts.crop.data.regions;
      const isInverted = opts.invertSelection === true;
      console.log('image-convert: polygon multi-region crop', regions.length, 'regions, inverted:', isInverted);
      
      if (isInverted) {
        // For inverted, use full image
        extractBox = { left: 0, top: 0, width: wMet, height: hMet };
        
        const polygonsSVG = regions.map((region: Array<{ x: number; y: number }>) => {
          const points = region.map((p: { x: number; y: number }) => `${p.x},${p.y}`).join(' ');
          return `<polygon points="${points}" fill="black"/>`;
        }).join('');
        
        const maskSvg = `<svg width="${extractBox.width}" height="${extractBox.height}" xmlns="http://www.w3.org/2000/svg"><rect width="${extractBox.width}" height="${extractBox.height}" fill="white"/>${polygonsSVG}</svg>`;
        maskBuffer = await sharp(Buffer.from(maskSvg)).png().toBuffer();
      } else {
        const allPoints = regions.flat();
        const xs = allPoints.map((p: { x: number; y: number }) => p.x);
        const ys = allPoints.map((p: { x: number; y: number }) => p.y);
        const minX = Math.max(0, Math.floor(Math.min(...xs)));
        const minY = Math.max(0, Math.floor(Math.min(...ys)));
        const maxX = Math.min(wMet, Math.ceil(Math.max(...xs)));
        const maxY = Math.min(hMet, Math.ceil(Math.max(...ys)));
        
        extractBox = { 
          left: minX, 
          top: minY, 
          width: Math.max(1, maxX - minX), 
          height: Math.max(1, maxY - minY) 
        };
        
        // Create SVG with all polygons
        const polygonsSVG = regions.map((region: Array<{ x: number; y: number }>) => {
          const points = region.map((p: { x: number; y: number }) => 
            `${p.x - minX},${p.y - minY}`
          ).join(' ');
          return `<polygon points="${points}" fill="white"/>`;
        }).join('');
        
        const maskSvg = `<svg width="${extractBox.width}" height="${extractBox.height}" xmlns="http://www.w3.org/2000/svg">${polygonsSVG}</svg>`;
        maskBuffer = await sharp(Buffer.from(maskSvg)).png().toBuffer();
      }
      
    } else if (opts.crop.type === 'magic' && opts.crop.data && 'regions' in opts.crop.data && Array.isArray(opts.crop.data.regions)) {
      // Magic wand with multiple separate regions
      const isInverted = opts.invertSelection === true;
      const allPoints = opts.crop.data.regions.flat();
      const xs = allPoints.map((p: { x: number; y: number }) => p.x);
      const ys = allPoints.map((p: { x: number; y: number }) => p.y);
      const minX = Math.max(0, Math.floor(Math.min(...xs)));
      const minY = Math.max(0, Math.floor(Math.min(...ys)));
      const maxX = Math.min(wMet, Math.ceil(Math.max(...xs)));
      const maxY = Math.min(hMet, Math.ceil(Math.max(...ys)));
      
      if (isInverted) {
        extractBox = { left: 0, top: 0, width: wMet, height: hMet };
        const polygons = opts.crop.data.regions.map((region: Array<{ x: number; y: number }>) => {
          const points = region.map((p: { x: number; y: number }) => `${p.x},${p.y}`).join(' ');
          return `<polygon points="${points}" fill="black"/>`;
        }).join('');
        
        console.log('image-convert: inverted magic wand,', opts.crop.data.regions.length, 'regions');
        const maskSvg = `<svg width="${extractBox.width}" height="${extractBox.height}" xmlns="http://www.w3.org/2000/svg"><rect width="${extractBox.width}" height="${extractBox.height}" fill="white"/>${polygons}</svg>`;
        maskBuffer = await sharp(Buffer.from(maskSvg)).png().toBuffer();
      } else {
        extractBox = { left: minX, top: minY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY) };
        const polygons = opts.crop.data.regions.map((region: Array<{ x: number; y: number }>) => {
          const adjustedPoints = region.map((p: { x: number; y: number }) => `${p.x - minX},${p.y - minY}`).join(' ');
          return `<polygon points="${adjustedPoints}" fill="white"/>`;
        }).join('');
        
        console.log('image-convert: magic wand,', opts.crop.data.regions.length, 'regions');
        const maskSvg = `<svg width="${extractBox.width}" height="${extractBox.height}" xmlns="http://www.w3.org/2000/svg">${polygons}</svg>`;
        maskBuffer = await sharp(Buffer.from(maskSvg)).png().toBuffer();
      }
    } else if (opts.crop.type === 'magic' && opts.crop.data && 'points' in opts.crop.data && Array.isArray(opts.crop.data.points)) {
      // Legacy magic wand format (single flattened polygon) - kept for backwards compatibility
      const isInverted = opts.invertSelection === true;
      
      // Calculate bounding box of polygon
      const xs = opts.crop.data.points.map((p: { x: number; y: number }) => p.x);
      const ys = opts.crop.data.points.map((p: { x: number; y: number }) => p.y);
      const minX = Math.max(0, Math.floor(Math.min(...xs)));
      const minY = Math.max(0, Math.floor(Math.min(...ys)));
      const maxX = Math.min(wMet, Math.ceil(Math.max(...xs)));
      const maxY = Math.min(hMet, Math.ceil(Math.max(...ys)));
      
      if (isInverted) {
        // For inverted selection, use full image dimensions
        extractBox = {
          left: 0,
          top: 0,
          width: wMet,
          height: hMet
        };
        
        // Don't adjust points for inverted - use original coordinates
        const adjustedPoints = opts.crop.data.points.map((p: { x: number; y: number }) => 
          `${p.x},${p.y}`
        ).join(' ');
        
        // console.log('image-convert: inverted magic wand crop', { originalPoints: opts.crop.data.points, adjustedPoints, extractBox, wMet, hMet });
        const maskSvg = `<svg width="${extractBox.width}" height="${extractBox.height}" xmlns="http://www.w3.org/2000/svg"><rect width="${extractBox.width}" height="${extractBox.height}" fill="white"/><polygon points="${adjustedPoints}" fill="black"/></svg>`;
        
        // Convert SVG to PNG buffer for the mask
        maskBuffer = await sharp(Buffer.from(maskSvg)).png().toBuffer();
      } else {
        // Normal polygon/magic wand - extract to bounding box
        extractBox = { 
          left: minX, 
          top: minY, 
          width: Math.max(1, maxX - minX), 
          height: Math.max(1, maxY - minY) 
        };
        
        // Adjust polygon points relative to the bounding box
        const adjustedPoints = opts.crop.data.points.map((p: { x: number; y: number }) => 
          `${p.x - minX},${p.y - minY}`
        ).join(' ');
        
        // console.log('image-convert: polygon crop', { originalPoints: opts.crop.data.points, adjustedPoints, extractBox, wMet, hMet });
        const maskSvg = `<svg width="${extractBox.width}" height="${extractBox.height}" xmlns="http://www.w3.org/2000/svg"><polygon points="${adjustedPoints}" fill="white"/></svg>`;
        
        // Convert SVG to PNG buffer for the mask
        maskBuffer = await sharp(Buffer.from(maskSvg)).png().toBuffer();
      }
    } else if (opts.crop.type === 'selfie' && opts.crop.data && 'regions' in opts.crop.data && Array.isArray(opts.crop.data.regions)) {
      // Selfie segmentation with multiple separate regions (same logic as magic wand)
      const isInverted = opts.invertSelection === true;
      const allPoints = opts.crop.data.regions.flat();
      const xs = allPoints.map((p: { x: number; y: number }) => p.x);
      const ys = allPoints.map((p: { x: number; y: number }) => p.y);
      const minX = Math.max(0, Math.floor(Math.min(...xs)));
      const minY = Math.max(0, Math.floor(Math.min(...ys)));
      const maxX = Math.min(wMet, Math.ceil(Math.max(...xs)));
      const maxY = Math.min(hMet, Math.ceil(Math.max(...ys)));
      
      if (isInverted) {
        extractBox = { left: 0, top: 0, width: wMet, height: hMet };
        const polygons = opts.crop.data.regions.map((region: Array<{ x: number; y: number }>) => {
          const points = region.map((p: { x: number; y: number }) => `${p.x},${p.y}`).join(' ');
          return `<polygon points="${points}" fill="black"/>`;
        }).join('');
        
        console.log('image-convert: inverted selfie segmentation,', opts.crop.data.regions.length, 'regions');
        const maskSvg = `<svg width="${extractBox.width}" height="${extractBox.height}" xmlns="http://www.w3.org/2000/svg"><rect width="${extractBox.width}" height="${extractBox.height}" fill="white"/>${polygons}</svg>`;
        maskBuffer = await sharp(Buffer.from(maskSvg)).png().toBuffer();
      } else {
        extractBox = { left: minX, top: minY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY) };
        const polygons = opts.crop.data.regions.map((region: Array<{ x: number; y: number }>) => {
          const adjustedPoints = region.map((p: { x: number; y: number }) => `${p.x - minX},${p.y - minY}`).join(' ');
          return `<polygon points="${adjustedPoints}" fill="white"/>`;
        }).join('');
        
        console.log('image-convert: selfie segmentation,', opts.crop.data.regions.length, 'regions');
        const maskSvg = `<svg width="${extractBox.width}" height="${extractBox.height}" xmlns="http://www.w3.org/2000/svg">${polygons}</svg>`;
        maskBuffer = await sharp(Buffer.from(maskSvg)).png().toBuffer();
      }
    } else if (opts.crop.type === 'sam' && opts.crop.data && 'regions' in opts.crop.data && Array.isArray(opts.crop.data.regions)) {
      // SAM (Segment Anything Model) - Smart object selection with multiple separate regions
      const isInverted = opts.invertSelection === true;
      const allPoints = opts.crop.data.regions.flat();
      const xs = allPoints.map((p: { x: number; y: number }) => p.x);
      const ys = allPoints.map((p: { x: number; y: number }) => p.y);
      const minX = Math.max(0, Math.floor(Math.min(...xs)));
      const minY = Math.max(0, Math.floor(Math.min(...ys)));
      const maxX = Math.min(wMet, Math.ceil(Math.max(...xs)));
      const maxY = Math.min(hMet, Math.ceil(Math.max(...ys)));
      
      if (isInverted) {
        extractBox = { left: 0, top: 0, width: wMet, height: hMet };
        const polygons = opts.crop.data.regions.map((region: Array<{ x: number; y: number }>) => {
          const points = region.map((p: { x: number; y: number }) => `${p.x},${p.y}`).join(' ');
          return `<polygon points="${points}" fill="black"/>`;
        }).join('');
        
        console.log('image-convert: inverted SAM smart crop,', opts.crop.data.regions.length, 'regions');
        const maskSvg = `<svg width="${extractBox.width}" height="${extractBox.height}" xmlns="http://www.w3.org/2000/svg"><rect width="${extractBox.width}" height="${extractBox.height}" fill="white"/>${polygons}</svg>`;
        maskBuffer = await sharp(Buffer.from(maskSvg)).png().toBuffer();
      } else {
        extractBox = { left: minX, top: minY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY) };
        const polygons = opts.crop.data.regions.map((region: Array<{ x: number; y: number }>) => {
          const adjustedPoints = region.map((p: { x: number; y: number }) => `${p.x - minX},${p.y - minY}`).join(' ');
          return `<polygon points="${adjustedPoints}" fill="white"/>`;
        }).join('');
        
        console.log('image-convert: SAM smart crop,', opts.crop.data.regions.length, 'regions');
        const maskSvg = `<svg width="${extractBox.width}" height="${extractBox.height}" xmlns="http://www.w3.org/2000/svg">${polygons}</svg>`;
        maskBuffer = await sharp(Buffer.from(maskSvg)).png().toBuffer();
      }
    } else if (opts.crop.type === 'multi' && opts.crop.data && 'crops' in opts.crop.data && Array.isArray(opts.crop.data.crops)) {
      // Multi-mode crop - combine multiple crop types into one mask
      const isInverted = opts.invertSelection === true;
      console.log('image-convert: multi-mode crop with', opts.crop.data.crops.length, 'crop types, inverted:', isInverted);
      
      const allShapes: string[] = [];
      const allPoints: { x: number; y: number }[] = [];
      
      // Process each crop type and collect SVG shapes
      for (const crop of opts.crop.data.crops) {
        if (crop.type === 'rect' && Array.isArray(crop.data?.regions)) {
          crop.data.regions.forEach((r: { left: number; top: number; width: number; height: number }) => {
            allShapes.push(`<rect x="${r.left}" y="${r.top}" width="${r.width}" height="${r.height}" fill="${isInverted ? 'black' : 'white'}"/>`);
            allPoints.push({ x: r.left, y: r.top });
            allPoints.push({ x: r.left + r.width, y: r.top + r.height });
          });
        } else if (crop.type === 'circle' && Array.isArray(crop.data?.regions)) {
          crop.data.regions.forEach((c: { cx: number; cy: number; r: number }) => {
            allShapes.push(`<circle cx="${c.cx}" cy="${c.cy}" r="${c.r}" fill="${isInverted ? 'black' : 'white'}"/>`);
            allPoints.push({ x: c.cx - c.r, y: c.cy - c.r });
            allPoints.push({ x: c.cx + c.r, y: c.cy + c.r });
          });
        } else if (crop.type === 'polygon' && Array.isArray(crop.data?.regions)) {
          crop.data.regions.forEach((region: Array<{ x: number; y: number }>) => {
            const points = region.map((p: { x: number; y: number }) => `${p.x},${p.y}`).join(' ');
            allShapes.push(`<polygon points="${points}" fill="${isInverted ? 'black' : 'white'}"/>`);
            allPoints.push(...region);
          });
        } else if ((crop.type === 'magic' || crop.type === 'selfie' || crop.type === 'sam') && 'regions' in crop.data && Array.isArray(crop.data.regions)) {
          crop.data.regions.forEach((region: Array<{ x: number; y: number }>) => {
            const points = region.map((p: { x: number; y: number }) => `${p.x},${p.y}`).join(' ');
            allShapes.push(`<polygon points="${points}" fill="${isInverted ? 'black' : 'white'}"/>`);
            allPoints.push(...region);
          });
        }
      }
      
      if (allShapes.length > 0 && allPoints.length > 0) {
        if (isInverted) {
          // For inverted, use full image and create white background + black shapes
          extractBox = { left: 0, top: 0, width: wMet, height: hMet };
          const maskSvg = `<svg width="${extractBox.width}" height="${extractBox.height}" xmlns="http://www.w3.org/2000/svg"><rect width="${extractBox.width}" height="${extractBox.height}" fill="white"/>${allShapes.join('')}</svg>`;
          maskBuffer = await sharp(Buffer.from(maskSvg)).png().toBuffer();
        } else {
          // For non-inverted multi-mode, use full image dimensions and don't adjust coordinates
          // This ensures all shapes are rendered in their original positions
          extractBox = { left: 0, top: 0, width: wMet, height: hMet };
          const maskSvg = `<svg width="${extractBox.width}" height="${extractBox.height}" xmlns="http://www.w3.org/2000/svg">${allShapes.join('')}</svg>`;
          maskBuffer = await sharp(Buffer.from(maskSvg)).png().toBuffer();
        }
      }
    }

    if (maskBuffer && extractBox && extractBox.width > 0 && extractBox.height > 0) {
      // For inverted selections (global invertSelection=true), we already created the correct mask in SVG
      // so we keep the full image. For normal crops, we extract to the bounding box.
      const shouldKeepFullImage = opts.invertSelection === true;
      
      if (!shouldKeepFullImage) {
        console.log('image-convert: extracting to bounding box', extractBox);
        image = image.extract(extractBox);
      } else {
        console.log('image-convert: keeping full image for inverted selection');
      }
      
      // Convert both image and mask to raw buffers for pixel manipulation
      const imageBuffer = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const maskData = await sharp(maskBuffer).resize(extractBox.width, extractBox.height).greyscale().raw().toBuffer({ resolveWithObject: true });
      
      console.log('image-convert: applying mask via pixel manipulation', { 
        imageSize: imageBuffer.data.length, 
        maskSize: maskData.data.length,
        imageChannels: imageBuffer.info.channels,
        maskChannels: maskData.info.channels
      });
      
      // Apply mask by manipulating alpha channel
      const pixels = imageBuffer.data;
      const mask = maskData.data;
      
      // Image has 4 channels (RGBA), mask has 1 or 3 channels (greyscale)
      for (let i = 0; i < pixels.length; i += 4) {
        const maskIndex = Math.floor(i / 4) * maskData.info.channels;
        const maskValue = mask[maskIndex] || 0; // Use first channel of mask
        pixels[i + 3] = Math.floor((pixels[i + 3] * maskValue) / 255); // Apply mask to alpha
      }
      
      // Create new image from modified pixels
      image = sharp(pixels, {
        raw: {
          width: imageBuffer.info.width,
          height: imageBuffer.info.height,
          channels: 4
        }
      });
      
      console.log('image-convert: mask applied successfully via pixel manipulation');
    }
  }

  // Resize
  if (width || height) {
    const metadataBefore = await image.metadata();
    const origW = metadataBefore.width || null;
    const origH = metadataBefore.height || null;

    if (width && height) {
      // When both provided, resize to exact dimensions (stretch to fit). Choose kernel based on up/downscale.
      const willDownscale = (origW && origH) ? (origW > width || origH > height) : true;
      // Use a sharper kernel for downscaling and apply stronger sharpen for very small targets (icons)
      const kernel = willDownscale ? sharp.kernel.lanczos3 : sharp.kernel.cubic;
      image = image.resize(width, height, { fit: 'fill', kernel });
      if (willDownscale) {
        // apply a slightly stronger sharpen when the target is small to retain perceived detail
        if ((width && width <= 64) || (height && height <= 64)) {
          image = image.sharpen(1, 1, 2);
        } else {
          image = image.sharpen();
        }
      }
    } else {
      // If only one dimension provided, preserve aspect ratio and allow enlargement/shrink as needed
      const kernel = sharp.kernel.lanczos3;
      image = image.resize(width || null, height || null, { fit: 'inside', kernel });
      // apply sharpen when downscaling to compensate for softness
      const targetW = width || (height && origW && origH ? Math.round((height / origH) * origW) : null);
      const targetH = height || (width && origW && origH ? Math.round((width / origW) * origH) : null);
      if (origW && origH && targetW && targetH && (origW > targetW || origH > targetH)) {
        if ((targetW && targetW <= 64) || (targetH && targetH <= 64)) {
          image = image.sharpen(1, 1, 2);
        } else {
          image = image.sharpen();
        }
      }
    }
  }

  // Convert
  let outBuffer: Buffer;
  switch (toFormat) {
    case 'jpeg':
    case 'jpg':
      outBuffer = await image.jpeg({ quality }).toBuffer();
      return new NextResponse(new Uint8Array(outBuffer), { status: 200, headers: { 'Content-Type': 'image/jpeg', 'Content-Disposition': `attachment; filename="${filename.replace(/\.[^.]+$/, '')}.jpg"` } });
    case 'webp':
      outBuffer = await image.webp({ quality }).toBuffer();
      return new NextResponse(new Uint8Array(outBuffer), { status: 200, headers: { 'Content-Type': 'image/webp', 'Content-Disposition': `attachment; filename="${filename.replace(/\.[^.]+$/, '')}.webp"` } });
    case 'png':
      outBuffer = await image.png({ quality }).toBuffer();
      return new NextResponse(new Uint8Array(outBuffer), { status: 200, headers: { 'Content-Type': 'image/png', 'Content-Disposition': `attachment; filename="${filename.replace(/\.[^.]+$/, '')}.png"` } });
    case 'ico':
      // Sharp doesn't write ICO directly in some versions; output PNG and return with .ico filename (clients may not treat as true ICO). For best results, client can download PNG and use external tool for ICO.
      outBuffer = await image.resize(64, 64, { fit: 'cover' }).png({ quality }).toBuffer();
      return new NextResponse(new Uint8Array(outBuffer), { status: 200, headers: { 'Content-Type': 'image/x-icon', 'Content-Disposition': `attachment; filename="${filename.replace(/\.[^.]+$/, '')}.ico"` } });
    case 'svg':
      // Wrap raster image as embedded data URI inside a simple SVG. This does not vectorize the image.
      const pngBuffer = await image.png().toBuffer();
      const dataUri = `data:image/png;base64,${pngBuffer.toString('base64')}`;
      const svgWrap = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="${width || ''}" height="${height || ''}"><image href="${dataUri}"/></svg>`;
      return new NextResponse(svgWrap, { status: 200, headers: { 'Content-Type': 'image/svg+xml', 'Content-Disposition': `attachment; filename="${filename.replace(/\.[^.]+$/, '')}.svg"` } });
    default:
      outBuffer = await image.png({ quality }).toBuffer();
      return new NextResponse(new Uint8Array(outBuffer), { status: 200, headers: { 'Content-Type': 'image/png' } });
  }
  } catch (error) {
    console.error('processAndRespond error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Processing error';
    return NextResponse.json({ error: errorMessage, details: String(error) }, { status: 500 });
  }
}
