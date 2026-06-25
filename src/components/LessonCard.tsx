import { Link } from 'react-router-dom'
import type { Lesson } from '../types'

interface LessonCardProps {
  lesson: Lesson
  progressOverride?: number
}

export default function LessonCard({ lesson, progressOverride }: LessonCardProps) {
  const progress = progressOverride ?? lesson.progress

  return (
    <article className="rounded-3xl border border-brand-100 bg-white p-6 shadow-cartoon transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#ede9fe]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-block rounded-full bg-brand-50 px-3 py-0.5 text-xs font-bold text-brand-600">
            {lesson.level}
          </span>
          <h3 className="mt-2 text-lg font-bold text-gray-900">{lesson.title}</h3>
        </div>
        <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
          {lesson.duration}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-gray-500">{lesson.description}</p>

      <div className="mt-5 space-y-1.5">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-brand-50">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs font-semibold text-gray-400">
          <span>{progress}% complete</span>
          <span>{lesson.skills.length} skills</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {lesson.skills.map((skill) => (
          <span key={skill} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600">
            {skill}
          </span>
        ))}
      </div>

      <Link
        to={`/lesson/${lesson.id}`}
        className="mt-5 inline-flex items-center justify-center rounded-2xl bg-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_3px_0_#5b21b6] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_0_#5b21b6] active:translate-y-0.5 active:shadow-none"
      >
        {progress > 0 ? 'Continue lesson' : 'Start lesson'}
      </Link>
    </article>
  )
}
