<script setup lang="ts">
import { ref } from 'vue'

import AudioWaveform from './AudioWaveform.vue'
import PlayControls from './PlayControls.vue'
import type { AudioPlayerCardProps } from './types'

const props = withDefaults(defineProps<AudioPlayerCardProps>(), {
  isPlaying: false,
  waveform: () => [],
  mode: 'list',
})

const emit = defineEmits<{
  playPause: []
  next: []
  prev: []
  cycleMode: []
  scrub: [value: number]
}>()

const controlsPinned = ref(false)

function handleProgressClick(event: MouseEvent) {
  if (event.detail === 0 || window.matchMedia('(hover: none)').matches) {
    controlsPinned.value = !controlsPinned.value
  }
}
</script>

<template>
  <section class="audio-player-scene" aria-label="音频播放器展示">
    <div class="audio-player-scene__aura" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>

    <div class="audio-player-scene__focus">
      <div
        class="audio-player-scene__cover"
        :class="{ 'is-playing': props.isPlaying }"
      >
        <img
          :src="props.track.coverUrl"
          :alt="`${props.track.title} cover`"
          width="512"
          height="512"
        />
        <span class="audio-player-scene__cover-sheen" aria-hidden="true" />
      </div>

      <div class="audio-player-scene__meta">
        <span>Now playing</span>
        <h2>{{ props.track.title }}</h2>
        <p>{{ props.track.artist }}</p>
      </div>
    </div>

    <div
      class="audio-player-scene__progress"
      :class="{ 'is-pinned': controlsPinned }"
      @click="handleProgressClick"
      @pointerleave="controlsPinned = false"
    >
      <div class="audio-player-scene__glass" aria-hidden="true" />

      <div class="audio-player-scene__waveform">
        <AudioWaveform
          :bars="props.waveform"
          :current-time="props.track.currentTime"
          :duration="props.track.duration"
          @scrub="emit('scrub', $event)"
        />
      </div>

      <div class="audio-player-scene__controls">
        <div class="audio-player-scene__controls-inner">
          <PlayControls
            :is-playing="props.isPlaying"
            :mode="props.mode"
            @play-pause="emit('playPause')"
            @next="emit('next')"
            @prev="emit('prev')"
            @cycle-mode="emit('cycleMode')"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.audio-player-scene {
  position: relative;
  display: flex;
  width: min(680px, 74vw);
  flex-direction: column;
  align-items: center;
  isolation: isolate;
  filter: drop-shadow(0 34px 64px rgb(2 24 38 / 30%));
}

.audio-player-scene__aura {
  position: absolute;
  z-index: 0;
  top: 31%;
  right: 1%;
  bottom: -20px;
  left: 1%;
  border: 1px solid rgb(226 248 255 / 13%);
  border-radius: 48% 48% 34px 34px;
  background:
    radial-gradient(
      ellipse at 50% 0%,
      rgb(218 246 255 / 24%),
      rgb(86 164 193 / 12%) 42%,
      transparent 72%
    ),
    linear-gradient(
      150deg,
      rgb(215 242 252 / 10%),
      rgb(62 129 158 / 8%) 58%,
      rgb(6 37 57 / 14%)
    );
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 12%),
    0 28px 54px rgb(1 20 33 / 16%);
  backdrop-filter: blur(26px) saturate(140%);
  -webkit-backdrop-filter: blur(26px) saturate(140%);
  pointer-events: none;
}

.audio-player-scene__aura span {
  position: absolute;
  top: 20%;
  left: 50%;
  width: 54%;
  aspect-ratio: 1;
  border: 1px solid rgb(213 244 255 / 9%);
  border-radius: 50%;
  transform: translateX(-50%);
}

.audio-player-scene__aura span:nth-child(2) {
  top: 10%;
  width: 72%;
}

.audio-player-scene__aura span:nth-child(3) {
  top: 0;
  width: 90%;
}

.audio-player-scene__focus {
  position: relative;
  z-index: 2;
  display: grid;
  width: clamp(236px, 19vw, 276px);
  justify-items: center;
}

.audio-player-scene__cover {
  position: relative;
  display: grid;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  place-items: center;
  border: 1px solid rgb(237 252 255 / 54%);
  border-radius: 50%;
  background: rgb(230 248 255 / 8%);
  box-shadow:
    0 34px 68px rgb(0 17 31 / 38%),
    0 0 0 10px rgb(222 247 255 / 5%),
    inset 0 1px 0 rgb(255 255 255 / 46%);
  isolation: isolate;
}

.audio-player-scene__cover::before,
.audio-player-scene__cover::after {
  position: absolute;
  z-index: 2;
  inset: -2px;
  border: 1px solid rgb(230 251 255 / 62%);
  border-radius: 50%;
  content: '';
  pointer-events: none;
}

.audio-player-scene__cover::before {
  border-color: transparent rgb(230 251 255 / 72%) transparent
    rgb(230 251 255 / 22%);
  animation: audio-cover-orbit 18s linear infinite;
  animation-play-state: paused;
}

.audio-player-scene__cover::after {
  inset: 8px;
  border-color: rgb(255 255 255 / 12%);
}

.audio-player-scene__cover.is-playing::before {
  animation-play-state: running;
}

.audio-player-scene__cover img {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  filter: blur(0.55px) saturate(0.9) brightness(0.94);
  object-fit: cover;
  transform: scale(1.025);
  animation: audio-cover-spin 24s linear infinite;
  animation-play-state: paused;
}

