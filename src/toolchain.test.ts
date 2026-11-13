import { describe, expect, it } from 'vitest'
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import { z } from 'zod'
import { useMissionStore } from './store.ts'

// Engine formula and deterministic simulation tests live beside the pure engine modules.
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

  it('updates the mission design in the Zustand store', () => {
    useMissionStore.getState().selectBus('compact-bus')
    expect(useMissionStore.getState().design.busId).toBe('compact-bus')
    useMissionStore.setState({
      design: {
        ...useMissionStore.getState().design,
        instrumentIds: ['climate-camera', 'thermal-imager', 'spectrometer', 'radar-sounder'],
      },
    })
    useMissionStore.getState().toggleInstrument('multispectral-mapper')
    expect(useMissionStore.getState().design.instrumentIds).toContain('multispectral-mapper')
  })
})
