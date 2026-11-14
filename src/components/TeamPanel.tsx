import { useEffect, useState } from 'react'

const roles = ['Systems lead', 'Spacecraft engineer', 'Science & comms', 'Mission planner']

export function TeamPanel({ enabled, resetKey, onToggle, onScoreChange }: {
  enabled: boolean
  resetKey: string
  onToggle: (enabled: boolean) => void
  onScoreChange: (key: string, score: number) => void
}) {
  const [names, setNames] = useState(['Pilot 1', 'Pilot 2', 'Pilot 3', 'Pilot 4'])
  const [approvals, setApprovals] = useState<boolean[]>([false, false, false, false])
  const [priorities, setPriorities] = useState<Array<'science' | 'reserve'>>(['science', 'science', 'science', 'science'])
  const [compromise, setCompromise] = useState('')
  const hasConflict = priorities.includes('science') && priorities.includes('reserve')
  const score = Math.min(100, approvals.filter(Boolean).length * 15 + (compromise ? 25 : 0) + (hasConflict && compromise ? 15 : 0))
  useEffect(() => { onScoreChange(resetKey, score) }, [resetKey, score, onScoreChange])

  return <section className="panel team-panel" aria-labelledby="team-panel-title">
    <div className="section-heading"><div><p className="eyebrow">PASS-AND-PLAY · UP TO FOUR PILOTS</p><h2 id="team-panel-title">Crew review</h2></div><label className="team-mode-toggle"><input type="checkbox" checked={enabled} onChange={(event) => onToggle(event.currentTarget.checked)} /> Enable team mode</label></div>
    <p className="why-intro">Hand off the same device. Each role reviews the shared plan and records approval before launch.</p>
    {enabled && <>
      <div className="crew-grid">{roles.map((role, index) => <div className="crew-role" key={role}><label htmlFor={`crew-${index}`}>{role}</label><input id={`crew-${index}`} value={names[index]} maxLength={24} onChange={(event) => setNames((current) => current.map((name, item) => item === index ? event.currentTarget.value : name))} /><label className="priority-label" htmlFor={`priority-${index}`}>Initial priority</label><select id={`priority-${index}`} value={priorities[index]} onChange={(event) => setPriorities((current) => current.map((priority, item) => item === index ? event.currentTarget.value as 'science' | 'reserve' : priority))}><option value="science">Protect science return</option><option value="reserve">Protect resource reserves</option></select><button className="secondary-button" type="button" aria-pressed={approvals[index]} onClick={() => setApprovals((current) => current.map((approved, item) => item === index ? !approved : approved))}>{approvals[index] ? 'Approved ✓' : 'Approve plan'}</button></div>)}</div>
      <fieldset className="consensus-field"><legend>Record the crew’s trade-off agreement</legend><label><input type="radio" name="consensus" value="science" checked={compromise === 'science'} onChange={() => setCompromise('science')} /> Protect science return, accepting a tighter power margin</label><label><input type="radio" name="consensus" value="reserve" checked={compromise === 'reserve'} onChange={() => setCompromise('reserve')} /> Protect resource reserves, reducing instrument activity</label></fieldset>
      <p className="team-score-note" role="status">{approvals.filter(Boolean).length}/4 role approvals · {hasConflict ? 'different priorities surfaced' : 'crew priorities align'} · {compromise ? `shared resolution recorded${hasConflict ? ' (+ conflict-resolution credit)' : ''}` : 'trade-off agreement needed'} · collaboration score {score}/100</p>
    </>}
  </section>
}
