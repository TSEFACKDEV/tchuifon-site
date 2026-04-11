'use client'
import { motion } from 'framer-motion'
import { RiLoader4Line } from 'react-icons/ri'

type Column<T> = {
  key: string
  label: string
  render?: (row: T) => React.ReactNode
  width?: string
}

type Props<T> = {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  keyExtractor: (row: T) => string
}

export default function DataTable<T>({ columns, data, loading, emptyMessage = 'Aucune donnée', keyExtractor }: Props<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <RiLoader4Line className="w-7 h-7 text-primary-500 animate-spin" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <p className="text-sm">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {columns.map(col => (
              <th key={col.key}
                className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                style={col.width ? { width: col.width } : undefined}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {data.map((row, i) => (
            <motion.tr key={keyExtractor(row)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="hover:bg-slate-50 transition-colors"
            >
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3.5 text-slate-700">
                  {col.render ? col.render(row) : String((row as any)[col.key] ?? '—')}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}