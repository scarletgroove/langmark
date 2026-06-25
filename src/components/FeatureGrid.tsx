const features = [
  { emoji: '📚', title: 'Interactive lessons',   description: 'Blend characters, listening, speaking and writing in every module.',      border: 'border-pink-100',   bg: 'bg-pink-50',   shadow: 'shadow-cartoon-pink',   label: 'text-pink-500'   },
  { emoji: '🔄', title: 'Daily review',          description: 'Smart spaced repetition strengthens memory over time.',                   border: 'border-amber-100',  bg: 'bg-amber-50',  shadow: 'shadow-cartoon-yellow', label: 'text-amber-500'  },
  { emoji: '🏆', title: 'Gamified learning',     description: 'Earn streaks, badges, and confidence with every session.',               border: 'border-emerald-100', bg: 'bg-emerald-50', shadow: 'shadow-cartoon-green', label: 'text-emerald-500' },
  { emoji: '🏮', title: 'Cultural context',      description: 'Learn vocabulary with real-life dialogue and cultural notes.',           border: 'border-sky-100',    bg: 'bg-sky-50',    shadow: 'shadow-cartoon-blue',   label: 'text-sky-500'    },
]

export default function FeatureGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {features.map((f) => (
        <div key={f.title} className={`rounded-3xl border p-6 ${f.border} ${f.bg} ${f.shadow}`}>
          <span className="text-3xl">{f.emoji}</span>
          <h3 className="mt-3 text-base font-bold text-gray-900">{f.title}</h3>
          <p className="mt-1.5 text-sm font-medium leading-relaxed text-gray-500">{f.description}</p>
        </div>
      ))}
    </div>
  )
}
