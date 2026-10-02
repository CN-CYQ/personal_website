<script setup lang="ts">
import { RouterView } from 'vue-router'

import HorizontalGlassNav from '@/components/navigation/HorizontalGlassNav.vue'
</script>

<template>
  <div class="app-shell">
    <header class="site-header">
      <HorizontalGlassNav />
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
  min-height: 100dvh;
}

.site-main {
  flex: 1;
  min-height: 0;
}
</style>
