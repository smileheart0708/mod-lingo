# Form Controls and Status

Use this file when the task is about basic inputs, selection controls, feedback widgets, or small inline helpers.

## Button

- 作用：通用操作按钮，承载最常见的确认、提交、切换和导航动作。
- 场景：表单提交、工具栏动作、图标按钮、链接式按钮、需要统一视觉层级的 CTA。
- 用法：`import { Button, buttonVariants, type ButtonVariants } from '@/components/ui/button'`。优先用 `variant` 和 `size`，需要和链接、`RouterLink` 组合时用 `asChild`。

## Input

- 作用：单行文本输入框。
- 场景：搜索、名称、路径、短文本、数字输入、文件名等。
- 用法：`import { Input } from '@/components/ui/input'`。用 `v-model` 绑定值，必要时传 `type`、`placeholder`、`disabled`、`defaultValue`。

## Textarea

- 作用：多行文本输入框。
- 场景：说明、备注、长文本、批量编辑、翻译内容。
- 用法：`import { Textarea } from '@/components/ui/textarea'`。用 `v-model` 绑定，适合和 `InputGroup`、`Dialog`、`Sheet` 一起组成编辑区。

## Checkbox

- 作用：布尔选项或多选项中的单个勾选项。
- 场景：开关某项功能、接受条款、批量选择、启用/禁用附加选项。
- 用法：`import { Checkbox } from '@/components/ui/checkbox'`。使用 `v-model:checked`，需要自定义勾选状态内容时用默认插槽。

## Switch

- 作用：更适合设置场景的二值切换控件。
- 场景：系统设置、主题开关、实时启用/禁用选项。
- 用法：`import { Switch } from '@/components/ui/switch'`。使用 `v-model:checked`，如果要显示自定义 thumb 内容，用 `#thumb` 插槽。

## RadioGroup

- 作用：互斥单选组。
- 场景：模式选择、布局选择、枚举值配置、优先级选择。
- 用法：`import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'`。用 `v-model` 绑定选中值，把每个 `RadioGroupItem` 放进 `RadioGroup` 内部。

## Select

- 作用：下拉选择器。
- 场景：枚举值选择、排序规则、语言、状态、过滤条件。
- 用法：`import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'`。用 `v-model` 绑定选中值，列表项放在 `SelectContent` 里。

## NumberField

- 作用：带增减按钮和数值约束的数字输入。
- 场景：数量、步进值、缩放比例、百分比、排序阈值。
- 用法：`import { NumberField, NumberFieldContent, NumberFieldInput, NumberFieldIncrement, NumberFieldDecrement } from '@/components/ui/number-field'`。用 `v-model` 绑定数值，把输入框和增减按钮放在 `NumberFieldContent` 里。

## Slider

- 作用：滑块型数值选择。
- 场景：范围调节、音量、缩放、权重、进度型数值。
- 用法：`import { Slider } from '@/components/ui/slider'`。用 `v-model` 绑定单值或数组值，靠 `min`、`max`、`step` 和 `orientation` 控制行为。

## Progress

- 作用：展示任务进度。
- 场景：上传、导入、翻译处理、后台任务、渐进式加载。
- 用法：`import { Progress } from '@/components/ui/progress'`。传 `modelValue`，默认是 0 到 100 的百分比语义。

## Badge

- 作用：紧凑标签、状态牌、计数牌。
- 场景：状态标记、类型标签、版本号、命中数、分组提示。
- 用法：`import { Badge, badgeVariants, type BadgeVariants } from '@/components/ui/badge'`。用 `variant` 控制样式，`Badge` 也可以作为 `Primitive` 容器使用。

## Skeleton

- 作用：内容占位骨架。
- 场景：列表加载、卡片加载、详情页占位。
- 用法：`import { Skeleton } from '@/components/ui/skeleton'`。直接渲染并通过 `class` 调整尺寸即可。

## Spinner

- 作用：轻量的忙碌状态图标。
- 场景：按钮内加载、局部请求中、正在提交。
- 用法：`import { Spinner } from '@/components/ui/spinner'`。这是一个自带 `role="status"` 的旋转图标组件，通常直接放进按钮或提示文本旁边。

## Tooltip

- 作用：短文本提示。
- 场景：图标按钮说明、缩写解释、悬停帮助。
- 用法：`import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'`。把触发元素放进 `TooltipTrigger`，提示内容放进 `TooltipContent`。

## Kbd

- 作用：键盘按键样式。
- 场景：快捷键提示、命令说明、帮助文案。
- 用法：`import { Kbd, KbdGroup } from '@/components/ui/kbd'`。直接用插槽渲染按键内容，和 `TooltipContent` 配合时会自动使用更适合深色浮层的样式。

## Separator

- 作用：分隔线。
- 场景：工具栏分隔、菜单分组、面板切割、表单区块分割。
- 用法：`import { Separator } from '@/components/ui/separator'`。默认是水平分隔线，传 `orientation="vertical"` 可做竖线。

## Sonner

- 作用：全局 toast 容器。
- 场景：保存成功、失败告警、后台任务提示、异步操作反馈。
- 用法：`import { Toaster } from '@/components/ui/sonner'`。通常在根布局挂一次，再用 `vue-sonner` 的 `toast` API 触发消息。
