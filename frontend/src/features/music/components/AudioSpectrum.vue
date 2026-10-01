<script setup lang="ts">
import type { CSSProperties } from 'vue'

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

function barStyle(height: number, index: number): CSSProperties {
  return {
    '--spectrum-height': `${height}%`,
    '--spectrum-delay': `${(index % 9) * -0.14}s`,
    '--spectrum-duration': `${1.05 + (index % 5) * 0.13}s`,
    '--spectrum-playing-duration': `${
      (1.05 + (index % 5) * 0.13) * 0.78
    }s`,
    '--spectrum-drift': `${(index % 4) * 2 - 3}deg`,
  } as CSSProperties
}
</script>

<template>
  <div
    class="audio-spectrum"
    :class="{ 'is-playing': props.isPlaying }"
    aria-hidden="true"
  >
    <span
      v-for="(height, index) in props.bars.length > 0
        ? props.bars
        : fallbackBars"
      :key="index"
      class="audio-spectrum__bar"
      :style="barStyle(height, index)"
    />
  </div>
</template>

<style scoped>
.audio-spectrum {
  display: flex;
  width: 100%;
  height: 50px;
  align-items: center;
  justify-content: space-between;
  gap: 3px;
}

.audio-spectrum__bar {
  width: 2px;
  height: var(--spectrum-height);
  min-height: 5px;
  flex: 0 0 2px;
  border-radius: 999px;
  background: rgb(241 252 255 / 92%);
  box-shadow: 0 0 10px rgb(205 244 249 / 18%);
  opacity: 0.9;
  animation: spectrum-pulse var(--spectrum-duration) ease-in-out infinite
    alternate;
  animation-delay: var(--spectrum-delay);
  transform-origin: center;
  transition:
    background-color 180ms ease,
    box-shadow 180ms ease,
    opacity 180ms ease;
}

.audio-spectrum.is-playing .audio-spectrum__bar {
  animation-duration: var(--spectrum-playing-duration);
}

.audio-spectrum.is-playing .audio-spectrum__bar:nth-child(3n) {
  box-shadow:
    0 0 9px rgb(182 238 244 / 32%),
    0 0 20px rgb(77 208 225 / 12%);
  opacity: 1;
}

@keyframes spectrum-pulse {
  0% {
    transform: scaleY(0.42) skewX(var(--spectrum-drift));
  }

  55% {
    transform: scaleY(0.86) skewX(0deg);
  }

  100% {
    transform: scaleY(1) skewX(var(--spectrum-drift));
  }
}

@media (max-width: 480px) {
  .audio-spectrum {
    height: 44px;
    gap: 2px;
  }

  .audio-spectrum__bar {
    width: 1.5px;
    flex-basis: 1.5px;
  }
}

@media (max-height: 700px) and (max-width: 720px) {
  .audio-spectrum {
    height: 36px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .audio-spectrum__bar {
    animation: none;
  }

  .audio-spectrum__bar {
    transition: none;
  }
}
</style>
