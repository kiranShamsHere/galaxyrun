<div align="center">

# Galaxy Run

**Design a space mission. Launch it. Find out why it worked or failed.**

A browser game for the NASA Space Apps Challenge 2026, built for the official challenge *Space Mission Design Game*.

![Status](https://img.shields.io/badge/status-MVP%20in%20progress-a6f26b)
![React](https://img.shields.io/badge/React-19-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6)
![License](https://img.shields.io/badge/license-MIT-2dd4bf)

[Play the demo](#live-demo) · [How it works](#how-it-works) · [Run it locally](#run-it-locally) · [Tech stack](#tech-stack) · [Team](#team)

</div>

> **Project status:** the first playable loop is in progress. The working project deadline is December 15, 2026. The repository includes three mission scenarios, Easy and Normal modes, spacecraft hardware and propulsion choices, live resource totals, engine-generated design feedback, fuel/delta-v checks, mission-duration/deadline trade-offs, orbit and launcher choices, a seeded mission run, a flight timeline and a score report. The UI uses original local artwork, an optional launch cue, a first-mission guide, and contextual technical definitions. Keyboard and reduced-motion support are implemented; accessibility audits remain. Design saving/sharing, cooperative mode, and public deployment are still to come. See [the development checklist](docs/DEVELOPMENT_CHECKLIST.md) for the full proposal status.

---

## The problem

Designing a space mission means balancing mass, power, cost, data, orbit, fuel and time at once. Every choice pushes on the others. A better camera gives more science, but it also adds weight, uses more power, creates more data and costs more money.

Most learning tools teach these ideas one at a time. A student can understand each concept and still not know how to make decisions for a whole mission. And when a game says "mission failed", it rarely says which decision caused it.

## The idea

Galaxy Run is a short game where you design a mission, fly it, and then read a report that explains the result in plain words.

The core of it is the **why engine**. Every rule in the simulation returns two things: a number, and a reason with a cause, an effect and a fix. The interface never invents explanations. It only shows reasons the engine produced from the numbers in your run.

So instead of a red bar, you get this kind of message:

```text
Not enough power.
Cause:  your instruments need 335 W, the solar panels give 300 W.
Effect: instruments would shut down during eclipse.
Fix:    add a panel, or drop one instrument.
```

The numbers above are an example of the format, not real game output.

## How it works

1. **Choose** a mission scenario and a difficulty.
2. **Design** the spacecraft: bus, instruments, launch vehicle and orbit. Live bars show mass, power, cost and data as you build.
3. **Check** the design. Warnings explain themselves.
4. **Simulate** the mission on a timeline with seeded random events.
5. **Learn** from the mission report, which ties every result to a design choice.
6. **Improve** the design and try again, or share it.

Random events use a seed, so the same design with the same seed always gives the same result. A funding cut can reduce active observation time and science return during a run.

## Features

Implemented in the current foundation:

- [x] Three scenario choices: Earth Observer, Moon Mapper, Mars Scout
- [x] Easy and Normal difficulty with distinct allowances, hints, and event rates
- [x] Spacecraft bus and science instrument selection
- [x] Live mass, power, parts and launch cost, data and science totals
- [x] Propulsion choice, propellant slider, and rocket-equation delta-v check
- [x] Mission-duration slider with deadline and operations-cost trade-offs
- [x] Design feedback with a cause, effect and fix for each resource check
- [x] Orbit selection, circular period estimate, and simplified launch capacity check
- [x] Seeded flight events, including budget cuts, with a mission timeline, score breakdown and event explanations
- [x] One-click starter flight, reopenable first-mission guide, and keyboard-operable technical term help
- [x] Original scenario, orbiter, logo, and launch-vehicle artwork; optional launch sound

Next for the first playable version:

- [ ] Responsive public link that works on laptop and tablet

Planned if time allows:

- [ ] Cooperative mode for up to four players with team roles
- [ ] Share a design through a link
- [ ] Leaderboard
- [ ] Downloadable PDF mission report
- [ ] 3D spacecraft and orbit view
- [ ] Sandbox mode and a Hard difficulty

## Live demo

Not published yet. The link will go here after the first deploy.

## Screenshots

Screenshots will be added to `docs/screenshots/` once the screens exist.

## Run it locally

You need [Node.js](https://nodejs.org/) 20 or newer (22 recommended) and Git.

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/galaxyrun.git
cd galaxyrun

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open the address that Vite prints, usually `http://localhost:5173`.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Type check and create a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run test` | Run all tests once |
| `npm run test:watch` | Run tests and re run on every change |
| `npm run lint` | Check the code with oxlint |
| `npm run typecheck` | Check types with TypeScript |
| `npm run check` | Lint, type check, test and build in one go |

Run `npm run check` before opening a pull request. The same checks run in GitHub Actions.

## Tech stack

| Tool | Why we use it |
| --- | --- |
| TypeScript | Catches mistakes such as mixing kilograms and grams, and lets the engine and the interface share types |
| React | Component based screens that re render when the design changes, which live dashboard bars need |
| Vite | Fast dev server, simple build, TypeScript works out of the box |
| Tailwind CSS | Quick, consistent, responsive styling |
| Zustand | A tiny store that holds the current mission design |
| Pure TypeScript engine | No UI code, so it is easy to test, fair and easy to explain |
| Vitest | Unit tests for every formula |
| Zod | Checks the JSON catalogs when they load, so bad data fails early |
| Recharts | Live power and data charts |
| lz-string | Compresses a design into a share link, no backend needed |
| Vercel | Free hosting with a preview link for every pull request |
| GitHub Actions | Runs lint, types, tests and build on every push |

Planned and optional: Three.js with React Three Fiber for a 3D view, Supabase for a leaderboard and online co op, jsPDF for the report download.

## Project structure

```text
galaxyrun/
  src/
    engine/   Pure TypeScript rules, evaluation, events, scoring and reasons
    data/     Scenario and spacecraft part catalogs, launch vehicles, NASA constants
    ui/       React screens and components
    learn/    Tutorial text, tooltips and concept cards
    store.ts  Zustand mission design state
    App.tsx   Mission selection, spacecraft designer and live dashboard
  docs/       Credits, AI use note, submission checklist, screenshots
  .github/    CI workflow and pull request template
```

## Data and credits

The game will use real NASA values for planets and orbits, such as radii and gravitational constants. Each value will be stored in `src/data/` with its source and retrieval date, so the game does not depend on a live API during a demo.

Every data source, image, library and tool is listed in [docs/CREDITS.md](docs/CREDITS.md). This project does not use NASA logos or mission badges.

## Use of AI

AI tools were used while planning this project. The exact use, including anything in the code, text or images, is listed in [docs/AI_USE.md](docs/AI_USE.md) and is also stated in the hackathon submission.

## Contributing

The team works with short branches and pull requests. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Team

Built by Kiran, Rimsha and Hadeed in the Universal Event of the NASA Space Apps Challenge 2026.

## License

[MIT](LICENSE)

This project was created for the NASA Space Apps Challenge. It is not affiliated with or endorsed by NASA.
