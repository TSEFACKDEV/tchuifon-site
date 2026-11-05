import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'Page introuvable — Pr. TCHUIFON Donald Raoul',
  description: 'La page demandée n’existe pas ou a été déplacée.',
}

export default function GlobalNotFound() {
  return (
    <html lang="fr">
      <body className="antialiased bg-slate-50 text-slate-900">
        <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <p className="text-7xl font-bold text-primary-600 mb-4">404</p>
          <h1 className="text-2xl font-bold mb-2">Page introuvable</h1>
          <p className="text-slate-500 text-sm mb-6">
            La page demandée n’existe pas ou a été déplacée.
          </p>
          <Link
            href="/fr"
            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
          >
            Retour à l’accueil
          </Link>
        </main>
      </body>
    </html>
  )
}
