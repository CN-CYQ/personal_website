# 架构设计

## 总体形态

项目采用单仓库、前后端分离、后端模块化单体架构。

```text
Browser
  |
  v
Vue Frontend
  |
  v
Spring Boot REST API
  |
  +-- MySQL
  +-- Redis
  +-- Object Storage
  +-- MongoDB（仅在确有文档型数据需求时启用）
```

不采用微服务。个人网站的流量、部署规模和业务边界不足以抵消微服务带来的
分布式事务、服务发现、链路追踪和运维成本。

## 前端分层

- `app`: 应用初始化、路由、全局状态和全局样式。
- `api`: HTTP 客户端和按领域拆分的接口。
- `layouts`: 页面布局。
- `pages`: 路由页面。
- `features`: 按业务领域组织的组件、状态、接口和动效。
- `components`: 跨业务复用组件。
- `composables`: 跨业务复用逻辑。
- `motion`: GSAP、WebGL 和页面级动效控制器。
- `styles`: 设计 token、基础样式和工具样式。
- `types`: 跨模块共享类型。
- `utils`: 无业务状态的纯工具函数。

路由和普通页面不要直接承载大量动画逻辑。复杂动效应放入对应
`features/<domain>/motion` 或 `src/motion`，并提供销毁方法。

## 后端分层

后端采用 package-by-feature，而不是按 Controller、Service、Repository
等技术层拆分全局目录。

```text
com.cncyq.personalwebsite
├─ common
├─ config
└─ modules
   ├─ auth
   ├─ user
   ├─ blog
   ├─ note
   ├─ portfolio
   ├─ calendar
   ├─ weather
   ├─ dashboard
   ├─ music
   ├─ file
   └─ system
```

每个模块内部按需要包含：

```text
controller/
service/
repository/
entity/
dto/
mapper/
```

模块之间通过 Service 接口和明确的 DTO 交互，禁止 Controller 之间互相调用。

## API 约定

- 前缀：`/api/v1`
- 风格：REST
- 请求与响应：JSON
- 时间：ISO 8601 UTC
- 分页：`page`、`size`、`sort`
- 文档：Springdoc OpenAPI

统一响应结构：

```json
{
  "code": "OK",
  "message": "success",
  "data": {},
  "timestamp": "2026-09-30T00:00:00Z"
}
```

## 数据边界

- MySQL：账号、文章、作品、日历、音乐元数据、配置等核心结构化数据。
- Redis：会话、缓存、限流和短期任务状态。
- 对象存储：图片、音频、附件和导出文件。
- MongoDB：仅用于明确需要文档模型和灵活结构的模块。

## 动效技术分层

- CSS 与 Vue Transition：轻量状态变化和页面过渡。
- GSAP 与 ScrollTrigger：复杂时间轴和滚动场景。
- Three.js 与 GLSL：3D、粒子、Shader 和图片变形。
- Rive：交互式矢量插画。
- Lenis：仅用于需要沉浸式平滑滚动的页面。

Three.js、Rive 和大体积动效模块必须动态导入，不能进入首屏主包。
