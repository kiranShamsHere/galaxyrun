import { useState } from 'react'
import { SpaceIcon } from './SpaceIcon.tsx'

export interface PlanetComparisonData {
  id: string
  name: string
  tagline: string
  icon: string
  color: string
  meanRadiusKm: number
  gravityMs2: number
  solarIrradianceWPerM2: number
  atmosphere: string
  dayNightTemp: string
  primaryChallenge: string
  targetScenarioId: string
}

const planetDatabase: PlanetComparisonData[] = [
  {
    id: 'earth',
    name: 'Earth',
    tagline: 'Dynamic climate & biosphere',
    icon: '🌍',
    color: '#38bdf8',
    meanRadiusKm: 6371.0,
    gravityMs2: 9.81,
    solarIrradianceWPerM2: 1361.0,
    atmosphere: 'N2 / O2 (101.3 kPa)',
    dayNightTemp: '-50°C to +50°C',
    primaryChallenge: 'High orbital speed & wildfire/cloud optical scattering',
    targetScenarioId: 'earth-observer',
  },
  {
    id: 'moon',
    name: 'The Moon',
    tagline: 'Polar ice & airless crater terrain',
    icon: '🌑',
    color: '#94a3b8',
    meanRadiusKm: 1737.4,
    gravityMs2: 1.62,
    solarIrradianceWPerM2: 1361.0,
    atmosphere: 'Vacuum / Exosphere',
    dayNightTemp: '-130°C to +120°C',
    primaryChallenge: 'Deep shadow cold soak (35 min eclipse) & lunar dust abrasion',
    targetScenarioId: 'moon-mapper',
  },
  {
    id: 'mars',
    name: 'Mars',
    tagline: 'Rusty canyons & ancient riverbeds',
    icon: '🔴',
    color: '#f97316',
    meanRadiusKm: 3389.5,
    gravityMs2: 3.72,
    solarIrradianceWPerM2: 586.2,
    atmosphere: 'CO2 (0.6 kPa thin)',
    dayNightTemp: '-125°C to +20°C',
    primaryChallenge: 'Low solar flux (43% Earth) & high delta-V capture (2,100 m/s)',
    targetScenarioId: 'mars-scout',
  },
  {
    id: 'venus',
    name: 'Venus',
    tagline: 'Supercritical furnace & sulfuric clouds',
    icon: '🟡',
    color: '#f59e0b',
    meanRadiusKm: 6051.8,
    gravityMs2: 8.87,
    solarIrradianceWPerM2: 2601.3,
    atmosphere: 'CO2 / H2SO4 (9.3 MPa)',
    dayNightTemp: '+460°C isothermal',
    primaryChallenge: 'Blistering solar irradiance (191% Earth) & extreme thermal load',
    targetScenarioId: 'venus-cloud-watcher',
  },
]

