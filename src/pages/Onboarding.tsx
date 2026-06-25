import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useOnboarding } from '../hooks/useOnboarding'

interface FormState {
  goal: string
  level: string
  dailyTime: string
  focus: string[]
}

const EMPTY: FormState = { goal: '', level: '', dailyTime: '', focus: [] }

const GOALS = [
  { id: 'conversation', label: 'Everyday conversation', sub: 'Talk with native speakers confidently', emoji: '💬' },
  { id: 'travel',       label: 'Travel',                sub: 'Navigate Taiwan or HK with ease',      emoji: '✈️' },
  { id: 'business',     label: 'Business',              sub: 'Read contracts, emails, and meetings',  emoji: '💼' },
  { id: 'culture',      label: 'Reading & culture',     sub: 'Literature, news, and classical texts', emoji: '📚' },
]

const LEVELS = [
  { id: 'beginner',   label: 'Complete beginner', sub: 'I know little or no Chinese',              emoji: '🌱' },
  { id: 'some',       label: 'Some basics',        sub: 'I know a few phrases or characters',       emoji: '🌿' },
  { id: 'elementary', label: 'Elementary',         sub: 'I can read and write simple sentences',    emoji: '🌳' },
]

const TIMES = [
  { id: '5',  label: '5–10 min',  sub: 'Quick daily habit',  emoji: '⚡' },
  { id: '15', label: '15–20 min', sub: 'Steady progress',    emoji: '🚀' },
  { id: '30', label: '30–45 min', sub: 'Serious commitment', emoji: '🏋️' },
  { id: '60', label: '1 hour+',   sub: 'Immersive study',    emoji: '🔥' },
]

const FOCUS_AREAS = [
  { id: 'characters', label: 'Characters & stroke order', emoji: '✏️' },
  { id: 'speaking',   label: 'Speaking & tones',          emoji: '🗣️' },
  { id: 'listening',  label: 'Listening comprehension',   emoji: '👂' },
  { id: 'reading',    label: 'Reading sentences',         emoji: '📖' },
  { id: 'grammar',    label: 'Grammar patterns',          emoji: '🧩' },
]

function buildPlan(form: FormState) {
  const goalLabels: Record<string, string> = { conversation: 'Everyday Conversation', travel: 'Travel Ready', business: 'Business Chinese', culture: 'Reading & Culture' }
  const timeLabels: Record<string, string> = { '5': '5–10 minutes', '15': '15–20 minutes', '30': '30–45 minutes', '60': '1 hour+' }
  const lessonsPerDay: Record<string, number> = { '5': 1, '15': 2, '30': 3, '60': 5 }
  const startLevel: Record<string, string> = { beginner: 'Foundations — Radicals & Core Characters', some: 'Beginner I — Essential Vocabulary & Phrases', elementary: 'Beginner II — Sentences & Basic Conversation' }
  const weekTargets: Record<string, string> = { '5': '35–70 new characters per week', '15': '80–120 new characters per week', '30': '150–200 new characters per week', '60': '250+ new characters per week' }
  return {
    track: goalLabels[form.goal] ?? 'General',
    startingPoint: startLevel[form.level] ?? 'Foundations',
    dailyTime: timeLabels[form.dailyTime] ?? '',
    lessonsPerDay: lessonsPerDay[form.dailyTime] ?? 1,
    weeklyTarget: weekTargets[form.dailyTime] ?? '',
    focusAreas: form.focus.map((id) => FOCUS_AREAS.find((f) => f.id === id)?.label ?? id),
  }
}

