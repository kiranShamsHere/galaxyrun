import { create } from 'zustand'

/**
 * Placeholder store. It only exists to prove Zustand is wired up.
 * The real mission design state will replace this on build day.
 */
type SetupState = {
  clicks: number
  ping: () => void
}

export const useSetupStore = create<SetupState>((set) => ({
  clicks: 0,
  ping: () => set((s) => ({ clicks: s.clicks + 1 })),
}))
