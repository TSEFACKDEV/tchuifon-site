import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().optional(),
  title: z.string().optional(),
  institution: z.string().optional(),
  department: z.string().optional(),
  country: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().optional(),
  photoUrl: z.string().optional(),
  researchArea: z.string().optional(),
  googleScholar: z.string().optional(),
  orcid: z.string().optional(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const collaborator = await prisma.collaborator.findUnique({
      where: { id },
      include: {
        publications: { include: { publication: true } },
      },
    })
    if (!collaborator) return NextResponse.json({ error: 'Collaborateur introuvable' }, { status: 404 })
    return NextResponse.json(collaborator)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

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
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

    const collaborator = await prisma.collaborator.update({ where: { id }, data: parsed.data })
    return NextResponse.json(collaborator)
  } catch (error: any) {
    if (error.code === 'P2025') return NextResponse.json({ error: 'Collaborateur introuvable' }, { status: 404 })
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req, ['ADMIN'])
  if (auth instanceof NextResponse) return auth

  try {
    const { id } = await params
    await prisma.collaborator.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === 'P2025') return NextResponse.json({ error: 'Collaborateur introuvable' }, { status: 404 })
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}