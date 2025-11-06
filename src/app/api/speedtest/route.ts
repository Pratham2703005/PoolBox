export const runtime = 'nodejs';
export const maxDuration = 60;
export const maxBodySize = '10mb';
export async function POST(request: Request) {
  try {
    const data = await request.arrayBuffer();
    
    return new Response(
      JSON.stringify({ 
        received: data.byteLength,
        status: 'ok',
        timestamp: Date.now()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'Upload failed',
        status: 'error' 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}

export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    }
  });
}

export async function GET() {
  return new Response(
    JSON.stringify({ status: 'ok', endpoint: 'upload' }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      }
    }
  );
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-store',
    }
  });
}