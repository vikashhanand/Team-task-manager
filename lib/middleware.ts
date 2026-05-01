import { NextRequest } from 'next/server';
import { verifyToken, JWTPayload } from './auth';

export function getTokenFromRequest(request: NextRequest): JWTPayload | null {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;
  return verifyToken(token);
}
