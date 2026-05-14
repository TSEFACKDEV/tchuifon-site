import { redirect } from 'next/navigation'
import { routing } from '@/i18n/routing'

export default function RootPage() {
  // Rediriger vers la locale par défaut
  redirect(`/${routing.defaultLocale}`)
}
