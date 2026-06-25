import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="rounded-3xl border border-brand-100 bg-white p-12 text-center shadow-cartoon">
      <p className="text-xs font-bold uppercase tracking-wider text-brand-500">Page not found</p>
      <h1 className="mt-4 text-6xl font-black text-gray-900">404</h1>
      <p className="mx-auto mt-4 max-w-md text-base font-medium leading-relaxed text-gray-500">
        The path you tried doesn't exist yet. Head back to your dashboard and continue learning.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex rounded-2xl bg-brand-500 px-6 py-3 text-sm font-bold text-white shadow-[0_3px_0_#5b21b6] transition-all hover:-translate-y-0.5"
      >
        Return to dashboard
      </Link>
    </main>
  )
}
