# 数据模型与数据库

> 文档状态：M0 目标模型  
> 最后更新：2026-10-01  
> 数据库：MySQL 8  
> 迁移：Flyway  
> 业务时区：Asia/Shanghai  
> 关联文档：[PRD.md](./PRD.md) · [ARCHITECTURE.md](./ARCHITECTURE.md) · [API.md](./API.md) · [AGENTS.md](./AGENTS.md)

## 1. 设计原则

- MySQL 是结构化业务数据的唯一真相。
- Redis 不作为永久数据源；会话和缓存均可重建。
- 所有时间在数据库中保存为 UTC `DATETIME(3)`，API 返回 ISO 8601 UTC 时间。
- 全天事件在 API 层以日期语义处理，入库时按 `Asia/Shanghai` 转为 UTC 起止边界。
- 主键使用 `BIGINT UNSIGNED` 自增，公开 URL 使用不可变 `slug`。
- 业务删除默认软删除；只有明确的管理操作才能物理删除。
- 所有表包含 `created_at`、`updated_at`，需要并发控制的表包含 `version`。
- 微信、第三方 API Key 等敏感配置不写入普通业务表；使用环境变量或加密设置表。
- JSON 列只保存非检索型扩展数据，标签和关系优先正规化。

## 2. 命名与类型约定

| 类型 | 约定 |
| --- | --- |
| 表名 | 小写复数，`snake_case` |
| 列名 | 小写，`snake_case` |
| 外键 | `<entity>_id` |
| 主键 | `id BIGINT UNSIGNED` |
| 字符串 | `VARCHAR`，必须明确长度 |
| 布尔 | `TINYINT(1)`，Java 映射 `Boolean` |
| 时间 | `DATETIME(3)`，UTC |
| 金额 | 本项目暂不使用 |
| JSON | MySQL `JSON`，必须记录结构版本 |
| 枚举 | `VARCHAR(32)`，使用稳定字符串值 |
| 乐观锁 | `version INT NOT NULL DEFAULT 0` |

## 3. 实体关系概览

```text
admin_user
site_setting

work ---< work_tag >--- tag
post ---< post_tag >--- tag
note ---< note_tag >--- tag

event
track ---< playlist_track >--- playlist
play_event >--- track

upload_asset
daily_metric
```

标签表由作品、博客和笔记共享；关联表区分领域。事件标签初期可使用规范化 `tag` 与 `event_tag`，若 M3 要快速上线，也可先存 `tags_json`，但 API 形状保持数组不变。

## 4. 表定义

### 4.1 admin_user

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | PK | 管理员 ID |
| username | VARCHAR(64) | UNIQUE, NOT NULL | 登录名 |
| password_hash | VARCHAR(100) | NOT NULL | BCrypt 哈希 |
| display_name | VARCHAR(80) | NOT NULL | 展示名 |
| role | VARCHAR(32) | NOT NULL | `ADMIN` |
| enabled | TINYINT(1) | NOT NULL | 是否启用 |
| last_login_at | DATETIME(3) | NULL | 最近登录 |
| version | INT | NOT NULL | 乐观锁 |
| created_at | DATETIME(3) | NOT NULL | 创建时间 |
| updated_at | DATETIME(3) | NOT NULL | 更新时间 |

索引：`uk_admin_user_username(username)`。

### 4.2 site_setting

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | PK | 设置 ID |
| setting_key | VARCHAR(100) | UNIQUE, NOT NULL | 设置键 |
| value_json | JSON | NOT NULL | 非敏感配置值 |
| is_public | TINYINT(1) | NOT NULL | 是否可返回公开接口 |
| updated_at | DATETIME(3) | NOT NULL | 更新时间 |

常用键：`site.title`、`site.defaultCity`、`weather.provider`、`dashboard.publicSections`。Secret 不允许放入 `value_json`。

### 4.3 tag

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | PK | 标签 ID |
| name | VARCHAR(50) | NOT NULL | 显示名 |
| slug | VARCHAR(60) | UNIQUE, NOT NULL | 稳定键 |
| created_at | DATETIME(3) | NOT NULL | 创建时间 |

约束：`UNIQUE(slug)`。

