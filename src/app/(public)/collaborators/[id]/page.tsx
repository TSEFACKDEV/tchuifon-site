import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { RiArrowLeftLine, RiMapPinLine, RiMailLine, RiGlobalLine, RiUserLine } from 'react-icons/ri'
import PublicationCard from '@/components/public/PublicationCard'

async function getCollaborator(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/collaborators/${id}`, { next: { revalidate: 3600 } })
  if (!res.ok) return null
  return res.json()
}

export default async function CollaboratorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const collaborator = await getCollaborator(id)
  if (!collaborator) notFound()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <Link href="/collaborators" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 transition-colors mb-8">
        <RiArrowLeftLine className="w-4 h-4" />
        Tous les collaborateurs
      </Link>

      {/* Profil */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="bg-gradient-to-br from-slate-700 to-slate-900 p-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white/20 bg-white/10 shrink-0">
              {collaborator.photoUrl ? (
                <Image src={collaborator.photoUrl} alt={collaborator.name ?? ''} width={96} height={96} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <RiUserLine className="w-10 h-10 text-white/40" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{collaborator.name}</h1>
              {collaborator.title && <p className="text-slate-300 text-sm mb-2">{collaborator.title}</p>}
              {collaborator.researchArea && (
                <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs border border-white/20">
                  {collaborator.researchArea}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {collaborator.institution && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-400 mb-1">Institution</p>
                <p className="text-sm font-medium text-slate-800">{collaborator.institution}</p>
                {collaborator.department && <p className="text-xs text-slate-500 mt-0.5">{collaborator.department}</p>}
              </div>
            )}
            {collaborator.country && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <RiMapPinLine className="w-4 h-4 text-primary-500 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 mb-1">Pays</p>
                  <p className="text-sm font-medium text-slate-800">{collaborator.country}</p>
                </div>
              </div>
            )}
            {collaborator.email && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <RiMailLine className="w-4 h-4 text-primary-500 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 mb-1">Email</p>
                  <a href={`mailto:${collaborator.email}`} className="text-sm font-medium text-primary-600 hover:underline">
                    {collaborator.email}
                  </a>
                </div>
              </div>
            )}
            {collaborator.website && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <RiGlobalLine className="w-4 h-4 text-primary-500 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 mb-1">Site web</p>
                  <a href={collaborator.website} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-medium text-primary-600 hover:underline truncate block">
                    {collaborator.website}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Liens académiques */}
          {(collaborator.googleScholar || collaborator.orcid) && (
            <div className="flex flex-wrap gap-3">
              {collaborator.googleScholar && (
                <a href={collaborator.googleScholar} target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-100">
                  Google Scholar
                </a>
              )}
              {collaborator.orcid && (
                <a href={`https://orcid.org/${collaborator.orcid}`} target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors border border-green-100">
                  ORCID
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Publications communes */}
      {collaborator.publications?.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Publications communes ({collaborator.publications.length})
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {collaborator.publications.map(({ publication: pub }: any, i: number) => (
              <PublicationCard key={pub.id} pub={pub} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}