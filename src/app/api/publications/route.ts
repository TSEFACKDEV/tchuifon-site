import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, getAuthUser } from '@/lib/auth'
import { z } from 'zod'
import slugify from 'slugify'

const publicationSchema = z.object({
  title: z.string().min(1, 'Titre requis'),
  abstract: z.string().optional(),
  authors: z.array(z.string()).min(1, 'Au moins un auteur'),
  journal: z.string().optional(),
  conference: z.string().optional(),
  publicationDate: z.string().optional(),
  year: z.number().int().optional(),
  volume: z.string().optional(),
  issue: z.string().optional(),
  pages: z.string().optional(),
  publisher: z.string().optional(),
  doi: z.string().optional(),
  isbn: z.string().optional(),
  issn: z.string().optional(),
  pdfUrl: z.string().optional(),
  type: z.enum(['ARTICLE', 'CONFERENCE', 'BOOK_CHAPTER', 'THESIS', 'PATENT', 'POSTER']).default('ARTICLE'),
  keywords: z.array(z.string()).default([]),
  isPublished: z.boolean().default(true),
  collaboratorIds: z.array(z.string()).default([]),
})

// GET /api/publications — liste avec filtres (admin voit tout, public voit published)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const year = searchParams.get('year')
    const keyword = searchParams.get('keyword')
    const all = searchParams.get('all') === 'true'
    const page = Math.max(1, Number(searchParams.get('page') ?? 1))
    const limit = Math.min(100, Number(searchParams.get('limit') ?? 10))
    const skip = (page - 1) * limit

    // Pour 'all=true', vérifier que c'est un admin authentifié
    const authUser = all ? getAuthUser(req) : null
    const isAdmin = all && authUser?.role === 'ADMIN'

    const where: Record<string, unknown> = isAdmin ? {} : { isPublished: true }
    if (type) where.type = type
    if (year) where.year = Number(year)
    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { keywords: { has: keyword } },
        { abstract: { contains: keyword, mode: 'insensitive' } },
      ]
    }

    const [publications, total] = await Promise.all([
      prisma.publication.findMany({
        where,
        include: {
          collaborators: {
            include: { collaborator: true },
          },
        },
        orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.publication.count({ where }),
    ])

    return NextResponse.json({
      data: publications,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('[PUBLICATIONS_GET]', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

// POST /api/publications — créer (ADMIN uniquement)
export async function POST(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN'])
  if (auth instanceof NextResponse) return auth

  try {
    const body = await req.json()
    const parsed = publicationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { collaboratorIds, publicationDate, ...data } = parsed.data

    // Générer un slug unique
    const baseSlug = slugify(data.title, { lower: true, strict: true })
    const year = data.year ?? new Date().getFullYear()
    let slug = `${baseSlug}-${year}`

    // Vérifier l'unicité du slug
    const existing = await prisma.publication.findUnique({ where: { slug } })
    if (existing) slug = `${slug}-${Date.now()}`

    const publication = await prisma.publication.create({
      data: {
        ...data,
        slug,
        userId: auth.user.userId,
        publicationDate: publicationDate ? new Date(publicationDate) : undefined,
        collaborators: {
          create: collaboratorIds.map(id => ({ collaboratorId: id })),
        },
      },
      include: {
        collaborators: { include: { collaborator: true } },
      },
    })

    return NextResponse.json(publication, { status: 201 })
  } catch (err: unknown) {
    if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: string }).code === 'P2002') {
      return NextResponse.json({ error: 'DOI ou slug déjà existant' }, { status: 409 })
    }
    console.error('[PUBLICATIONS_POST]', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}