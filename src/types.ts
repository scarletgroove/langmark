export interface VocabItem {
  id: string
  character: string
  pinyin: string
  meaning: string
  imageEmoji?: string
  imageUrl?: string
  example?: string
  examplePinyin?: string
  exampleMeaning?: string
}

export interface Lesson {
  id: string
  title: string
  description: string
  level: 'Beginner' | 'Elementary' | 'Intermediate' | 'Advanced'
  progress: number
  duration: string
  skills: string[]
  vocab: VocabItem[]
}
