import { contextBridge, ipcRenderer } from 'electron'
import type { WorkspaceState } from '../shared/workspace'

const IPC_CHANNELS = {
  setThemeMode: 'app-shell:set-theme-mode',
  syncTitlebarTheme: 'app-shell:sync-titlebar-theme',
  systemThemeUpdated: 'app-shell:system-theme-updated',
  openWorkspaceFolder: 'workspace:open-folder',
  getCurrentWorkspace: 'workspace:get-current',
  workspaceChanged: 'workspace:changed'
} as const

type ThemeMode = 'system' | 'light' | 'dark'

interface TitlebarThemePayload {
  color: string
  symbolColor: string
  height: number
}

interface SystemThemePayload {
  shouldUseDarkColors: boolean
  themeSource: ThemeMode
}

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'system' || value === 'light' || value === 'dark'
}

function isTitlebarThemePayload(value: unknown): value is TitlebarThemePayload {
  if (!value || typeof value !== 'object') {
    return false
  }

  const payload = value as Partial<TitlebarThemePayload>

  return (
    typeof payload.color === 'string' &&
    typeof payload.symbolColor === 'string' &&
    Number.isInteger(payload.height)
  )
}

contextBridge.exposeInMainWorld('appShell', {
  getPlatform: () => process.platform,
  setThemeMode: (mode: ThemeMode) => {
    if (!isThemeMode(mode)) {
      throw new TypeError(`Unsupported theme mode: ${String(mode)}`)
    }

    ipcRenderer.send(IPC_CHANNELS.setThemeMode, mode)
  },
  syncTitlebarTheme: (payload: TitlebarThemePayload) => {
    if (!isTitlebarThemePayload(payload)) {
      throw new TypeError('Invalid titlebar theme payload.')
    }

    ipcRenderer.send(IPC_CHANNELS.syncTitlebarTheme, payload)
  },
  onSystemThemeChange: (callback: (payload: SystemThemePayload) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: SystemThemePayload): void => {
      callback(payload)
    }

    ipcRenderer.on(IPC_CHANNELS.systemThemeUpdated, listener)

    return () => {
      ipcRenderer.off(IPC_CHANNELS.systemThemeUpdated, listener)
    }
  },
  openWorkspaceFolder: async () => {
    await ipcRenderer.invoke(IPC_CHANNELS.openWorkspaceFolder)
  },
  getCurrentWorkspace: () => {
    return ipcRenderer.invoke(IPC_CHANNELS.getCurrentWorkspace) as Promise<WorkspaceState | null>
  },
  onWorkspaceChanged: (callback: (payload: WorkspaceState | null) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: WorkspaceState | null): void => {
      callback(payload)
    }

    ipcRenderer.on(IPC_CHANNELS.workspaceChanged, listener)

    return () => {
      ipcRenderer.off(IPC_CHANNELS.workspaceChanged, listener)
    }
  }
})
