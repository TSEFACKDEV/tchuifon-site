import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const collaboratorSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  title: z.string().optional(),
  institution: z.string().optional(),
  department: z.string().optional(),
  country: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  photoUrl: z.string().optional(),
  researchArea: z.string().optional(),
  googleScholar: z.string().optional(),
  orcid: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const country = searchParams.get('country')

    const where: any = {}
    if (country) where.country = { contains: country, mode: 'insensitive' }

    const collaborators = await prisma.collaborator.findMany({
      where,
      include: {
        publications: {
          include: {
            publication: {
              select: { id: true, title: true, year: true, slug: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ data: collaborators })
  } catch (error) {
    console.error('[COLLABORATORS_GET]', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN'])
  if (auth instanceof NextResponse) return auth

  try {
    const body = await req.json()
    const parsed = collaboratorSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const collaborator = await prisma.collaborator.create({
      data: { ...parsed.data, userId: auth.user.userId },
    })

    return NextResponse.json(collaborator, { status: 201 })
  } catch (error) {
    console.error('[COLLABORATORS_POST]', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}