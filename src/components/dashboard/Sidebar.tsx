'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { useAuthStore } from '@/store/authStore'
import Image from 'next/image'
import {
  RiDashboardLine, RiArticleLine, RiBookOpenLine,
  RiAwardLine, RiGroupLine, RiMailLine, RiUserLine,
  RiLogoutBoxLine, RiMenuFoldLine, RiMenuUnfoldLine,
  RiFlaskLine, RiSettings3Line,
} from 'react-icons/ri'

const navItems = [
  { href: '/dashboard',               label: 'Vue d\'ensemble', icon: RiDashboardLine, exact: true },
  { href: '/dashboard/publications',  label: 'Publications',    icon: RiArticleLine },
  { href: '/dashboard/courses',       label: 'Cours',           icon: RiBookOpenLine },
  { href: '/dashboard/supervisions',  label: 'Encadrements',    icon: RiAwardLine },
  { href: '/dashboard/collaborators', label: 'Collaborateurs',  icon: RiGroupLine },
  { href: '/dashboard/users',         label: 'Utilisateurs',    icon: RiUserLine,     adminOnly: true },
  { href: '/dashboard/messages',      label: 'Messages',        icon: RiMailLine },
  { href: '/dashboard/profile',       label: 'Mon profil',      icon: RiSettings3Line },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const filteredItems = navItems.filter(item =>
    !item.adminOnly || user?.role === 'ADMIN'
  )

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={clsx(
        'flex items-center gap-3 px-4 py-5 border-b border-slate-800',
        collapsed && 'justify-center px-2'
      )}>
        <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shrink-0">
          <RiFlaskLine className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-sm font-semibold text-white leading-none">Dr TCHUIFON</p>
            <p className="text-xs text-slate-400 leading-none mt-0.5">Administration</p>
          </motion.div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredItems.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact)
          return (
            <Link key={href} href={href}
              onClick={() => setMobileOpen(false)}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative',
                active
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium">{label}</span>
              )}
              {active && !collapsed && (
                <motion.div layoutId="activeIndicator"
                  className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/60" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-slate-800 space-y-2">
        {/* Profil user */}
        <div className={clsx(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800',
          collapsed && 'justify-center px-2'
        )}>
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-primary-700 flex items-center justify-center shrink-0">
            {user?.profile?.photoUrl ? (
              <Image src={user.profile.photoUrl} alt="" width={32} height={32} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-white">
                {user?.profile?.fullName?.charAt(0) ?? user?.email?.charAt(0) ?? 'A'}
              </span>
            )}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user?.profile?.fullName ?? user?.email}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.role}</p>
            </div>
          )}
        </div>

        {/* Logout */}
        <button onClick={logout}
          className={clsx(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition-all',
            collapsed && 'justify-center px-2'
          )}
          title={collapsed ? 'Déconnexion' : undefined}
        >
          <RiLogoutBoxLine className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Déconnexion</span>}
        </button>
      </div>

      {/* Toggle collapse (desktop) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center w-full py-3 border-t border-slate-800 text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
      >
        {collapsed
          ? <RiMenuUnfoldLine className="w-5 h-5" />
          : <RiMenuFoldLine className="w-5 h-5" />
        }
      </button>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col bg-slate-900 h-screen sticky top-0 shrink-0 overflow-hidden"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg"
      >
        <RiMenuUnfoldLine className="w-5 h-5" />
      </button>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 h-full w-64 bg-slate-900 z-50 flex flex-col"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}