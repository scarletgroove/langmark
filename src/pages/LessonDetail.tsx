import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { lessons } from '../data/lessons'
import FlashcardPractice from '../components/FlashcardPractice'
import StrokeOrderSection from '../components/StrokeOrderSection'
import SpeakButton from '../components/SpeakButton'
import { useProgress } from '../hooks/useProgress'

type Activity = 'none' | 'flashcard' | 'strokes'

export default function LessonDetail() {
  const { id } = useParams<{ id: string }>()
  const lesson = lessons.find((l) => l.id === id)
  const [activity, setActivity] = useState<Activity>('none')
  const [sessionResult, setSessionResult] = useState<{ correct: number; total: number } | null>(null)
  const { getLessonProgress, recordSession, recordActivity } = useProgress()

  if (!lesson) {
    return (
      <main className="flex flex-col items-center gap-6 py-24 text-center">
        <p className="text-2xl font-bold text-gray-900">Lesson not found</p>
        <Link to="/" className="text-sm font-semibold text-brand-500 underline underline-offset-4 hover:text-brand-600">
          Back to dashboard
        </Link>
      </main>
    )
  }

  const progress = getLessonProgress(lesson.id)

  function handleFlashcardFinish(correct: number, total: number) {
    recordSession(lesson!.id, correct, total)
    setSessionResult({ correct, total })
    setActivity('none')
  }

  return (
    <main className="mx-auto max-w-2xl pb-24">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-400 transition hover:text-gray-700"
      >
        ← Back to dashboard
      </Link>

      {/* Header */}
      <div className="mb-8 rounded-3xl border border-brand-100 bg-white p-8 shadow-cartoon">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-brand-50 px-3 py-0.5 text-xs font-bold text-brand-600">
              {lesson.level}
            </span>
            <h1 className="mt-2 text-3xl font-black text-gray-900">{lesson.title}</h1>
            <p className="mt-2 font-medium leading-relaxed text-gray-500">{lesson.description}</p>
          </div>
          <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
            {lesson.duration}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {lesson.skills.map((skill) => (
            <span key={skill} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600">
              {skill}
            </span>
          ))}
        </div>

        <div className="mt-6 space-y-1.5">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-brand-50">
            <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs font-semibold text-gray-400">{progress}% complete</p>
        </div>
      </div>

      {/* Flashcard activity */}
      {activity === 'flashcard' && (
        <div className="rounded-3xl border border-brand-100 bg-white p-8 shadow-cartoon">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Flashcard Practice</h2>
            <button onClick={() => setActivity('none')} className="text-sm font-semibold text-gray-400 hover:text-gray-600 transition">
              Exit
            </button>
          </div>
          <FlashcardPractice vocab={lesson.vocab} onFinish={handleFlashcardFinish} />
        </div>
      )}

      {/* Stroke order activity */}
      {activity === 'strokes' && (
        <div className="rounded-3xl border border-brand-100 bg-white p-8 shadow-cartoon">
          <StrokeOrderSection vocab={lesson.vocab} onExit={() => setActivity('none')} />
        </div>
      )}

      {/* Overview */}
      {activity === 'none' && (
        <>
          {sessionResult && (
            <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-6 py-4 text-sm font-semibold text-emerald-700">
              Last session: {sessionResult.correct} / {sessionResult.total} correct ({Math.round((sessionResult.correct / sessionResult.total) * 100)}%) — progress saved
            </div>
          )}

          <div className="mb-6 rounded-3xl border border-brand-100 bg-white p-8 shadow-cartoon">
            <h2 className="mb-5 text-base font-bold text-gray-900">
              Vocabulary · {lesson.vocab.length} items
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {lesson.vocab.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-2xl border border-brand-50 bg-brand-50 px-4 py-3"
                >
                  <div className="w-14 shrink-0 text-center">
                    {item.imageEmoji ? (
                      <span className="text-3xl leading-none">{item.imageEmoji}</span>
                    ) : (
                      <span className="text-3xl font-light text-gray-900">{item.character}</span>
                    )}
                    <p className="mt-0.5 text-sm font-light text-gray-700 leading-none">{item.character}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-brand-500">{item.pinyin}</p>
                    <p className="text-xs font-medium text-gray-500 truncate">{item.meaning}</p>
                  </div>
                  <SpeakButton text={item.character} size="sm" />
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => setActivity('flashcard')}
              className="rounded-2xl bg-brand-500 py-3.5 text-sm font-bold text-white shadow-[0_3px_0_#5b21b6] transition-all hover:-translate-y-0.5"
            >
              Flashcard practice
            </button>
            <button
              onClick={() => { setActivity('strokes'); recordActivity('strokes') }}
              className="rounded-2xl border border-brand-200 bg-white py-3.5 text-sm font-bold text-brand-600 shadow-cartoon transition-all hover:-translate-y-0.5"
            >
              Stroke order
            </button>
          </div>
        </>
      )}
    </main>
  )
}
