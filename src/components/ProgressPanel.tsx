interface ProgressPanelProps {
  streakDays: number
  completedLessons: number
  mastery: string
}

export default function ProgressPanel({ streakDays, completedLessons, mastery }: ProgressPanelProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-3xl border border-amber-100 bg-amber-50 p-6 shadow-cartoon-yellow">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-500">🔥 Streak</p>
        <p className="mt-3 text-4xl font-black text-gray-900">{streakDays}<span className="ml-1 text-lg font-bold text-gray-400">days</span></p>
        <p className="mt-2 text-sm font-medium text-gray-500">Keep your momentum going.</p>
      </div>

      <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 shadow-cartoon-green">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-500">📖 Completed</p>
        <p className="mt-3 text-4xl font-black text-gray-900">{completedLessons}<span className="ml-1 text-lg font-bold text-gray-400">lessons</span></p>
        <p className="mt-2 text-sm font-medium text-gray-500">A focused path to fluency.</p>
      </div>

      <div className="rounded-3xl border border-sky-100 bg-sky-50 p-6 shadow-cartoon-blue">
        <p className="text-xs font-bold uppercase tracking-wider text-sky-500">🌟 Mastery</p>
        <p className="mt-3 text-4xl font-black text-gray-900">{mastery}</p>
        <p className="mt-2 text-sm font-medium text-gray-500">Smart review keeps you sharp.</p>
      </div>
    </section>
  )
}
