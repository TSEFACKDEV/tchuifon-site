'use client'
import { useEffect, useState, useCallback } from 'react'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import DataTable from '@/components/dashboard/DataTable'
import Modal from '@/components/dashboard/Modal'
import ConfirmDialog from '@/components/dashboard/ConfirmDialog'
import PublicationForm from '@/components/dashboard/forms/PublicationForm'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiFilePdfLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri'
import { clsx } from 'clsx'

type Publication = {
  id: string
  title?: string
  type: 'ARTICLE' | 'CONFERENCE' | 'BOOK_CHAPTER' | 'THESIS' | 'PATENT' | 'POSTER'
  year?: number
  journal?: string
  conference?: string
  authors: string[]
  keywords: string[]
  isPublished: boolean
  doi?: string
  pdfUrl?: string
  abstract?: string
  volume?: string
  issue?: string
  pages?: string
  publisher?: string
}

const TYPE_LABELS: Record<string, string> = {
  ARTICLE: 'Article', CONFERENCE: 'Conférence', BOOK_CHAPTER: 'Chapitre',
  THESIS: 'Thèse', PATENT: 'Brevet', POSTER: 'Poster',
}
const TYPE_COLORS: Record<string, string> = {
  ARTICLE: 'bg-blue-50 text-blue-700', CONFERENCE: 'bg-purple-50 text-purple-700',
  BOOK_CHAPTER: 'bg-amber-50 text-amber-700', THESIS: 'bg-green-50 text-green-700',
  PATENT: 'bg-red-50 text-red-700', POSTER: 'bg-slate-100 text-slate-600',
}

export default function DashboardPublicationsPage() {
  const [items, setItems] = useState<Publication[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Publication | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/publications?all=true&limit=100')
      const data = await res.json()
      setItems(data.data ?? [])
    } catch { toast.error('Erreur de chargement') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditItem(null); setModalOpen(true) }
  const openEdit = (item: Publication) => { setEditItem(item); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditItem(null) }

  const handleSubmit = async (data: Record<string, unknown>) => {
    setSaving(true)
    try {
      const url = editItem ? `/api/publications/${editItem.id}` : '/api/publications'
      const method = editItem ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (!res.ok) { const j = await res.json(); toast.error(j.error ?? 'Erreur'); return }
      toast.success(editItem ? 'Publication mise à jour' : 'Publication créée')
      closeModal(); load()
    } catch { toast.error('Erreur réseau') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/publications/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) { const j = await res.json(); toast.error(j.error ?? 'Erreur'); return }
      toast.success('Publication supprimée')
      setDeleteId(null); load()
    } catch { toast.error('Erreur réseau') }
    finally { setDeleting(false) }
  }

  const columns = [
    {
      key: 'title', label: 'Titre', render: (row: Publication) => (
        <div className="max-w-xs">
          <p className="font-medium text-slate-900 truncate">{row.title ?? '—'}</p>
          <p className="text-xs text-slate-400 truncate">{row.authors.slice(0, 2).join(', ')}{row.authors.length > 2 ? ' …' : ''}</p>
        </div>
      ),
    },
    {
      key: 'type', label: 'Type', render: (row: Publication) => (
        <span className={clsx('inline-flex px-2 py-0.5 rounded-md text-xs font-medium', TYPE_COLORS[row.type] ?? 'bg-slate-100 text-slate-600')}>
          {TYPE_LABELS[row.type] ?? row.type}
        </span>
      ),
    },
    { key: 'year', label: 'Année', render: (row: Publication) => <span className="text-slate-600">{row.year ?? '—'}</span> },
    {
      key: 'source', label: 'Source', render: (row: Publication) => (
        <span className="text-sm text-slate-500 truncate max-w-40 block">{row.journal ?? row.conference ?? '—'}</span>
      ),
    },
    {
      key: 'isPublished', label: 'Statut', render: (row: Publication) => (
        <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium', row.isPublished ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500')}>
          {row.isPublished ? <RiEyeLine className="w-3 h-3" /> : <RiEyeOffLine className="w-3 h-3" />}
          {row.isPublished ? 'Publié' : 'Brouillon'}
        </span>
      ),
    },
    {
      key: 'actions', label: '', width: '120px', render: (row: Publication) => (
        <div className="flex items-center gap-2">
          {row.pdfUrl && (
            <a href={row.pdfUrl} target="_blank" rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors">
              <RiFilePdfLine className="w-4 h-4" />
            </a>
          )}
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
        title="Publications"
        subtitle={`${items.length} publication${items.length !== 1 ? 's' : ''} au total`}
        actions={
          <Button onClick={openCreate} size="sm">
            <RiAddLine className="w-4 h-4 mr-1.5" />
            Nouvelle publication
          </Button>
        }
      />
      <DataTable columns={columns} data={items} loading={loading} keyExtractor={r => r.id}
        emptyMessage="Aucune publication. Créez votre première publication." />
      <Modal open={modalOpen} onClose={closeModal} size="xl"
        title={editItem ? 'Modifier la publication' : 'Nouvelle publication'}>
        <PublicationForm initialData={editItem ?? undefined} onSubmit={handleSubmit} loading={saving} />
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        message="Cette publication sera définitivement supprimée. Cette action est irréversible." loading={deleting} />
    </div>
  )
}
