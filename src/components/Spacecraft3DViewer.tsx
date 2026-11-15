import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { SpacecraftPart } from '../engine/types.ts'

interface Spacecraft3DViewerProps {
  busId: string
  instrumentIds: string[]
  propulsionId: string
  solarPanelAreaM2: number
  allParts: SpacecraftPart[]
  onToggleInstrument?: (id: string) => void
}

export function Spacecraft3DViewer({
  busId,
  instrumentIds,
  propulsionId,
  solarPanelAreaM2,
  allParts,
  onToggleInstrument,
}: Spacecraft3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const spacecraftGroupRef = useRef<THREE.Group | null>(null)
  const solarWingsRef = useRef<{ left: THREE.Group; right: THREE.Group } | null>(null)

  const [autoRotate, setAutoRotate] = useState(true)
  const [wireframeMode, setWireframeMode] = useState(false)
  const [activeView, setActiveView] = useState<'iso' | 'deck' | 'engine' | 'arrays'>('iso')
  const [hoveredPart, setHoveredPart] = useState<string | null>(null)

  // Track interaction state
  const isDraggingRef = useRef(false)
  const prevMousePosRef = useRef({ x: 0, y: 0 })
  const rotationTargetRef = useRef({ x: 0.35, y: -0.6 })
  const zoomDistRef = useRef(7.5)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Camera setup
    const width = container.clientWidth || 600
    const height = container.clientHeight || 380
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
    camera.position.set(5.5, 4.0, 5.5)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xddeeff, 0.75)
    scene.add(ambientLight)

    const sunLight = new THREE.DirectionalLight(0xfff8ee, 2.2)
    sunLight.position.set(12, 10, 8)
    scene.add(sunLight)

    const earthFillLight = new THREE.DirectionalLight(0x2266aa, 0.9)
    earthFillLight.position.set(-8, -6, -5)
    scene.add(earthFillLight)

    const rimLight = new THREE.DirectionalLight(0xec4899, 0.6)
    rimLight.position.set(0, -10, 8)
    scene.add(rimLight)

    // Spacecraft root group
    const spacecraftGroup = new THREE.Group()
    scene.add(spacecraftGroup)
    spacecraftGroupRef.current = spacecraftGroup

    // Star particle background inside viewer
    const starsGeo = new THREE.BufferGeometry()
    const starCount = 350
    const starPos = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 50
      starPos[i + 1] = (Math.random() - 0.5) * 50
      starPos[i + 2] = (Math.random() - 0.5) * 50
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
    const starsMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.12,
      transparent: true,
      opacity: 0.55,
    })
    const starField = new THREE.Points(starsGeo, starsMat)
    scene.add(starField)

    // Render loop
    let animId: number
    const clock = new THREE.Clock()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const delta = clock.getDelta()

      if (autoRotate && !isDraggingRef.current) {
        rotationTargetRef.current.y += delta * 0.35
      }

      if (spacecraftGroup) {
        spacecraftGroup.rotation.y += (rotationTargetRef.current.y - spacecraftGroup.rotation.y) * 0.1
        spacecraftGroup.rotation.x += (rotationTargetRef.current.x - spacecraftGroup.rotation.x) * 0.1
      }

      // Smooth camera zoom
      if (camera) {
        const currentDist = camera.position.length()
        const targetDist = zoomDistRef.current
        if (Math.abs(currentDist - targetDist) > 0.02) {
          const newDist = currentDist + (targetDist - currentDist) * 0.1
          camera.position.setLength(newDist)
        }
      }

      renderer.render(scene, camera)
    }

    animate()

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)

    // Mouse drag controls
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true
      prevMousePosRef.current = { x: e.clientX, y: e.clientY }
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return
      const dx = e.clientX - prevMousePosRef.current.x
      const dy = e.clientY - prevMousePosRef.current.y

      rotationTargetRef.current.y += dx * 0.008
      rotationTargetRef.current.x = Math.max(
        -Math.PI / 2.2,
        Math.min(Math.PI / 2.2, rotationTargetRef.current.x + dy * 0.008),
      )

      prevMousePosRef.current = { x: e.clientX, y: e.clientY }
    }

    const onMouseUp = () => {
      isDraggingRef.current = false
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      zoomDistRef.current = Math.max(4.0, Math.min(13.0, zoomDistRef.current + e.deltaY * 0.006))
    }

    // Touch controls
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true
        prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return
      const dx = e.touches[0].clientX - prevMousePosRef.current.x
      const dy = e.touches[0].clientY - prevMousePosRef.current.y

      rotationTargetRef.current.y += dx * 0.01
      rotationTargetRef.current.x = Math.max(
        -Math.PI / 2.2,
        Math.min(Math.PI / 2.2, rotationTargetRef.current.x + dy * 0.01),
      )

      prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }

    const onTouchEnd = () => {
      isDraggingRef.current = false
    }

    const dom = renderer.domElement
    dom.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    dom.addEventListener('wheel', onWheel, { passive: false })
    dom.addEventListener('touchstart', onTouchStart, { passive: true })
    dom.addEventListener('touchmove', onTouchMove, { passive: true })
    dom.addEventListener('touchend', onTouchEnd)

    return () => {
      cancelAnimationFrame(animId)
      resizeObserver.disconnect()
      dom.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      dom.removeEventListener('wheel', onWheel)
      dom.removeEventListener('touchstart', onTouchStart)
      dom.removeEventListener('touchmove', onTouchMove)
      dom.removeEventListener('touchend', onTouchEnd)
      renderer.dispose()
      if (container.contains(dom)) {
        container.removeChild(dom)
      }
    }
  }, [autoRotate])

  // Rebuild 3D Spacecraft Model when bus, instruments, propulsion, or solar area changes
  useEffect(() => {
    const group = spacecraftGroupRef.current
    if (!group) return

    // Clear old children
    while (group.children.length > 0) {
      const child = group.children[0]
      group.remove(child)
      if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose()
    }

    // Material definitions
    // Gold Multi-Layer Insulation (MLI) foil for main satellite bus
    const goldMliMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.85,
      roughness: 0.25,
      wireframe: wireframeMode,
      emissive: wireframeMode ? 0x06b6d4 : 0x241604,
      emissiveIntensity: wireframeMode ? 0.8 : 0.2,
    })

    // Carbon Composite Structural Deck
    const carbonDeckMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.4,
      roughness: 0.5,
      wireframe: wireframeMode,
    })

    // High Gain Antenna Dish Material
    const dishMaterial = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.3,
      roughness: 0.2,
      wireframe: wireframeMode,
    })

    // Solar Photovoltaic Cell Material (Deep Blue reflective with gold frame)
    const solarCellMaterial = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      metalness: 0.9,
      roughness: 0.15,
      wireframe: wireframeMode,
    })

    const solarFrameMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.7,
      roughness: 0.4,
      wireframe: wireframeMode,
    })

    // Thruster engine material
    const thrusterMaterial = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.95,
      roughness: 0.2,
      wireframe: wireframeMode,
    })

    // 1. Bus Chassis
    let busMesh: THREE.Mesh
    if (busId === 'compact-bus') {
      // CubeSat-inspired compact cubic bus
      const busGeo = new THREE.BoxGeometry(1.6, 1.8, 1.6)
      busMesh = new THREE.Mesh(busGeo, goldMliMaterial)
    } else if (busId === 'survey-bus') {
      // Elongated survey bus with instrument radiator fins
      const busGeo = new THREE.CylinderGeometry(1.0, 1.0, 2.5, 8)
      busMesh = new THREE.Mesh(busGeo, goldMliMaterial)
    } else {
      // Default Explorer bus: hexagonal prism
      const busGeo = new THREE.CylinderGeometry(1.15, 1.15, 2.2, 6)
      busMesh = new THREE.Mesh(busGeo, goldMliMaterial)
    }
    busMesh.position.y = 0
    group.add(busMesh)

    // Equipment Top Deck
    const topDeckGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.12, 8)
    const topDeckMesh = new THREE.Mesh(topDeckGeo, carbonDeckMaterial)
    topDeckMesh.position.y = 1.15
    group.add(topDeckMesh)

    // Equipment Bottom Deck
    const botDeckMesh = new THREE.Mesh(topDeckGeo, carbonDeckMaterial)
    botDeckMesh.position.y = -1.15
    group.add(botDeckMesh)

    // 2. High-Gain Communications Dish Antenna (Points towards Ground Station)
    const dishGroup = new THREE.Group()
    const dishGeo = new THREE.SphereGeometry(0.75, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2.5)
    const dishMesh = new THREE.Mesh(dishGeo, dishMaterial)
    dishMesh.rotation.x = Math.PI
    dishGroup.add(dishMesh)

    // Sub-reflector feed horn
    const feedGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8)
    const feedMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9 })
    const feedMesh = new THREE.Mesh(feedGeo, feedMat)
    feedMesh.position.y = -0.3
    dishGroup.add(feedMesh)

    // Dish boom support strut
    const strutGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8)
    const strutMesh = new THREE.Mesh(strutGeo, carbonDeckMaterial)
    strutMesh.position.set(0, 0.4, 0)
    dishGroup.add(strutMesh)

    dishGroup.position.set(0, 1.6, 0)
    dishGroup.rotation.x = 0.35
    dishGroup.rotation.z = -0.2
    group.add(dishGroup)

    // 3. Solar Array Wings (Dynamic size based on solarPanelAreaM2)
    // Scale factor derived from 1.5 m² baseline
    const areaScale = Math.sqrt(Math.max(0.5, Math.min(5.0, solarPanelAreaM2)) / 1.5)
    const panelWidth = 1.6 * areaScale
    const panelLength = 2.4 * areaScale

    const leftWing = new THREE.Group()
    const rightWing = new THREE.Group()

    // Panel geometry
    const panelGeo = new THREE.BoxGeometry(panelWidth, 0.04, panelLength)
    const panelFrameGeo = new THREE.BoxGeometry(panelWidth + 0.08, 0.05, panelLength + 0.08)

    // Left solar panel
    const leftCell = new THREE.Mesh(panelGeo, solarCellMaterial)
    const leftFrame = new THREE.Mesh(panelFrameGeo, solarFrameMaterial)
    leftWing.add(leftFrame)
    leftWing.add(leftCell)

    // Right solar panel
    const rightCell = new THREE.Mesh(panelGeo, solarCellMaterial)
    const rightFrame = new THREE.Mesh(panelFrameGeo, solarFrameMaterial)
    rightWing.add(rightFrame)
    rightWing.add(rightCell)

    // Mounting struts for solar panels
    const solarBoomGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.8, 8)
    const leftBoom = new THREE.Mesh(solarBoomGeo, carbonDeckMaterial)
    leftBoom.rotation.z = Math.PI / 2
    leftBoom.position.x = -(0.9 + 0.4)
    group.add(leftBoom)

    const rightBoom = new THREE.Mesh(solarBoomGeo, carbonDeckMaterial)
    rightBoom.rotation.z = Math.PI / 2
    rightBoom.position.x = 0.9 + 0.4
    group.add(rightBoom)

    leftWing.position.x = -(0.9 + 0.8 + panelWidth / 2)
    leftWing.position.y = 0.1
    leftWing.rotation.x = 0.15

    rightWing.position.x = 0.9 + 0.8 + panelWidth / 2
    rightWing.position.y = 0.1
    rightWing.rotation.x = -0.15

    group.add(leftWing)
    group.add(rightWing)
    solarWingsRef.current = { left: leftWing, right: rightWing }

    // 4. Propulsion Engine Nozzle at Base
    const nozzleGroup = new THREE.Group()
    if (propulsionId === 'solar-electric-ion') {
      // Quad Ion Thruster Cluster with cyan ionization glow
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2 + Math.PI / 4
        const x = Math.cos(angle) * 0.35
        const z = Math.sin(angle) * 0.35

        const ionNozzleGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.4, 16)
        const ionNozzle = new THREE.Mesh(ionNozzleGeo, thrusterMaterial)
        ionNozzle.position.set(x, 0, z)
        nozzleGroup.add(ionNozzle)

        // Blue/cyan ion exhaust glow sphere
        const glowGeo = new THREE.SphereGeometry(0.12, 12, 12)
        const glowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
        const glowMesh = new THREE.Mesh(glowGeo, glowMat)
        glowMesh.position.set(x, -0.22, z)
        nozzleGroup.add(glowMesh)
      }
    } else {
      // Chemical rocket bell nozzle
      const rocketNozzleGeo = new THREE.ConeGeometry(0.55, 0.85, 20, 1, true)
      const rocketNozzle = new THREE.Mesh(rocketNozzleGeo, thrusterMaterial)
      rocketNozzle.position.y = 0
      nozzleGroup.add(rocketNozzle)

      // Inner heat-glow ring
      const ringGeo = new THREE.TorusGeometry(0.48, 0.04, 8, 24)
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xf97316 })
      const ringMesh = new THREE.Mesh(ringGeo, ringMat)
      ringMesh.rotation.x = Math.PI / 2
      ringMesh.position.y = -0.42
      nozzleGroup.add(ringMesh)
    }

    nozzleGroup.position.y = -1.35
    group.add(nozzleGroup)

    // 5. Mounted Scientific Instruments Deck
    // Mount positions arranged around top instrument deck
    const instrumentConfigs: Record<
      string,
      { offset: [number, number, number]; build: () => THREE.Object3D; label: string }
    > = {
      'climate-camera': {
        offset: [-0.55, 1.35, 0.55],
        label: 'Climate Camera',
        build: () => {
          const cam = new THREE.Group()
          const barrelGeo = new THREE.CylinderGeometry(0.2, 0.24, 0.7, 16)
          const barrelMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })
          const barrel = new THREE.Mesh(barrelGeo, barrelMat)
          barrel.rotation.x = -0.4
          cam.add(barrel)

          const lensGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.05, 16)
          const lensMat = new THREE.MeshStandardMaterial({
            color: 0x0284c7,
            metalness: 0.95,
            roughness: 0.05,
          })
          const lens = new THREE.Mesh(lensGeo, lensMat)
          lens.position.set(0, 0.36, 0.14)
          lens.rotation.x = -0.4
          cam.add(lens)
          return cam
        },
      },
      'thermal-imager': {
        offset: [0.55, 1.35, 0.55],
        label: 'Thermal Imager',
        build: () => {
          const th = new THREE.Group()
          const boxGeo = new THREE.BoxGeometry(0.42, 0.42, 0.55)
          const boxMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, metalness: 0.6 })
          const box = new THREE.Mesh(boxGeo, boxMat)
          th.add(box)

          // Cryogenic heat shield radiator
          const finGeo = new THREE.BoxGeometry(0.05, 0.5, 0.6)
          const finMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 })
          const fin = new THREE.Mesh(finGeo, finMat)
          fin.position.x = 0.24
          th.add(fin)
          return th
        },
      },
      spectrometer: {
        offset: [-0.65, 1.35, -0.45],
        label: 'Atmospheric Spectrometer',
        build: () => {
          const spec = new THREE.Group()
          const bodyGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.5, 6)
          const bodyMat = new THREE.MeshStandardMaterial({ color: 0x6366f1, metalness: 0.7 })
          const body = new THREE.Mesh(bodyGeo, bodyMat)
          spec.add(body)

          const slitGeo = new THREE.BoxGeometry(0.1, 0.1, 0.3)
          const slitMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 })
          const slit = new THREE.Mesh(slitGeo, slitMat)
          slit.position.y = 0.28
          spec.add(slit)
          return spec
        },
      },
      'radar-sounder': {
        offset: [0.65, 1.35, -0.45],
        label: 'Radar Sounder',
        build: () => {
          const radar = new THREE.Group()
          // Deployable lattice boom
          const boomGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8)
          const boomMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85 })
          const boom = new THREE.Mesh(boomGeo, boomMat)
          boom.rotation.z = Math.PI / 3
          boom.position.set(0.4, 0.4, 0)
          radar.add(boom)

          // Radar horn
          const hornGeo = new THREE.ConeGeometry(0.25, 0.35, 12)
          const hornMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 })
          const horn = new THREE.Mesh(hornGeo, hornMat)
          horn.position.set(0.8, 0.75, 0)
          horn.rotation.z = -Math.PI / 4
          radar.add(horn)
          return radar
        },
      },
      'multispectral-mapper': {
        offset: [0, 1.35, 0.75],
        label: 'Multispectral Mapper',
        build: () => {
          const multi = new THREE.Group()
          const headGeo = new THREE.BoxGeometry(0.5, 0.3, 0.4)
          const headMat = new THREE.MeshStandardMaterial({ color: 0x059669, metalness: 0.6 })
          const head = new THREE.Mesh(headGeo, headMat)
          multi.add(head)

          // 3 optical apertures
          for (let i = -1; i <= 1; i++) {
            const apGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.08, 12)
            const apMat = new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.9 })
            const ap = new THREE.Mesh(apGeo, apMat)
            ap.rotation.x = Math.PI / 2
            ap.position.set(i * 0.16, 0, 0.22)
            multi.add(ap)
          }
          return multi
        },
      },
      'cloud-polarimeter': {
        offset: [0, 1.35, -0.75],
        label: 'Cloud Polarimeter',
        build: () => {
          const pol = new THREE.Group()
          const polGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.45, 16)
          const polMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.75 })
          const polBody = new THREE.Mesh(polGeo, polMat)
          pol.add(polBody)

          const prismGeo = new THREE.BoxGeometry(0.18, 0.18, 0.18)
          const prismMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
          const prism = new THREE.Mesh(prismGeo, prismMat)
          prism.position.y = 0.25
          prism.rotation.y = Math.PI / 4
          pol.add(prism)
          return pol
        },
      },
    }

    // Add selected instruments
    instrumentIds.forEach((instId) => {
      const cfg = instrumentConfigs[instId]
      if (cfg) {
        const instObj = cfg.build()
        instObj.position.set(...cfg.offset)
        group.add(instObj)
      }
    })

    // Star Tracker Attitude Sensor
    const trackerGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.25, 12)
    const trackerMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9 })
    const tracker1 = new THREE.Mesh(trackerGeo, trackerMat)
    tracker1.position.set(1.0, 0.5, 0.5)
    tracker1.rotation.z = Math.PI / 3
    group.add(tracker1)

    const tracker2 = new THREE.Mesh(trackerGeo, trackerMat)
    tracker2.position.set(-1.0, 0.5, -0.5)
    tracker2.rotation.z = -Math.PI / 3
    group.add(tracker2)
  }, [busId, instrumentIds, propulsionId, solarPanelAreaM2, wireframeMode])

  // Camera presets
  const applyViewPreset = (view: 'iso' | 'deck' | 'engine' | 'arrays') => {
    setActiveView(view)
    if (!cameraRef.current) return
    const cam = cameraRef.current
    if (view === 'iso') {
      cam.position.set(5.5, 4.0, 5.5)
      zoomDistRef.current = 7.5
      rotationTargetRef.current = { x: 0.35, y: -0.6 }
    } else if (view === 'deck') {
      cam.position.set(0.1, 7.5, 2.5)
      zoomDistRef.current = 6.2
      rotationTargetRef.current = { x: 1.1, y: 0 }
    } else if (view === 'engine') {
      cam.position.set(0.1, -6.5, 4.0)
      zoomDistRef.current = 6.8
      rotationTargetRef.current = { x: -0.85, y: 0 }
    } else if (view === 'arrays') {
      cam.position.set(0, 2.0, 8.5)
      zoomDistRef.current = 8.5
      rotationTargetRef.current = { x: 0.1, y: 0 }
    }
    cam.lookAt(0, 0, 0)
  }

  const busPart = allParts.find((p) => p.id === busId)
  const selectedInstrumentParts = instrumentIds
    .map((id) => allParts.find((p) => p.id === id))
    .filter((p): p is SpacecraftPart => p !== undefined)

  return (
    <div className="spacecraft-3d-viewer">
      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        className="canvas-3d-viewport"
        style={{ width: '100%', height: '360px', position: 'relative' }}
      >
        {/* Top Overlay HUD Bar */}
        <div className="viewport-overlay-top">
          <div className="viewport-badge">
            <span className="live-dot" />
            <b>3D CAD WORKSPACE</b>
            <span className="cad-spec">
              {busPart?.name} · {instrumentIds.length} PAYLOADS MOUNTED
            </span>
          </div>

          <div className="viewport-controls-row">
            <button
              type="button"
              className={`cad-btn ${autoRotate ? 'is-active' : ''}`}
              onClick={() => setAutoRotate(!autoRotate)}
              title="Toggle automatic 3D rotation"
            >
              🔄 Rotate
            </button>
            <button
              type="button"
              className={`cad-btn ${wireframeMode ? 'is-active' : ''}`}
              onClick={() => setWireframeMode(!wireframeMode)}
              title="Toggle engineering X-ray wireframe"
            >
              🌐 {wireframeMode ? 'Shaded' : 'X-Ray'}
            </button>
          </div>
        </div>

        {/* Camera Preset Quick Buttons */}
        <div className="viewport-camera-presets">
          <button
            type="button"
            className={`preset-pill ${activeView === 'iso' ? 'is-active' : ''}`}
            onClick={() => applyViewPreset('iso')}
          >
            Perspective
          </button>
          <button
            type="button"
            className={`preset-pill ${activeView === 'deck' ? 'is-active' : ''}`}
            onClick={() => applyViewPreset('deck')}
          >
            Payload Deck
          </button>
          <button
            type="button"
            className={`preset-pill ${activeView === 'arrays' ? 'is-active' : ''}`}
            onClick={() => applyViewPreset('arrays')}
          >
            Solar Arrays
          </button>
          <button
            type="button"
            className={`preset-pill ${activeView === 'engine' ? 'is-active' : ''}`}
            onClick={() => applyViewPreset('engine')}
          >
            Thruster
          </button>
        </div>

        {/* Hover / Info Callout */}
        {hoveredPart && (
          <div className="viewport-callout">
            <strong>{hoveredPart}</strong>
            <small>Click to toggle or inspect in configuration</small>
          </div>
        )}

        {/* Interaction Hint */}
        <div className="viewport-hint">
          <span>Drag to rotate · Scroll to zoom · Real-time CAD sync</span>
        </div>
      </div>

      {/* Interactive Mounted Payloads Quick Deck */}
      <div className="mounted-payloads-deck">
        <span className="deck-label">MOUNTED ON 3D DECK:</span>
        <div className="deck-chips">
          {selectedInstrumentParts.map((inst) => (
            <span
              key={inst.id}
              className="mounted-chip"
              onMouseEnter={() => setHoveredPart(inst.name)}
              onMouseLeave={() => setHoveredPart(null)}
              onClick={() => onToggleInstrument?.(inst.id)}
              title="Click to toggle instrument"
            >
              <i className="chip-indicator">●</i>
              <b>{inst.name}</b>
              <small>+{inst.scienceValue} sci</small>
            </span>
          ))}
          <span className="solar-metric-chip">
            ⚡ {solarPanelAreaM2.toFixed(1)} m² Arrays
          </span>
        </div>
      </div>
    </div>
  )
}
