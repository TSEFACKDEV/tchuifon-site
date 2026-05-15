'use client'
import { useLocale } from 'next-intl'
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RiBookOpenLine, RiFilterLine, RiSearchLine, RiCloseLine } from 'react-icons/ri'
import CourseCard from '@/components/public/CourseCard'

export const dynamic = 'force-dynamic'

type Course = {
  id: string
  title?: string
  code?: string
  level?: string
  description?: string
  credits?: number
  hours?: number
  semester?: string
  objectives: string[]
  isActive: boolean
}

const LEVEL_OPTIONS = [
  { value: '', labelFr: 'Tous niveaux', labelEn: 'All levels' },
  { value: 'LICENCE', labelFr: 'Licence', labelEn: 'Bachelor' },
  { value: 'MASTER', labelFr: 'Master', labelEn: 'Master' },
  { value: 'INGENIEUR', labelFr: 'Ingénieur', labelEn: 'Engineer' },
  { value: 'DOCTORAT', labelFr: 'Doctorat', labelEn: 'Doctorate' },
]

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="flex gap-2">
          <div className="h-6 w-20 bg-slate-100 rounded-lg" />
          <div className="h-6 w-16 bg-slate-100 rounded-lg" />
        </div>
        <div className="h-6 w-12 bg-slate-100 rounded-full" />
      </div>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 bg-slate-100 rounded-xl shrink-0" />
        <div className="flex-1">
          <div className="h-5 bg-slate-100 rounded mb-2" />
          <div className="h-4 w-3/4 bg-slate-100 rounded" />
        </div>
      </div>
      <div className="flex gap-4 mb-4">
        <div className="h-4 w-16 bg-slate-100 rounded" />
        <div className="h-4 w-20 bg-slate-100 rounded" />
      </div>
      <div className="flex justify-between pt-3 border-t border-slate-100">
        <div className="flex gap-1.5">
          <div className="h-5 w-14 bg-slate-100 rounded-md" />
          <div className="h-5 w-14 bg-slate-100 rounded-md" />
        </div>
        <div className="h-4 w-16 bg-slate-100 rounded" />
      </div>
    </div>
  )
}

export default function CoursesPage() {
  const locale = useLocale()
  const fr = locale === 'fr'

  const [courses, setCourses] = useState<Course[]>([])
  const [filtered, setFiltered] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/courses')
      if (res.ok) {
        const json = await res.json()
        setCourses(json.data ?? [])
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchCourses() }, [fetchCourses])

  // client-side filter + search
  useEffect(() => {
    let result = [...courses]
    if (levelFilter) result = result.filter(c => c.level === levelFilter)
    if (activeFilter === 'active') result = result.filter(c => c.isActive)
    if (activeFilter === 'inactive') result = result.filter(c => !c.isActive)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(c =>
        c.title?.toLowerCase().includes(q) ||
        c.code?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      )
    }
    setFiltered(result)
  }, [courses, levelFilter, activeFilter, search])

  const hasFilters = levelFilter || activeFilter !== 'all' || search.trim()
  const clearFilters = () => { setLevelFilter(''); setActiveFilter('all'); setSearch('') }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex p-2 rounded-xl bg-green-50 text-green-700">
                  <RiBookOpenLine className="w-5 h-5" />
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {fr ? 'Cours dispensés' : 'Courses Taught'}
                </h1>
              </div>
              <p className="text-slate-500 text-sm">
                {fr ? 'Enseignements et modules pédagogiques' : 'Teaching modules and courses'}
                {!loading && courses.length > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                    {courses.length}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={fr ? 'Rechercher un cours, code…' : 'Search course, code…'}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-primary-400 focus:outline-none transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <RiCloseLine className="w-4 h-4" />
                </button>
              )}
            </div>
            <select
              value={activeFilter}
              onChange={e => setActiveFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="w-full sm:w-40 px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-primary-400 focus:outline-none transition-colors"
            >
              <option value="all">{fr ? 'Tous les cours' : 'All courses'}</option>
              <option value="active">{fr ? 'Cours actifs' : 'Active courses'}</option>
              <option value="inactive">{fr ? 'Cours inactifs' : 'Inactive courses'}</option>
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
                <RiBookOpenLine className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-700 font-medium mb-1">
                {fr ? 'Aucun cours trouvé' : 'No courses found'}
              </p>
              <p className="text-slate-400 text-sm">
                {hasFilters
                  ? (fr ? 'Essayez d\'ajuster vos filtres.' : 'Try adjusting your filters.')
                  : (fr ? 'Les cours apparaîtront ici.' : 'Courses will appear here.')}
              </p>
              {hasFilters && (
                <button onClick={clearFilters} className="mt-4 text-sm text-primary-600 hover:underline">
                  {fr ? 'Effacer les filtres' : 'Clear filters'}
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {!loading && filtered.length > 0 && (
                <p className="text-sm text-slate-500 mb-5">
                  {fr ? `${filtered.length} cours` : `${filtered.length} course${filtered.length > 1 ? 's' : ''}`}
                  {hasFilters && ` (${fr ? 'filtrés' : 'filtered'})`}
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((course, idx) => (
                  <CourseCard key={course.id} course={course} index={idx} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
