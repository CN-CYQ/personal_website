# AGENTS.md

本项目的完整 Agent 规则位于 [docs/AGENTS.md](docs/AGENTS.md)。开始任务前必须先阅读该文件、[docs/PRD.md](docs/PRD.md)、[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)、[docs/API.md](docs/API.md) 和目标任务卡。

最低要求：

1. 先给出任务实现计划和验收方式，默认等待确认后再修改代码。
2. 只修改任务相关文件，不覆盖用户现有改动。
3. 不新增依赖，除非先说明理由和替代方案。
4. Secret 不进入源码、前端、日志或 Git。
5. Markdown 必须 sanitize，数据库变更必须提供 Flyway migration。
6. 完成后运行相关测试，并输出变更摘要、测试结果和遗留风险。

常用命令：

```powershell
cd frontend
npm run typecheck
npm run test
npm run build
```

```powershell
cd backend
.\mvnw.cmd test
.\mvnw.cmd package
```