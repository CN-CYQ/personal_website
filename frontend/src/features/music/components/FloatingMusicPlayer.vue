<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { demoTracks, demoWaveform } from '../demo'
import {
  clamp,
  cyclePlaybackMode,
  formatTime,
  nextTrackIndex,
  previousTrackIndex,
  progressRatio,
} from '../playback'
import type { PlaybackMode } from '../types'

import AudioSpectrum from './AudioSpectrum.vue'
import PlayerControls from './PlayerControls.vue'

const currentTrackIndex = ref(0)
const isPlaying = ref(false)
const playbackMode = ref<PlaybackMode>('shuffle')
const isPlaylistOpen = ref(false)
const elapsedSeconds = ref(demoTracks[0]?.startTime ?? 0)
const isSeeking = ref(false)
const progressElement = ref<HTMLElement | null>(null)

let playbackTimer: number | undefined

const currentTrack = computed(() => demoTracks[currentTrackIndex.value]!)
const duration = computed(() => currentTrack.value.duration)
const progress = computed(() =>
  progressRatio(elapsedSeconds.value, duration.value),
)
const progressPercent = computed(() => Math.round(progress.value * 100))

function clearPlaybackTimer() {
  if (playbackTimer !== undefined) {
    window.clearInterval(playbackTimer)
    playbackTimer = undefined
  }
}

function syncPlaybackTimer() {
  clearPlaybackTimer()

  if (!isPlaying.value) {
    return
  }

  playbackTimer = window.setInterval(() => {
    if (elapsedSeconds.value >= duration.value - 1) {
      if (playbackMode.value === 'single') {
        elapsedSeconds.value = 0
      } else {
        handleNext()
      }
      return
    }

    elapsedSeconds.value = Math.min(
      elapsedSeconds.value + 0.25,
      duration.value,
    )
  }, 250)
}

function selectTrack(index: number) {
  currentTrackIndex.value = clamp(
    Math.trunc(index),
    0,
    demoTracks.length - 1,
  )
  elapsedSeconds.value = currentTrack.value.startTime
  isPlaylistOpen.value = false
}

function handleNext() {
  currentTrackIndex.value = nextTrackIndex(
    currentTrackIndex.value,
    demoTracks.length,
    playbackMode.value === 'shuffle',
  )
  elapsedSeconds.value = currentTrack.value.startTime
}

function handlePrevious() {
  currentTrackIndex.value = previousTrackIndex(
    currentTrackIndex.value,
    demoTracks.length,
    playbackMode.value === 'shuffle',
  )
  elapsedSeconds.value = currentTrack.value.startTime
}

function handlePlayPause() {
  if (!isPlaying.value && elapsedSeconds.value >= duration.value) {
    elapsedSeconds.value = 0
  }

  isPlaying.value = !isPlaying.value
}

function handleCyclePlaybackMode() {
  playbackMode.value = cyclePlaybackMode(playbackMode.value)
}

function setSeekFromPointer(event: PointerEvent) {
  const bounds = progressElement.value?.getBoundingClientRect()

  if (!bounds || bounds.width === 0) {
    return
  }

  elapsedSeconds.value = Math.round(
    clamp((event.clientX - bounds.left) / bounds.width, 0, 1) * duration.value,
  )
}

function handleSeekPointerDown(event: PointerEvent) {
  isSeeking.value = true

  if (event.currentTarget instanceof HTMLElement) {
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  setSeekFromPointer(event)
}

function handleSeekPointerMove(event: PointerEvent) {
  if (isSeeking.value) {
    setSeekFromPointer(event)
  }
}

function finishSeeking(event: PointerEvent) {
  if (!isSeeking.value) {
    return
  }

  setSeekFromPointer(event)
  isSeeking.value = false

  if (
    event.currentTarget instanceof HTMLElement &&
    event.currentTarget.hasPointerCapture(event.pointerId)
  ) {
    event.currentTarget.releasePointerCapture(event.pointerId)
  }
}

function handleSeekKeydown(event: KeyboardEvent) {
  let nextTime = elapsedSeconds.value

  if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
    nextTime += 5
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
    nextTime -= 5
  } else if (event.key === 'Home') {
    nextTime = 0
  } else if (event.key === 'End') {
    nextTime = duration.value
  } else {
    return
  }

  event.preventDefault()
  elapsedSeconds.value = clamp(nextTime, 0, duration.value)
}

