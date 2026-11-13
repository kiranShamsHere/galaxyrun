import type {
  DesignEvaluation,
  LaunchVehicle,
  MissionDesign,
  MissionScenario,
  PropulsionSystem,
  Reason,
  SpacecraftPart,
} from './types.ts'
import { calculateDownlinkCapacityGb, calculateOrbitPeriodMinutes, calculateRocketDeltaVMps } from './orbit.ts'

export function evaluateDesign(
  design: MissionDesign,
  scenario: MissionScenario,
  catalog: SpacecraftPart[],
  launchVehicles: LaunchVehicle[],
  propulsionSystems: PropulsionSystem[],
): DesignEvaluation {
  const orbit = scenario.orbits.find((item) => item.id === design.orbitId) ?? scenario.orbits[0]
  const launchVehicle = launchVehicles.find((item) => item.id === design.launchVehicleId) ?? launchVehicles[0]
  const propulsion = propulsionSystems.find((item) => item.id === design.propulsionId) ?? propulsionSystems[0]
  const missionDurationDays = Math.max(1, design.missionDurationDays)
  const selectedParts = [design.busId, ...design.instrumentIds]
    .map((id) => catalog.find((part) => part.id === id))
    .filter((part): part is SpacecraftPart => part !== undefined)
  const includedSystems = [
    ...selectedParts.map((part) => ({ reliability: part.reliabilityPer30Days, thermalTolerance: part.thermalTolerance })),
    { reliability: propulsion.reliabilityPer30Days, thermalTolerance: propulsion.thermalTolerance },
  ]
  const thirtyDayReliability = includedSystems.reduce((total, system) => total * system.reliability, 1)
  const averageThermalTolerance = includedSystems.length
    ? includedSystems.reduce((total, system) => total + system.thermalTolerance, 0) / includedSystems.length
    : 1
  const thermalRiskPercent = Math.round(
    Math.max(0, Math.min(0.75, (1 - averageThermalTolerance) * scenario.environmentStress * orbit.thermalExposureFactor)) * 100,
  )
  const reliabilityPercent = Math.round(
    Math.max(0, Math.min(1, thirtyDayReliability ** (missionDurationDays / 30) * (1 - thermalRiskPercent / 100))) * 100,
  )

  const payloadMassKg = selectedParts.reduce((total, part) => total + part.massKg, 0)
  const dryMassKg = payloadMassKg + propulsion.dryMassKg
  const propellantMassKg = Math.max(0, Math.min(design.propellantMassKg, propulsion.maxPropellantKg))
  const massKg = dryMassKg + propellantMassKg
  const powerW = selectedParts.reduce((total, part) => total + part.powerW, propulsion.powerW)
  const hardwareCostMillionUsd = selectedParts.reduce(
    (total, part) => total + part.costMillionUsd,
    0,
  )
  const launchCostMillionUsd = launchVehicle.costMillionUsdByBody[scenario.bodyId] ?? 0
  const operationsCostMillionUsd = missionDurationDays * scenario.operationsCostMillionUsdPerDay
  const costMillionUsd = hardwareCostMillionUsd + launchCostMillionUsd + propulsion.costMillionUsd + operationsCostMillionUsd
  const dataGbPerDay = selectedParts.reduce(
    (total, part) => total + part.dataGbPerDay,
    0,
  )
  const baseScienceValue = selectedParts.reduce(
    (total, part) => total + part.scienceValue,
    0,
  )
  const scienceValue = Math.round(baseScienceValue * missionDurationDays / 30 * 10) / 10
  const launchCapacityKg = Math.floor(
    (launchVehicle.payloadCapacityKgByBody[scenario.bodyId] ?? 0) * orbit.launchCapacityFactor,
  )
  const allowanceFactor = design.difficulty === 'easy' ? 1.2 : 1
  const powerAvailableW = Math.round(scenario.powerAvailableW * allowanceFactor)
  const budgetMillionUsd = Math.round(scenario.budgetMillionUsd * allowanceFactor)
  const contactMinutesPerDay = Math.round(orbit.contactMinutesPerDay * allowanceFactor)
  const dataLimitGbPerDay = Math.round(
    calculateDownlinkCapacityGb(scenario.downlinkRateMbps, contactMinutesPerDay) * 10,
  ) / 10
  const orbitPeriodMinutes = calculateOrbitPeriodMinutes(
    orbit.altitudeKm,
    scenario.bodyRadiusKm,
    scenario.gravitationalParameterKm3PerSec2,
  )
  const deltaVMps = Math.round(calculateRocketDeltaVMps(
    propulsion.specificImpulseSeconds,
    dryMassKg + propellantMassKg,
    dryMassKg,
  ))

  const reasons: Reason[] = [
    {
      id: 'mass-budget',
      status: massKg <= launchCapacityKg ? 'ok' : 'fail',
      cause: `${launchVehicle.name} can carry ${launchCapacityKg} kg to this orbit; the spacecraft uses ${massKg} kg.`,
      effect:
        massKg <= launchCapacityKg
          ? 'The selected launch vehicle can carry this spacecraft to the chosen orbit.'
          : 'The launch vehicle cannot carry this design to the selected orbit.',
      fix:
        massKg <= launchCapacityKg
          ? 'Keep some payload capacity in reserve for later design changes.'
          : 'Choose a larger launch vehicle or reduce spacecraft mass.',
    },
    {
      id: 'power-budget',
      status: powerW <= powerAvailableW ? 'ok' : 'fail',
      cause: `The selected parts need ${powerW} W; the solar array supplies ${powerAvailableW} W.`,
      effect:
        powerW <= powerAvailableW
          ? 'The spacecraft has enough power for the selected equipment.'
          : 'Some instruments may have to shut down during operations.',
      fix:
        powerW <= powerAvailableW
          ? 'Leave a power margin for eclipse and aging.'
          : 'Select lower-power instruments or add power capacity.',
    },
    {
      id: 'delta-v-budget',
      status: deltaVMps >= scenario.requiredDeltaVMps ? 'ok' : 'fail',
      cause: `${propulsion.name} provides ${deltaVMps} m/s; this mission needs ${scenario.requiredDeltaVMps} m/s.`,
      effect:
        deltaVMps >= scenario.requiredDeltaVMps
          ? 'The propulsion system can provide the planned maneuver budget.'
          : 'The spacecraft cannot complete the planned orbit and correction maneuvers.',
      fix:
        deltaVMps >= scenario.requiredDeltaVMps
          ? 'Keep a propellant reserve for corrections during the mission.'
          : 'Add propellant if launch mass allows, or choose a higher-specific-impulse drive.',
    },
    {
      id: 'cost-budget',
      status: costMillionUsd <= budgetMillionUsd ? 'ok' : 'fail',
      cause: `Hardware, propulsion, ${launchVehicle.name} launch, and ${missionDurationDays} days of operations cost $${costMillionUsd}M of a $${budgetMillionUsd}M cap.`,
      effect:
        costMillionUsd <= budgetMillionUsd
          ? 'The hardware stays within the scenario budget.'
          : 'The mission exceeds its available budget before launch and operations.',
      fix:
        costMillionUsd <= budgetMillionUsd
          ? 'Keep part of the budget available for launch and operations.'
          : 'Swap expensive hardware for a lower-cost option.',
    },
    {
      id: 'data-budget',
      status: dataGbPerDay <= dataLimitGbPerDay ? 'ok' : 'warn',
      cause: `Instruments collect ${dataGbPerDay} GB per day; the link returns up to ${dataLimitGbPerDay} GB at ${scenario.downlinkRateMbps} Mbps.`,
      effect:
        dataGbPerDay <= dataLimitGbPerDay
          ? 'The planned observations fit the daily data return limit.'
          : 'Some collected observations may be lost before they reach Earth.',
      fix:
        dataGbPerDay <= dataLimitGbPerDay
          ? 'The data plan fits; keep an eye on it if you add instruments.'
          : 'Reduce instrument data volume or improve the communications link.',
    },
    {
      id: 'mission-deadline',
      status: missionDurationDays <= scenario.missionDeadlineDays ? 'ok' : 'fail',
      cause: `The mission is planned for ${missionDurationDays} days; the scenario deadline is ${scenario.missionDeadlineDays} days.`,
      effect:
        missionDurationDays <= scenario.missionDeadlineDays
          ? 'The mission fits within the available operations window.'
          : 'The mission would miss its scenario deadline.',
      fix: 'Shorten the mission plan to fit the available operations window.',
    },
    {
      id: 'thermal-exposure',
      status: thermalRiskPercent > 12 ? 'warn' : 'ok',
      cause: `The selected systems and ${orbit.name} orbit produce an estimated ${thermalRiskPercent}% thermal-stress risk for this scenario.`,
      effect: thermalRiskPercent > 12
        ? 'Thermal stress could reduce instrument availability during operations.'
        : 'The thermal model shows manageable stress for the selected systems and orbit.',
      fix: 'Choose components with higher thermal tolerance or use a lower-exposure orbit.',
    },
    {
      id: 'mission-reliability',
      status: reliabilityPercent < 80 ? 'warn' : 'ok',
      cause: `The simplified system model estimates ${reliabilityPercent}% reliability over ${missionDurationDays} days, including thermal exposure.`,
      effect: reliabilityPercent < 80
        ? 'A seeded system anomaly is more likely to reduce science return.'
        : 'The selected systems have a healthy estimated reliability margin for this duration.',
      fix: 'Shorten the mission, select more reliable components, or reduce thermal exposure.',
    },
  ]

  return {
    massKg,
    powerW,
    costMillionUsd,
    dataGbPerDay,
    scienceValue,
    launchCapacityKg,
    powerAvailableW,
    budgetMillionUsd,
    dataLimitGbPerDay,
    orbitAltitudeKm: orbit.altitudeKm,
    orbitPeriodMinutes,
    launchCostMillionUsd,
    contactMinutesPerDay,
    dryMassKg,
    propellantMassKg,
    deltaVMps,
    requiredDeltaVMps: scenario.requiredDeltaVMps,
    specificImpulseSeconds: propulsion.specificImpulseSeconds,
    maxPropellantKg: propulsion.maxPropellantKg,
    missionDurationDays,
    missionDeadlineDays: scenario.missionDeadlineDays,
    operationsCostMillionUsd,
    reliabilityPercent,
    thermalRiskPercent,
    reasons,
  }
}
