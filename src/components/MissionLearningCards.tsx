import type { MissionScenario } from '../engine/types.ts'

const examples = [
  { body: 'earth', name: 'Terra · Earth systems', idea: 'Five sensors on one spacecraft observe land, atmosphere, oceans, snow and ice, and energy. Different measurements let scientists compare changes across the Earth system.', href: 'https://terra.nasa.gov/about/mission', source: 'NASA Terra mission' },
  { body: 'moon', name: 'Lunar Reconnaissance Orbiter · Moon', idea: 'LRO maps the lunar surface and measures temperature, composition, and radiation. Its observations help identify safe landing regions and useful resources.', href: 'https://science.nasa.gov/mission/lro/', source: 'NASA LRO mission' },
  { body: 'mars', name: 'Mars Reconnaissance Orbiter · Mars', idea: 'MRO combines cameras, spectrometers, radar, and relay communications. HiRISE’s detailed images show why high-resolution instruments can produce demanding data loads.', href: 'https://science.nasa.gov/mission/mars-reconnaissance-orbiter/science-instruments/', source: 'NASA MRO instruments' },
  { body: 'venus', name: 'Venus Express · Venus', idea: 'ESA’s Venus Express used orbital observations to study the atmosphere and clouds. Venus receives stronger sunlight than Earth, which changes the solar-power trade-off in this game.', href: 'https://www.esa.int/Science_Exploration/Space_Science/Venus_Express', source: 'ESA Venus Express' },
]

export function MissionLearningCards({ scenario }: { scenario: MissionScenario }) {
  const example = examples.find((item) => item.body === scenario.bodyId)
  if (!example) return null
  return <details className="panel learning-card"><summary><span><small>REAL MISSION FIELD NOTE</small><b>{example.name}</b></span><span aria-hidden="true">+</span></summary><p>{example.idea}</p><a href={example.href} target="_blank" rel="noreferrer">Read the mission source <span aria-hidden="true">↗</span></a><small className="learning-credit">Source: {example.source}; Galaxy Run is an educational simulation and is not affiliated with the mission team.</small></details>
}
