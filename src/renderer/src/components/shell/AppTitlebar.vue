<script setup lang="ts">
import { computed } from 'vue'
import { useVModel } from '@vueuse/core'
import { X } from 'lucide-vue-next'
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
import type { ThemeMode } from '@/lib/theme'
import type { TitlebarTab } from './titlebar'

interface MenuEntry {
  label: string
  shortcut?: string
}

interface MenuSection {
  label: string
  items: MenuEntry[]
}

interface Props {
  modelValue?: ThemeMode
  tabs: TitlebarTab[]
  activeTabId: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 'system'
})

const emits = defineEmits<{
  'update:modelValue': [value: ThemeMode]
  'select-tab': [tabId: string]
  'close-tab': [tabId: string]
}>()

const platform = window.appShell.getPlatform()
const themeMode = useVModel(props, 'modelValue', emits)
const showWindowMenu = computed(() => platform !== 'darwin')
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

function isActiveTab(tabId: string): boolean {
  return props.activeTabId === tabId
}

function canCloseTab(tab: TitlebarTab): boolean {
  return tab.closable && props.tabs.length > 1
}

function handleTabSelect(tabId: string): void {
  emits('select-tab', tabId)
}

function handleTabClose(event: MouseEvent, tab: TitlebarTab): void {
  event.preventDefault()
  event.stopPropagation()

  if (!canCloseTab(tab)) {
    return
  }

  emits('close-tab', tab.id)
}
</script>

<template>
  <header :class="['app-titlebar', `app-titlebar--${platform}`]">
    <div aria-hidden="true" class="app-titlebar__drag-region" />

    <div class="app-titlebar__content">
      <div aria-hidden="true" class="app-titlebar__safe app-titlebar__safe--left" />

      <div class="app-titlebar__left">
        <div class="app-titlebar__brand">
          <p class="app-titlebar__brand-text text-sm font-semibold tracking-tight">mod-lingo</p>
        </div>

        <Menubar
          v-if="showWindowMenu"
          class="app-shell__no-drag app-titlebar__menubar h-8 min-w-0 border-0 bg-transparent p-0 shadow-none"
        >
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
      </div>

      <div class="app-titlebar__center">
        <div class="app-titlebar__tab-strip" role="tablist" aria-label="Workspace tabs">
          <div
            v-for="tab in tabs"
            :key="tab.id"
            :class="[
              'app-titlebar__tab',
              {
                'app-titlebar__tab--active': isActiveTab(tab.id),
                'app-titlebar__tab--closable': canCloseTab(tab)
              }
            ]"
          >
            <button
              type="button"
              role="tab"
              class="app-shell__no-drag app-titlebar__tab-main"
              :aria-selected="isActiveTab(tab.id)"
              :tabindex="isActiveTab(tab.id) ? 0 : -1"
              :title="tab.label"
              @click="handleTabSelect(tab.id)"
            >
              <span class="app-titlebar__tab-label">{{ tab.label }}</span>
            </button>

            <button
              v-if="canCloseTab(tab)"
              type="button"
              class="app-shell__no-drag app-titlebar__tab-close"
              :aria-label="`Close ${tab.label}`"
              :title="`Close ${tab.label}`"
              @click="handleTabClose($event, tab)"
            >
              <X class="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div class="app-titlebar__right">
        <ThemeModeToggle v-model="themeMode" class="app-shell__no-drag app-titlebar__theme" />
      </div>

      <div aria-hidden="true" class="app-titlebar__safe app-titlebar__safe--right" />
    </div>
  </header>
</template>

<style scoped>
.app-titlebar {
  position: relative;
  width: 100%;
  height: var(--titlebar-height);
  box-sizing: border-box;
  user-select: none;
  -webkit-user-select: none;
  background: var(--background);
  overflow: hidden;
}

.app-titlebar__drag-region {
  position: absolute;
  inset: 0;
  -webkit-app-region: drag;
}

.app-titlebar__content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  min-width: 0;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  gap: var(--titlebar-zone-gap);
  pointer-events: none;
}

.app-titlebar__safe {
  flex: 0 0 auto;
  height: 100%;
}

.app-titlebar__safe--left {
  width: var(--titlebar-safe-left);
}

.app-titlebar__safe--right {
  width: var(--titlebar-safe-right);
}

