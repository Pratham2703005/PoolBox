import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import QRCode from 'qrcode';
import sharp from 'sharp';
import { z } from 'zod';
import { generateQRData, QRDataType } from '@/lib/qr-generator';

export const runtime = 'nodejs';

const MAX_BODY_BYTES = 512 * 1024;

function loadApiKeys(): string[] {
  const fromEnv = process.env.QR_API_KEYS?.split(',').map((k) => k.trim()).filter(Boolean);
  if (fromEnv && fromEnv.length > 0) return fromEnv;
  // Dev/demo fallback only
  return ['poolbox-qr'];
}

function keyIsValid(candidate: string, keys: string[]): boolean {
  const candidateBuf = Buffer.from(candidate);
  let ok = false;
  for (const k of keys) {
    const keyBuf = Buffer.from(k);
    if (keyBuf.length !== candidateBuf.length) continue;
    if (timingSafeEqual(keyBuf, candidateBuf)) ok = true;
  }
  return ok;
}

const hexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, 'Expected #RGB, #RRGGBB, or #RRGGBBAA');

const dataSchema = z
  .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
  .transform((obj) => {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v === null || v === undefined) continue;
      out[k] = String(v);
    }
    return out;
  });

const requestSchema = z.object({
  apiKey: z.string().min(1, 'apiKey is required'),
  type: z.enum([
    'text', 'url', 'phone', 'email', 'sms', 'wifi',
    'vcard', 'event', 'location', 'upi', 'social', 'appstore',
  ]),
  data: dataSchema,
  options: z
    .object({
      width: z.number().int().min(64).max(2000).optional(),
      margin: z.number().int().min(0).max(50).optional(),
      errorCorrectionLevel: z.enum(['L', 'M', 'Q', 'H']).optional(),
      color: hexColor.optional(),
      backgroundColor: hexColor.optional(),
    })
    .optional(),
  format: z.enum(['svg', 'png', 'jpeg', 'webp']).optional(),
});

// Byte-mode capacity per error-correction level (conservative, QR v40 limits)
const BYTE_CAPACITY: Record<'L' | 'M' | 'Q' | 'H', number> = {
  L: 2953,
  M: 2331,
  Q: 1663,
  H: 1273,
};

export async function POST(request: NextRequest) {
  try {
    const contentLength = Number(request.headers.get('content-length') ?? '0');
    if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: 'Payload too large', message: `Body exceeds ${MAX_BODY_BYTES} bytes` },
        { status: 413 },
      );
    }

    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON', message: 'Request body must be valid JSON' },
        { status: 400 },
      );
    }

    const parsed = requestSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          issues: parsed.error.issues.map((i) => ({
            path: i.path.join('.') || '(root)',
            message: i.message,
          })),
        },
        { status: 400 },
      );
    }
    const { apiKey, type, data, options, format = 'png' } = parsed.data;

    if (!keyIsValid(apiKey, loadApiKeys())) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or missing API key' },
        { status: 401 },
      );
    }

    const payload = generateQRData(type as QRDataType, data);
    if (!payload) {
      return NextResponse.json(
        {
          error: 'Invalid data',
          message: `Could not build a QR payload for type "${type}". Check that required fields are present — see /apis/qr-generate docs.`,
        },
        { status: 400 },
      );
    }

    const ecLevel = options?.errorCorrectionLevel ?? 'M';
    const byteLen = Buffer.byteLength(payload, 'utf8');
    if (byteLen > BYTE_CAPACITY[ecLevel]) {
      return NextResponse.json(
        {
          error: 'Data too long',
          message: `Encoded payload (${byteLen} bytes) exceeds max ${BYTE_CAPACITY[ecLevel]} bytes for error-correction "${ecLevel}".`,
          suggestion: 'Lower the error-correction level or shorten the data.',
        },
        { status: 400 },
      );
    }

    const qrOpts: QRCode.QRCodeToBufferOptions & QRCode.QRCodeToStringOptions = {
      errorCorrectionLevel: ecLevel,
      margin: options?.margin ?? 2,
      width: options?.width ?? 300,
      color: {
        dark: options?.color ?? '#000000',
        light: options?.backgroundColor ?? '#ffffff',
      },
    };

    let body: Buffer;
    let contentType: string;

    if (format === 'svg') {
      const svg = await QRCode.toString(payload, { ...qrOpts, type: 'svg' });
      body = Buffer.from(svg, 'utf8');
      contentType = 'image/svg+xml';
    } else if (format === 'png') {
      body = await QRCode.toBuffer(payload, { ...qrOpts, type: 'png' });
      contentType = 'image/png';
    } else {
      const png = await QRCode.toBuffer(payload, { ...qrOpts, type: 'png' });
      if (format === 'jpeg') {
        body = await sharp(png)
          .flatten({ background: options?.backgroundColor ?? '#ffffff' })
          .jpeg({ quality: 92 })
          .toBuffer();
        contentType = 'image/jpeg';
      } else {
        body = await sharp(png).webp({ quality: 92 }).toBuffer();
        contentType = 'image/webp';
      }
    }

    return new NextResponse(new Uint8Array(body), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(body.length),
        'Cache-Control': 'no-store',
        'X-QR-Payload-Bytes': String(byteLen),
      },
    });
  } catch (error) {
    console.error('QR generation error:', error);
    return NextResponse.json(
      {
        error: 'QR code generation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function GET() {
  return NextResponse.json({
    name: 'QR Code Generator API',
    version: '2.0.0',
    description: 'Generate QR codes in PNG, JPEG, WebP, or SVG.',
    endpoint: '/api/qr-generate',
    method: 'POST',
    authentication: 'API Key in request body (field: "apiKey")',
    maxBodyBytes: MAX_BODY_BYTES,
    supportedFormats: ['png', 'svg', 'jpeg', 'webp'],
    supportedTypes: [
      'text', 'url', 'phone', 'email', 'sms', 'wifi',
      'vcard', 'event', 'location', 'upi', 'social', 'appstore',
    ],
    styling: {
      supported: ['width', 'margin', 'errorCorrectionLevel', 'color', 'backgroundColor'],
      note: 'Advanced styling (gradients, rounded dots, corner shapes) is available only in the in-browser QR generator tool, not over the API.',
    },
    exampleRequest: {
      apiKey: 'your-api-key',
      type: 'url',
      data: { url: 'https://example.com' },
      options: {
        width: 300,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: '#000000',
        backgroundColor: '#ffffff',
      },
      format: 'png',
    },
  });
}
