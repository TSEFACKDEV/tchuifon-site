// src/app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req, ['ADMIN'])
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  // Interdire de supprimer l'admin principal
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  if (user.role === 'ADMIN') return NextResponse.json({ error: 'Impossible de supprimer l\'administrateur principal' }, { status: 403 })

  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ success: true })
}