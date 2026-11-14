# Credits

Keep this file up to date. The hackathon submission asks for every data source, tool, code, text and image resource we used.

## NASA data and resources

| What | Where it came from | Date retrieved | Used in |
| --- | --- | --- | --- |
| Mean planetary radii for Earth, Mars and Venus | NASA/JPL Solar System Dynamics physical parameters: https://ssd.jpl.nasa.gov/planets/phys_par.html | 2026-11-14 | `src/data/missionConstants.ts` |
| Earth, Moon, Mars-system and Venus gravitational parameters (GM) | NASA/JPL Solar System Dynamics astrodynamic parameters, DE440 values: https://ssd.jpl.nasa.gov/astro_par.html | 2026-11-14 | `src/data/missionConstants.ts` |
| Lunar mean radius and lunar gravity cross-check | NASA/JPL satellite physical parameters: https://ssd.jpl.nasa.gov/sats/phys_par/; NASA Moon fact sheet: https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html | 2026-11-14 | `src/data/missionConstants.ts` |
| Solar irradiance at Earth, Moon, Mars and Venus | NASA NSSDC fact sheets: Earth https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html; Moon https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html; Mars https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html; Venus https://nssdc.gsfc.nasa.gov/planetary/factsheet/venusfact.html. The game uses the fact-sheet values (1361.0, 1361.0, 586.2 and 2601.3 W/m², respectively). | 2026-11-14 | `src/data/catalog.ts`, `src/data/missionConstants.ts` |
| Terra Earth observation mission | NASA Terra mission: https://terra.nasa.gov/about/mission | 2026-11-14 | `src/components/MissionLearningCards.tsx` |
| Lunar Reconnaissance Orbiter observations | NASA LRO mission: https://science.nasa.gov/mission/lro/ | 2026-11-14 | `src/components/MissionLearningCards.tsx` |
| Mars Reconnaissance Orbiter instruments | NASA MRO science instruments: https://science.nasa.gov/mission/mars-reconnaissance-orbiter/science-instruments/ | 2026-11-14 | `src/components/MissionLearningCards.tsx` |
| Magellan Venus radar-mapping mission | NASA Magellan mission: https://science.nasa.gov/mission/magellan/ | 2026-11-14 | `src/components/MissionLearningCards.tsx` |
| Venus Express science mission (previous Venus learning-card source; superseded by NASA Magellan) | ESA Venus Express: https://www.esa.int/Science_Exploration/Space_Science/Venus_Express | 2026-11-14 | Earlier project version |

Previously cited for Venus irradiance and superseded by the directly comparable NASA NSSDC fact-sheet value: NASA Technical Reports Server, [Venus environment report](https://ntrs.nasa.gov/citations/20240000076). The game now uses 2601.3 W/m² from the Venus fact sheet above; the former 2614 W/m² input was removed.

## Challenge

- NASA Space Apps Challenge 2026, challenge "Space Mission Design Game". Official brief: https://github.com/NASA-SPACEAPP-2026/Space-Mission-Design-Game

## Open source libraries

| Library | Purpose | License |
| --- | --- | --- |
| React | User interface | MIT |
| React DOM | Browser rendering | MIT |
| Vite | Build tool and dev server | MIT |
| `@vitejs/plugin-react` | React support in Vite | MIT |
| `@tailwindcss/vite` | Tailwind integration for Vite | MIT |
| TypeScript | Language | Apache 2.0 |
| Tailwind CSS | Styling | MIT |
| Zustand | State store | MIT |
| Zod | Data validation | MIT |
| lz-string | Share link compression | MIT |
| Vitest | Testing | MIT |
| oxlint | Linting | MIT |
| `@types/node`, `@types/react`, `@types/react-dom` | Type declarations | MIT |

Direct dependency manifest licenses were checked against the installed package metadata on 2026-11-14. Transitive dependencies are not individually enumerated here.

## Images, fonts and sound

| Item | Source | License or permission |
| --- | --- | --- |
| Galaxy Run wordmark, Earth/Moon/Mars/Venus scenario emblems, spacecraft illustration, and distinct Pathfinder/Voyager/Atlas icons | Original SVG artwork created for this project in `public/assets/` | Original project assets |
| Launch cue | Original short sound synthesized for this project in `public/assets/launch-cue.wav` | Original project asset |

The interface uses system fonts and has no downloaded image, sound, or font assets. Any NASA image must be credited here with its source link. No NASA logos, no NASA mission badges, and no copyrighted music.

## Inspiration (no code or art copied)

- Kerbal Space Program
- Juno: New Origins
- Mars Horizon
- NASA Eyes on the Solar System
