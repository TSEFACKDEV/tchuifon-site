import Link from 'next/link'
import { RiFlaskLine, RiMailLine, RiPhoneLine, RiMapPinLine } from 'react-icons/ri'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Identité */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <RiFlaskLine className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-none">Dr TCHUIFON Donald Raoul</p>
                <p className="text-xs leading-none mt-0.5">Enseignant-Chercheur</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed">
              Département de Génie des Procédés,<br />
              École Nationale Supérieure Polytechnique<br />
              de Douala (ENSPD)
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/', label: 'Accueil' },
                { href: '/courses', label: 'Cours dispensés' },
                { href: '/publications', label: 'Publications' },
                { href: '/supervisions', label: 'Encadrements' },
                { href: '/collaborators', label: 'Collaborateurs' },
                { href: '/contact', label: 'Contact' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <RiMailLine className="w-4 h-4 mt-0.5 shrink-0 text-primary-400" />
                <a href="mailto:tchuifon@gmail.com" className="hover:text-white transition-colors">
                  tchuifon@gmail.com
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
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>© {new Date().getFullYear()} Dr TCHUIFON Donald Raoul. Tous droits réservés.</p>
          <a href="https://www.ensp-udo.com" target="_blank" rel="noopener noreferrer"
            className="hover:text-white transition-colors">
            ensp-udo.com
          </a>
        </div>
      </div>
    </footer>
  )
}