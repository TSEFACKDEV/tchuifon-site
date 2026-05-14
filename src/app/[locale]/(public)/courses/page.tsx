'use client'
import { useTranslations, useLocale } from 'next-intl'

export const dynamic = 'force-dynamic'

export default function CoursesPage() {
  const t = useTranslations('home')
  const locale = useLocale()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('courses')}</h1>
        <p className="text-slate-500">{locale === 'fr' ? 'Liste des cours dispensés' : 'List of courses taught'}</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <p className="text-slate-500">{locale === 'fr' ? 'Aucun cours disponible' : 'No courses available'}</p>
      </div>
    </div>
  )
}
