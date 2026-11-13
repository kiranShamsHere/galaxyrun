import { create } from 'zustand'
import { parts, propulsionSystems, scenarios } from './data/catalog.ts'
import type { MissionDesign } from './engine/types.ts'

type MissionStore = {
  design: MissionDesign
  selectScenario: (scenarioId: string) => void
  selectBus: (busId: string) => void
  selectLaunchVehicle: (launchVehicleId: string) => void
  selectOrbit: (orbitId: string) => void
  selectPropulsionSystem: (propulsionId: string) => void
  setPropellantMass: (massKg: number) => void
  setMissionDuration: (days: number) => void
  selectDifficulty: (difficulty: MissionDesign['difficulty']) => void
  toggleInstrument: (instrumentId: string) => void
}

const firstBus = parts.find((part) => part.category === 'bus')

export const useMissionStore = create<MissionStore>((set) => ({
  design: {
    scenarioId: scenarios[0].id,
    busId: firstBus?.id ?? '',
    launchVehicleId: 'pathfinder',
    orbitId: scenarios[0].orbits[1].id,
    propulsionId: 'chemical-upper-stage',
    propellantMassKg: 65,
    missionDurationDays: scenarios[0].defaultMissionDays,
    difficulty: 'easy',
    instrumentIds: ['climate-camera', 'thermal-imager', 'spectrometer'],
  },
  selectScenario: (scenarioId) => set((state) => {
    const scenario = scenarios.find((item) => item.id === scenarioId) ?? scenarios[0]
    return {
      design: {
        ...state.design,
        scenarioId,
        orbitId: scenario.orbits[0].id,
        missionDurationDays: scenario.defaultMissionDays,
      },
    }
  }),
  selectBus: (busId) => set((state) => ({
    design: { ...state.design, busId },
  })),
  selectLaunchVehicle: (launchVehicleId) => set((state) => ({
    design: { ...state.design, launchVehicleId },
  })),
  selectOrbit: (orbitId) => set((state) => ({
    design: { ...state.design, orbitId },
  })),
  selectPropulsionSystem: (propulsionId) => set((state) => {
    const propulsion = propulsionSystems.find((item) => item.id === propulsionId)
    return {
      design: {
        ...state.design,
        propulsionId,
        propellantMassKg: Math.min(state.design.propellantMassKg, propulsion?.maxPropellantKg ?? 0),
      },
    }
  }),
  setPropellantMass: (massKg) => set((state) => {
    const propulsion = propulsionSystems.find((item) => item.id === state.design.propulsionId)
    const maxPropellantKg = propulsion?.maxPropellantKg ?? 0
    return { design: { ...state.design, propellantMassKg: Math.max(0, Math.min(massKg, maxPropellantKg)) } }
  }),
  setMissionDuration: (days) => set((state) => {
    const scenario = scenarios.find((item) => item.id === state.design.scenarioId) ?? scenarios[0]
    return {
      design: {
        ...state.design,
        missionDurationDays: Math.max(1, Math.min(Math.round(days), scenario.missionDeadlineDays)),
      },
    }
  }),
  selectDifficulty: (difficulty) => set((state) => ({
    design: { ...state.design, difficulty },
  })),
  toggleInstrument: (instrumentId) => set((state) => {
    const selected = state.design.instrumentIds.includes(instrumentId)
    if (selected && state.design.instrumentIds.length <= 3) return state
    if (!selected && state.design.instrumentIds.length >= 5) return state
    return {
      design: {
        ...state.design,
        instrumentIds: selected
          ? state.design.instrumentIds.filter((id) => id !== instrumentId)
          : [...state.design.instrumentIds, instrumentId],
      },
    }
  }),
}))
