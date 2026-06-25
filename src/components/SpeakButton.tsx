import { usePronunciationContext } from '../contexts/PronunciationContext'

interface Props {
  text: string
  size?: 'sm' | 'md'
  className?: string
}

export default function SpeakButton({ text, size = 'md', className = '' }: Props) {
  const { speak, speakingText, supported } = usePronunciationContext()

  if (!supported) return null

  const isSpeaking = speakingText === text
  const dim = size === 'sm' ? 'h-7 w-7' : 'h-9 w-9'
  const iconSize = size === 'sm' ? 14 : 18

  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); speak(text) }}
      aria-label="Listen to pronunciation"
      title="Listen"
      className={`inline-flex items-center justify-center rounded-full border-2 border-brand-200 bg-white transition hover:border-brand-400 hover:bg-brand-50 ${dim} ${className}`}
    >
      {isSpeaking ? (
        <svg width={iconSize} height={iconSize} viewBox="0 0 18 18" fill="none" className="text-brand-500">
          <path d="M3 6.5H1v5h2V6.5z" fill="currentColor" opacity="0.5">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="0.8s" repeatCount="indefinite" begin="0s" />
          </path>
          <path d="M7 4H5v10h2V4z" fill="currentColor" opacity="0.7">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="0.8s" repeatCount="indefinite" begin="0.15s" />
          </path>
          <path d="M11 2H9v14h2V2z" fill="currentColor">
            <animate attributeName="opacity" values="1;0.6;1" dur="0.8s" repeatCount="indefinite" begin="0.3s" />
          </path>
          <path d="M15 5H13v8h2V5z" fill="currentColor" opacity="0.7">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="0.8s" repeatCount="indefinite" begin="0.45s" />
          </path>
        </svg>
      ) : (
        <svg width={iconSize} height={iconSize} viewBox="0 0 18 18" fill="none" className="text-brand-500">
          <path d="M10 3L5 7H2a1 1 0 00-1 1v2a1 1 0 001 1h3l5 4V3z" fill="currentColor" />
          <path d="M13.5 5.5a5 5 0 010 7M15.5 3.5a8 8 0 010 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      )}
    </button>
  )
}
