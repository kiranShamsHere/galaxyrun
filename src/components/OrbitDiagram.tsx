import { useState } from 'react'
import type { MissionScenario, OrbitOption } from '../engine/types.ts'

export function OrbitDiagram({ scenario, orbit }: { scenario: MissionScenario; orbit: OrbitOption }) {
  const [view, setView] = useState<'2d' | '3d'>('3d')
  const [tilt, setTilt] = useState(48)
  const radius = 70 + Math.min(orbit.altitudeKm / 18, 32)
  const planetRadius = scenario.bodyId === 'earth' ? 37 : scenario.bodyId === 'moon' ? 30 : 33
  return <section className="panel orbit-diagram-panel" aria-labelledby="orbit-diagram-title">
    <div className="section-heading"><div><p className="eyebrow">FLIGHT GEOMETRY</p><h2 id="orbit-diagram-title">Orbit at a glance</h2></div><div className="orbit-view-toggle" role="group" aria-label="Orbit view mode"><button type="button" aria-pressed={view === '2d'} onClick={() => setView('2d')}>2D</button><button type="button" aria-pressed={view === '3d'} onClick={() => setView('3d')}>3D</button></div></div>
    {view === '2d' ? <svg className="orbit-diagram" viewBox="0 0 320 210" role="img" aria-labelledby="orbit-graphic-title orbit-graphic-desc">
      <title id="orbit-graphic-title">Simplified {scenario.destination} diagram</title>
      <desc id="orbit-graphic-desc">A circular orbit around {scenario.bodyId}, at {orbit.altitudeKm} kilometers altitude. One orbit takes approximately {Math.round(2 * Math.PI * Math.sqrt((scenario.bodyRadiusKm + orbit.altitudeKm) ** 3 / scenario.gravitationalParameterKm3PerSec2) / 60)} minutes.</desc>
      <defs><radialGradient id="body-glow"><stop stopColor="#a3c5d4"/><stop offset="1" stopColor="#243345"/></radialGradient></defs>
      <circle cx="160" cy="101" r={radius} fill="none" stroke="#e38bce" strokeWidth="1.4" strokeDasharray="4 5" />
      <circle cx="160" cy="101" r={planetRadius} fill="url(#body-glow)" stroke="#a8d6e1" strokeOpacity=".65" />
      <path d={`M${160 - planetRadius * .72} 102 Q160 ${101 + planetRadius * .8} ${160 + planetRadius * .72} 100`} fill="none" stroke="#d0e5ed" strokeOpacity=".45" />
      <circle cx={160 + radius * .72} cy={101 - radius * .69} r="5" fill="#e38bce" stroke="#fff0fc" strokeWidth="2" />
      <path d={`M160 101 L${160 + radius * .72} ${101 - radius * .69}`} stroke="#e38bce" strokeOpacity=".58" strokeDasharray="3 4" />
      <text x="160" y="190" textAnchor="middle" fill="#aabbd0" fontSize="10">NOT TO SCALE · CIRCULAR ORBIT MODEL</text>
    </svg> : <div className="orbit-3d-stage" role="img" aria-label={`Interactive 3D-style orbit around ${scenario.bodyId}, ${orbit.altitudeKm} kilometers altitude`}>
      <div className="orbit-3d-stars" />
      <div className="orbit-3d-planet" />
      <div className="orbit-3d-track" style={{ transform: `translate(-50%, -50%) rotateX(${tilt}deg) rotateZ(-18deg)` }}><span className="orbit-3d-satellite" /></div>
      <img className="orbit-3d-craft" src="/assets/orbiter-illustration.svg" alt="" />
      <span className="orbit-3d-altitude">{orbit.altitudeKm.toLocaleString()} KM</span>
    </div>}
    {view === '3d' && <label className="orbit-tilt-control">Orbit tilt <input type="range" min="24" max="68" value={tilt} onChange={(event) => setTilt(Number(event.currentTarget.value))} aria-valuetext={`${tilt} degree view tilt`} /></label>}
    <p className="orbit-diagram-caption">{orbit.name} · {orbit.altitudeKm.toLocaleString()} km · {orbit.eclipseMinutesPerOrbit} min eclipse · {Math.round(2 * Math.PI * Math.sqrt((scenario.bodyRadiusKm + orbit.altitudeKm) ** 3 / scenario.gravitationalParameterKm3PerSec2) / 60)} min/orbit</p>
  </section>
}
