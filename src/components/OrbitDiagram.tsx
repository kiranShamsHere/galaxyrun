import type { MissionScenario, OrbitOption } from '../engine/types.ts'

export function OrbitDiagram({ scenario, orbit }: { scenario: MissionScenario; orbit: OrbitOption }) {
  const radius = 70 + Math.min(orbit.altitudeKm / 18, 32)
  const planetRadius = scenario.bodyId === 'earth' ? 37 : scenario.bodyId === 'moon' ? 30 : 33
  return <section className="panel orbit-diagram-panel" aria-labelledby="orbit-diagram-title">
    <div className="section-heading"><div><p className="eyebrow">FLIGHT GEOMETRY · 2D MODEL</p><h2 id="orbit-diagram-title">Orbit at a glance</h2></div></div>
    <svg className="orbit-diagram" viewBox="0 0 320 210" role="img" aria-labelledby="orbit-graphic-title orbit-graphic-desc">
      <title id="orbit-graphic-title">Simplified {scenario.destination} diagram</title>
      <desc id="orbit-graphic-desc">A circular orbit around {scenario.bodyId}, at {orbit.altitudeKm} kilometers altitude. One orbit takes approximately {Math.round(2 * Math.PI * Math.sqrt((scenario.bodyRadiusKm + orbit.altitudeKm) ** 3 / scenario.gravitationalParameterKm3PerSec2) / 60)} minutes.</desc>
      <defs><radialGradient id="body-glow"><stop stopColor="#5284a6"/><stop offset="1" stopColor="#172e49"/></radialGradient></defs>
      <circle cx="160" cy="101" r={radius} fill="none" stroke="#5283a0" strokeWidth="1.4" strokeDasharray="4 5" />
      <circle cx="160" cy="101" r={planetRadius} fill="url(#body-glow)" stroke="#80bdd0" strokeOpacity=".65" />
      <path d={`M${160 - planetRadius * .72} 102 Q160 ${101 + planetRadius * .8} ${160 + planetRadius * .72} 100`} fill="none" stroke="#a9d9dd" strokeOpacity=".45" />
      <circle cx={160 + radius * .72} cy={101 - radius * .69} r="5" fill="#f4c980" stroke="#fff1ca" strokeWidth="2" />
      <path d={`M160 101 L${160 + radius * .72} ${101 - radius * .69}`} stroke="#f4c980" strokeOpacity=".4" strokeDasharray="3 4" />
      <text x="160" y="190" textAnchor="middle" fill="#aabbd0" fontSize="10">NOT TO SCALE · CIRCULAR ORBIT MODEL</text>
    </svg>
    <p className="orbit-diagram-caption">{orbit.name} · {orbit.altitudeKm.toLocaleString()} km altitude · {orbit.eclipseMinutesPerOrbit} min modeled eclipse per orbit</p>
  </section>
}
