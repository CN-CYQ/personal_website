# Features

业务功能按领域放在独立目录中：

```text
features/<domain>/
├─ api/
├─ components/
├─ composables/
├─ motion/
├─ pages/
├─ stores/
└─ types/
```

仅为该领域使用的代码保持在领域目录内。至少被两个领域复用的代码再提升到
`src/components`、`src/composables` 或 `src/utils`。
