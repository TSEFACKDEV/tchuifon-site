'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import StatCard from '@/components/dashboard/StatCard'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import Link from 'next/link'
import {
  RiArticleLine, RiBookOpenLine, RiAwardLine,
  RiGroupLine, RiMailLine, RiArrowRightLine
} from 'react-icons/ri'

export default function DashboardPage() {
  const [stats, setStats] = useState({ publications: 0, courses: 0, supervisions: 0, collaborators: 0, messages: 0 })
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/publications?limit=1').then(r => r.json()),
      fetch('/api/courses').then(r => r.json()),
      fetch('/api/supervisions').then(r => r.json()),
      fetch('/api/collaborators').then(r => r.json()),
      fetch('/api/contact').then(r => r.json()),
    ]).then(([pubs, courses, sup, collab, msgs]) => {
      setStats({
        publications: pubs.meta?.total ?? 0,
        courses: courses.data?.length ?? 0,
        supervisions: sup.data?.length ?? 0,
        collaborators: collab.data?.length ?? 0,
        messages: msgs.data?.filter((m: any) => !m.isRead).length ?? 0,
      })
      setMessages(msgs.data?.slice(0, 5) ?? [])
    }).finally(() => setLoading(false))
  }, [])

 const statCards = [
  { label: 'Publications',     value: stats.publications,  icon: RiArticleLine,  color: 'blue'   as const, href: '/dashboard/publications' },
  { label: 'Cours',            value: stats.courses,       icon: RiBookOpenLine, color: 'green'  as const, href: '/dashboard/courses' },
  { label: 'Encadrements',     value: stats.supervisions,  icon: RiAwardLine,    color: 'amber'  as const, href: '/dashboard/supervisions' },
  { label: 'Collaborateurs',   value: stats.collaborators, icon: RiGroupLine,    color: 'purple' as const, href: '/dashboard/collaborators' },
  { label: 'Messages non lus', value: stats.messages,      icon: RiMailLine,     color: 'red'    as const, href: '/dashboard/messages' },
]

  return (
    <div>
      <DashboardHeader title="Vue d'ensemble" subtitle="Bienvenue dans votre espace d'administration" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((card, i) => (
          <Link key={card.label} href={card.href}>
            <StatCard {...card} index={i}  />
          </Link>
        ))}
      </div>

      {/* Messages récents */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Messages récents</h2>
          <Link href="/dashboard/messages"
            className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
            Voir tous <RiArrowRightLine className="w-3.5 h-3.5" />
          </Link>
        </div>
        {messages.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm">Aucun message</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {messages.map(msg => (
              <div key={msg.id} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-600 shrink-0">
                  {msg.name?.charAt(0) ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-800">{msg.name}</p>
                    {!msg.isRead && <span className="w-2 h-2 rounded-full bg-primary-500" />}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{msg.subject}</p>
                </div>
                <p className="text-xs text-slate-400 shrink-0">
                  {new Date(msg.sentAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}