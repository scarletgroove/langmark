import { useState, useMemo } from 'react'
import { lessons } from '../data/lessons'
import type { VocabItem } from '../types'

// ── Types ──────────────────────────────────────────────────────────────────

export interface CardRecord {
  vocabId: string
  lessonId: string
  interval: number    // days until next review
  easiness: number    // EF factor, min 1.3
  repetitions: number
  dueDate: string     // YYYY-MM-DD
  lastReviewed: string
}

export interface ReviewCard {
  vocab: VocabItem
  lessonId: string
  isNew: boolean
  record: CardRecord | null
}

interface SRSStore {
  cards: Record<string, CardRecord>
}

// ── Helpers ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'langmark_srs'
const MAX_NEW_PER_SESSION = 5

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function addDays(date: string, days: number): string {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function load(): SRSStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SRSStore) : { cards: {} }
  } catch {
    return { cards: {} }
  }
}

function save(store: SRSStore) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {}
}

// ── SM-2 algorithm ─────────────────────────────────────────────────────────

function applySmTwo(record: CardRecord | null, vocabId: string, lessonId: string, knew: boolean): CardRecord {
  const quality = knew ? 4 : 1
  const t = today()

  if (!record) {
    // First ever review — bootstrap a new card then apply
    record = { vocabId, lessonId, interval: 1, easiness: 2.5, repetitions: 0, dueDate: t, lastReviewed: t }
  }

  let { interval, easiness, repetitions } = record

  if (quality < 3) {
    repetitions = 0
    interval = 1
  } else {
    if (repetitions === 0) interval = 1
    else if (repetitions === 1) interval = 6
    else interval = Math.round(interval * easiness)
    repetitions += 1
  }

  easiness = Math.max(1.3, easiness + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

  return {
    vocabId,
    lessonId,
    interval,
    easiness,
    repetitions,
    dueDate: addDays(t, interval),
    lastReviewed: t,
  }
}

// ── Queue builder ──────────────────────────────────────────────────────────

function buildQueue(store: SRSStore, startedSet: Set<string>): ReviewCard[] {
  const t = today()
  const due: ReviewCard[] = []
  const newCards: ReviewCard[] = []
  const firstLessonId = lessons[0]?.id

  for (const lesson of lessons) {
    // New cards only surface from the first lesson (bootstrap) or lessons the user has started
    const accessible = lesson.id === firstLessonId || startedSet.has(lesson.id)
    for (const vocab of lesson.vocab) {
      const record = store.cards[vocab.id] ?? null
      if (!record) {
        if (accessible) newCards.push({ vocab, lessonId: lesson.id, isNew: true, record: null })
      } else if (record.dueDate <= t) {
        due.push({ vocab, lessonId: lesson.id, isNew: false, record })
      }
    }
  }

  return [...shuffle(due), ...newCards.slice(0, MAX_NEW_PER_SESSION)]
}

function countDue(store: SRSStore, startedSet: Set<string>): number {
  const t = today()
  const firstLessonId = lessons[0]?.id
  let count = 0
  for (const lesson of lessons) {
    const accessible = lesson.id === firstLessonId || startedSet.has(lesson.id)
    for (const vocab of lesson.vocab) {
      const record = store.cards[vocab.id]
      if (accessible && (!record || record.dueDate <= t)) count++
    }
  }
  return Math.min(count, 9)
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useSRS(startedLessonIds: string[] = []) {
  const [store, setStore] = useState<SRSStore>(load)

  // Stable set reference — only rebuilds when startedLessonIds content changes
  const startedSet = useMemo(
    () => new Set(startedLessonIds),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [startedLessonIds.join(',')]
  )
  const queue = useMemo(() => buildQueue(store, startedSet), [store, startedSet])
  const dueCount = useMemo(() => countDue(store, startedSet), [store, startedSet])

  function recordReview(vocabId: string, lessonId: string, knew: boolean): number {
    let nextInterval = 1
    setStore((prev) => {
      const existing = prev.cards[vocabId] ?? null
      const updated = applySmTwo(existing, vocabId, lessonId, knew)
      nextInterval = updated.interval
      const next = { cards: { ...prev.cards, [vocabId]: updated } }
      save(next)
      return next
    })
    return nextInterval
  }

  return { queue, dueCount, recordReview }
}
