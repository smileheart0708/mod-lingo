<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Files, Sparkles } from 'lucide-vue-next'
import AppTitlebar from '@/components/shell/AppTitlebar.vue'
import type { TitlebarTab } from '@/components/shell/titlebar'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { isThemeMode, type ThemeMode } from '@/lib/theme'
import { useTitlebarMetrics } from '@/lib/titlebarMetrics'

const THEME_STORAGE_KEY = 'mod-lingo.theme'
const INITIAL_TITLEBAR_TABS: TitlebarTab[] = [
  { id: 'workspace', label: 'Workspace', closable: false },
  { id: 'preview', label: 'Preview', closable: true },
  { id: 'review', label: 'Review', closable: true }
]
const WORKBENCH_COPY = {
  workspace: {
    badge: 'Workspace tab',
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
  },
  preview: {
    badge: 'Preview tab',
    headline: 'Compare source strings and translated output in a focused preview surface.',
    description:
      'Reserve this tab for side-by-side string preview, inline diffs, and generated pack inspection before export.',
    cards: [
      {
        title: 'Preview canvas',
        description:
          'Render source and translated text side-by-side with future inline diff controls.'
      },
      {
        title: 'Formatting checks',
        description:
          'Surface placeholder mismatches, overflow risk, and key coverage before publish.'
      },
      {
        title: 'Export snapshot',
        description:
          'Show a preflight summary of the files that will ship in the generated language bundle.'
      }
    ],
    nextStep: 'Replace the placeholder cards with live translation preview components.'
  },
  review: {
    badge: 'Review tab',
    headline: 'Collect translation diagnostics, QA notes, and approval-ready changes in one pass.',
    description:
      'Use this surface for validation queues, issue triage, and final sign-off before writing files back to disk.',
    cards: [
      {
        title: 'Review queue',
        description:
          'List changed keys, unresolved placeholders, and items that still need human review.'
      },
      {
        title: 'Status stream',
        description:
          'Track indexing progress, translation job output, and warnings from background tasks.'
      },
      {
        title: 'Approval checklist',
        description:
          'Summarize blockers, touched namespaces, and export readiness for the current workspace.'
      }
    ],
    nextStep: 'Wire this tab into diagnostics, comments, and acceptance actions once data exists.'
  }
} satisfies Record<
  string,
  {
    badge: string
    headline: string
    description: string
    cards: Array<{ title: string; description: string }>
    nextStep: string
  }
>

const platform = window.appShell.getPlatform()
useTitlebarMetrics(platform)
const themeMode = ref<ThemeMode>(readStoredTheme())
const prefersDark = ref(window.matchMedia('(prefers-color-scheme: dark)').matches)
const titlebarTabs = ref<TitlebarTab[]>([...INITIAL_TITLEBAR_TABS])
const activeTitlebarTabId = ref<string>(INITIAL_TITLEBAR_TABS[0]?.id ?? 'workspace')
const resolvedTheme = computed<'light' | 'dark'>(() => {
  if (themeMode.value === 'system') {
    return prefersDark.value ? 'dark' : 'light'
  }

  return themeMode.value
})
const activeTitlebarTab = computed<TitlebarTab>(() => {
  return (
    titlebarTabs.value.find((tab) => tab.id === activeTitlebarTabId.value) ??
    titlebarTabs.value[0] ??
    INITIAL_TITLEBAR_TABS[0]
  )
})
const activeWorkbenchCopy = computed(() => {
  return WORKBENCH_COPY[activeTitlebarTab.value?.id ?? 'workspace'] ?? WORKBENCH_COPY.workspace
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

function handleSelectTitlebarTab(tabId: string): void {
  if (!titlebarTabs.value.some((tab) => tab.id === tabId)) {
    return
  }

  activeTitlebarTabId.value = tabId
}

function handleCloseTitlebarTab(tabId: string): void {
  if (titlebarTabs.value.length <= 1) {
    return
  }

  const closingIndex = titlebarTabs.value.findIndex((tab) => tab.id === tabId)

  if (closingIndex === -1) {
    return
  }

  const closingTab = titlebarTabs.value[closingIndex]

  if (!closingTab.closable) {
    return
  }

  const remainingTabs = titlebarTabs.value.filter((tab) => tab.id !== tabId)

  if (remainingTabs.length === 0) {
    return
  }

  titlebarTabs.value = remainingTabs

  if (activeTitlebarTabId.value !== tabId) {
    return
  }

  activeTitlebarTabId.value =
    remainingTabs[Math.max(0, closingIndex - 1)]?.id ?? remainingTabs[0].id
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
    <AppTitlebar
      v-model="themeMode"
      :tabs="titlebarTabs"
      :active-tab-id="activeTitlebarTabId"
      @select-tab="handleSelectTitlebarTab"
      @close-tab="handleCloseTitlebarTab"
    />
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
                  {{ activeWorkbenchCopy.badge }}
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
                  {{ activeWorkbenchCopy.headline }}
                </h1>
                <p class="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                  {{ activeWorkbenchCopy.description }}
                </p>
              </div>

              <div class="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div
                  v-for="card in activeWorkbenchCopy.cards"
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
                  <p class="text-sm font-medium">{{ activeTitlebarTab.label }} status</p>
                  <p class="mt-2 text-sm text-muted-foreground">
                    Keep diagnostics, background job output, and current tab state visible while the
                    rest of the workspace grows around this shell.
                  </p>
                </div>
              </div>

              <div
                class="mt-auto rounded-2xl border border-dashed border-border/80 bg-muted/28 p-5"
              >
                <p class="text-sm font-medium">Next implementation slice</p>
                <p class="mt-1 text-sm text-muted-foreground">
                  {{ activeWorkbenchCopy.nextStep }}
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
