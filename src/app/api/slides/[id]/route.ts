import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { deleteFromCloudinary } from '@/lib/cloudinary'
import { z } from 'zod'

const moveSchema = z.object({
  direction: z.enum(['up', 'down']),
})

// PATCH /api/slides/[id] — déplacer une image (ADMIN)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req, ['ADMIN'])
  if (auth instanceof NextResponse) return auth

  try {
    const { id } = await params
    const body = await req.json()
    const parsed = moveSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Direction invalide' }, { status: 400 })
    }

    const current = await prisma.heroSlide.findUnique({ where: { id } })
    if (!current) {
      return NextResponse.json({ error: 'Image introuvable' }, { status: 404 })
    }

    const { direction } = parsed.data

    const neighbour = await prisma.heroSlide.findFirst({
      where:
        direction === 'up'
          ? { position: { lt: current.position } }
          : { position: { gt: current.position } },
      orderBy: { position: direction === 'up' ? 'desc' : 'asc' },
    })

    if (!neighbour) {
      return NextResponse.json({ success: true })
    }

    await prisma.$transaction([
      prisma.heroSlide.update({
        where: { id: current.id },
        data: { position: neighbour.position },
      }),
      prisma.heroSlide.update({
        where: { id: neighbour.id },
        data: { position: current.position },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[SLIDE_PATCH]', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

// DELETE /api/slides/[id] — retirer une image (ADMIN)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req, ['ADMIN'])
  if (auth instanceof NextResponse) return auth

  try {
    const { id } = await params
    const slide = await prisma.heroSlide.findUnique({ where: { id } })

    if (!slide) {
      return NextResponse.json({ error: 'Image introuvable' }, { status: 404 })
    }

    await prisma.heroSlide.delete({ where: { id } })

    // Les images fournies avec le site n'ont pas de publicId Cloudinary :
    // on ne supprime donc que les fichiers réellement uploadés.
    if (slide.publicId) {
      try {
        await deleteFromCloudinary(slide.publicId, 'image')
      } catch (cloudinaryError) {
        console.error('[SLIDE_CLOUDINARY_DELETE]', cloudinaryError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[SLIDE_DELETE]', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
