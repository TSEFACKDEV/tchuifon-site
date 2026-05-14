'use client'
import { useTranslations } from 'next-intl'

export default function DashboardPublicationsPage() {
  const t = useTranslations('dashboard')

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">{t('publications')}</h1>
      <p className="text-slate-500 mt-2">{t('loading')}</p>
    </div>
  )
}
