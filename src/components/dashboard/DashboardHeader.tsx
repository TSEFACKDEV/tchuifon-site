'use client'
import Link from 'next/link'
import { RiExternalLinkLine, RiBellLine } from 'react-icons/ri'

type Props = {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export default function DashboardHeader({ title, subtitle, actions }: Props) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Link href="/" target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-500 hover:bg-slate-50 transition-colors">
          <RiExternalLinkLine className="w-3.5 h-3.5" />
          Voir le site
        </Link>
        {actions}
      </div>
    </div>
  )
}