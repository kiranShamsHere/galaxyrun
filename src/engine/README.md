# engine

Pure TypeScript simulation. No React, no DOM, no browser APIs.

The engine contains resource rules (mass, power, cost, orbit, fuel, data, thermal
risk, and reliability), seeded events, scoring, and the reason builder (cause,
effect, fix). Formula and seeded-repeatability coverage lives in `engine.test.ts`.
