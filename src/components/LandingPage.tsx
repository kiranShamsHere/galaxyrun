import type { MissionScenario } from '../engine/types.ts'

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
      <a className="skip-link" href="#landing-main">Skip to mission briefing</a>
      <header className="landing-header">
        <a className="brand" href="#landing-top" aria-label="Galaxy Run home">
          <span className="brand-mark" aria-hidden="true"><img src="/assets/galaxy-run-mark.svg" width="34" height="34" alt="" /></span>
          <span>GALAXY<span className="brand-light"> RUN</span></span>
        </a>
        <nav className="landing-nav" aria-label="Main navigation">
          <a href="#destinations">Missions</a>
          <button type="button" className="landing-nav-cta" onClick={onStart}>Enter mission control <span aria-hidden="true">↗</span></button>
        </nav>
      </header>

      <main id="landing-main">
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-copy">
            <p className="eyebrow"><span className="status-pip" aria-hidden="true" /> FLIGHT PROGRAM <span>/</span> OPEN FOR PILOTS</p>
            <h1 id="landing-title">Build it.<br />Send it. <span>Learn.</span></h1>
            <p className="landing-lede">Make the calls. Watch the mission react.</p>
            <div className="landing-actions">
              <button className="landing-primary" type="button" onClick={onStart}>Start a mission <span aria-hidden="true">→</span></button>
              <a className="landing-secondary" href="#destinations">Pick a world <span aria-hidden="true">↓</span></a>
            </div>
            <div className="landing-promise"><span aria-hidden="true">✳</span> One craft. Real trade-offs.</div>
          </div>

          <div className="landing-scene" role="img" aria-label="Illustration of a spacecraft above a planet's horizon">
            <div className="scene-coordinate coordinate-top">MISSION 001 <span>·</span> SOL SYSTEM</div>
            <div className="scene-orbit scene-orbit-one" />
            <div className="scene-orbit scene-orbit-two" />
            <div className="scene-planet"><span className="planet-glow" /></div>
            <img className="scene-craft" src="/assets/orbiter-illustration.svg" width="720" height="280" alt="" fetchPriority="high" />
            <div className="scene-readout"><span>FLIGHT PATH / 01</span><strong>DESIGN <i>·</i> LAUNCH <i>·</i> LEARN</strong></div>
            <span className="scene-coordinate coordinate-bottom">34° 12′ N <span>·</span> 118° 10′ W</span>
          </div>
        </section>

        <section className="destination-section" id="destinations" aria-labelledby="destinations-title">
          <div className="destination-heading">
            <div><p className="eyebrow">PICK YOUR POINT OF VIEW</p><h2 id="destinations-title">Choose your target.</h2></div>
            <p>Pick a world. Change it anytime.</p>
          </div>
          <div className="destination-grid">
            {scenarios.map((scenario) => {
              const artwork = destinationArtwork[scenario.id]
              const selected = scenario.id === selectedScenarioId
              return (
                <button
                  className={`destination-card${selected ? ' is-selected' : ''}`}
                  type="button"
                  key={scenario.id}
                  aria-pressed={selected}
                  onClick={() => onSelectScenario(scenario.id)}
                >
                  <span className="destination-image"><img src={artwork.image} width="120" height="96" alt={artwork.label} loading="lazy" decoding="async" /><span className="destination-index">{artwork.index} / TARGET</span><span className="destination-check" aria-hidden="true">✓</span></span>
                  <span className="destination-name">{scenario.name}<span aria-hidden="true">↗</span></span>
                  <span className="destination-objective">{scenario.objective}</span>
                  <span className="destination-orbit">{scenario.destination}</span>
                </button>
              )
            })}
          </div>
        </section>

      </main>

      <footer className="landing-footer"><span>GALAXY RUN <i>·</i> SPACE MISSION DESIGN GAME</span><span>BUILT FOR CURIOUS PILOTS <b aria-hidden="true">✳</b></span></footer>
    </div>
  )
}
