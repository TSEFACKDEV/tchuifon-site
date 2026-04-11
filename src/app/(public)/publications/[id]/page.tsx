import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  RiArrowLeftLine, RiCalendarLine, RiExternalLinkLine,
  RiFilePdfLine, RiQuoteText, RiUserLine
} from 'react-icons/ri'

async function getPublication(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/publications/${id}`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) return null
  return res.json()
}

const typeLabels: Record<string, string> = {
  ARTICLE: 'Article', CONFERENCE: 'Conférence', BOOK_CHAPTER: 'Chapitre de livre',
  THESIS: 'Thèse', PATENT: 'Brevet', POSTER: 'Poster',
}

export default async function PublicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const pub = await getPublication(id)
  if (!pub) notFound()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <Link href="/publications" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 transition-colors mb-8">
        <RiArrowLeftLine className="w-4 h-4" />
        Toutes les publications
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header coloré */}
        <div className="bg-gradient-to-br from-primary-700 to-primary-900 p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-white/15 text-xs font-medium border border-white/20">
              {typeLabels[pub.type] ?? pub.type}
            </span>
            {pub.year && (
              <span className="flex items-center gap-1.5 text-xs text-blue-200">
                <RiCalendarLine className="w-3.5 h-3.5" />
                {pub.year}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold leading-snug mb-4">{pub.title}</h1>
          <p className="text-blue-200 text-sm">{pub.authors.join(', ')}</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Résumé */}
          {pub.abstract && (
            <section>
              <h2 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <RiQuoteText className="w-4 h-4 text-primary-500" />
                Résumé
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-5 border border-slate-100">
                {pub.abstract}
              </p>
            </section>
          )}

          {/* Infos bibliographiques */}
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-4">Informations bibliographiques</h2>
            <dl className="grid sm:grid-cols-2 gap-4">
              {[
                { label: 'Journal / Revue', value: pub.journal },
                { label: 'Conférence', value: pub.conference },
                { label: 'Volume', value: pub.volume },
                { label: 'Numéro', value: pub.issue },
                { label: 'Pages', value: pub.pages },
                { label: 'Éditeur', value: pub.publisher },
                { label: 'DOI', value: pub.doi },
                { label: 'ISBN', value: pub.isbn },
                { label: 'ISSN', value: pub.issn },
                { label: 'Citations', value: pub.citations > 0 ? `${pub.citations} citation(s)` : null },
              ].filter(({ value }) => value).map(({ label, value }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <dt className="text-xs text-slate-400 mb-1">{label}</dt>
                  <dd className="text-sm font-medium text-slate-800">
                    {label === 'DOI' ? (
                      <a href={`https://doi.org/${value}`} target="_blank" rel="noopener noreferrer"
                        className="text-primary-600 hover:underline flex items-center gap-1">
                        {value} <RiExternalLinkLine className="w-3.5 h-3.5" />
                      </a>
                    ) : value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Mots-clés */}
          {pub.keywords?.length > 0 && (
            <section>
              <h2 className="text-base font-semibold text-slate-900 mb-3">Mots-clés</h2>
              <div className="flex flex-wrap gap-2">
                {pub.keywords.map((k: string) => (
                  <span key={k} className="px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 text-sm border border-primary-100">
                    {k}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Collaborateurs */}
          {pub.collaborators?.length > 0 && (
            <section>
              <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <RiUserLine className="w-4 h-4 text-primary-500" />
                Co-auteurs
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {pub.collaborators.map(({ collaborator: c }: any) => (
                  <Link key={c.id} href={`/collaborators/${c.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-primary-200 hover:bg-primary-50/30 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
                      <RiUserLine className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.institution}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* PDF */}
          {pub.pdfUrl && (
            <a href={pub.pdfUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors">
              <RiFilePdfLine className="w-4 h-4" />
              Télécharger le PDF
            </a>
          )}
        </div>
      </div>
    </div>
  )
}