.audio-player-scene__cover.is-playing img {
  animation-play-state: running;
}

.audio-player-scene__cover-sheen {
  position: absolute;
  z-index: 1;
  inset: 0;
  border-radius: 50%;
  background:
    radial-gradient(
      circle at 34% 28%,
      rgb(255 255 255 / 36%) 0%,
      transparent 26%
    ),
    linear-gradient(
      145deg,
      rgb(255 255 255 / 14%),
      transparent 42%,
      rgb(3 28 47 / 24%)
    );
  pointer-events: none;
}

.audio-player-scene__meta {
  display: grid;
  min-width: 0;
  margin-top: 14px;
  justify-items: center;
  text-align: center;
}

.audio-player-scene__meta > span {
  color: rgb(239 251 255 / 52%);
  font-size: 0.62rem;
  font-weight: 760;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.audio-player-scene__meta h2 {
  max-width: 100%;
  overflow: hidden;
  margin: 6px 0 0;
  color: #fff;
  font-size: clamp(1.28rem, 2vw, 1.72rem);
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.audio-player-scene__meta p {
  margin: 6px 0 0;
  color: rgb(239 251 255 / 64%);
  font-size: 0.78rem;
  font-weight: 560;
  letter-spacing: 0.06em;
}

.audio-player-scene__progress {
  position: relative;
  z-index: 3;
  width: 100%;
  margin-top: -18px;
  padding: 54px clamp(24px, 4vw, 48px) 24px;
  border: 1px solid rgb(230 249 255 / 18%);
  border-radius: 42% 42% 28px 28px;
  cursor: default;
}

.audio-player-scene__glass {
  position: absolute;
  z-index: -1;
  inset: 0;
  overflow: hidden;
  border-radius: inherit;
  background:
    radial-gradient(
      ellipse at 50% -8%,
      rgb(228 249 255 / 20%),
      rgb(91 165 193 / 12%) 44%,
      transparent 72%
    ),
    linear-gradient(
      155deg,
      rgb(154 211 231 / 12%),
      rgb(14 64 89 / 12%) 62%,
      rgb(3 28 45 / 20%)
    );
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 20%),
    inset 0 -18px 44px rgb(1 21 36 / 12%),
    0 30px 70px rgb(0 18 32 / 22%);
  backdrop-filter: blur(30px) saturate(150%);
  -webkit-backdrop-filter: blur(30px) saturate(150%);
  pointer-events: none;
}

.audio-player-scene__glass::after {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      105deg,
      transparent 0 38%,
      rgb(255 255 255 / 8%) 48%,
      transparent 58%
    );
  content: '';
  transform: translateX(-65%);
}

.audio-player-scene__progress:hover .audio-player-scene__glass::after,
.audio-player-scene__progress:focus-within .audio-player-scene__glass::after {
  animation: audio-glass-sweep 900ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.audio-player-scene__waveform,
.audio-player-scene__controls {
  position: relative;
  z-index: 1;
}

.audio-player-scene__controls {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transform: translateY(-14px) scale(0.96);
  transition:
    grid-template-rows 360ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 240ms ease,
    transform 360ms cubic-bezier(0.22, 1, 0.36, 1);
}

.audio-player-scene__progress:hover .audio-player-scene__controls,
.audio-player-scene__progress:focus-within .audio-player-scene__controls,
.audio-player-scene__progress.is-pinned .audio-player-scene__controls {
  grid-template-rows: 1fr;
  opacity: 1;
  transform: translateY(0) scale(1);
}

.audio-player-scene__controls-inner {
  min-height: 0;
  overflow: hidden;
}

.audio-player-scene__controls-inner::before {
  display: block;
  height: 22px;
  content: '';
}

@keyframes audio-cover-spin {
  to {
    transform: scale(1.025) rotate(360deg);
  }
}

@keyframes audio-cover-orbit {
  to {
    transform: rotate(360deg);
  }
}

@keyframes audio-glass-sweep {
  to {
    transform: translateX(65%);
  }
}

@media (max-width: 900px) {
  .audio-player-scene {
    width: min(620px, 88vw);
  }

  .audio-player-scene__focus {
    width: clamp(212px, 30vw, 250px);
  }
}

@media (max-width: 640px) {
  .audio-player-scene {
    width: min(92vw, 420px);
  }

  .audio-player-scene__focus {
    width: min(60vw, 218px);
  }

  .audio-player-scene__meta {
    margin-top: 14px;
  }

  .audio-player-scene__meta h2 {
    font-size: 1.25rem;
  }

  .audio-player-scene__progress {
    margin-top: -12px;
    padding: 56px 16px 22px;
    border-radius: 36% 36% 22px 22px;
  }
}

@media (max-height: 820px) and (min-width: 641px) {
  .audio-player-scene__focus {
    width: 198px;
  }

  .audio-player-scene__meta {
    margin-top: 12px;
  }

  .audio-player-scene__progress {
    padding-top: 54px;
    padding-bottom: 22px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .audio-player-scene__cover img,
  .audio-player-scene__cover::before {
    animation: none;
  }

  .audio-player-scene__controls,
  .audio-player-scene__glass::after,
  .audio-player-scene__progress:hover .audio-player-scene__controls,
  .audio-player-scene__progress:focus-within .audio-player-scene__controls,
  .audio-player-scene__progress.is-pinned .audio-player-scene__controls {
    animation: none;
    transition: none;
  }
}
</style>
