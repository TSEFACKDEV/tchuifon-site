import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// GET /api/stats — statistiques publiques du site
// ?dashboard=1 → données agrégées réservées à l'administration
export async function GET(req: NextRequest) {
  const dashboard = req.nextUrl.searchParams.get('dashboard') === '1'

  if (dashboard) {
    const auth = requireAuth(req, ['ADMIN'])
    if (auth instanceof NextResponse) return auth
  }

  try {
    // Le public ne voit que les contenus publiés/actifs.
    // Le dashboard, lui, doit refléter l'intégralité du contenu géré.
    const publicationWhere = dashboard ? {} : { isPublished: true }
    const courseWhere = dashboard ? {} : { isActive: true }

    const [publications, courses, supervisions, collaborators] = await Promise.all([
      prisma.publication.count({ where: publicationWhere }),
      prisma.course.count({ where: courseWhere }),
      prisma.supervision.count(),
      prisma.collaborator.count(),
    ])

    if (!dashboard) {
      return NextResponse.json({ publications, courses, supervisions, collaborators })
    }

    // Données supplémentaires pour les graphes du dashboard
    const [pubByTypeRaw, supByLevelRaw, supByStatusRaw] = await Promise.all([
      prisma.publication.groupBy({
        by: ['type'],
        where: publicationWhere,
        _count: { _all: true },
      }),
      prisma.supervision.groupBy({ by: ['level'], _count: { _all: true } }),
      prisma.supervision.groupBy({ by: ['status'], _count: { _all: true } }),
    ])

    const pubByType = Object.fromEntries(pubByTypeRaw.map(r => [r.type, r._count._all]))
    const supByLevel = Object.fromEntries(supByLevelRaw.map(r => [r.level ?? 'UNKNOWN', r._count._all]))
    const supByStatus = Object.fromEntries(supByStatusRaw.map(r => [r.status, r._count._all]))

    return NextResponse.json({ publications, courses, supervisions, collaborators, pubByType, supByLevel, supByStatus })
  } catch (error) {
    console.error('[STATS_GET]', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
