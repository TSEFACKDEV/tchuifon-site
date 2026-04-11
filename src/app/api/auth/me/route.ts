import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAccessToken } from '@/lib/jwt'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('access_token')?.value

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    let payload: { userId: string; role: string }
    try {
      payload = verifyAccessToken(token)
    } catch {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { profile: true },
    })

    if (!user) return NextResponse.json({ user: null }, { status: 200 })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    })
  } catch (error) {
    console.error('[ME]', error)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}