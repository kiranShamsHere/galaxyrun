import { useEffect, useRef, useState } from 'react'
import { FirstMissionGuide } from './components/FirstMissionGuide.tsx'
import { DesignLibraryPanel } from './components/DesignLibraryPanel.tsx'
import { LandingPage } from './components/LandingPage.tsx'
import { PlayerNamePage } from './components/PlayerNamePage.tsx'
import { SpaceIcon } from './components/SpaceIcon.tsx'
import { OrbitDiagram } from './components/OrbitDiagram.tsx'
import { Spacecraft3DViewer } from './components/Spacecraft3DViewer.tsx'
import { Orbit3DViewer } from './components/Orbit3DViewer.tsx'
import { NasaMissionHubModal } from './components/NasaMissionHubModal.tsx'
import { MissionLearningCards } from './components/MissionLearningCards.tsx'
import { TermTip } from './components/TermTip.tsx'
import { launchVehicles, parts, propulsionSystems, scenarios } from './data/catalog.ts'
import type { GlossaryTerm } from './data/glossary.ts'
import { evaluateDesign } from './engine/evaluateDesign.ts'
import { calculateOrbitPeriodMinutes } from './engine/orbit.ts'
import { simulateMission } from './engine/simulateMission.ts'
import type { DesignEvaluation, MissionSimulation, Reason } from './engine/types.ts'
import { useMissionStore } from './store.ts'
import { hasCompletedGuide, rememberGuideCompleted } from './utils/guideStorage.ts'
import { soundFx } from './utils/soundEffects.ts'

const scenarioArtwork: Record<string, string> = {
  'earth-observer': '/assets/mission-earth.svg',
  'moon-mapper': '/assets/mission-moon.svg',
  'mars-scout': '/assets/mission-mars.svg',
  'venus-cloud-watcher': '/assets/mission-venus.svg',
}

const instrumentIcons: Record<string, string> = {
  'climate-camera': '📷',
  'thermal-imager': '🌡️',
  spectrometer: '🌈',
  'radar-sounder': '📡',
  'multispectral-mapper': '🔭',
  'cloud-polarimeter': '🔬',
}

interface MissionPreset {
  id: string
  name: string
  icon: string
  tag: string
  busId: string
  instrumentIds: string[]
  propulsionId: string
  propellantMassKg: number
  solarPanelAreaM2: number
  launchVehicleId: string
}

const MISSION_PRESETS: MissionPreset[] = [
  {
    id: 'balanced',
    name: 'Balanced Scout',
    icon: '⚡',
    tag: 'All-Rounder',
    busId: 'explorer-bus',
    instrumentIds: ['climate-camera', 'thermal-imager', 'spectrometer'],
    propulsionId: 'chemical-upper-stage',
    propellantMassKg: 75,
    solarPanelAreaM2: 2.0,
    launchVehicleId: 'voyager',
  },
  {
    id: 'science-max',
    name: 'Science Heavy',
    icon: '🔬',
    tag: 'Max Return',
    busId: 'survey-bus',
    instrumentIds: ['climate-camera', 'thermal-imager', 'spectrometer', 'radar-sounder', 'multispectral-mapper'],
    propulsionId: 'chemical-upper-stage',
    propellantMassKg: 110,
    solarPanelAreaM2: 2.8,
    launchVehicleId: 'atlas',
  },
  {
    id: 'budget-mini',
    name: 'Budget Lightweight',
    icon: '💰',
    tag: 'Cost Saver',
    busId: 'compact-bus',
    instrumentIds: ['climate-camera', 'spectrometer', 'cloud-polarimeter'],
    propulsionId: 'chemical-upper-stage',
    propellantMassKg: 50,
    solarPanelAreaM2: 1.5,
    launchVehicleId: 'pathfinder',
  },
  {
    id: 'ion-deep',
    name: 'Ion Explorer',
    icon: '🛸',
    tag: 'High Delta-V',
    busId: 'survey-bus',
    instrumentIds: ['thermal-imager', 'spectrometer', 'radar-sounder'],
    propulsionId: 'solar-electric-ion',
    propellantMassKg: 45,
    solarPanelAreaM2: 3.6,
    launchVehicleId: 'voyager',
  },
]

function Metric({
  label,
  unit,
  current,
  limit,
  display,
  help,
  hint,
  extraHelp,
}: {
  label: string
  unit: string
  current: number
  limit: number
  display: string
  help: GlossaryTerm
  hint: string
  extraHelp?: GlossaryTerm
}) {
  const percent = limit > 0 ? Math.min((current / limit) * 100, 100) : 0
  const overLimit = current > limit
  const isClose = !overLimit && percent > 85

  return (
    <div className={`metric ${overLimit ? 'is-warning' : isClose ? 'is-caution' : 'is-good'}`}>
      <div className="metric-heading">
        <span className="metric-label">
          {label}
          <TermTip term={help} align="end" />
          {extraHelp && <TermTip term={extraHelp} align="end" />}
        </span>
        <strong className={overLimit ? 'metric-value is-over' : 'metric-value'}>
          {display}
          <small> {unit}</small>
        </strong>
      </div>
      <p className="metric-hint">{hint}</p>
      <div
        className="meter-track"
        role="progressbar"
        aria-label={`${label} used`}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={Math.min(current, limit)}
      >
        <span
          className={overLimit ? 'meter-fill is-over' : isClose ? 'meter-fill is-caution' : 'meter-fill'}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="metric-footer-row">
        <p className="metric-limit">
          Target: {limit.toLocaleString()} {unit}
        </p>
        <span className={`metric-status-badge ${overLimit ? 'badge-fail' : 'badge-ok'}`}>
          {overLimit ? 'OVER LIMIT' : `${Math.round(percent)}% USED`}
        </span>
      </div>
    </div>
  )
}

function ReasonCard({ reason }: { reason: Reason }) {
  const label = reason.status === 'ok' ? 'On track' : reason.status === 'warn' ? 'Watch' : 'Over limit'
  return (
    <details className={`reason-card reason-${reason.status}`}>
      <summary className="reason-title">
        <span className="reason-dot" aria-hidden="true" />
        <h3>{reason.id.replace(/-/g, ' ')}</h3>
        <span className="reason-label">{label}</span>
      </summary>
      <div className="reason-body">
        <p>{reason.cause}</p>
        <div className="reason-detail">
          <b>Effect</b>
          <span>{reason.effect}</span>
        </div>
        <div className="reason-detail">
          <b>Next move</b>
          <span>{reason.fix}</span>
        </div>
      </div>
    </details>
  )
}

function estimateRadiationRisk(bodyId: string, altitudeKm: number) {
  const baselineByBody: Record<string, number> = { earth: 12, moon: 24, mars: 30, venus: 26 }
  return Math.min(90, Math.round((baselineByBody[bodyId] ?? 20) + altitudeKm / 45))
}

