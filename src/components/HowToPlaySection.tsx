import { useState } from 'react'
import { SpaceIcon } from './SpaceIcon.tsx'

export function HowToPlaySection({ onStartMission }: { onStartMission: () => void }) {
  const [activeStep, setActiveStep] = useState<number>(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const steps = [
    {
      num: '01',
      title: 'Pick Target World & Orbit',
      icon: '🪐',
      kicker: 'MISSION OBJECTIVES',
      summary:
        'Select your celestial destination—Earth, Moon, Mars, or Venus. Pick your orbital altitude to define observation ground track, orbital period, and contact passes.',
      tips: [
        'Higher orbits reduce atmospheric drag and orbital speed, but yield shorter ground contact windows.',
        'Distance from the Sun shapes solar irradiance (from 2,601 W/m² at Venus down to 586 W/m² at Mars).',
      ],
      actionLabel: 'Explore Targets',
    },
    {
      num: '02',
      title: 'Build in Real-Time 3D CAD',
      icon: '🛰️',
      kicker: 'MODULAR ENGINEERING',
      summary:
        'Configure your spacecraft bus platform, mount 3 to 5 science sensors, and dynamically scale deployable solar array wings in our 3D WebGL laboratory.',
      tips: [
        'Rotate and inspect your spacecraft in full 360° 3D or switch to X-Ray Wireframe mode.',
        'Each sensor adds scientific return points (+7 to +10) while adding mass and power draw.',
      ],
      actionLabel: 'Enter 3D CAD Bay',
    },
    {
      num: '03',
      title: 'Balance NASA Resource Limits',
      icon: '⚖️',
      kicker: 'SYSTEM TRADES',
      summary:
        'Keep total wet mass under rocket lift capacity, power draw below solar array wattage, and ensure secondary batteries survive night eclipse.',
      tips: [
        'Watch the live JPL CML-4 badge: requires ≥ 15% mass margin and ≥ 20% power reserve.',
        'Hit a constraint? Tap the 1-Click Smart Quick Fixes to automatically rebalance your craft.',
      ],
      actionLabel: 'Check Resource HUD',
    },
    {
      num: '04',
      title: 'Launch & Flight Debrief',
      icon: '🚀',
      kicker: 'ORBITAL SIMULATION',
      summary:
        'Ignite the engines and watch your mission execute across 7 flight phases. Encounter seeded space events, download science data, and review your flight report.',
      tips: [
        'The same seed repeats the same events, so you can compare your own designs.',
        'The Why Engine explains every success and anomaly with actionable root-cause analysis.',
      ],
      actionLabel: 'Start Flying Now',
    },
  ]

  const playstyles = [
    {
      icon: '⚡',
      title: 'Fast Orbit Recon',
      tag: 'QUICK RUNS',
      desc: 'Low Earth orbit climate mapping with rapid turnaround and moderate power constraints.',
    },
    {
      icon: '🔬',
      title: 'Deep Planetary Science',
      tag: 'MAX RETURN',
      desc: 'Multi-sensor payload packs (cameras, radars, spectrometers) searching for subsurface ice on Mars and the Moon.',
    },
    {
      icon: '🛠️',
      title: 'Systems Engineering Master',
      tag: 'STRICT MARGINS',
      desc: 'Hard difficulty balancing tight mass limits, strict CML-4 reserves, and minimal cost growth.',
    },
  ]

  const faqs = [
    {
      q: 'Do I need prior space or aerospace engineering knowledge?',
      a: 'Not at all! Galaxy Run is designed to make complex space systems engineering accessible. Every constraint is paired with clear visual meters, tooltip explanations, and 1-click auto-fixes.',
    },
    {
      q: 'What is the "Why Engine"?',
      a: 'The Why Engine is Galaxy Run’s diagnostic core. Instead of simply saying a mission passed or failed, it breaks down the exact physical root cause, the cascading system effect, and how to fix it.',
    },
    {
      q: 'Are the physics and planetary constants real?',
      a: 'Yes! Planetary radii, gravitational parameters (GM), solar irradiances (W/m²), and orbital periods use real NASA NSSDC and JPL Solar System Dynamics ephemerides data.',
    },
    {
      q: 'What are JPL Concept Maturity Levels (CML)?',
      a: 'CML is NASA Jet Propulsion Laboratory’s formal framework for advancing mission concepts from an initial "Cocktail Napkin" idea (CML 1) through Trade Space exploration (CML 3) to verified Point Design (CML 4).',
    },
  ]

  return (
    <div className="how-to-play-container" id="how-to-play">
      {/* SECTION 1: INTERACTIVE 4-STEP WALKTHROUGH */}
      <section className="academy-stepper-section" aria-labelledby="academy-title">
        <div className="section-header-centered">
          <span className="eyebrow">FLIGHT ACADEMY</span>
          <h2 id="academy-title">How to Play in 4 Simple Steps</h2>
          <p>
            Galaxy Run puts you in the pilot seat at mission control. Here is how your concept goes from
            drawing board to deep space.
          </p>
        </div>

        {/* Step Tabs */}
        <div className="stepper-tab-row" role="tablist">
          {steps.map((s, idx) => (
            <button
              key={s.num}
              type="button"
              role="tab"
              aria-selected={activeStep === idx}
              className={`stepper-tab ${activeStep === idx ? 'is-active' : ''}`}
              onClick={() => setActiveStep(idx)}
            >
              <span className="step-tab-num">{s.num}</span>
              <span className="step-tab-icon"><SpaceIcon symbol={s.icon} size={21} /></span>
              <span className="step-tab-title">{s.title}</span>
            </button>
          ))}
        </div>

        {/* Active Step Content Card */}
        <div className="active-step-card">
          <div className="step-card-left">
            <span className="step-kicker-pill">
              <SpaceIcon symbol={steps[activeStep].icon} size={15} /> STEP {steps[activeStep].num} · {steps[activeStep].kicker}
            </span>
            <h3>{steps[activeStep].title}</h3>
            <p className="step-summary">{steps[activeStep].summary}</p>

            <div className="step-tips-box">
              <b>PRO FLIGHT TIPS:</b>
              <ul>
                {steps[activeStep].tips.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>

            <button type="button" className="step-cta-btn" onClick={onStartMission}>
              {steps[activeStep].actionLabel} <span aria-hidden="true">→</span>
            </button>
          </div>

          <div className="step-card-right-preview" aria-hidden="true">
            <div className="step-mockup-frame">
              {activeStep === 0 && (
                <div className="mockup-content mockup-targets">
                  <span className="mockup-tag">SELECT TARGET</span>
                  <div className="mockup-grid-mini">
                    <div className="mini-world is-sel">
                      <span><SpaceIcon symbol="🌍" /></span>
                      <b>Earth</b>
                    </div>
                    <div className="mini-world">
                      <span><SpaceIcon symbol="🌑" /></span>
                      <b>Moon</b>
                    </div>
                    <div className="mini-world">
                      <span><SpaceIcon symbol="🔴" /></span>
                      <b>Mars</b>
                    </div>
                    <div className="mini-world">
                      <span><SpaceIcon symbol="🟡" /></span>
                      <b>Venus</b>
                    </div>
                  </div>
                </div>
              )}
              {activeStep === 1 && (
                <div className="mockup-content mockup-cad">
                  <span className="mockup-tag">3D CAD BAY</span>
                  <div className="mockup-satellite-art">
                    <span className="mockup-sat-core"><SpaceIcon symbol="🛰️" size={35} /></span>
                    <span className="mockup-chip-tag"><SpaceIcon symbol="⚡" size={14} /> 2.0 m² Arrays</span>
                    <span className="mockup-chip-tag"><SpaceIcon symbol="📷" size={14} /> 3 Sensors</span>
                  </div>
                </div>
              )}
              {activeStep === 2 && (
                <div className="mockup-content mockup-meters">
                  <span className="mockup-tag">RESOURCE METERS</span>
                  <div className="mini-meter-row">
                    <span>MASS</span>
                    <b>462 / 520 kg [OK]</b>
                  </div>
                  <div className="mini-meter-row">
                    <span>POWER</span>
                    <b>380 / 420 W [OK]</b>
                  </div>
                  <div className="mini-meter-row">
                    <span>CML-4</span>
                    <b style={{ color: '#34d399' }}>✓ VERIFIED MARGINS</b>
                  </div>
                </div>
              )}
              {activeStep === 3 && (
                <div className="mockup-content mockup-flight">
                  <span className="mockup-tag">FLIGHT TELEMETRY</span>
                  <div className="flight-status-box">
                    <span><SpaceIcon symbol="🚀" size={15} /> TLI BURN NOMINAL</span>
                    <small>+72 Science Points Collected</small>
                    <b style={{ color: '#fbbf24' }}>GRADE A FLIGHT</b>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: WHAT MISSION FEELS RIGHT? (spacegames.io inspired) */}
      <section className="playstyles-section" aria-labelledby="playstyle-title">
        <div className="section-header-centered">
          <span className="eyebrow">MISSION ARCHETYPES</span>
          <h2 id="playstyle-title">What kind of space mission feels right?</h2>
          <p>Whether you want a quick 10-minute satellite build or a deep aerospace trade study, Galaxy Run has you covered.</p>
        </div>

        <div className="playstyles-grid">
          {playstyles.map((ps) => (
            <div key={ps.title} className="playstyle-card" onClick={onStartMission}>
              <div className="playstyle-top">
                <span className="playstyle-icon"><SpaceIcon symbol={ps.icon} size={26} /></span>
                <span className="playstyle-tag">{ps.tag}</span>
              </div>
              <h3>{ps.title}</h3>
              <p>{ps.desc}</p>
              <span className="playstyle-arrow">Start this mission →</span>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: FREQUENTLY ASKED QUESTIONS */}
      <section className="faq-section" aria-labelledby="faq-title">
        <div className="section-header-centered">
          <span className="eyebrow">GOT QUESTIONS?</span>
          <h2 id="faq-title">Space Mission FAQ</h2>
          <p>Everything you need to know about Galaxy Run, systems engineering, and NASA challenge rules.</p>
        </div>

        <div className="faq-stack">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx
            return (
              <div key={faq.q} className={`faq-card ${isOpen ? 'is-open' : ''}`}>
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <span className="faq-chevron" aria-hidden="true">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
