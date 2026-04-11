'use client'
import { useState, useEffect, useCallback } from 'react'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import DataTable from '@/components/dashboard/DataTable'
import Modal from '@/components/dashboard/Modal'
import ConfirmDialog from '@/components/dashboard/ConfirmDialog'
import PublicationForm from '@/components/dashboard/forms/PublicationForm'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { clsx } from 'clsx'
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiEyeLine } from 'react-icons/ri'
import Link from 'next/link'

export default function DashboardPublicationsPage() {
  const [publications, setPublications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/publications?limit=100')
      .then(r => r.json())
      .then(d => setPublications(d.data ?? []))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditData(null); setModalOpen(true) }
  const openEdit = (pub: any) => { setEditData(pub); setModalOpen(true) }

  const handleSubmit = async (data: any) => {
    setSaving(true)
    try {
      const url = editData ? `/api/publications/${editData.id}` : '/api/publications'
      const method = editData ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error ?? 'Erreur'); return }
      toast.success(editData ? 'Publication mise à jour' : 'Publication créée')
      setModalOpen(false)
      load()
    } catch { toast.error('Erreur réseau') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/publications/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) { toast.error('Erreur suppression'); return }
      toast.success('Publication supprimée')
      setDeleteId(null)
      load()
    } catch { toast.error('Erreur réseau') }
    finally { setDeleting(false) }
  }

  const typeColors: Record<string, string> = {
    ARTICLE: 'bg-blue-50 text-blue-700', CONFERENCE: 'bg-purple-50 text-purple-700',
    BOOK_CHAPTER: 'bg-green-50 text-green-700', THESIS: 'bg-amber-50 text-amber-700',
    PATENT: 'bg-red-50 text-red-700', POSTER: 'bg-slate-100 text-slate-700',
  }

  const columns = [
    {
      key: 'title', label: 'Titre',
      render: (pub: any) => (
        <div className="max-w-xs">
          <p className="text-sm font-medium text-slate-800 line-clamp-1">{pub.title}</p>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{pub.authors?.join(', ')}</p>
        </div>
      ),
    },
    {
      key: 'type', label: 'Type', width: '120px',
      render: (pub: any) => (
        <span className={clsx('px-2 py-1 rounded-lg text-xs font-medium', typeColors[pub.type])}>
          {pub.type}
        </span>
      ),
    },
    { key: 'year', label: 'Année', width: '80px' },
    {
      key: 'isPublished', label: 'Statut', width: '90px',
      render: (pub: any) => (
        <span className={clsx('px-2 py-1 rounded-lg text-xs font-medium',
          pub.isPublished ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500')}>
          {pub.isPublished ? 'Publié' : 'Brouillon'}
        </span>
      ),
    },
    {
      key: 'actions', label: '', width: '100px',
      render: (pub: any) => (
        <div className="flex items-center gap-1.5">
          <Link href={`/publications/${pub.slug ?? pub.id}`} target="_blank"
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
            <RiEyeLine className="w-4 h-4" />
          </Link>
          <button onClick={() => openEdit(pub)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            <RiEditLine className="w-4 h-4" />
          </button>
          <button onClick={() => setDeleteId(pub.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">
            <RiDeleteBinLine className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <DashboardHeader title="Publications" subtitle={`${publications.length} publication(s)`}
        actions={
          <Button onClick={openCreate} size="sm">
            <RiAddLine className="w-4 h-4 mr-1.5" />
            Nouvelle publication
          </Button>
        }
      />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable
          columns={columns as any}
          data={publications}
          loading={loading}
          keyExtractor={p => p.id}
          emptyMessage="Aucune publication. Créez-en une !"
        />
      </div>

      {/* Modal create/edit */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editData ? 'Modifier la publication' : 'Nouvelle publication'}
        size="xl">
        <PublicationForm initialData={editData} onSubmit={handleSubmit} loading={saving} />
      </Modal>

      {/* Confirm delete */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        message="Cette publication sera définitivement supprimée. Cette action est irréversible."
      />
    </div>
  )
}