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
  fullName: z.string().optional(),
  title: z.string().optional(),
  bio: z.string().optional(),
  photoUrl: z.string().optional(),
  cvUrl: z.string().optional(),
  institution: z.string().optional(),
  department: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  officeLocation: z.string().optional(),
  googleScholar: z.string().optional(),
  researchGate: z.string().optional(),
  orcid: z.string().optional(),
  linkedin: z.string().optional(),
  website: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function DashboardProfilePage() {
  const { fetchMe } = useAuthStore()
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(data => {
      setProfile(data)
      reset(data)
    })
  }, [reset])

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error); return }
      toast.success('Profil mis à jour ✓')
      fetchMe()
    } catch { toast.error('Erreur réseau') }
    finally { setSaving(false) }
  }

  return (
    <div>
      <DashboardHeader title="Mon profil" subtitle="Informations publiques affichées sur le site" />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Photo + liens sociaux */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">Photo de profil</h2>
              <FileUpload
                folder="profiles"
                accept="image/jpeg,image/png,image/webp"
                currentUrl={watch('photoUrl')}
                onUpload={(url) => setValue('photoUrl', url)}
                onRemove={() => setValue('photoUrl', undefined)}
              />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h2 className="text-sm font-semibold text-slate-700">CV</h2>
              <FileUpload
                folder="cv"
                accept="application/pdf"
                label="Curriculum Vitae (PDF)"
                currentUrl={watch('cvUrl')}
                onUpload={(url) => setValue('cvUrl', url)}
                onRemove={() => setValue('cvUrl', undefined)}
              />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h2 className="text-sm font-semibold text-slate-700">Liens académiques</h2>
              <FormField label="Google Scholar">
                <input {...register('googleScholar')} className={inputClass} placeholder="URL Google Scholar" />
              </FormField>
              <FormField label="ResearchGate">
                <input {...register('researchGate')} className={inputClass} placeholder="URL ResearchGate" />
              </FormField>
              <FormField label="ORCID">
                <input {...register('orcid')} className={inputClass} placeholder="0000-0000-0000-0000" />
              </FormField>
              <FormField label="LinkedIn">
                <input {...register('linkedin')} className={inputClass} placeholder="URL LinkedIn" />
              </FormField>
              <FormField label="Site web">
                <input {...register('website')} className={inputClass} placeholder="https://..." />
              </FormField>
            </div>
          </motion.div>

          {/* Infos principales */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
              <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-3">
                Informations personnelles
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="Nom complet">
                  <input {...register('fullName')} className={inputClass} />
                </FormField>
                <FormField label="Titre / Grade">
                  <input {...register('title')} className={inputClass} />
                </FormField>
              </div>
              <FormField label="Biographie">
                <textarea {...register('bio')} className={textareaClass} rows={5}
                  placeholder="Décrivez vos activités de recherche, votre parcours..." />
              </FormField>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
              <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-3">
                Institution
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="Institution">
                  <input {...register('institution')} className={inputClass} />
                </FormField>
                <FormField label="Département">
                  <input {...register('department')} className={inputClass} />
                </FormField>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
              <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-3">
                Coordonnées
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="Email" error={errors.email?.message}>
                  <input {...register('email')} type="email" className={inputClass} />
                </FormField>
                <FormField label="Téléphone">
                  <input {...register('phone')} className={inputClass} />
                </FormField>
              </div>
              <FormField label="Bureau / Localisation">
                <input {...register('officeLocation')} className={inputClass} />
              </FormField>
            </div>

            <div className="flex justify-end">
              <Button type="submit" loading={saving} size="lg">
                Enregistrer les modifications
              </Button>
            </div>
          </motion.div>
        </div>
      </form>
    </div>
  )
}