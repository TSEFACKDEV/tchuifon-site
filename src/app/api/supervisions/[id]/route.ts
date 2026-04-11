import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const updateSchema = z.object({
  studentName: z.string().optional(),
  level: z.enum(['INGENIEUR', 'MASTER_2', 'DOCTORAT', 'POST_DOC']).optional(),
  topic: z.string().optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'ABANDONED']).optional(),
  thesisUrl: z.string().optional(),
  publications: z.array(z.string()).optional(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supervision = await prisma.supervision.findUnique({ where: { id } })
    if (!supervision) return NextResponse.json({ error: 'Encadrement introuvable' }, { status: 404 })
    return NextResponse.json(supervision)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req, ['ADMIN'])
  if (auth instanceof NextResponse) return auth

  try {
    const { id } = await params
    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

    const { startDate, endDate, ...data } = parsed.data
    const supervision = await prisma.supervision.update({
      where: { id },
      data: {
        ...data,
        ...(startDate ? { startDate: new Date(startDate) } : {}),
        ...(endDate ? { endDate: new Date(endDate) } : {}),
      },
    })
    return NextResponse.json(supervision)
  } catch (error: any) {
    if (error.code === 'P2025') return NextResponse.json({ error: 'Encadrement introuvable' }, { status: 404 })
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req, ['ADMIN'])
  if (auth instanceof NextResponse) return auth

  try {
    const { id } = await params
    await prisma.supervision.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === 'P2025') return NextResponse.json({ error: 'Encadrement introuvable' }, { status: 404 })
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}