# Galaxy Run development checklist

This checklist maps the proposal's development requirements to the current code. The proposal's hackathon kickoff schedule is intentionally excluded from implementation planning. The team's working deadline is **December 15, 2026**, as set by the user.

Check an item only when its implementation is present and usable. Development completion is separate from final NASA submission, judging, and event administration.

## MVP: complete playable mission loop

- [x] Choose between Earth Observer, Moon Mapper, and Mars Scout.
- [x] Configure a spacecraft bus and select three to five science instruments.
- [x] Show live mass, power, mission cost, daily data, and science potential.
- [x] Return resource reasons with a cause, effect, and fix.
- [x] Choose an orbit and show its altitude and calculated circular-orbit period.
- [x] Choose a launch vehicle and check its simplified payload capacity for the target and orbit.
- [x] Calculate the simplified daily data return from downlink rate and contact time.
- [x] Launch a mission, show a flight timeline, and calculate a weighted score.
- [x] Use a seed so the same design and seed replay the same event pattern.
- [x] Explain design and flight-event warnings in the report.
- [x] Return from the report to improve the design and rerun it.
- [x] Add Easy and Normal difficulty with different budgets, hints, and event rates.
- [x] Add propulsion choices, adjustable propellant, launch-mass accounting, and a delta-v resource check.
- [x] Include a hand-checkable rocket-equation example and describe the model simplifications.
- [x] Add mission duration, scenario deadlines, and an operations-cost/science trade-off.
- [x] Add thermal exposure and mission reliability estimates with visible educational assumptions; carry seeded system anomalies into science return and the report.
- [x] Add seeded launch-delay, solar-flare, instrument-fault, communications-dropout, system-anomaly, and budget-cut events with timeline and debrief impacts.
- [x] Add a skippable, reopenable first-mission guide and keyboard-operable contextual definitions for the technical terms used in the builder and report.
- [ ] Verify a new player can finish a mission in under ten minutes (a one-click starter flight and first-mission guide are now available).
- [ ] Test the interface and complete loop on desktop and tablet sizes.
- [ ] Deploy a public link that opens without login.

## Mission data and scientific validity

- [x] Verify rounded Earth, Moon, and Mars mean radii and gravitational parameters against NASA/JPL sources.
- [x] Store rounded constants locally with source URLs and retrieval date in `src/data/missionConstants.ts`.
- [ ] Verify every formula against the proposal's worked examples.
- [x] Add unit tests for orbit period, rocket equation, downlink, design budgets, risk estimates, mission return, scoring, and seeded-repeatability behavior.
- [ ] State each model simplification in the tutorial or nearby UI.
- [ ] Keep every rule in the pure TypeScript engine, separate from React.

## Accessibility and usability

- [x] Add a skip-to-content link, clear page headings, and focus transfer to the report and back.
- [x] Ensure selected controls and keyboard focus are visually distinct.
- [x] Pair status colors with readable status words and explanations.
- [x] Announce live resource totals to screen readers.
- [x] Respect reduced-motion preferences.
- [x] Use original local scenario, spacecraft, logo, and launch-vehicle artwork, plus an optional launch sound that starts off.
- [ ] Audit all text and status colors against WCAG AA contrast ratios.
- [ ] Complete a keyboard-only pass through the full mission flow.
- [ ] Complete a screen-reader pass through the builder and report.

## Phase 2: should-have features

- [ ] Pass-and-play cooperative mode for up to four players with the proposed roles.
- [ ] Add collaboration conflict/resolution scoring.
- [ ] Save designs in browser localStorage.
- [ ] Share designs through a compressed URL and replay them with the same seed.
- [ ] Compare saved designs.
- [ ] Add a leaderboard.
- [ ] Add Hard difficulty.
- [ ] Download a mission report as PDF.
- [ ] Add a simple 3D spacecraft/orbit view, or document the 2D fallback if time is constrained.

## Phase 3: optional features from the proposal

- [ ] Competitive challenge on the same objective.
- [ ] Sandbox mode.
- [ ] More scenarios and a larger parts catalog.
- [ ] Learning cards based on real NASA mission examples.
- [ ] Sound, animation, and achievements.

## Project quality and handoff

- [x] Keep the engine independent from UI code.
- [x] Make sure every warning shown in the UI comes from an engine reason.
- [x] Record project-authored artwork and sound in `docs/CREDITS.md`.
- [ ] Complete source links and retrieval dates for mission constants; verify library licenses before submission.
- [ ] Keep `docs/AI_USE.md` current and replace reviewer placeholders before submission.
- [ ] Update the README as features land.
- [ ] Capture screenshots for the project page.
- [ ] Prepare the proposal's demo artifact (short video or slide deck) and verify links.

### Lighthouse snapshot — November 13, 2026

- Mobile profile (latest run): Performance 81, Accessibility 100, Best Practices 100, SEO 100.
- Desktop profile (latest run): Performance 89, Accessibility 100, Best Practices 100, SEO 100.
- The local runs found no remaining scored Accessibility, Best Practices, or SEO failures. Performance diagnostics still point to main-thread work and a small render-blocking stylesheet; lab scores varied between runs.
- [ ] Complete the separate keyboard-only and screen-reader passes; the Lighthouse accessibility score does not replace those manual checks.

## Development status

The designer, resource checks, propulsion/fuel/delta-v controls, mission-duration budgeting, thermal/reliability estimates, seeded flight events including a budget cut, simplified orbit/launcher selection with distinct launcher icons, Easy/Normal modes, authored local assets, first-flight guide, quick-start flight, contextual term help, and report are implemented. The unchecked items above remain before all proposal development features are complete. Revisit this list after each project step and notify the user when every development item is complete.
