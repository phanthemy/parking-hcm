import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'parking-hcm-secret-key-2026';

export function signToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' } as jwt.SignOptions);
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
