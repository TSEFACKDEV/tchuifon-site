import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import type { AbstractIntlMessages } from 'next-intl'
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

  // Charger les messages pour la locale
  const messages = ((await import(`@/i18n/locales/${locale}.json`)) as { default: AbstractIntlMessages }).default

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
