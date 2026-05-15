import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './src/i18n/routing'
import { verifyAccessTokenEdge } from './src/lib/jwt-edge'

const intlMiddleware = createMiddleware(routing)

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('access_token')?.value

  // Extraire la locale depuis le chemin (ex: /fr/dashboard → 'fr')
  const localeMatch = pathname.match(/^\/(fr|en)(\/|$)/)
  const locale = localeMatch?.[1] ?? routing.defaultLocale

  // Déterminer le premier segment de route après la locale
  const segments = pathname.split('/')
  // segments: ['', 'fr', 'dashboard', ...]
  const firstSegment = localeMatch ? (segments[2] ?? '') : (segments[1] ?? '')

  const isProtected = firstSegment === 'dashboard'
  const isAuthPage = firstSegment === 'login' || firstSegment === 'forgot-password'

  if (isProtected) {
    if (!token) {
      return NextResponse.redirect(new URL(`/${locale}/login`, req.url))
    }
    const payload = await verifyAccessTokenEdge(token)
    if (!payload) {
      const res = NextResponse.redirect(new URL(`/${locale}/login`, req.url))
      res.cookies.delete('access_token')
      return res
    }
  }

  if (isAuthPage && token) {
    const payload = await verifyAccessTokenEdge(token)
    if (payload) {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url))
    }
  }

  return intlMiddleware(req)
}

export const config = {
  matcher: [
    // Ignore les routes API, les assets Next et tout fichier statique (extension .ext)
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images|.*\\..*).*)',
  ],
}
