import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, context: { params: { coupleName: string } }) {
  try {
    const couple = await prisma.couple.findUnique({
      where: { name: context.params.coupleName },
    });

    if (!couple) {
      return NextResponse.json({ error: 'Couple not found' }, { status: 404 });
    }

    return NextResponse.json({ couple });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch couple' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: { params: { coupleName: string } }) {
  try {
    const { displayTitle } = await req.json();
    const couple = await prisma.couple.update({
      where: { name: context.params.coupleName },
      data: { displayTitle },
    });
    return NextResponse.json({ couple });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update couple' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: { coupleName: string } }) {
  try {
    await prisma.couple.delete({
      where: { name: context.params.coupleName },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete couple' }, { status: 500 });
  }
} 