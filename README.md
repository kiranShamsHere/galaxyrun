<div align="center">

<img src="public/assets/galaxy-run-mark.svg" width="88" alt="Galaxy Run">

# Galaxy Run

**Design a space mission. Launch it. Find out why it worked or failed.**

A browser game about balancing spacecraft choices and learning from their consequences.

[Play live](https://galaxyrun-eight.vercel.app/) · [Problem](#problem) · [Features](#features) · [Architecture](#architecture) · [Project structure](#project-structure) · [Run locally](#run-locally) · [Contributing](CONTRIBUTING.md)

</div>

> **Project deadline: December 15, 2026.** Hackathon kickoff scheduling is intentionally not part of this plan. Human testing and external submission steps are tracked in the development checklist.

## The idea

Galaxy Run turns early mission design into a short, replayable systems exercise. Pick a destination, assemble a spacecraft, trade science against resources, fly a repeatable simulation, and learn from the result.

The **why engine** makes the trade-offs visible. Every design check reports its status, cause, effect, and a possible fix. This is an educational game, not a spacecraft engineering tool.

## Problem

Mission concepts have to balance coupled constraints: adding instruments may increase science potential while also increasing mass, power demand, cost, and data volume. A simple pass/fail result does not teach players which trade-off caused a problem.

## Solution

Galaxy Run makes those trade-offs interactive. Players adjust a mission plan, see the resource estimates update, then fly a repeatable simulation and inspect the reasons behind the result.

## How it works

1. Choose an Earth, Moon, Mars, or Venus mission and a difficulty, or use Sandbox.
2. Select a spacecraft bus, three to five instruments, propulsion, propellant, launcher, orbit, solar-panel area, and mission schedule.
3. Review live mass, power, eclipse energy, cost, data, science, reliability, thermal risk, delta-v, and schedule estimates.
4. Fly with a seed, then inspect the timeline, score, explanation, and awards. The same design and seed reproduce the same events.
5. Revise, save, compare, and replay designs on the same device.

```mermaid
flowchart TD
    A[Choose destination and difficulty] --> B[Build spacecraft and mission plan]
    B --> C[Calculate live resource budgets]
    C --> D{Design within mission limits?}
    D -- No --> E[Read cause, effect, and suggested fix]
    E --> B
    D -- Yes --> F[Launch seeded simulation]
    D -- Sandbox --> F
    F --> G[Review flight timeline and science return]
    G --> H[Read score, reasons, and awards]
    H --> I[Save or compare locally]
    I --> B
```

## Features

| Area | Features |
| :--- | :--- |
| Mission setup | Earth, Moon, Mars, and Venus scenarios; Easy, Normal, Hard, and Sandbox modes |
| Spacecraft design | Choose a bus, three to five instruments, launcher, propulsion, orbit, propellant, solar-panel area, and schedule |
| Live analysis | Track mass, power, eclipse energy, cost, data return, science, reliability, thermal risk, delta-v, and schedule |
| Seeded flight | Replay the same design and seed to compare timelines, events, science return, score, and awards |
| Learn and report | Cause/effect/fix explanations, NASA mission field notes, interactive orbit and spacecraft views, printable flight report |
| Experience | Local design saves and comparison, first-flight guidance, contextual definitions, keyboard support, reduced motion, original artwork, optional synthesized sound |

## Mission checks

Mission limits are calculated from the selected destination, orbit, difficulty, and hardware. A failed limit blocks a Mission-mode launch; Sandbox allows the flight while still showing the checks.

| Check | What the game compares | Result when outside target |
| :--- | :--- | :--- |
| Mass | Spacecraft mass versus launcher payload capacity for the destination and orbit | Blocks launch |
| Power | System power demand versus estimated solar-array output | Blocks launch |
| Eclipse energy | Energy needed during eclipse versus spacecraft-bus battery capacity | Blocks launch |
| Delta-v | Idealized propulsion estimate versus the scenario target | Blocks launch |
| Cost | Hardware, launch, propulsion, solar array, and operations cost versus scenario budget | Blocks launch |
| Data return | Instrument data generation versus estimated daily downlink capacity | Warns that some data may not return |
| Schedule | Development plus mission duration versus scenario deadline | Blocks launch |
| Thermal risk and reliability | Simplified component/environment estimates | Warns when thermal risk is above 12% or estimated reliability is below 80% |

These are educational game rules and simplified assumptions, not operational spacecraft acceptance criteria. The calculation details and caveats are in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Architecture

```mermaid
flowchart LR
    Player[Player] --> UI[React screens and components]
    UI --> Store[Zustand mission-design state]
    UI --> Engine[Pure TypeScript mission engine]
    Catalog[Bundled scenarios, parts, constants] --> UI
    Catalog --> Engine
    Engine --> Evaluation[Resource evaluation and reasons]
    Evaluation --> Simulation[Seeded flight simulation]
    Simulation --> Report[Timeline, score, awards, report]
    Report --> UI
    UI --> Browser[(Browser localStorage)]
    Browser --> UI
```

The core game runs in the browser from bundled data. There is no runtime AI model, remote game backend, or account service in the current code. The pilot name, saved designs, and first-flight guide status are kept in browser storage; current mission state and flight results are in memory. See [the full architecture and data notes](docs/ARCHITECTURE.md).

### API and machine-learning status

The current app has no public API endpoints, backend service, or in-game machine-learning model. Mission data and calculations are bundled with the web app and run locally in the browser. NASA reference links are educational sources, not live data feeds. AI tools mentioned below assisted development; they are not called by players' missions.

## Team and contributions

| Team member | Contribution |
| :--- | :--- |
| Kiran Shams | Project lead |
| Hadeed Ahsan | Development |
| Rimsha Younis | Data research and resources |
| Mariam | Testing |

## AI tools

AI tools are used as part of project development, not as models called by the game. The team has identified Claude and Google Antigravity; the repository also records OpenAI Codex. Antigravity is a development environment, and its selected underlying model is not recorded here. See [docs/AI_USE.md](docs/AI_USE.md) for the working attribution record and review status.

## Data, assumptions, and credits

Planetary radii, gravitational parameters, and solar irradiance values are bundled from NASA/JPL and NASA NSSDC references. NASA mission and instrument information is included as learning material. Costs, spacecraft masses, efficiencies, reliability, risk, launch capacity, and event probabilities are simplified game assumptions. Source links, retrieval dates, libraries, and original assets are listed in [docs/CREDITS.md](docs/CREDITS.md).

## NASA and partner resources

The following sources inform bundled physical values and learning content; Galaxy Run does not fetch live data from these sites.

| Organization / resource | Reference | How Galaxy Run uses it |
| :--- | :--- | :--- |
| NASA/JPL Solar System Dynamics | [Planetary physical parameters](https://ssd.jpl.nasa.gov/planets/phys_par.html), [astrodynamic parameters](https://ssd.jpl.nasa.gov/astro_par.html), [satellite physical parameters](https://ssd.jpl.nasa.gov/sats/phys_par/) | Bundled planetary radii and gravitational parameters |
| NASA NSSDC | [Earth](https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html), [Moon](https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html), [Mars](https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html), [Venus](https://nssdc.gsfc.nasa.gov/planetary/factsheet/venusfact.html) fact sheets | Solar irradiance inputs for the scenarios |
| NASA mission pages | [Terra](https://terra.nasa.gov/about/mission), [Lunar Reconnaissance Orbiter](https://science.nasa.gov/mission/lro/), [Mars Reconnaissance Orbiter](https://science.nasa.gov/mission/mars-reconnaissance-orbiter/science-instruments/), [Magellan](https://science.nasa.gov/mission/magellan/) | Mission and instrument learning references |
| NASA Space Apps Challenge | [Space Mission Design Game challenge](https://github.com/NASA-SPACEAPP-2026/Space-Mission-Design-Game) | Challenge brief |
| European Space Agency (ESA), historical reference | [Venus Express](https://www.esa.int/Science_Exploration/Space_Science/Venus_Express) | Credited as an earlier project source; current Venus learning content refers to NASA's Magellan mission |

See [docs/CREDITS.md](docs/CREDITS.md) for retrieval dates, exact values, software licenses, and project-created assets.

## Live deployment

**Live demo:** [Play Galaxy Run](https://galaxyrun-eight.vercel.app/)

The deployment returned the Galaxy Run app page when checked on 2026-11-15. Full mission-flow and private-window verification remain on the handoff checklist.

## Limitations

- Mission values and flight events are simplified; the app is not suitable for real spacecraft engineering or mission decisions.
- Designs and pilot names are browser-local, with no cross-device sync, accounts, or online leaderboard.
- The live deployment link is available, but full gameplay and private-window verification are still pending.

## Future work

- Run human playtests and review the educational model assumptions with a knowledgeable reviewer.
- Complete keyboard-only and screen-reader reviews, then recheck WCAG AA contrast.
- Verify the full mission flow in a private window; capture screenshots and finish submission materials.
- Review the AI-use attribution with the team before the final submission.

Track handoff progress in [docs/DEVELOPMENT_CHECKLIST.md](docs/DEVELOPMENT_CHECKLIST.md) and [docs/SUBMISSION_CHECKLIST.md](docs/SUBMISSION_CHECKLIST.md).

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
| :--- | :--- |
| `npm run dev` | Start the development server |
| `npm run check` | Run lint, typecheck, tests, and a production build |
| `npm run test` | Run formula and engine tests |
| `npm run build` | Typecheck and build for production |
| `npm run preview` | Preview the production build locally |

## Project structure

| Path | Purpose |
| :--- | :--- |
| `src/App.tsx`, `src/main.tsx` | Compose the application screens, interactions, and React entry point |
| `src/components/` | Landing page, mission designer, guidance, views, field notes, and report UI |
| `src/data/` | Mission scenarios, spacecraft catalog, NASA references, and glossary |
| `src/engine/` | Pure calculations, design evaluation, seeded simulation, and tests |
| `src/learn/`, `src/ui/` | Learning notes and UI-layer documentation |
| `src/store.ts`, `src/utils/` | In-memory mission state, browser-local saves, guide state, and sound effects |
| `public/assets/` | Original project illustrations, emblems, and sound |
| `docs/` | Architecture, credits, AI use, and project checklists |
| `.github/` | CI workflow and pull-request template |
| `package.json`, `vite.config.ts`, `tsconfig*.json` | Dependencies, scripts, build, and TypeScript configuration |

For the complete file tree and component responsibilities, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Verification and handoff

Run `npm run check` before proposing a change. Human playtesting, accessibility reviews, deployment-link verification, team review, and event-site fields remain tracked in [docs/DEVELOPMENT_CHECKLIST.md](docs/DEVELOPMENT_CHECKLIST.md) and [docs/SUBMISSION_CHECKLIST.md](docs/SUBMISSION_CHECKLIST.md).

## License

[MIT](LICENSE)
