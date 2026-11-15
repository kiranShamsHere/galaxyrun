import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { MissionScenario, OrbitOption } from '../engine/types.ts'
import { SpaceIcon } from './SpaceIcon.tsx'

interface Orbit3DViewerProps {
  scenario: MissionScenario
  orbit: OrbitOption
}

export function Orbit3DViewer({ scenario, orbit }: Orbit3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const satelliteMeshRef = useRef<THREE.Group | null>(null)
  const orbitAngleRef = useRef(0)

  const [simSpeed, setSimSpeed] = useState(1.0)
  const [showShadowCone, setShowShadowCone] = useState(true)
  const [showGroundCone, setShowGroundCone] = useState(true)

  // Track mouse interaction
  const isDraggingRef = useRef(false)
  const prevMouseRef = useRef({ x: 0, y: 0 })
  const rotAngleRef = useRef({ x: 0.35, y: -0.7 })
  const zoomDistRef = useRef(7.5)

  // Physics calculations
  const rKm = scenario.bodyRadiusKm + orbit.altitudeKm
  const mu = scenario.gravitationalParameterKm3PerSec2
  const periodSec = 2 * Math.PI * Math.sqrt(rKm ** 3 / mu)
  const periodMin = periodSec / 60
  const orbitalSpeedKmS = Math.sqrt(mu / rKm)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    sceneRef.current = scene

    const width = container.clientWidth || 480
    const height = container.clientHeight || 320
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100)
    camera.position.set(5.5, 4.0, 5.5)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.3
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lights
    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.5)
    sunLight.position.set(15, 6, 8)
    scene.add(sunLight)

    const ambientLight = new THREE.AmbientLight(0x0f172a, 0.4)
    scene.add(ambientLight)

    // Deep space background stars
    const starGeo = new THREE.BufferGeometry()
    const starCount = 400
    const starCoords = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount * 3; i += 3) {
      starCoords[i] = (Math.random() - 0.5) * 60
      starCoords[i + 1] = (Math.random() - 0.5) * 60
      starCoords[i + 2] = (Math.random() - 0.5) * 60
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starCoords, 3))
    const starMat = new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.1, transparent: true, opacity: 0.6 })
    scene.add(new THREE.Points(starGeo, starMat))

    // Root world group (rotates with user drag)
    const worldGroup = new THREE.Group()
    scene.add(worldGroup)

    // 1. Procedural 3D Celestial Body Mesh
    const planetRadiusScene = 1.6
    let planetMat: THREE.Material
    let atmosphereMesh: THREE.Mesh | null = null

    if (scenario.bodyId === 'earth') {
      planetMat = new THREE.MeshStandardMaterial({
        color: 0x1d4ed8,
        roughness: 0.5,
        metalness: 0.1,
      })
      // Atmospheric rim glow
      const atmoGeo = new THREE.SphereGeometry(planetRadiusScene * 1.05, 32, 32)
      const atmoMat = new THREE.MeshBasicMaterial({
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.22,
        side: THREE.BackSide,
      })
      atmosphereMesh = new THREE.Mesh(atmoGeo, atmoMat)
    } else if (scenario.bodyId === 'moon') {
      planetMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.9,
        metalness: 0.05,
      })
    } else if (scenario.bodyId === 'mars') {
      planetMat = new THREE.MeshStandardMaterial({
        color: 0xc2410c,
        roughness: 0.7,
        metalness: 0.1,
      })
      // Thin Martian atmosphere
      const atmoGeo = new THREE.SphereGeometry(planetRadiusScene * 1.04, 32, 32)
      const atmoMat = new THREE.MeshBasicMaterial({
        color: 0xf97316,
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide,
      })
      atmosphereMesh = new THREE.Mesh(atmoGeo, atmoMat)
    } else {
      // Venus
      planetMat = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        roughness: 0.35,
        metalness: 0.2,
      })
      // Super dense sulfuric acid atmosphere
      const atmoGeo = new THREE.SphereGeometry(planetRadiusScene * 1.08, 32, 32)
      const atmoMat = new THREE.MeshBasicMaterial({
        color: 0xfcd34d,
        transparent: true,
        opacity: 0.28,
        side: THREE.BackSide,
      })
      atmosphereMesh = new THREE.Mesh(atmoGeo, atmoMat)
    }

    const planetGeo = new THREE.SphereGeometry(planetRadiusScene, 32, 32)
    const planetMesh = new THREE.Mesh(planetGeo, planetMat)
    worldGroup.add(planetMesh)
    if (atmosphereMesh) worldGroup.add(atmosphereMesh)

    // 2. Scaled Orbit Track Radius
    // Normalize visual radius between 2.3 and 3.5
    const visualOrbitRadius = planetRadiusScene + 0.7 + Math.min(1.4, orbit.altitudeKm / 1200)

    // Elliptical Orbit Line
    const orbitCurve = new THREE.EllipseCurve(
      0, 0,
      visualOrbitRadius, visualOrbitRadius * 0.96,
      0, 2 * Math.PI,
      false,
      0,
    )
    const points = orbitCurve.getPoints(90)
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(points)
    const orbitLineMat = new THREE.LineBasicMaterial({
      color: 0xec4899,
      linewidth: 2,
      transparent: true,
      opacity: 0.75,
    })
    const orbitLine = new THREE.Line(orbitGeo, orbitLineMat)
    orbitLine.rotation.x = Math.PI / 2.35
    worldGroup.add(orbitLine)

    // 3. Shadow / Eclipse Cone (Cylinder pointing away from sun)
    if (showShadowCone) {
      const shadowGeo = new THREE.CylinderGeometry(planetRadiusScene * 0.95, planetRadiusScene * 1.25, 4.5, 24, 1, true)
      const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x312e81,
        transparent: true,
        opacity: 0.18,
        side: THREE.DoubleSide,
      })
      const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat)
      shadowMesh.position.set(-2.2, -0.9, -1.2)
      shadowMesh.rotation.z = Math.PI / 2.8
      worldGroup.add(shadowMesh)
    }

    // 4. Ground Station Tracking Cone
    if (showGroundCone) {
      const coneGeo = new THREE.ConeGeometry(0.8, 1.8, 16, 1, true)
      const coneMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.16,
        side: THREE.DoubleSide,
      })
      const coneMesh = new THREE.Mesh(coneGeo, coneMat)
      coneMesh.position.set(0.9, 1.1, 0.8)
      coneMesh.rotation.x = 0.6
      coneMesh.rotation.z = -0.5
      worldGroup.add(coneMesh)
    }

    // 5. Orbiting Spacecraft Model
    const satelliteGroup = new THREE.Group()
    // Sat body
    const satBodyGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2)
    const satBodyMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 })
    satelliteGroup.add(new THREE.Mesh(satBodyGeo, satBodyMat))

    // Sat solar wings
    const satWingGeo = new THREE.BoxGeometry(0.45, 0.02, 0.15)
    const satWingMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8 })
    const leftWing = new THREE.Mesh(satWingGeo, satWingMat)
    leftWing.position.x = -0.32
    satelliteGroup.add(leftWing)

    const rightWing = new THREE.Mesh(satWingGeo, satWingMat)
    rightWing.position.x = 0.32
    satelliteGroup.add(rightWing)

    // Pulsing Beacon
    const beaconGeo = new THREE.SphereGeometry(0.06, 8, 8)
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const beacon = new THREE.Mesh(beaconGeo, beaconMat)
    beacon.position.y = 0.15
    satelliteGroup.add(beacon)

    worldGroup.add(satelliteGroup)
    satelliteMeshRef.current = satelliteGroup

    // Animation loop
    let animId: number
    const clock = new THREE.Clock()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const delta = clock.getDelta()

      // Advance satellite along orbit
      orbitAngleRef.current += delta * 0.75 * simSpeed
      const angle = orbitAngleRef.current

      // Position along inclined orbit plane
      const orbitX = Math.cos(angle) * visualOrbitRadius
      const orbitZ = Math.sin(angle) * (visualOrbitRadius * 0.96)
      const inclinedY = -orbitZ * Math.sin(Math.PI / 6)
      const inclinedZ = orbitZ * Math.cos(Math.PI / 6)

      if (satelliteGroup) {
        satelliteGroup.position.set(orbitX, inclinedY, inclinedZ)
        satelliteGroup.rotation.y = -angle
      }

      // Smooth rotate from user drag
      worldGroup.rotation.y += (rotAngleRef.current.y - worldGroup.rotation.y) * 0.1
      worldGroup.rotation.x += (rotAngleRef.current.x - worldGroup.rotation.x) * 0.1

      // Smooth zoom
      const currentDist = camera.position.length()
      const targetDist = zoomDistRef.current
      if (Math.abs(currentDist - targetDist) > 0.02) {
        camera.position.setLength(currentDist + (targetDist - currentDist) * 0.1)
      }

      renderer.render(scene, camera)
    }

    animate()

    // Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    const ro = new ResizeObserver(handleResize)
    ro.observe(container)

    // Mouse controls
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true
      prevMouseRef.current = { x: e.clientX, y: e.clientY }
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return
      const dx = e.clientX - prevMouseRef.current.x
      const dy = e.clientY - prevMouseRef.current.y

      rotAngleRef.current.y += dx * 0.008
      rotAngleRef.current.x = Math.max(-1.2, Math.min(1.2, rotAngleRef.current.x + dy * 0.008))
      prevMouseRef.current = { x: e.clientX, y: e.clientY }
    }

    const onMouseUp = () => {
      isDraggingRef.current = false
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      zoomDistRef.current = Math.max(4.0, Math.min(12.0, zoomDistRef.current + e.deltaY * 0.006))
    }

    const dom = renderer.domElement
    dom.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    dom.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
      dom.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      dom.removeEventListener('wheel', onWheel)
      renderer.dispose()
      if (container.contains(dom)) container.removeChild(dom)
    }
  }, [scenario, orbit, simSpeed, showShadowCone, showGroundCone])

  return (
    <div className="orbit-3d-container">
      <div
        ref={containerRef}
        className="canvas-3d-orbit"
        style={{ width: '100%', height: '280px', position: 'relative' }}
      >
        <div className="orbit-hud-top">
          <span className="live-pill">
            <i /> 3D ORBIT TRAJECTORY
          </span>
          <span className="orbit-destination-badge">
            {scenario.destination} · {orbit.altitudeKm} km
          </span>
        </div>

        <div className="orbit-hud-bottom">
          <div className="orbit-speed-controls">
            <button
              type="button"
              className={`speed-pill ${simSpeed === 0.5 ? 'is-active' : ''}`}
              onClick={() => setSimSpeed(0.5)}
            >
              0.5x
            </button>
            <button
              type="button"
              className={`speed-pill ${simSpeed === 1.0 ? 'is-active' : ''}`}
              onClick={() => setSimSpeed(1.0)}
            >
              1.0x
            </button>
            <button
              type="button"
              className={`speed-pill ${simSpeed === 2.5 ? 'is-active' : ''}`}
              onClick={() => setSimSpeed(2.5)}
            >
              2.5x
            </button>
          </div>
          <div className="orbit-layer-toggles">
            <button
              type="button"
              className={`layer-pill ${showShadowCone ? 'is-active' : ''}`}
              onClick={() => setShowShadowCone(!showShadowCone)}
            >
              <SpaceIcon symbol="🌑" size={16} /> Shadow
            </button>
            <button
              type="button"
              className={`layer-pill ${showGroundCone ? 'is-active' : ''}`}
              onClick={() => setShowGroundCone(!showGroundCone)}
            >
              <SpaceIcon symbol="📡" size={16} /> DSN Cone
            </button>
          </div>
        </div>
      </div>

      <div className="orbit-telemetry-strip">
        <div className="telemetry-stat">
          <small>PERIOD</small>
          <b>{Math.round(periodMin)} min</b>
        </div>
        <div className="telemetry-stat">
          <small>SPEED</small>
          <b>{orbitalSpeedKmS.toFixed(2)} km/s</b>
        </div>
        <div className="telemetry-stat">
          <small>ECLIPSE SHADOW</small>
          <b>{orbit.eclipseMinutesPerOrbit} min</b>
        </div>
        <div className="telemetry-stat">
          <small>DSN CONTACT</small>
          <b>{orbit.contactMinutesPerDay} min/day</b>
        </div>
      </div>
    </div>
  )
}
