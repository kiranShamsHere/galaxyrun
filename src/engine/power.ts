/** Simplified solar-array output: panel area × incident sunlight × conversion efficiency. */
export function calculateSolarPowerW(
  panelAreaM2: number,
  sunlightWPerM2: number,
  efficiency: number,
) {
  return panelAreaM2 * sunlightWPerM2 * efficiency
}

/** Energy required to keep an average load running during one eclipse. */
export function calculateEclipseEnergyWh(powerW: number, eclipseMinutes: number) {
  return powerW * eclipseMinutes / 60
}

/** Game-only estimates for panel structure and procurement; not NASA hardware specifications. */
export const solarArrayAssumptions = {
  efficiency: 0.28,
  structuralMassKgPerM2: 7,
  costMillionUsdPerM2: 3,
} as const
