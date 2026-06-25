import { useEffect, useRef, useState } from 'react'
import HanziWriter from 'hanzi-writer'

type Mode = 'animate' | 'quiz'

interface Props {
  character: string
  mode: Mode
  onQuizComplete?: (totalMistakes: number) => void
}

// Caller must supply key={`${character}-${mode}`} to remount on change
export default function StrokeWriter({ character, mode, onQuizComplete }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return
    let mounted = true
    let writer: HanziWriter

    writer = HanziWriter.create(containerRef.current, character, {
      width: 260,
      height: 260,
      padding: 10,
      strokeColor: '#818CF8',
      radicalColor: '#a78bfa',
      outlineColor: '#1e293b',
      highlightColor: '#c7d2fe',
      drawingColor: '#e2e8f0',
      showOutline: true,
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 500,
      drawingWidth: 4,
      onLoadCharDataSuccess: () => {
        if (!mounted) return
        setLoading(false)
        if (mode === 'animate') {
          writer.loopCharacterAnimation()
        } else {
          writer.quiz({
            onComplete: (summary) => {
              if (mounted) onQuizComplete?.(summary.totalMistakes)
            },
          })
        }
      },
      onLoadCharDataError: () => {
        if (mounted) { setLoading(false); setError(true) }
      },
    })

    return () => {
      mounted = false
      writer.pauseAnimation()
      if (mode === 'quiz') writer.cancelQuiz()
      if (containerRef.current) containerRef.current.innerHTML = ''
    }
  }, [])

  return (
    <div className="relative flex items-center justify-center rounded-2xl bg-slate-950/80" style={{ width: 260, height: 260 }}>
      <div ref={containerRef} style={{ width: 260, height: 260 }} />

      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
          <p className="text-5xl font-light text-slate-600">{character}</p>
          <p className="text-xs">Stroke data unavailable</p>
        </div>
      )}
    </div>
  )
}
