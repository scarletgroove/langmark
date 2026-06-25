import { useState, useEffect } from 'react'
import type { VocabItem } from '../types'
import SpeakButton from './SpeakButton'
import { usePronunciationContext } from '../contexts/PronunciationContext'

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

interface Props {
  vocab: VocabItem[]
  onFinish: (correct: number, total: number) => void
}

export default function FlashcardPractice({ vocab, onFinish }: Props) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [done, setDone] = useState(false)
  const { speak } = usePronunciationContext()

  const card = vocab[index]
  const total = vocab.length

  useEffect(() => {
    if (flipped) speak(card.character)
  }, [flipped, index])

  function flip() {
    if (!flipped) setFlipped(true)
  }

  function handleResult(knew: boolean) {
    const newCorrect = knew ? correct + 1 : correct
    if (index + 1 >= total) {
      setDone(true)
      onFinish(newCorrect, total)
    } else {
      setCorrect(newCorrect)
      setIndex(index + 1)
      setFlipped(false)
    }
  }

  if (done) {
    const score = Math.round((correct / total) * 100)
    return (
      <div className="flex flex-col items-center gap-8 py-12 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-brand-100 bg-brand-50 text-5xl">
          {score >= 80 ? '🎉' : score >= 50 ? '👍' : '💪'}
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-brand-500">Session complete</p>
          <p className="mt-3 text-4xl font-black text-gray-900">{correct} / {total}</p>
          <p className="mt-1 text-sm font-semibold text-gray-400">{score}% accuracy</p>
        </div>
        <button
          onClick={() => { setIndex(0); setFlipped(false); setCorrect(0); setDone(false) }}
          className="rounded-2xl bg-brand-500 px-6 py-3 text-sm font-bold text-white shadow-[0_3px_0_#5b21b6] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_0_#5b21b6]"
        >
          Practice again
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex w-full items-center justify-between text-xs font-semibold text-gray-400">
        <span>{index + 1} of {total}</span>
        <span>{correct} correct</span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-brand-50">
        <div
          className="h-full rounded-full bg-brand-500 transition-all duration-300"
          style={{ width: `${(index / total) * 100}%` }}
        />
      </div>

      {/* Card */}
      <div
        onClick={flip}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') flip() }}
        aria-label={flipped ? 'Card showing answer' : 'Press to reveal answer'}
        className="group relative w-full max-w-lg cursor-pointer"
      >
        <div className="min-h-64 w-full rounded-3xl border border-brand-100 bg-white p-10 shadow-cartoon transition-all">
          {flipped && (
            <div className="absolute right-5 top-5" onClick={(e) => e.stopPropagation()}>
              <SpeakButton text={card.character} size="sm" />
            </div>
          )}

          <div className="flex h-full flex-col items-center justify-center gap-4 pt-2 text-center">
            {/* Front: photo or emoji hint */}
            {!flipped && (
              <>
                <CardImage item={card} />
                <p className="mt-2 text-sm font-medium text-gray-400 group-hover:text-brand-400 transition">
                  Tap to reveal
                </p>
              </>
            )}

            {/* Back: character + pronunciation + meaning */}
            {flipped && (
              <>
                <div className="flex items-center gap-4">
                  {card.imageEmoji && (
                    <span className="text-4xl leading-none select-none">{card.imageEmoji}</span>
                  )}
                  <p className="text-7xl font-light leading-none text-gray-900">{card.character}</p>
                </div>
                <div className="mt-2 space-y-2">
                  <p className="text-xl font-bold text-brand-500">{card.pinyin}</p>
                  <p className="text-base font-semibold text-gray-700">{card.meaning}</p>
                  {card.example && (
                    <div
                      className="mt-4 rounded-2xl border border-brand-50 bg-brand-50 px-5 py-3 text-left"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{card.example}</p>
                          <p className="text-sm font-medium text-brand-400">{card.examplePinyin}</p>
                          <p className="text-xs font-medium italic text-gray-400">{card.exampleMeaning}</p>
                        </div>
                        <SpeakButton text={card.example} size="sm" className="shrink-0 mt-0.5" />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {flipped ? (
        <div className="flex w-full max-w-lg gap-3">
          <button
            onClick={() => handleResult(false)}
            className="flex-1 rounded-2xl border border-gray-200 bg-white py-3 text-sm font-bold text-gray-600 shadow-sm transition-all hover:bg-gray-50"
          >
            Need practice
          </button>
          <button
            onClick={() => handleResult(true)}
            className="flex-1 rounded-2xl bg-brand-500 py-3 text-sm font-bold text-white shadow-[0_3px_0_#5b21b6] transition-all hover:-translate-y-0.5"
          >
            Got it
          </button>
        </div>
      ) : (
        <button
          onClick={flip}
          className="w-full max-w-lg rounded-2xl bg-brand-500 py-3 text-sm font-bold text-white shadow-[0_3px_0_#5b21b6] transition-all hover:-translate-y-0.5"
        >
          Reveal answer
        </button>
      )}
    </div>
  )
}
