'use client'
import { useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { clsx } from 'clsx'

const LANGUAGES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
]

export default function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const [isPending, startTransition] = useTransition()

  const handleLanguageChange = (newLocale: string) => {
    // Remplacer la locale dans le chemin
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`)
    startTransition(() => {
      router.push(newPathname)
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
