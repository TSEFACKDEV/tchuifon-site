import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ locale, requestLocale }) => {
  // `locale` est fourni explicitement par les appels serveur (ex: getTranslations({ locale })),
  // sinon on utilise la locale détectée dans l'URL par le middleware.
  const requestedLocale = locale ?? (await requestLocale)
  const resolvedLocale =
    requestedLocale &&
    routing.locales.includes(requestedLocale as (typeof routing.locales)[number])
      ? requestedLocale
      : routing.defaultLocale

  const messages = (await import(`./locales/${resolvedLocale}.json`)).default

  return {
    locale: resolvedLocale,
    messages,
    timeZone: 'Africa/Douala',
  }
})
