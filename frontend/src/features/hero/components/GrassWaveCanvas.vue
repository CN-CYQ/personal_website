<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

import { GrassWaveRenderer } from '@/features/hero/three/GrassWaveRenderer'

const container = ref<HTMLDivElement | null>(null)
let renderer: GrassWaveRenderer | null = null

onMounted(() => {
  if (!container.value) {
    return
  }

  try {
    renderer = new GrassWaveRenderer(container.value)
    renderer.start()
  } catch {
    container.value.classList.add('is-unavailable')
  }
})

onBeforeUnmount(() => {
  renderer?.dispose()
  renderer = null
})
</script>

<template>
  <div ref="container" class="grass-wave-canvas" aria-hidden="true" />
</template>

<style scoped>
.grass-wave-canvas {
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: transparent;
}

.grass-wave-canvas :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}

.grass-wave-canvas.is-unavailable {
  background:
    radial-gradient(circle at 82% 10%, rgb(255 248 214 / 60%), transparent 30%),
    linear-gradient(180deg, #b5d5e1 0%, #dde9e2 52%, #70ae8d 100%);
}
</style>
