'use client'
import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import DataTable from '@/components/dashboard/DataTable'
import Modal from '@/components/dashboard/Modal'
import ConfirmDialog from '@/components/dashboard/ConfirmDialog'
import CollaboratorForm from '@/components/dashboard/forms/CollaboratorForm'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiExternalLinkLine } from 'react-icons/ri'
import { z } from 'zod'

const collaboratorSchema = z.object({
  name: z.string().min(1),
  title: z.string().optional(),
  institution: z.string().optional(),
  department: z.string().optional(),
  country: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().optional(),
  photoUrl: z.string().optional(),
  researchArea: z.string().optional(),
  googleScholar: z.string().optional(),
  orcid: z.string().optional(),
})
type CollaboratorFormData = z.infer<typeof collaboratorSchema>

type Collaborator = CollaboratorFormData & { id: string }

export default function DashboardCollaboratorsPage() {
  const [items, setItems] = useState<Collaborator[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Collaborator | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/collaborators')
      const data = await res.json()
      setItems(data.data ?? [])
    } catch { toast.error('Erreur de chargement') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditItem(null); setModalOpen(true) }
  const openEdit = (item: Collaborator) => { setEditItem(item); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditItem(null) }

  const handleSubmit = async (data: CollaboratorFormData) => {
    setSaving(true)
    try {
      const url = editItem ? `/api/collaborators/${editItem.id}` : '/api/collaborators'
      const method = editItem ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (!res.ok) { const j = await res.json(); toast.error(j.error ?? 'Erreur'); return }
      toast.success(editItem ? 'Collaborateur mis à jour' : 'Collaborateur ajouté')
      closeModal(); load()
    } catch { toast.error('Erreur réseau') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/collaborators/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) { const j = await res.json(); toast.error(j.error ?? 'Erreur'); return }
      toast.success('Collaborateur supprimé')
      setDeleteId(null); load()
    } catch { toast.error('Erreur réseau') }
    finally { setDeleting(false) }
  }

  const columns = [
    {
      key: 'name', label: 'Collaborateur', render: (row: Collaborator) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center shrink-0">
            {row.photoUrl
              ? <Image src={row.photoUrl} alt={row.name ?? ''} width={36} height={36} className="w-full h-full object-cover" />
              : <span className="text-sm font-bold text-primary-600">{row.name?.charAt(0)?.toUpperCase()}</span>
            }
          </div>
          <div>
            <p className="font-medium text-slate-900">{row.name}</p>
            {row.title && <p className="text-xs text-slate-400">{row.title}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'institution', label: 'Institution', render: (row: Collaborator) => (
        <div>
          <p className="text-sm text-slate-700">{row.institution ?? '—'}</p>
          {row.country && <p className="text-xs text-slate-400">{row.country}</p>}
        </div>
      ),
    },
    { key: 'researchArea', label: 'Domaine', render: (row: Collaborator) => <span className="text-sm text-slate-600 max-w-45 block truncate">{row.researchArea ?? '—'}</span> },
    {
      key: 'contact', label: 'Contact', render: (row: Collaborator) => (
        <div className="space-y-0.5">
          {row.email && <a href={`mailto:${row.email}`} className="text-xs text-primary-600 hover:underline block truncate max-w-40">{row.email}</a>}
          {row.website && (
            <a href={row.website} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-primary-600">
              <RiExternalLinkLine className="w-3 h-3" /> Site web
            </a>
          )}
        </div>
      ),
    },
    {
      key: 'actions', label: '', width: '100px', render: (row: Collaborator) => (
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
        title="Collaborateurs"
        subtitle={`${items.length} collaborateur${items.length !== 1 ? 's' : ''}`}
        actions={
          <Button onClick={openCreate} size="sm">
            <RiAddLine className="w-4 h-4 mr-1.5" />
            Ajouter
          </Button>
        }
      />
      <DataTable columns={columns} data={items} loading={loading} keyExtractor={r => r.id}
        emptyMessage="Aucun collaborateur pour l'instant." />
      <Modal open={modalOpen} onClose={closeModal} size="lg"
        title={editItem ? 'Modifier le collaborateur' : 'Nouveau collaborateur'}>
        <CollaboratorForm initialData={editItem ?? undefined} onSubmit={handleSubmit} loading={saving} />
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        message="Ce collaborateur sera définitivement supprimé." loading={deleting} />
    </div>
  )
}
