# 页面、组件与设计规范

> 文档状态：M0 设计基线  
> 最后更新：2026-10-01  
> 视觉方向：清透天空、深色草谷、右上暖光、克制玻璃层  
> 关联文档：[PRD.md](./PRD.md) · [ARCHITECTURE.md](./ARCHITECTURE.md) · [TASKS.md](./TASKS.md)

## 1. 设计原则

- 先内容，后装饰。信息密度高的后台优先保证扫描和操作效率。
- 公开页面允许沉浸式首屏，后台页面不使用大面积氛围动画。
- 视觉层与业务层分离，背景效果不能阻塞数据加载或页面操作。
- 动效服务于层级和反馈，不制造持续干扰。
- 所有交互控件在移动端和键盘环境下可用。
- 文本必须可读，不能为了玻璃效果牺牲对比度。

## 2. 视觉语言

公开首页延续当前草浪背景：

- 天空：冷蓝到暖白横向过渡，右上角有低饱和日光。
- 草地：深蓝色波谷向黄绿色波峰过渡，远端更亮，近景更深。
- 纹理：细密草叶形成流动的纵向笔触，不使用大块纯色。
- 玻璃层：只用于状态、导航、摘要和浮层，不把整个页面做成卡片堆叠。
- 内容层：文字、按钮和状态控件必须位于背景之上并保持稳定对比度。

后台视觉：

- 安静、工作导向、以表格、筛选器和表单为主。
- 卡片只用于重复指标、列表项和模态框，不嵌套卡片。
- 图表颜色与公开站保持同一色系，但避免装饰性渐变。

## 3. 设计 Token

建议在 `src/styles/tokens.css` 统一定义，当前可先沿用基础样式变量。

颜色：

| Token | 建议值 | 用途 |
| --- | --- | --- |
| `--color-sky-1` | `#6a9dbd` | 首屏左侧天空 |
| `--color-sky-2` | `#9fc2d5` | 首屏中部天空 |
| `--color-sun` | `#ffe5bd` | 右上暖光 |
| `--color-meadow-deep` | `#07303c` | 近景草谷 |
| `--color-meadow` | `#2d765f` | 中景草地 |
| `--color-meadow-light` | `#b5cf62` | 日照草峰 |
| `--color-ink` | `#103e35` | 公开页主文字 |
| `--color-surface` | `rgb(255 255 255 / 34%)` | 玻璃表面 |
| `--color-danger` | `#b42318` | 错误 |
| `--color-success` | `#2f855a` | 成功 |
| `--color-warning` | `#a15c00` | 警告 |

字体：

- 正文：`"Helvetica Neue", "Segoe UI", system-ui, sans-serif`
- 数据显示：继承正文，使用 tabular numbers。
- 标题：正文同族，通过字重和尺寸建立层级。
- 不引入仅用于装饰的艺术字体。

间距：

- 4px 基准。
- 常用间距：8、12、16、24、32、48、64。
- 公开页水平边距：`clamp(20px, 4vw, 68px)`。
- 后台内容最大宽度建议 1440px，表格区域允许横向滚动。

圆角：

- 小组件 8px。
- 输入框、按钮 10px。
- 浮层和模态框 12px。
- 胶囊标签使用 999px。
- 禁止卡片套卡片造成边界噪音。

阴影：

- 玻璃层使用柔和环境阴影和内高光。
- 表格、列表默认无阴影，悬停才显示层级。
- 模态框阴影只用于最上层。

## 4. 响应式断点

| 名称 | 范围 | 行为 |
| --- | --- | --- |
| Mobile | 320-639px | 单列、底部或抽屉导航、隐藏次要指标 |
| Tablet | 640-1023px | 两列卡片、紧凑筛选、侧栏可折叠 |
| Desktop | 1024-1439px | 标准后台布局和完整公开导航 |
| Wide | 1440px+ | 仅增加留白，不无限放大正文 |

要求：

- 最小支持 320px 宽。
- 长单词、URL 和代码块必须换行或横向滚动。
- 按钮和表单项不能被动态文本撑破。
- 固定格式的图表、播放器和工具栏必须设置稳定尺寸约束。

## 5. 页面骨架

### 5.1 公开壳层

