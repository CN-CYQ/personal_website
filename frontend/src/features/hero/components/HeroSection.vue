<script setup lang="ts">
import DiscoveryGalleryCard from '@/features/home/components/DiscoveryGalleryCard.vue'
import RecentActivityCard from '@/features/home/components/RecentActivityCard.vue'
import FloatingMusicPlayer from '@/features/music/components/FloatingMusicPlayer.vue'

import GrassWaveCanvas from './GrassWaveCanvas.vue'

const emit = defineEmits<{
  explore: []
}>()
</script>

<template>
  <section class="hero">
    <GrassWaveCanvas />
    <div class="hero__sky-glow" aria-hidden="true" />
    <FloatingMusicPlayer id="home-hero-player" class="hero__player-slot" />

    <div class="hero__glass-stack">
      <DiscoveryGalleryCard />
      <RecentActivityCard />
    </div>

    <div class="hero__content">
      <h1 class="hero__headline" aria-label="Hi! Welcome to my channel!">
        <span class="hero__line hero__line--hi">Hi!</span>
        <span class="hero__ornament" aria-hidden="true">
          <i />
        </span>
        <span class="hero__line hero__line--welcome">Welcome to my</span>
        <span class="hero__line hero__line--channel">channel!</span>
      </h1>

      <button class="hero__explore" type="button" @click="emit('explore')">
        <span class="hero__explore-icon" aria-hidden="true">
          <svg viewBox="0 0 34 26">
            <path d="m3 3 14 10L31 3" />
            <path d="m3 13 14 10 14-10" />
          </svg>
        </span>
        <span>Explore more</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  height: 100dvh;
  min-height: 620px;
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
  height: 100%;
  pointer-events: none;
}

.hero__headline {
  position: absolute;
  top: 17%;
  left: 50%;
  display: grid;
  width: min(82vw, 1200px);
  justify-items: center;
  margin: 0;
  color: #f4fbff;
  font-family: "Iowan Old Style", "Baskerville", Georgia, serif;
  font-size: clamp(4.2rem, 7vw, 7.2rem);
  font-weight: 400;
  line-height: 0.88;
  text-align: center;
  text-shadow:
    0 4px 20px rgb(26 68 76 / 18%),
    0 18px 52px rgb(251 255 255 / 22%);
  transform: translateX(-50%);
}

.hero__line {
  display: block;
  opacity: 0;
  filter: blur(12px);
  transform: translateY(28px);
  animation: hero-line-enter 900ms cubic-bezier(0.2, 0.82, 0.24, 1) forwards;
}

.hero__line--hi {
  justify-self: center;
  animation-delay: 120ms;
}

.hero__line--welcome {
  margin-top: 3.8%;
  justify-self: center;
  animation-delay: 320ms;
}

.hero__line--channel {
  margin-top: 3%;
  margin-right: 20%;
  justify-self: end;
  animation-delay: 520ms;
}

.hero__ornament {
  display: grid;
  width: 30px;
  height: 30px;
  margin-top: 2.2%;
  place-items: center;
  opacity: 0;
  transform: rotate(45deg) scale(0.6);
  animation: hero-ornament-enter 700ms ease-out 700ms forwards;
}

.hero__ornament::before,
.hero__ornament::after,
.hero__ornament i {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgb(255 255 255 / 86%);
  box-shadow: 0 0 16px rgb(255 255 205 / 82%);
  content: '';
}

.hero__ornament::before {
  transform: translateX(-8px);
}

.hero__ornament::after {
  transform: translateX(8px);
}

.hero__player-slot {
  position: absolute;
  z-index: 7;
  bottom: clamp(20px, 4.5vh, 44px);
  left: clamp(18px, 4.2vw, 70px);
  transform: scale(0.84);
  transform-origin: bottom left;
  pointer-events: auto;
}

.hero__glass-stack {
  position: absolute;
  z-index: 8;
  top: clamp(154px, 23vh, 205px);
  right: clamp(22px, 4.2vw, 68px);
  display: grid;
  width: clamp(260px, 19.2vw, 306px);
  gap: 10px;
}

.hero__explore {
  position: absolute;
  bottom: clamp(46px, 8vh, 86px);
  left: 50%;
  display: inline-grid;
  align-items: center;
  grid-template-columns: 46px auto;
  justify-content: center;
  gap: 8px;
  padding: 0;
  border: 0;
  color: rgb(255 255 255 / 94%);
  background: transparent;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-shadow: 0 2px 12px rgb(11 51 59 / 34%);
  transform: translateX(-50%);
  pointer-events: auto;
  cursor: pointer;
}

.hero__explore:focus-visible {
  border-radius: 999px;
  outline: 1px solid rgb(255 255 255 / 88%);
  outline-offset: 10px;
}

