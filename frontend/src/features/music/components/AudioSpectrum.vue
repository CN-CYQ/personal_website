<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    bars?: number[]
    isPlaying?: boolean
  }>(),
  {
    bars: () => [],
    isPlaying: false,
  },
)

const fallbackBars = [
  24, 31, 38, 29, 46, 57, 43, 66, 54, 74, 62, 84, 70, 91, 78, 98, 86, 100,
  86, 98, 78, 91, 70, 84, 62, 74, 54, 66, 43, 57, 46, 29, 38, 31, 24, 20,
]

const canvas = ref<HTMLCanvasElement | null>(null)
let context: CanvasRenderingContext2D | null = null
let animationFrame: number | undefined
let resizeObserver: ResizeObserver | undefined
let intersectionObserver: IntersectionObserver | undefined
let lastDrawTime = 0
let isVisible = true
let reduceMotion = false
let canvasWidth = 0
let canvasHeight = 0

function resolvedBars() {
  return props.bars.length > 0 ? props.bars : fallbackBars
}

function resizeCanvas() {
  const element = canvas.value
  const bounds = element?.getBoundingClientRect()
  const width = bounds?.width ?? 0
  const height = bounds?.height ?? 0

  if (!element || width === 0 || height === 0) {
    return false
  }

  const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
  const renderWidth = Math.max(1, Math.round(width * pixelRatio))
  const renderHeight = Math.max(1, Math.round(height * pixelRatio))

  if (
    element.width !== renderWidth ||
    element.height !== renderHeight
  ) {
    element.width = renderWidth
    element.height = renderHeight
    context = element.getContext('2d')
    context?.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
  }

  canvasWidth = width
  canvasHeight = height

  return true
}

function drawSpectrum(time: number, animate: boolean) {
  if (!context || canvasWidth === 0 || canvasHeight === 0) {
    return
  }

  const width = canvasWidth
  const height = canvasHeight
  const bars = resolvedBars()
  const barWidth = Math.max(1.5, Math.min(2.5, width / bars.length * 0.42))
  const gap = bars.length > 1
    ? (width - bars.length * barWidth) / (bars.length - 1)
    : 0
  const centerY = height / 2

  context.clearRect(0, 0, width, height)
  context.fillStyle = props.isPlaying
    ? 'rgb(244 253 255 / 94%)'
    : 'rgb(241 252 255 / 84%)'

  for (let index = 0; index < bars.length; index += 1) {
    const bar = bars[index] ?? 0
    const phase = index * 0.83
    const pulse = animate
      ? 0.46 +
        (Math.sin(time * 0.0021 + phase) * 0.5 + 0.5) * 0.54
      : 1
    const secondary = animate
      ? Math.sin(time * 0.0013 + phase * 1.7) * 0.08
      : 0
    const normalizedHeight = Math.max(
      0.08,
      Math.min(1, bar / 100 + secondary),
    )
    const barHeight = Math.max(3, height * normalizedHeight * pulse)
    const x = index * (barWidth + gap)
    const y = centerY - barHeight / 2

    context.fillRect(x, y, barWidth, barHeight)
  }
}

function stopAnimation() {
  if (animationFrame !== undefined) {
    window.cancelAnimationFrame(animationFrame)
    animationFrame = undefined
  }
}

function startAnimation() {
  stopAnimation()

  if (
    reduceMotion ||
    !isVisible ||
    document.visibilityState !== 'visible' ||
    !props.isPlaying
  ) {
    drawSpectrum(performance.now(), false)
    return
  }

  const isCompact = window.matchMedia('(max-width: 720px)').matches
  const frameInterval = 1000 / (isCompact ? 24 : 30)

  function frame(time: number) {
    if (time - lastDrawTime >= frameInterval) {
      lastDrawTime = time
      drawSpectrum(time, true)
    }

    animationFrame = window.requestAnimationFrame(frame)
  }

  animationFrame = window.requestAnimationFrame(frame)
}

function handleVisibilityChange() {
  isVisible = document.visibilityState === 'visible'

  if (isVisible) {
    startAnimation()
  } else {
    stopAnimation()
  }
}

function handleResize() {
  resizeCanvas()
  drawSpectrum(performance.now(), props.isPlaying && !reduceMotion)
}

onMounted(() => {
  reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches
  resizeObserver = new ResizeObserver(handleResize)
  intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      isVisible = Boolean(entry?.isIntersecting)

      if (isVisible) {
        startAnimation()
      } else {
        stopAnimation()
      }
    },
    { threshold: 0.05 },
  )

  if (canvas.value) {
    resizeObserver.observe(canvas.value)
    intersectionObserver.observe(canvas.value)
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)
  handleResize()
  startAnimation()
})

watch(
  () => props.isPlaying,
  () => {
    lastDrawTime = 0
    startAnimation()
  },
)

watch(
  () => props.bars,
  () => {
    drawSpectrum(performance.now(), props.isPlaying && !reduceMotion)
  },
)

onBeforeUnmount(() => {
  stopAnimation()
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <div class="audio-spectrum" aria-hidden="true">
    <canvas ref="canvas" class="audio-spectrum__canvas" />
  </div>
</template>

<style scoped>
.audio-spectrum {
  width: 100%;
  height: 50px;
  contain: layout style;
}

.audio-spectrum__canvas {
  display: block;
  width: 100%;
  height: 100%;
}

@media (max-width: 480px) {
  .audio-spectrum {
    height: 44px;
  }
}

@media (max-height: 700px) and (max-width: 720px) {
  .audio-spectrum {
    height: 36px;
  }
}
</style>
