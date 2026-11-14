import { evaluateDesign } from './evaluateDesign.ts'
import type {
  MissionDesign,
  LaunchVehicle,
  MissionScenario,
  MissionSimulation,
  MissionTimelineEvent,
  PropulsionSystem,
  Reason,
  SpacecraftPart,
} from './types.ts'

function createRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

export function simulateMission(
  design: MissionDesign,
  scenario: MissionScenario,
  catalog: SpacecraftPart[],
  launchVehicles: LaunchVehicle[],
  propulsionSystems: PropulsionSystem[],
  seed: number,
  collaborationScore = 0,
): MissionSimulation {
  const evaluation = evaluateDesign(design, scenario, catalog, launchVehicles, propulsionSystems)
  const random = createRandom(seed)
  const launchVehicleName = launchVehicles.find((vehicle) => vehicle.id === design.launchVehicleId)?.name ?? 'Launch vehicle'
  const designFailed = design.playMode !== 'sandbox' && evaluation.reasons.some((reason) => reason.status === 'fail')
  const durationFactor = Math.min(evaluation.missionDurationDays / 60, 2)
  const eventChance = (design.difficulty === 'easy' ? 0.1 : design.difficulty === 'hard' ? 0.3 : 0.2) * durationFactor
  const delay = !designFailed && random() < eventChance
  const flare = !designFailed && random() < eventChance
  const instrumentFault = !designFailed && random() < eventChance
  const communicationsDropout = !designFailed && random() < eventChance
  const systemAnomaly = !designFailed && random() >= evaluation.reliabilityPercent / 100
  const hiddenRisk = !designFailed && design.difficulty === 'hard' && random() < 0.12
  const budgetCut = !designFailed && random() < eventChance * 0.75
  const operationsFactor = budgetCut ? 0.8 : 1

  const timeline: MissionTimelineEvent[] = [
    {
      phase: '01 / LAUNCH',
      title: designFailed ? 'Launch held at review' : 'Spacecraft reached orbit',
      detail: designFailed
        ? 'A design limit is exceeded, so the mission cannot safely launch.'
        : `${launchVehicleName} placed the spacecraft into its ${evaluation.orbitAltitudeKm} km orbit. One orbit takes ${evaluation.orbitPeriodMinutes} minutes; ${evaluation.missionDurationDays} mission days are planned with ${evaluation.deltaVMps} m/s of delta-v available.`,
      status: designFailed ? 'fail' : 'ok',
    },
  ]

  if (!designFailed) {
    timeline.push({
      phase: '02 / CRUISE',
      title: delay ? 'Launch window delay' : 'Cruise checks nominal',
      detail: delay
        ? 'A short launch delay used part of the mission schedule, but the spacecraft reached orbit.'
        : 'Navigation and spacecraft systems stayed within their planned limits.',
      status: delay ? 'warn' : 'ok',
    })
    timeline.push({
      phase: '03 / OPERATIONS',
      title: hiddenRisk ? 'Unforecast spacecraft fault' : systemAnomaly ? 'Thermal system anomaly' : budgetCut ? 'Operations scaled back after funding cut' : flare ? 'Solar flare disrupted operations' : instrumentFault ? 'Instrument glitch detected' : 'Science instruments operating',
      detail: flare
        ? 'A solar flare reduced useful observation time during this pass.'
        : systemAnomaly
          ? 'A seeded thermal or component anomaly forced a safe-mode period; the remaining systems resumed observations afterward.'
          : budgetCut
            ? 'A seeded mid-mission funding cut reduced active observation time by 20%; the team protected the highest-priority science.'
          : instrumentFault
          ? 'One instrument missed part of its observation window; the other payload continued.'
        : `The selected payload operated through the ${evaluation.missionDurationDays}-day observation plan.`,
      status: flare || instrumentFault || systemAnomaly || budgetCut || hiddenRisk ? 'warn' : 'ok',
    })
    timeline.push({
      phase: '04 / DOWNLINK',
      title: communicationsDropout ? 'Short communications dropout' : 'Data received on Earth',
      detail: communicationsDropout
        ? 'A temporary link interruption reduced the amount of data returned this pass.'
        : 'The ground link received the available science data.',
      status: communicationsDropout ? 'warn' : 'ok',
    })
  }

  const activeOperationsDays = evaluation.missionDurationDays * operationsFactor
  const collectedGb = evaluation.dataGbPerDay * activeOperationsDays
  const linkCapacityGb = communicationsDropout
    ? evaluation.dataLimitGbPerDay * evaluation.missionDurationDays * 0.6
    : evaluation.dataLimitGbPerDay * evaluation.missionDurationDays
  const returnedGb = designFailed ? 0 : Math.min(collectedGb, linkCapacityGb)
  const dataRatio = collectedGb > 0 ? returnedGb / collectedGb : 0
  const scienceFactor = (flare ? 0.85 : 1) * (instrumentFault ? 0.85 : 1) * (systemAnomaly ? 0.7 : 1) * (hiddenRisk ? 0.82 : 1)
  const scienceDelivered = Math.round(evaluation.scienceValue * operationsFactor * dataRatio * scienceFactor)

  if (!designFailed) {
    timeline.push({
      phase: '05 / MISSION RESULT',
      title: returnedGb > 0 ? 'Mission returned useful science' : 'No science data returned',
      detail: `${returnedGb.toFixed(1)} of ${collectedGb.toFixed(1)} GB reached Earth over ${evaluation.missionDurationDays} days, delivering ${scienceDelivered} science points.`,
      status: returnedGb > 0 ? 'ok' : 'warn',
    })
  }

  const utilization = [
    evaluation.massKg / evaluation.launchCapacityKg,
    evaluation.powerW / evaluation.powerAvailableW,
    evaluation.costMillionUsd / evaluation.budgetMillionUsd,
    Math.min(evaluation.dataGbPerDay / evaluation.dataLimitGbPerDay, 1.5),
  ]
  const efficiencyScore = clampScore(100 - utilization.reduce((sum, value) => sum + value * 18, 0))
  const scienceScore = clampScore(scienceDelivered * 4)
  const eventCount = Number(delay) + Number(flare) + Number(instrumentFault) + Number(communicationsDropout) + Number(systemAnomaly) + Number(budgetCut) + Number(hiddenRisk)
  const reliabilityScore = clampScore(100 - eventCount * 12 - (designFailed ? 60 : 0))
  const learningScore = clampScore(100 - evaluation.reasons.filter((reason) => reason.status !== 'ok').length * 10)
  const baseScore = scienceScore * 0.35 + efficiencyScore * 0.25 + reliabilityScore * 0.25 + learningScore * 0.15
  const score = clampScore(design.teamMode ? baseScore * 0.9 + collaborationScore * 0.1 : baseScore)

  const eventReasons: Reason[] = []
  if (delay) {
    eventReasons.push({
      id: 'launch-delay', status: 'warn',
      cause: 'A seeded launch-window delay postponed the start of the mission.',
      effect: 'The mission has less schedule margin for later work.',
      fix: 'Leave schedule margin for launch-window interruptions.',
    })
  }
  if (flare) {
    eventReasons.push({
      id: 'solar-flare', status: 'warn',
      cause: 'A seeded solar flare reduced observation time.',
      effect: 'The instruments returned less useful science during this mission.',
      fix: 'Add radiation protection or plan observations around high-risk periods.',
    })
  }
  if (instrumentFault) {
    eventReasons.push({
      id: 'instrument-glitch', status: 'warn',
      cause: 'A seeded instrument glitch interrupted one observation window.',
      effect: 'The affected instrument contributed less science data.',
      fix: 'Choose a more reliable instrument or add redundancy in a later design.',
    })
  }
  if (communicationsDropout) {
    eventReasons.push({
      id: 'communications-dropout', status: 'warn',
      cause: 'A seeded communications dropout shortened the data pass.',
      effect: 'Less collected data reached Earth.',
      fix: 'Increase link margin or reduce the amount of data collected per day.',
    })
  }
  if (systemAnomaly) {
    eventReasons.push({
      id: 'system-anomaly', status: 'warn',
      cause: `A seeded thermal or component anomaly occurred; the design estimate was ${evaluation.reliabilityPercent}% reliability.`,
      effect: 'Safe mode reduced observation time and science return for this run.',
      fix: 'Improve component reliability or thermal tolerance, or shorten the mission duration.',
    })
  }
  if (budgetCut) {
    eventReasons.push({
      id: 'budget-cut', status: 'warn',
      cause: 'A seeded mid-mission funding cut reduced active observation time by 20%.',
      effect: 'The spacecraft collected less data and delivered fewer science points, while the team prioritized its most valuable observations.',
      fix: 'Keep an operations reserve or make the science plan resilient to reduced funding.',
    })
  }
  if (hiddenRisk) {
    eventReasons.push({
      id: 'hidden-risk', status: 'warn',
      cause: 'A Hard-mode contingency caused an unforecast spacecraft fault.',
      effect: 'The fault shortened productive observation time in this run.',
      fix: 'Keep reliability and schedule margin for risks that are not visible during design.',
    })
  }
  const reasons = [...evaluation.reasons, ...eventReasons]
  const achievements = [
    ...(!designFailed ? ['Orbit reached'] : []),
    ...(returnedGb >= 10 ? ['First 10 GB home'] : []),
    ...(design.difficulty === 'hard' && !designFailed ? ['Hard flight certified'] : []),
    ...(design.teamMode && collaborationScore === 100 ? ['Crew in agreement'] : []),
    ...(design.playMode === 'sandbox' ? ['Sandbox explorer'] : []),
  ]

  return {
    seed,
    difficulty: design.difficulty,
    playMode: design.playMode,
    collaborationScore: design.teamMode ? clampScore(collaborationScore) : 0,
    scenarioId: scenario.id,
    achievements,
    missionDurationDays: evaluation.missionDurationDays,
    success: !designFailed && returnedGb > 0,
    score,
    grade: score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : 'D',
    scienceScore,
    efficiencyScore,
    reliabilityScore,
    learningScore,
    collectedGb,
    returnedGb,
    scienceDelivered,
    timeline,
    reasons,
  }
}
