# API 约定

基础地址：`/api/v1`

## 系统健康检查

```http
GET /api/v1/system/health
```

响应示例：

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "service": "personal-website-api",
    "status": "UP",
    "timestamp": "2026-09-30T00:00:00Z"
  },
  "timestamp": "2026-09-30T00:00:00Z"
}
```

## 命名约定

- 资源路径使用复数名词，例如 `/posts`、`/projects`。
- 查询参数使用 camelCase，例如 `page`、`size`、`publishedAt`。
- 请求体与响应体使用 camelCase。
- 错误通过稳定的业务错误码区分，不能只依赖 HTTP 状态码。
