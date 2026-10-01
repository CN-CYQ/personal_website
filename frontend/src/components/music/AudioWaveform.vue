<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    bars?: number[]
    currentTime?: number
    duration: number
  }>(),
  {
    bars: () => [],
    currentTime: 0,
  },
)

const emit = defineEmits<{
  scrub: [value: number]
}>()

const rootElement = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const displayedProgress = ref(0)

const resolvedBars = computed(() =>
  props.bars.length > 0
    ? props.bars
    : Array.from({ length: 32 }, (_, index) => 24 + (index % 7) * 8),
)

const sourceProgress = computed(() =>
  props.duration > 0
    ? Math.min(Math.max((props.currentTime ?? 0) / props.duration, 0), 1)
    : 0,
)

displayedProgress.value = sourceProgress.value

watch(sourceProgress, (value) => {
  if (!isDragging.value) {
    displayedProgress.value = value
  }
})

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return '00:00'
  }

  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value % 60)

  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`
}

function setProgressFromPointer(event: PointerEvent) {
  const bounds = rootElement.value?.getBoundingClientRect()

  if (!bounds || bounds.width === 0) {
    return
  }

  displayedProgress.value = Math.min(
    Math.max((event.clientX - bounds.left) / bounds.width, 0),
    1,
  )
}

function handlePointerDown(event: PointerEvent) {
  isDragging.value = true
  event.currentTarget instanceof HTMLElement &&
    event.currentTarget.setPointerCapture(event.pointerId)
  setProgressFromPointer(event)
}

function handlePointerMove(event: PointerEvent) {
  if (isDragging.value) {
    setProgressFromPointer(event)
  }
}

function finishPointerInteraction(event: PointerEvent) {
  if (!isDragging.value) {
    return
  }

  setProgressFromPointer(event)
  isDragging.value = false

  if (
    event.currentTarget instanceof HTMLElement &&
    event.currentTarget.hasPointerCapture(event.pointerId)
  ) {
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  emit('scrub', displayedProgress.value * props.duration)
}

function handleKeydown(event: KeyboardEvent) {
  const step = 0.05
  let nextProgress = displayedProgress.value

  if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
    nextProgress += step
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
    nextProgress -= step
  } else if (event.key === 'Home') {
    nextProgress = 0
  } else if (event.key === 'End') {
    nextProgress = 1
  } else {
    return
  }

  event.preventDefault()
  displayedProgress.value = Math.min(Math.max(nextProgress, 0), 1)
  emit('scrub', displayedProgress.value * props.duration)
}
</script>

<template>
  <section
    ref="rootElement"
    class="audio-waveform"
    aria-label="播放进度"
    role="slider"
    tabindex="0"
    :aria-valuemin="0"
    :aria-valuemax="100"
    :aria-valuenow="Math.round(displayedProgress * 100)"
    :aria-valuetext="`${formatTime(displayedProgress * duration)} / ${formatTime(duration)}`"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="finishPointerInteraction"
    @pointercancel="finishPointerInteraction"
    @keydown="handleKeydown"
  >
    <div class="audio-waveform__bars">
      <span
        v-for="(bar, index) in resolvedBars"
        :key="index"
        class="audio-waveform__bar"
        :class="{
          'is-played':
            (index + 0.5) / resolvedBars.length <= displayedProgress,
        }"
        :style="{ height: `${bar}%` }"
      />
    </div>

    <div class="audio-waveform__rail" aria-hidden="true">
      <span
        class="audio-waveform__rail-fill"
        :style="{ transform: `scaleX(${displayedProgress})` }"
      />
      <span
        class="audio-waveform__thumb"
        :style="{ left: `${displayedProgress * 100}%` }"
      />
    </div>

    <div class="audio-waveform__time-row">
      <span>{{ formatTime(displayedProgress * duration) }}</span>
      <span>{{ formatTime(duration) }}</span>
    </div>
  </section>
</template>

<style scoped>
.audio-waveform {
  display: grid;
  gap: 10px;
  outline: none;
  cursor: ew-resize;
  touch-action: none;
  user-select: none;
}

.audio-waveform__time-row {
  display: flex;
  justify-content: space-between;
  color: rgb(243 251 255 / 74%);
  font-size: 0.72rem;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.03em;
  transition: color 180ms ease;
}

.audio-waveform__bars {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  gap: clamp(2px, 0.36vw, 5px);
}

.audio-waveform__bar {
  width: clamp(2px, 0.28vw, 4px);
  min-height: 5px;
  border-radius: 999px;
  background: rgb(226 243 250 / 22%);
  transition:
    background-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

.audio-waveform__bar.is-played {
  background: rgb(248 253 255 / 94%);
  box-shadow:
    0 0 10px rgb(232 251 255 / 46%),
    0 0 24px rgb(176 229 250 / 16%);
}

.audio-waveform__rail {
  position: relative;
  height: 4px;
  margin: 1px 1px 0;
  border-radius: 999px;
  background: rgb(226 243 250 / 18%);
  box-shadow: inset 0 1px 1px rgb(0 25 42 / 28%);
}

.audio-waveform__rail-fill {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(90deg, #87c9e8, #f8fdff);
  box-shadow: 0 0 14px rgb(195 240 255 / 32%);
  transform-origin: left center;
}

.audio-waveform__thumb {
  position: absolute;
  top: 50%;
  width: 14px;
  height: 14px;
  border: 2px solid rgb(255 255 255 / 90%);
  border-radius: 50%;
  background: rgb(122 190 221 / 92%);
  box-shadow:
    0 0 0 5px rgb(206 239 251 / 12%),
    0 0 18px rgb(200 240 255 / 46%);
  transform: translate(-50%, -50%) scale(0.78);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease;
}

.audio-waveform:hover .audio-waveform__time-row,
.audio-waveform:focus-visible .audio-waveform__time-row {
  color: rgb(250 254 255 / 92%);
}

.audio-waveform:hover .audio-waveform__bar {
  background: rgb(232 247 252 / 38%);
}

.audio-waveform:hover .audio-waveform__bar.is-played {
  background: #fff;
}

.audio-waveform:hover .audio-waveform__thumb,
.audio-waveform:focus-visible .audio-waveform__thumb,
.audio-waveform:active .audio-waveform__thumb {
  box-shadow:
    0 0 0 7px rgb(206 239 251 / 16%),
    0 0 24px rgb(208 242 255 / 64%);
  transform: translate(-50%, -50%) scale(1);
}

.audio-waveform:focus-visible {
  border-radius: 12px;
  outline: 1px solid rgb(226 250 255 / 72%);
  outline-offset: 12px;
}

@media (max-width: 640px) {
  .audio-waveform__time-row {
    font-size: 0.7rem;
  }

  .audio-waveform__bars {
    height: 44px;
    gap: 2px;
  }

  .audio-waveform__bar {
    width: 2px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .audio-waveform__bar,
  .audio-waveform__time-row,
  .audio-waveform__thumb {
    transition: none;
  }
}
</style>
