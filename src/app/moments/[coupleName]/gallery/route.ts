import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { coupleName: string } }) {
  try {
    const coupleName = params.coupleName;
    const couple = await prisma.couple.findUnique({
      where: { name: coupleName },
      include: {
        photos: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!couple) {
      return NextResponse.json({ photos: [] });
    }
    return NextResponse.json({ photos: couple.photos });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
} 