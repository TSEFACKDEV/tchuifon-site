// src/proxy.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessTokenEdge } from '@/lib/jwt-edge'

const PROTECTED_PATHS = ['/dashboard']
const AUTH_PATHS = ['/login', '/forgot-password']

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('access_token')?.value

  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p))
  const isAuthPage = AUTH_PATHS.some(p => pathname.startsWith(p))

  if (isProtected) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    const payload = await verifyAccessTokenEdge(token)
    if (!payload) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    if (payload.role !== 'ADMIN' && payload.role !== 'COLLABORATOR') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  if (isAuthPage && token) {
    const payload = await verifyAccessTokenEdge(token)
    if (payload) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/forgot-password'],
}