import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/stats — statistiques publiques du site
// ?dashboard=1 → inclut les données agrégées pour les graphes
export async function GET(req: NextRequest) {
  const dashboard = req.nextUrl.searchParams.get('dashboard') === '1'
  try {
    const [publications, courses, supervisions, collaborators] = await Promise.all([
      prisma.publication.count({ where: { isPublished: true } }),
      prisma.course.count({ where: { isActive: true } }),
      prisma.supervision.count(),
      prisma.collaborator.count(),
    ])

    if (!dashboard) {
      return NextResponse.json({ publications, courses, supervisions, collaborators })
    }

    // Données supplémentaires pour les graphes du dashboard
    const [pubByTypeRaw, supByLevelRaw, supByStatusRaw] = await Promise.all([
      prisma.publication.groupBy({ by: ['type'], _count: { _all: true } }),
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
