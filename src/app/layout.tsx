import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pr. TCHUIFON Donald Raoul — ENSPD',
  description: 'Enseignant-Chercheur en Chimie-Physique, Département de Génie des Procédés, ENSPD Douala.',
  keywords: ['chimie', 'génie des procédés', 'ENSPD', 'recherche', 'Cameroun'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}