'use client'
import { Suspense, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { toast } from '@/components/ui/Toast'
import { RiLockLine, RiArrowLeftLine } from 'react-icons/ri'

type FormData = {
  password: string
  confirmPassword: string
}

function ResetPasswordContent() {
  const t = useTranslations('auth.resetPassword')
  const locale = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [success, setSuccess] = useState(false)

  const schema = useMemo(
    () =>
      z
        .object({
          password: z
            .string()
            .min(8, t('errors.minLength'))
            .regex(/[A-Z]/, t('errors.uppercase'))
            .regex(/[0-9]/, t('errors.number'))
            .regex(/[^a-zA-Z0-9]/, t('errors.special')),
          confirmPassword: z.string().min(8, t('errors.minLength')),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: t('errors.mismatch'),
          path: ['confirmPassword'],
        }),
    [t]
  )

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    if (!token) { toast.error(t('errors.invalidToken')); return }
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: data.password }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(res.status === 400 ? t('errors.invalidToken') : (json.error ?? t('errors.networkError')))
        return
      }
      setSuccess(true)
      setTimeout(() => router.push(`/${locale}/login`), 2000)
    } catch {
      toast.error(t('errors.networkError'))
    }
  }

  if (success) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-400/20 mb-4">
          <RiLockLine className="w-7 h-7 text-green-300" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">{t('successTitle')}</h2>
        <p className="text-sm text-blue-200 mb-6">
          {t('success')}
        </p>
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
          <label className="text-sm font-medium text-blue-100">{t('password')}</label>
          <input
            {...register('password')}
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-blue-300/60 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
          />
          {errors.password && <p className="text-xs text-red-300">{errors.password.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-blue-100">{t('confirmPassword')}</label>
          <input
            {...register('confirmPassword')}
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-blue-300/60 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
          />
          {errors.confirmPassword && <p className="text-xs text-red-300">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-white text-primary-800 hover:bg-blue-50 font-semibold py-2.5 rounded-lg transition-all text-sm disabled:opacity-60"
        >
          {isSubmitting ? t('processing') : t('submit')}
        </button>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  const t = useTranslations('auth.resetPassword')

  return (
    <Suspense fallback={<div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 text-center text-blue-200 text-sm">{t('processing')}</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
