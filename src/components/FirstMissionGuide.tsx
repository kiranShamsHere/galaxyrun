import { useState } from 'react'

const guideSteps = [
  {
    label: '01 · TARGET',
    title: 'Pick a world.',
    copy: 'Each world gives you a different mission goal.',
    cue: 'Tap a planet card to switch targets.',
  },
  {
    label: '02 · BUILD',
    title: 'Choose your spacecraft.',
    copy: 'Pick a platform and 3–5 science tools. Watch the live meters as you build.',
  },
  {
    label: '03 · CHECK',
    title: 'Follow the meters.',
    copy: 'Pink means within limits. Red means over. Warnings explain what to change.',
    cue: 'Tap a Fix button to jump to the right control.',
  },
  {
    label: '04 · FLY',
    title: 'Launch and learn.',
    copy: 'Step through the flight, then see your score and what to improve.',
    cue: 'Flight tuning has optional engine, fuel, and orbit choices.',
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
          <span className="guide-counter">0{step + 1} <i>/</i> 0{guideSteps.length}</span>
        </div>
        <div className="guide-progress" role="progressbar" aria-label="First mission guide progress" aria-valuemin={1} aria-valuemax={guideSteps.length} aria-valuenow={step + 1}>
          <span style={{ width: `${((step + 1) / guideSteps.length) * 100}%` }} />
        </div>
        <div className="guide-content" aria-live="polite" aria-atomic="true">
          <span className="guide-step-label">{current.label}</span>
          <h2 id="guide-title">{current.title}</h2>
          <p>{current.copy}</p>
          {current.cue && <span className="guide-cue"><i aria-hidden="true">✦</i>{current.cue}</span>}
        </div>
      </div>
      <div className="guide-actions">
        <button className="guide-dismiss" type="button" onClick={onDismiss}>Skip guide</button>
        <button className="guide-next" type="button" onClick={() => step === guideSteps.length - 1 ? onDismiss() : setStep((value) => value + 1)}>
          {step === guideSteps.length - 1 ? 'Start building' : 'Next'}
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  )
}
