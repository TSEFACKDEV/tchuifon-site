'use client'
import { useLocale } from 'next-intl'
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiSearchLine, RiFilterLine, RiArticleLine,
  RiArrowLeftSLine, RiArrowRightSLine, RiCloseLine,
} from 'react-icons/ri'
import PublicationCard from '@/components/public/PublicationCard'

export const dynamic = 'force-dynamic'

type Publication = {
  id: string
  slug?: string
  title?: string
  abstract?: string
  authors: string[]
  journal?: string
  conference?: string
  year?: number
  type: string
  keywords: string[]
  citations: number
  doi?: string
}

type Meta = { total: number; page: number; limit: number; totalPages: number }

const TYPE_OPTIONS = [
  { value: '', labelFr: 'Tous', labelEn: 'All' },
  { value: 'ARTICLE', labelFr: 'Articles', labelEn: 'Articles' },
  { value: 'CONFERENCE', labelFr: 'Conférences', labelEn: 'Conferences' },
  { value: 'BOOK_CHAPTER', labelFr: 'Chapitres', labelEn: 'Chapters' },
  { value: 'THESIS', labelFr: 'Thèses', labelEn: 'Theses' },
  { value: 'PATENT', labelFr: 'Brevets', labelEn: 'Patents' },
  { value: 'POSTER', labelFr: 'Posters', labelEn: 'Posters' },
]

const LIMIT = 9

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="h-6 w-20 bg-slate-100 rounded-lg" />
        <div className="h-4 w-10 bg-slate-100 rounded" />
      </div>
      <div className="h-5 bg-slate-100 rounded mb-2" />
      <div className="h-4 w-3/4 bg-slate-100 rounded mb-3" />
      <div className="h-4 bg-slate-100 rounded mb-1" />
      <div className="h-4 w-5/6 bg-slate-100 rounded mb-4" />
      <div className="flex justify-between pt-3 border-t border-slate-100">
        <div className="flex gap-1.5">
          <div className="h-5 w-14 bg-slate-100 rounded-md" />
          <div className="h-5 w-14 bg-slate-100 rounded-md" />
        </div>
        <div className="h-4 w-4 bg-slate-100 rounded" />
      </div>
    </div>
  )
}

export default function PublicationsPage() {
  const locale = useLocale()
  const fr = locale === 'fr'

  const [publications, setPublications] = useState<Publication[]>([])
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: LIMIT, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [page, setPage] = useState(1)
  const [years, setYears] = useState<number[]>([])

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [search])

  const fetchPublications = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) })
      if (typeFilter) params.set('type', typeFilter)
      if (yearFilter) params.set('year', yearFilter)
      if (debouncedSearch) params.set('keyword', debouncedSearch)
      const res = await fetch(`/api/publications?${params}`)
      if (res.ok) {
        const json = await res.json()
        setPublications(json.data ?? [])
        setMeta(json.meta ?? { total: 0, page: 1, limit: LIMIT, totalPages: 0 })
        // collect unique years from data for year filter
        setYears(prev => {
          const all = [...new Set([...prev, ...(json.data ?? []).map((p: Publication) => p.year).filter(Boolean)])] as number[]
          return all.sort((a, b) => b - a)
        })
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [page, typeFilter, yearFilter, debouncedSearch])

  useEffect(() => { fetchPublications() }, [fetchPublications])

  const hasFilters = typeFilter || yearFilter || debouncedSearch
  const clearFilters = () => { setTypeFilter(''); setYearFilter(''); setSearch(''); setPage(1) }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Page header ─────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex p-2 rounded-xl bg-blue-50 text-blue-700">
                  <RiArticleLine className="w-5 h-5" />
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {fr ? 'Publications' : 'Publications'}
                </h1>
              </div>
              <p className="text-slate-500 text-sm ml-0 sm:ml-1">
                {fr
                  ? 'Travaux scientifiques, articles et communications'
                  : 'Scientific works, articles and communications'}
                {!loading && meta.total > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                    {meta.total}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* ── Search + Year ───────────────────────────────── */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={fr ? 'Rechercher un titre, auteur, mot-clé…' : 'Search title, author, keyword…'}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-primary-400 focus:outline-none transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <RiCloseLine className="w-4 h-4" />
                </button>
              )}
            </div>

            {years.length > 0 && (
              <select
                value={yearFilter}
                onChange={e => { setYearFilter(e.target.value); setPage(1) }}
                className="w-full sm:w-36 px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-primary-400 focus:outline-none transition-colors"
              >
                <option value="">{fr ? 'Toutes années' : 'All years'}</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            )}
          </div>

          {/* ── Type filter pills ───────────────────────────── */}
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <RiFilterLine className="w-4 h-4 text-slate-400 shrink-0" />
            {TYPE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => { setTypeFilter(opt.value); setPage(1) }}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap
                  ${typeFilter === opt.value
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

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </motion.div>
          ) : publications.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="inline-flex p-4 rounded-2xl bg-slate-100 mb-4">
                <RiArticleLine className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-700 font-medium mb-1">
                {fr ? 'Aucune publication trouvée' : 'No publications found'}
              </p>
              <p className="text-slate-400 text-sm">
                {hasFilters
                  ? (fr ? 'Essayez d\'ajuster vos filtres.' : 'Try adjusting your filters.')
                  : (fr ? 'Les publications apparaîtront ici.' : 'Publications will appear here.')}
              </p>
              {hasFilters && (
                <button onClick={clearFilters} className="mt-4 text-sm text-primary-600 hover:underline">
                  {fr ? 'Effacer les filtres' : 'Clear filters'}
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {publications.map((pub, idx) => (
                  <PublicationCard key={pub.id} pub={pub} index={idx} />
                ))}
              </div>

              {/* ── Pagination ────────────────────────────── */}
              {meta.totalPages > 1 && (
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-slate-500 order-2 sm:order-1">
                    {fr
                      ? `${(page - 1) * LIMIT + 1}–${Math.min(page * LIMIT, meta.total)} sur ${meta.total}`
                      : `${(page - 1) * LIMIT + 1}–${Math.min(page * LIMIT, meta.total)} of ${meta.total}`}
                  </p>
                  <div className="flex items-center gap-2 order-1 sm:order-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <RiArrowLeftSLine className="w-4 h-4" />
                      <span className="hidden sm:inline">{fr ? 'Précédent' : 'Previous'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === meta.totalPages || Math.abs(p - page) <= 1)
                        .reduce<(number | 'ellipsis')[]>((acc, p, i, arr) => {
                          if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('ellipsis')
                          acc.push(p)
                          return acc
                        }, [])
                        .map((p, i) =>
                          p === 'ellipsis' ? (
                            <span key={`e${i}`} className="px-2 text-slate-400 text-sm">…</span>
                          ) : (
                            <button
                              key={p}
                              onClick={() => setPage(p as number)}
                              className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors
                                ${p === page
                                  ? 'bg-primary-600 text-white'
                                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                              {p}
                            </button>
                          )
                        )}
                    </div>

                    <button
                      onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                      disabled={page === meta.totalPages}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="hidden sm:inline">{fr ? 'Suivant' : 'Next'}</span>
                      <RiArrowRightSLine className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
