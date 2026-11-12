import { describe, expect, it } from 'vitest'
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import { z } from 'zod'
import { useSetupStore } from './store.ts'

// These tests only check that the toolchain is wired correctly.
// Real engine tests go in src/engine on build day.
describe('toolchain smoke test', () => {
  it('runs TypeScript tests with Vitest', () => {
    expect(1 + 1).toBe(2)
  })

  it('round trips data through lz-string (used for share links)', () => {
    const payload = JSON.stringify({ hello: 'orbit' })
    const packed = compressToEncodedURIComponent(payload)
    expect(decompressFromEncodedURIComponent(packed)).toBe(payload)
  })

  it('validates data with Zod (used for JSON catalogs)', () => {
    const Part = z.object({ id: z.string(), massKg: z.number().positive() })
    expect(Part.safeParse({ id: 'x', massKg: 10 }).success).toBe(true)
    expect(Part.safeParse({ id: 'x', massKg: -1 }).success).toBe(false)
  })

  it('updates the Zustand store', () => {
    useSetupStore.setState({ clicks: 0 })
    useSetupStore.getState().ping()
    expect(useSetupStore.getState().clicks).toBe(1)
  })
})
