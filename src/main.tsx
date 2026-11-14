import { Component, StrictMode, type ErrorInfo, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

class MissionControlBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Mission control screen failed to render.', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return <main className="crash-recovery"><span aria-hidden="true">✦</span><p className="eyebrow">FLIGHT COMPUTER RECOVERY</p><h1>Mission control is still here.</h1><p>That screen hit a problem. Reload to return to your mission setup.</p><button className="launch-button" type="button" onClick={() => window.location.reload()}>Reload mission control <span aria-hidden="true">↻</span></button></main>
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MissionControlBoundary><App /></MissionControlBoundary>
  </StrictMode>,
)
