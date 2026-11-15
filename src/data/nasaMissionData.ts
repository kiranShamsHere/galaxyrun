/**
 * Comprehensive NASA reference data curated from:
 * - JPL Concept Maturity Levels (CML) Framework (Wessen et al., 2013)
 * - NASA Goddard Mission Design Lab (MDL) & Systems Engineering Handbook (SP-2016-6105)
 * - NASA Web-based Space Mission Visualization (WSMV) & SSD Ephemerides
 * - NASA SMD Science Fleet & Webb "Build It Yourself: Satellite!" / "Scope It Out"
 * - NASA BioNutrients Research Mission on ISS
 */

export interface RealNasaMission {
  id: string
  name: string
  target: 'earth' | 'moon' | 'mars' | 'venus' | 'deep-space'
  launchYear: number
  status: 'Operating' | 'Completed' | 'In Development'
  missionType: 'Orbiter' | 'Space Telescope' | 'Constellation' | 'Sample Return' | 'ISS Payload' | 'Flyby / Interstellar' | 'Rover'
  leadCenter: string
  objective: string
  keyInstruments: string[]
  wavelengthsOrSensors: string[]
  heritageTakeaway: string
  nasaUrl: string
}

export interface CmlLevelInfo {
  level: number
  code: string
  title: string
  phase: string
  description: string
  keyDeliverables: string[]
  targetGate: string
}

export interface MdlDiscipline {
  name: string
  icon: string
  description: string
  keyParameter: string
  safetyMarginGuide: string
}

