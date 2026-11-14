/**
 * Rounded planetary constants used by Galaxy Run's simplified circular-orbit model.
 * Values are stored locally so a mission run does not depend on a network request.
 * Retrieval date: 2026-11-14.
 */
export const missionConstants = {
  earth: {
    meanRadiusKm: 6371.0,
    gravitationalParameterKm3PerSec2: 398600.4,
  },
  moon: {
    meanRadiusKm: 1737.4,
    gravitationalParameterKm3PerSec2: 4902.8,
  },
  mars: {
    meanRadiusKm: 3389.5,
    gravitationalParameterKm3PerSec2: 42828.4,
  },
  venus: {
    meanRadiusKm: 6051.8,
    gravitationalParameterKm3PerSec2: 324858.592,
  },
} as const

export const missionConstantSources = {
  planetaryRadii: 'https://ssd.jpl.nasa.gov/planets/phys_par.html',
  gravitationalParameters: 'https://ssd.jpl.nasa.gov/astro_par.html',
  moonRadius: 'https://ssd.jpl.nasa.gov/sats/phys_par/',
  moonFactSheet: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html',
} as const
