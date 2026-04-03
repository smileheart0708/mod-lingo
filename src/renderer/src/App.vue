<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Files, Languages, Sparkles } from 'lucide-vue-next'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger
} from '@/components/ui/menubar'
import ThemeModeToggle from '@/components/theme/ThemeModeToggle.vue'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { isThemeMode, type ThemeMode } from '@/lib/theme'
import { cn } from '@/lib/utils'

const THEME_STORAGE_KEY = 'mod-lingo.theme'

interface MenuEntry {
  label: string
  shortcut?: string
}

interface MenuSection {
  label: string
  items: MenuEntry[]
}

const platform = window.appShell.getPlatform()
const themeMode = ref<ThemeMode>(readStoredTheme())
const prefersDark = ref(window.matchMedia('(prefers-color-scheme: dark)').matches)
const menuSections: MenuSection[] = [
  {
    label: 'File',
    items: [
      { label: 'Open Workspace', shortcut: 'Ctrl+O' },
      { label: 'Import Resources', shortcut: 'Ctrl+I' },
      { label: 'Export Bundle', shortcut: 'Ctrl+Shift+E' }
    ]
  },
  {
    label: 'Edit',
    items: [
      { label: 'Find in Project', shortcut: 'Ctrl+Shift+F' },
      { label: 'Replace Across Files', shortcut: 'Ctrl+Shift+H' },
      { label: 'Preferences', shortcut: 'Ctrl+,' }
    ]
  },
  {
    label: 'View',
    items: [
      { label: 'Toggle Sidebar', shortcut: 'Ctrl+B' },
      { label: 'Toggle Preview', shortcut: 'Ctrl+Shift+P' },
      { label: 'Command Palette', shortcut: 'Ctrl+Shift+L' }
    ]
  },
  {
    label: 'Help',
    items: [{ label: 'Quick Start' }, { label: 'Release Notes' }, { label: 'About mod-lingo' }]
  }
]

const titlebarInnerClass = computed(() =>
  platform === 'darwin' ? 'app-shell__titlebar-inner--darwin' : 'app-shell__titlebar-inner--overlay'
)
const resolvedTheme = computed<'light' | 'dark'>(() => {
  if (themeMode.value === 'system') {
    return prefersDark.value ? 'dark' : 'light'
  }

  return themeMode.value
})

let stopSystemThemeListener: () => void = () => {}

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

watch(
  [themeMode, prefersDark],
  () => {
    void applyTheme()
  },
  { immediate: true }
)

onMounted(() => {
  stopSystemThemeListener = window.appShell.onSystemThemeChange((payload) => {
    prefersDark.value = payload.shouldUseDarkColors
  })
})

onBeforeUnmount(() => {
  stopSystemThemeListener()
})
</script>

