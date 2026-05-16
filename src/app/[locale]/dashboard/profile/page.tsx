'use client'
import { useEffect, useState, useCallback } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { FormField, inputClass, textareaClass } from '@/components/dashboard/FormField'
import FileUpload from '@/components/dashboard/FileUpload'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { RiAddLine, RiDeleteBinLine, RiLoader4Line } from 'react-icons/ri'

const schema = z.object({
  fullName:        z.string().optional(),
  title:           z.string().optional(),
  bio:             z.string().optional(),
  photoUrl:        z.string().optional(),
  cvUrl:           z.string().optional(),
  institution:     z.string().optional(),
  department:      z.string().optional(),
  email:           z.string().email().optional().or(z.literal('')),
  phone:           z.string().optional(),
  officeLocation:  z.string().optional(),
  googleScholar:   z.string().optional(),
  researchGate:    z.string().optional(),
  orcid:           z.string().optional(),
  linkedin:        z.string().optional(),
  website:         z.string().optional(),
  specializations: z.array(z.object({ value: z.string() })),
  degrees:         z.array(z.object({ value: z.string() })),
})
type FormData = z.infer<typeof schema>

export default function DashboardProfilePage() {
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, setValue, watch, control, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { specializations: [], degrees: [] },
  })

  const { fields: specFields, append: addSpec, remove: removeSpec } = useFieldArray({ control, name: 'specializations' })
  const { fields: degreeFields, append: addDegree, remove: removeDegree } = useFieldArray({ control, name: 'degrees' })

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/profile')
      if (!res.ok) return
      const data = await res.json()
      reset({
        ...data,
        specializations: (data.specializations ?? []).map((v: string) => ({ value: v })),
        degrees: (data.degrees ?? []).map((v: string) => ({ value: v })),
      })
    } catch { toast.error('Impossible de charger le profil') }
    finally { setLoadingProfile(false) }
  }, [reset])

  useEffect(() => { loadProfile() }, [loadProfile])

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      const payload = {
        ...data,
        specializations: data.specializations.map(s => s.value).filter(Boolean),
        degrees: data.degrees.map(d => d.value).filter(Boolean),
      }
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) { const j = await res.json(); toast.error(j.error ?? 'Erreur'); return }
      toast.success('Profil mis à jour')
    } catch { toast.error('Erreur réseau') }
    finally { setSaving(false) }
  }

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center h-48">
        <RiLoader4Line className="w-7 h-7 text-primary-500 animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <DashboardHeader title="Mon profil" subtitle="Informations affichées sur la page d'accueil publique" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
        {/* Identité */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-900">Identité</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Nom complet">
              <input {...register('fullName')} className={inputClass} placeholder="Pr. Jean Dupont" />
            </FormField>
            <FormField label="Titre / Fonction">
              <input {...register('title')} className={inputClass} placeholder="Professeur des Universités" />
            </FormField>
          </div>
          <FormField label="Biographie">
            <textarea {...register('bio')} className={textareaClass} rows={4} placeholder="Courte biographie..." />
          </FormField>
          <div className="grid sm:grid-cols-2 gap-6">
            <FileUpload folder="profiles" accept="image/jpeg,image/png,image/webp" label="Photo de profil"
              currentUrl={watch('photoUrl')}
              onUpload={(url) => setValue('photoUrl', url)}
              onRemove={() => setValue('photoUrl', undefined)} />
            <FileUpload folder="cv" accept="application/pdf" label="CV (PDF)"
              currentUrl={watch('cvUrl')}
              onUpload={(url) => setValue('cvUrl', url)}
              onRemove={() => setValue('cvUrl', undefined)} />
          </div>
        </section>

        {/* Institution */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-900">Institution</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Institution">
              <input {...register('institution')} className={inputClass} placeholder="Université de Douala" />
            </FormField>
            <FormField label="Département">
              <input {...register('department')} className={inputClass} placeholder="Chimie Industrielle" />
            </FormField>
          </div>
          <FormField label="Localisation du bureau">
            <input {...register('officeLocation')} className={inputClass} placeholder="Bâtiment A, Bureau 12" />
          </FormField>
        </section>

        {/* Contact */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-900">Contact</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Email professionnel" error={errors.email?.message}>
              <input {...register('email')} type="email" className={inputClass} placeholder="prof@univ.cm" />
            </FormField>
            <FormField label="Téléphone">
              <input {...register('phone')} className={inputClass} placeholder="+237 6XX XXX XXX" />
            </FormField>
          </div>
        </section>

        {/* Liens académiques */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-900">Liens académiques</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Google Scholar">
              <input {...register('googleScholar')} className={inputClass} placeholder="https://scholar.google.com/..." />
            </FormField>
            <FormField label="ResearchGate">
              <input {...register('researchGate')} className={inputClass} placeholder="https://www.researchgate.net/..." />
            </FormField>
            <FormField label="ORCID">
              <input {...register('orcid')} className={inputClass} placeholder="0000-0000-0000-0000" />
            </FormField>
            <FormField label="LinkedIn">
              <input {...register('linkedin')} className={inputClass} placeholder="https://linkedin.com/in/..." />
            </FormField>
            <FormField label="Site personnel">
              <input {...register('website')} className={inputClass} placeholder="https://..." />
            </FormField>
          </div>
        </section>

        {/* Spécialisations */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Spécialisations</h2>
            <button type="button" onClick={() => addSpec({ value: '' })}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              <RiAddLine className="w-4 h-4" /> Ajouter
            </button>
          </div>
          <div className="space-y-2">
            {specFields.map((field, i) => (
              <div key={field.id} className="flex gap-2">
                <input {...register(`specializations.${i}.value`)} className={inputClass}
                  placeholder={`Spécialisation ${i + 1}`} />
                <button type="button" onClick={() => removeSpec(i)}
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors">
                  <RiDeleteBinLine className="w-4 h-4" />
                </button>
              </div>
            ))}
            {specFields.length === 0 && <p className="text-sm text-slate-400">Aucune spécialisation.</p>}
          </div>
        </section>

        {/* Diplômes */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Diplômes & Formations</h2>
            <button type="button" onClick={() => addDegree({ value: '' })}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              <RiAddLine className="w-4 h-4" /> Ajouter
            </button>
          </div>
          <div className="space-y-2">
            {degreeFields.map((field, i) => (
              <div key={field.id} className="flex gap-2">
                <input {...register(`degrees.${i}.value`)} className={inputClass}
                  placeholder={`ex: Doctorat en Chimie, Université de Paris, 2005`} />
                <button type="button" onClick={() => removeDegree(i)}
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors">
                  <RiDeleteBinLine className="w-4 h-4" />
                </button>
              </div>
            ))}
            {degreeFields.length === 0 && <p className="text-sm text-slate-400">Aucun diplôme renseigné.</p>}
          </div>
        </section>

        <div className="flex justify-end">
          <Button type="submit" loading={saving} size="lg">
            Enregistrer les modifications
          </Button>
        </div>
      </form>
    </div>
  )
}
