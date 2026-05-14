import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/lib/jwt'

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refresh_token')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token manquant' },
        { status: 401 }
      )
    }

    // Vérifier la signature JWT (throws si invalide ou expiré)
    try {
      verifyRefreshToken(refreshToken)
    } catch {
      return NextResponse.json(
        { error: 'Refresh token invalide ou expiré' },
        { status: 401 }
      )
    }

    // Vérifier que le token existe en base et n'est pas expiré
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    })

    if (!stored || stored.expiresAt < new Date()) {
      // Supprimer si expiré
      if (stored) {
        await prisma.refreshToken.delete({ where: { token: refreshToken } })
      }
      return NextResponse.json(
        { error: 'Session expirée, veuillez vous reconnecter' },
        { status: 401 }
      )
    }

    // Rotation du refresh token (sécurité renforcée)
    await prisma.refreshToken.delete({ where: { token: refreshToken } })

    const newAccessToken = signAccessToken({
      userId: stored.user.id,
      role: stored.user.role,
    })

    const newRefreshToken = signRefreshToken({ userId: stored.user.id })
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: stored.user.id,
        expiresAt,
      },
    })

    const response = NextResponse.json({ success: true })

    response.cookies.set('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/',
    })

    response.cookies.set('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[REFRESH]', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}