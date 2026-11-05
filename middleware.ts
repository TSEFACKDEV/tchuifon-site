import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './src/i18n/routing'
import {
  verifyAccessTokenEdge,
  verifyRefreshTokenEdge,
} from './src/lib/jwt-edge'

const intlMiddleware = createMiddleware(routing)

const localePattern = new RegExp(`^/(${routing.locales.join('|')})(/|$)`)

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  const localeMatch = pathname.match(localePattern)
  const locale = localeMatch?.[1] ?? routing.defaultLocale

  const accessToken = req.cookies.get('access_token')?.value
  const refreshToken = req.cookies.get('refresh_token')?.value

  const payload = accessToken
    ? await verifyAccessTokenEdge(accessToken)
    : null

  // Access token expiré mais refresh token encore valide : on passe par la
  // route de rotation, qui remettra des cookies à jour avant de revenir ici.
  if (!payload && refreshToken) {
    const refreshPayload = await verifyRefreshTokenEdge(refreshToken)

    if (refreshPayload) {
      const refreshUrl = new URL('/api/auth/refresh', req.url)
      refreshUrl.searchParams.set('redirect', `${pathname}${search}`)
      return NextResponse.redirect(refreshUrl)
    }
  }

  // Laisser next-intl gérer la détection et la redirection de locale.
  if (!localeMatch) {
    return intlMiddleware(req)
  }

  const segments = pathname.split('/')
  // segments: ['', 'fr', 'dashboard', ...]
  const firstSegment = segments[2] ?? ''

  const isProtected = firstSegment === 'dashboard'
  const isLoginPage = firstSegment === 'login'

  if (isProtected && !payload) {
    const res = NextResponse.redirect(new URL(`/${locale}/login`, req.url))

    if (accessToken || refreshToken) {
      res.cookies.delete('access_token')
      res.cookies.delete('refresh_token')
    }

    return res
  }

  // Ne rediriger que la page de connexion : les pages « mot de passe oublié »
  // et « réinitialisation » doivent rester accessibles même connecté.
  if (isLoginPage && payload) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url))
  }

  return intlMiddleware(req)
}

export const config = {
  matcher: [
    // Ignore les routes API, les assets Next et tout fichier statique (extension .ext)
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images|.*\\..*).*)',
  ],
}
