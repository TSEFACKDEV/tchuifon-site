'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { RiMapPinLine, RiExternalLinkLine, RiUserLine } from 'react-icons/ri'

type Collaborator = {
  id: string
  name?: string
  title?: string
  institution?: string
  country?: string
  photoUrl?: string
  researchArea?: string
  publications?: { publication: { id: string } }[]
}

export default function CollaboratorCard({ collaborator, index = 0 }: { collaborator: Collaborator; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay: index * 0.07, ease: 'easeOut' }}
    >
      <Link href={`/collaborators/${collaborator.id}`} className="group block bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-primary-200 transition-all duration-300 text-center">
        {/* Photo */}
        <div className="flex justify-center mb-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 group-hover:border-primary-300 transition-colors">
            {collaborator.photoUrl ? (
              <Image
                src={collaborator.photoUrl}
                alt={collaborator.name ?? 'Photo'}
                fill className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <RiUserLine className="w-8 h-8 text-slate-400" />
              </div>
            )}
          </div>
        </div>

        {/* Nom */}
        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-primary-700 transition-colors mb-1">
          {collaborator.name}
        </h3>

        {/* Titre */}
        {collaborator.title && (
          <p className="text-xs text-slate-500 mb-3 line-clamp-1">{collaborator.title}</p>
        )}

        {/* Institution */}
        {collaborator.institution && (
          <p className="text-xs text-slate-600 font-medium mb-2 line-clamp-1">{collaborator.institution}</p>
        )}

        {/* Pays */}
        {collaborator.country && (
          <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mb-3">
            <RiMapPinLine className="w-3.5 h-3.5" />
            {collaborator.country}
          </div>
        )}

        {/* Domaine */}
        {collaborator.researchArea && (
          <span className="inline-block px-2.5 py-1 rounded-full bg-primary-50 text-primary-600 text-xs mb-3">
            {collaborator.researchArea}
          </span>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-400">
          <span>{collaborator.publications?.length ?? 0} publication(s)</span>
          <RiExternalLinkLine className="w-3.5 h-3.5 group-hover:text-primary-500 transition-colors" />
        </div>
      </Link>
    </motion.div>
  )
}