'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiArticleLine, RiBookOpenLine, RiGroupLine, RiAwardLine,
  RiArrowRightLine, RiMailLine,
  RiMapPinLine, RiPhoneLine, RiFlaskLine, RiLeafLine,
  RiDropLine,
} from 'react-icons/ri'
import { useEffect, useState } from 'react'

export const dynamic = 'force-dynamic'

const SLIDES = [
  '/images/slides/1.jpeg',
  '/images/slides/2.jpeg',
  '/images/slides/3.jpeg',
  '/images/slides/4.jpeg',
  '/images/slides/5.jpeg',
  '/images/slides/6.jpeg',
  '/images/slides/7.jpeg',
  '/images/slides/8.jpeg',
  '/images/slides/9.jpeg',
]

const KB_CLASSES = ['kenburns-1', 'kenburns-2', 'kenburns-3'] as const

type Profile = {
  fullName?: string
  title?: string
  email?: string
  phone?: string
  institution?: string
  department?: string
  officeLocation?: string
  bio?: string
  photoUrl?: string
  cvUrl?: string
  website?: string
  specializations?: string[]
  degrees?: string[]
}

export default function HomePage() {
  const t = useTranslations('home')
  const locale = useLocale()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState({
    publications: 0,
    courses: 0,
    supervisions: 0,
    collaborators: 0,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % SLIDES.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/stats'),
        ])
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setProfile(profileData)
        }
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error)
      }
    }
    fetchData()
  }, [])

  const displayName = profile?.fullName ?? 'Pr. TCHUIFON TCHUIFON Donald Raoul'
  const displayTitle = profile?.title ?? (locale === 'fr' ? 'Maître de Conférences — Chimie Inorganique' : 'Senior Lecturer — Inorganic Chemistry')
  const displayEmail = profile?.email ?? 'tchuifondonald@yahoo.fr'
  const displayPhone = profile?.phone ?? '+237 674 78 00 94'
  const displayInst = profile?.institution ?? (locale === 'fr' ? 'ENSPD Douala' : 'ENSPD Douala')
  const displayDept = profile?.department ?? (locale === 'fr' ? 'Département de Génie des Procédés' : 'Department of Process Engineering')
  const displayBio = profile?.bio ?? ''
  const displayPhoto = profile?.photoUrl ?? null
  const displayCV = profile?.cvUrl ?? null
  const displayWeb = profile?.website ?? 'https://www.ensp-udo.com'

  const statCards = [
    { label: t('publications'), value: stats.publications, icon: RiArticleLine, href: `/${locale}/publications`, color: 'bg-blue-50 text-blue-700 border-blue-100' },
    { label: t('courses'), value: stats.courses, icon: RiBookOpenLine, href: `/${locale}/courses`, color: 'bg-green-50 text-green-700 border-green-100' },
    { label: t('supervisions'), value: stats.supervisions, icon: RiAwardLine, href: `/${locale}/supervisions`, color: 'bg-amber-50 text-amber-700 border-amber-100' },
    { label: t('collaborators'), value: stats.collaborators, icon: RiGroupLine, href: `/${locale}/collaborators`, color: 'bg-purple-50 text-purple-700 border-purple-100' },
  ]

  const researchAxes = [
    {
      icon: RiDropLine,
      title: t('research.wastewater.title'),
      color: 'bg-blue-50 text-blue-600',
      items: t.raw('research.wastewater.items') as string[],
    },
    {
      icon: RiLeafLine,
      title: t('research.bioenergy.title'),
      color: 'bg-green-50 text-green-600',
      items: t.raw('research.bioenergy.items') as string[],
    },
    {
      icon: RiFlaskLine,
      title: t('research.applied.title'),
      color: 'bg-amber-50 text-amber-600',
      items: t.raw('research.applied.items') as string[],
    },
  ]

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="text-white relative overflow-hidden min-h-145 md:min-h-170">
        {/* Background slider — images are fully visible */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence initial={false}>
            <motion.div
              key={currentSlide}
              className="absolute inset-0 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            >
              <Image
                src={SLIDES[currentSlide]}
                alt=""
                fill
                priority={currentSlide === 0}
                className={`object-cover ${KB_CLASSES[currentSlide % KB_CLASSES.length]}`}
                sizes="100vw"
              />
            </motion.div>
          </AnimatePresence>

          {/* Subtle left-to-right gradient — dark on left for text legibility, fades out on right so image stays clear */}
          <div className="absolute inset-0 bg-linear-to-r from-black/65 via-black/35 to-black/10" />
          {/* Bottom gradient for slide indicators */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-linear-to-t from-black/40 to-transparent" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28 relative z-2">
          <div className="grid md:grid-cols-5 gap-8 lg:gap-12 items-center">

            {/* ── Left: text content ── */}
            <div className="md:col-span-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 text-blue-100 text-xs font-medium mb-6 border border-white/25">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                {locale === 'fr' ? 'Enseignant-Chercheur' : 'Lecturer and Researcher'} · {displayDept}
              </div>

              <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-3 drop-shadow-lg">
                {displayName}
              </h1>

              <p className="text-blue-200 text-base md:text-lg font-medium mb-5 drop-shadow-sm">
                {displayTitle}
              </p>

              <p className="text-white/85 text-sm md:text-base leading-relaxed mb-7 max-w-xl drop-shadow-sm">
                {displayBio
                  ? displayBio.slice(0, 220) + (displayBio.length > 220 ? '…' : '')
                  : locale === 'fr'
                    ? 'Spécialisé en chimie industrielle avec une expertise reconnue dans les bioénergies, le traitement des eaux usées et la synthèse de matériaux.'
                    : 'Specialized in industrial chemistry with recognized expertise in bioenergies, wastewater treatment and material synthesis.'
                }
              </p>

              {/* Contact info row */}
              <div className="flex flex-wrap gap-x-5 gap-y-2 mb-8 text-sm">
                <a href={`mailto:${displayEmail}`} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                  <RiMailLine className="w-4 h-4 text-blue-300 shrink-0" />
                  {displayEmail}
                </a>
                <a href={`tel:${displayPhone}`} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                  <RiPhoneLine className="w-4 h-4 text-blue-300 shrink-0" />
                  {displayPhone}
                </a>
                <span className="flex items-center gap-2 text-white/80">
                  <RiMapPinLine className="w-4 h-4 text-blue-300 shrink-0" />
                  {displayInst}
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href={`/${locale}/publications`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-gray-900 font-semibold text-sm hover:bg-blue-50 transition-colors shadow-lg">
                  {locale === 'fr' ? 'Mes publications' : 'My Publications'}
                  <RiArrowRightLine className="w-4 h-4" />
                </Link>
                <Link href={`/${locale}/contact`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/15 text-white font-semibold text-sm hover:bg-white/25 transition-colors border border-white/30">
                  <RiMailLine className="w-4 h-4" />
                  {locale === 'fr' ? 'Me contacter' : 'Contact Me'}
                </Link>
                {displayCV && (
                  <a href={displayCV} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/15 text-white font-semibold text-sm hover:bg-white/25 transition-colors border border-white/30">
                    {locale === 'fr' ? 'Télécharger le CV' : 'Download CV'}
                  </a>
                )}
              </div>
            </div>

            {/* ── Right: large profile photo ── */}
            <div className="md:col-span-2 flex justify-center md:justify-end items-center">
              <div className="relative">
                {/* Outer glow ring */}
                <div className="absolute -inset-2 rounded-[28px] bg-white/10 blur-md" />

                {/* Photo frame — portrait 3:4 ratio */}
                <div className="relative w-56 h-72 sm:w-64 sm:h-80 md:w-72 md:h-96 rounded-3xl overflow-hidden border-[3px] border-white/30 shadow-2xl bg-slate-700/60">
                  {displayPhoto ? (
                    <Image
                      src={displayPhoto}
                      alt={displayName}
                      width={288}
                      height={384}
                      className="w-full h-full object-cover object-top"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-slate-600 to-slate-800">
                      <span className="text-8xl font-bold text-white/25">T</span>
                    </div>
                  )}
                  {/* Subtle inner vignette at bottom for badge readability */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-black/40 to-transparent" />
                </div>

                {/* Institution badge */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-1.5 rounded-full bg-white text-slate-800 text-xs font-bold shadow-xl border border-slate-100">
                  {displayInst.includes('(') ? displayInst.split('(')[1].replace(')', '') : 'ENSPD'}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-2 flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Slide ${i + 1}`}
              className="focus:outline-none"
            >
              <motion.span
                className="block rounded-full"
                animate={{
                  width: i === currentSlide ? 28 : 8,
                  height: 8,
                  backgroundColor: i === currentSlide ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.45)',
                }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              />
            </button>
          ))}
        </div>

        {/* Progress bar */}
        <motion.div
          key={`progress-${currentSlide}`}
          className="absolute bottom-0 left-0 h-0.5 bg-white/60 z-2"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 6, ease: 'linear' }}
        />
      </section>

      {/* ── STATS ────────────────────────────────────────────── */}
      <motion.section 
        className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, href, color }, idx) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <Link href={href}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md hover:-translate-y-0.5 transition-all group block">
                <div className={`inline-flex p-2.5 rounded-xl ${color} mb-3 border`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-3xl font-bold text-slate-900">{value}</p>
                <p className="text-sm text-slate-500 mt-0.5 group-hover:text-slate-700 transition-colors">
                  {label}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── RECHERCHE ────────────────────────────────────────── */}
      <motion.section 
        className="max-w-6xl mx-auto px-4 sm:px-6 py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('research.title')}</h2>
          <p className="text-slate-500 text-sm">{locale === 'fr' ? 'Domaines d\'expertise et axes de travaux' : 'Domains of expertise and research axes'}</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {researchAxes.map(({ icon: Icon, title, color, items }, idx) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15, duration: 0.6 }}
              viewport={{ once: true, margin: "-100px" }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow h-full">
                <div className={`inline-flex p-3 rounded-xl ${color} mb-4`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-3">{title}</h3>
                <ul className="space-y-2">
                  {items.map((item, idx) => (
                    <li key={idx} className="text-sm text-slate-600 flex gap-2">
                      <span className="text-primary-600 font-semibold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <motion.section 
        className="bg-primary-900 text-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 text-center">
          <motion.h2 
            className="text-2xl font-bold mb-3"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            {locale === 'fr' ? 'Collaboration ou question ?' : 'Collaboration or question?'}
          </motion.h2>
          <motion.p 
            className="text-blue-200 text-sm mb-8 max-w-md mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            {locale === 'fr'
              ? 'N\'hésitez pas à prendre contact pour toute demande de collaboration scientifique ou d\'information.'
              : 'Feel free to contact me for any scientific collaboration request or information.'
            }
          </motion.p>
          <motion.div 
            className="flex flex-wrap gap-3 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href={`/${locale}/contact`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-primary-800 font-semibold text-sm hover:bg-blue-50 transition-colors">
                <RiMailLine className="w-4 h-4" />
                {locale === 'fr' ? 'Envoyer un message' : 'Send Message'}
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href={`/${locale}/publications`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-colors border border-white/20">
                {locale === 'fr' ? 'Voir les publications' : 'View Publications'}
                <RiArrowRightLine className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  )
}