<template>
  <div class="app-shell flex h-dvh min-h-dvh flex-col bg-background text-foreground">
    <header class="app-shell__titlebar border-b bg-background">
      <div
        :class="
          cn('app-shell__titlebar-inner flex h-full items-center gap-3 px-3', titlebarInnerClass)
        "
      >
        <div class="flex min-w-0 items-center gap-2 text-sm font-semibold tracking-tight">
          <div class="rounded-md border border-border/70 bg-muted/70 p-1.5">
            <Languages class="size-4 text-foreground/90" />
          </div>
          <div class="min-w-0">
            <p class="truncate">mod-lingo</p>
          </div>
        </div>

        <Menubar class="app-shell__no-drag h-8 min-w-0 border-0 bg-transparent p-0 shadow-none">
          <MenubarMenu v-for="section in menuSections" :key="section.label">
            <MenubarTrigger class="h-7 rounded-md px-2.5 text-[13px] font-medium">
              {{ section.label }}
            </MenubarTrigger>
            <MenubarContent class="min-w-56">
              <template v-for="(item, index) in section.items" :key="item.label">
                <MenubarItem disabled>
                  {{ item.label }}
                  <MenubarShortcut v-if="item.shortcut">
                    {{ item.shortcut }}
                  </MenubarShortcut>
                </MenubarItem>
                <MenubarSeparator v-if="index === section.items.length - 2" />
              </template>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>

        <ThemeModeToggle v-model="themeMode" class="app-shell__no-drag ml-auto" />
      </div>
    </header>

    <main class="min-h-0 flex-1 overflow-hidden">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel :default-size="22" :min-size="16" class="min-w-0">
          <section class="h-full border-r bg-muted/20 p-4">
            <div
              class="flex h-full flex-col rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p
                    class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    Workspace
                  </p>
                  <h2 class="mt-2 text-lg font-semibold tracking-tight">Project navigator</h2>
                </div>
                <div
                  class="rounded-full border border-border/80 bg-muted/70 px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                >
                  Placeholder
                </div>
              </div>

              <div class="mt-6 space-y-3">
                <div class="rounded-xl border border-dashed border-border/80 bg-muted/35 p-3">
                  <div class="flex items-center gap-2 text-sm font-medium">
                    <Files class="size-4 text-muted-foreground" />
                    Resource files
                  </div>
                  <p class="mt-1 text-sm text-muted-foreground">
                    Prepare source mod assets, language packs, and output directories here.
                  </p>
                </div>
                <div class="rounded-xl border border-dashed border-border/80 bg-muted/35 p-3">
                  <div class="flex items-center gap-2 text-sm font-medium">
                    <Sparkles class="size-4 text-muted-foreground" />
                    Translation workflows
                  </div>
                  <p class="mt-1 text-sm text-muted-foreground">
                    Future steps can surface glossary setup, batch translation, and review queues.
                  </p>
                </div>
              </div>

              <div
                class="mt-auto rounded-xl border border-border/70 bg-linear-to-br from-muted/55 via-background to-background p-4"
              >
                <p class="text-sm font-medium">Sidebar reserved for workspace tools.</p>
                <p class="mt-1 text-sm text-muted-foreground">
                  The panel sizing is already wired, so future feature panes can slot in without
                  changing the window shell again.
                </p>
              </div>
            </div>
          </section>
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel :default-size="78" :min-size="40" class="min-w-0">
          <section class="h-full bg-background p-5">
            <div
              class="flex h-full flex-col rounded-[1.4rem] border border-border/70 bg-background p-6 shadow-sm"
            >
              <div class="flex flex-wrap items-center gap-3">
                <div
                  class="rounded-full border border-border/80 bg-muted/55 px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  Editor surface
                </div>
                <div
                  class="rounded-full border border-border/80 bg-muted/55 px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  Theme-aware title bar
                </div>
              </div>

              <div class="mt-8 max-w-3xl">
                <p class="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Main panel
                </p>
                <h1 class="mt-3 text-4xl font-semibold tracking-tight text-balance">
                  Resizable placeholder for translation workspace, preview, and review tools.
                </h1>
                <p class="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                  The shell now owns a custom draggable title bar, native overlay controls on
                  Windows and Linux, and a theme model that can keep the window chrome aligned with
                  the renderer palette.
                </p>
              </div>

              <div class="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div class="rounded-2xl border border-border/70 bg-background/80 p-4">
                  <p class="text-sm font-medium">Drop zone</p>
                  <p class="mt-2 text-sm text-muted-foreground">
                    Reserve this area for language assets, glossary import, or project bootstrap.
                  </p>
                </div>
                <div class="rounded-2xl border border-border/70 bg-background/80 p-4">
                  <p class="text-sm font-medium">Preview canvas</p>
                  <p class="mt-2 text-sm text-muted-foreground">
                    Future side-by-side source and translated text can reuse the current panel
                    split.
                  </p>
                </div>
                <div
                  class="rounded-2xl border border-border/70 bg-background/80 p-4 md:col-span-2 xl:col-span-1"
                >
                  <p class="text-sm font-medium">Status stream</p>
                  <p class="mt-2 text-sm text-muted-foreground">
                    Surface indexing progress, diagnostics, and translation job results here.
                  </p>
                </div>
              </div>

              <div
                class="mt-auto rounded-2xl border border-dashed border-border/80 bg-muted/28 p-5"
              >
                <p class="text-sm font-medium">Next implementation slice</p>
                <p class="mt-1 text-sm text-muted-foreground">
                  Replace this placeholder with actual workspace modules once the data model and
                  file pipeline are ready.
                </p>
              </div>
            </div>
          </section>
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  </div>
</template>

<style scoped>
.app-shell__titlebar {
  height: var(--titlebar-height);
  user-select: none;
  -webkit-app-region: drag;
}

.app-shell__titlebar-inner--darwin {
  padding-left: calc(var(--traffic-light-safe-area) + 0.75rem);
}

.app-shell__titlebar-inner--overlay {
  padding-right: calc(var(--window-controls-width) + 0.75rem);
}

.app-shell__no-drag {
  -webkit-app-region: no-drag;
}
</style>
