import { useMemo } from 'react'
import { scenarios } from '../data/catalog.ts'
import { readLocalScores } from '../utils/leaderboardStorage.ts'

export function LocalLeaderboard({ scenarioId, difficulty, seed }: { scenarioId: string; difficulty: string; seed: number }) {
  const scores = useMemo(() => readLocalScores()
    .filter((item) => item.scenarioId === scenarioId && item.difficulty === difficulty && item.seed === seed)
    .sort((a, b) => b.score - a.score || a.missionDurationDays - b.missionDurationDays)
    .slice(0, 5), [scenarioId, difficulty, seed])
  const scenarioName = scenarios.find((item) => item.id === scenarioId)?.name ?? 'Mission'
  return <section className="panel local-leaderboard" aria-labelledby="leaderboard-title"><div className="section-heading"><div><p className="eyebrow">SAME OBJECTIVE · SAME SEED {seed}</p><h2 id="leaderboard-title">Local flight board</h2></div></div><p className="why-intro">{scenarioName} · {difficulty} · saved on this device only. Higher scores rank first; shorter missions break ties.</p>{scores.length ? <ol>{scores.map((entry, index) => <li key={`${entry.recordedAt}-${index}`}><span>#{index + 1} · {entry.grade}</span><b>{entry.score}</b><small>{entry.missionDurationDays} days · {new Date(entry.recordedAt).toLocaleDateString()}</small></li>)}</ol> : <p className="library-message">Your first run sets the board for this objective.</p>}</section>
}