```text
DefaultLayout
|-- SiteHeader
|   |-- Brand
|   |-- PublicNav
|   `-- UserMenu / LoginLink
|-- RouterView
|-- GlobalAudioDock（仅音乐播放时显示）
`-- SiteFooter（内容页）
```

### 5.2 后台壳层

```text
AdminLayout
|-- AdminSidebar
|-- AdminTopbar
|   |-- Breadcrumbs
|   `-- UserMenu
`-- RouterView
```

后台在移动端使用抽屉导航，不把侧栏压缩成不可读图标列。

## 6. 页面与组件树

### 首页 `/`

```text
HomePage
|-- HeroSection
|   |-- GrassWaveCanvas
|   |-- HeroSkyGlow
|   `-- HeroContent
`-- PublicDashboard
    |-- WeatherCard
    |-- RecentPostsCard
    `-- RecentEventsCard
```

首屏交互：

- 指针移动改变草叶轻微避让和风感。
- 有 `prefers-reduced-motion` 时只渲染静态帧。
- WebGL 失败时显示 CSS 渐变和草纹降级。
- 首屏不等待后台数据，天气和摘要独立加载。

### 作品 `/works`

```text
WorksPage
|-- PageHeader
|-- WorkFilterBar
|-- WorkCardGrid
|   `-- WorkCard
`-- Pagination
```

详情：

```text
WorkDetailPage
|-- WorkHero
|-- TechStackList
|-- MarkdownContent
`-- ExternalLinks
```

### 博客 `/blog`

```text
BlogListPage
|-- PostSearch
|-- TagFilter
|-- PostCardList
`-- Pagination
```

详情使用 `PostHeader + MarkdownContent + RelatedPosts`。正文最大宽度约 720px。

### 笔记 `/notes`

```text
NotesPage
|-- NoteListPanel
|-- NoteEditor
|   |-- EditorToolbar
|   |-- MarkdownTextarea
|   `-- MarkdownPreview
`-- SaveStatus
```

桌面端双栏，移动端切换为“编辑/预览”分段控件。

### 日历 `/calendar`

```text
CalendarPage
|-- CalendarToolbar
|-- MonthGrid | WeekGrid
|-- EventList
`-- EventDialog
```

事件颜色必须有文本标签，不仅依赖颜色区分。公开日历和后台日历共用组件，通过 `canEdit` 控制行为。

### 天气 `/weather`

```text
WeatherPage
|-- WeatherHeader
|-- WeatherCard
|-- ForecastList
`-- WeatherSourceNote
```

### 看板 `/dashboard`

```text
DashboardPage
|-- DashboardToolbar
|-- MetricGrid
|   `-- MetricCard
|-- RecentPostsCard
|-- RecentEventsCard
`-- SourceStateList
```

每个数据源卡片有独立状态，显示最后更新时间。部分失败不把页面切到全屏错误。

### 音乐 `/music`

```text
MusicPage
|-- PlaylistPanel
|-- PlaylistTrackList
`-- NowPlaying
    |-- Cover
    |-- TrackMeta
    `-- PlayerControls
```

全局 `GlobalAudioDock` 在离开音乐页后继续播放。播放器按钮必须带可访问名称。

### 登录 `/login`

```text
LoginPage
`-- LoginForm
    |-- UsernameField
    |-- PasswordField
    `-- SubmitButton
