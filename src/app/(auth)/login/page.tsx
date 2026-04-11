'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/components/ui/Toast'
import { RiFlaskLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri'

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()

      if (!res.ok) {
        toast.error(json.error ?? 'Erreur de connexion')
        return
      }

      setUser(json.user)
      toast.success('Connexion réussie')
      router.push('/dashboard')
    } catch {
      toast.error('Erreur réseau')
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 mb-4">
          <RiFlaskLine className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-xl font-semibold text-white">Espace Administration</h1>
        <p className="text-sm text-blue-200 mt-1">Dr TCHUIFON — ENSPD Douala</p>
      </div>

      {/* Form */}
      <div className="px-8 pb-8">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-blue-100">Email</label>
            <input
              {...register('email')}
              type="email"
              placeholder="votre@email.com"
              className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-blue-300/60 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
            />
            {errors.email && <p className="text-xs text-red-300">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-blue-100">Mot de passe</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 pr-11 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-blue-300/60 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-200/70 hover:text-white transition-colors"
              >
                {showPassword ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-300">{errors.password.message}</p>}
          </div>

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-xs text-blue-200 hover:text-white transition-colors">
              Mot de passe oublié ?
            </Link>
          </div>

          <Button
            type="submit"
            loading={isSubmitting}
            className="w-full bg-white text-primary-800 hover:bg-blue-50 font-semibold py-2.5 rounded-lg transition-all"
          >
            Se connecter
          </Button>
        </form>
      </div>
    </div>
  )
}