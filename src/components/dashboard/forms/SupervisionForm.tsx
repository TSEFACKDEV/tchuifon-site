'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormField, inputClass, selectClass, textareaClass } from '../FormField'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  studentName:  z.string().min(1, 'Nom requis'),
  level:        z.enum(['INGENIEUR', 'MASTER_2', 'DOCTORAT', 'POST_DOC']).optional(),
  topic:        z.string().min(1, 'Sujet requis'),
  description:  z.string().optional(),
  startDate:    z.string().optional(),
  endDate:      z.string().optional(),
  status:       z.enum(['IN_PROGRESS', 'COMPLETED', 'ABANDONED']),  // ← pas de .default()
  thesisUrl:    z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function SupervisionForm({ initialData, onSubmit, loading }: {
  initialData?: Partial<FormData>; onSubmit: (d: FormData) => Promise<void>; loading?: boolean
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {                                               // ← valeur par défaut ici
      status: 'IN_PROGRESS',
      ...initialData,
      startDate: initialData?.startDate
        ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
      endDate: initialData?.endDate
        ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
      <FormField label="Nom de l'étudiant" required error={errors.studentName?.message}>
        <input {...register('studentName')} className={inputClass} placeholder="Prénom NOM" />
      </FormField>

      <div className="grid sm:grid-cols-2 gap-4">
        <FormField label="Niveau">
          <select {...register('level')} className={selectClass}>
            <option value="">— Sélectionner —</option>
            <option value="INGENIEUR">Ingénieur</option>
            <option value="MASTER_2">Master 2</option>
            <option value="DOCTORAT">Doctorat</option>
            <option value="POST_DOC">Post-Doc</option>
          </select>
        </FormField>
        <FormField label="Statut">
          <select {...register('status')} className={selectClass}>
            <option value="IN_PROGRESS">En cours</option>
            <option value="COMPLETED">Terminé</option>
            <option value="ABANDONED">Abandonné</option>
          </select>
        </FormField>
      </div>

      <FormField label="Sujet" required error={errors.topic?.message}>
        <input {...register('topic')} className={inputClass} placeholder="Titre du sujet" />
      </FormField>

      <FormField label="Description">
        <textarea {...register('description')} className={textareaClass} rows={3}
          placeholder="Description détaillée..." />
      </FormField>

      <div className="grid sm:grid-cols-2 gap-4">
        <FormField label="Date de début">
          <input {...register('startDate')} type="date" className={inputClass} />
        </FormField>
        <FormField label="Date de fin">
          <input {...register('endDate')} type="date" className={inputClass} />
        </FormField>
      </div>

      <FormField label="Lien vers la thèse / mémoire">
        <input {...register('thesisUrl')} className={inputClass} placeholder="https://..." />
      </FormField>

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>
          {initialData ? 'Mettre à jour' : 'Créer l\'encadrement'}
        </Button>
      </div>
    </form>
  )
}