.app-titlebar__left,
.app-titlebar__center,
.app-titlebar__right {
  display: flex;
  min-width: 0;
  align-items: center;
  height: 100%;
}

.app-titlebar__left {
  flex: 0 1 clamp(15rem, 30vw, 24rem);
  gap: 0.875rem;
  overflow: hidden;
  padding-inline: 0.5rem 0;
  pointer-events: none;
}

.app-titlebar__brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-shrink: 0;
}

.app-titlebar__brand-text {
  min-width: 0;
  white-space: nowrap;
  letter-spacing: -0.015em;
}

.app-titlebar__brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.65rem;
  border: 1px solid color-mix(in srgb, var(--border) 75%, transparent);
  background: color-mix(in srgb, var(--muted) 68%, transparent);
  box-shadow: 0 1px 0 color-mix(in srgb, var(--foreground) 5%, transparent);
}

.app-titlebar__center {
  flex: 1 1 auto;
  justify-content: center;
  overflow: hidden;
  padding-block: 0.25rem;
}

.app-titlebar__tab-strip {
  display: flex;
  align-items: center;
  min-width: 0;
  width: min(100%, 54rem);
  gap: 0.25rem;
  padding: 0.25rem;
  border: 1px solid color-mix(in srgb, var(--border) 78%, transparent);
  border-radius: calc(var(--titlebar-tab-radius) + 0.25rem);
  background: color-mix(in srgb, var(--muted) 44%, transparent);
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--background) 70%, transparent);
  pointer-events: none;
}

.app-titlebar__tab {
  display: flex;
  align-items: center;
  min-width: 0;
  max-width: 14rem;
  height: var(--titlebar-tab-height);
  border: 1px solid transparent;
  border-radius: var(--titlebar-tab-radius);
  color: color-mix(in srgb, var(--foreground) 74%, transparent);
  background: transparent;
  pointer-events: auto;
  transition:
    background-color 140ms ease,
    border-color 140ms ease,
    color 140ms ease;
}

.app-titlebar__tab:hover {
  color: var(--foreground);
  background: color-mix(in srgb, var(--background) 76%, var(--muted) 24%);
}

.app-titlebar__tab--active {
  color: var(--foreground);
  background: color-mix(in srgb, var(--background) 92%, var(--accent) 8%);
  border-color: color-mix(in srgb, var(--border) 85%, transparent);
  box-shadow: 0 1px 0 color-mix(in srgb, var(--background) 80%, transparent);
}

.app-titlebar__tab-main {
  display: flex;
  align-items: center;
  min-width: 0;
  height: 100%;
  flex: 1 1 auto;
  padding-inline: 0.85rem;
  border: 0;
  border-radius: inherit;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.app-titlebar__tab--closable .app-titlebar__tab-main {
  padding-right: 0.4rem;
}

.app-titlebar__tab-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.app-titlebar__tab-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.55rem;
  height: 1.55rem;
  margin-right: 0.25rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: color-mix(in srgb, var(--foreground) 60%, transparent);
  cursor: pointer;
  opacity: 0;
  transition:
    opacity 120ms ease,
    background-color 120ms ease,
    color 120ms ease;
}

.app-titlebar__tab:hover .app-titlebar__tab-close,
.app-titlebar__tab--active .app-titlebar__tab-close {
  opacity: 1;
}

.app-titlebar__tab-close:hover {
  color: var(--foreground);
  background: color-mix(in srgb, var(--muted) 72%, transparent);
}

.app-titlebar__right {
  flex: 0 0 auto;
  justify-content: flex-end;
  gap: var(--titlebar-actions-gap);
  padding-right: 0.5rem;
  pointer-events: none;
}

.app-titlebar__theme,
.app-titlebar__menubar {
  pointer-events: auto;
}

.app-titlebar__menubar {
  min-width: 0;
  flex-wrap: nowrap;
}

.app-titlebar--darwin .app-titlebar__left {
  flex-basis: clamp(10rem, 18vw, 14rem);
  max-width: 15rem;
}

.app-titlebar--darwin .app-titlebar__center {
  justify-content: flex-start;
}

.app-titlebar--darwin .app-titlebar__tab-strip {
  width: min(100%, 48rem);
}

.app-titlebar--darwin .app-titlebar__right {
  padding-right: 0.75rem;
}
</style>
