'use client'
import { useState, useEffect, useCallback } from 'react'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import DataTable from '@/components/dashboard/DataTable'
import Modal from '@/components/dashboard/Modal'
import ConfirmDialog from '@/components/dashboard/ConfirmDialog'
import CourseForm from '@/components/dashboard/forms/CourseForm'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { clsx } from 'clsx'
import { RiAddLine, RiEditLine, RiDeleteBinLine } from 'react-icons/ri'

export default function DashboardCoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/courses').then(r => r.json())
      .then(d => setCourses(d.data ?? []))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (data: any) => {
    setSaving(true)
    try {
      const url = editData ? `/api/courses/${editData.id}` : '/api/courses'
      const res = await fetch(url, {
        method: editData ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error); return }
      toast.success(editData ? 'Cours mis à jour' : 'Cours créé')
      setModalOpen(false); load()
    } catch { toast.error('Erreur réseau') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await fetch(`/api/courses/${deleteId}`, { method: 'DELETE' })
      toast.success('Cours supprimé')
      setDeleteId(null); load()
    } catch { toast.error('Erreur') }
    finally { setDeleting(false) }
  }

  const levelColors: Record<string, string> = {
    LICENCE: 'bg-green-50 text-green-700', MASTER: 'bg-blue-50 text-blue-700',
    INGENIEUR: 'bg-amber-50 text-amber-700', DOCTORAT: 'bg-purple-50 text-purple-700',
  }

  const columns = [
    {
      key: 'title', label: 'Cours',
      render: (c: any) => (
        <div>
          <p className="text-sm font-medium text-slate-800">{c.title}</p>
          {c.code && <p className="text-xs font-mono text-slate-400 mt-0.5">{c.code}</p>}
        </div>
      ),
    },
    {
      key: 'level', label: 'Niveau', width: '110px',
      render: (c: any) => c.level ? (
        <span className={clsx('px-2 py-1 rounded-lg text-xs font-medium', levelColors[c.level])}>{c.level}</span>
      ) : '—',
    },
    {
      key: 'hours', label: 'Heures', width: '80px',
      render: (c: any) => c.hours ? `${c.hours}h` : '—',
    },
    {
      key: 'credits', label: 'Crédits', width: '80px',
      render: (c: any) => c.credits ?? '—',
    },
    {
      key: 'isActive', label: 'Statut', width: '90px',
      render: (c: any) => (
        <span className={clsx('px-2 py-1 rounded-lg text-xs font-medium',
          c.isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500')}>
          {c.isActive ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
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
      <DashboardHeader title="Cours" subtitle={`${courses.length} cours`}
        actions={
          <Button onClick={() => { setEditData(null); setModalOpen(true) }} size="sm">
            <RiAddLine className="w-4 h-4 mr-1.5" /> Nouveau cours
          </Button>
        }
      />
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable columns={columns as any} data={courses} loading={loading}
          keyExtractor={c => c.id} emptyMessage="Aucun cours." />
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editData ? 'Modifier le cours' : 'Nouveau cours'} size="lg">
        <CourseForm initialData={editData} onSubmit={handleSubmit} loading={saving} />
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={handleDelete} loading={deleting}
        message="Ce cours sera définitivement supprimé." />
    </div>
  )
}