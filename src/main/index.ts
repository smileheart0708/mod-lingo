import { app, shell, BrowserWindow, dialog, ipcMain, nativeTheme } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'
import icon from '../../resources/icon.png?asset'

const APP_ID = 'cqxx.modlingo.app'
const TITLE_BAR_HEIGHT = 40
const IPC_CHANNELS = {
  setThemeMode: 'app-shell:set-theme-mode',
  syncTitlebarTheme: 'app-shell:sync-titlebar-theme',
  systemThemeUpdated: 'app-shell:system-theme-updated'
} as const
const DEFAULT_TITLEBAR_THEME = {
  color: '#ffffff',
  symbolColor: '#000000',
  height: TITLE_BAR_HEIGHT
} as const

let autoUpdaterInitialized = false

type ThemeMode = 'system' | 'light' | 'dark'

interface TitlebarThemePayload {
  color: string
  symbolColor: string
  height: number
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

function hasOverlayControls(): boolean {
  return process.platform === 'win32' || process.platform === 'linux'
}

function getDefaultTitlebarTheme(): TitlebarThemePayload {
  return DEFAULT_TITLEBAR_THEME
}

function emitSystemThemeUpdated(): void {
  const payload = {
    shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
    themeSource: nativeTheme.themeSource as ThemeMode
  }

  for (const window of BrowserWindow.getAllWindows()) {
    window.webContents.send(IPC_CHANNELS.systemThemeUpdated, payload)
  }
}

function syncWindowTitlebar(window: BrowserWindow, payload: TitlebarThemePayload): void {
  if (!hasOverlayControls() || window.isDestroyed()) {
    return
  }

  window.setTitleBarOverlay(payload)
}

function setupAutoUpdater(window: BrowserWindow): void {
  if (autoUpdaterInitialized || is.dev || !app.isPackaged) {
    return
  }

  // electron-updater requires signed macOS builds. Keep macOS on manual downloads
  // until signing and notarization are configured for the release pipeline.
  if (process.platform === 'darwin') {
    console.info('Skipping auto update on macOS until code signing is configured.')
    return
  }

  autoUpdaterInitialized = true
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true
  autoUpdater.allowPrerelease = app.getVersion().includes('-')

  autoUpdater.on('error', (error) => {
    console.error('Auto update failed.', error)
  })

  autoUpdater.on('update-available', async (info) => {
    const { response } = await dialog.showMessageBox(window, {
      type: 'info',
      buttons: ['Download', 'Later'],
      defaultId: 0,
      cancelId: 1,
      title: 'Update Available',
      message: `mod-lingo ${info.version} is available.`,
      detail: 'Download the update now and install it when the app restarts.'
    })

    if (response === 0) {
      void autoUpdater.downloadUpdate()
    }
  })

  autoUpdater.on('update-not-available', (info) => {
    console.info(
      `No update available. Current version: ${app.getVersion()}, latest: ${info.version}.`
    )
  })

  autoUpdater.on('download-progress', (progress) => {
    console.info(
      `Update download ${Math.round(progress.percent)}% at ${Math.round(progress.bytesPerSecond / 1024)} KiB/s.`
    )
  })

  autoUpdater.on('update-downloaded', async (info) => {
    const { response } = await dialog.showMessageBox(window, {
      type: 'info',
      buttons: ['Install and Restart', 'Later'],
      defaultId: 0,
      cancelId: 1,
      title: 'Update Ready',
      message: `mod-lingo ${info.version} has been downloaded.`,
      detail: 'Restart the app now to install the update.'
    })

    if (response === 0) {
      autoUpdater.quitAndInstall()
    }
  })

  void autoUpdater.checkForUpdates()
}

function createWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    minWidth: 800,
    minHeight: 520,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
    ...(hasOverlayControls() ? { titleBarOverlay: getDefaultTitlebarTheme() } : {}),
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    setupAutoUpdater(mainWindow)
  })

  mainWindow.webContents.once('did-finish-load', () => {
    emitSystemThemeUpdated()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId(APP_ID)

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on(IPC_CHANNELS.setThemeMode, (_event, mode: ThemeMode) => {
    if (!isThemeMode(mode)) {
      console.warn('Ignoring invalid theme mode from renderer.', mode)
      return
    }

    nativeTheme.themeSource = mode
  })

  ipcMain.on(IPC_CHANNELS.syncTitlebarTheme, (event, payload: TitlebarThemePayload) => {
    if (!isTitlebarThemePayload(payload)) {
      console.warn('Ignoring invalid titlebar theme payload from renderer.', payload)
      return
    }

    const window = BrowserWindow.fromWebContents(event.sender)

    if (!window) {
      console.warn('Unable to resolve BrowserWindow for titlebar theme sync.')
      return
    }

    syncWindowTitlebar(window, payload)
  })

  nativeTheme.on('updated', () => {
    if (hasOverlayControls()) {
      const fallbackTheme = getDefaultTitlebarTheme()

      for (const window of BrowserWindow.getAllWindows()) {
        syncWindowTitlebar(window, fallbackTheme)
      }
    }

    emitSystemThemeUpdated()
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
