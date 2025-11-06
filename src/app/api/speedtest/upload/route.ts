export async function POST(request: Request) {
  const data = await request.arrayBuffer();
  // Just acknowledge receipt
  return Response.json({ 
    received: data.byteLength,
    status: 'ok' 
  });
}