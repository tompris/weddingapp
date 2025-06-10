import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();
const uploadsRoot = path.join(process.cwd(), 'public', 'uploads');

export const runtime = 'nodejs';

export async function GET() {
  return new Response('GET works');
}

export async function POST(request, context) {
  const params = await context.params;
  const coupleName = params.coupleName;
  try {
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file');
    const message = formData.get('message') || '';
    const attendeeName = formData.get('attendeeName') || '';

    // Logging for debugging
    console.log('FormData keys:', Array.from(formData.keys()));
    console.log('File type:', typeof file);
    if (file && typeof file !== 'string') {
      console.log('File name:', file.name);
      console.log('File size:', file.size);
      console.log('File type:', file.type);
    }
    console.log('Message:', message);
    console.log('AttendeeName:', attendeeName);
    console.log('CoupleName param:', coupleName);

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded', debug: { keys: Array.from(formData.keys()), fileType: typeof file, fileName: file?.name } }, { status: 400 });
    }

    // Ensure couple upload directory exists
    const coupleUploadDir = path.join(uploadsRoot, coupleName);
    await mkdir(coupleUploadDir, { recursive: true });

    // Generate a unique filename
    const ext = path.extname(file.name) || '.jpg';
    const filename = `${randomUUID()}${ext}`;
    const filepath = path.join(coupleUploadDir, filename);

    // Save the file
    const arrayBuffer = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(arrayBuffer));

    // Find the couple
    const couple = await prisma.couple.findUnique({ where: { name: coupleName } });
    if (!couple) {
      return NextResponse.json({ error: 'Couple not found', debug: { coupleName } }, { status: 404 });
    }

    // Create the photo record with the correct URL
    const photo = await prisma.photo.create({
      data: {
        url: `/uploads/${coupleName}/${filename}`,
        message: message.toString(),
        attendeeName: attendeeName.toString(),
        coupleId: couple.id,
      },
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to upload photo', stack: error.stack }, { status: 500 });
  }
} 