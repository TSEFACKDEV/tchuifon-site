import Footer from '@/components/public/Footer'
import Navbar from '@/components/public/Navbar'
import {
  ProfileProvider,
  type PublicProfile,
} from '@/components/public/ProfileProvider'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function getPublicProfile(): Promise<PublicProfile> {
  try {
    return await prisma.profile.findFirst({
      select: {
        fullName: true,
        title: true,
        bio: true,
        photoUrl: true,
        cvUrl: true,
        institution: true,
        department: true,
        email: true,
        phone: true,
        officeLocation: true,
        website: true,
        googleScholar: true,
        researchGate: true,
        orcid: true,
        linkedin: true,
        specializations: true,
        degrees: true,
      },
    })
  } catch (error) {
    console.error('[PUBLIC_PROFILE]', error)
    return null
  }
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getPublicProfile()

  return (
    <ProfileProvider profile={profile}>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </ProfileProvider>
  )
}
