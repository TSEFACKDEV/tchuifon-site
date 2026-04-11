'use client'
import { useEffect, useState } from 'react'
import { clsx } from 'clsx'

type Toast = {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

// Store global simple pour les toasts
let toastListeners: ((toasts: Toast[]) => void)[] = []
let toasts: Toast[] = []

export const toast = {
  success: (message: string) => addToast(message, 'success'),
  error: (message: string) => addToast(message, 'error'),
  info: (message: string) => addToast(message, 'info'),
}

function addToast(message: string, type: Toast['type']) {
  const id = Math.random().toString(36).slice(2)
  toasts = [...toasts, { id, message, type }]
  toastListeners.forEach(l => l(toasts))
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id)
    toastListeners.forEach(l => l(toasts))
  }, 4000)
}

export function ToastContainer() {
  const [list, setList] = useState<Toast[]>([])

  useEffect(() => {
    toastListeners.push(setList)
    return () => { toastListeners = toastListeners.filter(l => l !== setList) }
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {list.map(t => (
        <div
          key={t.id}
          className={clsx(
            'px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white',
            'animate-in slide-in-from-right-5 duration-300',
            {
              'bg-green-600': t.type === 'success',
              'bg-red-600': t.type === 'error',
              'bg-primary-600': t.type === 'info',
            }
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}