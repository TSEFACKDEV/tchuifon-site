'use client'
import { useState, useEffect, useCallback } from 'react'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import DataTable from '@/components/dashboard/DataTable'
import Modal from '@/components/dashboard/Modal'
import ConfirmDialog from '@/components/dashboard/ConfirmDialog'
import CollaboratorForm from '@/components/dashboard/forms/CollaboratorForm'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import Image from 'next/image'
import { RiAddLine, RiEditLine, RiDeleteBinLine } from 'react-icons/ri'

export default function DashboardCollaboratorsPage() {
  const [collaborators, setCollaborators] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/collaborators').then(r => r.json())
      .then(d => setCollaborators(d.data ?? []))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (data: any) => {
    setSaving(true)
    try {
      const url = editData ? `/api/collaborators/${editData.id}` : '/api/collaborators'
      const res = await fetch(url, {
        method: editData ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error); return }
      toast.success(editData ? 'Mis à jour' : 'Collaborateur ajouté')
      setModalOpen(false); load()
    } catch { toast.error('Erreur réseau') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await fetch(`/api/collaborators/${deleteId}`, { method: 'DELETE' })
      toast.success('Supprimé')
      setDeleteId(null); load()
    } catch { toast.error('Erreur') }
    finally { setDeleting(false) }
  }

  const columns = [
    {
      key: 'name', label: 'Collaborateur',
      render: (c: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-primary-50 flex items-center justify-center shrink-0">
            {c.photoUrl
              ? <Image src={c.photoUrl} alt="" width={32} height={32} className="w-full h-full object-cover" />
              : <span className="text-xs font-bold text-primary-500">{c.name?.charAt(0)}</span>
            }
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">{c.name}</p>
            {c.title && <p className="text-xs text-slate-400">{c.title}</p>}
          </div>
        </div>
      ),
    },
    { key: 'institution', label: 'Institution',
      render: (c: any) => <p className="text-sm text-slate-600 line-clamp-1">{c.institution ?? '—'}</p> },
    { key: 'country', label: 'Pays', width: '100px',
      render: (c: any) => c.country ?? '—' },
    { key: 'publications', label: 'Publications', width: '100px',
      render: (c: any) => `${c.publications?.length ?? 0} publi.` },
    {
      key: 'actions', label: '', width: '80px',
      render: (c: any) => (
        <div className="flex items-center gap-1.5">
          <button onClick={() => { setEditData(c); setModalOpen(true) }}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            <RiEditLine className="w-4 h-4" />
          </button>
          <button onClick={() => setDeleteId(c.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">
            <RiDeleteBinLine className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <DashboardHeader title="Collaborateurs" subtitle={`${collaborators.length} collaborateur(s)`}
        actions={
          <Button onClick={() => { setEditData(null); setModalOpen(true) }} size="sm">
            <RiAddLine className="w-4 h-4 mr-1.5" /> Ajouter
          </Button>
        }
      />
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable columns={columns as any} data={collaborators} loading={loading}
          keyExtractor={c => c.id} emptyMessage="Aucun collaborateur." />
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editData ? 'Modifier' : 'Nouveau collaborateur'} size="lg">
        <CollaboratorForm initialData={editData} onSubmit={handleSubmit} loading={saving} />
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={handleDelete} loading={deleting}
        message="Ce collaborateur sera supprimé." />
    </div>
  )
}