.hero__explore-icon {
  display: grid;
  width: 46px;
  height: 42px;
  place-items: center;
  filter: drop-shadow(0 8px 14px rgb(10 53 63 / 20%));
  animation: hero-explore-float 2.4s ease-in-out infinite;
}

.hero__explore-icon svg {
  width: 36px;
  height: 30px;
  fill: none;
  stroke: rgb(255 255 255 / 92%);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 4;
}

.hero__explore:hover .hero__explore-icon,
.hero__explore:focus-visible .hero__explore-icon {
  transform: translateY(3px);
}

@keyframes hero-line-enter {
  to {
    opacity: 1;
    filter: blur(0);
    transform: translateY(0);
  }
}

@keyframes hero-ornament-enter {
  to {
    opacity: 1;
    transform: rotate(45deg) scale(1);
  }
}

@keyframes hero-explore-float {
  50% {
    transform: translateY(8px);
  }
}

@media (max-width: 720px) {
  .hero__headline {
    top: 14%;
    width: min(88vw, 560px);
    font-size: clamp(3.4rem, 14vw, 5.8rem);
  }

  .hero__player-slot {
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%) scale(0.7);
    transform-origin: bottom center;
  }

  .hero__glass-stack {
    display: none;
  }

  .hero__explore {
    top: 53%;
    bottom: auto;
    grid-template-columns: 34px auto;
    font-size: 0.68rem;
  }

  .hero__explore-icon {
    width: 34px;
  }

  .hero__explore-icon svg {
    width: 28px;
  }
}

@media (max-height: 820px) and (min-width: 721px) {
  .hero__glass-stack {
    top: 132px;
    transform: scale(0.83);
    transform-origin: top right;
  }

  .hero__headline {
    font-size: clamp(4rem, 8.2vw, 7.2rem);
  }
}

@media (max-height: 700px) and (max-width: 720px) {
  .hero {
    min-height: 560px;
  }

  .hero__player-slot {
    bottom: -20px;
  }

  .hero__headline {
    top: 15%;
    font-size: 3.2rem;
  }
}
</style>

<style>
[data-theme='dark'] .hero {
  color: #b0c8d6;
  background:
    linear-gradient(180deg,
      rgb(0 6 16 / 0%) 0%,
      rgb(0 6 16 / 0%) 47%,
      rgb(4 12 22 / 32%) 50%,
      rgb(2 8 18 / 76%) 56%,
      rgb(0 5 14 / 95%) 66%,
      #010814 100%),
    linear-gradient(180deg,
      rgb(70 120 180 / 0%) 16%,
      rgb(70 120 180 / 12%) 42%,
      rgb(70 120 180 / 6%) 48%,
      rgb(70 120 180 / 0%) 54%),
    radial-gradient(circle at 50% -15%,
      rgb(140 180 220 / 48%) 0%,
      rgb(100 150 200 / 28%) 12%,
      rgb(60 110 160 / 10%) 28%,
      transparent 44%),
    radial-gradient(circle at 14% 17%,
      rgb(100 150 200 / 10%) 0%,
      transparent 29%),
    linear-gradient(104deg,
      #081828 0%,
      #0b1d30 28%,
      #0f2340 52%,
      #0e2038 75%,
      #091828 100%);
}

[data-theme='dark'] .hero__sky-glow {
  background:
    radial-gradient(circle at 50% -8%,
      rgb(100 160 230 / 42%) 0%,
      rgb(70 130 200 / 24%) 9%,
      rgb(40 90 150 / 6%) 25%,
      transparent 44%),
    radial-gradient(circle at 62% 38%,
      rgb(120 180 230 / 22%) 0 1px,
      transparent 2px),
    radial-gradient(circle at 69% 28%,
      rgb(100 160 220 / 16%) 0 2px,
      transparent 3px),
    linear-gradient(180deg,
      rgb(40 80 130 / 4%) 0%,
      transparent 46%,
      rgb(20 50 80 / 4%) 100%);
  mix-blend-mode: screen;
}

[data-theme='dark'] .hero__glass-chip {
  border-color: rgb(80 130 180 / 36%);
  color: rgb(150 190 220 / 74%);
  background: linear-gradient(135deg,
      rgb(12 30 52 / 42%),
      rgb(6 20 40 / 18%));
  box-shadow:
    0 16px 44px rgb(0 8 20 / 40%),
    inset 0 1px 0 rgb(140 190 230 / 20%);
}

[data-theme='dark'] .hero__interaction-mark {
  border-color: rgb(100 150 210 / 58%);
  background: #90d0f0;
  box-shadow:
    0 0 0 4px rgb(60 120 180 / 14%),
    0 0 20px rgb(140 200 240 / 40%);
}
</style>
