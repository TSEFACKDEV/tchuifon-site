import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendResetPasswordEmail } from '@/lib/mail'
import { getBaseUrl } from '@/lib/api'
import crypto from 'crypto'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  locale: z.enum(['fr', 'en']).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    const { email, locale = 'fr' } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })

    // Réponse identique que l'email existe ou non (anti-énumération).
    const genericResponse = NextResponse.json({
      message: 'Si cet email existe, vous recevrez un lien de réinitialisation.',
    })

    if (!user) return genericResponse

    // Le token brut part dans l'email ; seule son empreinte SHA-256 est stockée.
    const token = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 heure

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExp: expiresAt,
      },
    })

    const resetUrl = `${getBaseUrl()}/${locale}/reset-password?token=${token}`

    try {
      await sendResetPasswordEmail(email, resetUrl, locale)
    } catch (mailError) {
      // Ne pas révéler l'existence du compte si l'envoi échoue.
      console.error('[FORGOT_PASSWORD_EMAIL]', mailError)
    }

    return genericResponse
  } catch (error) {
    console.error('[FORGOT_PASSWORD]', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
