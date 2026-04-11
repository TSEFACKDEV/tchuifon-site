import { notFound } from 'next/navigation'
import Link from 'next/link'
import { RiArrowLeftLine, RiUserLine, RiCalendarLine, RiFileTextLine } from 'react-icons/ri'
import { clsx } from 'clsx'

async function getSupervision(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/supervisions/${id}`, { next: { revalidate: 3600 } })
  if (!res.ok) return null
  return res.json()
}

const statusConfig: Record<string, { label: string; class: string }> = {
  IN_PROGRESS: { label: 'En cours', class: 'bg-blue-50 text-blue-700 border-blue-100' },
  COMPLETED: { label: 'Terminé', class: 'bg-green-50 text-green-700 border-green-100' },
  ABANDONED: { label: 'Abandonné', class: 'bg-slate-100 text-slate-500 border-slate-200' },
}
const levelLabels: Record<string, string> = {
  INGENIEUR: 'Ingénieur', MASTER_2: 'Master 2', DOCTORAT: 'Doctorat', POST_DOC: 'Post-Doc',
}

export default async function SupervisionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supervision = await getSupervision(id)
  if (!supervision) notFound()

  const status = statusConfig[supervision.status] ?? statusConfig.IN_PROGRESS

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <Link href="/supervisions" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 transition-colors mb-8">
        <RiArrowLeftLine className="w-4 h-4" />
        Tous les encadrements
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-br from-primary-700 to-primary-900 p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center">
              <RiUserLine className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-lg">{supervision.studentName}</p>
              <div className="flex items-center gap-2 mt-1">
                {supervision.level && (
                  <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-xs border border-white/20">
                    {levelLabels[supervision.level] ?? supervision.level}
                  </span>
                )}
                <span className={clsx('px-2.5 py-0.5 rounded-full text-xs border', status.class)}>
                  {status.label}
                </span>
              </div>
            </div>
          </div>
          {supervision.topic && (
            <h1 className="text-xl font-bold leading-snug">{supervision.topic}</h1>
          )}
        </div>

        <div className="p-8 space-y-6">
          {/* Dates */}
          {(supervision.startDate || supervision.endDate) && (
            <div className="flex gap-4">
              {supervision.startDate && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <RiCalendarLine className="w-4 h-4 text-primary-500" />
                  Début : <strong>{new Date(supervision.startDate).toLocaleDateString('fr-FR')}</strong>
                </div>
              )}
              {supervision.endDate && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <RiCalendarLine className="w-4 h-4 text-slate-400" />
                  Fin : <strong>{new Date(supervision.endDate).toLocaleDateString('fr-FR')}</strong>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {supervision.description && (
            <section>
              <h2 className="text-base font-semibold text-slate-900 mb-3">Description</h2>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-5 border border-slate-100">
                {supervision.description}
              </p>
            </section>
          )}

          {/* Thèse */}
          {supervision.thesisUrl && (
            <a href={supervision.thesisUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors">
              <RiFileTextLine className="w-4 h-4" />
              Consulter le mémoire / la thèse
            </a>
          )}
        </div>
      </div>
    </div>
  )
}