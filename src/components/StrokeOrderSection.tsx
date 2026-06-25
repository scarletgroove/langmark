import { useState, useMemo } from 'react'
import StrokeWriter from './StrokeWriter'
import SpeakButton from './SpeakButton'
import type { VocabItem } from '../types'

interface StrokeChar {
  char: string
  source: string
  meaning: string
}

interface Props {
  vocab: VocabItem[]
  onExit: () => void
}

const CJK = /[一-鿿㐀-䶿]/

export default function StrokeOrderSection({ vocab, onExit }: Props) {
  const chars = useMemo<StrokeChar[]>(() => {
    const seen = new Set<string>()
    const result: StrokeChar[] = []
    for (const item of vocab) {
      for (const ch of Array.from(item.character)) {
        if (!seen.has(ch) && CJK.test(ch)) {
          seen.add(ch)
          result.push({ char: ch, source: item.character, meaning: item.meaning })
        }
      }
    }
    return result
  }, [vocab])

  const [selected, setSelected] = useState<StrokeChar>(chars[0])
  const [mode, setMode] = useState<'animate' | 'quiz'>('animate')
  const [quizResult, setQuizResult] = useState<number | null>(null)

  function selectChar(c: StrokeChar) {
    setSelected(c)
    setMode('animate')
    setQuizResult(null)
  }

  function startQuiz() {
    setMode('quiz')
    setQuizResult(null)
  }

  const currentIndex = chars.findIndex((c) => c.char === selected.char)
  const hasNext = currentIndex < chars.length - 1

  if (!selected) return null

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Stroke Order</h2>
        <button onClick={onExit} className="text-sm font-semibold text-gray-400 transition hover:text-gray-600">
          Exit
        </button>
      </div>

      {/* Character picker */}
      <div className="mb-6">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          {chars.length} characters
        </p>
        <div className="flex flex-wrap gap-2">
          {chars.map((c) => (
            <button
              key={c.char}
              onClick={() => selectChar(c)}
              title={c.meaning}
              className={`flex h-11 w-11 items-center justify-center rounded-xl text-2xl font-light transition-all ${
                selected.char === c.char
                  ? 'border-2 border-brand-400 bg-brand-50 text-brand-700 shadow-cartoon'
                  : 'border border-gray-200 bg-white text-gray-700 hover:border-brand-200 hover:bg-brand-50'
              }`}
            >
              {c.char}
            </button>
          ))}
        </div>
      </div>

      {/* Selected character info */}
      <div className="mb-5 flex items-center gap-4">
        <p className="text-5xl font-light leading-none text-gray-900">{selected.char}</p>
        <div className="min-w-0 flex-1">
          {selected.source !== selected.char && (
            <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-gray-400">from {selected.source}</p>
          )}
          <p className="text-sm font-semibold text-gray-600 truncate">{selected.meaning}</p>
        </div>
        <SpeakButton text={selected.char} size="md" />
      </div>

      {/* Watch / Practice toggle */}
      {quizResult === null && (
        <div className="mb-5 flex w-fit rounded-xl border border-gray-200 bg-gray-50 p-1">
          <button
            onClick={() => { setMode('animate'); setQuizResult(null) }}
            className={`rounded-lg px-5 py-2 text-sm font-bold transition-all ${
              mode === 'animate'
                ? 'bg-brand-500 text-white shadow-[0_2px_0_#5b21b6]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Watch
          </button>
          <button
            onClick={startQuiz}
            className={`rounded-lg px-5 py-2 text-sm font-bold transition-all ${
              mode === 'quiz'
                ? 'bg-brand-500 text-white shadow-[0_2px_0_#5b21b6]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Practice
          </button>
        </div>
      )}

      {/* Writer canvas */}
      {quizResult === null && (
        <>
          <div className="mb-5 flex justify-center">
            <StrokeWriter
              key={`${selected.char}-${mode}`}
              character={selected.char}
              mode={mode}
              onQuizComplete={(mistakes) => setQuizResult(mistakes)}
            />
          </div>

          {mode === 'animate' && (
            <button
              onClick={startQuiz}
              className="w-full rounded-2xl bg-brand-500 py-3 text-sm font-bold text-white shadow-[0_3px_0_#5b21b6] transition-all hover:-translate-y-0.5"
            >
              Start stroke practice
            </button>
          )}

          {mode === 'quiz' && (
            <p className="text-center text-xs font-medium text-gray-400">
              Draw each stroke in order — follow the direction shown
            </p>
          )}
        </>
      )}

      {/* Quiz result */}
      {quizResult !== null && (
        <div className="flex flex-col items-center gap-5 py-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-brand-100 bg-brand-50 text-4xl">
            {quizResult === 0 ? '🏆' : quizResult <= 3 ? '👍' : '💪'}
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">
              {quizResult === 0 ? 'Perfect strokes!' : quizResult <= 3 ? 'Well done!' : 'Keep practicing!'}
            </p>
            <p className="mt-1 text-sm font-medium text-gray-400">
              {quizResult === 0 ? 'No mistakes' : `${quizResult} mistake${quizResult === 1 ? '' : 's'}`}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={startQuiz}
              className="rounded-2xl border border-brand-200 bg-white px-5 py-2.5 text-sm font-bold text-brand-600 shadow-cartoon transition-all hover:-translate-y-0.5"
            >
              Try again
            </button>
            {hasNext && (
              <button
                onClick={() => selectChar(chars[currentIndex + 1])}
                className="rounded-2xl bg-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_3px_0_#5b21b6] transition-all hover:-translate-y-0.5"
              >
                Next character →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
