import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, context) {
  try {
    console.log('context:', context);
    const params = context?.params;
    const coupleName = params?.coupleName;
    if (!coupleName) {
      return NextResponse.json({ error: 'Missing coupleName param' }, { status: 400 });
    }
    const couple = await prisma.couple.findUnique({
      where: { name: coupleName },
      include: { photos: { orderBy: { createdAt: 'desc' } } },
    });
    if (!couple) {
      return NextResponse.json({ error: 'Couple not found' }, { status: 404 });
    }
    return NextResponse.json(Array.isArray(couple.photos) ? couple.photos : []);
  } catch (error) {
    console.error('Gallery GET error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch gallery' }, { status: 500 });
  }
} 