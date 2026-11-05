import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const slideSchema = z.object({
  imageUrl: z.string().url('URL d’image invalide'),
  publicId: z.string().optional(),
})

// GET /api/slides — carrousel public
export async function GET() {
  try {
    const slides = await prisma.heroSlide.findMany({
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
      select: { id: true, imageUrl: true, position: true },
    })

    return NextResponse.json({ data: slides })
  } catch (error) {
    console.error('[SLIDES_GET]', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

// POST /api/slides — ajouter une image (ADMIN)
export async function POST(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN'])
  if (auth instanceof NextResponse) return auth

  try {
    const body = await req.json()
    const parsed = slideSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const lastSlide = await prisma.heroSlide.findFirst({
      orderBy: { position: 'desc' },
      select: { position: true },
    })

    const slide = await prisma.heroSlide.create({
      data: {
        imageUrl: parsed.data.imageUrl,
        publicId: parsed.data.publicId,
        position: (lastSlide?.position ?? -1) + 1,
      },
    })

    return NextResponse.json(slide, { status: 201 })
  } catch (error) {
    console.error('[SLIDES_POST]', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
