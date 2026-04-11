import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  abstract: z.string().optional(),
  authors: z.array(z.string()).optional(),
  journal: z.string().optional(),
  conference: z.string().optional(),
  publicationDate: z.string().optional(),
  year: z.number().int().optional(),
  volume: z.string().optional(),
  issue: z.string().optional(),
  pages: z.string().optional(),
  doi: z.string().optional(),
  pdfUrl: z.string().optional(),
  type: z.enum(['ARTICLE', 'CONFERENCE', 'BOOK_CHAPTER', 'THESIS', 'PATENT', 'POSTER']).optional(),
  keywords: z.array(z.string()).optional(),
  citations: z.number().int().optional(),
  isPublished: z.boolean().optional(),
  collaboratorIds: z.array(z.string()).optional(),
})

// GET /api/publications/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const publication = await prisma.publication.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        isPublished: true,
      },
      include: {
        collaborators: { include: { collaborator: true } },
      },
    })

    if (!publication) {
      return NextResponse.json({ error: 'Publication introuvable' }, { status: 404 })
    }

    return NextResponse.json(publication)
  } catch (error) {
    console.error('[PUBLICATION_GET_ONE]', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

// PUT /api/publications/[id] — ADMIN uniquement
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
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { collaboratorIds, publicationDate, ...data } = parsed.data

    // Mettre à jour les collaborateurs si fournis
    const collaboratorsUpdate = collaboratorIds !== undefined
      ? {
          collaborators: {
            deleteMany: {},
            create: collaboratorIds.map(cid => ({ collaboratorId: cid })),
          },
        }
      : {}

    const publication = await prisma.publication.update({
      where: { id },
      data: {
        ...data,
        ...(publicationDate ? { publicationDate: new Date(publicationDate) } : {}),
        ...collaboratorsUpdate,
      },
      include: {
        collaborators: { include: { collaborator: true } },
      },
    })

    return NextResponse.json(publication)
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Publication introuvable' }, { status: 404 })
    }
    console.error('[PUBLICATION_PUT]', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

// DELETE /api/publications/[id] — ADMIN uniquement
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req, ['ADMIN'])
  if (auth instanceof NextResponse) return auth

  try {
    const { id } = await params
    await prisma.publication.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Publication introuvable' }, { status: 404 })
    }
    console.error('[PUBLICATION_DELETE]', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}