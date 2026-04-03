<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Files, Sparkles } from 'lucide-vue-next'
import AppTitlebar from '@/components/shell/AppTitlebar.vue'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { isThemeMode, type ThemeMode } from '@/lib/theme'
import { useTitlebarMetrics } from '@/lib/titlebarMetrics'

const THEME_STORAGE_KEY = 'mod-lingo.theme'
const WORKBENCH_COPY = {
  badge: 'Workspace',
  headline: 'Organize project files, language assets, and glossary inputs before translation.',
  description:
    'Use this surface as the primary intake area for source packs, namespace browsing, and editor-ready project setup.',
  cards: [
    {
      title: 'Resource files',
      description: 'Prepare source mod assets, language packs, and output directories here.'
    },
    {
      title: 'Translation workflows',
      description: 'Queue glossary setup, batch translation, and review lists from one place.'
    },
    {
      title: 'Project notes',
      description:
        'Keep per-workspace requirements, terminology rules, and export targets close by.'
    }
  ],
  nextStep: 'Connect this tab to real workspace discovery and file pipeline state.'
}

const platform = window.appShell.getPlatform()
useTitlebarMetrics(platform)
const themeMode = ref<ThemeMode>(readStoredTheme())
const prefersDark = ref(window.matchMedia('(prefers-color-scheme: dark)').matches)
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
    <AppTitlebar v-model="themeMode" />
    <div aria-hidden="true" class="app-shell__divider" />

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
                  {{ WORKBENCH_COPY.badge }}
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
                  {{ WORKBENCH_COPY.headline }}
                </h1>
                <p class="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                  {{ WORKBENCH_COPY.description }}
                </p>
              </div>

              <div class="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div
                  v-for="card in WORKBENCH_COPY.cards"
                  :key="card.title"
                  class="rounded-2xl border border-border/70 bg-background/80 p-4"
                >
                  <p class="text-sm font-medium">{{ card.title }}</p>
                  <p class="mt-2 text-sm text-muted-foreground">
                    {{ card.description }}
                  </p>
                </div>
                <div
                  class="rounded-2xl border border-border/70 bg-background/80 p-4 md:col-span-2 xl:col-span-1"
                >
                  <p class="text-sm font-medium">Workspace status</p>
                  <p class="mt-2 text-sm text-muted-foreground">
                    Keep diagnostics, background job output, and current workspace state visible
                    while the rest of the workspace grows around this shell.
                  </p>
                </div>
              </div>

              <div
                class="mt-auto rounded-2xl border border-dashed border-border/80 bg-muted/28 p-5"
              >
                <p class="text-sm font-medium">Next implementation slice</p>
                <p class="mt-1 text-sm text-muted-foreground">
                  {{ WORKBENCH_COPY.nextStep }}
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
.app-shell__divider {
  flex: none;
  height: 1px;
  background: var(--titlebar-border-color);
}
</style>