export const nasaMissionFleet: RealNasaMission[] = [
  {
    id: 'terra',
    name: 'Terra (EOS AM-1)',
    target: 'earth',
    launchYear: 1999,
    status: 'Operating',
    missionType: 'Orbiter',
    leadCenter: 'NASA Goddard (GSFC)',
    objective: 'Flagship Earth-observing satellite measuring changes in land, oceans, atmosphere, snow, ice, and energy budget simultaneously.',
    keyInstruments: ['MODIS (Moderate Resolution Imaging Spectroradiometer)', 'ASTER (Thermal Radiometer)', 'MISR (Multi-angle Radiometer)', 'CERES', 'MOPITT'],
    wavelengthsOrSensors: ['Visible', 'Near-Infrared', 'Thermal Infrared'],
    heritageTakeaway: 'Proves multi-sensor synergy: five sensors produce massive daily science return but demand 2,500 kg launch mass and 2,500 W peak power.',
    nasaUrl: 'https://terra.nasa.gov/about/mission',
  },
  {
    id: 'lro',
    name: 'Lunar Reconnaissance Orbiter (LRO)',
    target: 'moon',
    launchYear: 2009,
    status: 'Operating',
    missionType: 'Orbiter',
    leadCenter: 'NASA Goddard (GSFC)',
    objective: 'High-resolution lunar mapping, 3D topography, surface temperature, radiation, and water ice prospecting at polar craters.',
    keyInstruments: ['LROC (Narrow/Wide Angle Cameras)', 'LOLA (Laser Altimeter)', 'Diviner (Lunar Radiometer)', 'LAMP (Far-UV)', 'CRaTER'],
    wavelengthsOrSensors: ['Visible Optical (50 cm/pixel)', 'Thermal IR (40K to 400K)', 'Laser Lidar 1064 nm'],
    heritageTakeaway: 'Low 50 km polar orbit demands frequent orbital maintenance burns (~1,800 m/s delta-v life) but yields unparalleled landing site reconnaissance for Artemis.',
    nasaUrl: 'https://science.nasa.gov/mission/lro/',
  },
  {
    id: 'mro',
    name: 'Mars Reconnaissance Orbiter (MRO)',
    target: 'mars',
    launchYear: 2005,
    status: 'Operating',
    missionType: 'Orbiter',
    leadCenter: 'NASA JPL',
    objective: 'Seeking evidence of past water activity, scouting rover landing zones, and serving as the primary high-rate telecommunications relay for Mars surface rovers.',
    keyInstruments: ['HiRISE (High Resolution Imaging Science Experiment)', 'CRISM (Spectrometer)', 'SHARAD (Shallow Radar Sounder)', 'MCS', 'CTX', 'Electra Relay'],
    wavelengthsOrSensors: ['Visible (0.3 m/px from 300 km)', 'Infrared (0.36 to 3.92 µm)', 'Radar (15-25 MHz HF)'],
    heritageTakeaway: 'HiRISE produces up to 28 Gb per observation, driving the need for a 3-meter high-gain antenna, Ka-band downlink, and large solid-state memory.',
    nasaUrl: 'https://science.nasa.gov/mission/mars-reconnaissance-orbiter/',
  },
  {
    id: 'veritas-magellan',
    name: 'Magellan & VERITAS',
    target: 'venus',
    launchYear: 1989,
    status: 'In Development',
    missionType: 'Orbiter',
    leadCenter: 'NASA JPL',
    objective: 'Piercing the opaque, sulfuric acid cloud cover of Venus with synthetic aperture radar and near-infrared surface emissivity spectroscopy.',
    keyInstruments: ['VISAR (X-band Synthetic Aperture Radar)', 'VEM (Venus Emissivity Mapper)', 'Gravity Science & Radio Link'],
    wavelengthsOrSensors: ['X-band Radar (7.9 GHz)', 'Near-IR spectral bands (0.86 to 1.18 µm)'],
    heritageTakeaway: 'Solar irradiance at Venus is 2,601 W/m² (191% of Earth), creating severe thermal load that requires specialized optical solar reflectors and high-temp solar cells.',
    nasaUrl: 'https://science.nasa.gov/mission/veritas/',
  },
  {
    id: 'jwst',
    name: 'James Webb Space Telescope (JWST)',
    target: 'deep-space',
    launchYear: 2021,
    status: 'Operating',
    missionType: 'Space Telescope',
    leadCenter: 'NASA Goddard / STScI',
    objective: 'Observing the first stars and galaxies formed after the Big Bang, studying the birth of planetary systems, and analyzing exoplanet atmospheres.',
    keyInstruments: ['NIRCam (0.6-5 µm)', 'MIRI (5-28 µm with cryocooler at 7K)', 'NIRSpec (multi-object microshutter)', 'FGS/NIRISS'],
    wavelengthsOrSensors: ['Infrared (0.6 to 28.3 µm)', '18 Beryllium Hexagonal Gold Mirrors (6.5m aperture)', '5-layer Kapton Sunshield'],
    heritageTakeaway: 'As taught in NASA Scope It Out & Build It Yourself, deep infrared astronomy requires cryogenic cooling to 7 Kelvin; sunshield keeps telescope at -233°C.',
    nasaUrl: 'https://science.nasa.gov/mission/webb/',
  },
  {
    id: 'parker-solar-probe',
    name: 'Parker Solar Probe',
    target: 'deep-space',
    launchYear: 2018,
    status: 'Operating',
    missionType: 'Flyby / Interstellar',
    leadCenter: 'NASA GSFC / JHU-APL',
    objective: 'Flying directly through the Sun’s corona to trace the flow of energy that heats the corona and accelerates the solar wind.',
    keyInstruments: ['FIELDS (Electromagnetic field suite)', 'WISPR (Wide-field Imager for Solar Probe)', 'SWEAP (Solar Wind Electrons Alphas and Protons)', 'IS☉IS'],
    wavelengthsOrSensors: ['Visible white light', 'Plasma electrostatic analyzers', 'Fluxgate and search-coil magnetometers'],
    heritageTakeaway: 'Extreme thermal challenge: 11.4 cm thick carbon-composite heat shield endures temperatures up to 1,377°C while keeping instruments at ~30°C.',
    nasaUrl: 'https://science.nasa.gov/mission/parker-solar-probe/',
  },
  {
    id: 'cassini-huygens',
    name: 'Cassini-Huygens',
    target: 'deep-space',
    launchYear: 1997,
    status: 'Completed',
    missionType: 'Orbiter',
    leadCenter: 'NASA JPL / ESA / ASI',
    objective: 'Decade-long exploration of Saturn, its iconic rings, and its moons, including deploying the ESA Huygens probe to the surface of Titan.',
    keyInstruments: ['ISS (Imaging Science Subsystem)', 'VIMS (Visible & IR Mapping Spectrometer)', 'RADAR (Synthetic Aperture Radar & Altimeter)', 'CIRS', 'RPWS'],
    wavelengthsOrSensors: ['Visible (0.2 to 1.1 µm)', 'IR (0.35 to 5.1 µm)', 'Ku-band Radar (13.78 GHz)'],
    heritageTakeaway: 'At 9.5 AU from the Sun, solar power drops to ~15 W/m² (1% of Earth), mandating Radioisotope Thermoelectric Generators (RTGs) instead of photovoltaic arrays.',
    nasaUrl: 'https://science.nasa.gov/mission/cassini/',
  },
  {
    id: 'voyager',
    name: 'Voyager 1 & 2',
    target: 'deep-space',
    launchYear: 1977,
    status: 'Operating',
    missionType: 'Flyby / Interstellar',
    leadCenter: 'NASA JPL',
    objective: 'Exploring the outer gas giants (Jupiter, Saturn, Uranus, Neptune) and crossing the heliopause into true interstellar space.',
    keyInstruments: ['ISS (Imaging Science System)', 'MAG (Magnetometer)', 'LECP (Low Energy Charged Particle)', 'CRS (Cosmic Ray Subsystem)'],
    wavelengthsOrSensors: ['Wide/Narrow angle vidicon cameras', 'Triaxial fluxgate magnetometers', 'Solid-state particle detectors'],
    heritageTakeaway: 'Over 48 years of continuous flight: 3.7-meter high-gain antenna enables communication from beyond 24 billion kilometers using NASA’s 70-meter DSN dishes.',
    nasaUrl: 'https://voyager.jpl.nasa.gov/',
  },
  {
    id: 'curiosity-perseverance',
    name: 'Curiosity & Perseverance (Mars 2020)',
    target: 'mars',
    launchYear: 2020,
    status: 'Operating',
    missionType: 'Rover',
    leadCenter: 'NASA JPL',
    objective: 'Searching for signs of ancient microbial life in Jezero crater, characterizing geology/climate, and caching samples for future Mars Sample Return.',
    keyInstruments: ['Mastcam-Z (Zoom stereoscopic camera)', 'SuperCam (Laser-induced breakdown spectroscopy)', 'PIXL (X-ray lithochemistry)', 'SHERLOC (UV Raman)', 'MOXIE (O2 generation)'],
    wavelengthsOrSensors: ['Visible 3D stereo', 'Laser plasma spectroscopy 1064 nm', 'UV fluorescence 248.6 nm', 'X-ray fluorescence'],
    heritageTakeaway: 'Sky crane entry, descent, and landing (EDL) demonstrated precision guidance to land a 1,025 kg mobile robotic science laboratory on Mars.',
    nasaUrl: 'https://science.nasa.gov/mission/mars-2020-perseverance/',
  },
  {
    id: 'hubble',
    name: 'Hubble Space Telescope (HST)',
    target: 'earth',
    launchYear: 1990,
    status: 'Operating',
    missionType: 'Space Telescope',
    leadCenter: 'NASA Goddard / STScI',
    objective: 'Transforming astronomy with deep ultraviolet, visible, and near-infrared observations above Earth’s distorting atmosphere.',
    keyInstruments: ['WFC3 (Wide Field Camera 3)', 'COS (Cosmic Origins Spectrograph)', 'ACS (Advanced Camera for Surveys)', 'STIS'],
    wavelengthsOrSensors: ['Near-UV to Near-IR (0.1 to 1.7 µm)', '2.4-meter primary mirror'],
    heritageTakeaway: 'Modular on-orbit servicing by Space Shuttle crews extended mission lifetime to 35+ years and proved the value of modular orbital avionics.',
    nasaUrl: 'https://science.nasa.gov/mission/hubble/',
  },
  {
    id: 'osiris-rex',
    name: 'OSIRIS-REx / OSIRIS-APEX',
    target: 'deep-space',
    launchYear: 2016,
    status: 'Operating',
    missionType: 'Sample Return',
    leadCenter: 'NASA Goddard / University of Arizona',
    objective: 'Rendezvous with near-Earth carbonaceous asteroid Bennu, study its geology and mineralogy, and return a pristine 121-gram sample to Earth.',
    keyInstruments: ['OCAMS (PolyCam, MapCam, SamCam cameras)', 'OVIRS (Visible & IR Spectrometer)', 'OTES (Thermal Emission Spectrometer)', 'OLA (Laser Altimeter)'],
    wavelengthsOrSensors: ['Visible (0.4 to 0.7 µm)', 'Near-IR (0.4 to 4.3 µm)', 'Thermal IR (5.7 to 100 µm)', 'Lidar laser altimeter'],
    heritageTakeaway: 'Microgravity proximity operations around a 500-meter asteroid required millimeter-per-second precision delta-V burns and autonomous hazard avoidance.',
    nasaUrl: 'https://science.nasa.gov/mission/osiris-rex/',
  },
  {
    id: 'bionutrients',
    name: 'BioNutrients-1 & 2',
    target: 'earth',
    launchYear: 2022,
    status: 'Completed',
    missionType: 'ISS Payload',
    leadCenter: 'NASA Ames (ARC)',
    objective: 'Testing shelf-stable genetically-modified yeast spores to produce fresh vitamins (beta-carotene and zeaxanthin) in space for long-duration deep space missions.',
    keyInstruments: ['FEP Fluorinated Ethylene Propylene Production Bags', 'Needlefree Swabable Barb Valves', 'MELFI -80°C Cryo Freezer'],
    wavelengthsOrSensors: ['Biological assay', 'Dry cell mass', 'Spectrophotometry for nutrient yield'],
    heritageTakeaway: 'Demonstrated that in-situ biological manufacturing can drastically reduce spacecraft mass (<250g container, <300mL volume) compared to carrying multi-year food mass.',
    nasaUrl: 'https://www.nasa.gov/general/what-is-bionutrients/',
  },
  {
    id: 'punch',
    name: 'PUNCH (Polarimeter to Unify the Corona and Heliosphere)',
    target: 'earth',
    launchYear: 2025,
    status: 'In Development',
    missionType: 'Constellation',
    leadCenter: 'SwRI / NASA Goddard',
    objective: 'Constellation of 4 microsatellites in sun-synchronous low Earth orbit mapping the 3D structure of the solar wind and coronal mass ejections.',
    keyInstruments: ['Narrow Field Imager (NFI)', 'Wide Field Imagers (WFI x3) with polarization filters'],
    wavelengthsOrSensors: ['Visible light polarization', 'Solar corona Thomson scattering'],
    heritageTakeaway: 'Distributing observations across 4 smaller standardized microsatellites provides global 3D stereoscopic view at lower launch cost than a monolithic spacecraft.',
    nasaUrl: 'https://science.nasa.gov/mission/punch/',
  },
  {
    id: 'dawn',
    name: 'Dawn',
    target: 'deep-space',
    launchYear: 2007,
    status: 'Completed',
    missionType: 'Orbiter',
    leadCenter: 'NASA JPL',
    objective: 'First spacecraft to orbit two separate extraterrestrial bodies (Vesta and dwarf planet Ceres) in the asteroid belt.',
    keyInstruments: ['Xenon Ion Propulsion System (Isp ~3100s)', 'Framing Camera', 'Visible & IR Mapping Spectrometer (VIR)', 'Gamma Ray and Neutron Detector (GRaND)'],
    wavelengthsOrSensors: ['Visible/IR spectroscopy', 'Neutron/Gamma ray nuclear spectroscopy'],
    heritageTakeaway: 'Solar electric ion propulsion allowed Dawn to achieve 11 km/s of delta-v on only 425 kg of xenon propellant, proving ion drives for multi-target exploration.',
    nasaUrl: 'https://science.nasa.gov/mission/dawn/',
  },
]

