import { clsx } from 'clsx'

type Props = {
  label: string
  error?: string
  required?: boolean
  hint?: string
  children: React.ReactNode
  className?: string
}

export function FormField({ label, error, required, hint, children, className }: Props) {
  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      <label className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 flex items-center gap-1">⚠ {error}</p>}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

// Styles réutilisables pour les inputs dans les formulaires dashboard
export const inputClass = 'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-slate-400 text-slate-900 transition-colors hover:border-slate-300'

export const selectClass = inputClass + ' cursor-pointer'

export const textareaClass = inputClass + ' resize-none'