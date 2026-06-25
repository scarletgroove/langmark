import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react'

interface PronunciationCtx {
  speak: (text: string) => void
  stop: () => void
  speakingText: string | null
  supported: boolean
}

const PronunciationContext = createContext<PronunciationCtx>({
  speak: () => {},
  stop: () => {},
  speakingText: null,
  supported: false,
})

function pickBestZhVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const isHighQuality = (v: SpeechSynthesisVoice) =>
    /enhanced|premium/i.test(v.name)
  // Meijia is macOS's dedicated high-quality zh-TW voice; Tingting for zh-CN
  const isDedicatedMandarin = (v: SpeechSynthesisVoice) =>
    /meijia|tingting/i.test(v.name)

  return (
    voices.find((v) => v.lang === 'zh-TW' && isDedicatedMandarin(v)) ||
    voices.find((v) => v.lang === 'zh-TW' && isHighQuality(v)) ||
    voices.find((v) => v.lang === 'zh-TW') ||
    voices.find((v) => v.lang === 'zh-HK' && isHighQuality(v)) ||
    voices.find((v) => v.lang === 'zh-HK') ||
    voices.find((v) => v.lang.startsWith('zh') && isDedicatedMandarin(v)) ||
    voices.find((v) => v.lang.startsWith('zh') && isHighQuality(v)) ||
    voices.find((v) => v.lang.startsWith('zh'))
  )
}

export function PronunciationProvider({ children }: { children: ReactNode }) {
  const [supported, setSupported] = useState(false)
  const [speakingText, setSpeakingText] = useState<string | null>(null)
  const voicesRef = useRef<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    if (!('speechSynthesis' in window)) return
    setSupported(true)

    function loadVoices() {
      voicesRef.current = window.speechSynthesis.getVoices()
    }
    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
  }, [])

  function speak(text: string) {
    if (!supported) return
    window.speechSynthesis.cancel()
    setSpeakingText(text)

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-TW'
    utterance.rate = 0.85

    const voice = pickBestZhVoice(voicesRef.current)
    if (voice) utterance.voice = voice

    utterance.onend = () => setSpeakingText(null)
    utterance.onerror = () => setSpeakingText(null)

    window.speechSynthesis.speak(utterance)
  }

  function stop() {
    window.speechSynthesis.cancel()
    setSpeakingText(null)
  }

  return (
    <PronunciationContext.Provider value={{ speak, stop, speakingText, supported }}>
      {children}
    </PronunciationContext.Provider>
  )
}

export function usePronunciationContext() {
  return useContext(PronunciationContext)
}
