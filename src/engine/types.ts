export type Status = 'ok' | 'warn' | 'fail'
export type Difficulty = 'easy' | 'normal' | 'hard'
export type PlayMode = 'mission' | 'sandbox'

export type MissionScenario = {
  id: string
  name: string
  destination: string
  objective: string
  bodyId: string
  bodyRadiusKm: number
  gravitationalParameterKm3PerSec2: number
  requiredDeltaVMps: number
  missionDeadlineDays: number
  defaultMissionDays: number
  environmentStress: number
  operationsCostMillionUsdPerDay: number
  downlinkRateMbps: number
  solarIrradianceWPerM2: number
  defaultSolarPanelAreaM2: number
  orbits: OrbitOption[]
  budgetMillionUsd: number
}

export type OrbitOption = {
  id: string
  name: string
  altitudeKm: number
  launchCapacityFactor: number
  contactMinutesPerDay: number
  thermalExposureFactor: number
  eclipseMinutesPerOrbit: number
}

export type LaunchVehicle = {
  id: string
  name: string
  payloadCapacityKgByBody: Record<string, number>
  costMillionUsdByBody: Record<string, number>
  description: string
}

export type PropulsionSystem = {
  id: string
  name: string
  specificImpulseSeconds: number
  dryMassKg: number
  maxPropellantKg: number
  powerW: number
  costMillionUsd: number
  reliabilityPer30Days: number
  thermalTolerance: number
  description: string
}

export type SpacecraftPart = {
  id: string
  name: string
  category: 'bus' | 'instrument'
  massKg: number
  powerW: number
  costMillionUsd: number
  dataGbPerDay: number
  scienceValue: number
  reliabilityPer30Days: number
  thermalTolerance: number
  batteryCapacityWh?: number
  description: string
}

export type MissionDesign = {
  scenarioId: string
  busId: string
  launchVehicleId: string
  orbitId: string
  propulsionId: string
  propellantMassKg: number
  developmentDurationDays: number
  missionDurationDays: number
  difficulty: Difficulty
  playMode: PlayMode
  instrumentIds: string[]
  solarPanelAreaM2: number
}

export type Reason = {
  id: string
  status: Status
  cause: string
  effect: string
  fix: string
  scoreImpact?: number
}

export type DesignEvaluation = {
  massKg: number
  powerW: number
  costMillionUsd: number
  dataGbPerDay: number
  scienceValue: number
  launchCapacityKg: number
  powerAvailableW: number
  batteryCapacityWh: number
  eclipseEnergyRequiredWh: number
  solarPanelAreaM2: number
  solarArrayMassKg: number
  solarArrayCostMillionUsd: number
  budgetMillionUsd: number
  dataLimitGbPerDay: number
  orbitAltitudeKm: number
  orbitPeriodMinutes: number
  launchCostMillionUsd: number
  contactMinutesPerDay: number
  dryMassKg: number
  propellantMassKg: number
  deltaVMps: number
  requiredDeltaVMps: number
  specificImpulseSeconds: number
  maxPropellantKg: number
  missionDurationDays: number
  developmentDurationDays: number
  scheduleDurationDays: number
  missionDeadlineDays: number
  operationsCostMillionUsd: number
  reliabilityPercent: number
  thermalRiskPercent: number
  reasons: Reason[]
}

export type MissionTimelineEvent = {
  phase: string
  title: string
  detail: string
  status: Status
}

export type MissionSimulation = {
  seed: number
  difficulty: Difficulty
  playMode: PlayMode
  scenarioId: string
  achievements: string[]
  missionDurationDays: number
  success: boolean
  score: number
  grade: string
  scienceScore: number
  efficiencyScore: number
  reliabilityScore: number
  learningScore: number
  collectedGb: number
  returnedGb: number
  scienceDelivered: number
  timeline: MissionTimelineEvent[]
  reasons: Reason[]
}
