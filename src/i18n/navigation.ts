import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

// Ces helpers ajoutent automatiquement le préfixe de locale courant.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
