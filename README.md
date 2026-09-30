# Personal Website

个人网站项目采用前后端分离的单仓库结构：

- `frontend`: Vue 3、TypeScript、Vite、Pinia、Vue Router
- `backend`: Java 21、Spring Boot、Maven
- `docs`: 需求、架构和接口文档
- `deploy`: Docker Compose、Nginx 和部署示例

## 目录结构

```text
personal_website/
├─ frontend/
├─ backend/
├─ docs/
├─ deploy/
├─ scripts/
├─ .editorconfig
├─ .gitattributes
├─ .gitignore
└─ README.md
```

## 本地开发

### 前端

```powershell
cd frontend
npm install
npm run dev
```

开发服务器默认运行在 `http://localhost:5173`，并将 `/api` 请求代理到
`http://localhost:8080`。

### 后端

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

如果本机尚未安装 Maven Wrapper，可先使用系统 Maven：

```powershell
cd backend
mvn spring-boot:run
```

后端默认运行在 `http://localhost:8080`，健康检查地址为
`http://localhost:8080/api/v1/system/health`。

## 环境要求

- Node.js 22 或更高版本
- JDK 21
- Maven 3.9 或更高版本
- MySQL 8

Redis、MongoDB 和对象存储将在对应功能进入开发阶段时启用。
