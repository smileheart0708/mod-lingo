<script setup lang="ts">
import { computed } from 'vue'
import { useVModel } from '@vueuse/core'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarShortcut,
  MenubarTrigger
} from '@/components/ui/menubar'
import ThemeModeToggle from '@/components/theme/ThemeModeToggle.vue'
import type { ThemeMode } from '@/lib/theme'

interface Props {
  modelValue?: ThemeMode
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 'system'
})

const emits = defineEmits<{
  'update:modelValue': [value: ThemeMode]
}>()

const platform = window.appShell.getPlatform()
const themeMode = useVModel(props, 'modelValue', emits)
const showWindowMenu = computed(() => platform !== 'darwin')
const openFolderShortcut = computed(() => (platform === 'darwin' ? '⌘O' : 'Ctrl+O'))

async function handleOpenFolder(): Promise<void> {
  await window.appShell.openWorkspaceFolder()
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
          <MenubarMenu>
            <MenubarTrigger class="h-7 rounded-md px-2.5 text-[13px] font-medium">
              File
            </MenubarTrigger>
            <MenubarContent class="min-w-56">
              <MenubarItem @select="void handleOpenFolder()">
                Open Folder
                <MenubarShortcut>
                  {{ openFolderShortcut }}
                </MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
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
.app-titlebar__right {
  display: flex;
  min-width: 0;
  align-items: center;
  height: 100%;
}

.app-titlebar__left {
  flex: 1 1 auto;
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
  flex: 1 1 auto;
}

.app-titlebar--darwin .app-titlebar__right {
  padding-right: 0.75rem;
}
</style>
