'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import CollaboratorCard from '@/components/public/CollaboratorCard'
import { RiSearchLine } from 'react-icons/ri'

export default function CollaboratorsPage() {
  const [collaborators, setCollaborators] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('country', search)
    fetch(`/api/collaborators?${params}`)
      .then(r => r.json())
      .then(d => { setCollaborators(d.data ?? []); setLoading(false) })
  }, [search])

  const filtered = collaborators.filter((c: any) =>
    !search ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.institution?.toLowerCase().includes(search.toLowerCase()) ||
    c.country?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Collaborateurs</h1>
        <p className="text-slate-500">Réseau de collaborateurs scientifiques internationaux</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="relative max-w-sm mb-8">
        <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher par nom, institution, pays..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </motion.div>

      {loading ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse h-52" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p>Aucun collaborateur trouvé</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((c: any, i) => (
            <CollaboratorCard key={c.id} collaborator={c} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}