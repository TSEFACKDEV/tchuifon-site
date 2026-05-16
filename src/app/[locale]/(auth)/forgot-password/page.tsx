'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { toast } from '@/components/ui/Toast'
import { RiMailLine, RiArrowLeftLine } from 'react-icons/ri'

const schema = z.object({ email: z.string().email('Email invalide') })
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const t = useTranslations('auth.forgotPassword')
  const locale = useLocale()
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error); return }
      setSent(true)
    } catch {
      toast.error('Erreur réseau')
    }
  }

  if (sent) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-400/20 mb-4">
          <RiMailLine className="w-7 h-7 text-green-300" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">{t('emailSentTitle')}</h2>
        <p className="text-sm text-blue-200 mb-6">
          {t('emailSent')}
        </p>
        <Link href={`/${locale}/login`} className="inline-flex items-center gap-2 text-sm text-blue-200 hover:text-white transition-colors">
          <RiArrowLeftLine className="w-4 h-4" />
          {t('backToLogin')}
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8">
      <Link href={`/${locale}/login`} className="inline-flex items-center gap-1.5 text-sm text-blue-200 hover:text-white transition-colors mb-6">
        <RiArrowLeftLine className="w-4 h-4" />
        {t('back')}
      </Link>
      <h1 className="text-xl font-semibold text-white mb-1">{t('title')}</h1>
      <p className="text-sm text-blue-200 mb-6">{t('description')}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-blue-100">{t('email')}</label>
          <input
            {...register('email')}
            type="email"
            placeholder={t('emailPlaceholder')}
            className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-blue-300/60 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
          />
          {errors.email && <p className="text-xs text-red-300">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-white text-primary-800 hover:bg-blue-50 font-semibold py-2.5 rounded-lg transition-all text-sm disabled:opacity-60"
        >
          {isSubmitting ? t('sending') : t('submit')}
        </button>
      </form>
    </div>
  )
}
