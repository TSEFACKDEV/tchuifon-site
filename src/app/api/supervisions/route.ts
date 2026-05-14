import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const supervisionSchema = z.object({
  studentName: z.string().min(1, 'Nom de l\'étudiant requis'),
  level: z.enum(['INGENIEUR', 'MASTER_2', 'DOCTORAT', 'POST_DOC']).optional(),
  topic: z.string().min(1, 'Sujet requis'),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'ABANDONED']).default('IN_PROGRESS'),
  thesisUrl: z.string().optional(),
  publications: z.array(z.string()).default([]),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const level = searchParams.get('level')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (level) where.level = level
    if (status) where.status = status

    const supervisions = await prisma.supervision.findMany({
      where,
      orderBy: [{ status: 'asc' }, { startDate: 'desc' }],
    })

    return NextResponse.json({ data: supervisions })
  } catch (error) {
    console.error('[SUPERVISIONS_GET]', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN'])
  if (auth instanceof NextResponse) return auth

  try {
    const body = await req.json()
    const parsed = supervisionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { startDate, endDate, ...data } = parsed.data

    const supervision = await prisma.supervision.create({
      data: {
        ...data,
        userId: auth.user.userId,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    })

    return NextResponse.json(supervision, { status: 201 })
  } catch (error) {
    console.error('[SUPERVISIONS_POST]', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}