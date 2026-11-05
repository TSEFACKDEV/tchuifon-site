import { NextRequest, NextResponse } from 'next/server'
import { routing } from '@/i18n/routing'
import {
  clearAuthCookies,
  rotateRefreshToken,
  setAuthCookies,
} from '@/lib/session'

/** N'autorise que les chemins internes (protection contre l'open redirect). */
function safeRedirect(value: string | null): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return null
  if (value.includes('\\') || /[\r\n]/.test(value)) return null
  return value
}

function loginUrl(req: NextRequest, redirectTo: string) {
  const locale = routing.locales.find(
    (candidate) =>
      redirectTo === `/${candidate}` || redirectTo.startsWith(`/${candidate}/`)
  )

  return new URL(`/${locale ?? routing.defaultLocale}/login`, req.url)
}

/**
 * GET /api/auth/refresh?redirect=/fr/dashboard
 * Utilisé par le middleware lorsqu'un access token est expiré mais que le
 * refresh token est encore valide. Rafraîchit la session puis renvoie
 * l'utilisateur vers la page demandée.
 */
export async function GET(req: NextRequest) {
  const redirectTo = safeRedirect(req.nextUrl.searchParams.get('redirect'))

  if (!redirectTo) {
    return clearAuthCookies(
      NextResponse.json({ error: 'Destination invalide' }, { status: 400 })
    )
  }

  try {
    const tokens = await rotateRefreshToken(req)

    if (!tokens) {
      return clearAuthCookies(
        NextResponse.redirect(loginUrl(req, redirectTo))
      )
    }

    return setAuthCookies(NextResponse.redirect(new URL(redirectTo, req.url)), tokens)
  } catch (error) {
    console.error('[REFRESH_GET]', error)
    return clearAuthCookies(NextResponse.redirect(loginUrl(req, redirectTo)))
  }
}

export async function POST(req: NextRequest) {
  try {
    const tokens = await rotateRefreshToken(req)

    if (!tokens) {
      return clearAuthCookies(
        NextResponse.json(
          { error: 'Session expirée, veuillez vous reconnecter' },
          { status: 401 }
        )
      )
    }

    return setAuthCookies(NextResponse.json({ success: true }), tokens)
  } catch (error) {
    console.error('[REFRESH]', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
