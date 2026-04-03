---
name: mod-lingo-shadcn-vue
description: Project-specific shadcn-vue component catalog for mod-lingo. Use when working in this repo and you need to choose, import, compose, or extend any UI component under src/renderer/src/components/ui, especially for forms, menus, dialogs, layouts, navigation, data display, loading states, or current component wrappers.
---

# Mod Lingo Shadcn Vue

## Overview

This skill is the component map for the renderer UI in this repository. Use it to find the correct shadcn-vue wrapper, the local import path, and the composition pattern before editing UI code.

## How To Use

1. Identify the component family from the task.
2. Open only the matching reference file below.
3. Follow the repo's wrapper conventions instead of pulling raw Reka UI primitives into feature code.

## Reference Map

- `references/component-inventory.md`: current component inventory, repo usage anchors, and empty placeholder dirs
- `references/form-controls.md`: `Button`, `Input`, `Textarea`, `Checkbox`, `Switch`, `RadioGroup`, `Select`, `NumberField`, `Slider`, `Progress`, `Badge`, `Skeleton`, `Spinner`, `Tooltip`, `Kbd`, `Separator`, `Sonner`
- `references/overlays-and-menus.md`: `Dialog`, `AlertDialog`, `Sheet`, `DropdownMenu`, `ContextMenu`, `Menubar`, `Command`
- `references/layout-and-display.md`: `Card`, `Breadcrumb`, `Tabs`, `Pagination`, `Resizable`, `ScrollArea`, `Table`, `Carousel`, `Item`, `Empty`, `ButtonGroup`, `InputGroup`, and the placeholder dirs `combobox`, `data-table`, `toggle`, `toggle-group`

## Local Conventions

- Import from `@/components/ui/<family>` and use the barrel export in that folder.
- Reuse local wrapper helpers such as `buttonVariants`, `badgeVariants`, `inputGroup*Variants`, `itemVariants`, and `buttonGroupVariants` when composing on top of the existing UI layer.
- Prefer the repo's current usage patterns:
  - `src/renderer/src/App.vue` for `ResizablePanelGroup`, `ResizablePanel`, and `ResizableHandle`
  - `src/renderer/src/components/shell/AppTitlebar.vue` for `Menubar`
  - `src/renderer/src/components/theme/ThemeModeToggle.vue` for `Button` + `DropdownMenu`
  - `src/renderer/src/components/ui/command/CommandDialog.vue` for `Dialog` + `Command`
- Treat `combobox`, `data-table`, `toggle`, and `toggle-group` as placeholders here because the directories currently have no component files.

## Before You Edit

- Check the matching reference file first if the task mentions one of these components.
- If the task needs a component that is still a placeholder, implement it before documenting or depending on it in feature code.
