<script setup lang="ts">
import { computed } from 'vue'

import type { PlaybackMode } from '../types'

const props = withDefaults(
  defineProps<{
    isPlaying?: boolean
    playbackMode?: PlaybackMode
    isPlaylistOpen?: boolean
  }>(),
  {
    isPlaying: false,
    playbackMode: 'shuffle',
    isPlaylistOpen: false,
  },
)

const emit = defineEmits<{
  playPause: []
  next: []
  previous: []
  cycleMode: []
  togglePlaylist: []
}>()

const playbackModeLabel = computed(() => {
  if (props.playbackMode === 'single') {
    return '单曲循环'
  }

  if (props.playbackMode === 'list') {
    return '列表循环'
  }

  return '随机播放'
})
</script>

<template>
  <div class="player-controls" aria-label="播放控制">
    <button class="player-controls__button" :class="{ 'is-active': playbackMode !== 'list' }" type="button"
      :aria-label="`当前为${playbackModeLabel}，点击切换播放模式`" :aria-pressed="playbackMode !== 'list'"
      :title="playbackModeLabel" @click="emit('cycleMode')">
      <svg v-if="playbackMode === 'shuffle'" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M4 7h3.2c4.2 0 5.4 10 9.6 10H20M17 14l3 3-3 3M4 17h3.2c1.2 0 2.2-.8 3.1-2M14 9c.7-.9 1.6-2 2.8-2H20M17 4l3 3-3 3" />
      </svg>
      <svg v-else-if="playbackMode === 'list'" viewBox="0 0 24 24" aria-hidden="true">
        <path d="m17 2 4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
      <svg v-else viewBox="0 0 24 24" aria-hidden="true">
        <path d="m17 2 4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" />
        <path d="M11.5 15v-4l-2 1" />
      </svg>
    </button>

    <button class="player-controls__button" type="button" aria-label="上一首" title="上一首" @click="emit('previous')">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 5v14M18 6.5 9.5 12 18 17.5Z" />
      </svg>
    </button>

    <button class="player-controls__button player-controls__button--primary" type="button"
      :aria-label="isPlaying ? '暂停' : '播放'" :aria-pressed="isPlaying" :title="isPlaying ? '暂停' : '播放'"
      @click="emit('playPause')">
      <svg v-if="isPlaying" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8.5 6.5h2.6v11H8.5zM12.9 6.5h2.6v11h-2.6z" />
      </svg>
      <svg v-else viewBox="0 0 24 24" aria-hidden="true">
        <path d="m9.2 6.4 8.6 5.6-8.6 5.6Z" />
      </svg>
    </button>

    <button class="player-controls__button" type="button" aria-label="下一首" title="下一首" @click="emit('next')">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M17 5v14M6 6.5 14.5 12 6 17.5Z" />
      </svg>
    </button>

    <button class="player-controls__button" :class="{ 'is-active': isPlaylistOpen }" type="button"
      :aria-label="isPlaylistOpen ? '关闭播放列表' : '打开播放列表'" :aria-expanded="isPlaylistOpen"
      aria-controls="music-player-playlist" title="播放列表" @click="emit('togglePlaylist')">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 7h14M5 12h10M5 17h7M17.5 13v6l4-3Z" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.player-controls {
  display: flex;
  width: min(100%, 248px);
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.player-controls__button {
  display: grid;
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  padding: 0;
  place-items: center;
  border: 1px solid rgb(206 245 248 / 20%);
  border-radius: 50%;
  color: rgb(246 254 255 / 96%);
  background:
    linear-gradient(145deg, rgb(91 144 157 / 42%), rgb(23 63 77 / 58%)),
    rgb(40 80 95 / 50%);
  box-shadow:
    0 12px 26px rgb(2 24 34 / 24%),
    inset 0 1px 0 rgb(255 255 255 / 24%);
  cursor: pointer;
  transition:
    transform 160ms ease,
    filter 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease;
}

.player-controls__button svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.65;
}

.player-controls__button--primary {
  width: 54px;
  height: 54px;
  flex-basis: 54px;
  border-color: rgb(255 255 255 / 72%);
  color: #174a58;
  background: linear-gradient(145deg, #f2ffff, #d5f2f4 58%, #b8e2e7);
  box-shadow:
    0 18px 34px rgb(2 28 38 / 30%),
    0 0 26px rgb(192 244 250 / 16%),
    inset 0 1px 0 rgb(255 255 255 / 92%);
}

.player-controls__button--primary svg {
  width: 23px;
  height: 23px;
}

.player-controls__button--primary svg path {
  fill: currentColor;
  stroke: none;
}

.player-controls__button.is-active {
  border-color: rgb(135 235 242 / 68%);
  color: #dcfcff;
  background:
    linear-gradient(145deg, rgb(82 176 182 / 56%), rgb(24 82 94 / 70%)),
    rgb(40 80 95 / 60%);
  box-shadow:
    0 14px 28px rgb(2 24 34 / 26%),
    0 0 20px rgb(77 208 225 / 18%),
    inset 0 1px 0 rgb(255 255 255 / 34%);
}

.player-controls__button:hover,
.player-controls__button:focus-visible {
  border-color: rgb(229 253 255 / 66%);
  filter: brightness(1.14);
  outline: none;
  transform: scale(1.07);
}

.player-controls__button:active {
  filter: brightness(0.98);
  transform: scale(0.94);
}

@media (max-width: 480px) {
  .player-controls {
    gap: 7px;
  }

  .player-controls__button {
    width: 36px;
    height: 36px;
    flex-basis: 36px;
  }

  .player-controls__button--primary {
    width: 50px;
    height: 50px;
    flex-basis: 50px;
  }
}

@media (max-height: 700px) and (max-width: 720px) {
  .player-controls {
    width: min(100%, 226px);
  }

  .player-controls__button {
    width: 32px;
    height: 32px;
    flex-basis: 32px;
  }

  .player-controls__button--primary {
    width: 46px;
    height: 46px;
    flex-basis: 46px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .player-controls__button {
    transition: none;
  }
}
</style>

<style>
[data-theme='dark'] .player-controls__button {
  border-color: rgb(60 110 160 / 18%);
  color: rgb(180 210 240 / 90%);
  background:
    linear-gradient(145deg, rgb(20 45 75 / 44%), rgb(6 20 38 / 60%)),
    rgb(8 24 40 / 52%);
}

[data-theme='dark'] .player-controls__button:hover,
[data-theme='dark'] .player-controls__button:focus-visible,
[data-theme='dark'] .player-controls__button.is-active {
  border-color: rgb(90 150 210 / 40%);
  background:
    linear-gradient(145deg, rgb(28 58 90 / 54%), rgb(10 30 50 / 44%)),
    rgb(10 30 48 / 64%);
  box-shadow:
    0 0 18px rgb(50 120 180 / 26%),
    0 4px 12px rgb(0 4 14 / 40%);
}

[data-theme='dark'] .player-controls__button--primary {
  border-color: rgb(80 140 200 / 32%);
  background:
    linear-gradient(145deg, rgb(24 55 88 / 46%), rgb(8 24 40 / 64%)),
    rgb(10 28 46 / 56%);
  box-shadow:
    0 0 26px rgb(60 130 200 / 24%),
    0 6px 18px rgb(0 4 14 / 42%);
}

[data-theme='dark'] .player-controls__button--primary:hover,
[data-theme='dark'] .player-controls__button--primary:focus-visible {
  border-color: rgb(120 170 230 / 48%);
  box-shadow:
    0 0 32px rgb(80 150 220 / 32%),
    0 6px 20px rgb(0 3 12 / 46%);
}
</style>