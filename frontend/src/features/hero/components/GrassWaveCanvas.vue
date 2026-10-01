<script setup lang="ts">
import { onBeforeUnmount, onMounted, onUnmounted, ref, watch } from 'vue'

import { useAppStore } from '@/stores/app'
import { GrassWaveRenderer } from '@/features/hero/three/GrassWaveRenderer'

const store = useAppStore()
const container = ref<HTMLDivElement | null>(null)
const fireflyCanvas = ref<HTMLCanvasElement | null>(null)
let renderer: GrassWaveRenderer | null = null
let fireflyAnimationId = 0

interface Firefly {
  x: number
  y: number
  radius: number
  glowRadius: number
  speedX: number
  speedY: number
  phase: number
  phaseSpeed: number
  baseAlpha: number
  driftTargetX: number
  driftTargetY: number
  driftTimer: number
}

const FIREFLY_COUNT = 45
const fireflies: Firefly[] = []

function createFireflies(width: number, height: number) {
  fireflies.length = 0
  for (let i = 0; i < FIREFLY_COUNT; i += 1) {
    fireflies.push({
      x: Math.random() * width,
      y: Math.random() * height * 0.65 + height * 0.15,
      radius: 1.2 + Math.random() * 1.8,
      glowRadius: 6 + Math.random() * 14,
      speedX: (Math.random() - 0.5) * 0.6,
      speedY: (Math.random() - 0.5) * 0.4 - 0.15,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 0.02 + Math.random() * 0.04,
      baseAlpha: 0.3 + Math.random() * 0.5,
      driftTargetX: 0,
      driftTargetY: 0,
      driftTimer: 0,
    })
  }
}

function drawFireflies(context: CanvasRenderingContext2D, width: number, height: number) {
  context.clearRect(0, 0, width, height)
  const isDark = store.theme === 'dark'

  if (!isDark) return

  for (const f of fireflies) {
    f.phase += f.phaseSpeed
    const alpha = f.baseAlpha * (0.5 + 0.5 * Math.sin(f.phase))

    f.driftTimer -= 1
    if (f.driftTimer <= 0) {
      f.driftTargetX = (Math.random() - 0.5) * 60
      f.driftTargetY = (Math.random() - 0.5) * 40
      f.driftTimer = 60 + Math.random() * 120
    }
    f.speedX += (f.driftTargetX * 0.0003 - f.speedX) * 0.02
    f.speedY += (f.driftTargetY * 0.0003 - f.speedY) * 0.02
    f.x += f.speedX
    f.y += f.speedY

    if (f.x < -20) f.x = width + 20
    if (f.x > width + 20) f.x = -20
    if (f.y < -20) f.y = height + 20
    if (f.y > height + 20) f.y = -20

    const glowGradient = context.createRadialGradient(
      f.x, f.y, 0,
      f.x, f.y, f.glowRadius,
    )
    glowGradient.addColorStop(0, `rgba(160, 220, 255, ${alpha * 0.85})`)
    glowGradient.addColorStop(0.15, `rgba(140, 200, 240, ${alpha * 0.55})`)
    glowGradient.addColorStop(0.4, `rgba(100, 170, 220, ${alpha * 0.16})`)
    glowGradient.addColorStop(1, 'rgba(60, 120, 180, 0)')

    context.beginPath()
    context.arc(f.x, f.y, f.glowRadius, 0, Math.PI * 2)
    context.fillStyle = glowGradient
    context.fill()

    context.beginPath()
    context.arc(f.x, f.y, f.radius, 0, Math.PI * 2)
    context.fillStyle = `rgba(200, 240, 255, ${Math.min(alpha * 1.2, 0.85)})`
    context.fill()
  }
}

function startFireflyLoop() {
  if (!fireflyCanvas.value) return
  const canvas = fireflyCanvas.value
  const context = canvas.getContext('2d', { alpha: true })
  if (!context) return

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const resize = () => {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    context.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (fireflies.length === 0) {
      createFireflies(w, h)
    }
  }
  resize()
  window.addEventListener('resize', resize)

  const animate = () => {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (w !== canvas.width / dpr || h !== canvas.height / dpr) {
      resize()
    }
    drawFireflies(context, w, h)
    fireflyAnimationId = requestAnimationFrame(animate)
  }
  fireflyAnimationId = requestAnimationFrame(animate)
}

onMounted(() => {
  if (container.value) {
    try {
      renderer = new GrassWaveRenderer(container.value)
      renderer.setDarkMode(store.theme === 'dark')
      renderer.start()
    } catch {
      container.value.classList.add('is-unavailable')
    }
  }
  startFireflyLoop()
})

onBeforeUnmount(() => {
  renderer?.dispose()
  renderer = null
  cancelAnimationFrame(fireflyAnimationId)
})

const stopWatch = watch(
  () => store.theme,
  (theme) => {
    renderer?.setDarkMode(theme === 'dark')
  },
)

onUnmounted(() => {
  stopWatch()
})
</script>

<template>
  <div ref="container" class="grass-wave-canvas" aria-hidden="true" />
  <canvas ref="fireflyCanvas" class="firefly-canvas" aria-hidden="true" />
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

.firefly-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}
</style>