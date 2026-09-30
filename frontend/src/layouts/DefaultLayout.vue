<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app-shell">
    <header class="site-header">
      <RouterLink class="brand" to="/" aria-label="返回首页">
        <span class="brand-mark">CY</span>
        <span class="brand-name">CN-CYQ</span>
      </RouterLink>

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
