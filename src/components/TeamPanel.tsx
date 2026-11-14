import { useEffect, useState } from 'react'
import type { DesignEvaluation } from '../engine/types.ts'

const roles = ['Systems lead', 'Spacecraft engineer', 'Science & comms', 'Mission planner']

export function TeamPanel({ enabled, resetKey, evaluation, onToggle, onScoreChange }: {
  enabled: boolean
  resetKey: string
  evaluation: DesignEvaluation
  onToggle: (enabled: boolean) => void
  onScoreChange: (key: string, score: number, approvals: number, hasTradeoff: boolean) => void
}) {
  const [approvals, setApprovals] = useState<boolean[]>([false, false, false, false])
  const [priorities, setPriorities] = useState<Array<'science' | 'reserve'>>(['science', 'science', 'science', 'science'])
  const [compromise, setCompromise] = useState('')
  const hasConflict = priorities.includes('science') && priorities.includes('reserve')
  const score = Math.min(100, approvals.filter(Boolean).length * 15 + (compromise ? 25 : 0) + (hasConflict && compromise ? 15 : 0))
  const ratio = (used: number, limit: number) => Math.min(100, Math.round(used / Math.max(1, limit) * 100))
  const roleReadouts = [
    { label: 'Budget', value: `$${evaluation.costMillionUsd} / $${evaluation.budgetMillionUsd}M`, fill: ratio(evaluation.costMillionUsd, evaluation.budgetMillionUsd), over: evaluation.costMillionUsd > evaluation.budgetMillionUsd },
    { label: 'Power · battery', value: `${evaluation.powerW}/${evaluation.powerAvailableW} W · ${evaluation.eclipseEnergyRequiredWh}/${evaluation.batteryCapacityWh} Wh`, fill: Math.max(ratio(evaluation.powerW, evaluation.powerAvailableW), ratio(evaluation.eclipseEnergyRequiredWh, evaluation.batteryCapacityWh)), over: evaluation.powerW > evaluation.powerAvailableW || evaluation.eclipseEnergyRequiredWh > evaluation.batteryCapacityWh },
    { label: 'Data · science', value: `${evaluation.dataGbPerDay}/${evaluation.dataLimitGbPerDay} GB/day · ${evaluation.scienceValue} pts`, fill: ratio(evaluation.dataGbPerDay, evaluation.dataLimitGbPerDay), over: evaluation.dataGbPerDay > evaluation.dataLimitGbPerDay },
    { label: 'Schedule', value: `${evaluation.scheduleDurationDays}/${evaluation.missionDeadlineDays} days · ${evaluation.orbitPeriodMinutes} min/orbit`, fill: ratio(evaluation.scheduleDurationDays, evaluation.missionDeadlineDays), over: evaluation.scheduleDurationDays > evaluation.missionDeadlineDays },
  ]
  useEffect(() => { onScoreChange(resetKey, score, approvals.filter(Boolean).length, Boolean(compromise)) }, [resetKey, score, approvals, compromise, onScoreChange])

  return <section className="panel team-panel" id="crew-review" aria-labelledby="team-panel-title">
    <div className="section-heading"><div><p className="eyebrow">PASS-AND-PLAY · UP TO FOUR PILOTS</p><h2 id="team-panel-title">Crew review</h2></div><label className="team-mode-toggle"><input type="checkbox" checked={enabled} onChange={(event) => onToggle(event.currentTarget.checked)} /> Enable team mode</label></div>
    <p className="why-intro">Pass the device. Approve together.</p>
    {enabled && <>
      <div className="crew-grid">{roles.map((role, index) => { const readout = roleReadouts[index]; return <div className="crew-role" key={role}><b>{role}</b><div className="crew-limit"><span><small>{readout.label}</small><strong className={readout.over ? 'is-over' : ''}>{readout.value}</strong></span><i><em className={readout.over ? 'is-over' : ''} style={{ width: `${readout.fill}%` }} /></i></div><label className="priority-label" htmlFor={`priority-${index}`}>Priority</label><select id={`priority-${index}`} value={priorities[index]} onChange={(event) => setPriorities((current) => current.map((priority, item) => item === index ? event.currentTarget.value as 'science' | 'reserve' : priority))}><option value="science">Science return</option><option value="reserve">Resource reserves</option></select><button className="secondary-button" type="button" aria-pressed={approvals[index]} onClick={() => setApprovals((current) => current.map((approved, item) => item === index ? !approved : approved))}>{approvals[index] ? 'Approved ✓' : 'Approve'}</button></div> })}</div>
      <fieldset className="consensus-field"><legend>Choose crew trade-off</legend><label><input type="radio" name="consensus" value="science" checked={compromise === 'science'} onChange={() => setCompromise('science')} /> Prioritize science</label><label><input type="radio" name="consensus" value="reserve" checked={compromise === 'reserve'} onChange={() => setCompromise('reserve')} /> Protect reserves</label></fieldset>
      <p className="team-score-note" role="status">{approvals.filter(Boolean).length}/4 approved · {hasConflict ? 'Priorities differ' : 'Priorities align'} · {compromise ? 'Trade-off set' : 'Choose a trade-off'} · Crew score {score}</p>
    </>}
  </section>
}
