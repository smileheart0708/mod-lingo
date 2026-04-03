<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AppTitlebar from '@/components/shell/AppTitlebar.vue'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { isThemeMode, type ThemeMode } from '@/lib/theme'
import { useTitlebarMetrics } from '@/lib/titlebarMetrics'
import type { WorkspaceState } from '../../shared/workspace'

const THEME_STORAGE_KEY = 'mod-lingo.theme'

const platform = window.appShell.getPlatform()
useTitlebarMetrics(platform)
const themeMode = ref<ThemeMode>(readStoredTheme())
const prefersDark = ref(window.matchMedia('(prefers-color-scheme: dark)').matches)
const workspace = ref<WorkspaceState | null>(null)
const openShortcutKeys = computed(() => (platform === 'darwin' ? ['⌘', 'O'] : ['Ctrl', 'O']))
const resolvedTheme = computed<'light' | 'dark'>(() => {
  if (themeMode.value === 'system') {
    return prefersDark.value ? 'dark' : 'light'
  }

  return themeMode.value
})

let stopSystemThemeListener: () => void = () => {}
let stopWorkspaceListener: () => void = () => {}

function readStoredTheme(): ThemeMode {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)

  return isThemeMode(stored) ? stored : 'system'
}

function syncTitlebarThemeFromStyles(): void {
  const rootStyles = getComputedStyle(document.documentElement)
  const color = rootStyles.getPropertyValue('--titlebar-overlay-color').trim()
  const symbolColor = rootStyles.getPropertyValue('--titlebar-overlay-symbol-color').trim()
  const height = Number.parseInt(rootStyles.getPropertyValue('--titlebar-height').trim(), 10)

  if (!color || !symbolColor || Number.isNaN(height)) {
    return
  }

  window.appShell.syncTitlebarTheme({
    color,
    symbolColor,
    height
  })
}

async function applyTheme(): Promise<void> {
  const root = document.documentElement
  const dark = resolvedTheme.value === 'dark'

  root.classList.toggle('dark', dark)
  root.dataset.themeMode = themeMode.value
  root.dataset.platform = platform
  root.style.colorScheme = dark ? 'dark' : 'light'

  localStorage.setItem(THEME_STORAGE_KEY, themeMode.value)
  window.appShell.setThemeMode(themeMode.value)

  await nextTick()
  syncTitlebarThemeFromStyles()
}

async function syncWorkspace(): Promise<void> {
  workspace.value = await window.appShell.getCurrentWorkspace()
}

watch(
  [themeMode, prefersDark],
  () => {
    void applyTheme()
  },
  { immediate: true }
)

onMounted(() => {
  stopSystemThemeListener = window.appShell.onSystemThemeChange((payload) => {
    themeMode.value = payload.themeSource
    prefersDark.value = payload.shouldUseDarkColors
  })

  stopWorkspaceListener = window.appShell.onWorkspaceChanged((payload) => {
    workspace.value = payload
  })

  void syncWorkspace()
})

onBeforeUnmount(() => {
  stopSystemThemeListener()
  stopWorkspaceListener()
})
</script>

<template>
  <div class="app-shell flex h-dvh min-h-dvh flex-col bg-background text-foreground">
    <AppTitlebar v-model="themeMode" />
    <div aria-hidden="true" class="app-shell__divider" />

    <main class="min-h-0 flex-1 overflow-hidden p-4">
      <section
        class="flex h-full flex-col rounded-2xl border border-border/70 bg-background shadow-sm"
      >
        <Breadcrumb v-if="workspace" class="border-b border-border/70 px-4 py-3">
          <BreadcrumbList>
            <template v-for="(segment, index) in workspace.segments" :key="`${index}-${segment}`">
              <BreadcrumbItem>
                <BreadcrumbPage v-if="index === workspace.segments.length - 1">
                  {{ segment }}
                </BreadcrumbPage>
                <BreadcrumbLink v-else as="span">
                  {{ segment }}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator v-if="index < workspace.segments.length - 1" />
            </template>
          </BreadcrumbList>
        </Breadcrumb>

        <div
          v-if="workspace"
          aria-label="workspace surface"
          class="min-h-0 flex-1 rounded-b-2xl bg-background"
        />

        <div v-else class="flex min-h-0 flex-1 items-center justify-center p-6">
          <KbdGroup
            class="rounded-lg border border-dashed border-border/70 bg-muted/20 px-3 py-2 text-sm text-muted-foreground"
          >
            <span class="mr-2">Open Folder</span>
            <Kbd v-for="key in openShortcutKeys" :key="key">
              {{ key }}
            </Kbd>
          </KbdGroup>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.app-shell__divider {
  flex: none;
  height: 1px;
  background: var(--titlebar-border-color);
}
</style>
