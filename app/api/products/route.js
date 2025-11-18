import { NextResponse } from 'next/server';

export async function POST(request) {
  const data = await request.json();
  console.log('Received data:', data);
  
  return NextResponse.json({ 
    success: true,
    data: data 
  });
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Products API' 
  });
}