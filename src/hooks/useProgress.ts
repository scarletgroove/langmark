import { useState, useMemo } from 'react'

interface LessonRecord {
  progress: number       // best score (0–100)
  sessionsCompleted: number
  lastPracticed: string  // YYYY-MM-DD
}

interface ProgressStore {
  lessons: Record<string, LessonRecord>
  streakDays: number
  lastActiveDate: string // YYYY-MM-DD
  todayActivities: string[] // e.g. ['flashcard', 'review']
}

const STORAGE_KEY = 'langmark_progress'

const DEFAULT: ProgressStore = {
  lessons: {},
  streakDays: 0,
  lastActiveDate: '',
  todayActivities: [],
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function isYesterday(date: string): boolean {
  if (!date) return false
  const d = new Date(date)
  if (isNaN(d.getTime())) return false
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10) === today()
}

function load(): ProgressStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ProgressStore) : DEFAULT
  } catch {
    return DEFAULT
  }
}

function save(store: ProgressStore) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // storage full or unavailable — silently ignore
  }
}

function deriveMastery(store: ProgressStore): string {
  const records = Object.values(store.lessons)
  const mastered = records.filter((r) => r.progress >= 80).length
  if (mastered === 0) return 'Beginner'
  if (mastered === 1) return 'Beginner+'
  if (mastered === 2) return 'Elementary'
  return 'Intermediate'
}

export function useProgress() {
  const [store, setStore] = useState<ProgressStore>(load)

  function recordSession(lessonId: string, correct: number, total: number) {
    const score = Math.round((correct / total) * 100)
    const t = today()

    setStore((prev) => {
      const existing = prev.lessons[lessonId]
      const newProgress = Math.max(existing?.progress ?? 0, score)

      let streak = prev.streakDays
      if (prev.lastActiveDate === t) {
        // already counted today
      } else if (isYesterday(prev.lastActiveDate)) {
        streak += 1
      } else {
        streak = 1
      }

      const prevActivities = prev.lastActiveDate === t ? prev.todayActivities : []
      const next: ProgressStore = {
        ...prev,
        streakDays: streak,
        lastActiveDate: t,
        todayActivities: prevActivities.includes('flashcard') ? prevActivities : [...prevActivities, 'flashcard'],
        lessons: {
          ...prev.lessons,
          [lessonId]: {
            progress: newProgress,
            sessionsCompleted: (existing?.sessionsCompleted ?? 0) + 1,
            lastPracticed: t,
          },
        },
      }
      save(next)
      return next
    })
  }

  function getLessonProgress(lessonId: string): number {
    return store.lessons[lessonId]?.progress ?? 0
  }

  // Update streak without requiring a full lesson session (e.g. SRS review)
  function recordActivity(type: string = 'review') {
    const t = today()
    setStore((prev) => {
      const prevActivities = prev.lastActiveDate === t ? prev.todayActivities : []
      if (prev.lastActiveDate === t && prevActivities.includes(type)) return prev

      let streak = prev.streakDays
      if (prev.lastActiveDate !== t) {
        streak = isYesterday(prev.lastActiveDate) ? streak + 1 : 1
      }

      const next: ProgressStore = {
        ...prev,
        streakDays: streak,
        lastActiveDate: t,
        todayActivities: [...prevActivities, type],
      }
      save(next)
      return next
    })
  }

  const completedLessons = Object.values(store.lessons).filter((r) => r.progress >= 80).length
  const mastery = deriveMastery(store)
  const isNewUser = Object.keys(store.lessons).length === 0

  // Stable reference — only rebuilds when a lesson is first added
  const startedLessonIds = useMemo(
    () => Object.keys(store.lessons),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [Object.keys(store.lessons).join(',')]
  )

  const todayActivities = store.lastActiveDate === today() ? store.todayActivities : []

  return {
    getLessonProgress,
    recordSession,
    recordActivity,
    streakDays: store.streakDays,
    completedLessons,
    mastery,
    isNewUser,
    startedLessonIds,
    todayActivities,
  }
}
