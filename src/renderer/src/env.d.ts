/// <reference types="vite/client" />

import type { WorkspaceState } from '../../shared/workspace'

type ThemeMode = 'system' | 'light' | 'dark'

interface AppShellTitlebarThemePayload {
  color: string
  symbolColor: string
  height: number
}

interface AppShellSystemThemePayload {
  shouldUseDarkColors: boolean
  themeSource: ThemeMode
}

declare global {
  interface WindowControlsOverlay {
    readonly visible: boolean
    getTitlebarAreaRect(): DOMRect
    addEventListener(type: 'geometrychange', listener: () => void): void
    removeEventListener(type: 'geometrychange', listener: () => void): void
  }

  interface Navigator {
    windowControlsOverlay?: WindowControlsOverlay
  }

  interface Window {
    appShell: {
      getPlatform(): 'win32' | 'darwin' | 'linux'
      setThemeMode(mode: ThemeMode): void
      syncTitlebarTheme(payload: AppShellTitlebarThemePayload): void
      onSystemThemeChange(callback: (payload: AppShellSystemThemePayload) => void): () => void
      openWorkspaceFolder(): Promise<void>
      getCurrentWorkspace(): Promise<WorkspaceState | null>
      onWorkspaceChanged(callback: (payload: WorkspaceState | null) => void): () => void
    }
  }
}

export {}
