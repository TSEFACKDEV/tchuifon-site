'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { RiArticleLine, RiCalendarLine, RiExternalLinkLine, RiQuoteText } from 'react-icons/ri'

const typeColors: Record<string, string> = {
  ARTICLE: 'bg-blue-50 text-blue-700 border-blue-100',
  CONFERENCE: 'bg-purple-50 text-purple-700 border-purple-100',
  BOOK_CHAPTER: 'bg-amber-50 text-amber-700 border-amber-100',
  THESIS: 'bg-green-50 text-green-700 border-green-100',
  PATENT: 'bg-red-50 text-red-700 border-red-100',
  POSTER: 'bg-pink-50 text-pink-700 border-pink-100',
}

const typeLabels: Record<string, string> = {
  ARTICLE: 'Article',
  CONFERENCE: 'Conférence',
  BOOK_CHAPTER: 'Chapitre',
  THESIS: 'Thèse',
  PATENT: 'Brevet',
  POSTER: 'Poster',
}

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

export default function PublicationCard({ pub, index = 0 }: { pub: Publication; index?: number }) {
  const href = `/publications/${pub.slug ?? pub.id}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: 'easeOut' }}
    >
      <Link href={href} className="group block bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-primary-200 transition-all duration-300">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${typeColors[pub.type] ?? typeColors.ARTICLE}`}>
            {typeLabels[pub.type] ?? pub.type}
          </span>
          {pub.year && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <RiCalendarLine className="w-3.5 h-3.5" />
              {pub.year}
            </div>
          )}
        </div>

        {/* Titre */}
        <h3 className="text-base font-semibold text-slate-900 group-hover:text-primary-700 transition-colors leading-snug mb-2 line-clamp-2">
          {pub.title}
        </h3>

        {/* Auteurs */}
        <p className="text-xs text-slate-500 mb-3 truncate">
          {pub.authors.join(', ')}
        </p>

        {/* Abstract */}
        {pub.abstract && (
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-4">
            {pub.abstract}
          </p>
        )}

        {/* Journal/Conférence */}
        {(pub.journal || pub.conference) && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
            <RiArticleLine className="w-3.5 h-3.5 shrink-0" />
            <span className="italic truncate">{pub.journal ?? pub.conference}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex flex-wrap gap-1.5">
            {pub.keywords.slice(0, 3).map(k => (
              <span key={k} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-xs">
                {k}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {pub.citations > 0 && (
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <RiQuoteText className="w-3.5 h-3.5" />
                {pub.citations}
              </div>
            )}
            <RiExternalLinkLine className="w-4 h-4 text-slate-300 group-hover:text-primary-500 transition-colors" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}