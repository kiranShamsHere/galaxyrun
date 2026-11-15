import type { MissionScenario } from '../engine/types.ts'
import { LandingHero3D } from './LandingHero3D.tsx'
import { HowToPlaySection } from './HowToPlaySection.tsx'
import { PlanetComparator } from './PlanetComparator.tsx'
import { SpaceIcon } from './SpaceIcon.tsx'

const destinationArtwork: Record<string, { image: string; label: string; index: string }> = {
  'earth-observer': { image: '/assets/mission-earth.svg', label: 'Earth in low orbit', index: '01' },
  'moon-mapper': { image: '/assets/mission-moon.svg', label: 'The Moon on a polar survey orbit', index: '02' },
  'mars-scout': { image: '/assets/mission-mars.svg', label: 'Mars and its orbital path', index: '03' },
  'venus-cloud-watcher': { image: '/assets/mission-venus.svg', label: 'Venus beneath cloud bands in orbit', index: '04' },
}

type LandingPageProps = {
  scenarios: MissionScenario[]
  selectedScenarioId: string
  onSelectScenario: (scenarioId: string) => void
  onStart: () => void
}

export function LandingPage({ scenarios, selectedScenarioId, onSelectScenario, onStart }: LandingPageProps) {
  return (
    <div className="landing-page" id="landing-top">
      <a className="skip-link" href="#landing-main">
        Skip to mission briefing
      </a>

      {/* Modern Navigation Header */}
      <header className="landing-header">
        <a className="brand" href="#landing-top" aria-label="Galaxy Run home">
          <span className="brand-mark" aria-hidden="true">
            <img src="/assets/galaxy-run-mark.svg" width="34" height="34" alt="" />
          </span>
          <span>
            GALAXY<span className="brand-light"> RUN</span>
          </span>
        </a>

        <nav className="landing-nav" aria-label="Main navigation">
          <a href="#destinations">Missions</a>
          <a href="#how-to-play">How to Play</a>
          <button type="button" className="landing-nav-cta" onClick={onStart}>
            Enter mission control <span aria-hidden="true">↗</span>
          </button>
        </nav>
      </header>

      <main id="landing-main">
        {/* HERO SECTION: Image 1 Restored in Real 3D */}
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-copy">
            <p className="eyebrow">
              <span className="status-pip" aria-hidden="true" /> NASA SPACE APPS CHALLENGE 2026 <span>/</span> FLIGHT
              PROGRAM
            </p>
            <h1 id="landing-title">
              Build it.
              <br />
              Send it. <span>Learn.</span>
            </h1>
            <p className="landing-lede">
              Build a spacecraft, balance its systems, and see how your mission flies.
            </p>

            <div className="landing-actions">
              <button className="landing-primary" type="button" onClick={onStart}>
                Start a mission <span aria-hidden="true">→</span>
              </button>
              <a className="landing-secondary" href="#compare-worlds">
                Compare worlds <SpaceIcon symbol="🪐" size={16} />
              </a>
            </div>

            <div className="landing-promise">
              <span aria-hidden="true">✳</span> Choose a world · Build · Fly.
            </div>
          </div>

          {/* Interactive 3D Card (Image 1 Restored in 3D!) */}
          <div className="landing-scene-container">
            <LandingHero3D />
          </div>
        </section>

        {/* HOW TO PLAY & PLAYSTYLE SECTION (spacegames.io inspired) */}
        <HowToPlaySection onStartMission={onStart} />

        {/* PUT TWO WORLDS SIDE BY SIDE (spacegames.io inspired Planet Comparator) */}
        <PlanetComparator
          onSelectMission={(scenarioId) => {
            onSelectScenario(scenarioId)
            onStart()
          }}
        />

        {/* TARGET DESTINATIONS SECTION */}
        <section className="destination-section" id="destinations" aria-labelledby="destinations-title">
          <div className="destination-heading">
            <div>
              <p className="eyebrow">FLIGHT DESTINATIONS</p>
              <h2 id="destinations-title">Choose your target world.</h2>
            </div>
            <p>Select any world to configure and simulate your mission.</p>
          </div>

          <div className="destination-grid">
            {scenarios.map((scenario) => {
              const artwork = destinationArtwork[scenario.id] || {
                image: '/assets/mission-earth.svg',
                label: scenario.name,
                index: '00',
              }
              const selected = scenario.id === selectedScenarioId
              return (
                <button
                  className={`destination-card${selected ? ' is-selected' : ''}`}
                  type="button"
                  key={scenario.id}
                  aria-pressed={selected}
                  onClick={() => {
                    onSelectScenario(scenario.id)
                    onStart()
                  }}
                >
                  <span className="destination-image">
                    <img
                      src={artwork.image}
                      width="120"
                      height="96"
                      alt={artwork.label}
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="destination-index">{artwork.index} / TARGET</span>
                    <span className="destination-check" aria-hidden="true">
                      ✓
                    </span>
                  </span>
                  <span className="destination-name">
                    {scenario.name}
                    <span aria-hidden="true">↗</span>
                  </span>
                  <span className="destination-objective">{scenario.objective}</span>
                  <span className="destination-orbit">{scenario.destination}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* NASA SYSTEMS ARCHITECTURE SPOTLIGHT */}
        <section className="systems-features-section" id="systems-features" aria-labelledby="systems-title">
          <div className="systems-header">
            <p className="eyebrow">NASA SYSTEMS ENGINEERING</p>
            <h2 id="systems-title">Built on Real Spaceflight Methodologies</h2>
            <p>
              Galaxy Run incorporates the systems engineering principles utilized by NASA centers to formulate and
              verify robotic science missions.
            </p>
          </div>

          <div className="systems-grid">
            <div className="system-feature-box">
              <span className="feature-icon"><SpaceIcon symbol="📋" size={27} /></span>
              <h3>JPL Concept Maturity Levels</h3>
              <p>
                From CML 1 &quot;Cocktail Napkin&quot; ideas to CML 4 Point Designs with verified technical reserves (≥ 15% mass
                margin, ≥ 20% power margin).
              </p>
              <small>Jet Propulsion Laboratory</small>
            </div>

            <div className="system-feature-box">
              <span className="feature-icon"><SpaceIcon symbol="🌐" size={27} /></span>
              <h3>4 Mission Segments</h3>
              <p>
                Integrated concurrent design balancing Launch segment, Space segment, Ground telecommunications (DSN),
                and User science pipelines.
              </p>
              <small>NASA Flight Systems</small>
            </div>

            <div className="system-feature-box">
              <span className="feature-icon"><SpaceIcon symbol="🔬" size={27} /></span>
              <h3>Goddard MDL Disciplines</h3>
              <p>
                Structures, Thermal, Avionics, Power, Propulsion, and Telecommunications modeled concurrently to prevent
                cost growth.
              </p>
              <small>Mission Design Lab (GSFC)</small>
            </div>

            <div className="system-feature-box">
              <span className="feature-icon"><SpaceIcon symbol="🛰️" size={27} /></span>
              <h3>NASA WSMV Astrodynamics</h3>
              <p>
                3D Keplerian orbits with orbital eccentricity, true anomaly propagation, eclipse shadow loss, and DSN
                visibility windows.
              </p>
              <small>Web-Based Space Mission Viz</small>
            </div>
          </div>
        </section>
      </main>

      {/* MODERN, CLEAN FOOTER (Without the awkward cropped text!) */}
      <footer className="landing-footer-modern">
        <div className="footer-top-columns">
          <div className="footer-col brand-col">
            <div className="footer-brand">
              <img src="/assets/galaxy-run-mark.svg" width="28" height="28" alt="" />
              <span>GALAXY RUN</span>
            </div>
            <p>
              An interactive space mission design game built for the NASA Space Apps Challenge 2026. Design, balance,
              and launch your spacecraft.
            </p>
          </div>

          <div className="footer-col">
            <h4>Flight Program</h4>
            <ul>
              <li>
                <a href="#destinations">Earth Observer</a>
              </li>
              <li>
                <a href="#destinations">Moon Mapper</a>
              </li>
              <li>
                <a href="#destinations">Mars Scout</a>
              </li>
              <li>
                <a href="#destinations">Venus Cloud Watcher</a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Systems &amp; Tools</h4>
            <ul>
              <li>
                <a href="#how-to-play">Flight Academy</a>
              </li>
              <li>
                <a href="#compare-worlds">World Comparator</a>
              </li>
              <li>
                <a href="#systems-features">JPL CML Framework</a>
              </li>
              <li>
                <button type="button" className="footer-text-link" onClick={onStart}>
                  Mission Control Lab
                </button>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Challenge Info</h4>
            <ul>
              <li>
                <a
                  href="https://www.spaceappschallenge.org/2026/challenges/space-mission-design-game/"
                  target="_blank"
                  rel="noreferrer"
                >
                  NASA Space Apps 2026 ↗
                </a>
              </li>
              <li>
                <a href="https://github.com/nasa/mission-viz" target="_blank" rel="noreferrer">
                  NASA Mission Viz ↗
                </a>
              </li>
              <li>
                <a href="https://science.nasa.gov/mission/webb/" target="_blank" rel="noreferrer">
                  NASA Webb Telescope ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <span>GALAXY RUN · OPEN SOURCE UNDER MIT LICENSE</span>
          <span>BUILT FOR CURIOUS PILOTS AND FUTURE NASA MISSION ARCHITECTS</span>
        </div>
      </footer>
    </div>
  )
}