### 4.4 work

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | PK | 作品 ID |
| title | VARCHAR(160) | NOT NULL | 标题 |
| slug | VARCHAR(180) | UNIQUE, NOT NULL | URL slug |
| summary | VARCHAR(320) | NULL | 列表摘要 |
| description_md | MEDIUMTEXT | NOT NULL | Markdown 正文 |
| cover_asset_id | BIGINT UNSIGNED | NULL, FK | 封面 |
| tech_stack_json | JSON | NOT NULL | 技术栈数组 |
| links_json | JSON | NOT NULL | 外链和 GitHub |
| status | VARCHAR(24) | NOT NULL | `DRAFT`、`PUBLISHED`、`ARCHIVED` |
| sort_order | INT | NOT NULL | 人工排序 |
| published_at | DATETIME(3) | NULL | 发布时间 |
| deleted_at | DATETIME(3) | NULL | 软删除 |
| version | INT | NOT NULL | 乐观锁 |
| created_at | DATETIME(3) | NOT NULL | 创建时间 |
| updated_at | DATETIME(3) | NOT NULL | 更新时间 |

索引：

- `uk_work_slug(slug)`
- `idx_work_status_sort(status, sort_order, id)`
- `idx_work_published_at(published_at)`

### 4.5 work_tag

| 字段 | 类型 | 约束 |
| --- | --- | --- |
| work_id | BIGINT UNSIGNED | PK, FK work.id |
| tag_id | BIGINT UNSIGNED | PK, FK tag.id |

索引：`idx_work_tag_tag(tag_id, work_id)`。

### 4.6 post

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | PK | 博客 ID |
| title | VARCHAR(200) | NOT NULL | 标题 |
| slug | VARCHAR(220) | UNIQUE, NOT NULL | URL slug |
| excerpt | VARCHAR(500) | NULL | 摘要 |
| content_md | MEDIUMTEXT | NOT NULL | Markdown 原文 |
| content_html | MEDIUMTEXT | NULL | sanitize 后 HTML |
| content_hash | CHAR(64) | NULL | 防止重复渲染 |
| status | VARCHAR(24) | NOT NULL | `DRAFT`、`PUBLISHED`、`ARCHIVED` |
| published_at | DATETIME(3) | NULL | 发布时间 |
| deleted_at | DATETIME(3) | NULL | 软删除 |
| version | INT | NOT NULL | 乐观锁 |
| created_at | DATETIME(3) | NOT NULL | 创建时间 |
| updated_at | DATETIME(3) | NOT NULL | 更新时间 |

索引：

- `uk_post_slug(slug)`
- `idx_post_status_published(status, published_at)`
- `FULLTEXT idx_post_search(title, excerpt, content_md)`，仅 MySQL 全文检索可用时启用。

### 4.7 post_tag

| 字段 | 类型 | 约束 |
| --- | --- | --- |
| post_id | BIGINT UNSIGNED | PK, FK post.id |
| tag_id | BIGINT UNSIGNED | PK, FK tag.id |

索引：`idx_post_tag_tag(tag_id, post_id)`。

### 4.8 note

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | PK | 笔记 ID |
| title | VARCHAR(200) | NOT NULL | 标题 |
| content_md | MEDIUMTEXT | NOT NULL | Markdown 原文 |
| content_html | MEDIUMTEXT | NULL | sanitize 后 HTML |
| content_hash | CHAR(64) | NULL | 防止重复渲染 |
| is_public | TINYINT(1) | NOT NULL DEFAULT 0 | 第一版默认私密 |
| deleted_at | DATETIME(3) | NULL | 软删除 |
| version | INT | NOT NULL | 乐观锁 |
| created_at | DATETIME(3) | NOT NULL | 创建时间 |
| updated_at | DATETIME(3) | NOT NULL | 更新时间 |

索引：`idx_note_public_updated(is_public, updated_at)`。搜索接口默认排除私密笔记。

### 4.9 note_tag

| 字段 | 类型 | 约束 |
| --- | --- | --- |
| note_id | BIGINT UNSIGNED | PK, FK note.id |
| tag_id | BIGINT UNSIGNED | PK, FK tag.id |