function togglePlaylist() {
  isPlaylistOpen.value = !isPlaylistOpen.value
}

function closePlaylist() {
  isPlaylistOpen.value = false
}

watch(isPlaying, syncPlaybackTimer)
onMounted(syncPlaybackTimer)
onBeforeUnmount(clearPlaybackTimer)
</script>

<template>
  <section
    class="music-player"
    aria-label="音乐播放器"
    @keydown.esc="closePlaylist"
  >
    <div class="music-player__disc-shell">
      <div
        class="music-player__disc"
        :class="{ 'is-playing': isPlaying }"
      >
        <img
          class="music-player__cover"
          :src="currentTrack.coverUrl"
          :alt="`${currentTrack.title} 专辑封面`"
          width="384"
          height="384"
        />
        <span class="music-player__cover-scrim" aria-hidden="true" />
        <div class="music-player__meta">
          <h2>{{ currentTrack.title }}</h2>
          <p>{{ currentTrack.artist }} · {{ currentTrack.album }}</p>
        </div>
      </div>
    </div>

    <AudioSpectrum
      class="music-player__spectrum"
      :bars="demoWaveform"
      :is-playing="isPlaying"
    />

    <div class="music-player__progress">
      <div
        ref="progressElement"
        class="music-player__slider"
        role="slider"
        tabindex="0"
        aria-label="播放进度"
        :aria-valuemin="0"
        :aria-valuemax="duration"
        :aria-valuenow="Math.round(elapsedSeconds)"
        :aria-valuetext="`${formatTime(elapsedSeconds)} / ${formatTime(duration)}`"
        @pointerdown="handleSeekPointerDown"
        @pointermove="handleSeekPointerMove"
        @pointerup="finishSeeking"
        @pointercancel="finishSeeking"
        @keydown="handleSeekKeydown"
      >
        <span class="music-player__rail" aria-hidden="true">
          <span
            class="music-player__rail-fill"
            :style="{ transform: `scaleX(${progress})` }"
          />
        </span>
        <span
          class="music-player__thumb"
          :style="{ left: `${progressPercent}%` }"
          aria-hidden="true"
        />
      </div>

      <div class="music-player__time-row">
        <time>{{ formatTime(elapsedSeconds) }}</time>
        <time>{{ formatTime(duration) }}</time>
      </div>
    </div>

    <PlayerControls
      class="music-player__controls"
      :is-playing="isPlaying"
      :playback-mode="playbackMode"
      :is-playlist-open="isPlaylistOpen"
      @play-pause="handlePlayPause"
      @next="handleNext"
      @previous="handlePrevious"
      @cycle-mode="handleCyclePlaybackMode"
      @toggle-playlist="togglePlaylist"
    />

    <div
      id="music-player-playlist"
      class="music-player__playlist"
      :class="{ 'is-open': isPlaylistOpen }"
      role="menu"
      aria-label="播放列表"
      :aria-hidden="!isPlaylistOpen"
      :inert="!isPlaylistOpen"
    >
      <button
        v-for="(track, index) in demoTracks"
        :key="track.id"
        class="music-player__playlist-item"
        :class="{ 'is-current': index === currentTrackIndex }"
        type="button"
        role="menuitemradio"
        :aria-checked="index === currentTrackIndex"
        @click="selectTrack(index)"
      >
        <span>{{ track.title }}</span>
        <small>{{ formatTime(track.duration) }}</small>
      </button>
    </div>
  </section>
</template>

