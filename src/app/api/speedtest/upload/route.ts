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

// Add OPTIONS for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}