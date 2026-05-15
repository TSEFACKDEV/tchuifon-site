'use client'
import { useLocale } from 'next-intl'
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RiGroupLine, RiSearchLine, RiCloseLine, RiMapPinLine } from 'react-icons/ri'
import CollaboratorCard from '@/components/public/CollaboratorCard'

export const dynamic = 'force-dynamic'

type Collaborator = {
  id: string
  name?: string
  title?: string
  institution?: string
  department?: string
  country?: string
  email?: string
  website?: string
  photoUrl?: string
  researchArea?: string
  googleScholar?: string
  orcid?: string
  publications?: { publication: { id: string } }[]
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse text-center">
      <div className="flex justify-center mb-4">
        <div className="w-20 h-20 rounded-full bg-slate-100" />
      </div>
      <div className="h-4 w-32 bg-slate-100 rounded mx-auto mb-2" />
      <div className="h-3 w-28 bg-slate-100 rounded mx-auto mb-3" />
      <div className="h-3 w-24 bg-slate-100 rounded mx-auto mb-2" />
      <div className="h-4 w-20 bg-slate-100 rounded-full mx-auto mb-3" />
      <div className="flex justify-between pt-3 border-t border-slate-100">
        <div className="h-3 w-16 bg-slate-100 rounded" />
        <div className="h-3 w-4 bg-slate-100 rounded" />
      </div>
    </div>
  )
}

export default function CollaboratorsPage() {
  const locale = useLocale()
  const fr = locale === 'fr'

  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [filtered, setFiltered] = useState<Collaborator[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [countryFilter, setCountryFilter] = useState('')
  const [countries, setCountries] = useState<string[]>([])

  const fetchCollaborators = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/collaborators')
      if (res.ok) {
        const json = await res.json()
        const data: Collaborator[] = json.data ?? []
        setCollaborators(data)
        const uniqueCountries = [...new Set(data.map(c => c.country).filter(Boolean))] as string[]
        setCountries(uniqueCountries.sort())
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchCollaborators() }, [fetchCollaborators])

  useEffect(() => {
    let result = [...collaborators]
    if (countryFilter) result = result.filter(c => c.country === countryFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.institution?.toLowerCase().includes(q) ||
        c.researchArea?.toLowerCase().includes(q) ||
        c.country?.toLowerCase().includes(q)
      )
    }
    setFiltered(result)
  }, [collaborators, countryFilter, search])

  const hasFilters = countryFilter || search.trim()
  const clearFilters = () => { setCountryFilter(''); setSearch('') }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex p-2 rounded-xl bg-purple-50 text-purple-700">
                  <RiGroupLine className="w-5 h-5" />
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {fr ? 'Collaborateurs' : 'Collaborators'}
                </h1>
              </div>
              <p className="text-slate-500 text-sm">
                {fr ? 'Partenaires scientifiques et académiques' : 'Scientific and academic partners'}
                {!loading && collaborators.length > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-medium">
                    {collaborators.length}
                  </span>
                )}
              </p>
            </div>
            {/* Countries count */}
            {!loading && countries.length > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-slate-500 shrink-0">
                <RiMapPinLine className="w-4 h-4" />
                {fr ? `${countries.length} pays représentés` : `${countries.length} countries represented`}
              </div>
            )}
          </div>

          {/* Search + Country */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={fr ? 'Rechercher nom, institution, domaine…' : 'Search name, institution, area…'}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-primary-400 focus:outline-none transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <RiCloseLine className="w-4 h-4" />
                </button>
              )}
            </div>
            {countries.length > 0 && (
              <select
                value={countryFilter}
                onChange={e => setCountryFilter(e.target.value)}
                className="w-full sm:w-48 px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-primary-400 focus:outline-none transition-colors"
              >
                <option value="">{fr ? 'Tous les pays' : 'All countries'}</option>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors shrink-0"
              >
                <RiCloseLine className="w-4 h-4" />
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
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center">
              <div className="inline-flex p-4 rounded-2xl bg-slate-100 mb-4">
                <RiGroupLine className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-700 font-medium mb-1">
                {fr ? 'Aucun collaborateur trouvé' : 'No collaborators found'}
              </p>
              <p className="text-slate-400 text-sm">
                {hasFilters
                  ? (fr ? 'Essayez d\'ajuster votre recherche.' : 'Try adjusting your search.')
                  : (fr ? 'Les collaborateurs apparaîtront ici.' : 'Collaborators will appear here.')}
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
                  {fr ? `${filtered.length} collaborateur${filtered.length > 1 ? 's' : ''}` : `${filtered.length} collaborator${filtered.length > 1 ? 's' : ''}`}
                  {hasFilters && ` (${fr ? 'filtrés' : 'filtered'})`}
                </p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map((collaborator, idx) => (
                  <CollaboratorCard key={collaborator.id} collaborator={collaborator} index={idx} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
