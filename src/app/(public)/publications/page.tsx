'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import PublicationCard from '@/components/public/PublicationCard'
import { RiSearchLine, RiFilterLine } from 'react-icons/ri'

const TYPES = ['', 'ARTICLE', 'CONFERENCE', 'BOOK_CHAPTER', 'THESIS', 'PATENT', 'POSTER']
const TYPE_LABELS: Record<string, string> = {
  '': 'Tous', ARTICLE: 'Articles', CONFERENCE: 'Conférences',
  BOOK_CHAPTER: 'Chapitres', THESIS: 'Thèses', PATENT: 'Brevets', POSTER: 'Posters',
}

export default function PublicationsPage() {
  const [publications, setPublications] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  async function fetchPublications() {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '9' })
    if (type) params.set('type', type)
    if (search) params.set('keyword', search)
    const res = await fetch(`/api/publications?${params}`)
    const data = await res.json()
    setPublications(data.data ?? [])
    setTotal(data.meta?.total ?? 0)
    setLoading(false)
  }

  useEffect(() => { fetchPublications() }, [type, page])
  useEffect(() => {
    const timeout = setTimeout(() => { setPage(1); fetchPublications() }, 400)
    return () => clearTimeout(timeout)
  }, [search])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Publications</h1>
        <p className="text-slate-500">
          {total} publication{total > 1 ? 's' : ''} scientifique{total > 1 ? 's' : ''}
        </p>
      </motion.div>

      {/* Filtres */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Recherche */}
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par titre, mot-clé..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        {/* Type */}
        <div className="relative">
          <RiFilterLine className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={type}
            onChange={e => { setType(e.target.value); setPage(1) }}
            className="pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
          >
            {TYPES.map(t => (
              <option key={t} value={t}>{TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Grille */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
              <div className="h-4 bg-slate-100 rounded mb-3 w-20" />
              <div className="h-5 bg-slate-100 rounded mb-2" />
              <div className="h-4 bg-slate-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : publications.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <RiSearchLine className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>Aucune publication trouvée</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publications.map((pub: any, i) => (
            <PublicationCard key={pub.id} pub={pub} index={i} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 9 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: Math.ceil(total / 9) }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                page === i + 1 ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}