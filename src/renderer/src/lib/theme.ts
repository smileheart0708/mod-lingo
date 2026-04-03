import type { Component } from 'vue'
import { LaptopMinimal, MoonStar, SunMedium } from 'lucide-vue-next'

export type ThemeMode = 'system' | 'light' | 'dark'

export interface ThemeOption {
  label: string
  value: ThemeMode
  icon: Component
}

export const themeOptions: ThemeOption[] = [
  { label: 'Follow system', value: 'system', icon: LaptopMinimal },
  { label: 'Light', value: 'light', icon: SunMedium },
  { label: 'Dark', value: 'dark', icon: MoonStar }
]

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'system' || value === 'light' || value === 'dark'
}

export function getNextThemeMode(mode: ThemeMode): ThemeMode {
  switch (mode) {
    case 'system':
      return 'light'
    case 'light':
      return 'dark'
    case 'dark':
      return 'system'
  }
}

export function getThemeModeLabel(mode: ThemeMode): string {
  switch (mode) {
    case 'system':
      return 'Follow system'
    case 'light':
      return 'Light'
    case 'dark':
      return 'Dark'
  }
}
