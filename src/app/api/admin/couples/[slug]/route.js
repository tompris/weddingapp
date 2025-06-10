import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, context) {
  const params = await context.params;
  const slug = params.slug;
  return NextResponse.json({ ok: true, slug });
}

export async function PATCH(request, context) {
  const params = await context.params;
  const slug = params.slug;
  try {
    const { displayTitle } = await request.json();
    const updated = await prisma.couple.update({
      where: { name: slug },
      data: { displayTitle },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to update couple' }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  const params = await context.params;
  const slug = params.slug;
  try {
    await prisma.couple.delete({ where: { name: slug } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to delete couple' }, { status: 500 });
  }
} 