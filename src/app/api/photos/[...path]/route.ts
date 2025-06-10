import { NextRequest } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const filePath = path.join(process.cwd(), 'public', 'photos', ...params.path);
  if (!fs.existsSync(filePath)) {
    return new Response('Not found', { status: 404 });
  }
  const file = fs.readFileSync(filePath);
  // Infer content type from extension (basic)
  const ext = path.extname(filePath).toLowerCase();
  const contentType =
    ext === '.jpg' || ext === '.jpeg'
      ? 'image/jpeg'
      : ext === '.png'
      ? 'image/png'
      : ext === '.gif'
      ? 'image/gif'
      : 'application/octet-stream';
  return new Response(file, {
    headers: { 'Content-Type': contentType },
  });
} 