### 4.10 event

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | PK | 事件 ID |
| title | VARCHAR(160) | NOT NULL | 标题 |
| description | VARCHAR(1000) | NULL | 描述 |
| start_at | DATETIME(3) | NOT NULL | UTC 起点，包含 |
| end_at | DATETIME(3) | NOT NULL | UTC 终点，不包含 |
| all_day | TINYINT(1) | NOT NULL | 全天标记 |
| color | VARCHAR(16) | NULL | UI 颜色 token 或十六进制 |
| is_public | TINYINT(1) | NOT NULL DEFAULT 0 | 是否公开 |
| tags_json | JSON | NOT NULL | 事件标签数组 |
| source | VARCHAR(24) | NOT NULL | `MANUAL`、`ICAL` |
| external_uid | VARCHAR(200) | NULL | 导入去重 |
| deleted_at | DATETIME(3) | NULL | 软删除 |
| version | INT | NOT NULL | 乐观锁 |
| created_at | DATETIME(3) | NOT NULL | 创建时间 |
| updated_at | DATETIME(3) | NOT NULL | 更新时间 |

索引：

- `idx_event_range(start_at, end_at)`
- `idx_event_public_range(is_public, start_at, end_at)`
- `uk_event_source_uid(source, external_uid)`，允许 `external_uid` 为空。

时间规则：

- `end_at` 必须大于 `start_at`。
- 全天事件 `start_at` 为本地日 00:00 对应的 UTC，`end_at` 为结束日次日的本地 00:00 对应 UTC。
- 查询区间使用半开区间 `[start, end)`。

### 4.11 upload_asset

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | PK | 资源 ID |
| storage_key | VARCHAR(500) | UNIQUE, NOT NULL | 对象存储键 |
| original_name | VARCHAR(255) | NOT NULL | 原始文件名 |
| mime_type | VARCHAR(100) | NOT NULL | 服务端识别类型 |
| byte_size | BIGINT UNSIGNED | NOT NULL | 文件大小 |
| sha256 | CHAR(64) | NOT NULL | 内容哈希 |
| kind | VARCHAR(24) | NOT NULL | `IMAGE`、`AUDIO`、`OTHER` |
| public_url | VARCHAR(1000) | NULL | 公开地址 |
| status | VARCHAR(24) | NOT NULL | `ACTIVE`、`DELETED` |
| created_at | DATETIME(3) | NOT NULL | 创建时间 |
| deleted_at | DATETIME(3) | NULL | 软删除 |

索引：`idx_upload_asset_kind_status(kind, status)`、`idx_upload_asset_sha256(sha256)`。

### 4.12 track

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | PK | 曲目 ID |
| title | VARCHAR(200) | NOT NULL | 标题 |
| artist | VARCHAR(200) | NOT NULL | 作者或演出者 |
| album | VARCHAR(200) | NULL | 专辑 |
| cover_asset_id | BIGINT UNSIGNED | NULL, FK | 封面 |
| audio_asset_id | BIGINT UNSIGNED | NULL, FK | 自有音频 |
| external_url | VARCHAR(1000) | NULL | 授权外链 |
| duration_seconds | INT | NULL | 时长 |
| rights_note | VARCHAR(500) | NOT NULL | 授权说明 |
| status | VARCHAR(24) | NOT NULL | `DRAFT`、`PUBLISHED`、`ARCHIVED` |
| sort_order | INT | NOT NULL | 排序 |
| created_at | DATETIME(3) | NOT NULL | 创建时间 |
| updated_at | DATETIME(3) | NOT NULL | 更新时间 |

约束：`audio_asset_id` 与 `external_url` 至少有一个；发布状态必须有 `rights_note`。

### 4.13 playlist

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | PK | 播放列表 ID |
| name | VARCHAR(160) | NOT NULL | 名称 |
| slug | VARCHAR(180) | UNIQUE, NOT NULL | URL slug |
| description | VARCHAR(500) | NULL | 描述 |
| status | VARCHAR(24) | NOT NULL | `DRAFT`、`PUBLISHED` |
| sort_order | INT | NOT NULL | 排序 |
| created_at | DATETIME(3) | NOT NULL | 创建时间 |
| updated_at | DATETIME(3) | NOT NULL | 更新时间 |

### 4.14 playlist_track

