import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const courseSchema = z.object({
  title: z.string().min(1, 'Titre requis'),
  code: z.string().optional(),
  level: z.enum(['LICENCE', 'MASTER', 'INGENIEUR', 'DOCTORAT']).optional(),
  description: z.string().optional(),
  credits: z.number().int().optional(),
  hours: z.number().int().optional(),
  semester: z.string().optional(),
  syllabus: z.string().optional(),
  objectives: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const level = searchParams.get('level')
    const active = searchParams.get('active')

    const where: any = {}
    if (level) where.level = level
    if (active !== null) where.isActive = active === 'true'

    const courses = await prisma.course.findMany({
      where,
      orderBy: [{ level: 'asc' }, { title: 'asc' }],
    })

    return NextResponse.json({ data: courses })
  } catch (error) {
    console.error('[COURSES_GET]', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN'])
  if (auth instanceof NextResponse) return auth

  try {
    const body = await req.json()
    const parsed = courseSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const course = await prisma.course.create({
      data: { ...parsed.data, userId: auth.user.userId },
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error('[COURSES_POST]', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}