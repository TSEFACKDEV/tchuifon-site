'use client'
import { useTransition } from 'react'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { clsx } from 'clsx'

const LANGUAGES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
] as const

export default function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const [isPending, startTransition] = useTransition()

  const handleLanguageChange = (newLocale: (typeof LANGUAGES)[number]['code']) => {
    if (newLocale === locale) return
    startTransition(() => {
      // Conserve les éventuels paramètres de requête et le hash.
      const target = `${pathname}${window.location.search}${window.location.hash}`
      router.replace(target, { locale: newLocale })
    })
  }

  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
      {LANGUAGES.map(({ code, label, flag }) => (
        <button
          key={code}
          onClick={() => handleLanguageChange(code)}
          disabled={isPending}
          className={clsx(
            'px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5',
            locale === code
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          )}
          title={label}
        >
          <span>{flag}</span>
          <span className="hidden sm:inline">{code.toUpperCase()}</span>
        </button>
      ))}
    </div>
  )
}
