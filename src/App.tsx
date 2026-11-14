import { useCallback, useEffect, useRef, useState } from 'react'
import { FirstMissionGuide } from './components/FirstMissionGuide.tsx'
import { DesignLibraryPanel } from './components/DesignLibraryPanel.tsx'
import { LandingPage } from './components/LandingPage.tsx'
import { OrbitDiagram } from './components/OrbitDiagram.tsx'
import { MissionLearningCards } from './components/MissionLearningCards.tsx'
import { LocalLeaderboard } from './components/LocalLeaderboard.tsx'
import { TeamPanel } from './components/TeamPanel.tsx'
import { OnlineCrewRoom } from './components/OnlineCrewRoom.tsx'
import { TermTip } from './components/TermTip.tsx'
import { launchVehicles, parts, propulsionSystems, scenarios } from './data/catalog.ts'
import type { GlossaryTerm } from './data/glossary.ts'
import { evaluateDesign } from './engine/evaluateDesign.ts'
import { calculateOrbitPeriodMinutes } from './engine/orbit.ts'
import { simulateMission } from './engine/simulateMission.ts'
import type { DesignEvaluation, MissionDesign, MissionSimulation, Reason } from './engine/types.ts'
import { useMissionStore } from './store.ts'
import { readSharedDesign } from './utils/designLibrary.ts'
import { recordLocalScore, updateLatestLocalScore } from './utils/leaderboardStorage.ts'
import { rememberGuideCompleted } from './utils/guideStorage.ts'

const scenarioArtwork: Record<string, string> = {
  'earth-observer': '/assets/mission-earth.svg',
  'moon-mapper': '/assets/mission-moon.svg',
  'mars-scout': '/assets/mission-mars.svg',
  'venus-cloud-watcher': '/assets/mission-venus.svg',
}

function Metric({
  label,
  unit,
  current,
  limit,
  display,
  help,
  extraHelp,
}: {
  label: string
  unit: string
  current: number
  limit: number
  display: string
  help: GlossaryTerm
  extraHelp?: GlossaryTerm
}) {
  const percent = limit > 0 ? Math.min((current / limit) * 100, 100) : 0
  const overLimit = current > limit

  return (
    <div className="metric">
      <div className="metric-heading">
        <span className="metric-label">{label}<TermTip term={help} align="end" />{extraHelp && <TermTip term={extraHelp} align="end" />}</span>
        <strong className={overLimit ? 'metric-value is-over' : 'metric-value'}>
          {display}<small> {unit}</small>
        </strong>
      </div>
      <div
        className="meter-track"
        role="progressbar"
        aria-label={`${label} used`}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={Math.min(current, limit)}
      >
        <span
          className={overLimit ? 'meter-fill is-over' : 'meter-fill'}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="metric-limit">Limit {limit.toLocaleString()} {unit}</p>
    </div>
  )
}

function ReasonCard({ reason }: { reason: Reason }) {
  const label = reason.status === 'ok' ? 'On track' : reason.status === 'warn' ? 'Watch' : 'Over limit'
  return (
    <details className={`reason-card reason-${reason.status}`}>
      <summary className="reason-title">
        <span className="reason-dot" aria-hidden="true" />
        <h3>{reason.id.replace('-', ' ')}</h3>
        <span className="reason-label">{label}</span>
      </summary>
      <div className="reason-body">
        <p>{reason.cause}</p>
        <div className="reason-detail"><b>Effect</b><span>{reason.effect}</span></div>
        <div className="reason-detail"><b>Next move</b><span>{reason.fix}</span></div>
      </div>
    </details>
  )
}

function estimateRadiationRisk(bodyId: string, altitudeKm: number) {
  const baselineByBody: Record<string, number> = { earth: 12, moon: 24, mars: 30, venus: 26 }
  return Math.min(90, Math.round((baselineByBody[bodyId] ?? 20) + altitudeKm / 45))
}

function getLaunchBlockers(evaluation: DesignEvaluation, design: MissionDesign, teamScore: number, approvals: number, hasTradeoff: boolean) {
  const blockedChecks = design.playMode === 'sandbox' ? [] : evaluation.reasons.filter((reason) => reason.status === 'fail')
  const blockers = blockedChecks.map((reason) => ({
    label: reason.id.split('-').map((part) => part[0]?.toUpperCase() + part.slice(1)).join(' '),
    instruction: reason.fix,
    crew: false,
  }))
  if (design.teamMode && teamScore < 85) {
    const steps = [
      ...(approvals < 4 ? [`${approvals}/4 roles approved; approve each role.`] : []),
      ...(!hasTradeoff ? ['Choose a crew trade-off.'] : []),
    ]
    blockers.push({ label: 'Crew approval', instruction: steps.join(' '), crew: true })
  }
  return blockers
}

function LaunchGuidance({ id, blockers, onOpenCrew }: { id: string; blockers: ReturnType<typeof getLaunchBlockers>; onOpenCrew: () => void }) {
  if (!blockers.length) return null
  return <div id={id} className="launch-guidance" role="status" aria-live="polite"><b>Launch locked</b><ul>{blockers.map((item) => <li key={item.label}><strong>{item.label}:</strong> {item.instruction}</li>)}</ul>{blockers.some((item) => item.crew) && <button type="button" className="text-button" onClick={onOpenCrew}>Open crew review ↓</button>}</div>
}

