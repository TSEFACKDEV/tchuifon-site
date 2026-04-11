'use client'
import { Suspense, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from '@/components/ui/Toast'
import { RiLockPasswordLine, RiEyeLine, RiEyeOffLine, RiCheckLine } from 'react-icons/ri'

const schema = z.object({
  password: z
    .string()
    .min(8, 'Au moins 8 caractères')
    .regex(/[A-Z]/, 'Au moins une majuscule')
    .regex(/[0-9]/, 'Au moins un chiffre')
    .regex(/[^a-zA-Z0-9]/, 'Au moins un caractère spécial'),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirm'],
})
type FormData = z.infer<typeof schema>

// ← Composant interne qui utilise useSearchParams
function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [showPwd, setShowPwd] = useState(false)
  const [done, setDone] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  if (!token) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8 text-center">
        <p className="text-red-300 text-sm">Lien invalide ou expiré.</p>
        <Link href="/forgot-password" className="text-sm text-blue-200 hover:text-white mt-4 inline-block">
          Demander un nouveau lien
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-400/20 mb-4">
          <RiCheckLine className="w-7 h-7 text-green-300" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">Mot de passe mis à jour</h2>
        <p className="text-sm text-blue-200 mb-6">
          Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
        </p>
        <button onClick={() => router.push('/login')}
          className="w-full bg-white text-primary-800 font-semibold py-2.5 rounded-lg text-sm hover:bg-blue-50 transition-all">
          Se connecter
        </button>
      </div>
    )
  }

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: data.password }),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error); return }
      setDone(true)
    } catch {
      toast.error('Erreur réseau')
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 mb-3">
          <RiLockPasswordLine className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-xl font-semibold text-white">Nouveau mot de passe</h1>
        <p className="text-sm text-blue-200 mt-1">Choisissez un mot de passe sécurisé</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-blue-100">Nouveau mot de passe</label>
          <div className="relative">
            <input {...register('password')} type={showPwd ? 'text' : 'password'}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 pr-11 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-blue-300/60 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm" />
            <button type="button" onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-200/70 hover:text-white">
              {showPwd ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-300">{errors.password.message}</p>}
          <ul className="text-xs text-blue-300/70 space-y-0.5 mt-1">
            <li>• 8 caractères minimum</li>
            <li>• Une majuscule, un chiffre, un caractère spécial</li>
          </ul>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-blue-100">Confirmer</label>
          <input {...register('confirm')} type="password" placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-blue-300/60 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm" />
          {errors.confirm && <p className="text-xs text-red-300">{errors.confirm.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting}
          className="w-full bg-white text-primary-800 hover:bg-blue-50 font-semibold py-2.5 rounded-lg transition-all text-sm disabled:opacity-60 mt-2">
          {isSubmitting ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
        </button>
      </form>
    </div>
  )
}

// ← Page principale avec Suspense
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8 text-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}