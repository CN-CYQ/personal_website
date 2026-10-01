<script setup lang="ts">
import { computed } from 'vue'

import type { PlaybackMode } from './types'

const props = withDefaults(
  defineProps<{
    isPlaying?: boolean
    mode?: PlaybackMode
  }>(),
  {
    isPlaying: false,
    mode: 'list',
  },
)

const emit = defineEmits<{
  playPause: []
  next: []
  prev: []
  cycleMode: []
}>()

const modeLabel = computed(() => {
  if (props.mode === 'single') {
    return '单曲循环'
  }

  if (props.mode === 'shuffle') {
    return '随机播放'
  }

  return '列表循环'
})
</script>

<template>
  <div class="play-controls" aria-label="播放控制">
    <button
      class="play-controls__button"
      type="button"
      aria-label="上一首"
      @click="emit('prev')"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 5v14M18 6.5 9.5 12 18 17.5Z" />
      </svg>
    </button>

    <button
      class="play-controls__button play-controls__button--primary"
      type="button"
      :aria-label="isPlaying ? '暂停' : '播放'"
      :aria-pressed="isPlaying"
      @click="emit('playPause')"
    >
      <svg v-if="isPlaying" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 6v12M16 6v12" />
      </svg>
      <svg v-else viewBox="0 0 24 24" aria-hidden="true">
        <path d="m9 6 9 6-9 6Z" />
      </svg>
    </button>

    <button
      class="play-controls__button"
      type="button"
      aria-label="下一首"
      @click="emit('next')"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18 5v14M6 6.5 14.5 12 6 17.5Z" />
      </svg>
    </button>

    <button
      class="play-controls__mode"
      type="button"
      :aria-label="`当前为${modeLabel}，点击切换播放模式`"
      :title="modeLabel"
      @click="emit('cycleMode')"
    >
      <svg v-if="mode === 'list'" viewBox="0 0 24 24" aria-hidden="true">
        <path d="m17 2 4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
      <svg v-else-if="mode === 'single'" viewBox="0 0 24 24" aria-hidden="true">
        <path d="m17 2 4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" />
        <path d="M11 15v-4l-2 1" />
      </svg>
      <svg v-else viewBox="0 0 24 24" aria-hidden="true">
        <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
      </svg>
      <span>{{ modeLabel }}</span>
    </button>
  </div>
</template>

<style scoped>
.play-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.play-controls__button {
  display: grid;
  width: 46px;
  height: 46px;
  padding: 0;
  place-items: center;
  border: 1px solid rgb(223 246 255 / 20%);
  border-radius: 50%;
  color: #fff;
  background:
    linear-gradient(
      145deg,
      rgb(151 211 234 / 18%),
      rgb(9 51 78 / 26%)
    );
  box-shadow:
    0 14px 32px rgb(0 22 40 / 28%),
    inset 0 1px 0 rgb(255 255 255 / 25%);
  cursor: pointer;
  transition:
    transform 160ms ease,
    background-color 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease;
}

.play-controls__button svg {
  width: 21px;
  height: 21px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.6;
}

.play-controls__button--primary {
  width: 56px;
  height: 56px;
  background:
    linear-gradient(
      145deg,
      rgb(209 242 251 / 32%),
      rgb(58 132 166 / 24%)
    );
  box-shadow:
    0 18px 38px rgb(0 20 38 / 34%),
    0 0 30px rgb(131 220 249 / 12%),
    inset 0 1px 0 rgb(255 255 255 / 42%);
}

.play-controls__button--primary svg {
  fill: currentColor;
  stroke-width: 1.1;
}

.play-controls__mode {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid rgb(223 246 255 / 18%);
  border-radius: 999px;
  color: rgb(238 249 255 / 76%);
  background: rgb(181 227 243 / 10%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 16%);
  font-size: 0.68rem;
  font-weight: 760;
  letter-spacing: 0.08em;
  white-space: nowrap;
  cursor: pointer;
  transition:
    color 160ms ease,
    background-color 160ms ease,
    border-color 160ms ease,
    transform 160ms ease;
}

.play-controls__mode svg {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.55;
}

.play-controls__button:hover,
.play-controls__button:focus-visible,
.play-controls__mode:hover,
.play-controls__mode:focus-visible {
  border-color: rgb(240 253 255 / 62%);
  background-color: rgb(226 248 255 / 18%);
  box-shadow:
    0 18px 38px rgb(0 20 38 / 34%),
    0 0 26px rgb(152 228 251 / 20%),
    inset 0 1px 0 rgb(255 255 255 / 48%);
  outline: none;
  transform: translateY(-2px) scale(1.02);
}

.play-controls__button:active {
  transform: translateY(0) scale(0.96);
}

.play-controls__mode:active {
  transform: translateY(0) scale(0.97);
}

@media (max-width: 640px) {
  .play-controls {
    gap: 8px;
  }

  .play-controls__button {
    width: 42px;
    height: 42px;
  }

  .play-controls__button--primary {
    width: 52px;
    height: 52px;
  }

  .play-controls__mode {
    width: 42px;
    padding: 0;
  }

  .play-controls__mode span {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .play-controls__button,
  .play-controls__mode {
    transition: none;
  }
}
</style>