export const jplCmlFramework: CmlLevelInfo[] = [
  {
    level: 1,
    code: 'CML-1',
    title: 'Cocktail Napkin',
    phase: 'Early Pre-Phase A',
    description: 'The science questions have been well articulated, observation type proposed, and rudimentary sketch of the concept created. Captures what makes the idea unique and meaningful.',
    keyDeliverables: ['Science objective defined in 1 sentence', 'Initial timeframe identified', 'Cost class targeted'],
    targetGate: 'A-Team Exploration',
  },
  {
    level: 2,
    code: 'CML-2',
    title: 'Initial Feasibility',
    phase: 'Pre-Phase A',
    description: 'Idea expanded and questioned on feasibility from science, technical, and programmatic viewpoints. Key performance parameters quantified and basic physics calculations performed.',
    keyDeliverables: ['Key performance parameters (mass, power, delta-v)', 'First-order feasibility calculations', 'Analogous mission comparisons'],
    targetGate: 'Team X Feasibility Review',
  },
  {
    level: 3,
    code: 'CML-3',
    title: 'Trade Space Exploration',
    phase: 'Pre-Phase A',
    description: 'Exploration around science objectives and architectural trades between spacecraft system, ground system, and mission design to explore impacts on science return, cost, and risk.',
    keyDeliverables: ['Trade study across orbits & launchers', 'Science partials evaluated (science vs cost/mass)', 'Instrument options and sensitivities'],
    targetGate: 'Synthesis Portfolio',
  },
  {
    level: 4,
    code: 'CML-4',
    title: 'Point Design',
    phase: 'Pre-Phase A Final',
    description: 'A specific point design that returns the desired science has been selected within the trade space, defined down to major subsystems with acceptable margins and reserves.',
    keyDeliverables: [
      'Master Equipment List (MEL) documented to assembly level',
      'Mass growth allowance: ≥ 15% to 35% margin',
      'Power margin: ≥ 20% to 35% margin',
      'Cost contingency: ≥ 25% reserve',
      'Science Traceability Matrix (STM) drafted',
    ],
    targetGate: 'Mission Concept Review (MCR) / Step 1 Proposal',
  },
  {
    level: 5,
    code: 'CML-5',
    title: 'Baseline Concept',
    phase: 'Phase A',
    description: 'Implementation approach defined including partners, contracting mode, integration and test approach, cost and schedule.',
    keyDeliverables: ['Step 1 Proposal', 'Baseline cost and schedule (WBS)', 'Risk matrix (5x5) populated'],
    targetGate: 'Baseline Commitment Review (BCR)',
  },
]

