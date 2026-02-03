import { NextResponse } from 'next/server';

// Signup is disabled
export async function POST(request) {
  return NextResponse.json(
    { error: 'Signup is disabled' },
    { status: 403 }
  );
}
