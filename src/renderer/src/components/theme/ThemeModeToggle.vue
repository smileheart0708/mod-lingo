<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useVModel } from '@vueuse/core'
import type { HTMLAttributes } from 'vue'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { getNextThemeMode, getThemeModeLabel, themeOptions, type ThemeMode } from '@/lib/theme'

defineOptions({
  inheritAttrs: false
})

interface Props {
  modelValue?: ThemeMode
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 'system'
})

const emits = defineEmits<{
  'update:modelValue': [value: ThemeMode]
}>()

const themeMode = useVModel(props, 'modelValue', emits)
const menuOpen = ref(false)
const suppressNextClick = ref(false)
const currentThemeLabel = computed(() => getThemeModeLabel(themeMode.value))
const currentThemeIcon = computed(
  () =>
    themeOptions.find((option) => option.value === themeMode.value)?.icon ?? themeOptions[0].icon
)

let longPressTimer: ReturnType<typeof window.setTimeout> | undefined

function clearLongPressTimer(): void {
  if (longPressTimer === undefined) {
    return
  }

  window.clearTimeout(longPressTimer)
  longPressTimer = undefined
}

function openMenu(): void {
  menuOpen.value = true
}

function cycleThemeMode(): void {
  themeMode.value = getNextThemeMode(themeMode.value)
  menuOpen.value = false
}

function handlePointerDown(event: PointerEvent): void {
  if (event.button !== 0 || event.ctrlKey) {
    return
  }

  clearLongPressTimer()

  longPressTimer = window.setTimeout(() => {
    suppressNextClick.value = true
    openMenu()
  }, 450)
}

function finishPointerInteraction(): void {
  const hadLongPress = suppressNextClick.value

  clearLongPressTimer()

  if (hadLongPress) {
    window.setTimeout(() => {
      suppressNextClick.value = false
    }, 0)
  }
}

function handleButtonClickCapture(event: MouseEvent): void {
  if (event.button !== 0 || event.ctrlKey) {
    return
  }

  if (suppressNextClick.value) {
    event.preventDefault()
    event.stopImmediatePropagation()
    suppressNextClick.value = false
    menuOpen.value = true
    return
  }

  event.preventDefault()
  event.stopImmediatePropagation()
  cycleThemeMode()
}

function handleButtonKeydownCapture(event: KeyboardEvent): void {
  if (
    event.key === 'ArrowDown' ||
    event.key === 'ContextMenu' ||
    (event.shiftKey && event.key === 'F10')
  ) {
    event.preventDefault()
    event.stopImmediatePropagation()
    openMenu()
    return
  }

  if (event.key !== 'Enter' && event.key !== ' ') {
    return
  }

  event.preventDefault()
  event.stopImmediatePropagation()
  cycleThemeMode()
  suppressNextClick.value = true
  window.setTimeout(() => {
    suppressNextClick.value = false
  }, 0)
}

onBeforeUnmount(() => {
  clearLongPressTimer()
})

watch(menuOpen, (open) => {
  if (!open) {
    suppressNextClick.value = false
  }
})
</script>

<template>
  <div :class="cn('inline-flex', props.class)">
    <DropdownMenu v-model:open="menuOpen">
      <DropdownMenuTrigger as-child>
        <Button
          variant="ghost"
          size="icon-sm"
          class="h-8 w-8 rounded-full border-0 bg-transparent hover:bg-muted/50"
          :aria-label="`Theme: ${currentThemeLabel}`"
          :title="`Theme: ${currentThemeLabel}`"
          @pointerdown.capture="handlePointerDown"
          @pointerup.capture="finishPointerInteraction"
          @pointerleave.capture="finishPointerInteraction"
          @pointercancel.capture="finishPointerInteraction"
          @click.capture="handleButtonClickCapture"
          @keydown.capture="handleButtonKeydownCapture"
        >
          <component :is="currentThemeIcon" class="size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        :side-offset="8"
        class="app-shell__no-drag min-w-52 rounded-2xl border-border/70 p-1.5 shadow-lg"
      >
        <DropdownMenuRadioGroup v-model="themeMode">
          <DropdownMenuRadioItem
            v-for="option in themeOptions"
            :key="option.value"
            :value="option.value"
            class="h-11 gap-3 rounded-xl pl-3 pr-4 text-[15px] font-medium text-foreground data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground"
          >
            <template #indicator-icon>
              <span aria-hidden="true" class="size-0" />
            </template>
            <component
              :is="option.icon"
              class="size-5 shrink-0 text-muted-foreground transition-colors"
              :class="themeMode === option.value && 'text-foreground'"
            />
            <span class="truncate">{{ option.label }}</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
