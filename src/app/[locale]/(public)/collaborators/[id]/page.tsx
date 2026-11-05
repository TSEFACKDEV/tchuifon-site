import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { prisma } from '@/lib/prisma'

type Props = {
  params: Promise<{ locale: string; id: string }>
}

async function getCollaborator(id: string) {
  return prisma.collaborator.findUnique({
    where: { id },
    include: {
      publications: {
        where: { publication: { isPublished: true } },
        include: {
          publication: {
            select: { id: true, slug: true, title: true, year: true },
          },
        },
      },
    },
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const collaborator = await getCollaborator(id)

  if (!collaborator) return {}

  return {
    title: collaborator.name ?? undefined,
    description: [collaborator.title, collaborator.institution, collaborator.researchArea]
      .filter(Boolean)
      .join(' — '),
  }
}

export default async function CollaboratorDetailPage({ params }: Props) {
  const { id } = await params
  const t = await getTranslations('detail')
  const collaborator = await getCollaborator(id)

  if (!collaborator) notFound()

  const links = [
    { label: t('collaborator.email'), href: collaborator.email ? `mailto:${collaborator.email}` : null, value: collaborator.email },
    { label: t('collaborator.website'), href: collaborator.website, value: collaborator.website },
    { label: t('collaborator.googleScholar'), href: collaborator.googleScholar, value: collaborator.googleScholar },
    { label: t('collaborator.orcid'), href: collaborator.orcid ? `https://orcid.org/${collaborator.orcid}` : null, value: collaborator.orcid },
  ].filter((link) => Boolean(link.href))

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <Link href="/collaborators" className="inline-flex items-center text-sm text-primary-600 hover:underline mb-6">
        ← {t('back')}
      </Link>

      <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
        <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
          {collaborator.photoUrl ? (
            <Image
              src={collaborator.photoUrl}
              alt={collaborator.name ?? 'Photo'}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-300">
              {collaborator.name?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight mb-1">
            {collaborator.name}
          </h1>
          {collaborator.title && (
            <p className="text-sm text-slate-600 mb-1">{collaborator.title}</p>
          )}
          {collaborator.institution && (
            <p className="text-sm text-slate-500">
              {collaborator.institution}
              {collaborator.department ? ` — ${collaborator.department}` : ''}
            </p>
          )}
          {collaborator.country && (
            <p className="text-sm text-slate-400 mt-1">{t('collaborator.country')} : {collaborator.country}</p>
          )}
        </div>
      </div>

      {collaborator.researchArea && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">{t('collaborator.researchArea')}</h2>
          <p className="text-sm text-slate-600">{collaborator.researchArea}</p>
        </section>
      )}

      {links.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">{t('collaborator.links')}</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href ?? '#'}
                target={link.href?.startsWith('mailto:') ? undefined : '_blank'}
                rel={link.href?.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                className="bg-white rounded-xl border border-slate-200 p-4 hover:border-primary-300 transition-colors"
              >
                <p className="text-xs text-slate-400 mb-0.5">{link.label}</p>
                <p className="font-medium text-primary-600 truncate">{link.value}</p>
              </a>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">{t('collaborator.publications')}</h2>
        {collaborator.publications.length === 0 ? (
          <p className="text-sm text-slate-400">{t('collaborator.noPublications')}</p>
        ) : (
          <ul className="space-y-2">
            {collaborator.publications.map(({ publication }) => (
              <li key={publication.id}>
                <Link
                  href={`/publications/${publication.slug ?? publication.id}`}
                  className="flex items-start gap-2 text-sm text-slate-700 hover:text-primary-700 transition-colors"
                >
                  <span className="text-primary-600 font-semibold">•</span>
                  <span>
                    {publication.title}
                    {publication.year ? ` (${publication.year})` : ''}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  )
}
