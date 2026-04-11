'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { clsx } from 'clsx'
import { RiMailLine, RiMailOpenLine, RiCalendarLine } from 'react-icons/ri'

export default function DashboardMessagesPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => {
    fetch('/api/contact').then(r => r.json())
      .then(d => setMessages(d.data ?? []))
      .finally(() => setLoading(false))
  }, [])

  const markRead = async (id: string) => {
    await fetch(`/api/contact/${id}/read`, { method: 'PATCH' })
    setMessages(msgs => msgs.map(m => m.id === id ? { ...m, isRead: true } : m))
  }

  const handleSelect = (msg: any) => {
    setSelected(msg)
    if (!msg.isRead) markRead(msg.id)
  }

  const unreadCount = messages.filter(m => !m.isRead).length

  return (
    <div>
      <DashboardHeader
        title="Messages"
        subtitle={unreadCount > 0 ? `${unreadCount} message(s) non lu(s)` : 'Tous les messages lus'}
      />

      <div className="grid lg:grid-cols-5 gap-6 h-[calc(100vh-180px)]">
        {/* Liste */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {messages.length} message(s)
          </div>
          <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
            {loading ? (
              <div className="py-10 text-center text-slate-400 text-sm">Chargement...</div>
            ) : messages.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm">Aucun message</div>
            ) : messages.map(msg => (
              <button key={msg.id} onClick={() => handleSelect(msg)}
                className={clsx(
                  'w-full text-left px-4 py-4 hover:bg-slate-50 transition-colors',
                  selected?.id === msg.id && 'bg-primary-50 hover:bg-primary-50'
                )}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {!msg.isRead && <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-1.5" />}
                    <div className="min-w-0">
                      <p className={clsx('text-sm truncate', msg.isRead ? 'font-normal text-slate-700' : 'font-semibold text-slate-900')}>
                        {msg.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{msg.subject}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 shrink-0">
                    {new Date(msg.sentAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Détail */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div key={selected.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="h-full flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-900">{selected.subject}</h3>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <RiMailOpenLine className="w-3.5 h-3.5" />
                      {selected.name} — {selected.email}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <RiCalendarLine className="w-3.5 h-3.5" />
                      {new Date(selected.sentAt).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex-1 px-6 py-5 overflow-y-auto">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                </div>
                <div className="px-6 py-4 border-t border-slate-100">
                  <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors">
                    <RiMailLine className="w-4 h-4" />
                    Répondre par email
                  </a>
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="h-full flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <RiMailLine className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Sélectionnez un message</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}