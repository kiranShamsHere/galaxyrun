import { useState } from 'react'

type PlayerNamePageProps = {
  initialName: string
  onContinue: (name: string) => void
  onBack: () => void
}

export function PlayerNamePage({ initialName, onContinue, onBack }: PlayerNamePageProps) {
  const [name, setName] = useState(initialName)
  const cleanName = name.trim()

  return (
    <main className="pilot-page">
      <button className="pilot-back" type="button" onClick={onBack}>← Back</button>
      <form className="pilot-card" onSubmit={(event) => { event.preventDefault(); if (cleanName) onContinue(cleanName) }}>
        <img src="/assets/galaxy-run-mark.svg" width="54" height="54" alt="" />
        <p className="eyebrow">FLIGHT CREW · SOLO PILOT</p>
        <h1>What should we call you?</h1>
        <p>Your name appears on your mission reports.</p>
        <label htmlFor="pilot-name">Pilot name</label>
        <input
          id="pilot-name"
          autoFocus
          autoComplete="nickname"
          maxLength={24}
          placeholder="Enter your name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button className="landing-primary" type="submit" disabled={!cleanName}>
          Enter mission control <span aria-hidden="true">→</span>
        </button>
        <small>Saved on this device.</small>
      </form>
    </main>
  )
}