function FlightSequence({ result, evaluation, scenario, step, fuelMassKg, onAdvance, onSkip }: {
  result: MissionSimulation
  evaluation: DesignEvaluation
  scenario: (typeof scenarios)[number]
  step: number
  fuelMassKg: number
  onAdvance: () => void
  onSkip: () => void
}) {
  const event = result.timeline[step]
  const isLastStep = step >= result.timeline.length - 1
  const downlinkStep = result.timeline.findIndex((item) => item.phase.includes('DOWNLINK'))
  const returnedSoFarGb = downlinkStep >= 0 && step >= downlinkStep ? result.returnedGb : 0
  const powerUsePercent = Math.min(100, Math.round(evaluation.powerW / Math.max(1, evaluation.powerAvailableW) * 100))
  const batteryUsePercent = Math.min(100, Math.round(evaluation.eclipseEnergyRequiredWh / Math.max(1, evaluation.batteryCapacityWh) * 100))
  const dataReturnPercent = Math.min(100, Math.round(returnedSoFarGb / Math.max(1, result.collectedGb) * 100))
  const fuelLoadPercent = Math.min(100, Math.round(fuelMassKg / Math.max(1, evaluation.maxPropellantKg) * 100))

  return (
    <section className="flight-sequence" aria-labelledby="flight-title">
      <div className="flight-hud"><span>FLIGHT COMPUTER <i>● LIVE</i></span><span>{scenario.name.toUpperCase()}</span></div>
      <div className="flight-scene" aria-hidden="true">
        <div className="flight-nebula" />
        <div className="flight-planet"><span /></div>
        <div className="flight-orbit"><b /></div>
        <img src="/assets/orbiter-illustration.svg" alt="" className="flight-craft" />
        <span className="flight-scene-label">{evaluation.orbitAltitudeKm} KM ORBIT</span>
      </div>
      <div className="flight-phase-row"><span>PHASE {String(step + 1).padStart(2, '0')} / {String(result.timeline.length).padStart(2, '0')}</span><div role="progressbar" aria-label="Flight progress" aria-valuemin={0} aria-valuemax={result.timeline.length} aria-valuenow={step + 1}><i style={{ width: `${((step + 1) / result.timeline.length) * 100}%` }} /></div><span>{Math.round(((step + 1) / result.timeline.length) * 100)}%</span></div>
      <div className={`flight-event-card flight-${event.status}`} key={`${event.phase}-${step}`}>
        <span className="flight-event-icon" aria-hidden="true">{event.status === 'ok' ? '✓' : event.status === 'warn' ? '!' : '×'}</span>
        <div><small>{event.phase}</small><h1 id="flight-title">{event.title}</h1><p>{event.detail}</p></div>
      </div>
      <div className="flight-telemetry" aria-label="Live mission telemetry">
        <div><small>POWER LOAD</small><b>{evaluation.powerW}<i> W</i></b><span className="telemetry-track"><i style={{ width: `${powerUsePercent}%` }} /></span></div>
        <div><small>ECLIPSE BATTERY</small><b>{evaluation.eclipseEnergyRequiredWh}<i> Wh</i></b><span className="telemetry-track"><i style={{ width: `${batteryUsePercent}%` }} /></span></div>
        <div><small>DATA RETURN</small><b>{returnedSoFarGb.toFixed(1)}<i> GB</i></b><span className="telemetry-track"><i style={{ width: `${dataReturnPercent}%` }} /></span></div>
        <div><small>FUEL LOAD</small><b>{fuelMassKg}<i> kg</i></b><span className="telemetry-track"><i style={{ width: `${fuelLoadPercent}%` }} /></span></div>
      </div>
      <div className="flight-controls"><button className="flight-skip" type="button" onClick={onSkip}>Skip to debrief</button><button className="launch-button flight-advance" type="button" onClick={onAdvance}>{isLastStep ? 'View mission debrief' : 'Next flight phase'} <span aria-hidden="true">→</span></button></div>
    </section>
  )
}

const learningChecks = [
  { prompt: 'What limits data sent home?', answers: ['Panel size', 'Downlink × contact time', 'Fuel load'], correct: 1, explain: 'The link and time in contact set the return limit.' },
  { prompt: 'What keeps systems alive in eclipse?', answers: ['Battery', 'Antenna', 'Solar array'], correct: 0, explain: 'Stored battery energy bridges the shadow period.' },
  { prompt: 'Why does extra propellant raise launch mass?', answers: ['It adds spacecraft mass', 'It lowers orbit', 'It reduces power'], correct: 0, explain: 'The launcher must lift the propellant too.' },
] as const

function LearningCheck({ seed, bonus, onAnswer }: { seed: number; bonus: number; onAnswer: (correct: boolean) => void }) {
  const question = learningChecks[Math.abs(seed) % learningChecks.length]
  const [choice, setChoice] = useState<number | null>(null)
  const answeredCorrectly = choice === question.correct

  return (
    <section className="panel learning-check" aria-labelledby="learning-check-title">
      <div className="learning-check-heading"><span aria-hidden="true">✦</span><div><small>FLIGHT CHECK</small><h2 id="learning-check-title">{question.prompt}</h2></div></div>
      <div className="learning-check-answers" role="group" aria-label="Choose your answer">
        {question.answers.map((answer, index) => <button key={answer} type="button" disabled={choice !== null} aria-pressed={choice === index} className={choice === index && !answeredCorrectly ? 'answer-wrong' : choice !== null && index === question.correct ? 'answer-correct' : ''} onClick={() => { setChoice(index); onAnswer(index === question.correct) }}>{answer}</button>)}
      </div>
      {choice !== null && <p className={`learning-check-feedback ${answeredCorrectly ? 'is-correct' : 'is-wrong'}`} role="status">{answeredCorrectly ? `Correct · ${bonus ? `+${bonus} learning` : 'learning score maxed'}` : `Not quite · ${question.explain}`}</p>}
    </section>
  )
}

