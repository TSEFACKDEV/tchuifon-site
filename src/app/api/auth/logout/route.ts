import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { clearAuthCookies } from '@/lib/session'

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('refresh_token')?.value

  if (refreshToken) {
    try {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      })
    } catch (error) {
      // Même si la révocation en base échoue, les cookies doivent être effacés.
      console.error('[LOGOUT]', error)
    }
  }

  return clearAuthCookies(NextResponse.json({ success: true }))
}
