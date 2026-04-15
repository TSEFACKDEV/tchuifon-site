import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import {
  RiArticleLine, RiBookOpenLine, RiGroupLine, RiAwardLine,
  RiArrowRightLine, RiExternalLinkLine, RiMailLine,
  RiMapPinLine, RiPhoneLine, RiFlaskLine, RiLeafLine,
  RiDropLine, RiFireLine,
} from 'react-icons/ri'

async function getProfile() {
  try {
    return await prisma.profile.findFirst()
  } catch { return null }
}

async function getStats() {
  try {
    const [publications, courses, supervisions, collaborators] = await Promise.all([
      prisma.publication.count({ where: { isPublished: true } }),
      prisma.course.count({ where: { isActive: true } }),
      prisma.supervision.count(),
      prisma.collaborator.count(),
    ])
    return { publications, courses, supervisions, collaborators }
  } catch {
    return { publications: 0, courses: 0, supervisions: 0, collaborators: 0 }
  }
}

// Axes de recherche statiques (enrichis avec les vraies infos)
const researchAxes = [
  {
    icon: RiDropLine,
    title: 'Traitement des eaux usées',
    color: 'bg-blue-50 text-blue-600',
    items: [
      'Mécanismes d\'adsorption sur biomasses, MOFs et charbons actifs',
      'Dégradation des micropolluants par Procédé d\'Oxydation Avancée (POA)',
    ],
  },
  {
    icon: RiLeafLine,
    title: 'Bioénergie',
    color: 'bg-green-50 text-green-600',
    items: [
      'Production de biodiesels et bioéthanol',
      'Analyse thermocinétique des matières lignocellulosiques et MOFs (Pyrolyse)',
    ],
  },
  {
    icon: RiFlaskLine,
    title: 'Recherche appliquée',
    color: 'bg-amber-50 text-amber-600',
    items: [
      'Synthèse et caractérisation des matériaux',
      'Applications industrielles et transfert technologique au Cameroun',
    ],
  },
]

