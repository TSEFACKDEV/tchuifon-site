'use client'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormField, inputClass, selectClass, textareaClass } from '../FormField'
import { Button } from '@/components/ui/Button'
import { RiAddLine, RiDeleteBinLine } from 'react-icons/ri'

const schema = z.object({
  title:       z.string().min(1, 'Titre requis'),
  code:        z.string().optional(),
  level:       z.enum(['LICENCE', 'MASTER', 'INGENIEUR', 'DOCTORAT']).optional(),
  description: z.string().optional(),
  credits:     z.number().int().optional(),
  hours:       z.number().int().optional(),
  semester:    z.string().optional(),
  syllabus:    z.string().optional(),
  objectives:  z.array(z.object({ value: z.string() })),  // ← pas de .default()
  isActive:    z.boolean(),                                // ← pas de .default()
})

type FormData = z.infer<typeof schema>
type CourseApiInput = Omit<Partial<FormData>, 'objectives'> & { objectives?: string[] }

export default function CourseForm({ initialData, onSubmit, loading }: {
  initialData?: CourseApiInput; onSubmit: (d: Record<string, unknown>) => Promise<void>; loading?: boolean
}) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {                                        // ← valeurs par défaut ici
      isActive: true,
      ...initialData,
      objectives: initialData?.objectives?.map((v) => ({ value: v })) ?? [],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'objectives' })

  const submit = (data: FormData) => onSubmit({
    ...data,
    credits: data.credits ? Number(data.credits) : undefined,
    hours:   data.hours   ? Number(data.hours)   : undefined,
    objectives: data.objectives.map(o => o.value).filter(Boolean),
  })

  return (
    <form onSubmit={handleSubmit(submit)} className="p-6 space-y-5">
      <FormField label="Titre du cours" required error={errors.title?.message}>
        <input {...register('title')} className={inputClass} placeholder="ex: Chimie Générale" />
      </FormField>

      <div className="grid sm:grid-cols-3 gap-4">
        <FormField label="Code">
          <input {...register('code')} className={inputClass} placeholder="CHI101" />
        </FormField>
        <FormField label="Niveau">
          <select {...register('level')} className={selectClass}>
            <option value="">— Sélectionner —</option>
            <option value="LICENCE">Licence</option>
            <option value="MASTER">Master</option>
            <option value="INGENIEUR">Ingénieur</option>
            <option value="DOCTORAT">Doctorat</option>
          </select>
        </FormField>
        <FormField label="Semestre">
          <input {...register('semester')} className={inputClass} placeholder="S1, S2..." />
        </FormField>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <FormField label="Crédits">
          <input {...register('credits', { valueAsNumber: true })} type="number"
            className={inputClass} placeholder="3" />
        </FormField>
        <FormField label="Heures">
          <input {...register('hours', { valueAsNumber: true })} type="number"
            className={inputClass} placeholder="45" />
        </FormField>
      </div>

      <FormField label="Description">
        <textarea {...register('description')} className={textareaClass} rows={3}
          placeholder="Description du cours..." />
      </FormField>

      <FormField label="Syllabus">
        <textarea {...register('syllabus')} className={textareaClass} rows={4}
          placeholder="Contenu détaillé..." />
      </FormField>

      {/* Objectifs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-slate-700">Objectifs pédagogiques</label>
          <button type="button" onClick={() => append({ value: '' })}
            className="text-xs text-primary-600 flex items-center gap-1">
            <RiAddLine className="w-3.5 h-3.5" /> Ajouter
          </button>
        </div>
        <div className="space-y-2">
          {fields.map((field, i) => (
            <div key={field.id} className="flex gap-2">
              <input {...register(`objectives.${i}.value`)} className={inputClass}
                placeholder={`Objectif ${i + 1}`} />
              <button type="button" onClick={() => remove(i)}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors">
                <RiDeleteBinLine className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <input {...register('isActive')} type="checkbox" id="isActive"
          className="w-4 h-4 rounded text-primary-600" />
        <label htmlFor="isActive" className="text-sm font-medium text-slate-700 cursor-pointer">
          Cours actif (visible sur le site)
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>
          {initialData ? 'Mettre à jour' : 'Créer le cours'}
        </Button>
      </div>
    </form>
  )
}