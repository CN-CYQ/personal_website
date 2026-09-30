<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { getSystemHealth, type HealthStatus } from '@/api/system'

const health = ref<HealthStatus | null>(null)
const healthError = ref('')

const modules = [
  { name: 'Dashboard', description: '数据聚合与可视化' },
  { name: 'Portfolio', description: '个人作品与案例' },
  { name: 'Blog & Notes', description: '内容与笔记管理' },
  { name: 'Calendar', description: '日程与提醒' },
  { name: 'Weather', description: '天气数据与缓存' },
  { name: 'Music', description: '音乐点播与播放列表' },
]

onMounted(async () => {
  try {
    health.value = (await getSystemHealth()).data
  } catch {
    healthError.value = 'API 暂不可用'
  }
})
</script>

<template>
  <section class="overview">
    <div class="overview-heading">
      <p class="eyebrow">Project foundation</p>
      <h1>前后端架构已就绪</h1>
      <p class="overview-copy">
        当前页面用于验证项目骨架与 API 连通状态。业务模块将在后续迭代中逐步接入。
      </p>
    </div>

    <div class="status-panel">
      <span
        class="status-dot"
        :class="{ online: health?.status === 'UP', offline: healthError }"
        aria-hidden="true"
      />
      <div>
        <strong>{{ health?.status === 'UP' ? 'API online' : 'API pending' }}</strong>
        <p>{{ health?.service || healthError || '正在检查后端服务' }}</p>
      </div>
    </div>

    <div class="module-grid">
      <article v-for="module in modules" :key="module.name" class="module-card">
        <h2>{{ module.name }}</h2>
        <p>{{ module.description }}</p>
      </article>
    </div>
  </section>
</template>
