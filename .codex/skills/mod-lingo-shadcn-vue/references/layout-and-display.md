# Layout and Display

Use this file for shell layouts, navigation breadcrumbs, grouped cards, list rows, tables, scroll containers, and composition wrappers.

## Card

- 作用：内容容器。
- 场景：信息面板、统计块、设置卡片、预览区、资源详情。
- 用法：`import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from '@/components/ui/card'`。把标题、说明、主体和脚注拆开组织。

## Breadcrumb

- 作用：路径导航。
- 场景：多层页面层级、文件路径、资源定位、返回上级。
- 用法：`import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis } from '@/components/ui/breadcrumb'`。长路径用 `BreadcrumbEllipsis` 收缩。

## Tabs

- 作用：同一区域内的分段切换。
- 场景：设置页、详情页分栏、编辑器视图切换、结果视图切换。
- 用法：`import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'`。一个 `Tabs` 对应一组互斥内容面板。

## Pagination

- 作用：分页导航。
- 场景：长列表、结果集、翻页浏览、搜索结果。
- 用法：`import { Pagination, PaginationContent, PaginationItem, PaginationFirst, PaginationPrevious, PaginationNext, PaginationLast, PaginationEllipsis } from '@/components/ui/pagination'`。这是基于 `buttonVariants` 的分页按钮封装。

## Resizable

- 作用：可拖拽分栏布局。
- 场景：左侧栏 + 主区、预览区 + 编辑区、双栏/三栏工作台。
- 用法：`import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'`。当前项目的根布局就是这个模式。

## ScrollArea

- 作用：受控滚动区域。
- 场景：侧边栏、长列表、弹窗内容、局部滚动区。
- 用法：`import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'`。需要统一滚动条样式时优先用它，而不是直接依赖浏览器默认滚动容器。

## Table

- 作用：结构化表格。
- 场景：资源列表、翻译条目、对照数据、批量操作、导出预览。
- 用法：`import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableFooter, TableCaption, TableEmpty } from '@/components/ui/table'`。空态用 `TableEmpty`，不要只留空的 `tbody`。

## Carousel

- 作用：横向轮播/滑动条。
- 场景：图片、卡片轮播、步骤介绍、功能展示、横向预览。
- 用法：`import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, useCarousel, type CarouselApi } from '@/components/ui/carousel'`。`CarouselNext` 和 `CarouselPrevious` 已经封装了 `Button`，需要命令式控制时用 `useCarousel`。

## Item

- 作用：通用列表项/内容行。
- 场景：设置列表、资源条目、搜索结果、带媒体的卡片行、选择器结果。
- 用法：`import { Item, ItemGroup, ItemHeader, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions, ItemFooter, ItemSeparator, type ItemVariants, type ItemMediaVariants } from '@/components/ui/item'`。这是项目自定义的行级 wrapper，比直接堆 `div` 更适合复用。

## Empty

- 作用：空状态组件。
- 场景：无搜索结果、空工作区、无翻译条目、没有导入资源。
- 用法：`import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent, type EmptyMediaVariants } from '@/components/ui/empty'`。空状态尽量由标题、说明和动作组成，不要只放一行灰字。

## ButtonGroup

- 作用：把多个按钮或混合控件收成一个按钮组。
- 场景：紧凑工具栏、分段操作、前后缀组合、按钮 + 下拉选择。
- 用法：`import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, type ButtonGroupVariants } from '@/components/ui/button-group'`。`orientation` 支持 `horizontal` 和 `vertical`。

## InputGroup

- 作用：把输入框与前后缀、按钮、说明文字拼成一个整体。
- 场景：带单位的数值输入、路径输入、搜索框 + 按钮、带前缀后缀的表单项。
- 用法：`import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea, type InputGroupVariants, type InputGroupButtonVariants } from '@/components/ui/input-group'`。`InputGroupAddon` 支持 `inline-start`、`inline-end`、`block-start`、`block-end`。

## Placeholder Dirs

These folders exist but currently have no component files:

- `combobox`
- `data-table`
- `toggle`
- `toggle-group`

Treat them as future expansion points, not as usable APIs yet.
