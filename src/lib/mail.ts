import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true pour 465 (SSL), false pour 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendResetPasswordEmail(to: string, resetUrl: string) {
  await transporter.sendMail({
    from: `"Dr Tchuifon - ENSPD" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Réinitialisation de votre mot de passe',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto;">
        <h2 style="color: #1d4ed8;">Réinitialisation du mot de passe</h2>
        <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
        <p>Cliquez sur le lien ci-dessous (valable <strong>1 heure</strong>) :</p>
        <a href="${resetUrl}" 
           style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">
          Réinitialiser mon mot de passe
        </a>
        <p style="color:#64748b;font-size:13px;margin-top:24px;">
          Si vous n'avez pas fait cette demande, ignorez cet email.
        </p>
      </div>
    `,
  })
}