export const nasaMissionSegments = [
  {
    id: 'launch',
    title: 'Launch Segment',
    icon: '🚀',
    leadAgency: 'NASA Launch Services Program (LSP)',
    description: 'The launch vehicle (e.g. Pathfinder, Voyager, Atlas, or SLS) providing the delta-v and orbital injection to escape Earth’s gravity well and reach the designated trajectory.',
    keyTradeOff: 'Higher lift capacity allows heavier scientific payloads and fuel reserves, but dramatically increases launch vehicle procurement costs.',
  },
  {
    id: 'space',
    title: 'Space Segment',
    icon: '🛰️',
    leadAgency: 'Spacecraft Systems & Payload',
    description: 'The observatory bus, attitude determination & control, power solar arrays/batteries, thermal insulation (MLI), propellant tanks, thrusters, and scientific sensor suite.',
    keyTradeOff: 'More scientific sensors yield higher science points, but drive up electrical power consumption, dry mass, data generation, and thermal stress.',
  },
  {
    id: 'ground',
    title: 'Ground Segment',
    icon: '📡',
    leadAgency: 'NASA Deep Space Network (DSN)',
    description: 'Ground tracking stations (Goldstone, Madrid, Canberra) and mission operations center providing telecommunications uplink, telemetry reception, and command validation.',
    keyTradeOff: 'Ground pass contact duration and antenna dish scheduling cap daily data return. Orbit altitude directly dictates line-of-sight visibility windows.',
  },
  {
    id: 'user',
    title: 'User Segment',
    icon: '🔬',
    leadAgency: 'Science Mission Directorate (SMD)',
    description: 'Planetary scientists, principal investigators, and educational researchers receiving downlinked Level 0 telemetry, converting it to calibrated Level 1/2 science data products.',
    keyTakeaway: 'The ultimate justification for any NASA mission: transforming raw downlink megabits into peer-reviewed discoveries that advance human knowledge.',
  },
]