```

错误消息位于表单内并使用 `role="alert"`，不用浏览器 native alert。

## 7. 组件规范

### 按钮

- 主按钮用于页面主要动作，一个区域最多一个。
- 次按钮用于取消、返回、筛选。
- 危险按钮只在确认后执行破坏性操作。
- 工具按钮优先使用图标，并提供 tooltip 和 `aria-label`。
- 加载中按钮保持尺寸，不因文字变化跳动。

### 表单

- 每个字段有可见 label。
- 错误信息紧邻字段，并关联 `aria-describedby`。
- 数字字段使用正确的 `inputmode`。
- 时间字段同时显示时区提示。
- 未保存离开编辑页时需要确认。

### 卡片

- 卡片用于指标、作品项、文章项和模态框。
- 卡片内不再嵌套完整卡片。
- 列表项的标题、摘要、标签和操作位置保持一致。
- 卡片可选择时，点击区域与键盘焦点范围一致。

### 状态组件

每个异步区域明确实现：

- `loading`：骨架或稳定占位。
- `empty`：解释为什么为空并提供下一步操作。
- `error`：说明问题并提供重试。
- `stale`：显示缓存数据和更新时间。

禁止用空白页面表示错误。

## 8. 数据可视化

- ECharts 按需引入，不把全量包放入首屏。
- 图表必须有标题、单位和时间范围。
- 颜色之外还要有图例、标签或纹理区分。
- 数据源失败时保留坐标和说明，不显示随机曲线。
- 1 到 3 个指标优先使用数字卡，不强行做环形图。

## 9. 动效规范

- 时长：微交互 120-180ms，组件过渡 180-280ms，页面级最多 500ms。
- 缓动：以 ease-out 为主。
- 首屏草浪常驻动画必须可暂停，切到后台标签页时停止 requestAnimationFrame。
- 模态框支持减少动画；不因 transition 造成内容延迟。
- 不做大面积视差阻塞滚动。
- 指针效果不是功能唯一入口。

## 10. 可访问性

- 所有页面有唯一 `h1`，标题层级连续。
- 焦点样式可见，不能被 `outline: none` 移除。
- 颜色对比度达到 WCAG AA。
- 键盘可以操作导航、表单、播放器、日历和模态框。
- 日历事件支持键盘选择，不仅支持指针拖拽。
- 图像提供 alt；装饰性背景 `aria-hidden=true`。
- 状态变化通过文本或 live region 通知，不只依赖颜色。
- 动效尊重 `prefers-reduced-motion`。

## 11. 内容与文案

- 界面语言默认简体中文，技术标识保留英文。
- 按钮使用动词，例如“保存草稿”“发布文章”。
- 错误文案说明发生了什么、如何恢复。
- 日期显示使用 `Asia/Shanghai`，同时保留 API UTC 字段。
- 公开页面避免展示节点状态、调试信息和技术实现细节。
- 空状态不写营销口号，直接说明下一步操作。

## 12. 素材与版权

- 封面、头像和配图优先使用自有或已授权素材。
- 音乐必须填写 `rightsNote`，发布前由后端校验。
- 不使用来源不明的随机图片作为最终视觉资产。
- WebGL 首屏是程序生成背景，不依赖外部图片。
- 上传图片必须生成合适尺寸，避免原图直接进入列表。

## 13. 设计验收清单

- 320px、390px、768px、1440px 视口均无横向溢出或文本遮挡。
- 首屏 WebGL、CSS 降级和 reduced-motion 三种路径均可读。
- 键盘可完成登录、发布文章、创建事件和播放音乐。
- 错误、加载、空状态均经过检查。
- 所有按钮、输入、图表和播放器有明确标签。
- 后台表格在移动端可以选择性隐藏列或允许横向滚动。

## 14. 首屏播放器与天气动效

首屏允许使用强视觉焦点，但不得遮挡主导航、天气信息或核心操作。

### 14.1 音乐播放器

- 播放器以圆形封面为视觉圆心，播放状态下沿圆心顺时针持续旋转。
- 封面使用轻微模糊与降饱和处理，音波、进度条与控制区位于封面外延的磨砂玻璃层中。
- 音波与进度条处于高对比聚焦层，进度条支持指针拖动、方向键和 Home/End。
- 上一首、播放/暂停、下一首和播放模式默认收起，在音波或进度区悬浮、聚焦时向下弹动出现。
- 播放模式按列表循环、单曲循环、随机播放顺序切换；本次仅定义视觉状态，不代表真实音频能力已交付。
- `prefers-reduced-motion` 下停止封面旋转和玻璃扫光，但保留静态层级和所有控件标签。

### 14.2 天气日期

- 首屏右上方使用圆角长方形玻璃卡，收起态显示当前天气、温度和日期。
- 悬浮天气摘要时组件平滑增高，太阳缩小并与温度并排。
- 展开区显示 5 日天气、天气图标、降水概率、高低温和 5 日折线图。
- 日期在展开时避让至 5 日预报底部，收起后回到摘要下方。
- 触摸端允许点击切换展开状态，键盘焦点与 Escape 可收起。
- `prefers-reduced-motion` 下取消高度和位移动画，内容直接切换。
