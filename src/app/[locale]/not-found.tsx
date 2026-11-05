import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

export default async function LocaleNotFound() {
  const t = await getTranslations('notFound')

  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <p className="text-7xl font-bold text-primary-600 mb-4">404</p>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">{t('title')}</h1>
      <p className="text-slate-500 text-sm mb-6">{t('description')}</p>
      <Link
        href="/"
        className="inline-flex items-center px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
      >
        {t('backHome')}
      </Link>
    </main>
  )
}
