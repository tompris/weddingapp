import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: { coupleName: string } }) {
  try {
    const formData = await req.formData();
    const file = formData.get('photo') as File;
    const message = formData.get('message') as string;
    const attendeeName = formData.get('attendeeName') as string;
    const coupleName = params.coupleName;

    if (!file || !message || !attendeeName || !coupleName) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Ensure couple exists or create
    let couple = await prisma.couple.findUnique({ where: { name: coupleName } });
    if (!couple) {
      couple = await prisma.couple.create({ data: { name: coupleName } });
    }

    // Save file to /public/uploads/coupleName/
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', coupleName);
    await mkdir(uploadsDir, { recursive: true });
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = path.join(uploadsDir, fileName);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(arrayBuffer as ArrayBuffer));

    // Use sharp to resize the image
    const image = sharp(buffer);
    const metadata = await image.metadata();
    const longerEdge = Math.max(metadata.width || 0, metadata.height || 0);

    let resizedBuffer = buffer;
    if (longerEdge > 1500) {
      resizedBuffer = await image
        .resize({
          width: metadata.width && metadata.width >= metadata.height ? 1500 : undefined,
          height: metadata.height && metadata.height > metadata.width ? 1500 : undefined,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toBuffer();
    }

    await writeFile(filePath, resizedBuffer);

    // Store in DB
    const photo = await prisma.photo.create({
      data: {
        url: `/uploads/${coupleName}/${fileName}`,
        message,
        attendeeName,
        coupleId: couple.id,
      },
    });

    return NextResponse.json({ success: true, photo });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
} 