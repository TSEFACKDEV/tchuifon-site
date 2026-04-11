'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import DataTable from '@/components/dashboard/DataTable'
import ConfirmDialog from '@/components/dashboard/ConfirmDialog'
import { toast } from '@/components/ui/Toast'
import { clsx } from 'clsx'
import { RiDeleteBinLine, RiShieldLine } from 'react-icons/ri'

export default function DashboardUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    fetch('/api/users').then(r => r.json())
      .then(d => setUsers(d.data ?? []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/users/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) { toast.error('Erreur suppression'); return }
      toast.success('Utilisateur supprimé')
      setDeleteId(null); load()
    } catch { toast.error('Erreur') }
    finally { setDeleting(false) }
  }

  const columns = [
    {
      key: 'email', label: 'Utilisateur',
      render: (u: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-600">
            {u.profile?.fullName?.charAt(0) ?? u.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">{u.profile?.fullName ?? '—'}</p>
            <p className="text-xs text-slate-400">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role', label: 'Rôle', width: '130px',
      render: (u: any) => (
        <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium',
          u.role === 'ADMIN' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700')}>
          <RiShieldLine className="w-3 h-3" />
          {u.role}
        </span>
      ),
    },
    {
      key: 'createdAt', label: 'Créé le', width: '120px',
      render: (u: any) => new Date(u.createdAt).toLocaleDateString('fr-FR'),
    },
    {
      key: 'actions', label: '', width: '60px',
      render: (u: any) => u.role !== 'ADMIN' ? (
        <button onClick={() => setDeleteId(u.id)}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">
          <RiDeleteBinLine className="w-4 h-4" />
        </button>
      ) : null,
    },
  ]

  return (
    <div>
      <DashboardHeader title="Utilisateurs" subtitle={`${users.length} utilisateur(s)`} />
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable columns={columns as any} data={users} loading={loading}
          keyExtractor={u => u.id} emptyMessage="Aucun utilisateur." />
      </div>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={handleDelete} loading={deleting}
        message="Cet utilisateur et toutes ses données seront supprimés définitivement." />
    </div>
  )
}