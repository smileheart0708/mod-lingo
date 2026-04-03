# Overlays and Menus

Use this file for popovers, dialogs, dropdowns, command palettes, and desktop-style menus.

## Dialog

- 作用：通用模态窗口。
- 场景：编辑表单、详情弹窗、设置面板、确认二级交互。
- 用法：`import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogOverlay, DialogScrollContent } from '@/components/ui/dialog'`。普通内容放 `DialogContent`，长内容用 `DialogScrollContent`。

## AlertDialog

- 作用：带决策含义的确认弹窗。
- 场景：删除、重置、不可逆操作、离开页面确认。
- 用法：`import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog'`。主动作放 `AlertDialogAction`，取消动作放 `AlertDialogCancel`。

## Sheet

- 作用：侧边抽屉面板。
- 场景：移动端侧栏、筛选面板、详情抽屉、辅助配置区。
- 用法：`import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet'`。适合从屏幕边缘滑入的界面。

## DropdownMenu

- 作用：按钮触发的下拉菜单。
- 场景：主题切换、更多操作、用户菜单、选项列表、单按钮命令区。
- 用法：`import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuShortcut, DropdownMenuGroup, DropdownMenuPortal } from '@/components/ui/dropdown-menu'`。当前项目里的 `ThemeModeToggle` 就是这个模式。

## ContextMenu

- 作用：右键上下文菜单。
- 场景：文件列表、树节点、表格行、资源卡片的快捷操作。
- 用法：`import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuCheckboxItem, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent, ContextMenuGroup, ContextMenuShortcut } from '@/components/ui/context-menu'`。把可右键的内容包进 `ContextMenuTrigger`。

## Menubar

- 作用：桌面应用风格的顶栏菜单。
- 场景：Electron / 桌面端标题栏、传统菜单栏、跨平台命令入口。
- 用法：`import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarCheckboxItem, MenubarRadioGroup, MenubarRadioItem, MenubarSub, MenubarSubTrigger, MenubarSubContent, MenubarGroup, MenubarLabel, MenubarSeparator, MenubarShortcut } from '@/components/ui/menubar'`。当前项目的 `AppTitlebar` 用它来做平台菜单。

## Command

- 作用：命令面板和可搜索列表。
- 场景：全局命令搜索、快捷入口、过滤结果、资源选择器。
- 用法：`import { Command, CommandDialog, CommandInput, CommandList, CommandItem, CommandGroup, CommandEmpty, CommandSeparator, CommandShortcut } from '@/components/ui/command'`。需要模态搜索时优先用 `CommandDialog`；需要自定义过滤逻辑时可复用 `useCommand` / `provideCommandContext`。
