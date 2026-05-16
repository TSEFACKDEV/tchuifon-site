import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyAccessToken } from '@/lib/jwt'
import Sidebar from '@/components/dashboard/Sidebar'

type DashboardLayoutProps = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const { locale } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  if (!token) redirect(`/${locale}/login`)

  try {
    verifyAccessToken(token)
  } catch {
    redirect(`/${locale}/login`)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto p-6 lg:p-8 pt-16 lg:pt-8">
        {children}
      </main>
    </div>
  )
}
