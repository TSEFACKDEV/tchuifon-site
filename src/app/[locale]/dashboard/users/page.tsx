'use client'
import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import DataTable from '@/components/dashboard/DataTable'
import ConfirmDialog from '@/components/dashboard/ConfirmDialog'
import { toast } from '@/components/ui/Toast'
import { RiDeleteBinLine, RiShieldLine, RiUserLine, RiLoader4Line } from 'react-icons/ri'
import { clsx } from 'clsx'

type UserRow = {
  id: string
  email: string
  role: 'ADMIN' | 'COLLABORATOR'
  createdAt: string
  profile?: { fullName?: string; photoUrl?: string; title?: string } | null
}

export default function DashboardUsersPage() {
  const [items, setItems] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      setItems(data.data ?? [])
    } catch { toast.error('Erreur de chargement') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/users/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) { const j = await res.json(); toast.error(j.error ?? 'Erreur'); return }
      toast.success('Utilisateur supprimé')
      setDeleteId(null); load()
    } catch { toast.error('Erreur réseau') }
    finally { setDeleting(false) }
  }

  const columns = [
    {
      key: 'user', label: 'Utilisateur', render: (row: UserRow) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center shrink-0">
            {row.profile?.photoUrl
              ? <Image src={row.profile.photoUrl} alt="" width={36} height={36} className="w-full h-full object-cover" />
              : <span className="text-sm font-bold text-primary-600">{(row.profile?.fullName ?? row.email).charAt(0).toUpperCase()}</span>
            }
          </div>
          <div>
            <p className="font-medium text-slate-900">{row.profile?.fullName ?? '—'}</p>
            <p className="text-xs text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'title', label: 'Titre', render: (row: UserRow) => <span className="text-sm text-slate-600">{row.profile?.title ?? '—'}</span> },
    {
      key: 'role', label: 'Rôle', render: (row: UserRow) => (
        <span className={clsx(
          'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium',
          row.role === 'ADMIN' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600',
        )}>
          {row.role === 'ADMIN' ? <RiShieldLine className="w-3 h-3" /> : <RiUserLine className="w-3 h-3" />}
          {row.role}
        </span>
      ),
    },
    {
      key: 'createdAt', label: 'Inscrit le', render: (row: UserRow) => (
        <span className="text-sm text-slate-500">
          {new Date(row.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
    {
      key: 'actions', label: '', width: '80px', render: (row: UserRow) => (
        row.role !== 'ADMIN' ? (
          <button onClick={() => setDeleteId(row.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">
            <RiDeleteBinLine className="w-4 h-4" />
          </button>
        ) : (
          <span className="text-xs text-slate-300 px-2">protégé</span>
        )
      ),
    },
  ]

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
        title="Utilisateurs"
        subtitle={`${items.length} compte${items.length !== 1 ? 's' : ''} enregistré${items.length !== 1 ? 's' : ''}`}
      />
      <DataTable columns={columns} data={items} loading={false} keyExtractor={r => r.id}
        emptyMessage="Aucun utilisateur enregistré." />
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        message="Cet utilisateur sera définitivement supprimé ainsi que toutes ses données." loading={deleting} />
    </div>
  )
}
