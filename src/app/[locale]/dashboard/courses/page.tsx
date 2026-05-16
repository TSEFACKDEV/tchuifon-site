'use client'
import { useEffect, useState, useCallback } from 'react'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import DataTable from '@/components/dashboard/DataTable'
import Modal from '@/components/dashboard/Modal'
import ConfirmDialog from '@/components/dashboard/ConfirmDialog'
import CourseForm from '@/components/dashboard/forms/CourseForm'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { RiAddLine, RiEditLine, RiDeleteBinLine } from 'react-icons/ri'
import { clsx } from 'clsx'

type Course = {
  id: string
  title?: string
  code?: string
  level?: 'LICENCE' | 'MASTER' | 'INGENIEUR' | 'DOCTORAT'
  description?: string
  credits?: number
  hours?: number
  semester?: string
  syllabus?: string
  objectives: string[]
  isActive: boolean
}

const LEVEL_LABELS: Record<string, string> = {
  LICENCE: 'Licence', MASTER: 'Master', INGENIEUR: 'Ingénieur', DOCTORAT: 'Doctorat',
}
const LEVEL_COLORS: Record<string, string> = {
  LICENCE: 'bg-blue-50 text-blue-700', MASTER: 'bg-purple-50 text-purple-700',
  INGENIEUR: 'bg-amber-50 text-amber-700', DOCTORAT: 'bg-green-50 text-green-700',
}

export default function DashboardCoursesPage() {
  const [items, setItems] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Course | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/courses')
      const data = await res.json()
      setItems(data.data ?? [])
    } catch { toast.error('Erreur de chargement') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditItem(null); setModalOpen(true) }
  const openEdit = (item: Course) => { setEditItem(item); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditItem(null) }

  const handleSubmit = async (data: Record<string, unknown>) => {
    setSaving(true)
    try {
      const url = editItem ? `/api/courses/${editItem.id}` : '/api/courses'
      const method = editItem ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (!res.ok) { const j = await res.json(); toast.error(j.error ?? 'Erreur'); return }
      toast.success(editItem ? 'Cours mis à jour' : 'Cours créé')
      closeModal(); load()
    } catch { toast.error('Erreur réseau') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/courses/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) { const j = await res.json(); toast.error(j.error ?? 'Erreur'); return }
      toast.success('Cours supprimé')
      setDeleteId(null); load()
    } catch { toast.error('Erreur réseau') }
    finally { setDeleting(false) }
  }

  const columns = [
    {
      key: 'title', label: 'Titre', render: (row: Course) => (
        <div>
          <p className="font-medium text-slate-900">{row.title ?? '—'}</p>
          {row.code && <p className="text-xs text-slate-400">{row.code}</p>}
        </div>
      ),
    },
    {
      key: 'level', label: 'Niveau', render: (row: Course) => row.level ? (
        <span className={clsx('inline-flex px-2 py-0.5 rounded-md text-xs font-medium', LEVEL_COLORS[row.level] ?? 'bg-slate-100 text-slate-600')}>
          {LEVEL_LABELS[row.level] ?? row.level}
        </span>
      ) : <span className="text-slate-400">—</span>,
    },
    {
      key: 'credits', label: 'Crédits / Heures', render: (row: Course) => (
        <span className="text-sm text-slate-600">
          {row.credits ? `${row.credits} cr.` : '—'}{row.hours ? ` / ${row.hours}h` : ''}
        </span>
      ),
    },
    { key: 'semester', label: 'Semestre', render: (row: Course) => <span className="text-slate-600">{row.semester ?? '—'}</span> },
    {
      key: 'isActive', label: 'Statut', render: (row: Course) => (
        <span className={clsx('inline-flex px-2 py-0.5 rounded-md text-xs font-medium', row.isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500')}>
          {row.isActive ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
    {
      key: 'actions', label: '', width: '100px', render: (row: Course) => (
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
        title="Cours"
        subtitle={`${items.length} cours au total`}
        actions={
          <Button onClick={openCreate} size="sm">
            <RiAddLine className="w-4 h-4 mr-1.5" />
            Nouveau cours
          </Button>
        }
      />
      <DataTable columns={columns} data={items} loading={loading} keyExtractor={r => r.id}
        emptyMessage="Aucun cours. Créez votre premier cours." />
      <Modal open={modalOpen} onClose={closeModal} size="lg"
        title={editItem ? 'Modifier le cours' : 'Nouveau cours'}>
        <CourseForm initialData={editItem ?? undefined} onSubmit={handleSubmit} loading={saving} />
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        message="Ce cours sera définitivement supprimé." loading={deleting} />
    </div>
  )
}
