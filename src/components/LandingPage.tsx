import type { MissionScenario } from '../engine/types.ts'

const destinationArtwork: Record<string, { image: string; label: string; index: string }> = {
  'earth-observer': { image: '/assets/mission-earth.svg', label: 'Earth in low orbit', index: '01' },
  'moon-mapper': { image: '/assets/mission-moon.svg', label: 'The Moon on a polar survey orbit', index: '02' },
  'mars-scout': { image: '/assets/mission-mars.svg', label: 'Mars and its orbital path', index: '03' },
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
          <a href="#flight-plan">How to play</a>
          <button type="button" className="landing-nav-cta" onClick={onStart}>Enter mission control <span aria-hidden="true">↗</span></button>
        </nav>
      </header>

      <main id="landing-main">
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-copy">
            <p className="eyebrow"><span className="status-pip" aria-hidden="true" /> FLIGHT PROGRAM <span>/</span> OPEN FOR PILOTS</p>
            <h1 id="landing-title">Space is vast.<br />Your choices <span>matter.</span></h1>
            <p className="landing-lede">Design a spacecraft, balance its limits, and send it somewhere worth exploring. Then see what your decisions mean once the mission is in motion.</p>
            <div className="landing-actions">
              <button className="landing-primary" type="button" onClick={onStart}>Begin mission design <span aria-hidden="true">→</span></button>
              <a className="landing-secondary" href="#destinations">Choose a destination <span aria-hidden="true">↓</span></a>
            </div>
            <div className="landing-promise"><span aria-hidden="true">✳</span> No account. No wrong answers. Just better questions.</div>
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
            <div><p className="eyebrow">PICK YOUR POINT OF VIEW</p><h2 id="destinations-title">Three worlds. Three reasons to go.</h2></div>
            <p>Choose the question your spacecraft will answer. You can change your destination any time in mission control.</p>
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

        <section className="flight-plan" id="flight-plan" aria-labelledby="flight-plan-title">
          <div className="flight-plan-heading"><p className="eyebrow">A LITTLE SCIENCE. A LOT OF DISCOVERY.</p><h2 id="flight-plan-title">Every mission teaches you something.</h2></div>
          <ol className="flight-steps">
            <li><span>01</span><div><h3>Build with limits</h3><p>Choose instruments, propulsion, and a route. Every kilogram and watt has a job.</p></div></li>
            <li><span>02</span><div><h3>Make the call</h3><p>Set your mission duration and budget. Trade what you can afford for what you want to learn.</p></div></li>
            <li><span>03</span><div><h3>See what unfolds</h3><p>Fly the mission, follow its timeline, and use the debrief to improve your next design.</p></div></li>
          </ol>
          <button className="landing-bottom-cta" type="button" onClick={onStart}>Ready when you are <span aria-hidden="true">→</span></button>
        </section>
      </main>

      <footer className="landing-footer"><span>GALAXY RUN <i>·</i> SPACE MISSION DESIGN GAME</span><span>BUILT FOR CURIOUS PILOTS <b aria-hidden="true">✳</b></span></footer>
    </div>
  )
}
