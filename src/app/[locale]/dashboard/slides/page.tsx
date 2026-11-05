'use client'
import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import ConfirmDialog from '@/components/dashboard/ConfirmDialog'
import FileUpload from '@/components/dashboard/FileUpload'
import { toast } from '@/components/ui/Toast'
import { apiFetch } from '@/lib/client-api'
import {
  RiArrowDownLine,
  RiArrowUpLine,
  RiDeleteBinLine,
  RiImageLine,
  RiLoader4Line,
} from 'react-icons/ri'

type Slide = {
  id: string
  imageUrl: string
  position: number
}

export default function DashboardSlidesPage() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [moving, setMoving] = useState<string | null>(null)
  const [uploadKey, setUploadKey] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiFetch('/api/slides')
      if (!res.ok) { toast.error('Erreur de chargement'); return }
      const data = await res.json()
      setSlides(data.data ?? [])
    } catch {
      toast.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleUpload = async (url: string, publicId?: string) => {
    try {
      const res = await apiFetch('/api/slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: url, publicId }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error ?? 'Impossible d’ajouter l’image')
        return
      }

      toast.success('Image ajoutée au carrousel')
      // Remonte le composant d'upload pour vider l'aperçu.
      setUploadKey((key) => key + 1)
      load()
    } catch {
      toast.error('Erreur réseau')
    }
  }

  const move = async (id: string, direction: 'up' | 'down') => {
    setMoving(id)
    try {
      const res = await apiFetch(`/api/slides/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction }),
      })

      if (!res.ok) { toast.error('Impossible de déplacer l’image'); return }
      load()
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setMoving(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await apiFetch(`/api/slides/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) { toast.error('Erreur de suppression'); return }
      toast.success('Image retirée du carrousel')
      setDeleteId(null)
      load()
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <DashboardHeader
        title="Carrousel d’accueil"
        subtitle={`${slides.length} image${slides.length > 1 ? 's' : ''} — section hero du site public`}
      />

      <div className="max-w-2xl mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-1">Ajouter une image</h2>
          <p className="text-xs text-slate-400 mb-4">
            Formats acceptés : JPEG, PNG, WebP (max. 10 MB). L’image est ajoutée à la fin du carrousel.
          </p>
          <FileUpload
            key={uploadKey}
            folder="slides"
            accept="image/jpeg,image/png,image/webp"
            label="Image du carrousel"
            onUpload={handleUpload}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RiLoader4Line className="w-7 h-7 text-primary-500 animate-spin" />
        </div>
      ) : slides.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <RiImageLine className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Aucune image dans le carrousel.</p>
          <p className="text-xs mt-1">L’accueil affichera un fond sombre en attendant.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {slides.map((slide, index) => (
            <div key={slide.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="relative aspect-video bg-slate-100">
                <Image
                  src={slide.imageUrl}
                  alt={`Slide ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover"
                />
                <span className="absolute top-2 left-2 inline-flex items-center justify-center min-w-7 h-7 px-2 rounded-lg bg-black/60 text-white text-xs font-semibold">
                  {index + 1}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 p-3">
                <p className="text-xs text-slate-400 truncate">Image {index + 1}</p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(slide.id, 'up')}
                    disabled={index === 0 || moving === slide.id}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Monter"
                  >
                    <RiArrowUpLine className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(slide.id, 'down')}
                    disabled={index === slides.length - 1 || moving === slide.id}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Descendre"
                  >
                    <RiArrowDownLine className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(slide.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Supprimer"
                  >
                    <RiDeleteBinLine className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        message="Cette image sera retirée du carrousel. Le fichier Cloudinary associé sera supprimé s’il a été uploadé depuis l’administration."
        loading={deleting}
      />
    </div>
  )
}
