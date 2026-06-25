import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSRS } from '../hooks/useSRS'
import { useProgress } from '../hooks/useProgress'
import { usePronunciationContext } from '../contexts/PronunciationContext'
import SpeakButton from '../components/SpeakButton'
import type { VocabItem } from '../types'

function CardImage({ item }: { item: VocabItem }) {
  const [imgFailed, setImgFailed] = useState(false)

  useEffect(() => { setImgFailed(false) }, [item.id])

  if (item.imageUrl && !imgFailed) {
    return (
      <img
        src={item.imageUrl}
        alt={item.meaning}
        className="h-36 w-36 rounded-2xl object-cover shadow-md select-none"
        onError={() => setImgFailed(true)}
      />
    )
  }
  if (item.imageEmoji) {
    return <span className="text-[5.5rem] leading-none select-none">{item.imageEmoji}</span>
  }
  return <p className="text-8xl font-light leading-none text-gray-900">{item.character}</p>
}

type CardState = 'front' | 'back' | 'answered'

export default function Review() {
  const { startedLessonIds, recordActivity } = useProgress()
  const { queue: liveQueue, recordReview } = useSRS(startedLessonIds)
  const { speak } = usePronunciationContext()

  // Snapshot the queue at mount so mid-session state updates don't reshuffle cards.
  // "Review again" replays this same snapshot — the live queue will be empty anyway
  // since all cards were just reviewed and have future due dates.
  const [sessionQueue] = useState(() => liveQueue)

  const [index, setIndex] = useState(0)
  const [cardState, setCardState] = useState<CardState>('front')
  const [lastInterval, setLastInterval] = useState<number | null>(null)
  const [lastKnew, setLastKnew] = useState<boolean | null>(null)
  const [done, setDone] = useState(false)
  const [stats, setStats] = useState({ correct: 0, incorrect: 0 })
  const [activityRecorded, setActivityRecorded] = useState(false)

  const total = sessionQueue.length
  const card = sessionQueue[index]

  useEffect(() => {
    if (cardState === 'back' && card) speak(card.vocab.character)
  }, [cardState, index])

  useEffect(() => {
    if (cardState !== 'answered') return
    const t = setTimeout(() => {
      if (index + 1 >= total) {
        setDone(true)
      } else {
        setIndex((i) => i + 1)
        setCardState('front')
        setLastInterval(null)
        setLastKnew(null)
      }
    }, 750)
    return () => clearTimeout(t)
  }, [cardState, index, total])

  function flip() {
    if (cardState === 'front') setCardState('back')
  }

  function handleAnswer(knew: boolean) {
    const interval = recordReview(card.vocab.id, card.lessonId, knew)
    setLastInterval(interval)
    setLastKnew(knew)
    setCardState('answered')
    setStats((s) => ({ correct: s.correct + (knew ? 1 : 0), incorrect: s.incorrect + (knew ? 0 : 1) }))
    // Record streak contribution once per session
    if (!activityRecorded) {
      recordActivity()
      setActivityRecorded(true)
    }
  }

  function resetSession() {
    setIndex(0)
    setCardState('front')
    setDone(false)
    setStats({ correct: 0, incorrect: 0 })
    setLastInterval(null)
    setLastKnew(null)
  }

  // All caught up — nothing was due at session start
  if (total === 0) {
    return (
      <main className="mx-auto max-w-xl pb-24">
        <div className="rounded-3xl border border-emerald-100 bg-white p-10 text-center shadow-cartoon-green">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl">✓</div>
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-500">All caught up</p>
          <h1 className="mt-3 text-3xl font-black text-gray-900">No reviews due.</h1>
          <p className="mt-3 text-sm font-medium text-gray-500">
            Come back tomorrow and your next batch will be waiting.
          </p>
          <Link
            to="/"
            className="mt-8 inline-block rounded-2xl bg-brand-500 px-6 py-3 text-sm font-bold text-white shadow-[0_3px_0_#5b21b6] transition-all hover:-translate-y-0.5"
          >
            Back to dashboard
          </Link>
        </div>
      </main>
    )
  }

  // Session done
  if (done) {
    const pct = Math.round((stats.correct / total) * 100)
    return (
      <main className="mx-auto max-w-xl pb-24">
        <div className="rounded-3xl border border-brand-100 bg-white p-10 text-center shadow-cartoon">
          <div className="mx-auto mb-5 text-5xl">{pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}</div>
          <p className="text-xs font-bold uppercase tracking-wider text-brand-500">Review complete</p>
          <p className="mt-3 text-4xl font-black text-gray-900">{stats.correct} / {total}</p>
          <p className="mt-1 text-sm font-semibold text-gray-400">{pct}% accuracy</p>

          <div className="mt-8 grid grid-cols-2 gap-4 text-left">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-500">Remembered</p>
              <p className="mt-2 text-2xl font-black text-gray-900">{stats.correct}</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-500">Needs work</p>
              <p className="mt-2 text-2xl font-black text-gray-900">{stats.incorrect}</p>
            </div>
          </div>

          <p className="mt-6 text-sm font-medium text-gray-400">
            Cards you struggled with will reappear sooner. Cards you remembered are scheduled further out.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/"
              className="flex-1 rounded-2xl bg-brand-500 py-3 text-center text-sm font-bold text-white shadow-[0_3px_0_#5b21b6] transition-all hover:-translate-y-0.5"
            >
              Dashboard
            </Link>
            <button
              onClick={resetSession}
              className="flex-1 rounded-2xl border border-brand-200 bg-white py-3 text-sm font-bold text-brand-600 shadow-cartoon transition-all hover:-translate-y-0.5"
            >
              Review again
            </button>
          </div>
        </div>
      </main>
    )
  }

  const progressPct = (index / total) * 100

  return (
    <main className="mx-auto max-w-xl pb-24">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-brand-500">Spaced review</p>
          <h1 className="mt-1 text-2xl font-black text-gray-900">{total} cards today</h1>
        </div>
        <Link to="/" className="text-sm font-semibold text-gray-400 transition hover:text-gray-600">Exit</Link>
      </div>

      <div className="mb-6 space-y-1.5">
        <div className="h-2 w-full overflow-hidden rounded-full bg-brand-50">
          <div className="h-full rounded-full bg-brand-500 transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="flex justify-between text-xs font-semibold text-gray-400">
          <span>{index} done</span>
          <span>{total - index} remaining</span>
        </div>
      </div>

      {/* Card */}
      <div
        onClick={flip}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') flip() }}
        className="group relative mb-4 w-full cursor-pointer"
      >
        <div className="min-h-72 w-full rounded-3xl border border-brand-100 bg-white p-10 shadow-cartoon transition-all">
          <div className="absolute left-5 top-5 flex gap-2">
            {card.isNew ? (
              <span className="rounded-full bg-pink-50 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-pink-500">
                New
              </span>
            ) : (
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-brand-500">
                Review
              </span>
            )}
          </div>

          {cardState !== 'front' && (
            <div className="absolute right-5 top-5" onClick={(e) => e.stopPropagation()}>
              <SpeakButton text={card.vocab.character} size="sm" />
            </div>
          )}

          <div className="flex h-full flex-col items-center justify-center gap-4 pt-2 text-center">
            {cardState === 'front' && (
              <>
                <CardImage item={card.vocab} />
                <p className="mt-2 text-sm font-medium text-gray-400 group-hover:text-brand-400 transition">
                  Tap to reveal
                </p>
              </>
            )}

            {(cardState === 'back' || cardState === 'answered') && (
              <>
                <div className="flex items-center gap-4">
                  {card.vocab.imageEmoji && (
                    <span className="text-4xl leading-none select-none">{card.vocab.imageEmoji}</span>
                  )}
                  <p className="text-7xl font-light leading-none text-gray-900">{card.vocab.character}</p>
                </div>
                <div className="mt-2 space-y-2">
                  <p className="text-xl font-bold text-brand-500">{card.vocab.pinyin}</p>
                  <p className="text-base font-semibold text-gray-700">{card.vocab.meaning}</p>
                  {card.vocab.example && (
                    <div
                      className="mt-3 rounded-2xl border border-brand-50 bg-brand-50 px-5 py-3 text-left"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{card.vocab.example}</p>
                          <p className="text-xs font-medium text-brand-400">{card.vocab.examplePinyin}</p>
                          <p className="text-xs font-medium italic text-gray-400">{card.vocab.exampleMeaning}</p>
                        </div>
                        <SpeakButton text={card.vocab.example} size="sm" className="shrink-0" />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {cardState === 'front' && (
        <button
          onClick={flip}
          className="w-full rounded-2xl bg-brand-500 py-3 text-sm font-bold text-white shadow-[0_3px_0_#5b21b6] transition-all hover:-translate-y-0.5"
        >
          Reveal answer
        </button>
      )}

      {cardState === 'back' && (
        <div className="flex gap-3">
          <button
            onClick={() => handleAnswer(false)}
            className="flex-1 rounded-2xl border border-gray-200 bg-white py-3 text-sm font-bold text-gray-600 shadow-sm transition-all hover:bg-gray-50"
          >
            Need practice
          </button>
          <button
            onClick={() => handleAnswer(true)}
            className="flex-1 rounded-2xl bg-brand-500 py-3 text-sm font-bold text-white shadow-[0_3px_0_#5b21b6] transition-all hover:-translate-y-0.5"
          >
            Got it
          </button>
        </div>
      )}

      {cardState === 'answered' && lastInterval !== null && (
        <div className={`w-full rounded-2xl border px-5 py-3 text-center text-sm font-semibold transition ${
          lastKnew
            ? 'border-emerald-100 bg-emerald-50 text-emerald-600'
            : 'border-amber-100 bg-amber-50 text-amber-600'
        }`}>
          {lastKnew ? 'Nice! ' : 'Keep going — '}
          Next review in {lastInterval === 1 ? '1 day' : `${lastInterval} days`}
        </div>
      )}
    </main>
  )
}