function DesignSummary({ evaluation }: { evaluation: DesignEvaluation }) {
  return (
    <section className="panel summary-panel" aria-labelledby="summary-title">
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        Design updated. Spacecraft mass {evaluation.massKg} of {evaluation.launchCapacityKg} kilograms including propellant. Delta-v {evaluation.deltaVMps} of {evaluation.requiredDeltaVMps} meters per second. Total schedule {evaluation.scheduleDurationDays} of {evaluation.missionDeadlineDays} days, including {evaluation.developmentDurationDays} days of development and {evaluation.missionDurationDays} days of operations. Power use {evaluation.powerW} of {evaluation.powerAvailableW} watts. Eclipse battery {evaluation.eclipseEnergyRequiredWh} of {evaluation.batteryCapacityWh} watt hours. Cost {evaluation.costMillionUsd} of {evaluation.budgetMillionUsd} million dollars. Data collected {evaluation.dataGbPerDay} of {evaluation.dataLimitGbPerDay} gigabytes per day. Estimated mission reliability {evaluation.reliabilityPercent} percent and thermal risk {evaluation.thermalRiskPercent} percent.
      </p>
      <div className="section-heading">
        <div>
          <p className="eyebrow">LIVE DESIGN CHECK</p>
          <h2 id="summary-title">Mission resources</h2>
        </div>
        <span className="live-indicator"><i /> Updating live</span>
      </div>
      <div className="metric-grid">
        <Metric label="Spacecraft mass" current={evaluation.massKg} limit={evaluation.launchCapacityKg} unit="kg" display={evaluation.massKg.toLocaleString()} help="Spacecraft mass" />
        <Metric label="Power demand" current={evaluation.powerW} limit={evaluation.powerAvailableW} unit="W" display={evaluation.powerW.toLocaleString()} help="Power demand" />
        <Metric label="Mission cost" current={evaluation.costMillionUsd} limit={evaluation.budgetMillionUsd} unit="M USD" display={`$${evaluation.costMillionUsd}`} help="Mission cost" />
        <Metric label="Delta-v" current={evaluation.deltaVMps} limit={evaluation.requiredDeltaVMps} unit="m/s" display={evaluation.deltaVMps.toLocaleString()} help="Delta-v" />
      </div>
      <details className="advanced-gauges">
        <summary>More mission stats <span aria-hidden="true">+</span></summary>
        <div className="metric-grid">
          <Metric label="Eclipse battery" current={evaluation.eclipseEnergyRequiredWh} limit={evaluation.batteryCapacityWh} unit="Wh" display={evaluation.eclipseEnergyRequiredWh.toLocaleString()} help="Eclipse battery" />
          <Metric label="Daily data" current={evaluation.dataGbPerDay} limit={evaluation.dataLimitGbPerDay} unit="GB/day" display={`${evaluation.dataGbPerDay}`} help="Daily data" extraHelp="Downlink" />
          <Metric label="Mission schedule" current={evaluation.scheduleDurationDays} limit={evaluation.missionDeadlineDays} unit="days" display={`${evaluation.scheduleDurationDays}`} help="Mission time" />
        </div>
      </details>
      <div className="risk-summary" aria-label="Estimated system risk">
        <div className="risk-heading"><span>Estimated mission reliability<TermTip term="Mission reliability" /></span><strong>{evaluation.reliabilityPercent}%</strong></div>
        <div className="risk-track" role="progressbar" aria-label="Estimated mission reliability" aria-valuemin={0} aria-valuemax={100} aria-valuenow={evaluation.reliabilityPercent}>
          <span className={evaluation.reliabilityPercent < 80 ? 'risk-fill is-watch' : 'risk-fill'} style={{ width: `${evaluation.reliabilityPercent}%` }} />
        </div>
        <p>{evaluation.thermalRiskPercent}% thermal-stress risk<TermTip term="Thermal risk" /> · game estimate.</p>
      </div>
      <div className="science-score">
        <span>Science potential<TermTip term="Science potential" /></span>
        <strong>{evaluation.scienceValue}<small> pts</small></strong>
        <span className="score-hint">from selected instruments</span>
      </div>
      <div className="orbit-summary"><span>{evaluation.orbitAltitudeKm} km orbit</span><b>{evaluation.orbitPeriodMinutes} min</b><small>period</small></div>
    </section>
  )
}

