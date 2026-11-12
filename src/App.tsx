import { useSetupStore } from './store.ts'

const STACK = [
  'React 19',
  'TypeScript',
  'Vite',
  'Tailwind CSS',
  'Zustand',
  'Recharts',
  'Zod',
  'Vitest',
]

export default function App() {
  const clicks = useSetupStore((s) => s.clicks)
  const ping = useSetupStore((s) => s.ping)

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-4 py-12">
      <header>
        <p className="text-sm font-semibold uppercase tracking-widest text-signal">
          NASA Space Apps Challenge 2026
        </p>
        <h1 className="mt-2 text-5xl font-bold">Galaxy Run</h1>
        <p className="mt-3 text-lg text-slate-300">
          Design a space mission. Launch it. Find out why it worked or failed.
        </p>
      </header>

      <section className="rounded-xl border border-space-600 bg-space-800 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-signal">
          Setup check
        </h2>
        <p className="mt-2 text-slate-300">
          If you can read this, the toolchain works. The game itself is not built yet.
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {STACK.map((name) => (
            <li
              key={name}
              className="rounded-full bg-space-700 px-3 py-1 text-sm text-slate-200"
            >
              {name}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={ping}
          className="mt-5 rounded-lg bg-signal px-4 py-2 font-semibold text-space-900 hover:opacity-90"
        >
          Test state: clicked {clicks} times
        </button>
      </section>
    </main>
  )
}
