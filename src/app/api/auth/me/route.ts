import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { verifyAccessToken } from '@/lib/jwt'
import { rotateRefreshToken, setAuthCookies, type AuthTokens } from '@/lib/session'

async function loadUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  })
}

function toPublicUser(user: NonNullable<Awaited<ReturnType<typeof loadUser>>>) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    profile: user.profile,
  }
}

export async function GET(req: NextRequest) {
  try {
    // 1. Access token valide (cookie ou header Authorization pour les tests API)
    const authUser = getAuthUser(req)

    if (authUser) {
      const user = await loadUser(authUser.userId)
      return NextResponse.json({ user: user ? toPublicUser(user) : null })
    }

    // 2. Access token expiré : on tente une rotation transparente du refresh token
    let tokens: AuthTokens | null = null

    try {
      tokens = await rotateRefreshToken(req)
    } catch (error) {
      console.error('[ME_REFRESH]', error)
    }

    if (!tokens) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const payload = verifyAccessToken(tokens.accessToken)
    const user = await loadUser(payload.userId)

    const response = NextResponse.json({
      user: user ? toPublicUser(user) : null,
    })

    return setAuthCookies(response, tokens)
  } catch (error) {
    console.error('[ME]', error)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
