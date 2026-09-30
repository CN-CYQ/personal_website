# Motion

跨功能动效基础能力放在这里，具体页面动效优先放在
`features/<domain>/motion`。

约定：

- 轻量过渡优先使用 CSS 和 Vue Transition。
- GSAP 时间轴必须通过 `gsap.context()` 限定作用域。
- Three.js、Rive 和大体积效果必须动态导入。
- 每个动画控制器必须提供 `dispose` 或等效清理方法。
- 必须响应 `prefers-reduced-motion`。
