import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';

export async function uploadFile(file: File, folder: string = 'uploads'): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Define upload directory
  const uploadDir = join(process.cwd(), 'public', folder);

  // Ensure directory exists
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (error) {
    // Ignore error if directory already exists
  }

  // Generate unique filename
  const timestamp = Date.now();
  const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const path = join(uploadDir, filename);

  // Save file
  await writeFile(path, buffer);

  // Return public URL path
  return `/${folder}/${filename}`;
}
