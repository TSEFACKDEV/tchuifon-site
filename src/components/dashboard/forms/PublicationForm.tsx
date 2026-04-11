'use client'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormField, inputClass, selectClass, textareaClass } from '../FormField'
import { Button } from '@/components/ui/Button'
import FileUpload from '../FileUpload'
import { RiAddLine, RiDeleteBinLine } from 'react-icons/ri'

const schema = z.object({
  title:          z.string().min(1, 'Titre requis'),
  abstract:       z.string().optional(),
  authors:        z.array(z.object({ value: z.string().min(1) })).min(1),
  journal:        z.string().optional(),
  conference:     z.string().optional(),
  year:           z.number().int().min(1900).max(2100).optional(),
  volume:         z.string().optional(),
  issue:          z.string().optional(),
  pages:          z.string().optional(),
  publisher:      z.string().optional(),
  doi:            z.string().optional(),
  pdfUrl:         z.string().optional(),
  type:           z.enum(['ARTICLE', 'CONFERENCE', 'BOOK_CHAPTER', 'THESIS', 'PATENT', 'POSTER']),
  keywords:       z.array(z.object({ value: z.string() })),   // ← pas de .default()
  isPublished:    z.boolean(),                                 // ← pas de .default()
})

type FormData = z.infer<typeof schema>

type Props = {
  initialData?: any
  onSubmit: (data: any) => Promise<void>
  loading?: boolean
}

export default function PublicationForm({ initialData, onSubmit, loading }: Props) {
  const { register, handleSubmit, setValue, watch, control, formState: { errors } } =
    useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: {                                         // ← valeurs par défaut ici
        type: 'ARTICLE',
        isPublished: true,
        keywords: [],
        authors: initialData?.authors?.map((v: string) => ({ value: v })) ?? [{ value: '' }],
        ...initialData,
      },
    })

  const { fields: authorFields, append: addAuthor, remove: removeAuthor } =
    useFieldArray({ control, name: 'authors' })
  const { fields: keywordFields, append: addKeyword, remove: removeKeyword } =
    useFieldArray({ control, name: 'keywords' })

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      ...data,
      year: data.year ? Number(data.year) : undefined,
      authors: data.authors.map(a => a.value).filter(Boolean),
      keywords: data.keywords.map(k => k.value).filter(Boolean),
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-5">
      <FormField label="Titre" required error={errors.title?.message}>
        <input {...register('title')} className={inputClass} placeholder="Titre de la publication" />
      </FormField>

      <div className="grid sm:grid-cols-2 gap-4">
        <FormField label="Type" required>
          <select {...register('type')} className={selectClass}>
            <option value="ARTICLE">Article</option>
            <option value="CONFERENCE">Conférence</option>
            <option value="BOOK_CHAPTER">Chapitre de livre</option>
            <option value="THESIS">Thèse</option>
            <option value="PATENT">Brevet</option>
            <option value="POSTER">Poster</option>
          </select>
        </FormField>
        <FormField label="Année">
          <input {...register('year', { valueAsNumber: true })} type="number"
            className={inputClass} placeholder="2024" />
        </FormField>
      </div>

      {/* Auteurs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-slate-700">Auteurs <span className="text-red-500">*</span></label>
          <button type="button" onClick={() => addAuthor({ value: '' })}
            className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
            <RiAddLine className="w-3.5 h-3.5" /> Ajouter
          </button>
        </div>
        <div className="space-y-2">
          {authorFields.map((field, i) => (
            <div key={field.id} className="flex gap-2">
              <input {...register(`authors.${i}.value`)} className={inputClass}
                placeholder={`Auteur ${i + 1}`} />
              {authorFields.length > 1 && (
                <button type="button" onClick={() => removeAuthor(i)}
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors">
                  <RiDeleteBinLine className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <FormField label="Journal">
          <input {...register('journal')} className={inputClass} placeholder="Nom du journal" />
        </FormField>
        <FormField label="Conférence">
          <input {...register('conference')} className={inputClass} placeholder="Nom de la conférence" />
        </FormField>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <FormField label="Volume">
          <input {...register('volume')} className={inputClass} placeholder="12" />
        </FormField>
        <FormField label="Numéro">
          <input {...register('issue')} className={inputClass} placeholder="3" />
        </FormField>
        <FormField label="Pages">
          <input {...register('pages')} className={inputClass} placeholder="145-162" />
        </FormField>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <FormField label="DOI">
          <input {...register('doi')} className={inputClass} placeholder="10.1234/example" />
        </FormField>
        <FormField label="Éditeur">
          <input {...register('publisher')} className={inputClass} placeholder="Springer..." />
        </FormField>
      </div>

      <FormField label="Résumé">
        <textarea {...register('abstract')} className={textareaClass} rows={4}
          placeholder="Résumé de la publication..." />
      </FormField>

      {/* Mots-clés */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-slate-700">Mots-clés</label>
          <button type="button" onClick={() => addKeyword({ value: '' })}
            className="text-xs text-primary-600 flex items-center gap-1">
            <RiAddLine className="w-3.5 h-3.5" /> Ajouter
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {keywordFields.map((field, i) => (
            <div key={field.id} className="flex items-center gap-1 bg-slate-100 rounded-lg px-2 py-1">
              <input {...register(`keywords.${i}.value`)}
                className="bg-transparent text-sm text-slate-700 outline-none w-24"
                placeholder="mot-clé" />
              <button type="button" onClick={() => removeKeyword(i)}
                className="text-slate-400 hover:text-red-500 transition-colors">
                <RiDeleteBinLine className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <FileUpload
        folder="publications"
        accept="application/pdf"
        label="Fichier PDF"
        currentUrl={watch('pdfUrl')}
        onUpload={(url) => setValue('pdfUrl', url)}
        onRemove={() => setValue('pdfUrl', undefined)}
      />

      <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <input {...register('isPublished')} type="checkbox" id="isPublished"
          className="w-4 h-4 rounded text-primary-600" />
        <label htmlFor="isPublished" className="text-sm font-medium text-slate-700 cursor-pointer">
          Publication visible publiquement
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>
          {initialData ? 'Mettre à jour' : 'Créer la publication'}
        </Button>
      </div>
    </form>
  )
}