| 字段 | 类型 | 约束 |
| --- | --- | --- |
| playlist_id | BIGINT UNSIGNED | PK, FK playlist.id |
| track_id | BIGINT UNSIGNED | PK, FK track.id |
| sort_order | INT | NOT NULL |

索引：`idx_playlist_track_order(playlist_id, sort_order)`。

### 4.15 play_event

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | PK | 播放事件 ID |
| track_id | BIGINT UNSIGNED | FK, NOT NULL | 曲目 |
| session_key | CHAR(32) | NULL | 匿名会话键，不保存原始 IP |
| played_at | DATETIME(3) | NOT NULL | 播放时间 |
| source | VARCHAR(24) | NOT NULL | `WEB` 等来源 |

索引：`idx_play_event_track_time(track_id, played_at)`。

保留策略：原始播放事件保留 90 天；聚合计数可长期保存。不得保存可识别的原始 IP。

### 4.16 daily_metric

用于看板趋势和外部指标快照。

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| id | BIGINT UNSIGNED | PK | 指标 ID |
| metric_date | DATE | NOT NULL | 日期 |
| metric_key | VARCHAR(100) | NOT NULL | 指标键 |
| value_json | JSON | NOT NULL | 指标值 |
| source | VARCHAR(50) | NOT NULL | `INTERNAL`、`GITHUB` 等 |
| collected_at | DATETIME(3) | NOT NULL | 采集时间 |

约束：`UNIQUE(metric_date, metric_key, source)`。

## 5. Redis 键

| 键 | 类型 | TTL | 说明 |
| --- | --- | --- | --- |
| `v1:session:{sessionId}` | Hash/String | 会话有效期 | Spring Session |
| `v1:weather:{city}:{locale}` | JSON | 30m | 天气快照 |
| `v1:dashboard:public` | JSON | 60s | 公开摘要 |
| `v1:dashboard:full` | JSON | 60s | 完整摘要 |
| `v1:login:fail:{usernameHash}` | Counter | 15m | 登录限流 |
| `v1:rate:{route}:{clientHash}` | Counter | 1m | 公共接口限流 |

Redis Key 不使用原始用户名、邮箱或 IP 作为后缀。

## 6. Flyway 迁移规范

目录：

```text
backend/src/main/resources/db/migration/
|-- V1__baseline.sql
|-- V2__create_auth_and_settings.sql
|-- V3__create_content_tables.sql
|-- V4__create_calendar_tables.sql
|-- V5__create_music_tables.sql
`-- V6__create_metrics.sql
```

规则：

- 已执行迁移不可修改，只新增版本。
- 每个迁移必须可在空库从头执行。
- DDL 和必要的数据回填分离到独立迁移，避免长事务。
- 删除列或表必须经过至少一个发布周期。
- 生产迁移前必须备份，部署时记录 Flyway 版本。
- 迁移变更必须同步本文件。

命名示例：

```text
V7__add_public_flag_to_event.sql
V8__create_post_fulltext_index.sql
```

## 7. 事务与并发

- 内容写操作使用事务，并检查 `version`。
- 乐观锁冲突返回 `409 RESOURCE_CONFLICT`。
- 删除作品、博客、曲目前先检查引用。
- 播放计数使用轻量写入或异步聚合，不阻塞播放器。
- 仪表盘聚合只读，失败降级到最近缓存或空状态。
- 外部 API 调用不在数据库事务中执行。

## 8. 查询与性能

- 公开列表只查询已发布/启用数据，并为状态加排序索引。
- 日历范围查询必须同时使用 `start_at` 和 `end_at`。
- 标签筛选先通过关联表过滤，再关联内容表。
- 搜索初期使用 MySQL FULLTEXT；如果中文分词不足，再评估 Elasticsearch/OpenSearch。
- 后台列表默认分页 20 条，公开列表默认 12 条。
- 详情页按 slug 查询，slug 是唯一索引。
- 大字段 `content_md`、`content_html` 不出现在列表查询中。

## 9. 备份与恢复

- MySQL 每日全量备份，保留周期按部署平台决定。
- 重要发布前执行一次额外备份。
- Redis 只保存可重建数据，不要求逐条恢复。
- 对象存储启用版本或误删保护。
- 至少每季度执行一次恢复演练，记录 RPO 和 RTO。