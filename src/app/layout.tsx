import type { Metadata } from 'next'
import './globals.css'
import { ToastContainer } from '@/components/ui/Toast'

export const metadata: Metadata = {
  title: 'Dr TCHUIFON Donald Raoul — ENSPD',
  description: 'Enseignant-Chercheur en Chimie-Physique, Département de Génie des Procédés, ENSPD Douala.',
  keywords: ['chimie', 'génie des procédés', 'ENSPD', 'recherche', 'Cameroun'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="antialiased bg-slate-50 text-slate-900">
        {children}
        <ToastContainer />
      </body>
    </html>
  )
}