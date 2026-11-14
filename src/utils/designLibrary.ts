import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import { z } from 'zod'
import type { MissionDesign } from '../engine/types.ts'

const key = 'galaxy-run:saved-designs'
const DesignSchema = z.object({
  scenarioId: z.string(), busId: z.string(), launchVehicleId: z.string(), orbitId: z.string(),
  propulsionId: z.string(), propellantMassKg: z.number(), developmentDurationDays: z.number(), missionDurationDays: z.number(),
  difficulty: z.enum(['easy', 'normal', 'hard']), playMode: z.enum(['mission', 'sandbox']), instrumentIds: z.array(z.string()).min(3).max(5),
  solarPanelAreaM2: z.number().min(0.5).max(5), teamMode: z.boolean().optional(),
})
const SavedSchema = z.array(z.object({ id: z.string(), name: z.string(), savedAt: z.string(), design: DesignSchema }))

export type SavedDesign = z.infer<typeof SavedSchema>[number]

export function readSavedDesigns(): SavedDesign[] {
  try {
    if (typeof localStorage === 'undefined') return []
    const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? '[]')
    const result = SavedSchema.safeParse(parsed)
    return result.success ? result.data : []
  } catch {
    return []
  }
}

export function saveDesign(name: string, design: MissionDesign) {
  const validDesign = DesignSchema.safeParse(design)
  if (!validDesign.success || typeof localStorage === 'undefined') return false
  try {
    const designs = readSavedDesigns().filter((item) => item.name !== name).slice(-9)
    designs.push({ id: crypto.randomUUID(), name: name.trim().slice(0, 32), savedAt: new Date().toISOString(), design: validDesign.data })
    localStorage.setItem(key, JSON.stringify(designs))
    return true
  } catch {
    return false
  }
}

export function deleteSavedDesign(id: string) {
  try {
    localStorage.setItem(key, JSON.stringify(readSavedDesigns().filter((item) => item.id !== id)))
  } catch {
    // Saving is optional; the live design remains available if storage is disabled.
  }
}

export function createDesignShareUrl(design: MissionDesign, seed = 2026) {
  const validDesign = DesignSchema.safeParse(design)
  if (!validDesign.success) return ''
  const url = new URL(window.location.href)
  url.searchParams.set('design', compressToEncodedURIComponent(JSON.stringify({ version: 1, seed, design: validDesign.data })))
  return url.toString()
}

export function readSharedDesign(search: string): { design: MissionDesign; seed: number } | null {
  try {
    const compressed = new URLSearchParams(search).get('design')
    if (!compressed) return null
    const decoded = decompressFromEncodedURIComponent(compressed)
    if (!decoded) return null
    const parsed: unknown = JSON.parse(decoded)
    const payload = z.object({ version: z.literal(1), seed: z.number().int(), design: DesignSchema }).safeParse(parsed)
    return payload.success ? { design: payload.data.design, seed: payload.data.seed } : null
  } catch {
    return null
  }
}