function MissionReport({ result, design, onEdit, onAnotherFlight, onLearningAnswer }: { result: MissionSimulation; design: MissionDesign; onEdit: () => void; onAnotherFlight: () => void; onLearningAnswer: (correct: boolean) => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const scoreParts = [
    ['Science return', result.scienceScore],
    ['Efficiency', result.efficiencyScore],
    ['Reliability', result.reliabilityScore],
    ['Learning', result.learningScore],
    ...(result.collaborationScore > 0 ? [['Collaboration', result.collaborationScore] as const] : []),
  ] as const
  const reportReasons = result.reasons.filter((reason) => reason.status !== 'ok')

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <section className="mission-report">
      <div className="page-intro report-intro">
        <div>
          <p className="eyebrow">MISSION CONTROL <span> / </span> FLIGHT REPORT</p>
          <h1 ref={headingRef} tabIndex={-1}>{result.success ? 'Mission complete' : 'Mission needs a redesign'}<span className="title-period">.</span></h1>
          <p className="intro-copy">{result.returnedGb.toFixed(1)} GB returned over {result.missionDurationDays} mission days.</p>
        </div>
        <div className="grade-badge"><strong>{result.grade}</strong><span>MISSION<br />GRADE</span></div>
      </div>

      <section className="panel mission-score-panel">
      <div className="score-total"><span>{result.playMode === 'sandbox' ? 'PRACTICE SCORE' : 'FINAL SCORE'}</span><strong>{result.score}</strong><small>{result.playMode === 'sandbox' ? 'unranked · out of 100' : 'out of 100'}</small></div>
      <div className="score-breakdown">
        <div className="section-heading"><div><p className="eyebrow">HOW THE MISSION SCORED</p><h2>Score breakdown</h2></div><span className="seed-label">{result.difficulty.toUpperCase()} · SEED {result.seed}<TermTip term="Seed" align="end" /></span></div>
          <div className="score-items">{scoreParts.map(([label, score]) => <div className="score-item" key={label}><span>{label}</span><b>{score}<small> / 100</small></b><i><em style={{ width: `${score}%` }} /></i></div>)}</div>
        </div>
      </section>
      <LearningCheck seed={result.seed} bonus={Math.min(10, 100 - result.learningScore)} onAnswer={onLearningAnswer} />
      {result.achievements.length > 0 && <section className="panel achievement-panel" aria-label="Achievements earned"><p className="eyebrow">FLIGHT AWARDS</p><div>{result.achievements.map((achievement) => <span className="achievement-badge" key={achievement}>✦ {achievement}</span>)}</div></section>}
      <LocalLeaderboard design={design} result={result} />

      <div className="report-columns">
        <section className="panel timeline-panel">
          <div className="section-heading"><div><p className="eyebrow">SEE WHAT HAPPENED</p><h2>Flight timeline</h2></div><span className="parts-count">{result.timeline.length} MISSION PHASES</span></div>
          <ol className="flight-timeline">{result.timeline.map((event, index) => <li className={`flight-event flight-${event.status}`} key={`${event.phase}-${index}`}><span className="timeline-marker">{event.status === 'ok' ? '✓' : event.status === 'warn' ? '!' : '×'}</span><div><small>{event.phase}</small><h3>{event.title}{event.title.includes('Solar flare') && <TermTip term="Solar flare" />}{event.title.includes('Thermal system anomaly') && <TermTip term="Safe mode" />}</h3><p>{event.detail}</p></div></li>)}</ol>
        </section>
        <section className="panel report-reasons">
          <div className="section-heading"><div><p className="eyebrow">THE WHY ENGINE</p><h2>What to learn</h2></div><span className="reason-count">{reportReasons.length || 'ALL'}<small>{reportReasons.length ? 'TO REVIEW' : 'CLEAR'}</small></span></div>
          {reportReasons.length > 0 ? <div className="reason-list">{reportReasons.map((reason) => <ReasonCard reason={reason} key={reason.id} />)}</div> : <div className="all-clear"><span>✦</span><b>All design checks are clear.</b><p>Try a different instrument mix to explore another trade-off.</p></div>}
        </section>
      </div>
      <div className="report-actions"><p>Seed {result.seed} keeps this flight reproducible.</p><button className="secondary-button" type="button" onClick={() => window.print()}>Print / save report as PDF</button><button className="secondary-button" type="button" onClick={onAnotherFlight}>Fly again · new conditions</button><button className="launch-button edit-button" type="button" onClick={onEdit}>← Improve this design</button></div>
    </section>
  )
}

