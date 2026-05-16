'use client'
import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import StatCard from '@/components/dashboard/StatCard'
import { motion } from 'framer-motion'
import {
  RiArticleLine, RiBookOpenLine, RiAwardLine, RiGroupLine,
} from 'react-icons/ri'

type DashboardStats = {
  publications: number
  courses: number
  supervisions: number
  collaborators: number
  pubByType?: Record<string, number>
  supByLevel?: Record<string, number>
  supByStatus?: Record<string, number>
}

// ── Horizontal bar chart ──────────────────────────────────────────
const PUB_TYPE_META: Record<string, { label: string; color: string }> = {
  ARTICLE:      { label: 'Articles',    color: '#3b82f6' },
  CONFERENCE:   { label: 'Conférences', color: '#8b5cf6' },
  BOOK_CHAPTER: { label: 'Chapitres',   color: '#f59e0b' },
  THESIS:       { label: 'Thèses',      color: '#10b981' },
  PATENT:       { label: 'Brevets',     color: '#ef4444' },
  POSTER:       { label: 'Posters',     color: '#64748b' },
}

function HBarChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(PUB_TYPE_META)
    .map(([key, meta]) => ({ key, ...meta, value: data[key] ?? 0 }))
    .filter(e => e.value > 0)
    .sort((a, b) => b.value - a.value)

  if (entries.length === 0) return (
    <p className="text-slate-400 text-sm text-center py-6">Aucune donnée</p>
  )
  const max = Math.max(...entries.map(e => e.value))

  return (
    <div className="space-y-3 py-2">
      {entries.map(({ key, label, color, value }) => (
        <div key={key}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-slate-600">{label}</span>
            <span className="text-xs font-bold text-slate-800">{value}</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
              initial={{ width: 0 }}
              animate={{ width: `${(value / max) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Donut chart ───────────────────────────────────────────────────
const SUP_LEVEL_META: Record<string, { label: string; color: string }> = {
  LICENCE:   { label: 'Licence',    color: '#3b82f6' },
  MASTER:    { label: 'Master',     color: '#8b5cf6' },
  INGENIEUR: { label: 'Ingénieur',  color: '#f59e0b' },
  DOCTORAT:  { label: 'Doctorat',   color: '#10b981' },
  UNKNOWN:   { label: 'Autre',      color: '#94a3b8' },
}

function DonutChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(SUP_LEVEL_META)
    .map(([key, meta]) => ({ key, ...meta, value: data[key] ?? 0 }))
    .filter(e => e.value > 0)

  const total = entries.reduce((s, e) => s + e.value, 0)

  if (total === 0) return (
    <p className="text-slate-400 text-sm text-center py-6">Aucune donnée</p>
  )

  // SVG donut: 32px radius, 8px stroke
  const R = 40, STROKE = 18, C = 2 * Math.PI * R
  let offset = 0
  const segments = entries.map(e => {
    const len = (e.value / total) * C
    const seg = { ...e, dasharray: `${len - 1} ${C - len + 1}`, dashoffset: -offset }
    offset += len
    return seg
  })

  return (
    <div className="flex items-center gap-6">
      {/* SVG */}
      <div className="relative shrink-0">
        <svg width={120} height={120} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={R} fill="none" stroke="#f1f5f9" strokeWidth={STROKE} />
          {segments.map(seg => (
            <motion.circle
              key={seg.key}
              cx="50" cy="50" r={R}
              fill="none"
              stroke={seg.color}
              strokeWidth={STROKE}
              strokeDasharray={seg.dasharray}
              strokeDashoffset={seg.dashoffset}
              strokeLinecap="butt"
              transform="rotate(-90 50 50)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-slate-800">{total}</span>
          <span className="text-xs text-slate-400">total</span>
        </div>
      </div>
      {/* Legend */}
      <div className="space-y-2 flex-1 min-w-0">
        {segments.map(({ key, label, color, value }) => (
          <div key={key} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <span className="text-xs text-slate-600 truncate">{label}</span>
            <span className="ml-auto text-xs font-semibold text-slate-800">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Status progress bar ───────────────────────────────────────────
const STATUS_META: Record<string, { label: string; color: string }> = {
  IN_PROGRESS: { label: 'En cours',   color: '#3b82f6' },
  COMPLETED:   { label: 'Terminés',   color: '#10b981' },
  ABANDONED:   { label: 'Abandonnés', color: '#ef4444' },
}

function StatusBars({ data }: { data: Record<string, number> }) {
  const total = Object.values(data).reduce((s, v) => s + v, 0)
  if (total === 0) return <p className="text-slate-400 text-sm text-center py-4">Aucune donnée</p>

  const entries = Object.entries(STATUS_META)
    .map(([key, meta]) => ({ key, ...meta, value: data[key] ?? 0, pct: Math.round(((data[key] ?? 0) / total) * 100) }))
    .filter(e => e.value > 0)

  return (
    <div className="space-y-3 py-1">
      {/* Stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
        {entries.map(e => (
          <motion.div
            key={e.key}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{ backgroundColor: e.color }}
            initial={{ flex: 0 }}
            animate={{ flex: e.value }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        ))}
      </div>
      {/* Labels */}
      <div className="flex flex-wrap gap-x-5 gap-y-1.5">
        {entries.map(e => (
          <div key={e.key} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
            <span className="text-xs text-slate-600">{e.label}</span>
            <span className="text-xs font-bold text-slate-800">{e.value}</span>
            <span className="text-xs text-slate-400">({e.pct}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const locale = useLocale()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats?dashboard=1')
      .then(r => r.json())
      .then((data: DashboardStats) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const cards = [
    { label: 'Publications', value: stats?.publications ?? 0, icon: RiArticleLine,  color: 'blue'   as const, href: `/${locale}/dashboard/publications` },
    { label: 'Cours',        value: stats?.courses      ?? 0, icon: RiBookOpenLine, color: 'green'  as const, href: `/${locale}/dashboard/courses` },
    { label: 'Encadrements', value: stats?.supervisions ?? 0, icon: RiAwardLine,    color: 'amber'  as const, href: `/${locale}/dashboard/supervisions` },
    { label: 'Collaborateurs',value: stats?.collaborators?? 0, icon: RiGroupLine,   color: 'purple' as const, href: `/${locale}/dashboard/collaborators` },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400">
        <span className="animate-pulse">Chargement…</span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Vue d&apos;ensemble</h1>
        <p className="text-slate-500 mt-1 text-sm">Statistiques générales du site</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <Link key={card.label} href={card.href}>
            <StatCard label={card.label} value={card.value} icon={card.icon} color={card.color} index={i} />
          </Link>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Publications par type */}
        <motion.div
          className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Publications par type</h2>
              <p className="text-xs text-slate-400 mt-0.5">{stats?.publications ?? 0} publiée(s) au total</p>
            </div>
            <Link href={`/${locale}/dashboard/publications`}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors">
              Voir tout →
            </Link>
          </div>
          <HBarChart data={stats?.pubByType ?? {}} />
        </motion.div>

        {/* Encadrements par niveau */}
        <motion.div
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Encadrements par niveau</h2>
              <p className="text-xs text-slate-400 mt-0.5">{stats?.supervisions ?? 0} au total</p>
            </div>
            <Link href={`/${locale}/dashboard/supervisions`}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors">
              Voir tout →
            </Link>
          </div>
          <DonutChart data={stats?.supByLevel ?? {}} />
        </motion.div>

      </div>

      {/* Supervision status bar */}
      <motion.div
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Statut des encadrements</h2>
            <p className="text-xs text-slate-400 mt-0.5">Répartition en cours / terminés / abandonnés</p>
          </div>
        </div>
        <StatusBars data={stats?.supByStatus ?? {}} />
      </motion.div>

    </div>
  )
}
