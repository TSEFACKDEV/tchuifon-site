'use client'

import { ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import type { AbstractIntlMessages } from 'next-intl'

type ClientLayoutProps = {
  children: ReactNode
  locale: string
  messages: AbstractIntlMessages
}

export default function ClientLayout({
  children,
  locale,
  messages,
}: ClientLayoutProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="Africa/Douala">
      {children}
    </NextIntlClientProvider>
  )
}
