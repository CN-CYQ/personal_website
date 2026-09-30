# Backend

Spring Boot API 服务。

## 技术栈

- Java 21
- Spring Boot 3.5
- Maven

## 本地运行

```powershell
mvn spring-boot:run
```

服务默认运行在 `http://localhost:8080`。

## 目录约定

业务代码位于 `src/main/java/com/cncyq/personalwebsite/modules`，按业务领域
组织 Controller、Service、Repository、DTO 和 Entity。
