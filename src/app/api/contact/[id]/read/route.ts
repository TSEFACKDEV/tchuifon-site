// src/app/api/contact/[id]/read/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req, ['ADMIN'])
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  await prisma.contactMessage.update({ where: { id }, data: { isRead: true } })
  return NextResponse.json({ success: true })
}