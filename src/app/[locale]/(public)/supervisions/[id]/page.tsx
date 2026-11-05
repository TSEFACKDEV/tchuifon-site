import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { prisma } from '@/lib/prisma'

type Props = {
  params: Promise<{ locale: string; id: string }>
}

async function getSupervision(id: string) {
  return prisma.supervision.findUnique({ where: { id } })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supervision = await getSupervision(id)

  if (!supervision) return {}

  return {
    title: supervision.topic ?? supervision.studentName ?? undefined,
    description: supervision.description?.slice(0, 160),
  }
}

function formatDate(date: Date | null, locale: string) {
  if (!date) return null
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date)
}

export default async function SupervisionDetailPage({ params }: Props) {
  const { id, locale } = await params
  const t = await getTranslations('detail')
  const enums = await getTranslations('enums')
  const supervision = await getSupervision(id)

  if (!supervision) notFound()

  const start = formatDate(supervision.startDate, locale)
  const end = formatDate(supervision.endDate, locale)

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <Link href="/supervisions" className="inline-flex items-center text-sm text-primary-600 hover:underline mb-6">
        ← {t('back')}
      </Link>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {supervision.level && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100">
            {enums(`supervisionLevel.${supervision.level}`)}
          </span>
        )}
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
          {enums(`supervisionStatus.${supervision.status}`)}
        </span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight mb-2">
        {supervision.topic}
      </h1>

      <p className="text-sm text-slate-500 mb-8">
        {t('supervision.student')} : <span className="font-medium text-slate-700">{supervision.studentName}</span>
        {supervision.level && ` · ${enums(`supervisionLevel.${supervision.level}`)}`}
      </p>

      {(start || end) && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-8 text-sm">
          <p className="text-xs text-slate-400 mb-0.5">{t('supervision.period')}</p>
          <p className="font-medium text-slate-800">
            {start ?? '—'}{end ? ` → ${end}` : ''}
          </p>
        </div>
      )}

      {supervision.description && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">{t('supervision.description')}</h2>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
            {supervision.description}
          </p>
        </section>
      )}

      {supervision.publications.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">{t('supervision.publications')}</h2>
          <ul className="space-y-2">
            {supervision.publications.map((publication) => (
              <li key={publication} className="text-sm text-slate-600 flex gap-2">
                <span className="text-primary-600 font-semibold">•</span>
                <span>{publication}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {supervision.thesisUrl && (
        <a
          href={supervision.thesisUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          {t('supervision.thesis')}
        </a>
      )}
    </article>
  )
}