export const nasaMdlDisciplines: MdlDiscipline[] = [
  {
    name: 'Structures & Mechanical',
    icon: '📐',
    description: 'Defines bus chassis, instrument optical benches, deployable solar wings, and payload fairing volume clearance.',
    keyParameter: 'Spacecraft Dry Mass (kg)',
    safetyMarginGuide: 'JPL/NASA standard recommends ≥ 15% mass contingency for early point designs.',
  },
  {
    name: 'Power & Thermal',
    icon: '⚡',
    description: 'Solar array sizing based on solar flux (W/m²), secondary battery capacity for shadow eclipses, and MLI thermal radiation shields.',
    keyParameter: 'Power Balance (W) & Battery (Wh)',
    safetyMarginGuide: '≥ 20% power margin required between solar generation and peak subsystem consumption.',
  },
  {
    name: 'Propulsion & Astrodynamics',
    icon: '🔥',
    description: 'Delta-v budget calculation using Tsiolkovsky rocket equation, orbital insertion maneuvers, and reaction wheel desaturation.',
    keyParameter: 'Delta-V (m/s) & Specific Impulse (s)',
    safetyMarginGuide: 'Ensure propellant load meets orbital insertion requirements with ≥ 10% reserve margin.',
  },
  {
    name: 'Telecommunications & Avionics',
    icon: '📡',
    description: 'Link budget calculation, transmitter RF power, high-gain dish pointing, onboard flight computer, and solid-state data recorder.',
    keyParameter: 'Data Rate (Mbps) & Daily Downlink (GB)',
    safetyMarginGuide: 'Daily instrument generation must fit within the DSN ground pass contact window.',
  },
]
