'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import SupervisionCard from '@/components/public/SupervisionCard'

const STATUSES = ['', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED']
const STATUS_LABELS: Record<string, string> = {
  '': 'Tous', IN_PROGRESS: 'En cours', COMPLETED: 'Terminés', ABANDONED: 'Abandonnés',
}
const LEVELS = ['', 'INGENIEUR', 'MASTER_2', 'DOCTORAT', 'POST_DOC']
const LEVEL_LABELS: Record<string, string> = {
  '': 'Tous niveaux', INGENIEUR: 'Ingénieur', MASTER_2: 'Master 2', DOCTORAT: 'Doctorat', POST_DOC: 'Post-Doc',
}

export default function SupervisionsPage() {
  const [supervisions, setSupervisions] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [level, setLevel] = useState('')

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (level) params.set('level', level)
    fetch(`/api/supervisions?${params}`)
      .then(r => r.json())
      .then(d => { setSupervisions(d.data ?? []); setLoading(false) })
  }, [status, level])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Encadrements</h1>
        <p className="text-slate-500">Travaux d'étudiants encadrés — thèses, mémoires et projets</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex flex-wrap gap-3 mb-8">
        <div className="flex flex-wrap gap-2">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${status === s ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {LEVELS.map(l => (
            <button key={l} onClick={() => setLevel(l)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${level === l ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {LEVEL_LABELS[l]}
            </button>
          ))}
        </div>
      </motion.div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse h-44" />
          ))}
        </div>
      ) : supervisions.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p>Aucun encadrement trouvé</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {supervisions.map((s: any, i) => (
            <SupervisionCard key={s.id} supervision={s} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}