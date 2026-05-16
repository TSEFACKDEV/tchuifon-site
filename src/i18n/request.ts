import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from './routing'

export default getRequestConfig(async ({ locale }) => {
  // Utiliser la locale par défaut si elle n'est pas fournie
  const resolvedLocale = locale || routing.defaultLocale

  // Valider que la locale est supportée
  if (!routing.locales.includes(resolvedLocale as (typeof routing.locales)[number])) {
    notFound()
  }

  // Charger les messages pour la locale
  const messages = (await import(`./locales/${resolvedLocale}.json`)).default

  return {
    locale: resolvedLocale,
    messages,
    timeZone: 'Africa/Douala',
  }
})
