<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

import HorizontalGlassNav from '@/components/navigation/HorizontalGlassNav.vue'
</script>

<template>
  <div class="app-shell">
    <header class="site-header">
      <RouterLink class="brand" to="/" aria-label="返回首页">
        <span class="brand-mark">CY</span>
        <span class="brand-name">CN-CYQ</span>
      </RouterLink>

      <HorizontalGlassNav />

      <div class="site-status">
        <span class="site-status__dot" aria-hidden="true" />
        <span>Personal system</span>
      </div>
    </header>

    <main class="site-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.site-main {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.brand,
.site-status {
  position: relative;
  z-index: 2;
}
</style>