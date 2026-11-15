/**
 * Web Audio API synthesized sound generator for Galaxy Run.
 * Generates immediate, crisp UI and spacecraft audio effects without external assets.
 */

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioCtx) {
      audioCtx = new AudioCtx()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    void audioCtx.resume()
  }
  return audioCtx
}

export const soundFx = {
  /** Crisp UI click/selection blip */
  blip(enabled: boolean) {
    if (!enabled) return
    const ctx = getAudioContext()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const now = ctx.currentTime

    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, now)
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.05)

    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.06)
  },

  /** Mechanical latch / module mount chime */
  mount(enabled: boolean) {
    if (!enabled) return
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime

    // Dual-tone harmonic latch
    ;[523.25, 783.99].forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now + idx * 0.03)

      gain.gain.setValueAtTime(0.07, now + idx * 0.03)
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.03 + 0.12)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + idx * 0.03)
      osc.stop(now + idx * 0.03 + 0.12)
    })
  },

  /** Satisfying quick-fix resolved sound */
  fix(enabled: boolean) {
    if (!enabled) return
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const freqs = [440, 554.37, 659.25, 880]

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const startTime = now + idx * 0.04

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, startTime)

      gain.gain.setValueAtTime(0.06, startTime)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(startTime)
      osc.stop(startTime + 0.1)
    })
  },

  /** Warning alert buzz */
  warning(enabled: boolean) {
    if (!enabled) return
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(220, now)
    osc.frequency.setValueAtTime(196, now + 0.08)

    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.18)
  },

  /** Deep space rocket thruster rumble & launch cue */
  launch(enabled: boolean) {
    if (!enabled) return
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime

    // Low rumble oscillator
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(65, now)
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.8)

    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 1.2)
  },

  /** Short state cue when the simulation advances to its next flight phase. */
  missionPhase(enabled: boolean, status: 'ok' | 'warn' | 'fail', isFinal = false) {
    if (!enabled) return
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const notes = status === 'fail'
      ? [247, 185]
      : status === 'warn'
        ? [440, 349]
        : isFinal
          ? [523, 659, 784]
          : [440, 554]

    notes.forEach((frequency, index) => {
      const start = now + index * 0.09
      const duration = status === 'fail' ? 0.16 : 0.11
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.type = status === 'fail' ? 'triangle' : 'sine'
      oscillator.frequency.setValueAtTime(frequency, start)
      gain.gain.setValueAtTime(status === 'fail' ? 0.045 : 0.035, start)
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration)
      oscillator.connect(gain)
      gain.connect(ctx.destination)
      oscillator.start(start)
      oscillator.stop(start + duration)
    })
  },

  /** Soft digital tones as science data reaches the ground station. */
  downlink(enabled: boolean) {
    if (!enabled) return
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    ;[740, 988, 830, 1175].forEach((frequency, index) => {
      const start = now + index * 0.075
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(frequency, start)
      gain.gain.setValueAtTime(0.025, start)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.07)
      oscillator.connect(gain)
      gain.connect(ctx.destination)
      oscillator.start(start)
      oscillator.stop(start + 0.07)
    })
  },
}
