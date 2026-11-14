import type { MissionSimulation } from '../engine/types.ts'

const key = 'galaxy-run:local-leaderboard:v1'
export type LocalScore = Pick<MissionSimulation, 'scenarioId' | 'difficulty' | 'seed' | 'score' | 'grade' | 'missionDurationDays'> & { recordedAt: string }

export function readLocalScores(): LocalScore[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is LocalScore => item && typeof item === 'object'
      && typeof item.scenarioId === 'string' && ['easy', 'normal', 'hard'].includes(item.difficulty)
      && typeof item.seed === 'number' && typeof item.score === 'number' && typeof item.grade === 'string'
      && typeof item.missionDurationDays === 'number' && typeof item.recordedAt === 'string')
  } catch { return [] }
}

export function recordLocalScore(result: MissionSimulation) {
  try {
    const entry: LocalScore = {
      scenarioId: result.scenarioId, difficulty: result.difficulty, seed: result.seed,
      score: result.score, grade: result.grade, missionDurationDays: result.missionDurationDays,
      recordedAt: new Date().toISOString(),
    }
    const scores = [entry, ...readLocalScores()].slice(0, 50)
    localStorage.setItem(key, JSON.stringify(scores))
  } catch {
    // Results remain visible even when the browser blocks local storage.
  }
}

/** Updates the just-recorded flight after its optional learning check. */
export function updateLatestLocalScore(result: MissionSimulation) {
  try {
    const scores = readLocalScores()
    const matching = scores
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item.scenarioId === result.scenarioId && item.difficulty === result.difficulty && item.seed === result.seed)
      .sort((a, b) => b.item.recordedAt.localeCompare(a.item.recordedAt))[0]
    if (!matching) return recordLocalScore(result)
    scores[matching.index] = {
      ...scores[matching.index],
      score: result.score,
      grade: result.grade,
      missionDurationDays: result.missionDurationDays,
    }
    localStorage.setItem(key, JSON.stringify(scores))
  } catch {
    // The report remains usable when the browser blocks local storage.
  }
}