export default function App() {
  const [screen, setScreen] = useState<'landing' | 'designer'>('landing')
  const [missionResult, setMissionResult] = useState<MissionSimulation | null>(null)
  const [flightStep, setFlightStep] = useState<number | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [runSeed, setRunSeed] = useState(() => readSharedDesign(window.location.search)?.seed ?? 2026)
  const [teamScore, setTeamScore] = useState({ key: '', score: 0, approvals: 0, hasTradeoff: false })
  const reportWasOpen = useRef(false)
  const missionToolsRef = useRef<HTMLDetailsElement>(null)
  const design = useMissionStore((state) => state.design)
  const selectScenario = useMissionStore((state) => state.selectScenario)
  const selectBus = useMissionStore((state) => state.selectBus)
  const selectLaunchVehicle = useMissionStore((state) => state.selectLaunchVehicle)
  const selectOrbit = useMissionStore((state) => state.selectOrbit)
  const selectPropulsionSystem = useMissionStore((state) => state.selectPropulsionSystem)
  const setPropellantMass = useMissionStore((state) => state.setPropellantMass)
  const setMissionDuration = useMissionStore((state) => state.setMissionDuration)
  const setDevelopmentDuration = useMissionStore((state) => state.setDevelopmentDuration)
  const setSolarPanelArea = useMissionStore((state) => state.setSolarPanelArea)
  const selectDifficulty = useMissionStore((state) => state.selectDifficulty)
  const selectPlayMode = useMissionStore((state) => state.selectPlayMode)
  const setTeamMode = useMissionStore((state) => state.setTeamMode)
  const toggleInstrument = useMissionStore((state) => state.toggleInstrument)
  const replaceDesign = useMissionStore((state) => state.replaceDesign)
  const handleOnlineDesign = useCallback((next: MissionDesign) => replaceDesign(next), [replaceDesign])
  const scenario = scenarios.find((item) => item.id === design.scenarioId) ?? scenarios[0]
  const orbit = scenario.orbits.find((item) => item.id === design.orbitId) ?? scenario.orbits[0]
  const launchVehicle = launchVehicles.find((item) => item.id === design.launchVehicleId) ?? launchVehicles[0]
  const propulsion = propulsionSystems.find((item) => item.id === design.propulsionId) ?? propulsionSystems[0]
  const bus = parts.find((part) => part.id === design.busId)
  const buses = parts.filter((part) => part.category === 'bus')
  const instruments = parts.filter((part) => part.category === 'instrument')
  const evaluation = evaluateDesign(design, scenario, parts, launchVehicles, propulsionSystems)
  const selectedCount = design.instrumentIds.length
  const designIssues = evaluation.reasons.filter((reason) => reason.status !== 'ok')
  const hardChecksClear = !evaluation.reasons.some((reason) => reason.status === 'fail')
  const handleTeamScoreChange = useCallback((key: string, score: number, approvals: number, hasTradeoff: boolean) => setTeamScore({ key, score, approvals, hasTradeoff }), [])
  const designKey = JSON.stringify(design)
  const currentTeamScore = teamScore.key === designKey ? teamScore.score : 0
  const currentApprovals = teamScore.key === designKey ? teamScore.approvals : 0
  const hasTeamTradeoff = teamScore.key === designKey && teamScore.hasTradeoff
  const canLaunch = (hardChecksClear || design.playMode === 'sandbox') && (!design.teamMode || currentTeamScore >= 85)
  const launchBlockers = getLaunchBlockers(evaluation, design, currentTeamScore, currentApprovals, hasTeamTradeoff)

  function openCrewReview() {
    if (missionToolsRef.current) missionToolsRef.current.open = true
    document.getElementById('crew-review')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  function launchMission(seed = runSeed) {
    const result = simulateMission(design, scenario, parts, launchVehicles, propulsionSystems, seed, currentTeamScore)
    setMissionResult(result)
    setFlightStep(0)
    recordLocalScore(result)
    if (soundEnabled) {
      const launchCue = new Audio('/assets/launch-cue.wav')
      launchCue.volume = 0.3
      void launchCue.play().catch(() => undefined)
    }
  }

  function launchAnotherFlight() {
    const nextSeed = runSeed + 1
    setRunSeed(nextSeed)
    launchMission(nextSeed)
  }

  function recordLearningAnswer(correct: boolean) {
    if (!correct || !missionResult) return
    const bonus = Math.min(10, 100 - missionResult.learningScore)
    if (bonus <= 0) return
    const learningScore = missionResult.learningScore + bonus
    const scoreWeight = missionResult.collaborationScore > 0 ? 0.135 : 0.15
    const score = Math.min(100, Math.round(missionResult.score + bonus * scoreWeight))
    const updatedResult: MissionSimulation = {
      ...missionResult,
      learningScore,
      score,
      grade: score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : 'D',
    }
    setMissionResult(updatedResult)
    updateLatestLocalScore(updatedResult)
  }

  useEffect(() => {
    const shared = readSharedDesign(window.location.search)
    if (shared) {
      replaceDesign(shared.design)
      window.history.replaceState({}, '', `${window.location.pathname}${window.location.hash}`)
    }
  }, [replaceDesign])

  function dismissGuide() {
    rememberGuideCompleted()
    setGuideOpen(false)
  }

  function toggleGuide() {
    if (guideOpen) dismissGuide()
    else setGuideOpen(true)
  }

  useEffect(() => {
    if (missionResult) reportWasOpen.current = true
    else if (screen === 'designer') {
      document.getElementById('design-title')?.focus()
      reportWasOpen.current = false
    }
  }, [missionResult, screen])

  if (screen === 'landing') {
    return <LandingPage
      scenarios={scenarios}
      selectedScenarioId={scenario.id}
      onSelectScenario={selectScenario}
      onStart={() => setScreen('designer')}
    />
  }

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to mission design</a>
      <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#landing-top" aria-label="Galaxy Run home" onClick={(event) => { event.preventDefault(); setMissionResult(null); setScreen('landing') }}>
          <span className="brand-mark" aria-hidden="true"><img src="/assets/galaxy-run-mark.svg" width="34" height="34" alt="" decoding="async" /></span>
          <span>GALAXY<span className="brand-light"> RUN</span></span>
        </a>
        <div className="topbar-right">{!missionResult && <><button className="home-toggle" type="button" onClick={() => setScreen('landing')}>Mission brief</button><button className="guide-toggle" type="button" onClick={toggleGuide} aria-expanded={guideOpen}>{guideOpen ? 'Hide guide' : 'Flight guide'}</button></>}<button className={`sound-toggle ${soundEnabled ? 'is-on' : ''}`} type="button" onClick={() => setSoundEnabled((enabled) => !enabled)} aria-pressed={soundEnabled} aria-label={`SFX ${soundEnabled ? 'ON' : 'OFF'}, sound effects ${soundEnabled ? 'enabled' : 'disabled'}`}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6l-5 4H4Z" /><path d="M16 9.5a4 4 0 0 1 0 5M18.5 7a7.5 7.5 0 0 1 0 10" /></svg><span>SFX {soundEnabled ? 'ON' : 'OFF'}</span></button><span className="pilot-badge">LOCAL PILOT</span></div>
      </header>

      <main id="main-content" tabIndex={-1}>
      {missionResult ? flightStep !== null
        ? <FlightSequence result={missionResult} evaluation={evaluation} scenario={scenario} step={flightStep} fuelMassKg={design.propellantMassKg} onAdvance={() => setFlightStep((current) => current !== null && current < missionResult.timeline.length - 1 ? current + 1 : null)} onSkip={() => setFlightStep(null)} />
        : <MissionReport result={missionResult} design={design} onEdit={() => { setMissionResult(null); setFlightStep(null) }} onAnotherFlight={launchAnotherFlight} onLearningAnswer={recordLearningAnswer} />
        : <>
      <section className="page-intro" id="top">
        <div>
          <p className="eyebrow">MISSION CONTROL <span> / </span> DESIGN LAB</p>
          <h1 id="design-title" tabIndex={-1}>Build your mission<span className="title-period">.</span></h1>
          <p className="intro-copy">Pick a target. Build your craft. Launch the run.</p>
        </div>
        <div className="step-status"><span className="step-number">01</span><div><b>MISSION DESIGN</b><small>Step 1 of 3</small></div><span className="step-track"><i /></span></div>
      </section>

      {guideOpen && <FirstMissionGuide onDismiss={dismissGuide} />}

      <section className="scenario-section" aria-labelledby="scenario-title">
        <div className="section-heading compact-heading">
          <div><p className="eyebrow">CHOOSE YOUR OBJECTIVE</p><h2 id="scenario-title">Select a mission</h2></div>
          <span className="selection-note">{scenario.destination} <span aria-hidden="true">↗</span></span>
        </div>
        <div className="scenario-grid">
      {scenarios.map((item, index) => (
            <button key={item.id} className={`scenario-card ${item.id === scenario.id ? 'is-selected' : ''}`} onClick={() => selectScenario(item.id)} aria-pressed={item.id === scenario.id}>
              <span className="scenario-art" aria-hidden="true"><img src={scenarioArtwork[item.id]} width="120" height="96" alt="" decoding="async" /></span>
              <span className="scenario-copy"><span className="scenario-kicker">{`${String(index + 1).padStart(2, '0')} / ${item.bodyId.toUpperCase()} EXPLORATION`}</span><strong>{item.name}</strong><small>{item.destination}</small></span>
              <span className="selection-check" aria-hidden="true">✓</span>
            </button>
          ))}
        </div>
        <p className="objective-line"><span className="objective-icon" aria-hidden="true">◎</span><span><b>Mission objective</b>{scenario.objective}</span><span className="orbit-pill">{orbit.name} · {orbit.altitudeKm} km</span></p>
      </section>

      <section className="difficulty-row" aria-label="Choose difficulty">
        <div className="difficulty-copy"><p className="eyebrow">MISSION MODE</p><strong>Set your challenge</strong></div>
        <div className="difficulty-options">
          <button type="button" className={`difficulty-option ${design.difficulty === 'easy' ? 'is-selected' : ''}`} onClick={() => selectDifficulty('easy')} aria-pressed={design.difficulty === 'easy'}>
            <b>Easy</b><small>Wider budgets · fewer events</small>
          </button>
          <button type="button" className={`difficulty-option ${design.difficulty === 'normal' ? 'is-selected' : ''}`} onClick={() => selectDifficulty('normal')} aria-pressed={design.difficulty === 'normal'}>
            <b>Normal</b><small>Baseline limits · more events</small>
          </button>
          <button type="button" className={`difficulty-option ${design.difficulty === 'hard' ? 'is-selected' : ''}`} onClick={() => selectDifficulty('hard')} aria-pressed={design.difficulty === 'hard'}>
            <b>Hard</b><small>Tighter budget · hidden risks</small>
          </button>
        </div>
      </section>
      <div className="play-mode-row"><label htmlFor="play-mode">Flight mode</label><select id="play-mode" value={design.playMode} onChange={(event) => selectPlayMode(event.currentTarget.value as 'mission' | 'sandbox')}><option value="mission">Mission — limits apply</option><option value="sandbox">Sandbox — explore freely</option></select><p>{design.playMode === 'sandbox' ? 'Launch freely. Scores stay unranked.' : 'Limits must be clear to launch.'}</p></div>
      {design.difficulty === 'easy' && <p className="mode-hint"><span aria-hidden="true">✦</span> Coach tip: Keep some mass and power in reserve.</p>}

      <section className="quick-flight" aria-label="Quick start mission">
        <div className="quick-flight-mark" aria-hidden="true"><span>↗</span></div>
        <div className="quick-flight-copy"><span className="eyebrow">CURRENT DESIGN · QUICK LAUNCH</span><h2>{scenario.name}</h2></div>
        <button className="quick-flight-button" type="button" disabled={!canLaunch} aria-describedby={launchBlockers.length ? 'quick-flight-help' : undefined} onClick={() => launchMission()}>Fly now <span aria-hidden="true">→</span></button>
        {launchBlockers.length > 0 && <div className="quick-flight-guidance"><LaunchGuidance id="quick-flight-help" blockers={launchBlockers} onOpenCrew={openCrewReview} /></div>}
      </section>

      <div className="design-layout">
        <section className="panel hardware-panel" aria-labelledby="hardware-title">
          <div className="section-heading">
            <div><p className="eyebrow">SPACECRAFT CONFIGURATION</p><h2 id="hardware-title">Build the craft</h2></div>
            <span className="parts-count">{selectedCount} instruments selected</span>
          </div>

          <div className="subsection-heading"><span className="subsection-index">01</span><div><h3>Spacecraft bus</h3><p>The platform that powers and carries your payload.</p></div><TermTip term="Spacecraft bus" /></div>
          <div className="bus-options">
            {buses.map((item) => (
              <button key={item.id} className={`bus-option ${item.id === design.busId ? 'is-selected' : ''}`} onClick={() => selectBus(item.id)} aria-pressed={item.id === design.busId}>
                <span className="bus-glyph" aria-hidden="true">▣</span><span className="bus-copy"><b>{item.name}</b><small>{item.description}</small><span className="part-spec">{item.massKg} kg <i>·</i> {item.powerW} W <i>·</i> ${item.costMillionUsd}M</span></span><span className="radio-dot" aria-hidden="true" />
              </button>
            ))}
          </div>

          <div className="subsection-heading instrument-heading"><span className="subsection-index">02</span><div><h3>Science instruments</h3><p>Pick the payload that answers your mission question.</p></div><TermTip term="Science instruments" /><span className="optional-label">SELECT 3–5</span></div>
          <div className="instrument-list">
            {instruments.map((item, index) => {
              const selected = design.instrumentIds.includes(item.id)
              return (
                <label key={item.id} className={`instrument-option ${selected ? 'is-selected' : ''}`}>
                  <span className={`instrument-icon instrument-icon-${index % 4}`} aria-hidden="true">{['◈', '⌁', '⌖', '⌑'][index % 4]}</span>
                  <span className="instrument-copy"><b>{item.name}</b><small>{item.description}</small><span className="part-spec">{item.massKg} kg <i>·</i> {item.powerW} W <i>·</i> +{item.scienceValue} science</span></span>
                  <input type="checkbox" checked={selected} disabled={selected ? selectedCount <= 3 : selectedCount >= 5} onChange={() => toggleInstrument(item.id)} aria-label={`Select ${item.name}`} />
                </label>
              )
            })}
          </div>

          <div className="subsection-heading instrument-heading"><span className="subsection-index">03</span><div><h3>Propulsion system</h3><p>Choose the trade-off between engine power and propellant mass.</p></div><TermTip term="Propulsion system" /><TermTip term="Chemical upper stage" /><TermTip term="Solar-electric ion drive" /></div>
          <div className="propulsion-options">
            {propulsionSystems.map((system) => {
              const selected = system.id === propulsion.id
              return (
                <button key={system.id} type="button" className={`propulsion-option ${selected ? 'is-selected' : ''}`} onClick={() => selectPropulsionSystem(system.id)} aria-pressed={selected}>
                  <span className="propulsion-icon" aria-hidden="true">{system.id === 'solar-electric-ion' ? '⊙' : '↗'}</span>
                  <span className="propulsion-copy"><b>{system.name}</b><small>{system.description}</small><span className="part-spec">{system.specificImpulseSeconds} s Isp <i>·</i> {system.dryMassKg} kg dry <i>·</i> {system.powerW} W</span></span>
                  <span className="radio-dot" aria-hidden="true" />
                </button>
              )
            })}
          </div>
          <div className="subsection-heading instrument-heading"><span className="subsection-index">04</span><div><h3>Solar array and eclipse battery</h3><p>More panel area makes power, but adds spacecraft mass and cost.</p></div></div>
          <div className="propellant-control solar-array-control">
            <label htmlFor="solar-panel-slider"><span>Solar-panel area</span><b>{evaluation.solarPanelAreaM2.toFixed(1)} m²</b></label>
            <input id="solar-panel-slider" type="range" min="0.5" max="5" step="0.1" value={evaluation.solarPanelAreaM2} onChange={(event) => setSolarPanelArea(Number(event.currentTarget.value))} aria-valuetext={`${evaluation.solarPanelAreaM2.toFixed(1)} square metres, producing ${evaluation.powerAvailableW} watts`} />
            <div className="slider-ends"><span>0.5 m²</span><span>5 m²</span></div>
            <div className="solar-array-readouts"><span>Solar output <b>{evaluation.powerAvailableW} W</b></span><span>Battery through eclipse <b>{evaluation.eclipseEnergyRequiredWh} / {evaluation.batteryCapacityWh} Wh</b></span><span>Array mass and cost <b>{evaluation.solarArrayMassKg.toFixed(1)} kg · ${evaluation.solarArrayCostMillionUsd.toFixed(1)}M</b></span></div>
            <p className="model-note">Output = panel area × sunlight at the destination × 28% assumed efficiency. Array mass, cost, and eclipse time are simplified game values.</p>
          </div>
          <div className="planning-grid">
            <div className="planning-card">
              <div className="subsection-heading instrument-heading"><span className="subsection-index">05</span><div><h3>Propellant load</h3><p>More fuel adds delta-v and launch mass at the same time.</p></div><TermTip term="Propellant" /><span className="optional-label">{evaluation.propellantMassKg} / {evaluation.maxPropellantKg} KG</span></div>
              <div className="propellant-control">
                <label htmlFor="propellant-slider"><span>Fuel mass<TermTip term="Propellant" /></span><b>{evaluation.propellantMassKg} kg</b></label>
                <input id="propellant-slider" type="range" min="0" max={evaluation.maxPropellantKg} step="1" value={evaluation.propellantMassKg} onChange={(event) => setPropellantMass(Number(event.currentTarget.value))} aria-valuetext={`${evaluation.propellantMassKg} kilograms of propellant`} />
                <div className="slider-ends"><span>0 kg</span><span>Tank limit {evaluation.maxPropellantKg} kg</span></div>
                <p className="equation-note">Δv = Isp × g₀ × ln((dry mass + propellant) / dry mass) <span className="equation-name">Rocket equation<TermTip term="Rocket equation" /></span></p>
                <p className="model-note">Game delta-v targets are simplified estimates. Thrust duration, gravity losses, and tank mass are not modeled.</p>
              </div>
            </div>

            <div className="planning-card">
              <div className="subsection-heading instrument-heading"><span className="subsection-index">06</span><div><h3>Mission schedule</h3><p>Development and operations both use the scenario’s available time.</p></div><TermTip term="Mission duration" /><span className="optional-label">{evaluation.scheduleDurationDays} / {evaluation.missionDeadlineDays} DAYS</span></div>
              <div className="mission-duration-control">
                <label className="schedule-slider-label" htmlFor="development-slider">Development time <b>{evaluation.developmentDurationDays} days</b></label>
                <input id="development-slider" type="range" min="5" max={Math.max(5, scenario.missionDeadlineDays - 30)} step="5" value={evaluation.developmentDurationDays} onChange={(event) => setDevelopmentDuration(Number(event.currentTarget.value))} aria-valuetext={`${evaluation.developmentDurationDays} development days`} />
                <div className="duration-readout"><span>Operations cost<TermTip term="Operations cost" /></span><b>${evaluation.operationsCostMillionUsd.toFixed(1)}M</b></div>
                <input type="range" min="30" max={Math.max(30, scenario.missionDeadlineDays - evaluation.developmentDurationDays)} step="1" value={evaluation.missionDurationDays} onChange={(event) => setMissionDuration(Number(event.currentTarget.value))} aria-label="Mission operations duration" aria-valuetext={`${evaluation.missionDurationDays} days, with ${evaluation.operationsCostMillionUsd.toFixed(1)} million dollars operations cost`} />
                <div className="slider-ends"><span>30 days</span><span>Up to {scenario.missionDeadlineDays - evaluation.developmentDurationDays} ops days</span></div>
                <p className="schedule-total">Total schedule <b>{evaluation.developmentDurationDays} development + {evaluation.missionDurationDays} operations = {evaluation.scheduleDurationDays} days</b> <TermTip term="Mission deadline" align="end" /></p>
                <p className="model-note">Science and event rates scale with campaign length; this is an educational planning model.</p>
              </div>
            </div>
          </div>

          <div className="subsection-heading instrument-heading"><span className="subsection-index">07</span><div><h3>Mission orbit</h3><p>Altitude changes the orbit period and daily ground contact.</p></div><TermTip term="Orbit options" /></div>
          <div className="orbit-options">
            {scenario.orbits.map((item) => {
              const periodMinutes = calculateOrbitPeriodMinutes(item.altitudeKm, scenario.bodyRadiusKm, scenario.gravitationalParameterKm3PerSec2)
              const selected = item.id === orbit.id
              return (
                <button key={item.id} type="button" className={`orbit-option ${selected ? 'is-selected' : ''}`} onClick={() => selectOrbit(item.id)} aria-pressed={selected}>
                  <span className="orbit-option-top"><b>{item.name}</b><span>{item.altitudeKm} km</span></span>
                  <span className="orbit-option-meta">{periodMinutes} min/orbit · {Math.round(item.contactMinutesPerDay * (design.difficulty === 'easy' ? 1.2 : 1))} min contact · <span className={estimateRadiationRisk(scenario.bodyId, item.altitudeKm) >= 55 ? 'radiation-high' : 'radiation-low'}>☢ {estimateRadiationRisk(scenario.bodyId, item.altitudeKm)} risk</span></span>
                </button>
              )
            })}
          </div>

          <div className="subsection-heading instrument-heading"><span className="subsection-index">08</span><div><h3>Launch vehicle</h3><p>Payload capacity depends on destination and orbit.</p></div><TermTip term="Launch vehicle" /><TermTip term="Launch capacity" /></div>
          <div className="launcher-options">
            {launchVehicles.map((vehicle) => {
              const capacityKg = Math.floor(vehicle.payloadCapacityKgByBody[scenario.bodyId] * orbit.launchCapacityFactor)
              const costMillionUsd = vehicle.costMillionUsdByBody[scenario.bodyId]
              const selected = vehicle.id === launchVehicle.id
              return (
                <button key={vehicle.id} type="button" className={`launcher-option ${selected ? 'is-selected' : ''}`} onClick={() => selectLaunchVehicle(vehicle.id)} aria-pressed={selected}>
                  <span className="launcher-option-top"><img className="launcher-symbol" src={`/assets/launch-${vehicle.id}.svg`} width="40" height="40" alt="" loading="lazy" decoding="async" /><b>{vehicle.name}</b><span>${costMillionUsd}M</span></span>
                  <small>{vehicle.description}</small>
                  <span className="part-spec">{capacityKg.toLocaleString()} kg to selected orbit</span>
                </button>
              )
            })}
          </div>
          <p className="catalog-note">Game estimates — use them to compare designs.</p>
          <button className="launch-button" type="button" disabled={!canLaunch} aria-describedby={launchBlockers.length ? 'launch-lock-help' : undefined} onClick={() => launchMission()}>
            Launch mission <span aria-hidden="true">→</span>
          </button>
          {launchBlockers.length > 0 ? <LaunchGuidance id="launch-lock-help" blockers={launchBlockers} onOpenCrew={openCrewReview} /> : <p className="launch-hint">{design.playMode === 'sandbox' ? 'Sandbox ready · limits won’t block launch.' : 'Ready for launch.'}</p>}
        </section>

        <aside className="right-column">
          <DesignSummary evaluation={evaluation} />
          <section className="panel why-panel" aria-labelledby="why-title">
            <div className="section-heading">
              <div><p className="eyebrow">THE WHY ENGINE</p><h2 id="why-title">Design feedback</h2></div>
              <span className="reason-count">{designIssues.length || 'ALL'} <small>{designIssues.length ? 'TO REVIEW' : 'CLEAR'}</small></span>
            </div>
            <p className="why-intro">Open a card to see the next move.</p>
            {designIssues.length > 0 ? <div className="reason-list">{designIssues.map((reason) => <ReasonCard key={reason.id} reason={reason} />)}</div> : <div className="all-clear"><span aria-hidden="true">✓</span><b>All design checks are clear.</b><p>Try a different instrument mix to explore another trade-off.</p></div>}
          </section>
          <section className="spacecraft-preview" aria-label="Spacecraft preview">
            <img className="spacecraft-art" src="/assets/orbiter-illustration.svg" width="720" height="280" alt="" aria-hidden="true" loading="lazy" decoding="async" />
            <div className="preview-caption"><span>SPACECRAFT PREVIEW</span><b>{bus?.name ?? 'Select a bus'}</b></div>
            <span className="preview-coordinate">{orbit.altitudeKm} KM · {evaluation.orbitPeriodMinutes} MIN ORBIT</span>
          </section>
        </aside>
      </div>
      <details className="mission-tools" ref={missionToolsRef}>
        <summary><span><small>OPTIONAL</small><b>Mission tools</b></span><span aria-hidden="true">+</span></summary>
        <div className="mission-tools-content">
          <DesignLibraryPanel design={design} onLoad={(savedDesign) => replaceDesign(savedDesign)} />
          <TeamPanel key={designKey} enabled={Boolean(design.teamMode)} resetKey={designKey} evaluation={evaluation} onToggle={setTeamMode} onScoreChange={handleTeamScoreChange} />
          <OnlineCrewRoom design={design} onDesignChange={handleOnlineDesign} />
          <OrbitDiagram scenario={scenario} orbit={orbit} />
          <MissionLearningCards scenario={scenario} />
        </div>
      </details>
      </>}
      </main>
      <footer className="page-footer"><span>GALAXY RUN <i>·</i> MISSION DESIGN SIMULATOR</span><span>LEARN BY BUILDING. IMPROVE BY UNDERSTANDING.</span></footer>
      </div>
    </>
  )
}
