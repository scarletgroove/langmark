import { curriculumLevels } from '../data/curriculum'

export default function Curriculum() {
  return (
    <main>
      <section className="mb-10">
        <div className="rounded-3xl border border-brand-100 bg-white p-8 shadow-cartoon">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-500">Curriculum</p>
          <h1 className="mt-3 text-4xl font-black text-gray-900 sm:text-5xl leading-tight">
            Structured learning from beginner to fluent.
          </h1>
          <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-gray-500">
            Follow a clear path with levels, goals, and short lessons designed to make daily progress effortless.
          </p>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        {curriculumLevels.map((level) => (
          <div key={level.name} className="rounded-3xl border border-brand-100 bg-white p-8 shadow-cartoon">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-brand-500">{level.phase}</p>
                <h2 className="mt-2 text-xl font-black text-gray-900">{level.name}</h2>
              </div>
              <span className="shrink-0 rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-600">
                {level.lessons} lessons
              </span>
            </div>
            <p className="mt-4 text-sm font-medium leading-relaxed text-gray-500">{level.description}</p>
            <ul className="mt-5 space-y-2">
              {level.goals.map((goal) => (
                <li key={goal} className="flex items-start gap-2 text-sm font-semibold text-gray-700">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                  {goal}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </main>
  )
}
