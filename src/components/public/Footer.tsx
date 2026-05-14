'use client'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { RiFlaskLine, RiMailLine, RiPhoneLine, RiMapPinLine } from 'react-icons/ri'
import { motion } from 'framer-motion'

export default function Footer() {
  const t = useTranslations('footer')
  const locale = useLocale()

  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto">
      <motion.div 
        className="max-w-6xl mx-auto px-4 sm:px-6 py-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Identité */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <RiFlaskLine className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-none">{t('professor')}</p>
                <p className="text-xs leading-none mt-0.5">{t('researcher')}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed">
              {t('department')},<br />
              {t('institution')}
            </p>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h3 className="text-sm font-semibold text-white mb-4">{t('navigation')}</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: `/${locale}`, label: locale === 'fr' ? 'Accueil' : 'Home' },
                { href: `/${locale}/courses`, label: t('navigation') === 'Navigation' ? 'Courses' : 'Cours dispensés' },
                { href: `/${locale}/publications`, label: locale === 'fr' ? 'Publications' : 'Publications' },
                { href: `/${locale}/supervisions`, label: locale === 'fr' ? 'Encadrements' : 'Supervisions' },
                { href: `/${locale}/collaborators`, label: locale === 'fr' ? 'Collaborateurs' : 'Collaborators' },
                { href: `/${locale}/contact`, label: locale === 'fr' ? 'Contact' : 'Contact' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h3 className="text-sm font-semibold text-white mb-4">{t('contact')}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <RiMailLine className="w-4 h-4 mt-0.5 shrink-0 text-primary-400" />
                <a href="mailto:tchuifondonald@yahoo.fr" className="hover:text-white transition-colors">
                  tchuifondonald@yahoo.fr
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <RiPhoneLine className="w-4 h-4 mt-0.5 shrink-0 text-primary-400" />
                <a href="tel:+237674780094" className="hover:text-white transition-colors">
                  +237 674 78 00 94
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <RiMapPinLine className="w-4 h-4 mt-0.5 shrink-0 text-primary-400" />
                <span>PK 17 Douala Cameroun<br />Campus ENSPD</span>
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div 
          className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <p>
            © {new Date().getFullYear()} Pr TCHUIFON Donald Raoul. {locale === 'fr' ? 'Tous droits réservés.' : 'All rights reserved.'}
          </p>
          <a href="https://www.ensp-udo.com" target="_blank" rel="noopener noreferrer"
            className="hover:text-white transition-colors">
            {t('website')}
          </a>
        </motion.div>
      </motion.div>
    </footer>
  )
}