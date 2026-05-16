'use client'
import { useEffect, useState, useCallback } from 'react'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import DataTable from '@/components/dashboard/DataTable'
import Modal from '@/components/dashboard/Modal'
import ConfirmDialog from '@/components/dashboard/ConfirmDialog'
import SupervisionForm from '@/components/dashboard/forms/SupervisionForm'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiExternalLinkLine } from 'react-icons/ri'
import { clsx } from 'clsx'
import { z } from 'zod'

const supervisionSchema = z.object({
  studentName: z.string().min(1),
  level: z.enum(['INGENIEUR', 'MASTER_2', 'DOCTORAT', 'POST_DOC']).optional(),
  topic: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'ABANDONED']),
  thesisUrl: z.string().optional(),
})
type SupervisionFormData = z.infer<typeof supervisionSchema>
type Supervision = SupervisionFormData & { id: string; startDate?: string; endDate?: string }

const STATUS_LABELS: Record<string, string> = { IN_PROGRESS: 'En cours', COMPLETED: 'Terminé', ABANDONED: 'Abandonné' }
const STATUS_COLORS: Record<string, string> = {
  IN_PROGRESS: 'bg-blue-50 text-blue-700', COMPLETED: 'bg-green-50 text-green-700', ABANDONED: 'bg-red-50 text-red-600',
}
const LEVEL_LABELS: Record<string, string> = { INGENIEUR: 'Ingénieur', MASTER_2: 'Master 2', DOCTORAT: 'Doctorat', POST_DOC: 'Post-Doc' }

export default function DashboardSupervisionsPage() {
  const [items, setItems] = useState<Supervision[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Supervision | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/supervisions')
      const data = await res.json()
      setItems(data.data ?? [])
    } catch { toast.error('Erreur de chargement') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditItem(null); setModalOpen(true) }
  const openEdit = (item: Supervision) => { setEditItem(item); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditItem(null) }

  const handleSubmit = async (data: SupervisionFormData) => {
    setSaving(true)
    try {
      const url = editItem ? `/api/supervisions/${editItem.id}` : '/api/supervisions'
      const method = editItem ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (!res.ok) { const j = await res.json(); toast.error(j.error ?? 'Erreur'); return }
      toast.success(editItem ? 'Encadrement mis à jour' : 'Encadrement créé')
      closeModal(); load()
    } catch { toast.error('Erreur réseau') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/supervisions/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) { const j = await res.json(); toast.error(j.error ?? 'Erreur'); return }
      toast.success('Encadrement supprimé')
      setDeleteId(null); load()
    } catch { toast.error('Erreur réseau') }
    finally { setDeleting(false) }
  }

  const columns = [
    {
      key: 'studentName', label: 'Étudiant', render: (row: Supervision) => (
        <div>
          <p className="font-medium text-slate-900">{row.studentName}</p>
          {row.level && <p className="text-xs text-slate-400">{LEVEL_LABELS[row.level] ?? row.level}</p>}
        </div>
      ),
    },
    { key: 'topic', label: 'Sujet', render: (row: Supervision) => <span className="text-sm text-slate-700 max-w-55 block truncate">{row.topic}</span> },
    {
      key: 'status', label: 'Statut', render: (row: Supervision) => (
        <span className={clsx('inline-flex px-2 py-0.5 rounded-md text-xs font-medium', STATUS_COLORS[row.status] ?? 'bg-slate-100 text-slate-600')}>
          {STATUS_LABELS[row.status] ?? row.status}
        </span>
      ),
    },
    {
      key: 'period', label: 'Période', render: (row: Supervision) => {
        const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : null
        const start = fmt(row.startDate); const end = fmt(row.endDate)
        return <span className="text-xs text-slate-500">{start ?? '—'}{end ? ` → ${end}` : ''}</span>
      },
    },
    {
      key: 'thesisUrl', label: 'Thèse', render: (row: Supervision) => row.thesisUrl ? (
        <a href={row.thesisUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline">
          <RiExternalLinkLine className="w-3 h-3" /> Lien
        </a>
      ) : <span className="text-slate-400 text-xs">—</span>,
    },
    {
      key: 'actions', label: '', width: '100px', render: (row: Supervision) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-primary-600 transition-colors">
            <RiEditLine className="w-4 h-4" />
          </button>
          <button onClick={() => setDeleteId(row.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">
            <RiDeleteBinLine className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <DashboardHeader
        title="Encadrements"
        subtitle={`${items.length} encadrement${items.length !== 1 ? 's' : ''}`}
        actions={
          <Button onClick={openCreate} size="sm">
            <RiAddLine className="w-4 h-4 mr-1.5" />
            Nouvel encadrement
          </Button>
        }
      />
      <DataTable columns={columns} data={items} loading={loading} keyExtractor={r => r.id}
        emptyMessage="Aucun encadrement enregistré." />
      <Modal open={modalOpen} onClose={closeModal} size="lg"
        title={editItem ? 'Modifier l\'encadrement' : 'Nouvel encadrement'}>
        <SupervisionForm initialData={editItem ?? undefined} onSubmit={handleSubmit} loading={saving} />
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        message="Cet encadrement sera définitivement supprimé." loading={deleting} />
    </div>
  )
}
