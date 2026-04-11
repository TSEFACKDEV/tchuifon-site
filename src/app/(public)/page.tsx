import Link from 'next/link'
import Image from 'next/image'
import {
  RiArticleLine, RiBookOpenLine, RiGroupLine,
  RiAwardLine, RiArrowRightLine, RiExternalLinkLine,
  RiMailLine, RiMapPinLine
} from 'react-icons/ri'

// import de la photo de profile depuis le dossier public/images/profile.jpg
const profilePhoto = '/images/profile.jpg'
async function getProfile() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/profile`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

async function getStats() {
  try {
    const [pubs, courses, supervisions, collabs] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/publications?limit=1`, { next: { revalidate: 3600 } }),
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/courses`, { next: { revalidate: 3600 } }),
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/supervisions`, { next: { revalidate: 3600 } }),
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/collaborators`, { next: { revalidate: 3600 } }),
    ])
    const [p, c, s, co] = await Promise.all([pubs.json(), courses.json(), supervisions.json(), collabs.json()])
    return {
      publications: p.meta?.total ?? 0,
      courses: c.data?.length ?? 0,
      supervisions: s.data?.length ?? 0,
      collaborators: co.data?.length ?? 0,
    }
  } catch { return { publications: 0, courses: 0, supervisions: 0, collaborators: 0 } }
}

export default async function HomePage() {
  const [profile, stats] = await Promise.all([getProfile(), getStats()])

  const statCards = [
    { label: 'Publications', value: stats.publications, icon: RiArticleLine, href: '/publications', color: 'bg-blue-50 text-blue-700' },
    { label: 'Cours dispensés', value: stats.courses, icon: RiBookOpenLine, href: '/courses', color: 'bg-green-50 text-green-700' },
    { label: 'Encadrements', value: stats.supervisions, icon: RiAwardLine, href: '/supervisions', color: 'bg-amber-50 text-amber-700' },
    { label: 'Collaborateurs', value: stats.collaborators, icon: RiGroupLine, href: '/collaborators', color: 'bg-purple-50 text-purple-700' },
  ]

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* Texte */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-blue-200 text-xs font-medium mb-6 border border-white/15">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Enseignant-Chercheur · ENSPD Douala
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
                {profile?.fullName ?? 'TCHUIFON TCHUIFON Donald Raoul'}
              </h1>
              <p className="text-blue-200 text-lg font-medium mb-3">
                {profile?.title ?? 'Doctorat/Ph.D en Chimie-Physique'}
              </p>
              <p className="text-blue-100/80 text-sm leading-relaxed mb-8 max-w-lg">
                {profile?.bio?.slice(0, 200) ?? 'Spécialisé en Chimie-Physique avec une expertise reconnue dans le domaine des procédés industriels et de la recherche appliquée.'}
                {(profile?.bio?.length ?? 0) > 200 && '…'}
              </p>

              {/* Spécialisations */}
              {profile?.specializations?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {profile.specializations.map((s: string) => (
                    <span key={s} className="px-3 py-1 rounded-full bg-white/10 text-blue-100 text-xs border border-white/15">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Link href="/publications"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-primary-800 font-semibold text-sm hover:bg-blue-50 transition-colors">
                  Mes publications
                  <RiArrowRightLine className="w-4 h-4" />
                </Link>
                <Link href="/contact"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-colors border border-white/20">
                  Me contacter
                </Link>
              </div>
            </div>

            {/* Photo + infos */}
            <div className="flex flex-col items-center md:items-end gap-6">
              <div className="relative">
                <div className="w-48 h-48 rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl bg-white/10">
                  {profile?.photoUrl ? (
                    <Image
                      src={profilePhoto}                      alt={profile.fullName ?? 'Photo de profil'}
                      width={192} height={192}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white/50">
                      T
                    </div>
                  )}
                </div>
              </div>

              {/* Infos contact */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/15 text-sm space-y-2.5 w-full max-w-xs">
                <div className="flex items-center gap-2.5 text-blue-100">
                  <RiMapPinLine className="w-4 h-4 text-blue-300 shrink-0" />
                  <span>{profile?.institution ?? 'ENSPD Douala'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-blue-100">
                  <RiMailLine className="w-4 h-4 text-blue-300 shrink-0" />
                  <a href={`mailto:${profile?.email ?? 'tchuifon@gmail.com'}`}
                    className="hover:text-white transition-colors truncate">
                    {profile?.email ?? 'tchuifon@gmail.com'}
                  </a>
                </div>
                {profile?.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-blue-100 hover:text-white transition-colors">
                    <RiExternalLinkLine className="w-4 h-4 text-blue-300 shrink-0" />
                    <span className="truncate">Site ENSPD</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, href, color }) => (
            <Link key={label} href={href}
              className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md hover:-translate-y-0.5 transition-all group">
              <div className={`inline-flex p-2.5 rounded-lg ${color} mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-sm text-slate-500 mt-0.5 group-hover:text-slate-700 transition-colors">{label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Activités de recherche */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-2 gap-8">

          {/* Axes de recherche */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Activités de recherche</h2>
            <p className="text-sm text-slate-500 mb-6">Domaines d'expertise et axes de travaux</p>
            <div className="space-y-4">
              {[
                { title: 'Chimie-Physique', desc: 'Étude des propriétés physico-chimiques des matériaux et procédés' },
                { title: 'Génie des Procédés', desc: 'Optimisation et modélisation des procédés industriels' },
                { title: 'Recherche appliquée', desc: 'Applications industrielles et transfert technologique au Cameroun' },
              ].map(({ title, desc }) => (
                <div key={title} className="flex gap-4">
                  <div className="w-1 rounded-full bg-primary-500 shrink-0 mt-1" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Diplômes */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Formation académique</h2>
            <p className="text-sm text-slate-500 mb-6">Parcours et diplômes obtenus</p>
            <div className="space-y-4">
              {(profile?.degrees ?? ['Doctorat/Ph.D en Chimie-Physique']).map((degree: string) => (
                <div key={degree} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0 mt-0.5">
                    <RiAwardLine className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{degree}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{profile?.institution ?? 'ENSPD Douala'}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <Link href="/publications"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                Voir toutes les publications
                <RiArrowRightLine className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA contact */}
      <section className="bg-primary-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 text-center">
          <h2 className="text-2xl font-bold mb-3">Collaboration ou question ?</h2>
          <p className="text-blue-200 text-sm mb-8 max-w-md mx-auto">
            N'hésitez pas à prendre contact pour toute demande de collaboration scientifique ou d'information.
          </p>
          <Link href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-primary-800 font-semibold text-sm hover:bg-blue-50 transition-colors">
            <RiMailLine className="w-4 h-4" />
            Envoyer un message
          </Link>
        </div>
      </section>
    </div>
  )
}