function RadioCard({ label, sub, emoji, selected, onClick }: { id: string; label: string; sub: string; emoji: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border p-4 text-left transition-all ${
        selected
          ? 'border-brand-300 bg-brand-50 shadow-cartoon'
          : 'border-gray-200 bg-white hover:border-brand-200 hover:bg-brand-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{emoji}</span>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900">{label}</p>
          <p className="mt-0.5 text-xs font-medium text-gray-500">{sub}</p>
        </div>
        <div className={`h-4 w-4 shrink-0 rounded-full border-2 transition ${selected ? 'border-brand-500 bg-brand-500' : 'border-gray-300'}`} />
      </div>
    </button>
  )
}

function CheckCard({ label, emoji, checked, onClick }: { id: string; label: string; emoji: string; checked: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border p-4 text-left transition-all ${
        checked
          ? 'border-brand-300 bg-brand-50 shadow-cartoon'
          : 'border-gray-200 bg-white hover:border-brand-200 hover:bg-brand-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">{emoji}</span>
        <p className="flex-1 text-sm font-bold text-gray-900">{label}</p>
        <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition ${checked ? 'border-brand-500 bg-brand-500' : 'border-gray-300'}`}>
          {checked && <span className="text-[9px] font-black text-white leading-none">✓</span>}
        </div>
      </div>
    </button>
  )
}

const STEP_META = [
  { label: 'Step 1 of 4', heading: "What's your main goal?",      sub: "We'll build your curriculum around this." },
  { label: 'Step 2 of 4', heading: 'Where are you starting from?', sub: 'Honest answers give you a better plan.' },
  { label: 'Step 3 of 4', heading: 'How much time per day?',       sub: 'Even 5 minutes daily compounds fast.' },
  { label: 'Step 4 of 4', heading: 'What do you want to focus on?', sub: 'Pick as many as you like — at least one.' },
]

const TOTAL_STEPS = 4

function canAdvance(step: number, form: FormState) {
  if (step === 0) return !!form.goal
  if (step === 1) return !!form.level
  if (step === 2) return !!form.dailyTime
  if (step === 3) return form.focus.length > 0
  return false
}

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY)
  const { saveResult } = useOnboarding()
  const navigate = useNavigate()

  function set(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleFocus(id: string) {
    setForm((prev) => ({ ...prev, focus: prev.focus.includes(id) ? prev.focus.filter((f) => f !== id) : [...prev.focus, id] }))
  }

  function next() {
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1)
    } else {
      saveResult(form)
      setDone(true)
    }
  }

  const plan = buildPlan(form)
  const progressPct = done ? 100 : (step / TOTAL_STEPS) * 100
  const meta = STEP_META[step]

  return (
    <main className="mx-auto max-w-xl pb-24">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-500">Personalized setup</p>
        <h1 className="mt-3 text-4xl font-black text-gray-900 sm:text-5xl leading-tight">Build your learning plan.</h1>
        <p className="mt-4 text-base font-medium leading-relaxed text-gray-500">
          Four quick questions and you'll have a custom roadmap to Traditional Chinese fluency.
        </p>
      </div>

      <div className="mb-8 h-2 w-full overflow-hidden rounded-full bg-brand-50">
        <div className="h-full rounded-full bg-brand-500 transition-all duration-500" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="rounded-3xl border border-brand-100 bg-white p-8 shadow-cartoon">
        {done ? (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-500 mb-2">Your personalized plan</p>
            <h2 className="text-2xl font-black text-gray-900 mb-6">Here's what we built for you.</h2>
            <div className="space-y-3 mb-8">
              <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-brand-400 mb-1">Track</p>
                <p className="text-base font-bold text-gray-900">{plan.track}</p>
              </div>
              <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-brand-400 mb-1">Starting point</p>
                <p className="text-base font-bold text-gray-900">{plan.startingPoint}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-amber-500 mb-1">Daily time</p>
                  <p className="text-base font-bold text-gray-900">{plan.dailyTime}</p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-emerald-500 mb-1">Lessons/day</p>
                  <p className="text-base font-bold text-gray-900">{plan.lessonsPerDay}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-sky-100 bg-sky-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-sky-500 mb-1">Weekly target</p>
                <p className="text-base font-bold text-gray-900">{plan.weeklyTarget}</p>
              </div>
              {plan.focusAreas.length > 0 && (
                <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-400 mb-3">Focus areas</p>
                  <div className="flex flex-wrap gap-2">
                    {plan.focusAreas.map((a) => (
                      <span key={a} className="rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">{a}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => navigate('/')}
                className="flex-1 rounded-2xl bg-brand-500 py-3 text-center text-sm font-bold text-white shadow-[0_3px_0_#5b21b6] transition-all hover:-translate-y-0.5"
              >
                Start learning
              </button>
              <button
                onClick={() => { setForm(EMPTY); setStep(0); setDone(false) }}
                className="rounded-2xl border border-brand-200 bg-white px-5 py-3 text-sm font-bold text-brand-600 shadow-cartoon transition-all hover:-translate-y-0.5"
              >
                Start over
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-400 mb-2">{meta.label}</p>
            <h2 className="text-2xl font-black text-gray-900 mb-1">{meta.heading}</h2>
            <p className="text-sm font-medium text-gray-500 mb-7">{meta.sub}</p>

            {step === 0 && (
              <div className="space-y-3">
                {GOALS.map((g) => <RadioCard key={g.id} {...g} selected={form.goal === g.id} onClick={() => set('goal', g.id)} />)}
              </div>
            )}
            {step === 1 && (
              <div className="space-y-3">
                {LEVELS.map((l) => <RadioCard key={l.id} {...l} selected={form.level === l.id} onClick={() => set('level', l.id)} />)}
              </div>
            )}
            {step === 2 && (
              <div className="grid grid-cols-2 gap-3">
                {TIMES.map((t) => <RadioCard key={t.id} {...t} selected={form.dailyTime === t.id} onClick={() => set('dailyTime', t.id)} />)}
              </div>
            )}
            {step === 3 && (
              <div className="space-y-3">
                {FOCUS_AREAS.map((f) => <CheckCard key={f.id} {...f} checked={form.focus.includes(f.id)} onClick={() => toggleFocus(f.id)} />)}
              </div>
            )}

            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 0}
                className="rounded-2xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-500 shadow-sm transition-all hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-30"
              >
                Back
              </button>
              <button
                onClick={next}
                disabled={!canAdvance(step, form)}
                className="rounded-2xl bg-brand-500 px-6 py-2.5 text-sm font-bold text-white shadow-[0_3px_0_#5b21b6] transition-all hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-40"
              >
                {step === TOTAL_STEPS - 1 ? 'Build my plan' : 'Next →'}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
