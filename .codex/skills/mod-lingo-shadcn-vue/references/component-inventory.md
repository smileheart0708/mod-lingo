# Component Inventory

This repo's UI wrappers live under `src/renderer/src/components/ui`. The list below is the current active surface area plus the placeholder directories that exist but do not yet contain component files.

## Active Families

### Controls and Status

- `badge`
- `button`
- `checkbox`
- `input`
- `number-field`
- `progress`
- `radio-group`
- `select`
- `separator`
- `slider`
- `skeleton`
- `spinner`
- `switch`
- `textarea`
- `tooltip`
- `kbd`
- `sonner`

### Overlays and Menus

- `alert-dialog`
- `command`
- `context-menu`
- `dialog`
- `dropdown-menu`
- `menubar`
- `sheet`

### Layout and Data Display

- `breadcrumb`
- `button-group`
- `card`
- `carousel`
- `empty`
- `input-group`
- `item`
- `pagination`
- `resizable`
- `scroll-area`
- `table`
- `tabs`

## Placeholder Directories

These directories currently exist but do not contain component files:

- `combobox`
- `data-table`
- `toggle`
- `toggle-group`

## Current Repo Usage Anchors

- `src/renderer/src/App.vue` uses `ResizablePanelGroup`, `ResizablePanel`, and `ResizableHandle` for the shell layout.
- `src/renderer/src/components/shell/AppTitlebar.vue` uses `Menubar` for the custom desktop titlebar menu.
- `src/renderer/src/components/theme/ThemeModeToggle.vue` uses `Button`, `DropdownMenu`, `DropdownMenuRadioGroup`, and `DropdownMenuRadioItem` for theme selection.
- `src/renderer/src/components/ui/command/CommandDialog.vue` combines `Dialog` and `Command` for palette-style search.
- `src/renderer/src/components/ui/dialog/DialogFooter.vue` uses `Button` inside dialog actions.
- `src/renderer/src/components/ui/input-group/InputGroupButton.vue` and `InputGroupInput.vue` wrap `Button` and `Input`.
- `src/renderer/src/components/ui/item/ItemSeparator.vue` and `src/renderer/src/components/ui/button-group/ButtonGroupSeparator.vue` use `Separator`.
