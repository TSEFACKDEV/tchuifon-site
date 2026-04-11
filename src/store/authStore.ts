import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Profile = {
  fullName?: string
  title?: string
  photoUrl?: string
  institution?: string
  department?: string
}

type User = {
  id: string
  email: string
  role: 'ADMIN' | 'COLLABORATOR'
  profile?: Profile | null
}

type AuthState = {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,

      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),

      logout: async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        set({ user: null })
        window.location.href = '/login'
      },

      fetchMe: async () => {
        set({ isLoading: true })
        try {
          const res = await fetch('/api/auth/me')
          const data = await res.json()
          set({ user: data.user ?? null })
        } catch {
          set({ user: null })
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
)