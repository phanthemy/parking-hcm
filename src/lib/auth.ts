import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';

export async function authMiddleware(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Unauthorized', status: 401 };
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return { error: 'Invalid token', status: 401 };
  }

  return { user: decoded as any, status: 200 };
}

export async function requireRole(req: NextRequest, roles: string[]) {
  const authResult = await authMiddleware(req);
  if (authResult.error) {
    return authResult;
  }

  if (!roles.includes(authResult.user.role)) {
    return { error: 'Forbidden', status: 403 };
  }

  return authResult;
}
