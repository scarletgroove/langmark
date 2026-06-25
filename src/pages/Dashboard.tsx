import { Link } from 'react-router-dom'
import FeatureGrid from '../components/FeatureGrid'
import LessonCard from '../components/LessonCard'
import ProgressPanel from '../components/ProgressPanel'
import { lessons } from '../data/lessons'
import { useProgress } from '../hooks/useProgress'
import { useSRS } from '../hooks/useSRS'
import { useOnboarding } from '../hooks/useOnboarding'

const GOAL_ACTIVITIES = [
  { id: 'flashcard', label: 'Practice flashcards' },
  { id: 'review',    label: 'Complete a spaced review' },
  { id: 'strokes',   label: 'Try stroke order practice' },
]

export default function Dashboard() {
  const { getLessonProgress, streakDays, completedLessons, mastery, isNewUser, startedLessonIds, todayActivities } = useProgress()
  const { dueCount } = useSRS(startedLessonIds)
  const { getResult } = useOnboarding()
  const onboarding = getResult()

  // First incomplete lesson for the "Continue" CTA
  const nextLesson = lessons.find((l) => getLessonProgress(l.id) < 100) ?? lessons[0]

  return (
    <main>
      {/* Hero */}
      <section className="mb-10">
        <div className="rounded-3xl border border-brand-100 bg-white p-8 shadow-cartoon">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-500">
                {isNewUser ? 'Welcome' : 'Welcome back'}
              </p>
              <h1 className="mt-4 text-4xl font-black text-gray-900 sm:text-5xl leading-tight">
                {isNewUser
                  ? "Let's start your journey to Chinese fluency."
                  : "Today's session is ready. Keep your streak alive!"}
              </h1>
              <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-gray-500">
                Build fluency with short, interactive lessons based on daily habits, meaningful examples, and smart review.
              </p>

              {isNewUser && (
                <Link
                  to="/onboarding"
                  className="mt-6 inline-flex rounded-2xl bg-brand-500 px-6 py-3 text-sm font-bold text-white shadow-[0_3px_0_#5b21b6] transition-all hover:-translate-y-0.5"
                >
                  Set up your learning plan →
                </Link>
              )}
            </div>

            <aside className="rounded-2xl border border-brand-50 bg-brand-50 p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-500">Daily goal</p>
              <p className="mt-3 text-2xl font-black text-gray-900">
                {onboarding ? `${onboarding.dailyTime} min · today` : 'Complete 3 activities'}
              </p>
              <ul className="mt-5 space-y-2.5">
                {GOAL_ACTIVITIES.map(({ id, label }) => {
                  const done = todayActivities.includes(id)
                  return (
                    <li key={id} className="flex items-center gap-2.5 text-sm font-medium">
                      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition ${done ? 'border-brand-500 bg-brand-500' : 'border-gray-300'}`}>
                        {done && <span className="text-[9px] font-black text-white leading-none">✓</span>}
                      </span>
                      <span className={done ? 'text-gray-400 line-through' : 'text-gray-600'}>{label}</span>
                    </li>
                  )
                })}
              </ul>
            </aside>
          </div>
        </div>
      </section>

      {/* Review due banner */}
      {dueCount > 0 && (
        <section className="mb-6">
          <Link
            to="/review"
            className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4 shadow-cartoon-yellow transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔔</span>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {dueCount === 9 ? '9+' : dueCount} card{dueCount !== 1 ? 's' : ''} due for review
                </p>
                <p className="text-xs font-medium text-gray-500">Spaced repetition keeps your memory sharp</p>
              </div>
            </div>
            <span className="text-sm font-bold text-amber-600">Review now →</span>
          </Link>
        </section>
      )}

      <section className="mb-10">
        <ProgressPanel streakDays={streakDays} completedLessons={completedLessons} mastery={mastery} />
      </section>

      <section className="mb-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Your path</p>
            <h2 className="mt-2 text-2xl font-black text-gray-900">Recommended lessons</h2>
          </div>
          <Link
            to={`/lesson/${nextLesson.id}`}
            className="rounded-2xl bg-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_3px_0_#5b21b6] transition-all hover:-translate-y-0.5"
          >
            Continue current plan
          </Link>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          {lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              progressOverride={getLessonProgress(lesson.id)}
            />
          ))}
        </div>
      </section>

      <section className="mb-16">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">What makes it work</p>
          <h2 className="mt-2 text-2xl font-black text-gray-900">Practice that feels natural and rewarding.</h2>
        </div>
        <FeatureGrid />
      </section>
    </main>
  )
}
