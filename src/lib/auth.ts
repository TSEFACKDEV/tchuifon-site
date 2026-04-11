import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/jwt'

export type AuthUser = {
  userId: string
  role: string
}

export function getAuthUser(req: NextRequest): AuthUser | null {
  // 1. Chercher dans le cookie (production)
  const cookieToken = req.cookies.get('access_token')?.value

  // 2. Chercher dans le header Authorization (tests Postman)
  const authHeader = req.headers.get('authorization')
  const headerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null

  const token = cookieToken ?? headerToken
  if (!token) return null

  try {
    return verifyAccessToken(token)
  } catch {
    return null
  }
}

export function requireAuth(
  req: NextRequest,
  allowedRoles?: string[]
): { user: AuthUser } | NextResponse {
  const user = getAuthUser(req)

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  return { user }
}