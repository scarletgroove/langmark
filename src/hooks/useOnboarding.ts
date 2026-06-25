const STORAGE_KEY = 'langmark_onboarding'

export interface OnboardingResult {
  goal: string
  level: string
  dailyTime: string
  focus: string[]
  completedAt: string
}

export function useOnboarding() {
  function getResult(): OnboardingResult | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as OnboardingResult) : null
    } catch {
      return null
    }
  }

  function saveResult(data: Omit<OnboardingResult, 'completedAt'>) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...data, completedAt: new Date().toISOString() })
      )
    } catch {}
  }

  return { getResult, saveResult }
}
