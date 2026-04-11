'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import CourseCard from '@/components/public/CourseCard'
import { RiFilterLine } from 'react-icons/ri'

const LEVELS = ['', 'LICENCE', 'MASTER', 'INGENIEUR', 'DOCTORAT']
const LEVEL_LABELS: Record<string, string> = {
  '': 'Tous les niveaux', LICENCE: 'Licence', MASTER: 'Master', INGENIEUR: 'Ingénieur', DOCTORAT: 'Doctorat',
}

export default function CoursesPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [level, setLevel] = useState('')

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ active: 'true' })
    if (level) params.set('level', level)
    fetch(`/api/courses?${params}`)
      .then(r => r.json())
      .then(d => { setCourses(d.data ?? []); setLoading(false) })
  }, [level])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Cours dispensés</h1>
        <p className="text-slate-500">{courses.length} cours au total</p>
      </motion.div>

      {/* Filtres par niveau */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex flex-wrap gap-2 mb-8">
        {LEVELS.map(l => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              level === l ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {LEVEL_LABELS[l]}
          </button>
        ))}
      </motion.div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
              <div className="h-4 bg-slate-100 rounded mb-3 w-24" />
              <div className="h-5 bg-slate-100 rounded mb-2" />
              <div className="h-4 bg-slate-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <RiFilterLine className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>Aucun cours trouvé</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any, i) => (
            <CourseCard key={course.id} course={course} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}