import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { FigmaClient } from '@/lib/figma/client';
import { TranslationEngine } from '@/lib/figma/translator';
import { ExtractResponse, ErrorCode } from '@/lib/figma/types';
import { ERROR_MESSAGES } from '@/lib/figma/constants';

// Request validation schema
const ExtractRequestSchema = z.object({
  figmaUrl: z
    .string()
    .url('Invalid URL format')
    .refine(
      (url) => url.includes('figma.com/file/') || url.includes('figma.com/design/'),
      'URL must be a valid Figma file link'
    ),
  personalAccessToken: z
    .string()
    .min(10, 'Token is too short')
    .refine(
      (token) => token.startsWith('figd_') || token.length > 20,
      'Invalid token format'
    ),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = ExtractRequestSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues;
      return NextResponse.json<ExtractResponse>(
        {
          success: false,
          error: {
            code: 'INVALID_URL',
            message: errors[0]?.message || 'Invalid request',
            details: { errors },
          },
        },
        { status: 400 }
      );
    }

    const { figmaUrl, personalAccessToken } = validationResult.data;

    // Initialize Figma client
    const client = new FigmaClient(personalAccessToken);

    // Parse file key from URL
    let fileKey: string;
    try {
      fileKey = client.parseFileKey(figmaUrl);
    } catch {
      return NextResponse.json<ExtractResponse>(
        {
          success: false,
          error: {
            code: 'INVALID_URL',
            message: ERROR_MESSAGES.INVALID_URL,
          },
        },
        { status: 400 }
      );
    }

    // Fetch file data from Figma
    let fileData;
    try {
      fileData = await client.getFile(fileKey);
    } catch (error) {
      return handleFigmaError(error);
    }

    // Translate Figma nodes to React components
    const translator = new TranslationEngine();
    const components = translator.translate(fileData);

    // TODO: Phase 4 - Asset URL generation
    // For now, return empty assets array
    const processingTime = (Date.now() - startTime) / 1000;

    return NextResponse.json<ExtractResponse>({
      success: true,
      data: {
        components,
        assets: [],
        rawData: fileData,
        metadata: {
          totalPages: fileData.document.children?.length || 0,
          totalAssets: 0,
          processingTime,
          fileName: fileData.name,
          lastModified: fileData.lastModified,
        },
      },
    });
  } catch (error) {
    console.error('Extraction error:', error);

    return NextResponse.json<ExtractResponse>(
      {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: ERROR_MESSAGES.UNKNOWN_ERROR,
          details: error instanceof Error ? { message: error.message } : undefined,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Handle Figma API errors
 */
function handleFigmaError(error: unknown): NextResponse<ExtractResponse> {
  if (error instanceof Error) {
    const errorWithCode = error as Error & { code?: ErrorCode; details?: unknown };
    const code = errorWithCode.code || 'API_ERROR';
    const message = error.message || ERROR_MESSAGES[code];

    const statusMap: Record<ErrorCode, number> = {
      INVALID_TOKEN: 401,
      INVALID_URL: 400,
      FILE_NOT_FOUND: 404,
      RATE_LIMIT: 429,
      NETWORK_ERROR: 503,
      TIMEOUT: 504,
      API_ERROR: 500,
      TRANSLATION_ERROR: 500,
      UNKNOWN_ERROR: 500,
    };

    return NextResponse.json<ExtractResponse>(
      {
        success: false,
        error: {
          code,
          message,
          details: errorWithCode.details as Record<string, unknown> | undefined,
        },
      },
      { status: statusMap[code] || 500 }
    );
  }

  return NextResponse.json<ExtractResponse>(
    {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: ERROR_MESSAGES.UNKNOWN_ERROR,
      },
    },
    { status: 500 }
  );
}
