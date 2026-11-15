import { useState } from 'react'
import {
  jplCmlFramework,
  nasaMdlDisciplines,
  nasaMissionFleet,
  nasaMissionSegments,
  type RealNasaMission,
} from '../data/nasaMissionData.ts'
import type { DesignEvaluation, MissionDesign } from '../engine/types.ts'

interface NasaMissionHubModalProps {
  isOpen: boolean
  onClose: () => void
  design: MissionDesign
  evaluation: DesignEvaluation
}

export function NasaMissionHubModal({
  isOpen,
  onClose,
  design,
  evaluation,
}: NasaMissionHubModalProps) {
  const [activeTab, setActiveTab] = useState<'fleet' | 'cml' | 'segments' | 'mdl'>('fleet')
  const [selectedTarget, setSelectedTarget] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  if (!isOpen) return null

  // Calculate JPL CML 4 Compliance for the current design
  const massMarginPct = Math.round(
    Math.max(0, ((evaluation.launchCapacityKg - evaluation.massKg) / Math.max(1, evaluation.launchCapacityKg)) * 100),
  )
  const powerMarginPct = Math.round(
    Math.max(0, ((evaluation.powerAvailableW - evaluation.powerW) / Math.max(1, evaluation.powerAvailableW)) * 100),
  )
  const costMarginPct = Math.round(
    Math.max(
      0,
      ((evaluation.budgetMillionUsd - evaluation.costMillionUsd) / Math.max(1, evaluation.budgetMillionUsd)) * 100,
    ),
  )

  const passesMassCml = massMarginPct >= 15
  const passesPowerCml = powerMarginPct >= 20
  const passesCostCml = costMarginPct >= 20

  const cmlScore = (passesMassCml ? 33 : 0) + (passesPowerCml ? 33 : 0) + (passesCostCml ? 34 : 0)
  const currentCmlLevel =
    cmlScore === 100
      ? 'CML-4 (Point Design Ready)'
      : cmlScore >= 66
        ? 'CML-3 (Trade Space Matured)'
        : 'CML-2 (Initial Feasibility)'

  const filteredFleet = nasaMissionFleet.filter((m) => {
    const matchesTarget = selectedTarget === 'all' || m.target === selectedTarget
    const matchesSearch =
      searchQuery === '' ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.objective.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.keyInstruments.some((inst) => inst.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesTarget && matchesSearch
  })

  return (
    <div
      className="nasa-hub-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nasa-hub-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="nasa-hub-modal">
        {/* Header (fixed at top) */}
        <div className="nasa-hub-header">
          <div className="nasa-hub-title-block">
            <span className="nasa-meatball-tag">NASA OPEN SCIENCE ARCHIVE</span>
            <h2 id="nasa-hub-title">NASA Systems Engineering &amp; Science Fleet</h2>
          </div>
          <button type="button" className="nasa-hub-close" onClick={onClose} aria-label="Close NASA Archive">
            ✕
          </button>
        </div>

        {/* Tab Navigation (fixed under header, never overlapped!) */}
        <div className="nasa-hub-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'fleet'}
            className={`nasa-tab ${activeTab === 'fleet' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('fleet')}
          >
            🛰️ NASA Science Fleet ({nasaMissionFleet.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'cml'}
            className={`nasa-tab ${activeTab === 'cml' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('cml')}
          >
            📋 JPL Concept Maturity (CML)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'segments'}
            className={`nasa-tab ${activeTab === 'segments' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('segments')}
          >
            🌐 4 Mission Segments
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'mdl'}
            className={`nasa-tab ${activeTab === 'mdl' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('mdl')}
          >
            🔬 Goddard MDL Disciplines
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="nasa-hub-body">
          {/* TAB 1: NASA SCIENCE FLEET */}
          {activeTab === 'fleet' && (
            <div className="nasa-tab-pane">
              <div className="pane-intro">
                <p>
                  Explore real NASA flagship &amp; explorer missions cited in the <b>Space Apps Challenge 2026</b>,
                  JPL Pre-Phase A papers, and NASA Goddard studies. See how real flight teams made system trade-offs.
                </p>

                <div className="fleet-controls-bar">
                  <div className="filter-pills">
                    <button
                      type="button"
                      className={`filter-pill ${selectedTarget === 'all' ? 'is-active' : ''}`}
                      onClick={() => setSelectedTarget('all')}
                    >
                      All ({nasaMissionFleet.length})
                    </button>
                    <button
                      type="button"
                      className={`filter-pill ${selectedTarget === 'earth' ? 'is-active' : ''}`}
                      onClick={() => setSelectedTarget('earth')}
                    >
                      Earth &amp; ISS
                    </button>
                    <button
                      type="button"
                      className={`filter-pill ${selectedTarget === 'moon' ? 'is-active' : ''}`}
                      onClick={() => setSelectedTarget('moon')}
                    >
                      Moon
                    </button>
                    <button
                      type="button"
                      className={`filter-pill ${selectedTarget === 'mars' ? 'is-active' : ''}`}
                      onClick={() => setSelectedTarget('mars')}
                    >
                      Mars
                    </button>
                    <button
                      type="button"
                      className={`filter-pill ${selectedTarget === 'venus' ? 'is-active' : ''}`}
                      onClick={() => setSelectedTarget('venus')}
                    >
                      Venus
                    </button>
                    <button
                      type="button"
                      className={`filter-pill ${selectedTarget === 'deep-space' ? 'is-active' : ''}`}
                      onClick={() => setSelectedTarget('deep-space')}
                    >
                      Deep Space
                    </button>
                  </div>

                  <input
                    type="search"
                    placeholder="Search mission or instrument..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="fleet-search-input"
                  />
                </div>
              </div>

              <div className="fleet-grid">
                {filteredFleet.map((m: RealNasaMission) => (
                  <div key={m.id} className="fleet-card">
                    <div className="fleet-card-header">
                      <div>
                        <span className="fleet-type-pill">
                          {m.missionType} · {m.leadCenter}
                        </span>
                        <h3>{m.name}</h3>
                      </div>
                      <span className="fleet-year-badge">{m.launchYear}</span>
                    </div>

                    <p className="fleet-objective">{m.objective}</p>

                    <div className="fleet-spec-section">
                      <small>KEY PAYLOAD / INSTRUMENTS</small>
                      <div className="instrument-tags">
                        {m.keyInstruments.map((inst) => (
                          <span key={inst} className="inst-tag">
                            {inst}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="fleet-takeaway">
                      <b>💡 Mission Engineering Lesson:</b>
                      <p>{m.heritageTakeaway}</p>
                    </div>

                    <a href={m.nasaUrl} target="_blank" rel="noreferrer" className="fleet-link">
                      Official NASA Mission Portal <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: JPL CML MATURITY */}
          {activeTab === 'cml' && (
            <div className="nasa-tab-pane">
              <div className="cml-status-hero">
                <div className="cml-score-circle">
                  <span className="score-val">{cmlScore}%</span>
                  <small>CML-4 MARGIN COMPLIANCE</small>
                </div>
                <div className="cml-score-details">
                  <span className="cml-eyebrow">YOUR CURRENT DESIGN MATURITY</span>
                  <h3>{currentCmlLevel}</h3>
                  <p>
                    Based on NASA JPL Paper{' '}
                    <i>&quot;Space Mission Concept Development Using Concept Maturity Levels&quot;</i> (Wessen, Borden,
                    Ziemer, Kwok, 2013).
                  </p>
                  <div className="margin-checklist">
                    <div className={`margin-item ${passesMassCml ? 'is-pass' : 'is-fail'}`}>
                      <span>{passesMassCml ? '✓' : '×'} Mass Reserve:</span>
                      <b>{massMarginPct}%</b>
                      <small>(JPL standard requires ≥ 15% margin)</small>
                    </div>
                    <div className={`margin-item ${passesPowerCml ? 'is-pass' : 'is-fail'}`}>
                      <span>{passesPowerCml ? '✓' : '×'} Power Margin:</span>
                      <b>{powerMarginPct}%</b>
                      <small>(JPL standard requires ≥ 20% margin)</small>
                    </div>
                    <div className={`margin-item ${passesCostCml ? 'is-pass' : 'is-fail'}`}>
                      <span>{passesCostCml ? '✓' : '×'} Cost Headroom:</span>
                      <b>{costMarginPct}%</b>
                      <small>(JPL standard recommends ≥ 20% contingency)</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Master Equipment List (MEL) Breakdown */}
              <div className="mel-section">
                <h4>Master Equipment List (MEL) — Subsystem Breakdown</h4>
                <div className="mel-table-wrap">
                  <table className="mel-table">
                    <thead>
                      <tr>
                        <th>WBS Subsystem</th>
                        <th>Hardware Element</th>
                        <th>Mass (kg)</th>
                        <th>Power (W)</th>
                        <th>Cost ($M)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>1.0 Structure &amp; Bus</td>
                        <td>Chassis &amp; Avionics Core</td>
                        <td>{Math.max(100, evaluation.dryMassKg - evaluation.solarArrayMassKg - 25)} kg</td>
                        <td>{Math.max(20, evaluation.powerW - 20)} W</td>
                        <td>${(evaluation.costMillionUsd * 0.35).toFixed(1)}M</td>
                      </tr>
                      <tr>
                        <td>2.0 Power System</td>
                        <td>{design.solarPanelAreaM2.toFixed(1)} m² Arrays &amp; Battery</td>
                        <td>{evaluation.solarArrayMassKg.toFixed(1)} kg</td>
                        <td>+{evaluation.powerAvailableW} W gen</td>
                        <td>${evaluation.solarArrayCostMillionUsd.toFixed(1)}M</td>
                      </tr>
                      <tr>
                        <td>3.0 Propulsion</td>
                        <td>Engine ({evaluation.propellantMassKg} kg propellant)</td>
                        <td>{25 + evaluation.propellantMassKg} kg</td>
                        <td>20 W</td>
                        <td>$18.0M</td>
                      </tr>
                      <tr>
                        <td>4.0 Science Payload</td>
                        <td>{design.instrumentIds.length} Mounted Sensors</td>
                        <td>{design.instrumentIds.length * 45} kg</td>
                        <td>{design.instrumentIds.length * 90} W</td>
                        <td>${(design.instrumentIds.length * 32).toFixed(1)}M</td>
                      </tr>
                      <tr className="mel-total-row">
                        <td colSpan={2}>
                          <b>Total Spacecraft Wet Mass &amp; Budget</b>
                        </td>
                        <td>
                          <b>{evaluation.massKg} kg</b>
                        </td>
                        <td>
                          <b>{evaluation.powerW} W</b>
                        </td>
                        <td>
                          <b>${evaluation.costMillionUsd}M</b>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CML Levels Reference */}
              <div className="cml-levels-reference">
                <h4>NASA JPL CML Evolution Scale (CML 1 to 5)</h4>
                <div className="cml-steps-list">
                  {jplCmlFramework.map((lvl) => (
                    <div key={lvl.code} className="cml-step-card">
                      <div className="cml-step-num">{lvl.code}</div>
                      <div className="cml-step-info">
                        <h5>
                          {lvl.title} <small>({lvl.phase})</small>
                        </h5>
                        <p>{lvl.description}</p>
                        <div className="cml-gate">
                          <span>
                            Target Gate: <b>{lvl.targetGate}</b>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 4 MISSION SEGMENTS */}
          {activeTab === 'segments' && (
            <div className="nasa-tab-pane">
              <div className="pane-intro">
                <p>
                  From NASA Flight Systems Engineer Julie Levri (
                  <i>&quot;Design and Develop Science Missions&quot;</i>, NASA Systems Engineering Webinar): Every science
                  mission is split into four interdependent segments.
                </p>
              </div>

              <div className="segments-grid">
                {nasaMissionSegments.map((seg) => (
                  <div key={seg.id} className="segment-card">
                    <div className="segment-card-top">
                      <span className="segment-icon">{seg.icon}</span>
                      <div>
                        <h3>{seg.title}</h3>
                        <small>{seg.leadAgency}</small>
                      </div>
                    </div>
                    <p className="segment-desc">{seg.description}</p>
                    <div className="segment-trade">
                      <b>Engineering Trade-Off:</b>
                      <p>{seg.keyTradeOff ?? seg.keyTakeaway}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: GODDARD MDL DISCIPLINES */}
          {activeTab === 'mdl' && (
            <div className="nasa-tab-pane">
              <div className="pane-intro">
                <p>
                  NASA Goddard’s <b>Mission Design Lab (MDL)</b> unites 16 discipline engineers in rapid collaborative
                  engineering sessions to evaluate point designs, run trade studies, and establish robust safety
                  margins.
                </p>
              </div>

              <div className="mdl-grid">
                {nasaMdlDisciplines.map((d) => (
                  <div key={d.name} className="mdl-card">
                    <div className="mdl-header">
                      <span className="mdl-icon">{d.icon}</span>
                      <h4>{d.name}</h4>
                    </div>
                    <p className="mdl-desc">{d.description}</p>
                    <div className="mdl-metric">
                      <small>PRIMARY METRIC</small>
                      <b>{d.keyParameter}</b>
                    </div>
                    <div className="mdl-guide">
                      <small>NASA MARGIN RULE</small>
                      <p>{d.safetyMarginGuide}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer (fixed at bottom) */}
        <div className="nasa-hub-footer">
          <p>Data sourced from NASA JPL, Goddard Space Flight Center, and NASA Open Science Dataverse.</p>
          <button type="button" className="nasa-hub-done-btn" onClick={onClose}>
            Back to Flight Lab
          </button>
        </div>
      </div>
    </div>
  )
}
