'use client'
import { useState, useEffect, useCallback } from 'react'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import DataTable from '@/components/dashboard/DataTable'
import Modal from '@/components/dashboard/Modal'
import ConfirmDialog from '@/components/dashboard/ConfirmDialog'
import SupervisionForm from '@/components/dashboard/forms/SupervisionForm'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { clsx } from 'clsx'
import { RiAddLine, RiEditLine, RiDeleteBinLine } from 'react-icons/ri'

const statusConfig: Record<string, string> = {
  IN_PROGRESS: 'bg-green-50 text-green-700',
  COMPLETED:   'bg-blue-50 text-blue-700',
  ABANDONED:   'bg-red-50 text-red-600',
}
const statusLabels: Record<string, string> = {
  IN_PROGRESS: 'En cours', COMPLETED: 'Terminé', ABANDONED: 'Abandonné',
}
const levelLabels: Record<string, string> = {
  INGENIEUR: 'Ingénieur', MASTER_2: 'Master 2', DOCTORAT: 'Doctorat', POST_DOC: 'Post-Doc',
}

export default function DashboardSupervisionsPage() {
  const [supervisions, setSupervisions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/supervisions').then(r => r.json())
      .then(d => setSupervisions(d.data ?? []))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (data: any) => {
    setSaving(true)
    try {
      const url = editData ? `/api/supervisions/${editData.id}` : '/api/supervisions'
      const res = await fetch(url, {
        method: editData ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error); return }
      toast.success(editData ? 'Mis à jour' : 'Encadrement créé')
      setModalOpen(false); load()
    } catch { toast.error('Erreur réseau') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await fetch(`/api/supervisions/${deleteId}`, { method: 'DELETE' })
      toast.success('Supprimé')
      setDeleteId(null); load()
    } catch { toast.error('Erreur') }
    finally { setDeleting(false) }
  }

  const columns = [
    {
      key: 'studentName', label: 'Étudiant',
      render: (s: any) => (
        <div>
          <p className="text-sm font-medium text-slate-800">{s.studentName}</p>
          {s.level && <p className="text-xs text-slate-400 mt-0.5">{levelLabels[s.level]}</p>}
        </div>
      ),
    },
    {
      key: 'topic', label: 'Sujet',
      render: (s: any) => <p className="text-sm text-slate-600 line-clamp-1 max-w-xs">{s.topic}</p>,
    },
    {
      key: 'status', label: 'Statut', width: '110px',
      render: (s: any) => (
        <span className={clsx('px-2 py-1 rounded-lg text-xs font-medium', statusConfig[s.status])}>
          {statusLabels[s.status]}
        </span>
      ),
    },
    {
      key: 'startDate', label: 'Début', width: '100px',
      render: (s: any) => s.startDate ? new Date(s.startDate).getFullYear() : '—',
    },
    {
      key: 'actions', label: '', width: '80px',
      render: (s: any) => (
        <div className="flex items-center gap-1.5">
          <button onClick={() => { setEditData(s); setModalOpen(true) }}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            <RiEditLine className="w-4 h-4" />
          </button>
          <button onClick={() => setDeleteId(s.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">
            <RiDeleteBinLine className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <DashboardHeader title="Encadrements" subtitle={`${supervisions.length} encadrement(s)`}
        actions={
          <Button onClick={() => { setEditData(null); setModalOpen(true) }} size="sm">
            <RiAddLine className="w-4 h-4 mr-1.5" /> Nouvel encadrement
          </Button>
        }
      />
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable columns={columns as any} data={supervisions} loading={loading}
          keyExtractor={s => s.id} emptyMessage="Aucun encadrement." />
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editData ? 'Modifier' : 'Nouvel encadrement'} size="lg">
        <SupervisionForm initialData={editData} onSubmit={handleSubmit} loading={saving} />
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={handleDelete} loading={deleting}
        message="Cet encadrement sera définitivement supprimé." />
    </div>
  )
}