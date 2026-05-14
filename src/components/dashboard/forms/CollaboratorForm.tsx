'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormField, inputClass } from '../FormField'
import { Button } from '@/components/ui/Button'
import FileUpload from '../FileUpload'

const schema = z.object({
  name: z.string().min(1, 'Nom requis'),
  title: z.string().optional(),
  institution: z.string().optional(),
  department: z.string().optional(),
  country: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().optional(),
  photoUrl: z.string().optional(),
  researchArea: z.string().optional(),
  googleScholar: z.string().optional(),
  orcid: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function CollaboratorForm({ initialData, onSubmit, loading }: {
  initialData?: Partial<FormData>; onSubmit: (d: FormData) => Promise<void>; loading?: boolean
}) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData ?? {},
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <FormField label="Nom complet" required error={errors.name?.message}>
          <input {...register('name')} className={inputClass} placeholder="Prénom NOM" />
        </FormField>
        <FormField label="Titre / Fonction">
          <input {...register('title')} className={inputClass} placeholder="Prof., Dr., ..." />
        </FormField>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <FormField label="Institution">
          <input {...register('institution')} className={inputClass} placeholder="Université..." />
        </FormField>
        <FormField label="Département">
          <input {...register('department')} className={inputClass} placeholder="Département..." />
        </FormField>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <FormField label="Pays">
          <input {...register('country')} className={inputClass} placeholder="Cameroun, France..." />
        </FormField>
        <FormField label="Email">
          <input {...register('email')} type="email" className={inputClass} placeholder="email@exemple.com" />
        </FormField>
      </div>

      <FormField label="Domaine de recherche">
        <input {...register('researchArea')} className={inputClass} placeholder="Chimie, Physique..." />
      </FormField>

      <div className="grid sm:grid-cols-2 gap-4">
        <FormField label="Google Scholar (URL)">
          <input {...register('googleScholar')} className={inputClass} placeholder="https://scholar.google.com/..." />
        </FormField>
        <FormField label="ORCID">
          <input {...register('orcid')} className={inputClass} placeholder="0000-0000-0000-0000" />
        </FormField>
      </div>

      <FormField label="Site web">
        <input {...register('website')} className={inputClass} placeholder="https://..." />
      </FormField>

      <FileUpload
        folder="collaborators"
        accept="image/jpeg,image/png,image/webp"
        label="Photo de profil"
        currentUrl={watch('photoUrl')}
        onUpload={(url) => setValue('photoUrl', url)}
        onRemove={() => setValue('photoUrl', undefined)}
      />

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>
          {initialData ? 'Mettre à jour' : 'Ajouter le collaborateur'}
        </Button>
      </div>
    </form>
  )
}