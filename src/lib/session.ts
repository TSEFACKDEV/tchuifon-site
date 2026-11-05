import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '@/lib/jwt'

export type AuthTokens = {
  accessToken: string
  refreshToken: string
}

/**
 * Vérifie le refresh token, le révoque et en émet un nouveau couple
 * access/refresh (rotation). Retourne `null` si la session n'est plus valide.
 */
export async function rotateRefreshToken(
  req: NextRequest
): Promise<AuthTokens | null> {
  const token = req.cookies.get('refresh_token')?.value
  if (!token) return null

  try {
    verifyRefreshToken(token)
  } catch {
    return null
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!stored || stored.expiresAt <= new Date()) {
    if (stored) {
      await prisma.refreshToken.deleteMany({ where: { token } })
    }
    return null
  }

  // Rotation : l'ancien token ne peut plus être réutilisé.
  // Le deleteMany conditionnel évite qu'une requête concurrente réutilise le même token.
  const deleted = await prisma.refreshToken.deleteMany({ where: { token } })
  if (deleted.count !== 1) return null

  const accessToken = signAccessToken({
    userId: stored.user.id,
    role: stored.user.role,
  })
  const refreshToken = signRefreshToken({ userId: stored.user.id })

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: stored.user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE * 1000),
    },
  })

  return { accessToken, refreshToken }
}

export function setAuthCookies(response: NextResponse, tokens: AuthTokens) {
  response.cookies.set('access_token', tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: ACCESS_TOKEN_MAX_AGE,
    path: '/',
  })

  response.cookies.set('refresh_token', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: REFRESH_TOKEN_MAX_AGE,
    path: '/',
  })

  return response
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set('access_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })

  response.cookies.set('refresh_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })

  return response
}
