import type { CSSProperties } from 'react'

const iconPaths: Record<string, string> = {
  rocket: 'M12 22s2-2 2-5l-2-2-2 2c0 3 2 5 2 5ZM8 14l-3 1-2 4 5-1m8-4 3 1 2 4-5-1M12 15c-2-2-3-4-3-6 0-4 3-7 8-8 0 5-1 8-5 11Zm1-7h.01',
  satellite: 'm7 7 10 10m-7-13 6 6m-9 9 6 6M3 9l6-6 4 4-6 6-4-4Zm8 8 6-6 4 4-6 6-4-4Zm-8 4 3-3m11-11 3-3M5 5l2-2m12 16 2-2',
  antenna: 'M4 20l8-8m0 0 8 8m-8-8V4m-3 0h6m-8 3a7 7 0 0 1 10 0m-13 3a11 11 0 0 1 16 0',
  science: 'M9 3h6m-5 0v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3m-9 12h12m-9 3h.01m5-2h.01',
  ruler: 'M3 17 17 3l4 4L7 21l-4-4Zm5 0 2 2m1-6 2 2m1-6 2 2m1-6 2 2',
  bolt: 'm13 2-9 12h7l-1 8 10-13h-7l1-7Z',
  flame: 'M12 22a7 7 0 0 0 7-7c0-3-2-5-4-7 0 3-2 4-2 4 0-5-3-9-5-10 1 5-4 8-4 13a8 8 0 0 0 8 7Zm0-3a3 3 0 0 0 3-3c0-1-1-2-2-3 0 2-2 2-2 3a2 2 0 0 0 1 3Z',
  scale: 'M12 3v18m-7 0h14M5 6h14m-14 0-3 7h6L5 6Zm14 0-3 7h6l-3-7Zm-3 15a4 4 0 0 0 8 0H5a4 4 0 0 0 8 0Z',
  planet: 'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm-8-5c-3 0-4-1-3-3 1-2 5-3 10-3s9 1 10 3c1 2 0 3-3 3',
  earth: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-8-12h16M4 15h16M12 3c3 3 3 15 0 18m0-18c-3 3-3 15 0 18',
  moon: 'M20 15A8 8 0 0 1 9 4a8 8 0 1 0 11 11Z',
  mars: 'M14 4h6v6m0-6-7 7m3-3a7 7 0 1 1-10 10 7 7 0 0 1 10-10Z',
  venus: 'M12 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0 0v8m-4-4h8',
  gamepad: 'M7 8h10a5 5 0 0 1 4 8l-2 3-4-3H9l-4 3-2-3a5 5 0 0 1 4-8Zm1 3v4m-2-2h4m6-1h.01m2 2h.01',
  wrench: 'm14 6 4-4 4 4-4 4m-4-4a6 6 0 0 1-8 8l-4 4a2 2 0 0 1-3-3l4-4a6 6 0 0 1 8-8',
  camera: 'M4 7h3l2-3h6l2 3h3v13H4V7Zm8 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
  thermometer: 'M14 14.8V5a2 2 0 0 0-4 0v9.8a5 5 0 1 0 4 0ZM12 12v6',
  spectrum: 'M3 19c4-8 5-8 9 0s5 8 9 0M3 12h18M5 7h14M8 3h8',
  telescope: 'm3 14 12-8 3 5-12 8-3-5Zm12-8 2-3 4 7-3 1m-9 8-2 3m6-6 4 5',
  clipboard: 'M9 4h6l1 2h3v15H5V6h3l1-2Zm-1 7h8m-8 4h8m-8 4h5',
  network: 'M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M5 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0m14 0m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M5 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0m14 0m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M7 6l4 5m6-5-4 5m-7 7 5-4m6 4-5-4',
  rotate: 'M20 7v5h-5M4 17v-5h5m9-2a6 6 0 0 0-10-3L4 12m16 0-4 5a6 6 0 0 1-10-3',
  battery: 'M5 7h14v14H5V7Zm4-3h6m-7 9h8m-5-3-3 5h3l-1 3 3-5h-3l1-3Z',
  microscope: 'M6 21h12m-6 0a8 8 0 0 0 8-8v-1M9 4l5 5-3 3-5-5 3-3Zm5 5 3-3 3 3-3 3m-7 1 4 4',
  coin: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm3-12c-1-2-6-2-6 1s6 2 6 5-5 3-7 1m4-9v12',
  sensor: 'M12 3 3 8l9 5 9-5-9-5Zm-9 9 9 5 9-5m-18 5 9 5 9-5m-9-9v5',
  warning: 'M12 3 2.7 20h18.6L12 3Zm0 6v5m0 3h.01',
}

const symbolNames: Record<string, string> = {
  '🚀': 'rocket', '🛰️': 'satellite', '🛰': 'satellite', '📡': 'antenna', '🔬': 'science', '📐': 'ruler',
  '⚡': 'bolt', '🔥': 'flame', '⚖️': 'scale', '⚖': 'scale', '🪐': 'planet', '🎮': 'gamepad', '🛠️': 'wrench',
  '🛠': 'wrench', '📷': 'camera', '🌡️': 'thermometer', '🌡': 'thermometer', '🌈': 'spectrum', '🔭': 'telescope',
  '🌍': 'earth', '🌎': 'earth', '🌏': 'earth', '🌑': 'moon', '🔴': 'mars', '🟡': 'venus', '📋': 'clipboard',
  '🌐': 'network', '🔄': 'rotate', '🔋': 'battery', '💰': 'coin', '💸': 'coin', '🛸': 'satellite', '💡': 'bolt', '⚠️': 'warning',
}

export function SpaceIcon({
  name,
  symbol,
  className,
  size = 20,
  style,
}: {
  name?: string
  symbol?: string
  className?: string
  size?: number
  style?: CSSProperties
}) {
  const iconName = name ?? (symbol ? symbolNames[symbol] : undefined) ?? 'sensor'
  return (
    <svg
      className={className ? `space-icon ${className}` : 'space-icon'}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={style}
    >
      <path d={iconPaths[iconName] ?? iconPaths.sensor} />
    </svg>
  )
}
