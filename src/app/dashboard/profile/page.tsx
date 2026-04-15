'use client'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { FormField, inputClass, textareaClass } from '@/components/dashboard/FormField'
import FileUpload from '@/components/dashboard/FileUpload'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { useAuthStore } from '@/store/authStore'

const schema = z.object({
  fullName:        z.string().optional(),
  title:           z.string().optional(),
  bio:             z.string().optional(),
  photoUrl:        z.string().optional(),
  cvUrl:           z.string().optional(),
  institution:     z.string().optional(),
  department:      z.string().optional(),
  email:           z.string().optional(),
  phone:           z.string().optional(),
  officeLocation:  z.string().optional(),
  googleScholar:   z.string().optional(),
  researchGate:    z.string().optional(),
  orcid:           z.string().optional(),
  linkedin:        z.string().optional(),
  website:         z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function DashboardProfilePage() {
  const { fetchMe } = useAuthStore()
  const [saving, setSaving] = useState(false)
  const [oldPhotoPublicId, setOldPhotoPublicId] = useState<string | null>(null)
  const [oldCvPublicId, setOldCvPublicId] = useState<string | null>(null)

  const {
    register, handleSubmit, setValue, watch, reset,
    formState: { errors, isDirty },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => {
        if (data.error) return
        reset({
          fullName:       data.fullName       ?? '',
          title:          data.title          ?? '',
          bio:            data.bio            ?? '',
          photoUrl:       data.photoUrl       ?? '',
          cvUrl:          data.cvUrl          ?? '',
          institution:    data.institution    ?? '',
          department:     data.department     ?? '',
          email:          data.email          ?? '',
          phone:          data.phone          ?? '',
          officeLocation: data.officeLocation ?? '',
          googleScholar:  data.googleScholar  ?? '',
          researchGate:   data.researchGate   ?? '',
          orcid:          data.orcid          ?? '',
          linkedin:       data.linkedin       ?? '',
          website:        data.website        ?? '',
        })
        // Mémoriser les publicIds cloudinary pour suppression future
        if (data.photoUrl) extractPublicId(data.photoUrl, setOldPhotoPublicId)
        if (data.cvUrl)    extractPublicId(data.cvUrl,    setOldCvPublicId)
      })
      .catch(err => console.error('Erreur chargement profil:', err))
  }, [reset])

  // Extraire le publicId depuis une URL Cloudinary
  function extractPublicId(url: string, setter: (id: string) => void) {
    try {
      const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/)
      if (match?.[1]) setter(match[1])
    } catch { /* ignore */ }
  }

  const onSubmit = async (data: FormData) => {
    console.log('Soumission du formulaire:', data)
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await res.json()
      console.log('Réponse API:', res.status, json)

      if (res.status === 401) {
        toast.error('Session expirée, reconnectez-vous')
        window.location.href = '/login'
        return
      }
      if (!res.ok) {
        toast.error(json.error ?? `Erreur ${res.status}`)
        return
      }

      toast.success('Profil mis à jour ✓')
      await fetchMe()
    } catch (err) {
      console.error('Erreur réseau:', err)
      toast.error('Erreur réseau')
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoUpload = async (newUrl: string) => {
    // Supprimer l'ancienne photo Cloudinary
    if (oldPhotoPublicId) {
      await fetch('/api/upload', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId: oldPhotoPublicId, resourceType: 'image' }),
      })
    }
    setValue('photoUrl', newUrl, { shouldDirty: true })
    extractPublicId(newUrl, setOldPhotoPublicId)
  }

  const handleCvUpload = async (newUrl: string) => {
    if (oldCvPublicId) {
      await fetch('/api/upload', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId: oldCvPublicId, resourceType: 'raw' }),
      })
    }
    setValue('cvUrl', newUrl, { shouldDirty: true })
    extractPublicId(newUrl, setOldCvPublicId)
  }

  return (
    <div>
      <DashboardHeader
        title="Mon profil"
        subtitle="Informations publiques affichées sur le site"
      />

      <form onSubmit={handleSubmit(onSubmit, (errors) => {
        console.error('Erreurs de validation:', errors)
        toast.error('Vérifiez les champs du formulaire')
      })}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Colonne gauche */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Photo */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">Photo de profil</h2>
              <FileUpload
                folder="profiles"
                accept="image/jpeg,image/png,image/webp"
                currentUrl={watch('photoUrl')}
                onUpload={handlePhotoUpload}
                onRemove={() => setValue('photoUrl', '', { shouldDirty: true })}
              />
            </div>

            {/* CV */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">Curriculum Vitae</h2>
              <FileUpload
                folder="cv"
                accept="application/pdf"
                label="CV (PDF)"
                currentUrl={watch('cvUrl')}
                onUpload={handleCvUpload}
                onRemove={() => setValue('cvUrl', '', { shouldDirty: true })}
              />
            </div>

            {/* Liens académiques */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h2 className="text-sm font-semibold text-slate-700">Liens académiques</h2>
              <FormField label="Google Scholar">
                <input {...register('googleScholar')} className={inputClass}
                  placeholder="https://scholar.google.com/..." />
              </FormField>
              <FormField label="ResearchGate">
                <input {...register('researchGate')} className={inputClass}
                  placeholder="https://researchgate.net/..." />
              </FormField>
              <FormField label="ORCID">
                <input {...register('orcid')} className={inputClass}
                  placeholder="0000-0000-0000-0000" />
              </FormField>
              <FormField label="LinkedIn">
                <input {...register('linkedin')} className={inputClass}
                  placeholder="https://linkedin.com/in/..." />
              </FormField>
              <FormField label="Site web">
                <input {...register('website')} className={inputClass}
                  placeholder="https://..." />
              </FormField>
            </div>
          </motion.div>

          {/* Colonne droite */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Identité */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
              <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-3">
                Informations personnelles
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="Nom complet">
                  <input {...register('fullName')} className={inputClass}
                    placeholder="Pr. TCHUIFON Donald Raoul" />
                </FormField>
                <FormField label="Titre / Grade">
                  <input {...register('title')} className={inputClass}
                    placeholder="Maître de Conférences" />
                </FormField>
              </div>
              <FormField label="Biographie / Présentation">
                <textarea {...register('bio')} className={`${inputClass} resize-none`}
                  rows={6} placeholder="Décrivez vos activités..." />
              </FormField>
            </div>

            {/* Institution */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-3">
                Institution
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="Institution">
                  <input {...register('institution')} className={inputClass}
                    placeholder="ENSPD Douala" />
                </FormField>
                <FormField label="Département">
                  <input {...register('department')} className={inputClass}
                    placeholder="Génie des Procédés" />
                </FormField>
              </div>
            </div>

            {/* Coordonnées */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-3">
                Coordonnées
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="Email">
                  <input {...register('email')} type="email" className={inputClass}
                    placeholder="tchuifondonald@yahoo.fr" />
                </FormField>
                <FormField label="Téléphone">
                  <input {...register('phone')} className={inputClass}
                    placeholder="+237 6XX XX XX XX" />
                </FormField>
              </div>
              <FormField label="Bureau / Localisation">
                <input {...register('officeLocation')} className={inputClass}
                  placeholder="PK 17 Douala — Campus ENSPD" />
              </FormField>
            </div>

            {/* Bouton */}
            <div className="flex justify-end">
              <Button type="submit" loading={saving} size="lg">
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
            </div>
          </motion.div>
        </div>
      </form>
    </div>
  )
}