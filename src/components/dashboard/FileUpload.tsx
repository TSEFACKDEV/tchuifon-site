'use client'
import { useState, useRef } from 'react'
import { clsx } from 'clsx'
import { RiUploadCloud2Line, RiFileLine, RiDeleteBinLine, RiLoader4Line } from 'react-icons/ri'
import { toast } from '@/components/ui/Toast'

type Props = {
  folder: 'profiles' | 'publications' | 'courses' | 'cv' | 'collaborators'
  accept?: string
  label?: string
  currentUrl?: string
  onUpload: (url: string) => void
  onRemove?: () => void
}

export default function FileUpload({ folder, accept, label = 'Fichier', currentUrl, onUpload, onRemove }: Props) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null)
  const inputRef = useRef<HTMLInputElement>(null)

  const isImage = accept?.includes('image')

  const handleFile = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) { toast.error(data.error ?? 'Erreur upload'); return }

      setPreview(data.url)
      onUpload(data.url)
      toast.success('Fichier uploadé ✓')
    } catch {
      toast.error('Erreur lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleRemove = () => {
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ''
    onRemove?.()
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>

      {preview ? (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
          {isImage ? (
            <img src={preview} alt="preview" className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center">
              <RiFileLine className="w-5 h-5 text-red-500" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-700 truncate">Fichier uploadé</p>
            <a href={preview} target="_blank" rel="noopener noreferrer"
              className="text-xs text-primary-600 hover:underline truncate block">
              Voir le fichier
            </a>
          </div>
          <button type="button" onClick={handleRemove}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
            <RiDeleteBinLine className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          className={clsx(
            'border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer transition-colors',
            'hover:border-primary-400 hover:bg-primary-50/50',
            uploading && 'pointer-events-none opacity-60'
          )}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-primary-600">
              <RiLoader4Line className="w-7 h-7 animate-spin" />
              <p className="text-xs font-medium">Upload en cours...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <RiUploadCloud2Line className="w-8 h-8" />
              <p className="text-xs font-medium">Glisser-déposer ou cliquer</p>
              <p className="text-xs">{accept ?? 'Tous fichiers'} · max 10 MB</p>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
        </div>
      )}
    </div>
  )
}