import { useEffect, useRef, useState } from 'react'
import { scenarios } from '../data/catalog.ts'
import type { MissionDesign } from '../engine/types.ts'
import { readLocalScores } from '../utils/leaderboardStorage.ts'
import { createDesignShareUrl } from '../utils/designLibrary.ts'
import { supabase } from '../utils/supabase.ts'
import type { MissionSimulation } from '../engine/types.ts'

export function LocalLeaderboard({ design, result }: { design: MissionDesign; result: MissionSimulation }) {
  const { scenarioId, difficulty, seed } = result
  const [shareUrl, setShareUrl] = useState('')
  const [shareMessage, setShareMessage] = useState('')
  const [onlineScores, setOnlineScores] = useState<Array<{ score: number; grade: string; mission_days: number }>>([])
  const [onlineStatus, setOnlineStatus] = useState('')
  const runId = useRef(crypto.randomUUID())
  const localScores = readLocalScores()
    .filter((item) => item.scenarioId === scenarioId && item.difficulty === difficulty && item.seed === seed)
    .sort((a, b) => b.score - a.score || a.missionDurationDays - b.missionDurationDays)
    .slice(0, 5)
  useEffect(() => {
    if (!supabase) return
    let active = true
    const entry = { id: runId.current, scenario_id: scenarioId, difficulty, seed, score: result.score, grade: result.grade, mission_days: result.missionDurationDays }
    async function refreshBoard() {
      const { data, error } = await supabase!.from('mission_scores').select('score,grade,mission_days').eq('scenario_id', scenarioId).eq('difficulty', difficulty).eq('seed', seed).order('score', { ascending: false }).order('mission_days', { ascending: true }).limit(5)
      if (!active) return
      if (error) setOnlineStatus('Shared board unavailable')
      else setOnlineScores(data ?? [])
    }
    const channel = supabase.channel(`scores:${scenarioId}:${difficulty}:${seed}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mission_scores', filter: `scenario_id=eq.${scenarioId}` }, (payload) => {
        const row = payload.new as { scenario_id?: string; difficulty?: string; seed?: number }
        if (row.scenario_id === scenarioId && row.difficulty === difficulty && row.seed === seed) void refreshBoard()
      })
      .subscribe()
    void (async () => {
      const { error: saveError } = result.playMode === 'sandbox'
        ? { error: null }
        : await supabase.from('mission_scores').insert(entry)
      if (!active) return
      if (saveError && saveError.code !== '23505') setOnlineStatus('Score not saved · shared board unavailable')
      else setOnlineStatus(result.playMode === 'sandbox' ? 'Practice run · shared board' : 'Cross-device scores')
      await refreshBoard()
    })()
    return () => { active = false; void supabase?.removeChannel(channel) }
  }, [scenarioId, difficulty, seed, result.score, result.grade, result.missionDurationDays, result.playMode])
  const scores = supabase ? onlineScores : localScores
  const scenarioName = scenarios.find((item) => item.id === scenarioId)?.name ?? 'Mission'
  async function shareChallenge() {
    const url = createDesignShareUrl(design, seed)
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setShareMessage('Challenge link copied · same design + seed.')
      setShareUrl('')
    } catch {
      setShareMessage('Copy this challenge link:')
      setShareUrl(url)
    }
  }
  return <section className="panel local-leaderboard" aria-labelledby="leaderboard-title"><div className="section-heading"><div><p className="eyebrow">SAME OBJECTIVE · SAME SEED {seed}</p><h2 id="leaderboard-title">Flight challenge</h2></div><button type="button" className="secondary-button" onClick={() => void shareChallenge()}>Share challenge</button></div><p className="why-intro">{scenarioName} · {difficulty} · {onlineStatus || (supabase ? 'shared scores' : 'local scores')}</p>{scores.length ? <ol>{scores.map((entry, index) => <li key={index}><span>#{index + 1} · {entry.grade}</span><b>{entry.score}</b><small>{'mission_days' in entry ? entry.mission_days : entry.missionDurationDays} days</small></li>)}</ol> : <p className="library-message">{supabase ? onlineStatus || 'Loading shared board…' : 'Fly again to build your board.'}</p>}{shareMessage && <p className="library-message" role="status">{shareMessage}</p>}{shareUrl && <input className="challenge-link" aria-label="Shareable challenge link" readOnly value={shareUrl} onFocus={(event) => event.currentTarget.select()} />}</section>
}