function FlightSequence({
  result,
  evaluation,
  scenario,
  step,
  fuelMassKg,
  onAdvance,
  onSkip,
}: {
  result: MissionSimulation
  evaluation: DesignEvaluation
  scenario: (typeof scenarios)[number]
  step: number
  fuelMassKg: number
  onAdvance: () => void
  onSkip: () => void
}) {
  const [autoPlay, setAutoPlay] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2>(1)
  const event = result.timeline[step]
  const isLastStep = step >= result.timeline.length - 1
  const progress = result.timeline.length > 1 ? step / (result.timeline.length - 1) : 0
  const elapsedDays = Math.round(result.missionDurationDays * progress)
  const downlinkStep = result.timeline.findIndex((item) => item.phase.includes('DOWNLINK'))
  const operationsStep = result.timeline.findIndex((item) => item.phase.includes('OPERATIONS'))
  const collectedSoFarGb = operationsStep >= 0 && step >= operationsStep
    ? result.collectedGb * (step > operationsStep ? 1 : 0.55)
    : 0
  const returnedSoFarGb = downlinkStep >= 0 && step >= downlinkStep
    ? result.returnedGb * (isLastStep ? 1 : 0.7)
    : 0
  const powerUsePercent = Math.min(100, Math.round((evaluation.powerW / Math.max(1, evaluation.powerAvailableW)) * 100))
  const batteryUsePercent = Math.min(
    100,
    Math.round((evaluation.eclipseEnergyRequiredWh / Math.max(1, evaluation.batteryCapacityWh)) * 100),
  )
  const dataReturnPercent = Math.min(100, Math.round((returnedSoFarGb / Math.max(1, result.collectedGb)) * 100))
  const fuelLoadPercent = Math.min(100, Math.round((fuelMassKg / Math.max(1, evaluation.maxPropellantKg)) * 100))

  const previousStep = useRef(step)
  useEffect(() => {
    if (previousStep.current !== step) {
      if (event.phase.includes('DOWNLINK')) soundFx.downlink(true)
      else soundFx.missionPhase(true, event.status, isLastStep)
    }
    previousStep.current = step
  }, [event.phase, event.status, isLastStep, step])

  useEffect(() => {
    if (!autoPlay) return
    const timer = window.setTimeout(onAdvance, playbackSpeed === 1 ? 3400 : 1700)
    return () => window.clearTimeout(timer)
  }, [autoPlay, onAdvance, playbackSpeed, step])

  return (
    <section className="flight-sequence" aria-labelledby="flight-title">
      <div className="flight-hud">
        <span>
          FLIGHT COMPUTER <i>● LIVE</i>
        </span>
        <span>{scenario.name.toUpperCase()}</span>
      </div>
      <div className={`flight-scene flight-body-${scenario.bodyId} flight-phase-${step}`} aria-hidden="true">
        <div className="flight-nebula" />
        <div className="flight-starfield" />
        <div className="flight-scanline" />
        <div className="flight-planet">
          <span />
        </div>
        <div className="flight-orbit">
          <b />
        </div>
        <span className="flight-engine-plume" />
        <img src="/assets/orbiter-illustration.svg" alt="" className="flight-craft" />
        <span className="flight-scene-label">{event.phase.split('/').at(-1)?.trim()} · {evaluation.orbitAltitudeKm} KM ORBIT</span>
      </div>
      <div className="flight-phase-row">
        <span>
          PHASE {String(step + 1).padStart(2, '0')} / {String(result.timeline.length).padStart(2, '0')}
        </span>
        <div
          role="progressbar"
          aria-label="Flight progress"
          aria-valuemin={0}
          aria-valuemax={result.timeline.length}
          aria-valuenow={step + 1}
        >
          <i style={{ width: `${((step + 1) / result.timeline.length) * 100}%` }} />
        </div>
        <span>{Math.round(((step + 1) / result.timeline.length) * 100)}%</span>
      </div>
      <ol
        className="flight-phase-track"
        aria-label="Mission phases"
        style={{ gridTemplateColumns: `repeat(${result.timeline.length}, minmax(0, 1fr))` }}
      >
        {result.timeline.map((phase, index) => (
          <li
            key={phase.phase}
            className={index === step ? 'is-current' : index < step ? 'is-complete' : ''}
            aria-current={index === step ? 'step' : undefined}
          >
            <span>{index < step ? '✓' : String(index + 1).padStart(2, '0')}</span>
            <small>{phase.phase.split('/').at(-1)?.trim()}</small>
          </li>
        ))}
      </ol>
      <div className={`flight-event-card flight-${event.status}`} key={`${event.phase}-${step}`} aria-live="polite">
        <span className="flight-event-icon" aria-hidden="true">
          {event.status === 'ok' ? '✓' : event.status === 'warn' ? '!' : '×'}
        </span>
        <div>
          <div className="flight-event-meta">
            <small>{event.phase}</small>
            <span className={`flight-status-tag status-${event.status}`}>
              {event.status === 'ok' ? 'Nominal' : event.status === 'warn' ? 'Needs attention' : 'Launch held'}
            </span>
          </div>
          <h1 id="flight-title">{event.title}</h1>
          <p>{event.detail}</p>
        </div>
      </div>
      <div className="flight-telemetry" aria-label="Live mission telemetry" aria-live="polite">
        <div>
          <small>POWER LOAD</small>
          <b>
            {evaluation.powerW}
            <i> W</i>
          </b>
          <span className="telemetry-track">
            <i style={{ width: `${powerUsePercent}%` }} />
          </span>
        </div>
        <div>
          <small>ECLIPSE BATTERY</small>
          <b>
            {evaluation.eclipseEnergyRequiredWh}
            <i> Wh</i>
          </b>
          <span className="telemetry-track">
            <i style={{ width: `${batteryUsePercent}%` }} />
          </span>
        </div>
        <div>
          <small>DATA DOWNLINKED</small>
          <b>
            {returnedSoFarGb.toFixed(1)}
            <i> GB</i>
          </b>
          <span className="telemetry-track">
            <i style={{ width: `${dataReturnPercent}%` }} />
          </span>
        </div>
        <div>
          <small>SCIENCE STORED</small>
          <b>{collectedSoFarGb.toFixed(1)}<i> GB</i></b>
          <span className="telemetry-track"><i style={{ width: `${Math.min(100, (collectedSoFarGb / Math.max(1, result.collectedGb)) * 100)}%` }} /></span>
        </div>
        <div>
          <small>MISSION CLOCK</small>
          <b>{elapsedDays}<i> / {result.missionDurationDays} d</i></b>
          <span className="telemetry-track"><i style={{ width: `${Math.round(progress * 100)}%` }} /></span>
        </div>
        <div>
          <small>FUEL LOAD</small>
          <b>
            {fuelMassKg}
            <i> kg</i>
          </b>
          <span className="telemetry-track">
            <i style={{ width: `${fuelLoadPercent}%` }} />
          </span>
        </div>
      </div>
      <div className="flight-controls">
        <div className="flight-playback-controls">
          <button className="flight-autoplay" type="button" aria-pressed={autoPlay} onClick={() => setAutoPlay((playing) => !playing)}>
            {autoPlay ? 'Ⅱ Pause' : '▶ Auto-play'}
          </button>
          {autoPlay && (
            <button className="flight-speed" type="button" onClick={() => setPlaybackSpeed((speed) => speed === 1 ? 2 : 1)} aria-label={`Playback speed ${playbackSpeed} times. Change speed`}>
              {playbackSpeed}× speed
            </button>
          )}
          <button className="flight-skip" type="button" onClick={onSkip}>Skip to debrief</button>
        </div>
        <button className="launch-button flight-advance" type="button" onClick={() => { setAutoPlay(false); onAdvance() }}>
          {isLastStep ? 'View mission debrief' : 'Next flight phase'} <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  )
}

const learningChecks = [
  {
    prompt: 'What limits data sent home?',
    answers: ['Panel size', 'Downlink × contact time', 'Fuel load'],
    correct: 1,
    explain: 'The link and time in contact set the return limit.',
  },
  {
    prompt: 'What keeps systems alive in eclipse?',
    answers: ['Battery', 'Antenna', 'Solar array'],
    correct: 0,
    explain: 'Stored battery energy bridges the shadow period.',
  },
  {
    prompt: 'Why does extra propellant raise launch mass?',
    answers: ['It adds spacecraft mass', 'It lowers orbit', 'It reduces power'],
    correct: 0,
    explain: 'The launcher must lift the propellant too.',
  },
] as const

function LearningCheck({
  seed,
  bonus,
  onAnswer,
}: {
  seed: number
  bonus: number
  onAnswer: (correct: boolean) => void
}) {
  const question = learningChecks[Math.abs(seed) % learningChecks.length]
  const [choice, setChoice] = useState<number | null>(null)
  const answeredCorrectly = choice === question.correct

  return (
    <section className="panel learning-check" aria-labelledby="learning-check-title">
      <div className="learning-check-heading">
        <span aria-hidden="true">✦</span>
        <div>
          <small>FLIGHT CHECK</small>
          <h2 id="learning-check-title">{question.prompt}</h2>
        </div>
      </div>
      <div className="learning-check-answers" role="group" aria-label="Choose your answer">
        {question.answers.map((answer, index) => (
          <button
            key={answer}
            type="button"
            disabled={choice !== null}
            aria-pressed={choice === index}
            className={
              choice === index && !answeredCorrectly
                ? 'answer-wrong'
                : choice !== null && index === question.correct
                  ? 'answer-correct'
                  : ''
            }
            onClick={() => {
              setChoice(index)
              onAnswer(index === question.correct)
            }}
          >
            {answer}
          </button>
        ))}
      </div>
      {choice !== null && (
        <p className={`learning-check-feedback ${answeredCorrectly ? 'is-correct' : 'is-wrong'}`} role="status">
          {answeredCorrectly
            ? `Correct · ${bonus ? `+${bonus} learning` : 'learning score maxed'}`
            : `Not quite · ${question.explain}`}
        </p>
      )}
    </section>
  )
}

