/** Circular-orbit period for radius and gravitational parameter in km units. */
export function calculateOrbitPeriodMinutes(
  altitudeKm: number,
  bodyRadiusKm: number,
  gravitationalParameterKm3PerSec2: number,
) {
  const orbitalRadiusKm = bodyRadiusKm + altitudeKm
  const periodSeconds = 2 * Math.PI * Math.sqrt(
    orbitalRadiusKm ** 3 / gravitationalParameterKm3PerSec2,
  )
  return Math.round((periodSeconds / 60) * 10) / 10
}

/** Ideal rocket-equation delta-v. Masses are in kilograms, Isp in seconds, result in m/s. */
export function calculateRocketDeltaVMps(
  specificImpulseSeconds: number,
  startingMassKg: number,
  dryMassKg: number,
  standardGravityMps2 = 9.80665,
) {
  return specificImpulseSeconds * standardGravityMps2 * Math.log(startingMassKg / dryMassKg)
}

/** Decimal gigabytes returned by a link, using Mbps and contact minutes. */
export function calculateDownlinkCapacityGb(rateMbps: number, contactMinutes: number) {
  return rateMbps * contactMinutes * 60 / 8 / 1000
}
