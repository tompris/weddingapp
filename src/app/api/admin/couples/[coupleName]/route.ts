import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest, context: { params: { coupleName: string } }) {
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

export async function PATCH(request: NextRequest, context: { params: { coupleName: string } }) {
  try {
    const { displayTitle } = await request.json();
    const couple = await prisma.couple.update({
      where: { name: context.params.coupleName },
      data: { displayTitle },
    });
    return NextResponse.json({ couple });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update couple' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: { coupleName: string } }) {
  try {
    await prisma.couple.delete({
      where: { name: context.params.coupleName },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete couple' }, { status: 500 });
  }
} 