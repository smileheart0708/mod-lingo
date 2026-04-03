/// <reference types="vite/client" />

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
  interface Window {
    appShell: {
      getPlatform(): 'win32' | 'darwin' | 'linux'
      setThemeMode(mode: ThemeMode): void
      syncTitlebarTheme(payload: AppShellTitlebarThemePayload): void
      onSystemThemeChange(callback: (payload: AppShellSystemThemePayload) => void): () => void
    }
  }
}

export {}
