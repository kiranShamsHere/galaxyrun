import { useState } from 'react'

const guideSteps = [
  {
    label: 'Choose a target',
    title: 'Start with the question.',
    copy: 'Pick Earth, the Moon, or Mars. Each destination has its own science goal, operating window, and design limits.',
    cue: 'Your objective sets the mission’s boundaries.',
  },
  {
    label: 'Build the craft',
    title: 'Make every kilogram count.',
    copy: 'Choose a bus, then select three to five instruments. Balance fuel, power, data, and cost in the live design checks.',
    cue: 'Keep some mass and power in reserve.',
  },
  {
    label: 'Fly and learn',
    title: 'A good mission learns from surprises.',
    copy: 'Launch when the hard limits are clear. Review the flight timeline, then use each result to improve your next design.',
    cue: 'The same seed replays the same flight events.',
  },
]

export function FirstMissionGuide({ onDismiss }: { onDismiss: () => void }) {
  const [step, setStep] = useState(0)
  const current = guideSteps[step]

  return (
    <section className="panel guide-panel" id="first-mission-guide" aria-labelledby="guide-title">
      <div className="guide-crest" aria-hidden="true">
        <svg viewBox="0 0 56 56" fill="none">
          <circle cx="28" cy="28" r="19" stroke="currentColor" strokeOpacity=".42" />
          <ellipse cx="28" cy="28" rx="24" ry="10" transform="rotate(-32 28 28)" stroke="currentColor" />
          <circle cx="43" cy="15" r="3" fill="currentColor" />
          <circle cx="17" cy="39" r="2" fill="currentColor" fillOpacity=".68" />
        </svg>
      </div>
      <div className="guide-main">
        <div className="guide-topline">
          <p className="eyebrow">FLIGHT DECK NOTE <span>/</span> FIRST MISSION</p>
          <span className="guide-counter">0{step + 1} <i>/</i> 03</span>
        </div>
        <div className="guide-progress" role="progressbar" aria-label="First mission guide progress" aria-valuemin={1} aria-valuemax={3} aria-valuenow={step + 1}>
          <span style={{ width: `${((step + 1) / guideSteps.length) * 100}%` }} />
        </div>
        <div className="guide-content" aria-live="polite" aria-atomic="true">
          <span className="guide-step-label">{current.label}</span>
          <h2 id="guide-title">{current.title}</h2>
          <p>{current.copy}</p>
          <span className="guide-cue"><i aria-hidden="true">✦</i>{current.cue}</span>
        </div>
      </div>
      <div className="guide-actions">
        <button className="guide-dismiss" type="button" onClick={onDismiss}>Skip guide</button>
        <button className="guide-next" type="button" onClick={() => step === guideSteps.length - 1 ? onDismiss() : setStep((value) => value + 1)}>
          {step === guideSteps.length - 1 ? 'Start designing' : 'Next note'}
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  )
}
