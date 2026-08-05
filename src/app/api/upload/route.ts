import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/upload';
import { authMiddleware } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Only allow image files for safety
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    const url = await uploadFile(file);

    return NextResponse.json({ url }, { status: 201 });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
