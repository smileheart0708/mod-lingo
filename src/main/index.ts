import { app, shell, BrowserWindow, dialog, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'
import icon from '../../resources/icon.png?asset'

const APP_ID = 'cqxx.modlingo.app'

let autoUpdaterInitialized = false

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
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
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

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId(APP_ID)

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
