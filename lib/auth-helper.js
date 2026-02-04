import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { NextResponse } from 'next/server';

/**
 * Check if user is authenticated as admin
 * @returns {Promise<{session: object, user: object} | NextResponse>}
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'Unauthorized - Please login' },
      { status: 401 }
    );
  }

  if (session.user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden - Admin access required' },
      { status: 403 }
    );
  }

  return { session, user: session.user };
}

/**
 * Check if user is authenticated (any role)
 * @returns {Promise<{session: object, user: object} | NextResponse>}
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'Unauthorized - Please login' },
      { status: 401 }
    );
  }

  return { session, user: session.user };
}
