import { useMemo, useState } from 'react'
import { parts, scenarios } from '../data/catalog.ts'
import type { MissionDesign } from '../engine/types.ts'
import { createDesignShareUrl, deleteSavedDesign, readSavedDesigns, saveDesign, type SavedDesign } from '../utils/designLibrary.ts'

export function DesignLibraryPanel({ design, onLoad }: { design: MissionDesign; onLoad: (design: MissionDesign) => void }) {
  const [name, setName] = useState('My mission design')
  const [saved, setSaved] = useState<SavedDesign[]>(readSavedDesigns)
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [message, setMessage] = useState('Saved designs stay in this browser.')
  const comparison = useMemo(() => saved.filter((item) => compareIds.includes(item.id)), [saved, compareIds])

  function saveCurrent() {
    const cleanName = name.trim()
    if (!cleanName) { setMessage('Add a name before saving.'); return }
    if (saveDesign(cleanName, design)) {
      setSaved(readSavedDesigns())
      setMessage(`“${cleanName}” saved on this device.`)
    } else setMessage('This browser could not save the design.')
  }

  async function shareCurrent() {
    const url = createDesignShareUrl(design)
    if (!url) { setMessage('This design could not be encoded.'); return }
    try {
      await navigator.clipboard.writeText(url)
      setMessage('Share link copied. It includes this design and replay seed 2026.')
    } catch {
      setMessage(url)
    }
  }

  function toggleCompare(id: string) {
    setCompareIds((items) => items.includes(id) ? items.filter((value) => value !== id) : items.length < 2 ? [...items, id] : [items[1], id])
  }

  return <section className="panel design-library" aria-labelledby="design-library-title">
    <div className="section-heading"><div><p className="eyebrow">MISSION WORKBENCH</p><h2 id="design-library-title">Save, share & compare</h2></div></div>
    <p className="why-intro">Keep designs on this device or send a compressed link that restores the design and its seeded run.</p>
    <div className="library-actions"><label className="library-name">Design name<input value={name} maxLength={32} onChange={(event) => setName(event.currentTarget.value)} /></label><button type="button" className="secondary-button" onClick={saveCurrent}>Save design</button><button type="button" className="secondary-button" onClick={() => void shareCurrent()}>Copy share link</button></div>
    <p className="library-message" role="status" aria-live="polite">{message}</p>
    {saved.length > 0 && <div className="saved-design-list"><h3>Saved on this device</h3>{saved.map((item) => <div className="saved-design-row" key={item.id}><div><b>{item.name}</b><small>{scenarios.find((scenario) => scenario.id === item.design.scenarioId)?.name ?? 'Mission'} · {item.design.difficulty}</small></div><button type="button" className="text-button" onClick={() => onLoad(item.design)}>Load</button><button type="button" className="text-button" aria-pressed={compareIds.includes(item.id)} onClick={() => toggleCompare(item.id)}>{compareIds.includes(item.id) ? 'Comparing' : 'Compare'}</button><button type="button" className="text-button" aria-label={`Delete ${item.name}`} onClick={() => { deleteSavedDesign(item.id); setSaved(readSavedDesigns()); setCompareIds((ids) => ids.filter((id) => id !== item.id)) }}>Delete</button></div>)}</div>}
    {comparison.length > 0 && <div className="comparison-table" role="region" aria-label="Saved design comparison" tabIndex={0}><table><caption>Design comparison</caption><thead><tr><th scope="col">Choice</th>{comparison.map((item) => <th key={item.id} scope="col">{item.name}</th>)}</tr></thead><tbody>
      <tr><th scope="row">Destination</th>{comparison.map((item) => <td key={item.id}>{scenarios.find((scenario) => scenario.id === item.design.scenarioId)?.destination}</td>)}</tr>
      <tr><th scope="row">Spacecraft bus</th>{comparison.map((item) => <td key={item.id}>{parts.find((part) => part.id === item.design.busId)?.name}</td>)}</tr>
      <tr><th scope="row">Instruments</th>{comparison.map((item) => <td key={item.id}>{item.design.instrumentIds.length}</td>)}</tr>
      <tr><th scope="row">Solar array</th>{comparison.map((item) => <td key={item.id}>{item.design.solarPanelAreaM2} m²</td>)}</tr>
      <tr><th scope="row">Mission length</th>{comparison.map((item) => <td key={item.id}>{item.design.missionDurationDays} days</td>)}</tr>
      <tr><th scope="row">Difficulty</th>{comparison.map((item) => <td key={item.id}>{item.design.difficulty}</td>)}</tr>
    </tbody></table></div>}
  </section>
}
