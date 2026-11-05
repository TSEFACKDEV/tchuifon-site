import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const profileSchema = z.object({
  fullName: z.string().optional(),
  title: z.string().optional(),
  bio: z.string().optional(),
  photoUrl: z.string().optional(),
  cvUrl: z.string().optional(),
  specializations: z.array(z.string()).optional(),
  degrees: z.array(z.string()).optional(),
  institution: z.string().optional(),
  department: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  officeLocation: z.string().optional(),
  googleScholar: z.string().optional(),
  researchGate: z.string().optional(),
  orcid: z.string().optional(),
  linkedin: z.string().optional(),
  website: z.string().optional(),
})

// GET /api/profile — public
export async function GET() {
  try {
    const profile = await prisma.profile.findFirst({
      include: {
        user: { select: { email: true, role: true } },
      },
    })

    if (!profile) return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 })
    return NextResponse.json(profile)
  } catch (error) {
    console.error('[PROFILE_GET]', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

// PUT /api/profile — ADMIN uniquement
export async function PUT(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN'])
  if (auth instanceof NextResponse) return auth

  try {
    const body = await req.json()
    const parsed = profileSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const profile = await prisma.profile.upsert({
      where: { userId: auth.user.userId },
      update: parsed.data,
      create: {
        userId: auth.user.userId,
        ...parsed.data,
        specializations: parsed.data.specializations ?? [],
        degrees: parsed.data.degrees ?? [],
      },
    })

    return NextResponse.json(profile)
  } catch (err: unknown) {
    if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: string }).code === 'P2025')
      return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 })
    console.error('[PROFILE_PUT]', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}