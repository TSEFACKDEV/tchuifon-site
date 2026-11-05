'use client'

import { createContext, useContext, type ReactNode } from 'react'

export type PublicProfile = {
  fullName: string | null
  title: string | null
  bio: string | null
  photoUrl: string | null
  cvUrl: string | null
  institution: string | null
  department: string | null
  email: string | null
  phone: string | null
  officeLocation: string | null
  website: string | null
  googleScholar: string | null
  researchGate: string | null
  orcid: string | null
  linkedin: string | null
  specializations: string[]
  degrees: string[]
} | null

const ProfileContext = createContext<PublicProfile>(null)

export function ProfileProvider({
  profile,
  children,
}: {
  profile: PublicProfile
  children: ReactNode
}) {
  return (
    <ProfileContext.Provider value={profile}>
      {children}
    </ProfileContext.Provider>
  )
}

export function usePublicProfile() {
  return useContext(ProfileContext)
}
