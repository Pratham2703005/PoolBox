export async function POST(request: Request) {
  try {
    // Read the uploaded data
    const data = await request.arrayBuffer();
    
    // Just acknowledge receipt - this measures upload speed
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

// Add HEAD method support for API checking
export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
    }
  });
}

// Add GET method for health check
export async function GET() {
  return new Response(
    JSON.stringify({ status: 'ok', endpoint: 'upload' }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      }
    }
  );
}

// Add OPTIONS for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
