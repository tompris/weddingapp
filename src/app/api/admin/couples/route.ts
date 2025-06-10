import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const couples = await prisma.couple.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(couples);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch couples' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, displayTitle } = await req.json();
    if (!name || !displayTitle) {
      return NextResponse.json({ error: 'Missing name or displayTitle' }, { status: 400 });
    }
    const couple = await prisma.couple.create({
      data: {
        name,
        displayTitle,
      },
    });
    return NextResponse.json(couple, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create couple' }, { status: 500 });
  }
} 