function DesignSummary({ evaluation }: { evaluation: DesignEvaluation }) {
  // CML 4 Margin check
  const massMarginPct = Math.round(
    Math.max(0, ((evaluation.launchCapacityKg - evaluation.massKg) / Math.max(1, evaluation.launchCapacityKg)) * 100),
  )
  const powerMarginPct = Math.round(
    Math.max(0, ((evaluation.powerAvailableW - evaluation.powerW) / Math.max(1, evaluation.powerAvailableW)) * 100),
  )
  const isCml4Compliant = massMarginPct >= 15 && powerMarginPct >= 20

  return (
    <section className="panel summary-panel" aria-labelledby="summary-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">LIVE TELEMETRY HUD</p>
          <h2 id="summary-title">Mission meters</h2>
        </div>
        <span className="live-indicator">
          <i /> Updating live
        </span>
      </div>

      {/* CML 4 Maturity Badge */}
      <div className={`cml-hud-badge ${isCml4Compliant ? 'is-pass' : 'is-warn'}`}>
        <span>{isCml4Compliant ? '✓ JPL CML-4 READY' : <><SpaceIcon symbol="⚠️" size={14} /> PRE-CML-4 TRADE SPACE</>}</span>
        <small>
          Mass Res: {massMarginPct}% (≥15% req) · Power Res: {powerMarginPct}% (≥20% req)
        </small>
      </div>

      <div className="metric-grid">
        <Metric
          label="Spacecraft mass"
          current={evaluation.massKg}
          limit={evaluation.launchCapacityKg}
          unit="kg"
          display={evaluation.massKg.toLocaleString()}
          help="Spacecraft mass"
          hint="Craft plus fuel must fit rocket capacity."
        />
        <Metric
          label="Power demand"
          current={evaluation.powerW}
          limit={evaluation.powerAvailableW}
          unit="W"
          display={evaluation.powerW.toLocaleString()}
          help="Power demand"
          hint="Power draw vs available solar output."
        />
        <Metric
          label="Mission cost"
          current={evaluation.costMillionUsd}
          limit={evaluation.budgetMillionUsd}
          unit="M USD"
          display={`$${evaluation.costMillionUsd}`}
          help="Mission cost"
          hint="Total project hardware, launch & ops cost."
        />
        <Metric
          label="Maneuver range"
          current={evaluation.deltaVMps}
          limit={evaluation.requiredDeltaVMps}
          unit="m/s"
          display={evaluation.deltaVMps.toLocaleString()}
          help="Delta-v"
          hint="Thrust needed to reach & maintain target orbit."
        />
      </div>

      <details className="advanced-gauges">
        <summary>
          More mission stats <span aria-hidden="true">+</span>
        </summary>
        <div className="metric-grid">
          <Metric
            label="Shadow battery"
            current={evaluation.eclipseEnergyRequiredWh}
            limit={evaluation.batteryCapacityWh}
            unit="Wh"
            display={evaluation.eclipseEnergyRequiredWh.toLocaleString()}
            help="Eclipse battery"
            hint="Stored power keeps systems on in darkness."
          />
          <Metric
            label="Data to send home"
            current={evaluation.dataGbPerDay}
            limit={evaluation.dataLimitGbPerDay}
            unit="GB/day"
            display={`${evaluation.dataGbPerDay}`}
            help="Daily data"
            hint="Collected data should fit DSN downlink pass."
            extraHelp="Downlink"
          />
          <Metric
            label="Total schedule"
            current={evaluation.scheduleDurationDays}
            limit={evaluation.missionDeadlineDays}
            unit="days"
            display={`${evaluation.scheduleDurationDays}`}
            help="Mission time"
            hint="Development + ops must meet scenario deadline."
          />
        </div>
      </details>

      <div className="risk-summary" aria-label="Estimated system risk">
        <div className="risk-heading">
          <span>
            Smooth-flight estimate
            <TermTip term="Mission reliability" />
          </span>
          <strong>{evaluation.reliabilityPercent}%</strong>
        </div>
        <div
          className="risk-track"
          role="progressbar"
          aria-label="Estimated mission reliability"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={evaluation.reliabilityPercent}
        >
          <span
            className={evaluation.reliabilityPercent < 80 ? 'risk-fill is-watch' : 'risk-fill'}
            style={{ width: `${evaluation.reliabilityPercent}%` }}
          />
        </div>
        <p>
          {evaluation.thermalRiskPercent}% heat/cold stress estimate
          <TermTip term="Thermal risk" /> · flight physics model.
        </p>
      </div>

      <div className="science-score">
        <span>
          Science potential
          <TermTip term="Science potential" />
        </span>
        <strong>
          {evaluation.scienceValue}
          <small> pts</small>
        </strong>
        <span className="score-hint">from selected payload sensors</span>
      </div>

      <div className="orbit-summary">
        <span>{evaluation.orbitAltitudeKm} km orbit</span>
        <b>{evaluation.orbitPeriodMinutes} min</b>
        <small>orbital period</small>
      </div>
    </section>
  )
}