export default async function HomePage() {
  const [profile, stats] = await Promise.all([getProfile(), getStats()])

  const statCards = [
    { label: 'Publications',   value: stats.publications,  icon: RiArticleLine,  href: '/publications', color: 'bg-blue-50 text-blue-700 border-blue-100' },
    { label: 'Cours dispensés',value: stats.courses,       icon: RiBookOpenLine, href: '/courses',       color: 'bg-green-50 text-green-700 border-green-100' },
    { label: 'Encadrements',   value: stats.supervisions,  icon: RiAwardLine,    href: '/supervisions',  color: 'bg-amber-50 text-amber-700 border-amber-100' },
    { label: 'Collaborateurs', value: stats.collaborators, icon: RiGroupLine,    href: '/collaborators', color: 'bg-purple-50 text-purple-700 border-purple-100' },
  ]

  const displayName   = profile?.fullName       ?? 'Pr. TCHUIFON TCHUIFON Donald Raoul'
  const displayTitle  = profile?.title          ?? 'Maître de Conférences — Chimie Inorganique'
  const displayEmail  = profile?.email          ?? 'tchuifondonald@yahoo.fr'
  const displayPhone  = profile?.phone          ?? '+237 674 78 00 94'
  const displayInst   = profile?.institution    ?? 'ENSPD Douala'
  const displayDept   = profile?.department     ?? 'Département de Génie des Procédés'
  const displayOffice = profile?.officeLocation ?? 'PK 17 Douala — Campus ENSPD'
  const displayBio    = profile?.bio            ?? ''
  const displayPhoto  = profile?.photoUrl       ?? null
  const displayCV     = profile?.cvUrl          ?? null
  const displayWeb    = profile?.website        ?? 'https://www.ensp-udo.com'
  const specializations = (profile?.specializations as string[]) ?? [
    'Traitement des eaux usées', 'Bioénergie',
    'Procédés d\'Oxydation Avancée', 'Synthèse des matériaux',
  ]
  const degrees = (profile?.degrees as string[]) ?? [
    'Licence en Chimie Inorganique (2010)',
    'Master 2 Recherche — Chimie Physique (2013)',
    'Doctorat/PhD — Chimie Physique (2016)',
    'Maître de Conférences, ENSPD (2025)',
  ]

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-slate-900 via-primary-900 to-primary-800 text-white relative overflow-hidden">
        {/* Décoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-primary-600/10" />
          <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-primary-500/10" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28 relative">
          <div className="grid md:grid-cols-5 gap-12 items-center">

            {/* Texte — 3 colonnes */}
            <div className="md:col-span-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-blue-200 text-xs font-medium mb-6 border border-white/15">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Enseignant-Chercheur · {displayDept}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
                {displayName}
              </h1>

              <p className="text-primary-200 text-base font-medium mb-4">
                {displayTitle}
              </p>

              <p className="text-blue-100/80 text-sm leading-relaxed mb-6 max-w-xl">
                {displayBio
                  ? displayBio.slice(0, 220) + (displayBio.length > 220 ? '…' : '')
                  : `Spécialisé en chimie industrielle avec une expertise reconnue dans les bioénergies, le traitement des eaux usées et la synthèse de matériaux.`
                }
              </p>

              {/* Spécialisations */}
              <div className="flex flex-wrap gap-2 mb-8">
                {specializations.slice(0, 4).map((s: string) => (
                  <span key={s}
                    className="px-3 py-1 rounded-full bg-white/10 text-blue-100 text-xs border border-white/15">
                    {s}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/publications"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-primary-900 font-semibold text-sm hover:bg-blue-50 transition-colors shadow-sm">
                  Mes publications
                  <RiArrowRightLine className="w-4 h-4" />
                </Link>
                <Link href="/contact"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-colors border border-white/20">
                  <RiMailLine className="w-4 h-4" />
                  Me contacter
                </Link>
                {displayCV && (
                  <a href={displayCV} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600/40 text-white font-semibold text-sm hover:bg-primary-600/60 transition-colors border border-primary-400/30">
                    Télécharger le CV
                  </a>
                )}
              </div>
            </div>

            {/* Photo + infos contact — 2 colonnes */}
            <div className="md:col-span-2 flex flex-col items-center gap-5">
              {/* Photo */}
              <div className="relative">
                <div className="w-44 h-44 rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl bg-primary-700/50">
                  {displayPhoto ? (
                    <Image
                      src={displayPhoto}
                      alt={displayName}
                      width={176} height={176}
                      className="w-full h-full object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-5xl font-bold text-white/40">T</span>
                    </div>
                  )}
                </div>
                {/* Badge institution */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full bg-white text-primary-800 text-xs font-semibold shadow-md">
                  {displayInst.includes('(') ? displayInst.split('(')[1].replace(')', '') : 'ENSPD'}
                </div>
              </div>

              {/* Carte contact */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/15 text-sm space-y-3 w-full mt-4">
                <div className="flex items-start gap-3 text-blue-100">
                  <RiMapPinLine className="w-4 h-4 text-blue-300 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-blue-300 mb-0.5">Institution</p>
                    <p className="text-sm">{displayInst}</p>
                    <p className="text-xs text-blue-300 mt-0.5">{displayDept}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-blue-100">
                  <RiMailLine className="w-4 h-4 text-blue-300 shrink-0" />
                  <a href={`mailto:${displayEmail}`}
                    className="hover:text-white transition-colors truncate text-sm">
                    {displayEmail}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-blue-100">
                  <RiPhoneLine className="w-4 h-4 text-blue-300 shrink-0" />
                  <a href={`tel:${displayPhone}`}
                    className="hover:text-white transition-colors text-sm">
                    {displayPhone}
                  </a>
                </div>
                {displayWeb && (
                  <a href={displayWeb} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 text-blue-100 hover:text-white transition-colors">
                    <RiExternalLinkLine className="w-4 h-4 text-blue-300 shrink-0" />
                    <span className="text-sm truncate">Site ENSPD</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, href, color }) => (
            <Link key={label} href={href}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md hover:-translate-y-0.5 transition-all group">
              <div className={`inline-flex p-2.5 rounded-xl ${color} mb-3 border`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{value}</p>
              <p className="text-sm text-slate-500 mt-0.5 group-hover:text-slate-700 transition-colors">
                {label}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── RECHERCHE ────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Activités de recherche</h2>
          <p className="text-slate-500 text-sm">Domaines d'expertise et axes de travaux</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {researchAxes.map(({ icon: Icon, title, color, items }) => (
            <div key={title}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className={`inline-flex p-3 rounded-xl ${color} mb-4`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-3">{title}</h3>
              <ul className="space-y-2">
                {items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="w-1 h-1 rounded-full bg-primary-400 mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── PARCOURS ─────────────────────────────────────────── */}
      <section className="bg-slate-100 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Formation académique</h2>
            <p className="text-slate-500 text-sm">Parcours et diplômes obtenus</p>
          </div>
          <div className="relative">
            {/* Ligne timeline */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary-200 -translate-x-px" />
            <div className="space-y-6">
              {degrees.map((degree: string, i: number) => (
                <div key={i} className={`flex gap-6 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className="md:w-1/2" />
                  {/* Point */}
                  <div className="relative flex items-start justify-center shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary-600 border-4 border-white shadow-md flex items-center justify-center z-10">
                      <RiAwardLine className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                  <div className="md:w-1/2">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                      <p className="text-sm font-medium text-slate-800">{degree}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="bg-primary-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 text-center">
          <h2 className="text-2xl font-bold mb-3">Collaboration ou question ?</h2>
          <p className="text-blue-200 text-sm mb-8 max-w-md mx-auto">
            N'hésitez pas à prendre contact pour toute demande de collaboration
            scientifique ou d'information.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-primary-800 font-semibold text-sm hover:bg-blue-50 transition-colors">
              <RiMailLine className="w-4 h-4" />
              Envoyer un message
            </Link>
            <Link href="/publications"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-colors border border-white/20">
              Voir les publications
              <RiArrowRightLine className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}