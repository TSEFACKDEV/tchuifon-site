'use client'
import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import ConfirmDialog from '@/components/dashboard/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { RiMailLine, RiMailOpenLine, RiDeleteBinLine, RiLoader4Line } from 'react-icons/ri'
import { clsx } from 'clsx'

type Message = {
  id: string
  name?: string
  email?: string
  subject?: string
  message?: string
  isRead: boolean
  sentAt: string
}

export default function DashboardMessagesPage() {
  const [items, setItems] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [markingRead, setMarkingRead] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/contact')
      const data = await res.json()
      setItems(data.data ?? [])
    } catch { toast.error('Erreur de chargement') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const markAsRead = async (id: string) => {
    setMarkingRead(id)
    try {
      await fetch(`/api/contact/${id}/read`, { method: 'PATCH' })
      setItems(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m))
    } catch { toast.error('Erreur') }
    finally { setMarkingRead(null) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/contact/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) { toast.error('Erreur de suppression'); return }
      toast.success('Message supprimé')
      setDeleteId(null); load()
    } catch { toast.error('Erreur réseau') }
    finally { setDeleting(false) }
  }

  const unreadCount = items.filter(m => !m.isRead).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <RiLoader4Line className="w-7 h-7 text-primary-500 animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <DashboardHeader
        title="Messages"
        subtitle={unreadCount > 0 ? `${unreadCount} non lu${unreadCount > 1 ? 's' : ''}` : `${items.length} message${items.length !== 1 ? 's' : ''}`}
      />

      {items.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <RiMailLine className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Aucun message reçu.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((msg, i) => (
            <motion.div key={msg.id}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={clsx(
                'bg-white rounded-2xl border transition-all',
                msg.isRead ? 'border-slate-200' : 'border-primary-200 shadow-sm',
              )}
            >
              {/* Header row */}
              <div className="flex items-start gap-4 p-4 cursor-pointer"
                onClick={() => {
                  setExpanded(expanded === msg.id ? null : msg.id)
                  if (!msg.isRead) markAsRead(msg.id)
                }}
              >
                <div className={clsx(
                  'w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                  msg.isRead ? 'bg-slate-100 text-slate-400' : 'bg-primary-100 text-primary-600',
                )}>
                  {msg.isRead ? <RiMailOpenLine className="w-4 h-4" /> : <RiMailLine className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-slate-900">{msg.name ?? 'Inconnu'}</span>
                    {!msg.isRead && (
                      <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary-600 text-white">NOUVEAU</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 font-medium truncate">{msg.subject ?? '(sans sujet)'}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {msg.email} · {new Date(msg.sentAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!msg.isRead && (
                    <button onClick={(e) => { e.stopPropagation(); markAsRead(msg.id) }}
                      disabled={markingRead === msg.id}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-primary-600 transition-colors text-xs"
                      title="Marquer comme lu">
                      {markingRead === msg.id ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiMailOpenLine className="w-4 h-4" />}
                    </button>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); setDeleteId(msg.id) }}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                    <RiDeleteBinLine className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded body */}
              {expanded === msg.id && (
                <div className="px-4 pb-4 pt-0 border-t border-slate-100">
                  <div className="bg-slate-50 rounded-xl p-4 mt-3">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{msg.message ?? '(message vide)'}</p>
                  </div>
                  {msg.email && (
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => window.open(`mailto:${msg.email}?subject=Re: ${msg.subject ?? ''}`)}>
                        Répondre par email
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        message="Ce message sera définitivement supprimé." loading={deleting} />
    </div>
  )
}