function MissionReport({
  result,
  pilotName,
  onEdit,
  onAnotherFlight,
  onLearningAnswer,
}: {
  result: MissionSimulation
  pilotName: string
  onEdit: () => void
  onAnotherFlight: () => void
  onLearningAnswer: (correct: boolean) => void
}) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const scoreParts = [
    ['Science return', result.scienceScore],
    ['Efficiency', result.efficiencyScore],
    ['Reliability', result.reliabilityScore],
    ['Learning', result.learningScore],
  ] as const
  const reportReasons = result.reasons.filter((reason) => reason.status !== 'ok')

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <section className="mission-report" id="mission-report">
      <div className="page-intro report-intro">
        <div>
          <p className="eyebrow">
            MISSION CONTROL <span> / </span> FLIGHT REPORT
          </p>
          <h1 ref={headingRef} tabIndex={-1}>
            {result.success ? 'Mission complete' : 'Mission needs a redesign'}
            <span className="title-period">.</span>
          </h1>
          <p className="intro-copy">
            {result.returnedGb.toFixed(1)} GB returned over {result.missionDurationDays} mission days.
          </p>
          <p className="pilot-identification"><SpaceIcon symbol="🛰️" size={16} /> Pilot: <b>{pilotName || 'Pilot'}</b></p>
        </div>
        <div className="grade-badge">
          <strong>{result.grade}</strong>
          <span>
            MISSION
            <br />
            GRADE
          </span>
        </div>
      </div>

      <section className="report-group" aria-labelledby="mission-results-title">
        <div className="report-section-heading">
          <p className="eyebrow">MISSION RESULTS</p>
          <h2 id="mission-results-title">Score &amp; rewards</h2>
        </div>
        <section className="panel mission-score-panel">
          <div className="score-total">
            <span>{result.playMode === 'sandbox' ? 'PRACTICE SCORE' : 'FINAL SCORE'}</span>
            <strong>{result.score}</strong>
            <small>{result.playMode === 'sandbox' ? 'unranked · out of 100' : 'out of 100'}</small>
          </div>
          <div className="score-breakdown">
            <div className="section-heading">
              <div>
                <p className="eyebrow">HOW THE MISSION SCORED</p>
                <h2>Score breakdown</h2>
              </div>
              <span className="seed-label">
                {result.difficulty.toUpperCase()} · SEED {result.seed}
                <TermTip term="Seed" align="end" />
              </span>
            </div>
            <div className="score-items">
              {scoreParts.map(([label, score]) => (
                <div className="score-item" key={label}>
                  <span>{label}</span>
                  <b>
                    {score}
                    <small> / 100</small>
                  </b>
                  <i>
                    <em style={{ width: `${score}%` }} />
                  </i>
                </div>
              ))}
            </div>
          </div>
        </section>
        <LearningCheck seed={result.seed} bonus={Math.min(10, 100 - result.learningScore)} onAnswer={onLearningAnswer} />
        {result.achievements.length > 0 && (
          <section className="panel achievement-panel" aria-label="Achievements earned">
            <p className="eyebrow">FLIGHT AWARDS</p>
            <div>
              {result.achievements.map((achievement) => (
                <span className="achievement-badge" key={achievement}>
                  ✦ {achievement}
                </span>
              ))}
            </div>
          </section>
        )}
      </section>

      <section className="report-group" aria-labelledby="mission-debrief-title">
        <div className="report-section-heading">
          <p className="eyebrow">MISSION DEBRIEF</p>
          <h2 id="mission-debrief-title">Flight data &amp; lessons</h2>
          <p>Review each phase, then open a system check to see what to change.</p>
        </div>
        <div className="report-columns">
          <section className="panel timeline-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">SEE WHAT HAPPENED</p>
                <h2>Flight timeline</h2>
              </div>
              <span className="parts-count">{result.timeline.length} MISSION PHASES</span>
            </div>
            <ol className="flight-timeline">
              {result.timeline.map((event, index) => (
                <li className={`flight-event flight-${event.status}`} key={`${event.phase}-${index}`}>
                  <span className="timeline-marker">
                    {event.status === 'ok' ? '✓' : event.status === 'warn' ? '!' : '×'}
                  </span>
                  <div>
                    <small>{event.phase}</small>
                    <h3>
                      {event.title}
                      {event.title.includes('Solar flare') && <TermTip term="Solar flare" />}
                      {event.title.includes('Thermal system anomaly') && <TermTip term="Safe mode" />}
                    </h3>
                    <p>{event.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
          <section className="panel report-reasons">
            <div className="section-heading">
              <div>
                <p className="eyebrow">THE WHY ENGINE</p>
                <h2>What to learn</h2>
              </div>
              <span className="reason-count">
                {reportReasons.length || 'ALL'}
                <small>{reportReasons.length ? 'TO REVIEW' : 'CLEAR'}</small>
              </span>
            </div>
            {reportReasons.length > 0 ? (
              <div className="reason-list">
                {reportReasons.map((reason) => (
                  <ReasonCard reason={reason} key={reason.id} />
                ))}
              </div>
            ) : (
              <div className="all-clear">
                <span>✦</span>
                <b>All design checks are clear.</b>
                <p>Try a different instrument mix to explore another trade-off.</p>
              </div>
            )}
          </section>
        </div>
      </section>
      <div className="report-actions">
        <p>Seed {result.seed} keeps this flight reproducible.</p>
        <button className="secondary-button" type="button" onClick={() => window.print()}>
          Print / save report as PDF
        </button>
        <button className="secondary-button" type="button" onClick={onAnotherFlight}>
          Fly again · new conditions
        </button>
        <button className="launch-button edit-button" type="button" onClick={onEdit}>
          ← Improve this design
        </button>
      </div>
    </section>
  )
}

export default function App() {
  const [screen, setScreen] = useState<'landing' | 'pilot' | 'designer'>('landing')
  const [pilotName, setPilotName] = useState(() => {
    try { return localStorage.getItem('galaxy-run-pilot-name') ?? '' } catch { return '' }
  })
  const [missionResult, setMissionResult] = useState<MissionSimulation | null>(null)
  const [flightStep, setFlightStep] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [desktopSidebarVisible, setDesktopSidebarVisible] = useState(true)
  const [guideOpen, setGuideOpen] = useState(false)
  const [nasaModalOpen, setNasaModalOpen] = useState(false)
  const [viewerTab, setViewerTab] = useState<'spacecraft' | 'orbit' | 'mel'>('spacecraft')
  const [runSeed, setRunSeed] = useState(2026)
  const reportWasOpen = useRef(false)
  const flightTuningRef = useRef<HTMLDetailsElement>(null)

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
  const toggleInstrument = useMissionStore((state) => state.toggleInstrument)
  const replaceDesign = useMissionStore((state) => state.replaceDesign)

  const scenario = scenarios.find((item) => item.id === design.scenarioId) ?? scenarios[0]
  const orbit = scenario.orbits.find((item) => item.id === design.orbitId) ?? scenario.orbits[0]
  const launchVehicle = launchVehicles.find((item) => item.id === design.launchVehicleId) ?? launchVehicles[0]
  const propulsion = propulsionSystems.find((item) => item.id === design.propulsionId) ?? propulsionSystems[0]
  const buses = parts.filter((part) => part.category === 'bus')
  const instruments = parts.filter((part) => part.category === 'instrument')
  const evaluation = evaluateDesign(design, scenario, parts, launchVehicles, propulsionSystems)
  const selectedCount = design.instrumentIds.length
  const designIssues = evaluation.reasons.filter((reason) => reason.status !== 'ok')
  const hardChecksClear = !evaluation.reasons.some((reason) => reason.status === 'fail')

  const canLaunch = hardChecksClear || design.playMode === 'sandbox'

  // 1-Click Smart Quick-Fix Actions Generator
  const quickFixes: Array<{
    id: string
    label: string
    badge: string
    execute: () => void
  }> = []

  // Check mass constraint
  if (evaluation.massKg > evaluation.launchCapacityKg) {
    if (design.launchVehicleId === 'pathfinder') {
      quickFixes.push({
        id: 'upgrade-launcher',
        label: 'Upgrade to Voyager Rocket (+240kg)',
        badge: 'Mass Fix',
        execute: () => {
          selectLaunchVehicle('voyager')
          soundFx.fix(true)
        },
      })
    } else if (design.launchVehicleId === 'voyager') {
      quickFixes.push({
        id: 'upgrade-launcher-heavy',
        label: 'Upgrade to Atlas Rocket (+400kg)',
        badge: 'Mass Fix',
        execute: () => {
          selectLaunchVehicle('atlas')
          soundFx.fix(true)
        },
      })
    }
    if (evaluation.propellantMassKg > 40) {
      quickFixes.push({
        id: 'trim-fuel',
        label: `⛽ Trim Fuel (-30kg)`,
        badge: 'Mass Fix',
        execute: () => {
          setPropellantMass(Math.max(20, evaluation.propellantMassKg - 30))
          soundFx.fix(true)
        },
      })
    }
  }

  // Check power constraint
  if (evaluation.powerW > evaluation.powerAvailableW) {
    const neededSolarArea = Math.min(
      5.0,
      Number(((evaluation.powerW / (scenario.solarIrradianceWPerM2 * 0.28)) * 1.15).toFixed(1)),
    )
    quickFixes.push({
      id: 'boost-solar',
      label: `Auto-Size Solar Arrays to ${neededSolarArea} m²`,
      badge: 'Power Fix',
      execute: () => {
        setSolarPanelArea(neededSolarArea)
        soundFx.fix(true)
      },
    })
  }

  // Check delta-V constraint
  if (evaluation.deltaVMps < evaluation.requiredDeltaVMps) {
    const additionalFuelNeeded = Math.min(
      propulsion.maxPropellantKg - evaluation.propellantMassKg,
      Math.max(25, Math.ceil((evaluation.requiredDeltaVMps - evaluation.deltaVMps) / 12)),
    )
    if (additionalFuelNeeded > 0) {
      quickFixes.push({
        id: 'add-fuel',
        label: `⛽ Top Up Propellant (+${additionalFuelNeeded} kg)`,
        badge: 'Delta-V Fix',
        execute: () => {
          setPropellantMass(evaluation.propellantMassKg + additionalFuelNeeded)
          soundFx.fix(true)
        },
      })
    }
  }

  // Check battery constraint
  if (evaluation.eclipseEnergyRequiredWh > evaluation.batteryCapacityWh) {
    quickFixes.push({
      id: 'upgrade-battery',
      label: `Switch to Explorer Bus (720 Wh Battery)`,
      badge: 'Battery Fix',
      execute: () => {
        selectBus('explorer-bus')
          soundFx.fix(true)
      },
    })
  }

  // Check cost constraint
  if (evaluation.costMillionUsd > evaluation.budgetMillionUsd && design.busId !== 'compact-bus') {
    quickFixes.push({
      id: 'trim-cost',
      label: `Switch to Compact Bus (-$9M)`,
      badge: 'Budget Fix',
      execute: () => {
        selectBus('compact-bus')
        soundFx.fix(true)
      },
    })
  }

  // Apply mission preset loadout
  function applyPreset(preset: MissionPreset) {
    soundFx.mount(true)
    selectBus(preset.busId)
    selectPropulsionSystem(preset.propulsionId)
    setPropellantMass(preset.propellantMassKg)
    setSolarPanelArea(preset.solarPanelAreaM2)
    selectLaunchVehicle(preset.launchVehicleId)
    // Replace instruments cleanly
    design.instrumentIds.forEach((id) => {
      if (!preset.instrumentIds.includes(id)) toggleInstrument(id)
    })
    preset.instrumentIds.forEach((id) => {
      if (!design.instrumentIds.includes(id)) toggleInstrument(id)
    })
  }

  function handleInstrumentToggle(id: string) {
    soundFx.mount(true)
    toggleInstrument(id)
  }

  function launchMission(seed = runSeed) {
    soundFx.launch(true)
    const result = simulateMission(design, scenario, parts, launchVehicles, propulsionSystems, seed)
    setMissionResult(result)
    setFlightStep(0)
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
    const score = Math.min(100, Math.round(missionResult.score + bonus * 0.15))
    const updatedResult: MissionSimulation = {
      ...missionResult,
      learningScore,
      score,
      grade: score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : 'D',
    }
    setMissionResult(updatedResult)
  }

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

  useEffect(() => {
    if (!mobileMenuOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [mobileMenuOpen])

  function toggleNavigation() {
    if (window.matchMedia('(max-width: 760px)').matches) {
      setMobileMenuOpen((open) => !open)
      return
    }
    setDesktopSidebarVisible((visible) => !visible)
  }

  function closeNavigation() {
    setMobileMenuOpen(false)
  }

  if (screen === 'landing') {
    return (
      <LandingPage
        scenarios={scenarios}
        selectedScenarioId={scenario.id}
        onSelectScenario={selectScenario}
        onStart={() => {
          setScreen('pilot')
        }}
      />
    )
  }

  if (screen === 'pilot') {
    return (
      <PlayerNamePage
        initialName={pilotName}
        onBack={() => setScreen('landing')}
        onContinue={(name) => {
          setPilotName(name)
          try { localStorage.setItem('galaxy-run-pilot-name', name) } catch { /* Private browsing may block storage. */ }
          setGuideOpen(!hasCompletedGuide())
          setScreen('designer')
        }}
      />
    )
  }

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to mission design
      </a>
      <div className="app-shell">
        <header className="topbar">
          <button
            type="button"
            className="menu-toggle"
            onClick={toggleNavigation}
            aria-label="Toggle mission navigation"
            aria-controls="mission-sidebar"
            aria-expanded={window.matchMedia('(max-width: 760px)').matches ? mobileMenuOpen : desktopSidebarVisible}
          >
            <span /><span /><span />
          </button>
          <a
            className="brand"
            href="#landing-top"
            aria-label="Galaxy Run home"
            onClick={(event) => {
              event.preventDefault()
              setMissionResult(null)
              setScreen('landing')
            }}
          >
            <span className="brand-mark" aria-hidden="true">
              <img src="/assets/galaxy-run-mark.svg" width="34" height="34" alt="" decoding="async" />
            </span>
            <span>
              GALAXY<span className="brand-light"> RUN</span>
            </span>
          </a>
          <div className="topbar-right">
            {!missionResult && (
              <>
                <button
                  type="button"
                  className="nasa-fleet-btn"
                  onClick={() => setNasaModalOpen(true)}
                  title="Explore real NASA fleet data and JPL CML framework"
                >
                  <SpaceIcon symbol="🛰️" /> NASA Fleet &amp; CML
                </button>
                <button className="home-toggle" type="button" onClick={() => setScreen('landing')}>
                  Mission brief
                </button>
                <button
                  className="guide-toggle"
                  type="button"
                  onClick={toggleGuide}
                  aria-expanded={guideOpen}
                >
                  {guideOpen ? 'Close guide' : 'Flight guide'}
                </button>
              </>
            )}
          </div>
        </header>

        {mobileMenuOpen && <button type="button" className="sidebar-backdrop" aria-label="Close navigation" onClick={closeNavigation} />}
        <div className="app-workspace">
        <aside
          id="mission-sidebar"
          className={`app-sidebar${desktopSidebarVisible ? '' : ' is-collapsed'}${mobileMenuOpen ? ' is-mobile-open' : ''}`}
          aria-label="Mission navigation"
        >
          <div className="sidebar-pilot"><span className="sidebar-avatar"><SpaceIcon symbol="🛰️" size={20} /></span><span><small>SOLO PILOT</small><b>{pilotName || 'Pilot'}</b></span></div>
          <nav>
            <a href={flightStep !== null ? '#flight-title' : missionResult ? '#mission-report' : '#top'} onClick={closeNavigation}>
              <SpaceIcon name={missionResult ? 'clipboard' : 'planet'} /><span>{missionResult ? 'Flight report' : 'Mission control'}</span>
            </a>
            {!missionResult && <>
              <a href="#holo-bay" onClick={closeNavigation}><SpaceIcon symbol="🛰️" /><span>3D mission lab</span></a>
              <a href="#hardware-title" onClick={closeNavigation}><SpaceIcon symbol="🔬" /><span>Build spacecraft</span></a>
              <button type="button" onClick={() => { setGuideOpen(true); closeNavigation() }}><SpaceIcon symbol="📋" /><span>Flight guide</span></button>
            </>}
            <button type="button" onClick={() => { setNasaModalOpen(true); closeNavigation() }}><SpaceIcon symbol="📡" /><span>NASA data</span></button>
          </nav>
          <div className="sidebar-footnote">GALAXY RUN <span>·</span> SOLO FLIGHT</div>
        </aside>

        <main id="main-content" tabIndex={-1}>
          {missionResult ? (
            flightStep !== null ? (
              <FlightSequence
                result={missionResult}
                evaluation={evaluation}
                scenario={scenario}
                step={flightStep}
                fuelMassKg={design.propellantMassKg}
                onAdvance={() =>
                  setFlightStep((current) =>
                    current !== null && current < missionResult.timeline.length - 1 ? current + 1 : null,
                  )
                }
                onSkip={() => setFlightStep(null)}
              />
            ) : (
              <MissionReport
                result={missionResult}
                pilotName={pilotName}
                onEdit={() => {
                  setMissionResult(null)
                  setFlightStep(null)
                }}
                onAnotherFlight={launchAnotherFlight}
                onLearningAnswer={recordLearningAnswer}
              />
            )
          ) : (
            <>
              {/* Cockpit Page Intro */}
              <section className="page-intro" id="top">
                <div className="cockpit-title-row">
                  <div>
                    <p className="eyebrow">
                      MISSION CONTROL <span> / </span> 3D DESIGN LAB
                    </p>
                    <h1 id="design-title" tabIndex={-1}>
                      Build &amp; launch<span className="title-period">.</span>
                    </h1>
                    <p className="intro-copy">
                      Target <b>{scenario.name}</b> in {scenario.destination}. Adjust your spacecraft in live 3D, balance
                      systems, and launch.
                    </p>
                    <p className="pilot-identification"><SpaceIcon symbol="🛰️" size={16} /> Solo pilot: <b>{pilotName || 'Pilot'}</b></p>
                  </div>
                  <button
                    type="button"
                    className="open-nasa-archive-btn"
                    onClick={() => setNasaModalOpen(true)}
                  >
                    <SpaceIcon symbol="🚀" />
                    <div>
                      <b>NASA Fleet &amp; JPL CML Archive</b>
                      <small>Compare with real NASA missions</small>
                    </div>
                  </button>
                </div>
              </section>

              {guideOpen && <FirstMissionGuide onDismiss={dismissGuide} />}

              {/* 3D Interactive Cockpit Stage */}
              <section className="holo-bay-section" id="holo-bay" aria-label="3D Interactive Mission Lab">
                <div className="holo-bay-header">
                  <div className="holo-tabs" role="tablist">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={viewerTab === 'spacecraft'}
                      className={`holo-tab ${viewerTab === 'spacecraft' ? 'is-active' : ''}`}
                      onClick={() => {
                        setViewerTab('spacecraft')
                        soundFx.blip(true)
                      }}
                    >
                      <SpaceIcon symbol="🛰️" /> 3D Spacecraft CAD
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={viewerTab === 'orbit'}
                      className={`holo-tab ${viewerTab === 'orbit' ? 'is-active' : ''}`}
                      onClick={() => {
                        setViewerTab('orbit')
                        soundFx.blip(true)
                      }}
                    >
                      <SpaceIcon symbol="🪐" /> 3D Orbit Trajectory
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={viewerTab === 'mel'}
                      className={`holo-tab ${viewerTab === 'mel' ? 'is-active' : ''}`}
                      onClick={() => {
                        setViewerTab('mel')
                        soundFx.blip(true)
                      }}
                    >
                      <SpaceIcon symbol="📋" /> JPL CML-4 MEL
                    </button>
                  </div>
                  <span className="holo-status">
                    <span className="live-dot" /> LIVE SIMULATION ENGINE
                  </span>
                </div>

                <div className="holo-bay-viewport">
                  {viewerTab === 'spacecraft' && (
                    <Spacecraft3DViewer
                      busId={design.busId}
                      instrumentIds={design.instrumentIds}
                      propulsionId={design.propulsionId}
                      solarPanelAreaM2={evaluation.solarPanelAreaM2}
                      allParts={parts}
                      onToggleInstrument={handleInstrumentToggle}
                    />
                  )}
                  {viewerTab === 'orbit' && <Orbit3DViewer scenario={scenario} orbit={orbit} />}
                  {viewerTab === 'mel' && (
                    <div className="mel-inline-card">
                      <div className="mel-card-top">
                        <div>
                          <small>JPL CONCEPT MATURITY LEVEL 4</small>
                          <h3>Master Equipment List (MEL)</h3>
                        </div>
                        <span className="mel-pill">WET MASS: {evaluation.massKg} kg</span>
                      </div>
                      <div className="mel-mini-grid">
                        <div className="mel-mini-item">
                          <small>BUS CHASSIS</small>
                          <b>{evaluation.dryMassKg - evaluation.solarArrayMassKg - 25} kg</b>
                          <span>$38.0M</span>
                        </div>
                        <div className="mel-mini-item">
                          <small>SOLAR &amp; BATTERY</small>
                          <b>{evaluation.solarArrayMassKg.toFixed(1)} kg</b>
                          <span>+{evaluation.powerAvailableW} W</span>
                        </div>
                        <div className="mel-mini-item">
                          <small>PROPULSION &amp; FUEL</small>
                          <b>{25 + evaluation.propellantMassKg} kg</b>
                          <span>{evaluation.deltaVMps} m/s</span>
                        </div>
                        <div className="mel-mini-item">
                          <small>SCIENCE PAYLOAD</small>
                          <b>{selectedCount * 42} kg</b>
                          <span>+{evaluation.scienceValue} pts</span>
                        </div>
                      </div>
                      <p className="mel-note">
                        NASA JPL requires ≥ 15% mass margin and ≥ 20% power margin before passing Step 1 Mission Concept
                        Review (MCR).
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* Destination World Selection */}
              <section className="scenario-section" aria-labelledby="scenario-title">
                <div className="section-heading compact-heading">
                  <div>
                    <p className="eyebrow">CHOOSE YOUR OBJECTIVE</p>
                    <h2 id="scenario-title">Select a target world</h2>
                  </div>
                  <span className="selection-note">
                    {scenario.destination} <span aria-hidden="true">↗</span>
                  </span>
                </div>
                <div className="scenario-grid">
                  {scenarios.map((item, index) => (
                    <button
                      key={item.id}
                      className={`scenario-card ${item.id === scenario.id ? 'is-selected' : ''}`}
                      onClick={() => {
                        soundFx.blip(true)
                        selectScenario(item.id)
                      }}
                      aria-pressed={item.id === scenario.id}
                    >
                      <span className="scenario-art" aria-hidden="true">
                        <img src={scenarioArtwork[item.id]} width="120" height="96" alt="" decoding="async" />
                      </span>
                      <span className="scenario-copy">
                        <span className="scenario-kicker">{`${String(index + 1).padStart(2, '0')} / ${item.bodyId.toUpperCase()} EXPLORATION`}</span>
                        <strong>{item.name}</strong>
                        <small>{item.destination}</small>
                      </span>
                      <span className="selection-check" aria-hidden="true">
                        ✓
                      </span>
                    </button>
                  ))}
                </div>
                <p className="objective-line">
                  <span className="objective-icon" aria-hidden="true">
                    ◎
                  </span>
                  <span>
                    <b>Mission objective:</b> {scenario.objective}
                  </span>
                  <span className="orbit-pill">
                    {orbit.name} · {orbit.altitudeKm} km
                  </span>
                </p>
              </section>

              {/* Mission Presets (Game Archetypes) */}
              <section className="presets-section" aria-label="Quick Archetype Presets">
                <div className="presets-header">
                <span className="presets-label"><SpaceIcon symbol="🎮" /> MISSION PRESETS:</span>
                  <small>1-click launch-ready loadouts to test trade-offs</small>
                </div>
                <div className="presets-row">
                  {MISSION_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className="preset-card-btn"
                      onClick={() => applyPreset(preset)}
                    >
                      <span className="preset-icon"><SpaceIcon symbol={preset.icon} size={22} /></span>
                      <div className="preset-text">
                        <b>{preset.name}</b>
                        <small>{preset.tag}</small>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Difficulty & Flight Mode */}
              <section className="difficulty-row" aria-label="Choose difficulty">
                <div className="difficulty-copy">
                  <p className="eyebrow">MISSION MODE</p>
                  <strong>Set your challenge</strong>
                </div>
                <div className="difficulty-options">
                  <button
                    type="button"
                    className={`difficulty-option ${design.difficulty === 'easy' ? 'is-selected' : ''}`}
                    onClick={() => {
                      soundFx.blip(true)
                      selectDifficulty('easy')
                    }}
                    aria-pressed={design.difficulty === 'easy'}
                  >
                    <b>Easy</b>
                    <small>Wider budgets · fewer events</small>
                  </button>
                  <button
                    type="button"
                    className={`difficulty-option ${design.difficulty === 'normal' ? 'is-selected' : ''}`}
                    onClick={() => {
                      soundFx.blip(true)
                      selectDifficulty('normal')
                    }}
                    aria-pressed={design.difficulty === 'normal'}
                  >
                    <b>Normal</b>
                    <small>Baseline limits · realistic</small>
                  </button>
                  <button
                    type="button"
                    className={`difficulty-option ${design.difficulty === 'hard' ? 'is-selected' : ''}`}
                    onClick={() => {
                      soundFx.blip(true)
                      selectDifficulty('hard')
                    }}
                    aria-pressed={design.difficulty === 'hard'}
                  >
                    <b>Hard</b>
                    <small>Tighter budget · strict margins</small>
                  </button>
                </div>
              </section>

              <div className="play-mode-row">
                <label htmlFor="play-mode">Flight mode</label>
                <select
                  id="play-mode"
                  value={design.playMode}
                  onChange={(event) => selectPlayMode(event.currentTarget.value as 'mission' | 'sandbox')}
                >
                  <option value="mission">Mission — NASA resource limits apply</option>
                  <option value="sandbox">Sandbox — explore without limits</option>
                </select>
                <p>
                  {design.playMode === 'sandbox'
                    ? 'Launch freely. Scores stay unranked.'
                    : 'All limits must be clear to launch.'}
                </p>
              </div>

              {/* Main Two-Column Design Layout */}
              <div className="design-layout">
                {/* Left Column: Tactile Hardware Builder */}
                <section className="panel hardware-panel" aria-labelledby="hardware-title">
                  <div className="section-heading">
                    <div>
                      <p className="eyebrow">SPACECRAFT CONFIGURATION</p>
                      <h2 id="hardware-title">Build the craft</h2>
                    </div>
                    <span className="parts-count">{selectedCount} instruments mounted</span>
                  </div>

                  {/* 01 Bus Chassis */}
                  <div className="subsection-heading">
                    <span className="subsection-index">01</span>
                    <div>
                      <h3>Spacecraft platform</h3>
                      <p>Main chassis, flight computer, and secondary batteries.</p>
                    </div>
                    <TermTip term="Spacecraft bus" />
                  </div>
                  <div className="bus-options" id="bus-options">
                    {buses.map((item) => (
                      <button
                        key={item.id}
                        className={`bus-option ${item.id === design.busId ? 'is-selected' : ''}`}
                        onClick={() => {
                          soundFx.mount(true)
                          selectBus(item.id)
                        }}
                        aria-pressed={item.id === design.busId}
                      >
                        <span className="bus-glyph" aria-hidden="true">
                          <SpaceIcon symbol={item.id === 'compact-bus' ? '🛰️' : item.id === 'survey-bus' ? '📡' : '🛸'} size={22} />
                        </span>
                        <span className="bus-copy">
                          <b>{item.name}</b>
                          <small>{item.description}</small>
                          <span className="part-spec">
                            {item.massKg} kg <i>·</i> {item.powerW} W <i>·</i> ${item.costMillionUsd}M
                          </span>
                        </span>
                        <span className="radio-dot" aria-hidden="true" />
                      </button>
                    ))}
                  </div>

                  {/* 02 Science Instruments (Streamlined, Visual & Tactile - Less Text!) */}
                  <div className="subsection-heading instrument-heading">
                    <span className="subsection-index">02</span>
                    <div>
                      <h3>Science instruments</h3>
                      <p>Pick 3 to 5 sensors to meet your mission objectives.</p>
                    </div>
                    <TermTip term="Science instruments" />
                    <span className="optional-label">{selectedCount} / 5 MOUNTED</span>
                  </div>

                  <div className="instrument-compact-grid" id="instrument-list">
                    {instruments.map((item) => {
                      const selected = design.instrumentIds.includes(item.id)
                      const icon = instrumentIcons[item.id] || '🔬'
                      return (
                        <label
                          key={item.id}
                          className={`instrument-tile ${selected ? 'is-selected' : ''}`}
                          title={item.description}
                        >
                          <div className="tile-top">
                            <span className="tile-icon"><SpaceIcon symbol={icon} size={21} /></span>
                            <span className="tile-name">{item.name}</span>
                            <input
                              type="checkbox"
                              checked={selected}
                              disabled={selected ? selectedCount <= 3 : selectedCount >= 5}
                              onChange={() => handleInstrumentToggle(item.id)}
                              aria-label={`Select ${item.name}`}
                            />
                          </div>

                          <div className="tile-chips">
                            <span className="tile-chip mass-chip"><SpaceIcon symbol="⚖️" size={14} /> {item.massKg} kg</span>
                            <span className="tile-chip power-chip"><SpaceIcon symbol="⚡" size={14} /> {item.powerW} W</span>
                            <span className="tile-chip sci-chip"><SpaceIcon symbol="🔬" size={14} /> +{item.scienceValue}</span>
                          </div>
                        </label>
                      )
                    })}
                  </div>

                  {/* Flight Tuning Accordion (Engine, Solar, Fuel, Orbit, Launcher) */}
                  <details className="flight-tuning" id="flight-tuning" ref={flightTuningRef} open>
                    <summary>
                      <span className="tuning-icon" aria-hidden="true">
                        ⌁
                      </span>
                      <span>
                        <b>Flight tuning</b>
                        <small>Engine · solar array · fuel tank · orbit · launch rocket</small>
                      </span>
                      <span className="tuning-chevron" aria-hidden="true">
                        ＋
                      </span>
                    </summary>
                    <div className="flight-tuning-content">
                      {/* 03 Engine */}
                      <div className="subsection-heading instrument-heading">
                        <span className="subsection-index">03</span>
                        <div>
                          <h3>Propulsion engine</h3>
                          <p>Chemical high-thrust burn or solar-electric ion fuel-saver.</p>
                        </div>
                        <TermTip term="Propulsion system" />
                      </div>
                      <div className="propulsion-options" id="propulsion-options">
                        {propulsionSystems.map((system) => {
                          const selected = system.id === propulsion.id
                          return (
                            <button
                              key={system.id}
                              type="button"
                              className={`propulsion-option ${selected ? 'is-selected' : ''}`}
                              onClick={() => {
                                soundFx.mount(true)
                                selectPropulsionSystem(system.id)
                              }}
                              aria-pressed={selected}
                            >
                              <span className="propulsion-icon" aria-hidden="true">
                                <SpaceIcon symbol={system.id === 'solar-electric-ion' ? '⚡' : '🔥'} />
                              </span>
                              <span className="propulsion-copy">
                                <b>{system.name}</b>
                                <small>{system.description}</small>
                                <span className="part-spec">
                                  Isp {system.specificImpulseSeconds}s · {system.powerW} W power
                                </span>
                              </span>
                              <span className="radio-dot" aria-hidden="true" />
                            </button>
                          )
                        })}
                      </div>

                      {/* 04 Solar Power Area */}
                      <div className="subsection-heading instrument-heading">
                        <span className="subsection-index">04</span>
                        <div>
                          <h3>Solar-panel arrays</h3>
                          <p>Scale panel area in 3D to match irradiance and instrument load.</p>
                        </div>
                      </div>
                      <div className="propellant-control solar-array-control">
                        <label htmlFor="solar-panel-slider">
                          <span>Solar-panel surface</span>
                          <b>{evaluation.solarPanelAreaM2.toFixed(1)} m²</b>
                        </label>
                        <input
                          id="solar-panel-slider"
                          type="range"
                          min="0.5"
                          max="5"
                          step="0.1"
                          value={evaluation.solarPanelAreaM2}
                          onChange={(event) => setSolarPanelArea(Number(event.currentTarget.value))}
                          aria-valuetext={`${evaluation.solarPanelAreaM2.toFixed(1)} square metres, producing ${evaluation.powerAvailableW} watts`}
                        />
                        <div className="slider-ends">
                          <span>0.5 m² (Micro)</span>
                          <span>5.0 m² (Deep Space Wing)</span>
                        </div>
                        <div className="solar-array-readouts">
                          <span>
                            Solar output: <b>{evaluation.powerAvailableW} W</b>
                          </span>
                          <span>
                            Shadow battery: <b>{evaluation.eclipseEnergyRequiredWh} Wh</b>
                          </span>
                          <span>
                            Array mass: <b>{evaluation.solarArrayMassKg.toFixed(1)} kg</b>
                          </span>
                        </div>
                      </div>

                      {/* 05 & 06 Propellant & Schedule */}
                      <div className="planning-grid">
                        <div className="planning-card">
                          <div className="subsection-heading instrument-heading">
                            <span className="subsection-index">05</span>
                            <div>
                              <h3>Propellant load</h3>
                              <p>Fuel mass directly adds delta-v and wet launch mass.</p>
                            </div>
                            <span className="optional-label">
                              {evaluation.propellantMassKg} / {evaluation.maxPropellantKg} KG
                            </span>
                          </div>
                          <div className="propellant-control">
                            <label htmlFor="propellant-slider">
                              <span>Fuel mass</span>
                              <b>{evaluation.propellantMassKg} kg</b>
                            </label>
                            <input
                              id="propellant-slider"
                              type="range"
                              min="0"
                              max={evaluation.maxPropellantKg}
                              step="1"
                              value={evaluation.propellantMassKg}
                              onChange={(event) => setPropellantMass(Number(event.currentTarget.value))}
                              aria-valuetext={`${evaluation.propellantMassKg} kilograms of propellant`}
                            />
                            <div className="slider-ends">
                              <span>0 kg</span>
                              <span>Max {evaluation.maxPropellantKg} kg</span>
                            </div>
                          </div>
                        </div>

                        <div className="planning-card">
                          <div className="subsection-heading instrument-heading">
                            <span className="subsection-index">06</span>
                            <div>
                              <h3>Mission schedule</h3>
                              <p>Development + operations against deadline.</p>
                            </div>
                            <span className="optional-label">
                              {evaluation.scheduleDurationDays} / {evaluation.missionDeadlineDays} DAYS
                            </span>
                          </div>
                          <div className="mission-duration-control">
                            <label className="schedule-slider-label" htmlFor="development-slider">
                              Development: <b>{evaluation.developmentDurationDays} days</b>
                            </label>
                            <input
                              id="development-slider"
                              type="range"
                              min="5"
                              max={Math.max(5, scenario.missionDeadlineDays - 30)}
                              step="5"
                              value={evaluation.developmentDurationDays}
                              onChange={(event) => setDevelopmentDuration(Number(event.currentTarget.value))}
                            />
                            <label className="schedule-slider-label" htmlFor="mission-duration-slider">
                              Flight Operations: <b>{evaluation.missionDurationDays} days</b>
                            </label>
                            <input
                              id="mission-duration-slider"
                              type="range"
                              min="30"
                              max={Math.max(30, scenario.missionDeadlineDays - evaluation.developmentDurationDays)}
                              step="1"
                              value={evaluation.missionDurationDays}
                              onChange={(event) => setMissionDuration(Number(event.currentTarget.value))}
                            />
                            <p className="schedule-total">
                              Total: <b>{evaluation.scheduleDurationDays} days</b> (Deadline:{' '}
                              {evaluation.missionDeadlineDays}d)
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 07 Orbit Path */}
                      <div className="subsection-heading instrument-heading">
                        <span className="subsection-index">07</span>
                        <div>
                          <h3>Orbit path</h3>
                          <p>Target altitude shapes eclipse duration and contact time.</p>
                        </div>
                        <TermTip term="Orbit options" />
                      </div>
                      <div className="orbit-options" id="orbit-options">
                        {scenario.orbits.map((item) => {
                          const periodMinutes = calculateOrbitPeriodMinutes(
                            item.altitudeKm,
                            scenario.bodyRadiusKm,
                            scenario.gravitationalParameterKm3PerSec2,
                          )
                          const selected = item.id === orbit.id
                          return (
                            <button
                              key={item.id}
                              type="button"
                              className={`orbit-option ${selected ? 'is-selected' : ''}`}
                              onClick={() => {
                                soundFx.blip(true)
                                selectOrbit(item.id)
                              }}
                              aria-pressed={selected}
                            >
                              <span className="orbit-option-top">
                                <b>{item.name}</b>
                                <span>{item.altitudeKm} km</span>
                              </span>
                              <span className="orbit-option-meta">
                                {periodMinutes} min/orbit · {item.contactMinutesPerDay} min contact ·{' '}
                                <span
                                  className={
                                    estimateRadiationRisk(scenario.bodyId, item.altitudeKm) >= 55
                                      ? 'radiation-high'
                                      : 'radiation-low'
                                  }
                                >
                                  ☢ {estimateRadiationRisk(scenario.bodyId, item.altitudeKm)} risk
                                </span>
                              </span>
                            </button>
                          )
                        })}
                      </div>

                      {/* 08 Launch Rocket */}
                      <div className="subsection-heading instrument-heading">
                        <span className="subsection-index">08</span>
                        <div>
                          <h3>Launch vehicle</h3>
                          <p>Choose rocket payload lift capacity to match wet spacecraft mass.</p>
                        </div>
                        <TermTip term="Launch vehicle" />
                      </div>
                      <div className="launcher-options" id="launcher-options">
                        {launchVehicles.map((vehicle) => {
                          const capacityKg = Math.floor(
                            vehicle.payloadCapacityKgByBody[scenario.bodyId] * orbit.launchCapacityFactor,
                          )
                          const costMillionUsd = vehicle.costMillionUsdByBody[scenario.bodyId]
                          const selected = vehicle.id === launchVehicle.id
                          return (
                            <button
                              key={vehicle.id}
                              type="button"
                              className={`launcher-option ${selected ? 'is-selected' : ''}`}
                              onClick={() => {
                                soundFx.mount(true)
                                selectLaunchVehicle(vehicle.id)
                              }}
                              aria-pressed={selected}
                            >
                              <span className="launcher-option-top">
                                <img
                                  className="launcher-symbol"
                                  src={`/assets/launch-${vehicle.id}.svg`}
                                  width="36"
                                  height="36"
                                  alt=""
                                  loading="lazy"
                                  decoding="async"
                                />
                                <b>{vehicle.name}</b>
                                <span>${costMillionUsd}M</span>
                              </span>
                              <small>{vehicle.description}</small>
                              <span className="part-spec">{capacityKg.toLocaleString()} kg to orbit</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </details>

                  {/* 1-Click Interactive Quick-Fix Action Pills (Eliminates Text-Heavy Error Wall!) */}
                  {quickFixes.length > 0 && (
                    <div className="quick-fixes-deck">
                      <div className="fixes-header">
                        <span className="fixes-title"><SpaceIcon symbol="⚡" size={16} /> 1-CLICK SYSTEM FIXES:</span>
                        <small>Tap an action to automatically rebalance your mission</small>
                      </div>
                      <div className="fixes-pills-row">
                        {quickFixes.map((fix) => (
                          <button
                            key={fix.id}
                            type="button"
                            className="quick-fix-pill"
                            onClick={fix.execute}
                          >
                            <span className="fix-tag">{fix.badge}</span>
                            <b>{fix.label}</b>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Launch Mission Master CTA */}
                  <button
                    className={`launch-button ${canLaunch ? 'is-ready' : 'is-locked'}`}
                    type="button"
                    disabled={!canLaunch}
                    onClick={() => launchMission()}
                  >
                    <><SpaceIcon symbol={canLaunch ? '🚀' : '⚠️'} size={18} /> {canLaunch ? 'Launch Mission to Orbit' : 'Launch Blocked — Apply 1-Click Fix'}</>
                    <span aria-hidden="true">→</span>
                  </button>

                  <p className="launch-hint">
                    {design.playMode === 'sandbox'
                      ? 'Sandbox Mode · No constraint limits applied.'
                      : canLaunch
                        ? 'All systems nominal · Ready for countdown and TLI burn.'
                        : 'Review the 1-Click Fixes above to clear remaining margin limits.'}
                  </p>
                </section>

                {/* Right Column: Mission Meters & Flight Geometry */}
                <aside className="right-column">
                  <DesignSummary evaluation={evaluation} />

                  <section className="panel why-panel" aria-labelledby="why-title">
                    <div className="section-heading">
                      <div>
                        <p className="eyebrow">THE WHY ENGINE</p>
                        <h2 id="why-title">Design feedback</h2>
                      </div>
                      <span className="reason-count">
                        {designIssues.length || 'ALL'}
                        <small>{designIssues.length ? 'TO REVIEW' : 'CLEAR'}</small>
                      </span>
                    </div>
                    {designIssues.length > 0 ? (
                      <div className="reason-list">
                        {designIssues.map((reason) => (
                          <ReasonCard key={reason.id} reason={reason} />
                        ))}
                      </div>
                    ) : (
                      <div className="all-clear">
                        <span aria-hidden="true">✓</span>
                        <b>All systems nominal.</b>
                        <p>Your design satisfies all NASA physics &amp; JPL CML margin constraints.</p>
                      </div>
                    )}
                  </section>

                  <OrbitDiagram scenario={scenario} orbit={orbit} />
                </aside>
              </div>

              {/* Optional Mission Tools Drawer */}
              <details className="mission-tools">
                <summary>
                  <span>
                    <small>ADVANCED</small>
                    <b>Mission tools &amp; saved designs</b>
                  </span>
                  <span aria-hidden="true">+</span>
                </summary>
                <div className="mission-tools-content">
                  <DesignLibraryPanel design={design} onLoad={(savedDesign) => replaceDesign(savedDesign)} />
                  <MissionLearningCards scenario={scenario} />
                </div>
              </details>
            </>
          )}
        </main>
        </div>

        <footer className="page-footer">
          <span>GALAXY RUN <i>·</i> NASA SPACE APPS CHALLENGE 2026</span>
          <span>SYSTEMS ENGINEERING &amp; 3D FLIGHT LAB</span>
        </footer>
      </div>

      {/* NASA Mission Fleet & CML Knowledge Archive Modal */}
      <NasaMissionHubModal
        isOpen={nasaModalOpen}
        onClose={() => setNasaModalOpen(false)}
        design={design}
        evaluation={evaluation}
      />
    </>
  )
}
