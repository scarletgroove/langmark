import { useState, useEffect, useRef } from 'react'

function pickBestZhVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const isHighQuality = (v: SpeechSynthesisVoice) =>
    /enhanced|premium/i.test(v.name)
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

export function usePronunciation() {
  const [speaking, setSpeaking] = useState(false)
  const [supported, setSupported] = useState(false)
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

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-TW'
    utterance.rate = 0.85

    const voice = pickBestZhVoice(voicesRef.current)
    if (voice) utterance.voice = voice

    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }

  function stop() {
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }

  return { speak, stop, speaking, supported }
}
