import { notFound } from 'next/navigation'
import Link from 'next/link'
import { RiArrowLeftLine, RiCheckLine, RiTimeLine, RiMedalLine, RiBookOpenLine } from 'react-icons/ri'
import { clsx } from 'clsx'

async function getCourse(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/courses/${id}`, { next: { revalidate: 3600 } })
  if (!res.ok) return null
  return res.json()
}

const levelColors: Record<string, string> = {
  LICENCE: 'from-green-700 to-green-900',
  MASTER: 'from-blue-700 to-blue-900',
  INGENIEUR: 'from-amber-700 to-amber-900',
  DOCTORAT: 'from-purple-700 to-purple-900',
}
const levelLabels: Record<string, string> = {
  LICENCE: 'Licence', MASTER: 'Master', INGENIEUR: 'Ingénieur', DOCTORAT: 'Doctorat',
}

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const course = await getCourse(id)
  if (!course) notFound()

  const gradient = levelColors[course.level] ?? 'from-primary-700 to-primary-900'

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <Link href="/courses" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 transition-colors mb-8">
        <RiArrowLeftLine className="w-4 h-4" />
        Tous les cours
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-br ${gradient} p-8 text-white`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
              <RiBookOpenLine className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-wrap gap-2">
              {course.level && (
                <span className="px-3 py-1 rounded-full bg-white/15 text-xs font-medium border border-white/20">
                  {levelLabels[course.level] ?? course.level}
                </span>
              )}
              {course.code && (
                <span className="px-3 py-1 rounded-full bg-white/15 text-xs font-mono border border-white/20">
                  {course.code}
                </span>
              )}
              <span className={clsx(
                'px-3 py-1 rounded-full text-xs font-medium',
                course.isActive ? 'bg-green-400/20 text-green-100 border border-green-400/30' : 'bg-white/10 text-white/60'
              )}>
                {course.isActive ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
          {course.semester && <p className="text-white/70 text-sm">{course.semester}</p>}
        </div>

        <div className="p-8 space-y-8">
          {/* Stats rapides */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {course.hours && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <RiTimeLine className="w-5 h-5 text-primary-500" />
                <div>
                  <p className="text-lg font-bold text-slate-900">{course.hours}h</p>
                  <p className="text-xs text-slate-500">Volume horaire</p>
                </div>
              </div>
            )}
            {course.credits && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <RiMedalLine className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-lg font-bold text-slate-900">{course.credits}</p>
                  <p className="text-xs text-slate-500">Crédits ECTS</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {course.description && (
            <section>
              <h2 className="text-base font-semibold text-slate-900 mb-3">Description</h2>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-5 border border-slate-100">
                {course.description}
              </p>
            </section>
          )}

          {/* Objectifs */}
          {course.objectives?.length > 0 && (
            <section>
              <h2 className="text-base font-semibold text-slate-900 mb-4">Objectifs pédagogiques</h2>
              <ul className="space-y-3">
                {course.objectives.map((obj: string, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                      <RiCheckLine className="w-3 h-3 text-green-600" />
                    </div>
                    <p className="text-sm text-slate-700">{obj}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Syllabus */}
          {course.syllabus && (
            <section>
              <h2 className="text-base font-semibold text-slate-900 mb-3">Plan du cours</h2>
              <div className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-5 border border-slate-100 whitespace-pre-wrap">
                {course.syllabus}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}