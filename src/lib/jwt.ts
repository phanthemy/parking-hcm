import jwt from 'jsonwebtoken';

const SECRETS = [
  process.env.JWT_SECRET,
  'parking-hcm-secret-prod-2026',
  'parking-hcm-secret-key-2026'
].filter(Boolean) as string[];

const PRIMARY_SECRET = process.env.JWT_SECRET || 'parking-hcm-secret-prod-2026';

export function signToken(payload: object): string {
  return jwt.sign(payload, PRIMARY_SECRET, { expiresIn: '30d' } as jwt.SignOptions);
}

export function verifyToken(token: string): any {
  for (const secret of SECRETS) {
    try {
      const decoded = jwt.verify(token, secret);
      if (decoded) return decoded;
    } catch {
      // try next secret
    }
  }
  return null;
}
