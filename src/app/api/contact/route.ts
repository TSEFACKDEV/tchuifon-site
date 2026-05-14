import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { transporter } from '@/lib/mail'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  subject: z.string().min(3, 'Sujet requis'),
  message: z.string().min(10, 'Message trop court'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = contactSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { name, email, subject, message } = parsed.data

    // Sauvegarder en base
    await prisma.contactMessage.create({
      data: { name, email, subject, message },
    })

    // Notifier le Dr Tchuifon
    await transporter.sendMail({
      from: `"Site Dr Tchuifon" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      replyTo: email,
      subject: `[Contact] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #1d4ed8; margin-top:0;">Nouveau message de contact</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px;color:#64748b;width:100px;">Nom</td><td style="padding:8px;font-weight:bold;">${name}</td></tr>
            <tr style="background:#f8fafc;"><td style="padding:8px;color:#64748b;">Email</td><td style="padding:8px;">${email}</td></tr>
            <tr><td style="padding:8px;color:#64748b;">Sujet</td><td style="padding:8px;">${subject}</td></tr>
          </table>
          <div style="margin-top:16px;padding:16px;background:#f8fafc;border-radius:8px;border-left:4px solid #2563eb;">
            <p style="margin:0;white-space:pre-wrap;">${message}</p>
          </div>
          <p style="color:#94a3b8;font-size:13px;margin-top:16px;">
            Répondez directement à cet email pour contacter ${name}.
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true, message: 'Message envoyé avec succès.' })
  } catch (error) {
    console.error('[CONTACT_POST]', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

// GET /api/contact — ADMIN uniquement (liste des messages)
export async function GET(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN'])
  if (auth instanceof NextResponse) return auth

  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { sentAt: 'desc' },
    })
    return NextResponse.json({ data: messages })
  } catch {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}