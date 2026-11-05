import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { prisma } from '@/lib/prisma'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

async function getPublication(slug: string) {
  return prisma.publication.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
      isPublished: true,
    },
    include: {
      collaborators: { include: { collaborator: true } },
    },
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const publication = await getPublication(slug)

  if (!publication) return {}

  return {
    title: publication.title ?? undefined,
    description: publication.abstract?.slice(0, 160),
  }
}

export default async function PublicationDetailPage({ params }: Props) {
  const { locale, slug } = await params
  const t = await getTranslations('detail')
  const enums = await getTranslations('enums')
  const publication = await getPublication(slug)

  if (!publication) notFound()

  const authors = publication.authors.filter(Boolean).join(', ')
  const source = publication.journal || publication.conference
  const doi = publication.doi?.trim()

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <Link
        href="/publications"
        className="inline-flex items-center text-sm text-primary-600 hover:underline mb-6"
      >
        ← {t('back')}
      </Link>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
          {enums(`publicationType.${publication.type}`)}
        </span>
        {publication.year && (
          <span className="text-xs text-slate-400">{publication.year}</span>
        )}
        {publication.citations > 0 && (
          <span className="text-xs text-slate-400">
            {publication.citations} citation{publication.citations > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight mb-3">
        {publication.title}
      </h1>

      {authors && (
        <p className="text-sm text-slate-600 mb-6">{authors}</p>
      )}

      <div className="grid sm:grid-cols-2 gap-3 mb-8 text-sm">
        {source && (
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-400 mb-0.5">
              {publication.journal ? t('publication.journal') : t('publication.conference')}
            </p>
            <p className="font-medium text-slate-800">{source}</p>
          </div>
        )}
        {publication.publisher && (
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-400 mb-0.5">{t('publication.publisher')}</p>
            <p className="font-medium text-slate-800">{publication.publisher}</p>
          </div>
        )}
        {publication.volume && (
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-400 mb-0.5">{t('publication.volume')}</p>
            <p className="font-medium text-slate-800">{publication.volume}</p>
          </div>
        )}
        {publication.issue && (
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-400 mb-0.5">{t('publication.issue')}</p>
            <p className="font-medium text-slate-800">{publication.issue}</p>
          </div>
        )}
        {publication.pages && (
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-400 mb-0.5">{t('publication.pages')}</p>
            <p className="font-medium text-slate-800">{publication.pages}</p>
          </div>
        )}
        {doi && (
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-400 mb-0.5">{t('publication.doi')}</p>
            <a
              href={`https://doi.org/${doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary-600 hover:underline break-all"
            >
              {doi}
            </a>
          </div>
        )}
      </div>

      {publication.abstract && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">{t('publication.abstract')}</h2>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
            {publication.abstract}
          </p>
        </section>
      )}

      {publication.keywords.filter(Boolean).length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">{t('publication.keywords')}</h2>
          <div className="flex flex-wrap gap-2">
            {publication.keywords.filter(Boolean).map((keyword) => (
              <span key={keyword} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs">
                {keyword}
              </span>
            ))}
          </div>
        </section>
      )}

      {publication.collaborators.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">{t('publication.collaborators')}</h2>
          <div className="flex flex-wrap gap-2">
            {publication.collaborators.map(({ collaborator }) => (
              <Link
                key={collaborator.id}
                href={`/collaborators/${collaborator.id}`}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-700 hover:border-primary-300 hover:text-primary-700 transition-colors"
              >
                {collaborator.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {publication.pdfUrl && (
        <a
          href={publication.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          {t('publication.pdf')}
        </a>
      )}

      <p className="mt-10 text-xs text-slate-400">
        {new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(publication.createdAt)}
      </p>
    </article>
  )
}
