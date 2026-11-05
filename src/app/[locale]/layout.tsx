import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getMessages, getTranslations } from 'next-intl/server'
import '../globals.css'
import { ToastContainer } from '@/components/ui/Toast'
import { routing } from '@/i18n/routing'
import ClientLayout from './ClientLayout'

type Props = {
  children: React.ReactNode
  params: Promise<{
    locale: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    return {}
  }

  const t = await getTranslations({ locale, namespace: 'metadata' })

  return {
    title: t('title'),
    description: t('description'),
    keywords: ['chimie', 'génie des procédés', 'ENSPD', 'recherche', 'Cameroun'],
  }
}

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound()
  }

  // getMessages() passe par getRequestConfig et respecte donc la locale de l'URL.
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className="antialiased bg-slate-50 text-slate-900">
        <ClientLayout locale={locale} messages={messages}>
          {children}
        </ClientLayout>
        <ToastContainer />
      </body>
    </html>
  )
}
