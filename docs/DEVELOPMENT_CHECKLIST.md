# Galaxy Run development checklist

This checklist maps the project proposal to the current code and handoff state. The user asked us to ignore hackathon kickoff scheduling and use **December 15, 2026** as the working deadline. No event dates from the proposal are used here.

An item is checked only when the work exists in the project. Local implementation is distinct from manual playtests, deployment verification, team registration, and the external submission form.

## MVP: playable mission loop

- [x] Landing page introduces the game, previews destinations, and enters mission design.
- [x] Provide Earth, Moon, Mars, and Venus mission scenarios.
- [x] Configure a bus and select three to five instruments from a growing catalog.
- [x] Choose a scenario, difficulty, orbit, launcher, propulsion system, propellant, development time, mission duration, and panel area.
- [x] Show live mass, solar power, eclipse battery, cost, data, science, and total schedule.
- [x] Explain checks with a cause, effect, and fix.
- [x] Calculate circular orbit period, ideal rocket-equation delta-v, solar output, eclipse energy, and downlink capacity.
- [x] Launch a seeded run with timeline, score, debrief, event impacts, awards, and retry path.
- [x] Same design and seed repeat the event sequence.
- [x] Include skippable/reopenable first-flight guidance and a one-click starter flight.
- [ ] Confirm a new player completes a mission in under ten minutes in a short human playtest.
- [ ] Manually review the full flow at laptop and tablet sizes.
- [ ] Manually verify the production URL in a private window and confirm the full mission flow works without authentication: https://galaxyrun-eight.vercel.app/

## Mission math, science, and fairness

- [x] Store local planetary constants with primary source links and retrieval dates.
- [x] Add NASA-sourced solar irradiance values for Earth, Mars, and Venus; Moon scenarios use the solar constant as a game input.
- [x] Test the proposal examples: 620 km Earth orbit, 300 s Isp rocket equation, 0.8 m² solar panel, 50 Mbps for eight minutes, and eclipse battery energy.
- [x] Keep deterministic rules in the pure TypeScript engine.
- [x] Label hardware mass, costs, reliability, eclipse duration, solar-array efficiency, event rates, and mission targets as simplified game assumptions.
- [x] Include difficulty-adjusted budgets/events, Hard-mode schedule pressure and contingencies, and Sandbox runs that show limits without blocking launch.
- [x] Use a repeatable mission seed for solo flight comparisons.
- [ ] Review the model assumptions with a knowledgeable human before presenting it as educational guidance.

## Solo replay and local saves

- [x] Save and compare designs in browser localStorage.
- [x] Replay a seeded mission locally to compare the player's own designs.
- [x] Keep all mission play and saved designs on one device for one player.

## Learning, report, and presentation

- [x] Add NASA mission field notes for Terra, LRO, MRO, and Magellan/VERITAS with source links.
- [x] Provide switchable 2D and CSS-perspective 3D-style orbit views with an interactive tilt control.
- [x] Print or save the flight report through the browser’s PDF print flow.
- [x] Add optional original sound, reduced-motion-aware animation, and per-run achievements.
- [x] Prepare a six-slide project overview deck in the connected presentation session (within the proposal’s seven-slide maximum).
- [ ] Publish a shareable demo-deck/video link and capture clean screenshots for the submission page.

## Accessibility, quality, and project handoff

- [x] Use keyboard-operable controls, skip links, visible focus, page headings, status words, and report focus management.
- [x] Respect reduced-motion preferences and provide screen-reader announcements for live resources.
- [x] Add responsive layouts and semantic labels to controls, comparison tables, and orbit views.
- [ ] Complete a keyboard-only review of the entire flow.
- [ ] Complete a screen-reader review of the builder and report.
- [ ] Re-run WCAG AA contrast checks across all current and newly added screens; previous Lighthouse scores do not replace this audit.
- [x] Keep project-authored artwork and synthesized sound credited in `docs/CREDITS.md`.
- [x] Document NASA/ESA sources and direct software dependencies in `docs/CREDITS.md`.
- [x] Verify each direct dependency license against its installed package metadata; transitive licenses still need the team’s submission-policy review.
- [ ] Replace the pending reviewer status in `docs/AI_USE.md` after teammates review the work; do not guess reviewer names.
- [ ] Capture screenshots and enter the verified deployment URL in the submission materials.
- [x] Keep all in-project copy in English and avoid NASA logos, personal information, and unlicensed music or images.

## Verification record

- `npm run check` passes: lint, TypeScript, 14 formula/engine tests, and production build.
- The CI workflow previously passed for the existing main-branch commit. This proposal-requirements branch still needs its own push/CI run.
- Lighthouse results recorded in the earlier development checklist were from November 13 and are not a fresh audit of the added UI.

## Completion statement

**The proposal’s implementable product requirements are now present in the local codebase.** The project is not ready to claim every PDF instruction is complete until the unchecked human and external handoff items above are finished. The schedule and kickoff rules are intentionally excluded per the user’s instruction; the working deadline remains December 15, 2026.
