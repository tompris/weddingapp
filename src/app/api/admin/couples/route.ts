import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const couples = await prisma.couple.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json({ couples });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch couples' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, displayTitle } = await req.json();

    if (!name || !displayTitle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate name format (only lowercase letters and numbers)
    if (!/^[a-z0-9]+$/.test(name)) {
      return NextResponse.json(
        { error: 'Name can only contain lowercase letters and numbers' },
        { status: 400 }
      );
    }

    // Check if couple already exists
    const existingCouple = await prisma.couple.findUnique({
      where: { name },
    });

    if (existingCouple) {
      return NextResponse.json(
        { error: 'A couple with this name already exists' },
        { status: 400 }
      );
    }

    const couple = await prisma.couple.create({
      data: {
        name,
        displayTitle,
      },
    });

    return NextResponse.json({ couple });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create couple' }, { status: 500 });
  }
} 