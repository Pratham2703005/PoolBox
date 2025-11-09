import { NextRequest, NextResponse } from 'next/server';
import { generateQRData, QRDataType } from '@/lib/qr-generator';

export const runtime = 'nodejs';

// Simple API key validation (in production, use environment variables and a database)
const VALID_API_KEYS = process.env.QR_API_KEYS?.split(',') || ['poolbox-qr'];

interface QRGenerateRequest {
  apiKey: string;
  type: QRDataType;
  data: Record<string, string>;
  options?: {
    width?: number;
    height?: number;
    margin?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    dotsOptions?: {
      color?: string;
      type?: 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'square' | 'extra-rounded';
      gradient?: {
        type: 'linear' | 'radial';
        rotation?: number;
        colorStops: Array<{ offset: number; color: string }>;
      };
    };
    backgroundOptions?: {
      color?: string;
      gradient?: {
        type: 'linear' | 'radial';
        rotation?: number;
        colorStops: Array<{ offset: number; color: string }>;
      };
    };
    cornersSquareOptions?: {
      color?: string;
      type?: 'dot' | 'square' | 'extra-rounded';
      gradient?: {
        type: 'linear' | 'radial';
        rotation?: number;
        colorStops: Array<{ offset: number; color: string }>;
      };
    };
    cornersDotOptions?: {
      color?: string;
      type?: 'dot' | 'square';
      gradient?: {
        type: 'linear' | 'radial';
        rotation?: number;
        colorStops: Array<{ offset: number; color: string }>;
      };
    };
    imageOptions?: {
      hideBackgroundDots?: boolean;
      imageSize?: number;
      margin?: number;
    };
    image?: string; // Base64 or URL
  };
  format?: 'svg' | 'png' | 'jpeg' | 'webp';
}

export async function POST(request: NextRequest) {
    
  try {
    const body: QRGenerateRequest = await request.json();

    // Validate API key
    if (!body.apiKey || !VALID_API_KEYS.includes(body.apiKey)) {
      return NextResponse.json(
        { 
          error: 'Invalid or missing API key',
          message: 'Please provide a valid API key in the request body'
        },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!body.type || !body.data) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          message: 'Please provide "type" and "data" fields'
        },
        { status: 400 }
      );
    }

    // Generate QR data
    const qrData = generateQRData(body.type, body.data);
    
    if (!qrData || qrData.length === 0) {
      return NextResponse.json(
        { 
          error: 'Invalid data',
          message: 'Could not generate QR code data from the provided input'
        },
        { status: 400 }
      );
    }

    // Check data length based on error correction level
    const errorLevel = body.options?.errorCorrectionLevel || 'M';
    const maxLength = { L: 2953, M: 2331, Q: 1663, H: 1273 };
    if (qrData.length > maxLength[errorLevel]) {
      return NextResponse.json(
        { 
          error: 'Data too long',
          message: `Data length (${qrData.length} chars) exceeds maximum for ${errorLevel} error correction (${maxLength[errorLevel]} chars)`,
          suggestion: 'Try reducing the data or increasing error correction level'
        },
        { status: 400 }
      );
    }

    // Import QRCodeStyling dynamically
    const QRCodeStyling = (await import('qr-code-styling')).default;

    // Build options
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const qrOptions: any = {
      width: body.options?.width || 300,
      height: body.options?.height || 300,
      data: qrData,
      margin: body.options?.margin ?? 10,
      qrOptions: {
        typeNumber: 0,
        mode: 'Byte' as const,
        errorCorrectionLevel: errorLevel,
      },
      imageOptions: {
        hideBackgroundDots: body.options?.imageOptions?.hideBackgroundDots ?? true,
        imageSize: body.options?.imageOptions?.imageSize ?? 0.4,
        crossOrigin: 'anonymous',
        margin: body.options?.imageOptions?.margin ?? 3,
      },
      dotsOptions: body.options?.dotsOptions || {
        color: '#000000',
        type: 'rounded',
      },
      backgroundOptions: body.options?.backgroundOptions || {
        color: '#ffffff',
      },
      cornersSquareOptions: body.options?.cornersSquareOptions || {
        color: '#000000',
        type: 'extra-rounded',
      },
      cornersDotOptions: body.options?.cornersDotOptions || {
        color: '#000000',
        type: 'dot',
      },
    };

    if (body.options?.image) {
      qrOptions.image = body.options.image;
    }

    // Generate QR code
    const qrCode = new QRCodeStyling(qrOptions);

    // Determine format
    const format = body.format || 'png';
    
    // Generate buffer based on format
    let buffer: Uint8Array;
    let contentType: string;

    if (format === 'svg') {
      const blob = await qrCode.getRawData('svg');
      if (!blob) {
        throw new Error('Failed to generate SVG');
      }
      const arrayBuffer = blob instanceof Blob ? await blob.arrayBuffer() : blob.buffer;
      buffer = new Uint8Array(arrayBuffer);
      contentType = 'image/svg+xml';
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = await qrCode.getRawData(format as any);
      if (!blob) {
        throw new Error(`Failed to generate ${format.toUpperCase()}`);
      }
      const arrayBuffer = blob instanceof Blob ? await blob.arrayBuffer() : blob.buffer;
      buffer = new Uint8Array(arrayBuffer);
      contentType = `image/${format}`;
    }

    // Return the QR code image
    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=3600',
        'X-QR-Data-Length': qrData.length.toString(),
        'X-QR-Type': body.type,
      },
    });

  } catch (error) {
    console.error('QR generation error:', error);
    return NextResponse.json(
      { 
        error: 'QR code generation failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// GET endpoint to show API info
export async function GET() {
  return NextResponse.json({
    name: 'QR Code Generator API',
    version: '1.0.0',
    description: 'Generate customizable QR codes with various styles and options',
    documentation: '/docs/qr-generator-api.md',
    endpoint: '/api/qr-generate',
    method: 'POST',
    authentication: 'API Key required',
    supportedFormats: ['png', 'svg', 'jpeg', 'webp'],
    supportedTypes: [
      'text', 'url', 'phone', 'email', 'sms', 'wifi', 
      'vcard', 'event', 'location', 'upi', 'social', 'appstore'
    ],
    exampleRequest: {
      apiKey: 'your-api-key',
      type: 'url',
      data: { url: 'https://example.com' },
      options: {
        width: 300,
        height: 300,
        errorCorrectionLevel: 'M',
        dotsOptions: {
          color: '#000000',
          type: 'rounded'
        }
      },
      format: 'png'
    }
  });
}
