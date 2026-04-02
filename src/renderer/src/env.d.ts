/// <reference types="vite/client" />

type ElectronProcessVersions = NodeJS.ProcessVersions

declare global {
  interface Window {
    electron: {
      process: {
        versions: ElectronProcessVersions
      }
    }
  }
}

export {}
