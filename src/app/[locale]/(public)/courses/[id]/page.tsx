import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { prisma } from '@/lib/prisma'

type Props = {
  params: Promise<{ locale: string; id: string }>
}

async function getCourse(id: string) {
  return prisma.course.findFirst({
    where: { id, isActive: true },
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const course = await getCourse(id)

  if (!course) return {}

  return {
    title: course.title ?? undefined,
    description: course.description?.slice(0, 160),
  }
}

export default async function CourseDetailPage({ params }: Props) {
  const { id } = await params
  const t = await getTranslations('detail')
  const enums = await getTranslations('enums')
  const course = await getCourse(id)

  if (!course) notFound()

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <Link href="/courses" className="inline-flex items-center text-sm text-primary-600 hover:underline mb-6">
        ← {t('back')}
      </Link>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {course.level && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
            {enums(`courseLevel.${course.level}`)}
          </span>
        )}
        {course.code && (
          <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-slate-100 text-slate-600">
            {course.code}
          </span>
        )}
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight mb-6">
        {course.title}
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 text-sm">
        {course.credits != null && (
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-400 mb-0.5">{t('course.credits')}</p>
            <p className="font-semibold text-slate-800">{course.credits}</p>
          </div>
        )}
        {course.hours != null && (
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-400 mb-0.5">{t('course.hours')}</p>
            <p className="font-semibold text-slate-800">{course.hours}h</p>
          </div>
        )}
        {course.semester && (
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-400 mb-0.5">{t('course.semester')}</p>
            <p className="font-semibold text-slate-800">{course.semester}</p>
          </div>
        )}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-400 mb-0.5">{t('course.status')}</p>
          <p className="font-semibold text-green-700">{t('course.active')}</p>
        </div>
      </div>

      {course.description && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">{t('course.description')}</h2>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
            {course.description}
          </p>
        </section>
      )}

      {course.objectives.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">{t('course.objectives')}</h2>
          <ul className="space-y-2">
            {course.objectives.map((objective) => (
              <li key={objective} className="flex gap-2 text-sm text-slate-600">
                <span className="text-primary-600 font-semibold">•</span>
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {course.syllabus && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">{t('course.syllabus')}</h2>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
            {course.syllabus}
          </p>
        </section>
      )}
    </article>
  )
}
