import { describe, expect, it } from 'vitest'
import { launchVehicles, parts, propulsionSystems, scenarios } from '../data/catalog.ts'
import { missionConstants } from '../data/missionConstants.ts'
import { evaluateDesign } from './evaluateDesign.ts'
import { calculateDownlinkCapacityGb, calculateOrbitPeriodMinutes, calculateRocketDeltaVMps } from './orbit.ts'
import { calculateEclipseEnergyWh, calculateSolarPowerW } from './power.ts'
import { simulateMission } from './simulateMission.ts'
import type { MissionDesign } from './types.ts'

const earth = scenarios[0]
const defaultDesign: MissionDesign = {
  scenarioId: earth.id,
  busId: 'compact-bus',
  launchVehicleId: 'pathfinder',
  orbitId: 'earth-620',
  propulsionId: 'chemical-upper-stage',
  propellantMassKg: 65,
  developmentDurationDays: 30,
  missionDurationDays: 60,
  difficulty: 'easy',
  playMode: 'mission',
  instrumentIds: ['climate-camera', 'thermal-imager', 'spectrometer'],
  solarPanelAreaM2: 1.5,
}

describe('mission formulas', () => {
  it('uses the cited, rounded planetary constants in every scenario', () => {
    expect(missionConstants.earth).toMatchObject({ meanRadiusKm: 6371, gravitationalParameterKm3PerSec2: 398600.4 })
    expect(missionConstants.moon).toMatchObject({ meanRadiusKm: 1737.4, gravitationalParameterKm3PerSec2: 4902.8 })
    expect(missionConstants.mars).toMatchObject({ meanRadiusKm: 3389.5, gravitationalParameterKm3PerSec2: 42828.4 })
    expect(missionConstants.venus).toMatchObject({ meanRadiusKm: 6051.8, gravitationalParameterKm3PerSec2: 324858.592 })
    expect(scenarios.map((scenario) => scenario.bodyRadiusKm)).toEqual([6371, 1737.4, 3389.5, 6051.8])
  })

  it('computes a circular orbit period from gravitational parameter and orbital radius', () => {
    expect(calculateOrbitPeriodMinutes(400, 6371, 398600.4)).toBeCloseTo(92.4, 1)
    expect(calculateOrbitPeriodMinutes(620, 6371, 398600.4)).toBeCloseTo(97, 0)
  })

  it('matches the hand-checkable ideal rocket equation example', () => {
    expect(calculateRocketDeltaVMps(300, 500, 400)).toBeCloseTo(656.7, 1)
  })

  it('converts a 50 Mbps, 48-minute contact window into decimal GB', () => {
    expect(calculateDownlinkCapacityGb(50, 48)).toBe(18)
    expect(calculateDownlinkCapacityGb(50, 8)).toBe(3)
  })

  it('checks the solar-array and eclipse-battery examples from the proposal', () => {
    expect(calculateSolarPowerW(0.8, 1361, 0.28)).toBeCloseTo(305, 0)
    expect(calculateEclipseEnergyWh(400, 34)).toBeCloseTo(226.7, 1)
  })

  it('counts development and operations against the total scenario deadline', () => {
    const design = { ...defaultDesign, developmentDurationDays: 70, missionDurationDays: 60 }
    const evaluation = evaluateDesign(design, earth, parts, launchVehicles, propulsionSystems)
    expect(evaluation.scheduleDurationDays).toBe(130)
    expect(evaluation.reasons.find((reason) => reason.id === 'mission-deadline')?.status).toBe('fail')
    expect(evaluation.reasons.find((reason) => reason.id === 'mission-deadline')?.cause).toContain('70 days')
  })

  it('uses stricter limits for Hard difficulty', () => {
    const hard = evaluateDesign({ ...defaultDesign, difficulty: 'hard' }, earth, parts, launchVehicles, propulsionSystems)
    const standard = evaluateDesign(defaultDesign, earth, parts, launchVehicles, propulsionSystems)
    expect(hard.budgetMillionUsd).toBeLessThan(standard.budgetMillionUsd)
  })

  it('lets Sandbox launch a design that fails a mission resource gate', () => {
    const sandbox = { ...defaultDesign, playMode: 'sandbox' as const, propellantMassKg: 0 }
    const result = simulateMission(sandbox, earth, parts, launchVehicles, propulsionSystems, 2026)
    expect(result.success).toBe(true)
    expect(result.achievements).toContain('Sandbox explorer')
  })

  it('evaluates component totals, caps, duration costs, orbit, and delta-v consistently', () => {
    const evaluation = evaluateDesign(defaultDesign, earth, parts, launchVehicles, propulsionSystems)
    const chosen = [parts.find((part) => part.id === defaultDesign.busId), ...defaultDesign.instrumentIds.map((id) => parts.find((part) => part.id === id))]
      .filter((part) => part !== undefined)
    const propulsion = propulsionSystems.find((item) => item.id === defaultDesign.propulsionId)!
    const orbit = earth.orbits.find((item) => item.id === defaultDesign.orbitId)!
    const systems = [...chosen, propulsion]
    const easyFactor = 1.2
    const modeledThermalRisk = Math.round(Math.min(0.75,
      (1 - systems.reduce((sum, system) => sum + system.thermalTolerance, 0) / systems.length)
      * earth.environmentStress * orbit.thermalExposureFactor,
    ) * 100)
    const thirtyDayReliability = systems.reduce((reliability, system) => reliability * system.reliabilityPer30Days, 1)

    expect(evaluation.massKg).toBe(chosen.reduce((sum, part) => sum + part.massKg, propulsion.dryMassKg) + evaluation.solarArrayMassKg + defaultDesign.propellantMassKg)
    expect(evaluation.powerW).toBe(chosen.reduce((sum, part) => sum + part.powerW, propulsion.powerW))
    expect(evaluation.costMillionUsd).toBe(chosen.reduce((sum, part) => sum + part.costMillionUsd, 0) + propulsion.costMillionUsd + 35 + evaluation.solarArrayCostMillionUsd + 60 * earth.operationsCostMillionUsdPerDay)
    expect(evaluation.scienceValue).toBe(Math.round(chosen.reduce((sum, part) => sum + part.scienceValue, 0) * 2 * 10) / 10)
    expect(evaluation.launchCapacityKg).toBe(Math.floor(520 * orbit.launchCapacityFactor))
    expect(evaluation.powerAvailableW).toBe(Math.round(defaultDesign.solarPanelAreaM2 * earth.solarIrradianceWPerM2 * 0.28))
    expect(evaluation.eclipseEnergyRequiredWh).toBeCloseTo(evaluation.powerW * orbit.eclipseMinutesPerOrbit / 60, 1)
    expect(evaluation.dataLimitGbPerDay).toBe(Math.round(earth.downlinkRateMbps * Math.round(orbit.contactMinutesPerDay * easyFactor) * 60 / 8 / 1000 * 10) / 10)
    expect(evaluation.orbitPeriodMinutes).toBe(calculateOrbitPeriodMinutes(orbit.altitudeKm, earth.bodyRadiusKm, earth.gravitationalParameterKm3PerSec2))
    expect(evaluation.deltaVMps).toBe(Math.round(calculateRocketDeltaVMps(propulsion.specificImpulseSeconds, evaluation.massKg, evaluation.dryMassKg)))
    expect(evaluation.operationsCostMillionUsd).toBe(60 * earth.operationsCostMillionUsdPerDay)
    expect(evaluation.missionDeadlineDays).toBe(earth.missionDeadlineDays)
    expect(evaluation.thermalRiskPercent).toBe(modeledThermalRisk)
    expect(evaluation.reliabilityPercent).toBe(Math.round(thirtyDayReliability ** 2 * (1 - modeledThermalRisk / 100) * 100))
  })

  it('replays an identical seeded run and returns useful science for a valid baseline', () => {
    const first = simulateMission(defaultDesign, earth, parts, launchVehicles, propulsionSystems, 2026)
    const replay = simulateMission(defaultDesign, earth, parts, launchVehicles, propulsionSystems, 2026)
    expect(replay).toEqual(first)
    expect(first.success).toBe(true)
    expect(first.score).toBeGreaterThanOrEqual(0)
    expect(first.score).toBeLessThanOrEqual(100)
    expect(first.returnedGb).toBeLessThanOrEqual(first.collectedGb)
    expect(first.scienceDelivered).toBeGreaterThanOrEqual(0)
    const evaluation = evaluateDesign(defaultDesign, earth, parts, launchVehicles, propulsionSystems)
    const eventIds = new Set(first.reasons.map((reason) => reason.id))
    const operationsFactor = eventIds.has('budget-cut') ? 0.8 : 1
    const expectedCollectedGb = evaluation.dataGbPerDay * evaluation.missionDurationDays * operationsFactor
    const expectedLinkCapacityGb = evaluation.dataLimitGbPerDay * evaluation.missionDurationDays * (eventIds.has('communications-dropout') ? 0.6 : 1)
    const expectedScienceFactor = (eventIds.has('solar-flare') ? 0.85 : 1)
      * (eventIds.has('instrument-glitch') ? 0.85 : 1)
      * (eventIds.has('system-anomaly') ? 0.7 : 1)
    expect(first.collectedGb).toBe(expectedCollectedGb)
    expect(first.returnedGb).toBe(Math.min(expectedCollectedGb, expectedLinkCapacityGb))
    expect(first.scienceDelivered).toBe(Math.round(evaluation.scienceValue * operationsFactor * (expectedCollectedGb > 0 ? first.returnedGb / expectedCollectedGb : 0) * expectedScienceFactor))
    expect(first.score).toBe(Math.round(first.scienceScore * 0.35 + first.efficiencyScore * 0.25 + first.reliabilityScore * 0.25 + first.learningScore * 0.15))
  })
})
