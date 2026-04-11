'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { RiBookOpenLine, RiTimeLine, RiMedalLine, RiArrowRightLine } from 'react-icons/ri'
import { clsx } from 'clsx'

const levelColors: Record<string, string> = {
  LICENCE: 'bg-green-50 text-green-700 border-green-100',
  MASTER: 'bg-blue-50 text-blue-700 border-blue-100',
  INGENIEUR: 'bg-amber-50 text-amber-700 border-amber-100',
  DOCTORAT: 'bg-purple-50 text-purple-700 border-purple-100',
}

const levelLabels: Record<string, string> = {
  LICENCE: 'Licence',
  MASTER: 'Master',
  INGENIEUR: 'Ingénieur',
  DOCTORAT: 'Doctorat',
}

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

export default function CourseCard({ course, index = 0 }: { course: Course; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: 'easeOut' }}
    >
      <Link href={`/courses/${course.id}`} className="group block bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-primary-200 transition-all duration-300">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {course.level && (
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${levelColors[course.level] ?? ''}`}>
                {levelLabels[course.level] ?? course.level}
              </span>
            )}
            {course.code && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-slate-100 text-slate-600">
                {course.code}
              </span>
            )}
          </div>
          <span className={clsx(
            'text-xs px-2 py-1 rounded-full font-medium',
            course.isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-400'
          )}>
            {course.isActive ? 'Actif' : 'Inactif'}
          </span>
        </div>

        {/* Icône + titre */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 group-hover:bg-primary-100 transition-colors">
            <RiBookOpenLine className="w-5 h-5 text-primary-600" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 group-hover:text-primary-700 transition-colors leading-snug">
            {course.title}
          </h3>
        </div>

        {/* Description */}
        {course.description && (
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-4 ml-13">
            {course.description}
          </p>
        )}

        {/* Infos */}
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
          {course.hours && (
            <div className="flex items-center gap-1.5">
              <RiTimeLine className="w-3.5 h-3.5" />
              {course.hours}h
            </div>
          )}
          {course.credits && (
            <div className="flex items-center gap-1.5">
              <RiMedalLine className="w-3.5 h-3.5" />
              {course.credits} crédits
            </div>
          )}
          {course.semester && (
            <span className="px-2 py-0.5 rounded bg-slate-100">{course.semester}</span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            {course.objectives.length} objectif{course.objectives.length > 1 ? 's' : ''}
          </p>
          <span className="flex items-center gap-1 text-xs font-medium text-primary-600 group-hover:gap-2 transition-all">
            Voir le cours <RiArrowRightLine className="w-3.5 h-3.5" />
          </span>
        </div>
      </Link>
    </motion.div>
  )
}