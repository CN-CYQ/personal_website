<script setup lang="ts">
import { onBeforeUnmount, onMounted, onUnmounted, ref, watch } from 'vue'

import { useAppStore } from '@/stores/app'

const store = useAppStore()
const container = ref<HTMLDivElement | null>(null)
const fireflyCanvas = ref<HTMLCanvasElement | null>(null)

let renderer: {
  dispose: () => void
  pause: () => void
  resume: () => void
  setDarkMode: (isDark: boolean) => void
  start: () => void
} | null = null

let fireflyAnimationId = 0
let fireflyRunning = false
let fireflySprite: HTMLCanvasElement | null = null
let heroVisible = true
let pageVisible = !document.hidden
let scrollRafId = 0
let isDisposed = false

const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)',
).matches

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
const FIREFLY_SPRITE_SIZE = 64
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

// Bake the glow once instead of allocating a radial gradient per firefly per frame.
function buildFireflySprite() {
  const canvas = document.createElement('canvas')
  const size = FIREFLY_SPRITE_SIZE
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')

  if (!context) {
    return null
  }

  const radius = size / 2
  const gradient = context.createRadialGradient(
    radius,
    radius,
    0,
    radius,
    radius,
    radius,
  )
  gradient.addColorStop(0, 'rgba(160, 220, 255, 0.85)')
  gradient.addColorStop(0.15, 'rgba(140, 200, 240, 0.55)')
  gradient.addColorStop(0.4, 'rgba(100, 170, 220, 0.16)')
  gradient.addColorStop(1, 'rgba(60, 120, 180, 0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, size, size)

  return canvas
}

function drawFireflies(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  context.clearRect(0, 0, width, height)

  if (store.theme !== 'dark') {
    return
  }

  const sprite = fireflySprite

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

    if (sprite) {
      const size = f.glowRadius * 2
      context.globalAlpha = alpha
      context.drawImage(sprite, f.x - f.glowRadius, f.y - f.glowRadius, size, size)
    }

    context.globalAlpha = Math.min(alpha * 1.2, 0.85)
    context.beginPath()
    context.arc(f.x, f.y, f.radius, 0, Math.PI * 2)
    context.fillStyle = 'rgba(200, 240, 255, 1)'
    context.fill()
  }

  context.globalAlpha = 1
}

function clearFireflyCanvas() {
  const canvas = fireflyCanvas.value
  const context = canvas?.getContext('2d', { alpha: true })

  if (!canvas || !context) return

  context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
}

function resizeFireflyCanvas(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  dpr: number,
) {
  const width = canvas.clientWidth
  const height = canvas.clientHeight
  canvas.width = width * dpr
  canvas.height = height * dpr
  context.setTransform(dpr, 0, 0, dpr, 0, 0)

  if (fireflies.length === 0) {
    createFireflies(width, height)
  }
}

function startFireflyLoop() {
  if (fireflyRunning) return

  const canvas = fireflyCanvas.value
  const context = canvas?.getContext('2d', { alpha: true })

  if (!canvas || !context) return

  fireflySprite ??= buildFireflySprite()

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  resizeFireflyCanvas(canvas, context, dpr)

  const animate = () => {
    const width = canvas.clientWidth
    const height = canvas.clientHeight

    if (width !== canvas.width / dpr || height !== canvas.height / dpr) {
      resizeFireflyCanvas(canvas, context, dpr)
    }

    drawFireflies(context, width, height)
    fireflyAnimationId = requestAnimationFrame(animate)
  }

  fireflyRunning = true
  fireflyAnimationId = requestAnimationFrame(animate)
}

function stopFireflyLoop() {
  if (!fireflyRunning) return

  fireflyRunning = false
  cancelAnimationFrame(fireflyAnimationId)
  fireflyAnimationId = 0
}

function syncFireflyLoop() {
  const shouldRun =
    store.theme === 'dark' && heroVisible && pageVisible && !prefersReducedMotion

  if (shouldRun) {
    startFireflyLoop()
    return
  }

  stopFireflyLoop()

  if (store.theme !== 'dark') {
    clearFireflyCanvas()
  }
}

function syncHeroLoop() {
  if (!renderer) return

  if (heroVisible && pageVisible) {
    renderer.resume()
  } else {
    renderer.pause()
  }
}

function updateHeroVisibility() {
  // The hero stage is sticky, so it stays inside the viewport for the whole
  // scroll. Position against the page transition instead: the meadow has fully
  // faded out once the content area has scrolled one hero height past the top.
  const stage = container.value?.closest('.home-page__hero-stage') as
    | HTMLElement
    | null
  const heroDistance = stage?.clientHeight ?? Math.max(window.innerHeight, 1)

  heroVisible = (window.scrollY || window.pageYOffset) < heroDistance * 0.94
  syncHeroLoop()
  syncFireflyLoop()
}

function handleScroll() {
  if (scrollRafId) return

  scrollRafId = requestAnimationFrame(() => {
    scrollRafId = 0
    updateHeroVisibility()
  })
}

function handleVisibilityChange() {
  pageVisible = !document.hidden
  syncHeroLoop()
  syncFireflyLoop()
}

onMounted(async () => {
  if (container.value) {
    try {
      const { GrassWaveRenderer } = await import('../three/GrassWaveRenderer')

      if (isDisposed || !container.value) {
        return
      }

      renderer = new GrassWaveRenderer(container.value)
      renderer.setDarkMode(store.theme === 'dark')
      renderer.start()
    } catch {
      container.value?.classList.add('is-unavailable')
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', updateHeroVisibility)
  updateHeroVisibility()
  syncFireflyLoop()
})

onBeforeUnmount(() => {
  isDisposed = true
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', updateHeroVisibility)
  cancelAnimationFrame(scrollRafId)
  scrollRafId = 0
  stopFireflyLoop()
  fireflySprite = null
  renderer?.dispose()
  renderer = null
})

const stopWatch = watch(
  () => store.theme,
  (theme) => {
    renderer?.setDarkMode(theme === 'dark')
    syncFireflyLoop()
  },
)

onUnmounted(() => {
  stopWatch()
})
</script>

<template>
  <div ref="container" class="grass-wave-canvas" aria-hidden="true" />
  <canvas
    ref="fireflyCanvas"
    class="firefly-canvas"
    :class="{ 'is-active': store.theme === 'dark' }"
    aria-hidden="true"
  />
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
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
  z-index: 2;
}

.firefly-canvas.is-active {
  opacity: 1;
  visibility: visible;
}
</style>
