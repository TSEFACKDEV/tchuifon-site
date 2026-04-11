'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { RiUserLine, RiCalendarLine, RiArrowRightLine } from 'react-icons/ri'
import { clsx } from 'clsx'

const levelLabels: Record<string, string> = {
  INGENIEUR: 'Ingénieur',
  MASTER_2: 'Master 2',
  DOCTORAT: 'Doctorat',
  POST_DOC: 'Post-Doc',
}

const statusConfig: Record<string, { label: string; class: string }> = {
  IN_PROGRESS: { label: 'En cours', class: 'bg-blue-50 text-blue-700' },
  COMPLETED: { label: 'Terminé', class: 'bg-green-50 text-green-700' },
  ABANDONED: { label: 'Abandonné', class: 'bg-slate-100 text-slate-500' },
}

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

export default function SupervisionCard({ supervision, index = 0 }: { supervision: Supervision; index?: number }) {
  const status = statusConfig[supervision.status] ?? statusConfig.IN_PROGRESS
  const startYear = supervision.startDate ? new Date(supervision.startDate).getFullYear() : null
  const endYear = supervision.endDate ? new Date(supervision.endDate).getFullYear() : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: 'easeOut' }}
    >
      <Link href={`/supervisions/${supervision.id}`} className="group block bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-primary-200 transition-all duration-300">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            {supervision.level && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100">
                {levelLabels[supervision.level] ?? supervision.level}
              </span>
            )}
            <span className={clsx('px-2.5 py-1 rounded-lg text-xs font-medium', status.class)}>
              {status.label}
            </span>
          </div>
          {(startYear || endYear) && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <RiCalendarLine className="w-3.5 h-3.5" />
              {startYear}{endYear && startYear !== endYear ? ` – ${endYear}` : ''}
            </div>
          )}
        </div>

        {/* Étudiant */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            <RiUserLine className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-sm font-semibold text-slate-800">{supervision.studentName}</p>
        </div>

        {/* Sujet */}
        {supervision.topic && (
          <h3 className="text-base font-semibold text-slate-900 group-hover:text-primary-700 transition-colors leading-snug mb-2 line-clamp-2">
            {supervision.topic}
          </h3>
        )}

        {supervision.description && (
          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
            {supervision.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-100">
          <span className="flex items-center gap-1 text-xs font-medium text-primary-600 group-hover:gap-2 transition-all">
            Voir les détails <RiArrowRightLine className="w-3.5 h-3.5" />
          </span>
        </div>
      </Link>
    </motion.div>
  )
}