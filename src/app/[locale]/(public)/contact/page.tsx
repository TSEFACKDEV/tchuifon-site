'use client'
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations, useLocale } from 'next-intl'
import { toast } from '@/components/ui/Toast'
import { RiMailLine, RiPhoneLine, RiMapPinLine, RiSendPlaneLine, RiCheckLine } from 'react-icons/ri'

type FormData = {
  name: string
  email: string
  subject: string
  message: string
}

export default function ContactPage() {
  const t = useTranslations('contact')
  const locale = useLocale()
  const [sent, setSent] = useState(false)

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(2, t('errors.nameRequired')),
        email: z.string().email(t('errors.invalidEmail')),
        subject: z.string().min(3, t('errors.subjectRequired')),
        message: z.string().min(10, t('errors.messageTooShort')),
      }),
    [t]
  )

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) { toast.error(json.error); return }
    setSent(true)
    reset()
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('pageTitle')}</h1>
        <p className="text-slate-500">{t('pageSubtitle')}</p>
      </motion.div>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Infos contact */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="md:col-span-2 space-y-4">
          {[
            { icon: RiMailLine, label: t('emailLabel'), value: 'tchuifondonald@yahoo.fr', href: 'mailto:tchuifondonald@yahoo.fr' },
            { icon: RiPhoneLine, label: t('phoneLabel'), value: '+237 674 78 00 94', href: 'tel:+237674780094' },
            { icon: RiMapPinLine, label: t('officeLabel'), value: locale === 'fr' ? 'PK 17 Douala, Campus ENSPD' : 'PK 17 Douala, ENSPD Campus', href: null },
          ].map(({ icon: Icon, label, value, href }) => (
            <div key={label} className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                {href ? (
                  <a href={href} className="text-sm font-medium text-slate-800 hover:text-primary-600 transition-colors">{value}</a>
                ) : (
                  <p className="text-sm font-medium text-slate-800">{value}</p>
                )}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Formulaire */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="md:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            {sent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <RiCheckLine className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('successTitle')}</h3>
                <p className="text-sm text-slate-500 mb-6">{t('successMessage')}</p>
                <button onClick={() => setSent(false)} className="text-sm text-primary-600 hover:underline">
                  {t('sendAnother')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">{t('fullName')}</label>
                    <input {...register('name')} placeholder={t('fullNamePlaceholder')}
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">{t('email')}</label>
                    <input {...register('email')} type="email" placeholder={t('emailPlaceholder')}
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                    {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700">{t('subject')}</label>
                  <input {...register('subject')} placeholder={t('subjectPlaceholder')}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                  {errors.subject && <p className="text-xs text-red-500">{errors.subject.message}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700">{t('message')}</label>
                  <textarea {...register('message')} rows={5} placeholder={t('messagePlaceholder')}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none" />
                  {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
                </div>

                <button type="submit" disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors disabled:opacity-60">
                  {isSubmitting ? t('sending') : (<><RiSendPlaneLine className="w-4 h-4" /> {t('submit')}</>)}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
