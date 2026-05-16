import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendResetPasswordEmail } from '@/lib/mail'
import { getBaseUrl } from '@/lib/api'
import crypto from 'crypto'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    const { email } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })

    // Réponse identique que l'email existe ou non (sécurité)
    const genericResponse = NextResponse.json({
      message: 'Si cet email existe, vous recevrez un lien de réinitialisation.',
    })

    if (!user) return genericResponse

    // Générer un token sécurisé
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 heure

    // Stocker le token hashé en base (on réutilise RefreshToken ou on crée un champ dédié)
    // Ici on utilise un champ resetToken sur User — à ajouter au schéma Prisma :
    // resetToken     String?
    // resetTokenExp  DateTime?
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExp: expiresAt,
      },
    })

    const resetUrl = `${getBaseUrl()}/fr/reset-password?token=${token}`
    await sendResetPasswordEmail(email, resetUrl)

    return genericResponse
  } catch (error) {
    console.error('[FORGOT_PASSWORD]', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}