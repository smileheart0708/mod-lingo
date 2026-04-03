import { onBeforeUnmount, onMounted } from 'vue'

type AppPlatform = ReturnType<typeof window.appShell.getPlatform>

interface TitlebarMetrics {
  left: number
  right: number
}

interface WindowControlsOverlayLike {
  visible: boolean
  getTitlebarAreaRect?: () => DOMRect | DOMRectReadOnly
  addEventListener: (type: 'geometrychange', listener: () => void) => void
  removeEventListener: (type: 'geometrychange', listener: () => void) => void
}

const FALLBACK_TITLEBAR_METRICS: Record<AppPlatform, TitlebarMetrics> = {
  darwin: { left: 76, right: 0 },
  win32: { left: 0, right: 150 },
  linux: { left: 0, right: 150 }
}

const MIN_REASONABLE_RIGHT_INSET = 96
const MAX_REASONABLE_RIGHT_INSET = 240
const MAX_REASONABLE_LEFT_INSET = 240

function getWindowControlsOverlay(): WindowControlsOverlayLike | undefined {
  return (
    navigator as Navigator & {
      windowControlsOverlay?: WindowControlsOverlayLike
    }
  ).windowControlsOverlay
}

function roundInset(value: number): number {
  return Math.max(0, Math.round(value))
}

function isReasonableRightInset(value: number, viewportWidth: number): boolean {
  if (!Number.isFinite(value)) {
    return false
  }

  if (value < MIN_REASONABLE_RIGHT_INSET) {
    return false
  }

  return (
    value <=
    Math.min(MAX_REASONABLE_RIGHT_INSET, Math.max(MIN_REASONABLE_RIGHT_INSET, viewportWidth * 0.35))
  )
}

function isReasonableLeftInset(value: number): boolean {
  if (!Number.isFinite(value)) {
    return false
  }

  return value >= 0 && value <= MAX_REASONABLE_LEFT_INSET
}

function readOverlayMetrics(platform: AppPlatform): TitlebarMetrics {
  const fallback = FALLBACK_TITLEBAR_METRICS[platform]

  if (platform === 'darwin') {
    return fallback
  }

  const overlay = getWindowControlsOverlay()
  const titlebarRect = overlay?.visible ? overlay.getTitlebarAreaRect?.() : undefined

  if (!titlebarRect) {
    return fallback
  }

  const viewportWidth = window.innerWidth
  const computedLeft = roundInset(titlebarRect.x)
  const computedRight = roundInset(viewportWidth - titlebarRect.x - titlebarRect.width)

  return {
    left: isReasonableLeftInset(computedLeft) ? computedLeft : fallback.left,
    right: isReasonableRightInset(computedRight, viewportWidth) ? computedRight : fallback.right
  }
}

function applyTitlebarMetrics(platform: AppPlatform): void {
  const root = document.documentElement
  const metrics = readOverlayMetrics(platform)

  root.style.setProperty('--titlebar-safe-left', `${metrics.left}px`)
  root.style.setProperty('--titlebar-safe-right', `${metrics.right}px`)
}

export function useTitlebarMetrics(platform: AppPlatform): void {
  const overlay = getWindowControlsOverlay()

  const syncMetrics = (): void => {
    applyTitlebarMetrics(platform)
  }

  onMounted(() => {
    syncMetrics()
    overlay?.addEventListener('geometrychange', syncMetrics)
    window.addEventListener('resize', syncMetrics)
  })

  onBeforeUnmount(() => {
    overlay?.removeEventListener('geometrychange', syncMetrics)
    window.removeEventListener('resize', syncMetrics)
  })
}
