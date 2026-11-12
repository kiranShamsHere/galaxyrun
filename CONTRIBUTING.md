# Contributing

This is a three person hackathon project, so the rules are short.

## Branches

- `main` always builds and passes tests. Nobody pushes straight to `main`.
- One branch per task. Use a short prefix, for example:
  - `engine/power-rules`
  - `ui/dashboard-bars`
  - `learn/tutorial-text`
- Open a pull request, ask one teammate to look at it, then merge.
- Merge often, at least every few hours, so nobody drifts away from `main`.

## Before you open a pull request

```bash
npm run check
```

This runs lint, type check, tests and a production build. The same steps run in GitHub Actions.

## Rules for the code

- The engine (`src/engine`) has no React and no browser code. It takes data in and returns data out.
- Every formula gets a unit test with an answer that can be checked by hand.
- Every warning the player sees must come from the engine as a reason (status, cause, effect, fix). The UI does not write its own explanations.
- Keep units in the names, for example `massKg`, `powerW`, `costMillionUsd`.
- Random events use the seeded generator, never `Math.random`.

## Credits and AI use

If you add any outside resource, add it to [docs/CREDITS.md](docs/CREDITS.md) in the same pull request. That includes data, images, fonts, libraries and code from tutorials.

If AI tools helped with code, text or images, add a line to [docs/AI_USE.md](docs/AI_USE.md). The hackathon submission asks us to say where and how AI was used.

## Safety

- No secrets in the repo. Use `.env` locally (it is ignored by git).
- No personal information, and no names or faces of people under 18.
- No NASA logos and no copyrighted music or images.

## Commit messages

Plain and short, in the present tense: `add power budget rule`, `fix dashboard bar overflow`.
