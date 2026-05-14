import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/stats — statistiques publiques du site
export async function GET() {
  try {
    const [publications, courses, supervisions, collaborators] = await Promise.all([
      prisma.publication.count({ where: { isPublished: true } }),
      prisma.course.count({ where: { isActive: true } }),
      prisma.supervision.count(),
      prisma.collaborator.count(),
    ])

    return NextResponse.json({ publications, courses, supervisions, collaborators })
  } catch (error) {
    console.error('[STATS_GET]', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
