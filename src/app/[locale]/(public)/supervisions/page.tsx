'use client'
import { useLocale } from 'next-intl'
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RiAwardLine, RiFilterLine, RiSearchLine, RiCloseLine } from 'react-icons/ri'
import SupervisionCard from '@/components/public/SupervisionCard'

export const dynamic = 'force-dynamic'

type Supervision = {
  id: string
  studentName?: string
  level?: string
  topic?: string
  description?: string
  startDate?: string
  endDate?: string
  status: string
}

const LEVEL_OPTIONS = [
  { value: '', labelFr: 'Tous niveaux', labelEn: 'All levels' },
  { value: 'INGENIEUR', labelFr: 'Ingénieur', labelEn: 'Engineer' },
  { value: 'MASTER_2', labelFr: 'Master 2', labelEn: 'Master 2' },
  { value: 'DOCTORAT', labelFr: 'Doctorat', labelEn: 'Doctorate' },
  { value: 'POST_DOC', labelFr: 'Post-Doc', labelEn: 'Post-Doc' },
]

const STATUS_OPTIONS = [
  { value: '', labelFr: 'Tous statuts', labelEn: 'All statuses' },
  { value: 'IN_PROGRESS', labelFr: 'En cours', labelEn: 'In progress' },
  { value: 'COMPLETED', labelFr: 'Terminés', labelEn: 'Completed' },
  { value: 'ABANDONED', labelFr: 'Abandonnés', labelEn: 'Abandoned' },
]

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="flex gap-2">
          <div className="h-6 w-20 bg-slate-100 rounded-lg" />
          <div className="h-6 w-16 bg-slate-100 rounded-lg" />
        </div>
        <div className="h-4 w-12 bg-slate-100 rounded" />
      </div>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 bg-slate-100 rounded-full shrink-0" />
        <div className="h-4 w-40 bg-slate-100 rounded" />
      </div>
      <div className="h-5 bg-slate-100 rounded mb-2" />
      <div className="h-4 w-5/6 bg-slate-100 rounded mb-4" />
      <div className="flex justify-end pt-3 border-t border-slate-100">
        <div className="h-4 w-24 bg-slate-100 rounded" />
      </div>
    </div>
  )
}

export default function SupervisionsPage() {
  const locale = useLocale()
  const fr = locale === 'fr'

  const [supervisions, setSupervisions] = useState<Supervision[]>([])
  const [filtered, setFiltered] = useState<Supervision[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const fetchSupervisions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/supervisions')
      if (res.ok) {
        const json = await res.json()
        setSupervisions(json.data ?? [])
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchSupervisions() }, [fetchSupervisions])

  useEffect(() => {
    let result = [...supervisions]
    if (levelFilter) result = result.filter(s => s.level === levelFilter)
    if (statusFilter) result = result.filter(s => s.status === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(s =>
        s.studentName?.toLowerCase().includes(q) ||
        s.topic?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q)
      )
    }
    setFiltered(result)
  }, [supervisions, levelFilter, statusFilter, search])

  const hasFilters = levelFilter || statusFilter || search.trim()
  const clearFilters = () => { setLevelFilter(''); setStatusFilter(''); setSearch('') }

  const inProgress = supervisions.filter(s => s.status === 'IN_PROGRESS').length
  const completed = supervisions.filter(s => s.status === 'COMPLETED').length

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex p-2 rounded-xl bg-amber-50 text-amber-700">
                  <RiAwardLine className="w-5 h-5" />
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {fr ? 'Encadrements' : 'Supervisions'}
                </h1>
              </div>
              <p className="text-slate-500 text-sm">
                {fr ? 'Étudiants encadrés en master, ingénieur et doctorat' : 'Students supervised at master, engineer and doctorate level'}
                {!loading && supervisions.length > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                    {supervisions.length}
                  </span>
                )}
              </p>
            </div>
            {/* Mini stats */}
            {!loading && supervisions.length > 0 && (
              <div className="flex gap-3 shrink-0">
                <div className="text-center px-4 py-2 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-lg font-bold text-blue-700">{inProgress}</p>
                  <p className="text-xs text-blue-500">{fr ? 'En cours' : 'In progress'}</p>
                </div>
                <div className="text-center px-4 py-2 rounded-xl bg-green-50 border border-green-100">
                  <p className="text-lg font-bold text-green-700">{completed}</p>
                  <p className="text-xs text-green-500">{fr ? 'Terminés' : 'Completed'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={fr ? 'Rechercher étudiant, sujet…' : 'Search student, topic…'}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-primary-400 focus:outline-none transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <RiCloseLine className="w-4 h-4" />
                </button>
              )}
            </div>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value) }}
              className="w-full sm:w-44 px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-primary-400 focus:outline-none transition-colors"
            >
              {STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{fr ? o.labelFr : o.labelEn}</option>
              ))}
            </select>
          </div>

          {/* Level pills */}
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
            <RiFilterLine className="w-4 h-4 text-slate-400 shrink-0" />
            {LEVEL_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setLevelFilter(opt.value)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap
                  ${levelFilter === opt.value
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300 hover:text-primary-700'}`}
              >
                {fr ? opt.labelFr : opt.labelEn}
              </button>
            ))}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors"
              >
                <RiCloseLine className="w-3.5 h-3.5" />
                {fr ? 'Effacer' : 'Clear'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center">
              <div className="inline-flex p-4 rounded-2xl bg-slate-100 mb-4">
                <RiAwardLine className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-700 font-medium mb-1">
                {fr ? 'Aucun encadrement trouvé' : 'No supervisions found'}
              </p>
              <p className="text-slate-400 text-sm">
                {hasFilters
                  ? (fr ? 'Essayez d\'ajuster vos filtres.' : 'Try adjusting your filters.')
                  : (fr ? 'Les encadrements apparaîtront ici.' : 'Supervisions will appear here.')}
              </p>
              {hasFilters && (
                <button onClick={clearFilters} className="mt-4 text-sm text-primary-600 hover:underline">
                  {fr ? 'Effacer les filtres' : 'Clear filters'}
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {filtered.length > 0 && (
                <p className="text-sm text-slate-500 mb-5">
                  {fr ? `${filtered.length} encadrement${filtered.length > 1 ? 's' : ''}` : `${filtered.length} supervision${filtered.length > 1 ? 's' : ''}`}
                  {hasFilters && ` (${fr ? 'filtrés' : 'filtered'})`}
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((supervision, idx) => (
                  <SupervisionCard key={supervision.id} supervision={supervision} index={idx} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
