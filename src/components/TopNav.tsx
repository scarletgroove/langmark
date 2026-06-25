import { NavLink } from 'react-router-dom'
import { useSRS } from '../hooks/useSRS'
import { useProgress } from '../hooks/useProgress'

export default function TopNav() {
  const { startedLessonIds } = useProgress()
  const { dueCount } = useSRS(startedLessonIds)

  return (
    <nav className="mb-8 flex flex-col gap-4 rounded-3xl border border-brand-200 bg-white p-5 shadow-cartoon sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-base font-black tracking-tight text-brand-600">LangMark</p>
        <p className="mt-0.5 text-sm font-medium text-gray-400">Traditional Chinese · Interactive Learning</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {[
          { name: 'Dashboard', to: '/', exact: true },
          { name: 'Curriculum', to: '/curriculum', exact: false },
          { name: 'Onboarding', to: '/onboarding', exact: false },
        ].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              `rounded-full px-5 py-2 text-sm font-bold transition-all ${
                isActive
                  ? 'bg-brand-500 text-white shadow-[0_2px_0_#5b21b6]'
                  : 'text-gray-500 hover:bg-brand-50 hover:text-brand-600'
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}

        <NavLink
          to="/review"
          className={({ isActive }) =>
            `relative rounded-full px-5 py-2 text-sm font-bold transition-all ${
              isActive
                ? 'bg-brand-500 text-white shadow-[0_2px_0_#5b21b6]'
                : 'text-gray-500 hover:bg-brand-50 hover:text-brand-600'
            }`
          }
        >
          Review
          {dueCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[0.55rem] font-black text-white">
              {dueCount}
            </span>
          )}
        </NavLink>
      </div>
    </nav>
  )
}