<style scoped>
.music-player {
  position: relative;
  display: flex;
  width: min(390px, calc(100vw - 30px));
  flex-direction: column;
  align-items: center;
  gap: 7px;
  isolation: isolate;
  contain: layout style;
  padding: 0;
  border: 0;
  color: #fff;
  background: transparent;
  box-shadow: none;
}

.music-player__disc-shell {
  position: relative;
  z-index: 0;
  display: grid;
  width: 90%;
  max-width: 330px;
  aspect-ratio: 1;
  place-items: center;
  border-radius: 50%;
  background:
    radial-gradient(
      circle at 69% 17%,
      rgb(167 202 208 / 50%) 0%,
      rgb(125 165 186 / 52%) 18%,
      rgb(77 137 144 / 62%) 38%,
      rgb(42 89 103 / 82%) 65%,
      rgb(23 50 62 / 96%) 100%
    );
  box-shadow:
    0 34px 52px rgb(0 19 28 / 42%),
    0 0 38px rgb(74 155 142 / 20%),
    inset 0 1px 0 rgb(255 255 255 / 18%);
}

.music-player__disc-shell::before {
  position: absolute;
  z-index: -1;
  inset: -18px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgb(74 155 142 / 22%),
    rgb(45 90 107 / 14%) 58%,
    transparent 72%
  );
  content: '';
  filter: blur(15px);
  pointer-events: none;
}

.music-player__disc {
  position: relative;
  z-index: 1;
  width: calc(100% - 52px);
  height: calc(100% - 52px);
  overflow: hidden;
  border-radius: 50%;
  background: rgb(30 60 75 / 70%);
  box-shadow:
    inset 0 0 34px rgb(0 18 29 / 48%),
    0 16px 32px rgb(0 18 29 / 28%);
}

.music-player__cover {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  filter: saturate(0.8) brightness(0.84) contrast(1.02);
  object-fit: cover;
  backface-visibility: hidden;
  transform: scale(1.015) translateZ(0);
  will-change: transform;
  animation: music-player-spin 20s linear infinite;
  animation-play-state: paused;
}

.music-player__disc.is-playing .music-player__cover {
  animation-play-state: running;
}

.music-player__cover-scrim {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background:
    linear-gradient(
      180deg,
      transparent 38%,
      rgb(4 28 38 / 14%) 54%,
      rgb(3 24 34 / 82%) 82%,
      rgb(2 20 29 / 92%) 100%
    ),
    radial-gradient(
      circle at 34% 26%,
      rgb(255 255 255 / 18%),
      transparent 30%
    );
  pointer-events: none;
}

.music-player__meta {
  position: absolute;
  right: 14%;
  bottom: 10.5%;
  left: 14%;
  display: grid;
  justify-items: center;
  text-align: center;
  text-shadow: 0 3px 16px rgb(0 16 24 / 76%);
}

.music-player__meta h2 {
  margin: 0;
  color: #fff;
  font-size: clamp(1.55rem, 4.5vw, 1.88rem);
  font-weight: 500;
  letter-spacing: -0.015em;
  line-height: 0.96;
}

.music-player__meta p {
  margin: 6px 0 0;
  color: rgb(244 253 255 / 88%);
  font-size: 0.7rem;
  font-weight: 440;
  letter-spacing: 0.035em;
}

.music-player__spectrum {
  position: relative;
  z-index: 2;
  width: 88%;
  max-width: 322px;
  margin-top: -17px;
}

.music-player__progress {
  display: grid;
  width: 82%;
  max-width: 300px;
  gap: 7px;
}

.music-player__slider {
  position: relative;
  height: 14px;
  outline: none;
  cursor: ew-resize;
  touch-action: none;
  user-select: none;
}

.music-player__slider:focus-visible {
  border-radius: 999px;
  outline: 1px solid rgb(220 252 255 / 72%);
  outline-offset: 5px;
}

