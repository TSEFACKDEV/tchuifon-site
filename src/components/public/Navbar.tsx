'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { clsx } from 'clsx'
import { motion } from 'framer-motion'
import {
  RiFlaskLine, RiMenuLine, RiCloseLine,
  RiBookOpenLine, RiArticleLine, RiGroupLine,
  RiAwardLine, RiMailLine, RiDashboardLine
} from 'react-icons/ri'
import { useAuthStore } from '@/store/authStore'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function Navbar() {
  const t = useTranslations('nav')
  const locale = useLocale()
  
  const navLinks = [
    { href: `/${locale}/courses`, label: t('courses'), icon: RiBookOpenLine },
    { href: `/${locale}/publications`, label: t('publications'), icon: RiArticleLine },
    { href: `/${locale}/supervisions`, label: t('supervisions'), icon: RiAwardLine },
    { href: `/${locale}/collaborators`, label: t('collaborators'), icon: RiGroupLine },
    { href: `/${locale}/contact`, label: t('contact'), icon: RiMailLine },
  ]

  const pathname = usePathname()
  const { user, fetchMe } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // fetchMe est stable (Zustand), eslint-disable pour éviter la boucle infinie
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchMe() }, [])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <motion.header 
      className={clsx(
        'sticky top-0 z-40 transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80'
          : 'bg-white border-b border-slate-200'
      )}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center group-hover:bg-primary-700 transition-colors">
                <RiFlaskLine className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 leading-none">Pr TCHUIFON</p>
                <p className="text-xs text-slate-500 leading-none mt-0.5">ENSPD Douala</p>
              </div>
            </Link>
          </motion.div>

          {/* Desktop nav */}
          <motion.nav 
            className="hidden md:flex items-center gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {navLinks.map(({ href, label }, idx) => (
              <motion.div
                key={href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx + 0.2 }}
              >
                <Link
                  href={href}
                  className={clsx(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname === href
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  )}
                >
                  {label}
                </Link>
              </motion.div>
            ))}
          </motion.nav>

          {/* Right side */}
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <LanguageSwitcher />
            {user && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={`/${locale}/dashboard`}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  <RiDashboardLine className="w-4 h-4" />
                  {t('dashboard')}
                </Link>
              </motion.div>
            )}
            {/* Mobile menu button */}
            <motion.button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {menuOpen ? <RiCloseLine className="w-5 h-5" /> : <RiMenuLine className="w-5 h-5" />}
            </motion.button>
          </motion.div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <motion.div 
            className="md:hidden border-t border-slate-100 py-3 space-y-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {navLinks.map(({ href, label, icon: Icon }, idx) => (
              <motion.div
                key={href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * idx }}
              >
                <Link
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    pathname === href
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              </motion.div>
            ))}
            {user && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Link
                  href={`/${locale}/dashboard`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-primary-600 text-white mt-2"
                >
                  <RiDashboardLine className="w-4 h-4" />
                  {t('dashboard')}
                </Link>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </motion.header>
  )
}