export function PlanetComparator({ onSelectMission }: { onSelectMission: (scenarioId: string) => void }) {
  const [planetAId, setPlanetAId] = useState<string>('earth')
  const [planetBId, setPlanetBId] = useState<string>('mars')

  const planetA = planetDatabase.find((p) => p.id === planetAId) ?? planetDatabase[0]
  const planetB = planetDatabase.find((p) => p.id === planetBId) ?? planetDatabase[2]

  return (
    <section className="comparator-section" id="compare-worlds" aria-labelledby="comparator-title">
      <div className="comparator-header">
        <span className="eyebrow">PLANETARY ASTRODYNAMICS</span>
        <h2 id="comparator-title">Put two worlds side by side.</h2>
        <p>Compare solar irradiance, surface gravity, thermal swings, and mission hurdles before selecting your trajectory.</p>
      </div>

      <div className="comparator-board">
        {/* Planet A Column */}
        <div className="comparator-column">
          <div className="world-select-wrap">
            <label htmlFor="select-planet-a">TARGET A:</label>
            <select
              id="select-planet-a"
              value={planetAId}
              onChange={(e) => setPlanetAId(e.target.value)}
              className="world-dropdown"
            >
              {planetDatabase.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="world-hero-visual" style={{ borderColor: planetA.color }}>
            <span className={`world-planet world-${planetA.id}`} style={{ color: planetA.color }} aria-hidden="true"><SpaceIcon symbol={planetA.icon} size={44} /></span>
            <h3>{planetA.name}</h3>
            <small>{planetA.tagline}</small>
          </div>

          <div className="metrics-stack">
            <div className="comp-metric-row">
              <span className="metric-name">Solar Irradiance</span>
              <strong style={{ color: planetA.color }}>{planetA.solarIrradianceWPerM2} W/m²</strong>
              <div className="comp-bar-track">
                <span
                  className="comp-bar-fill"
                  style={{
                    width: `${Math.min(100, (planetA.solarIrradianceWPerM2 / 2601.3) * 100)}%`,
                    backgroundColor: planetA.color,
                  }}
                />
              </div>
            </div>

            <div className="comp-metric-row">
              <span className="metric-name">Surface Gravity</span>
              <strong>{planetA.gravityMs2} m/s²</strong>
              <div className="comp-bar-track">
                <span
                  className="comp-bar-fill"
                  style={{
                    width: `${Math.min(100, (planetA.gravityMs2 / 9.81) * 100)}%`,
                    backgroundColor: planetA.color,
                  }}
                />
              </div>
            </div>

            <div className="comp-metric-row">
              <span className="metric-name">Mean Radius</span>
              <strong>{planetA.meanRadiusKm.toLocaleString()} km</strong>
            </div>

            <div className="comp-metric-row">
              <span className="metric-name">Atmosphere</span>
              <small>{planetA.atmosphere}</small>
            </div>

            <div className="comp-metric-row">
              <span className="metric-name">Thermal Range</span>
              <small>{planetA.dayNightTemp}</small>
            </div>

            <div className="comp-metric-row callout">
              <span className="metric-name">Flight Challenge:</span>
              <p>{planetA.primaryChallenge}</p>
            </div>
          </div>

          <button
            type="button"
            className="launch-target-cta"
            onClick={() => onSelectMission(planetA.targetScenarioId)}
          >
            Launch to {planetA.name} <span aria-hidden="true">→</span>
          </button>
        </div>

        {/* Center VS Badge */}
        <div className="comparator-vs-divider">
          <span>VS</span>
        </div>

        {/* Planet B Column */}
        <div className="comparator-column">
          <div className="world-select-wrap">
            <label htmlFor="select-planet-b">TARGET B:</label>
            <select
              id="select-planet-b"
              value={planetBId}
              onChange={(e) => setPlanetBId(e.target.value)}
              className="world-dropdown"
            >
              {planetDatabase.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="world-hero-visual" style={{ borderColor: planetB.color }}>
            <span className={`world-planet world-${planetB.id}`} style={{ color: planetB.color }} aria-hidden="true"><SpaceIcon symbol={planetB.icon} size={44} /></span>
            <h3>{planetB.name}</h3>
            <small>{planetB.tagline}</small>
          </div>

          <div className="metrics-stack">
            <div className="comp-metric-row">
              <span className="metric-name">Solar Irradiance</span>
              <strong style={{ color: planetB.color }}>{planetB.solarIrradianceWPerM2} W/m²</strong>
              <div className="comp-bar-track">
                <span
                  className="comp-bar-fill"
                  style={{
                    width: `${Math.min(100, (planetB.solarIrradianceWPerM2 / 2601.3) * 100)}%`,
                    backgroundColor: planetB.color,
                  }}
                />
              </div>
            </div>

            <div className="comp-metric-row">
              <span className="metric-name">Surface Gravity</span>
              <strong>{planetB.gravityMs2} m/s²</strong>
              <div className="comp-bar-track">
                <span
                  className="comp-bar-fill"
                  style={{
                    width: `${Math.min(100, (planetB.gravityMs2 / 9.81) * 100)}%`,
                    backgroundColor: planetB.color,
                  }}
                />
              </div>
            </div>

            <div className="comp-metric-row">
              <span className="metric-name">Mean Radius</span>
              <strong>{planetB.meanRadiusKm.toLocaleString()} km</strong>
            </div>

            <div className="comp-metric-row">
              <span className="metric-name">Atmosphere</span>
              <small>{planetB.atmosphere}</small>
            </div>

            <div className="comp-metric-row">
              <span className="metric-name">Thermal Range</span>
              <small>{planetB.dayNightTemp}</small>
            </div>

            <div className="comp-metric-row callout">
              <span className="metric-name">Flight Challenge:</span>
              <p>{planetB.primaryChallenge}</p>
            </div>
          </div>

          <button
            type="button"
            className="launch-target-cta"
            onClick={() => onSelectMission(planetB.targetScenarioId)}
          >
            Launch to {planetB.name} <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  )
}