.music-player__rail {
  position: absolute;
  top: 50%;
  right: 0;
  left: 0;
  height: 3px;
  overflow: hidden;
  border-radius: 999px;
  background: rgb(239 253 255 / 28%);
  box-shadow: inset 0 1px 1px rgb(0 21 31 / 30%);
  transform: translateY(-50%);
}

.music-player__rail-fill {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(90deg, #27bfce, #75e6ed);
  box-shadow: 0 0 12px rgb(77 208 225 / 62%);
  transform-origin: left center;
}

.music-player__thumb {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  border: 2px solid rgb(246 255 255 / 92%);
  border-radius: 50%;
  background: #58d4dc;
  box-shadow:
    0 0 0 5px rgb(91 217 226 / 12%),
    0 0 16px rgb(77 208 225 / 58%);
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.72);
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}

.music-player__slider:hover .music-player__thumb,
.music-player__slider:focus-visible .music-player__thumb,
.music-player__slider:active .music-player__thumb {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

.music-player__time-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: rgb(244 253 255 / 76%);
  font-size: 0.7rem;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.01em;
}

.music-player__controls {
  margin-top: 5px;
}

.music-player__playlist {
  position: absolute;
  z-index: 4;
  right: 14px;
  bottom: 78px;
  left: 14px;
  display: grid;
  gap: 4px;
  padding: 8px;
  border: 1px solid rgb(219 252 255 / 26%);
  border-radius: 16px;
  background: rgb(12 43 56 / 94%);
  box-shadow:
    0 24px 50px rgb(0 18 27 / 38%),
    inset 0 1px 0 rgb(255 255 255 / 18%);
  backdrop-filter: blur(24px) saturate(140%);
  -webkit-backdrop-filter: blur(24px) saturate(140%);
  opacity: 0;
  pointer-events: none;
  transform: translateY(8px) scale(0.98);
  visibility: hidden;
  transition:
    opacity 240ms ease,
    transform 240ms cubic-bezier(0.22, 1, 0.36, 1),
    visibility 0s linear 240ms;
}

.music-player__playlist.is-open {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0) scale(1);
  visibility: visible;
  transition:
    opacity 240ms ease,
    transform 240ms cubic-bezier(0.22, 1, 0.36, 1),
    visibility 0s;
}

.music-player__playlist-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 36px;
  padding: 0 10px;
  border: 1px solid transparent;
  border-radius: 10px;
  color: rgb(240 253 255 / 78%);
  background: transparent;
  font-size: 0.74rem;
  text-align: left;
  cursor: pointer;
}

.music-player__playlist-item small {
  color: rgb(214 247 249 / 52%);
  font-size: 0.65rem;
  font-variant-numeric: tabular-nums;
}

.music-player__playlist-item:hover,
.music-player__playlist-item:focus-visible,
.music-player__playlist-item.is-current {
  border-color: rgb(198 246 249 / 22%);
  color: #fff;
  background: rgb(116 205 209 / 14%);
  outline: none;
}

@keyframes music-player-spin {
  to {
    transform: scale(1.015) rotate(360deg) translateZ(0);
  }
}

@media (max-width: 480px) {
  .music-player {
    width: min(352px, calc(100vw - 24px));
    gap: 6px;
  }

  .music-player__disc-shell {
    width: 88%;
  }

  .music-player__spectrum {
    width: 86%;
  }

  .music-player__progress {
    width: 80%;
  }
}

@media (max-height: 700px) and (max-width: 720px) {
  .music-player {
    gap: 7px;
  }

  .music-player__disc-shell {
    width: 64%;
  }

  .music-player__spectrum {
    width: 64%;
    margin-top: -11px;
  }

  .music-player__progress {
    width: 68%;
  }

  .music-player__meta h2 {
    font-size: 1.45rem;
  }

  .music-player__meta p {
    margin-top: 4px;
    font-size: 0.66rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .music-player__cover {
    animation: none;
  }

  .music-player__playlist {
    transition: none;
  }

  .music-player__thumb {
    transition: none;
  }

  .music-player__cover {
    will-change: auto;
  }
}
</style>
