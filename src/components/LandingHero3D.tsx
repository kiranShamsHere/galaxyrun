import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function LandingHero3D() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    const width = container.clientWidth || 700
    const height = container.clientHeight || 420

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100)
    camera.position.set(0, 0.5, 9.5)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.35
    container.appendChild(renderer.domElement)

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.8)
    scene.add(ambientLight)

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.6)
    sunLight.position.set(10, 12, 10)
    scene.add(sunLight)

    const earthGlowLight = new THREE.DirectionalLight(0x38bdf8, 1.4)
    earthGlowLight.position.set(4, -6, 2)
    scene.add(earthGlowLight)

    const rimLight = new THREE.DirectionalLight(0x93c5fd, 0.8)
    rimLight.position.set(-8, 5, -5)
    scene.add(rimLight)

    // Root Group
    const rootGroup = new THREE.Group()
    scene.add(rootGroup)

    // 1. Planet in Bottom-Right (Matching exact framing of Image 1)
    const planetGroup = new THREE.Group()
    planetGroup.position.set(3.8, -3.2, -1.0)

    const planetRadius = 4.2
    const planetGeo = new THREE.SphereGeometry(planetRadius, 48, 48)
    const planetMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a5f,
      roughness: 0.35,
      metalness: 0.1,
    })
    const planetMesh = new THREE.Mesh(planetGeo, planetMat)
    planetGroup.add(planetMesh)

    // Atmospheric Glow Rim
    const atmoGeo = new THREE.SphereGeometry(planetRadius * 1.035, 48, 48)
    const atmoMat = new THREE.MeshBasicMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.32,
      side: THREE.BackSide,
    })
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat)
    planetGroup.add(atmoMesh)

    // Shaded fine line hatching on planet surface (matching 2D illustration in 3D)
    const ringHatchGeo = new THREE.RingGeometry(planetRadius * 0.99, planetRadius * 1.02, 64)
    const ringHatchMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    })
    const ringHatch = new THREE.Mesh(ringHatchGeo, ringHatchMat)
    ringHatch.rotation.x = Math.PI / 3
    planetGroup.add(ringHatch)

    rootGroup.add(planetGroup)

    // 2. Orbital Ellipses (Matching exact curved trails of Image 1)
    const orbitsGroup = new THREE.Group()

    // Ellipse 1 (Broad tilted orbit)
    const curve1 = new THREE.EllipseCurve(0, 0, 4.8, 2.6, 0, 2 * Math.PI, false, 0)
    const pts1 = curve1.getPoints(100)
    const geo1 = new THREE.BufferGeometry().setFromPoints(pts1)
    const mat1 = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
    })
    const orbit1 = new THREE.Line(geo1, mat1)
    orbit1.rotation.x = Math.PI / 2.7
    orbit1.rotation.y = -0.25
    orbit1.rotation.z = -0.35
    orbitsGroup.add(orbit1)

    // Ellipse 2 (Steep inclined orbit)
    const curve2 = new THREE.EllipseCurve(0.4, -0.2, 5.2, 3.2, 0, 2 * Math.PI, false, 0)
    const pts2 = curve2.getPoints(100)
    const geo2 = new THREE.BufferGeometry().setFromPoints(pts2)
    const mat2 = new THREE.LineBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.3,
    })
    const orbit2 = new THREE.Line(geo2, mat2)
    orbit2.rotation.x = Math.PI / 2.2
    orbit2.rotation.y = 0.4
    orbit2.rotation.z = 0.2
    orbitsGroup.add(orbit2)

    // Glowing Horizontal Trajectory Beam (as in Image 1 under satellite)
    const beamGeo = new THREE.CylinderGeometry(0.02, 0.02, 7.5, 16)
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xa5f3fc,
      transparent: true,
      opacity: 0.85,
    })
    const beam = new THREE.Mesh(beamGeo, beamMat)
    beam.rotation.z = Math.PI / 2
    beam.position.set(0.6, -0.15, 0.2)
    orbitsGroup.add(beam)

    // Target Waypoint on Orbit 1 (orange dot like in Image 1)
    const dotGeo = new THREE.SphereGeometry(0.09, 16, 16)
    const dotMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
    const dot = new THREE.Mesh(dotGeo, dotMat)
    dot.position.set(3.4, 0.95, -0.5)
    orbitsGroup.add(dot)

    // Halo around waypoint
    const haloGeo = new THREE.RingGeometry(0.12, 0.16, 24)
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
    })
    const halo = new THREE.Mesh(haloGeo, haloMat)
    halo.position.copy(dot.position)
    orbitsGroup.add(halo)

    rootGroup.add(orbitsGroup)

    // 3. Central 3D Spacecraft (Matching the iconic satellite from Image 1!)
    const satellite = new THREE.Group()
    satellite.position.set(-0.25, 0.45, 0.6)

    // Spacecraft Body: Octagonal faceted prism (light blue/white clean panels)
    const bodyGeo = new THREE.CylinderGeometry(0.6, 0.75, 1.25, 6)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xf0fdf4,
      metalness: 0.65,
      roughness: 0.25,
    })
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat)
    satellite.add(bodyMesh)

    // Center Equipment Band (soft cyan)
    const bandGeo = new THREE.CylinderGeometry(0.65, 0.7, 0.4, 6)
    const bandMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      metalness: 0.8,
      roughness: 0.2,
    })
    const bandMesh = new THREE.Mesh(bandGeo, bandMat)
    satellite.add(bandMesh)

    // Solar Wings (Angled trapezoidal blue photovoltaic panels from Image 1)
    const wingWidth = 1.65
    const wingHeight = 0.85
    const wingThickness = 0.04

    // Left Wing
    const leftWingGeo = new THREE.BoxGeometry(wingWidth, wingThickness, wingHeight)
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      metalness: 0.85,
      roughness: 0.2,
    })
    const leftWing = new THREE.Mesh(leftWingGeo, wingMat)
    leftWing.position.set(-1.45, -0.05, 0)
    leftWing.rotation.z = -0.12
    leftWing.rotation.y = 0.15
    satellite.add(leftWing)

    // Right Wing
    const rightWing = new THREE.Mesh(leftWingGeo, wingMat)
    rightWing.position.set(1.45, 0.05, 0)
    rightWing.rotation.z = 0.12
    rightWing.rotation.y = -0.15
    satellite.add(rightWing)

    // Solar panel frame edges
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7 })
    const leftFrame = new THREE.Mesh(
      new THREE.BoxGeometry(wingWidth + 0.06, wingThickness + 0.02, wingHeight + 0.06),
      frameMat,
    )
    leftFrame.position.copy(leftWing.position)
    leftFrame.rotation.copy(leftWing.rotation)
    satellite.add(leftFrame)

    const rightFrame = new THREE.Mesh(
      new THREE.BoxGeometry(wingWidth + 0.06, wingThickness + 0.02, wingHeight + 0.06),
      frameMat,
    )
    rightFrame.position.copy(rightWing.position)
    rightFrame.rotation.copy(rightWing.rotation)
    satellite.add(rightFrame)

    // Top Antenna Mast & Feedhorn (Golden Y-shaped antenna from Image 1!)
    const mastGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.7, 8)
    const mastMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9 })
    const mast = new THREE.Mesh(mastGeo, mastMat)
    mast.position.set(0, 0.95, 0)
    satellite.add(mast)

    // Y-bracket top feed
    const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.35, 8), mastMat)
    arm1.position.set(-0.12, 1.35, 0)
    arm1.rotation.z = Math.PI / 4.5
    satellite.add(arm1)

    const arm2 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.35, 8), mastMat)
    arm2.position.set(0.12, 1.35, 0)
    arm2.rotation.z = -Math.PI / 4.5
    satellite.add(arm2)

    // Initial orientation tilt matching Image 1
    satellite.rotation.x = 0.15
    satellite.rotation.y = 0.25
    satellite.rotation.z = -0.15

    rootGroup.add(satellite)

    // Drag to rotate in 3D
    let isDragging = false
    let prevMouse = { x: 0, y: 0 }
    let targetRotation = { x: 0.15, y: 0.25 }

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true
      prevMouse = { x: e.clientX, y: e.clientY }
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      const dx = e.clientX - prevMouse.x
      const dy = e.clientY - prevMouse.y
      targetRotation.y += dx * 0.009
      targetRotation.x = Math.max(-0.9, Math.min(0.9, targetRotation.x + dy * 0.009))
      prevMouse = { x: e.clientX, y: e.clientY }
    }

    const onMouseUp = () => {
      isDragging = false
    }

    const dom = renderer.domElement
    dom.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    // Animation Loop
    let animId: number
    const clock = new THREE.Clock()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const delta = clock.getDelta()
      const t = clock.getElapsedTime()

      // Subtle orbital hover float for the satellite
      if (!isDragging) {
        satellite.position.y = 0.45 + Math.sin(t * 1.2) * 0.08
        targetRotation.y += delta * 0.18
      }

      satellite.rotation.y += (targetRotation.y - satellite.rotation.y) * 0.08
      satellite.rotation.x += (targetRotation.x - satellite.rotation.x) * 0.08

      // Rotate planet slowly
      planetMesh.rotation.y += delta * 0.06

      // Slowly rotate orbital halo
      halo.rotation.z += delta * 0.4

      renderer.render(scene, camera)
    }

    animate()

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

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
      dom.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      renderer.dispose()
      if (container.contains(dom)) container.removeChild(dom)
    }
  }, [])

  return (
    <div className="scene-interactive-card" role="img" aria-label="Interactive 3D model of spacecraft orbiting Sol System">
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="hero-3d-canvas-wrap" />

      {/* Grid Dot Overlay (matching the original dot matrix of Image 1) */}
      <div className="scene-dot-grid" aria-hidden="true" />

      {/* Top Header Tag */}
      <div className="scene-coordinate coordinate-top">
        MISSION 001 <span>·</span> SOL SYSTEM
      </div>

      {/* Interactive 3D Badge */}
      <div className="scene-3d-hint">
        <span className="live-dot" /> 3D ORBIT MODEL · DRAG TO ROTATE
      </div>

      {/* Bottom Readout */}
      <div className="scene-readout">
        <span>FLIGHT PATH / 01</span>
        <strong>DESIGN <i>·</i> LAUNCH <i>·</i> LEARN</strong>
      </div>

      {/* Bottom Coordinates */}
      <span className="scene-coordinate coordinate-bottom">
        34° 12′ N <span>·</span> 118° 10′ W
      </span>
    </div>
  )
}
