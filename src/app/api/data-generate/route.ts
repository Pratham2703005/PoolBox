import { NextRequest, NextResponse } from 'next/server';
import { generateData } from '@/lib/data-generator';
import type { GenerateDataRequest, GenerateDataResponse } from '@/types/data-generator';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateDataRequest = await request.json();
    
    const { fields, count, format } = body;

    // Validate input
    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      return NextResponse.json(
        { error: 'Please provide at least one field' } as GenerateDataResponse,
        { status: 400 }
      );
    }

    if (!count || count < 1 || count > 10000) {
      return NextResponse.json(
        { error: 'Count must be between 1 and 10000' } as GenerateDataResponse,
        { status: 400 }
      );
    }

    if (!format || !['json', 'csv', 'sql'].includes(format)) {
      return NextResponse.json(
        { error: 'Format must be json, csv, or sql' } as GenerateDataResponse,
        { status: 400 }
      );
    }

    // Generate data
    const data = generateData(fields, count, format);

    // For JSON format, parse the string to return actual JSON object
    if (format === 'json') {
      return NextResponse.json(
        JSON.parse(data),
        { status: 200 }
      );
    }

    // For CSV and SQL, return as string in data property
    return NextResponse.json(
      { data } as GenerateDataResponse,
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: errorMessage, data: '' } as GenerateDataResponse,
      { status: 500 }
    );
  }
}
