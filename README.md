<div align="center">

# Galaxy Run

**Design a space mission. Launch it. Find out why it worked or failed.**

A browser game about balancing spacecraft choices and learning from their consequences.

[Play the game](#live-deployment) · [How it works](#how-it-works) · [Run locally](#run-locally) · [Development checklist](docs/DEVELOPMENT_CHECKLIST.md)

</div>

> **Project deadline: December 15, 2026.** Hackathon kickoff scheduling is intentionally not part of this plan. The proposal’s implementable game features are in the project; manual tests and external submission steps are tracked in the development checklist.

## The idea

Galaxy Run turns mission design into a short, replayable systems exercise. Players choose an objective, build a spacecraft, check resources, fly a seeded mission, and review an explanation of the outcome.

The **why engine** is the center of the game. Each resource check describes its cause, effect, and possible fix. Flight reports connect seeded events and science return to the selected design.

## How it works

1. Choose Earth, Moon, Mars, or Venus and set a difficulty or Sandbox mode.
2. Select a bus, three to five science instruments, propulsion, propellant, launch vehicle, orbit, solar-panel area, development time, and mission length.
3. Review live mass, power, eclipse battery, budget, data, science, and schedule estimates.
4. Launch a seeded simulation and inspect the timeline, score, reasons, and awards.
5. Revise, save, and compare your designs on this device. Replay a flight with the same seed to compare your own changes.

## Features

- Four destination scenarios and an expanding spacecraft/instrument catalog.
- Easy, Normal, and Hard settings, plus a resource-unbounded Sandbox practice mode.
- Solar-array output and eclipse battery calculations alongside mass, cost, data, reliability, thermal risk, delta-v, and schedule checks.
- Cause/effect/fix explanations and a seeded flight timeline.
- Single-player mission design, flight simulation, debrief, and achievements.
- Device-local design saving and comparison, plus repeatable seeded flights.
- NASA/ESA mission field notes, a switchable 2D/3D-style orbit view, and a browser print-to-PDF flight report.
- Original project artwork, optional synthesized sound, first-flight help, contextual definitions, keyboard support, and reduced-motion handling.

## Live deployment

The project team reports that a Vercel deployment exists, but its production URL is not recorded in this repository. Add and verify the URL here before sharing the README or submitting the project. No public-link or no-login claim is made until that check is complete.

## Run locally

You need Node.js 20 or newer and Git.

```bash
git clone https://github.com/kiranShamsHere/galaxyrun.git
cd galaxyrun
npm install
npm run dev
```

Open the local address printed by Vite, usually `http://localhost:5173`.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run check` | Run lint, typecheck, tests, and a production build |
| `npm run test` | Run the formula and engine tests |
| `npm run build` | Typecheck and build for production |
| `npm run preview` | Preview the production build locally |

## Project structure

```text
src/
  components/  Landing page, game panels, field notes, and diagrams
  data/        Mission constants, scenarios, spacecraft catalog, glossary
  engine/      Pure mission calculations, evaluation, seeded simulation, tests
  learn/       Learning notes
  utils/       Local design storage and first-flight guide state
  App.tsx      Screen composition and mission interactions
  store.ts     Mission design state
public/assets/ Original SVG artwork and synthesized launch sound
docs/          Credits, AI-use note, checklists, and project material
.github/       CI workflow and contribution guidance
```

## Data, assumptions, and credits

Planetary constants and irradiance values are stored locally with NASA/JPL sources and retrieval dates. Terra, Lunar Reconnaissance Orbiter, Mars Reconnaissance Orbiter, and Venus Express are used as learning references. Array efficiency, costs, masses, risk ratings, event rates, and launch allowances are simplified game assumptions; Galaxy Run is not a spacecraft engineering tool and is not affiliated with NASA or ESA.

See [docs/CREDITS.md](docs/CREDITS.md) for sources, libraries, artwork, and sound. AI assistance is recorded in [docs/AI_USE.md](docs/AI_USE.md).

## Verification and remaining handoff

`npm run build` passes. Human playtesting, full keyboard and screen-reader reviews, final contrast review, deployment-link verification, teammate review, and event-site fields remain listed in [docs/DEVELOPMENT_CHECKLIST.md](docs/DEVELOPMENT_CHECKLIST.md) and [docs/SUBMISSION_CHECKLIST.md](docs/SUBMISSION_CHECKLIST.md).

## License

[MIT](LICENSE)
