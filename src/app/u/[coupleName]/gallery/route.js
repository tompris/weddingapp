import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, context) {
  const params = await context.params;
  const coupleName = params.coupleName;
  try {
    const couple = await prisma.couple.findUnique({
      where: { name: coupleName },
      include: { photos: { orderBy: { createdAt: 'desc' } } },
    });
    if (!couple) {
      return NextResponse.json({ error: 'Couple not found' }, { status: 404 });
    }
    // Always return an array, even if empty
    return NextResponse.json(Array.isArray(couple.photos) ? couple.photos : []);
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to fetch gallery' }, { status: 500 });
  }
} 