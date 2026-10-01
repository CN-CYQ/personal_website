<script setup lang="ts">
import HeroWeatherCard from '@/features/weather/components/HeroWeatherCard.vue'
import FloatingMusicPlayer from '@/features/music/components/FloatingMusicPlayer.vue'

import GrassWaveCanvas from './GrassWaveCanvas.vue'
</script>

<template>
  <section class="hero">
    <!-- <GrassWaveCanvas /> -->
    <div class="hero__sky-glow" aria-hidden="true" />
    <HeroWeatherCard class="hero__weather-slot" />
    <!-- <FloatingMusicPlayer class="hero__player-slot" /> -->

    <div class="hero__content">
      <!-- <div class="hero__bottomline">
        <p class="hero__glass-chip hero__interaction">
          <span class="hero__interaction-mark" aria-hidden="true" />
          Move through the meadow
        </p>
        <p class="hero__glass-chip hero__coordinate">
          WIND / 1.18&nbsp;&nbsp; LIGHT / 82%
        </p>
      </div> -->
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 100svh;
  overflow: hidden;
  isolation: isolate;
  color: #123d35;
  background:
    linear-gradient(180deg,
      rgb(5 29 39 / 0%) 0%,
      rgb(5 29 39 / 0%) 47%,
      rgb(24 55 57 / 12%) 50%,
      rgb(13 46 51 / 64%) 56%,
      rgb(5 30 40 / 92%) 66%,
      #031d29 100%),
    linear-gradient(180deg,
      rgb(236 247 255 / 0%) 16%,
      rgb(236 247 255 / 16%) 42%,
      rgb(236 247 255 / 9%) 48%,
      rgb(236 247 255 / 0%) 54%),
    radial-gradient(circle at 98% -6%,
      rgb(255 252 236 / 88%) 0%,
      rgb(255 239 206 / 44%) 8%,
      rgb(255 230 195 / 11%) 23%,
      transparent 36%),
    radial-gradient(circle at 14% 17%,
      rgb(255 255 255 / 20%) 0%,
      transparent 29%),
    linear-gradient(104deg,
      #6a9dbd 0%,
      #80adca 28%,
      #9fc2d5 52%,
      #c9cfc9 75%,
      #f1d9b8 100%);
}

.hero__sky-glow {
  position: absolute;
  z-index: 1;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 92% -1%,
      rgb(255 255 255 / 84%) 0%,
      rgb(255 246 214 / 48%) 9%,
      rgb(255 235 184 / 13%) 25%,
      transparent 44%),
    radial-gradient(circle at 62% 38%,
      rgb(255 255 255 / 78%) 0 1px,
      transparent 2px),
    radial-gradient(circle at 69% 28%,
      rgb(255 255 255 / 62%) 0 2px,
      transparent 3px),
    linear-gradient(180deg,
      rgb(255 255 255 / 8%) 0%,
      transparent 46%,
      rgb(255 247 212 / 8%) 100%);
  mix-blend-mode: screen;
}

.hero__content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100svh;
  padding: 88px clamp(22px, 4vw, 68px) 22px;
  pointer-events: none;
}

.hero__weather-slot {
  position: absolute;
  z-index: 4;
  top: clamp(104px, 12vh, 132px);
  right: clamp(22px, 4vw, 68px);
  pointer-events: auto;
}

.hero__player-slot {
  position: absolute;
  z-index: 6;
  bottom: clamp(20px, 4vh, 42px);
  left: clamp(22px, 4vw, 68px);
  pointer-events: auto;
}

.hero__bottomline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.hero__glass-chip {
  margin: 0;
  padding: 10px 14px;
  border: 1px solid rgb(255 255 255 / 52%);
  border-radius: 999px;
  color: rgb(16 59 51 / 76%);
  background: linear-gradient(135deg,
      rgb(255 255 255 / 38%),
      rgb(255 255 255 / 14%));
  box-shadow:
    0 16px 44px rgb(37 80 69 / 12%),
    inset 0 1px 0 rgb(255 255 255 / 55%);
  backdrop-filter: blur(18px) saturate(145%);
  -webkit-backdrop-filter: blur(18px) saturate(145%);
  font-size: 0.66rem;
  font-weight: 760;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.hero__interaction {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hero__interaction-mark {
  width: 8px;
  height: 8px;
  border: 1px solid rgb(255 255 255 / 86%);
  border-radius: 50%;
  background: #e9ffca;
  box-shadow:
    0 0 0 4px rgb(255 255 255 / 18%),
    0 0 20px rgb(255 248 191 / 70%);
}

.hero__coordinate {
  text-align: right;
}

@media (max-width: 720px) {
  .hero__content {
    padding: 88px 20px 24px;
  }

  .hero__player-slot {
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
  }

  .hero__weather-slot {
    top: 122px;
    right: 16px;
  }

  .hero__coordinate {
    display: none;
  }
}

@media (max-height: 820px) and (min-width: 721px) {
  .hero__content {
    padding-top: 76px;
    padding-bottom: 18px;
  }
}

@media (max-height: 700px) and (max-width: 720px) {
  .hero__player-slot {
    bottom: 4px;
  }
}
</style>
