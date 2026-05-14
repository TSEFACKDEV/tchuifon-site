import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  code: z.string().optional(),
  level: z.enum(['LICENCE', 'MASTER', 'INGENIEUR', 'DOCTORAT']).optional(),
  description: z.string().optional(),
  credits: z.number().int().optional(),
  hours: z.number().int().optional(),
  semester: z.string().optional(),
  syllabus: z.string().optional(),
  objectives: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const course = await prisma.course.findUnique({ where: { id } })
    if (!course) return NextResponse.json({ error: 'Cours introuvable' }, { status: 404 })
    return NextResponse.json(course)
  } catch {
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
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const course = await prisma.course.update({ where: { id }, data: parsed.data })
    return NextResponse.json(course)
  } catch (err: unknown) {
    if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: string }).code === 'P2025')
      return NextResponse.json({ error: 'Cours introuvable' }, { status: 404 })
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
    await prisma.course.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: string }).code === 'P2025')
      return NextResponse.json({ error: 'Cours introuvable' }, { status: 404 })
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}