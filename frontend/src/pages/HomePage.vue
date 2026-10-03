<script setup lang="ts">
import { ref } from 'vue'

import HomeContentSection from '@/features/home/components/HomeContentSection.vue'
import { useHomeScrollTransition } from '@/features/home/composables/useHomeScrollTransition'
import HeroSection from '@/features/hero/components/HeroSection.vue'

const homeRoot = ref<HTMLElement | null>(null)
const heroStage = ref<HTMLElement | null>(null)
const homeContent = ref<HTMLElement | null>(null)

useHomeScrollTransition({
  scope: homeRoot,
  heroStage,
  content: homeContent,
})

function scrollToContent() {
  if (!homeContent.value) {
    return
  }

  window.scrollTo({
    top: Math.max(homeContent.value.offsetTop - 82, 0),
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth',
  })
}
</script>

<template>
  <div ref="homeRoot" class="home-page">
    <div ref="heroStage" class="home-page__hero-stage">
      <HeroSection @explore="scrollToContent" />
    </div>

    <div ref="homeContent" class="home-page__content">
      <HomeContentSection />
    </div>
  </div>
</template>

<style scoped>
.home-page {
  position: relative;
}

.home-page__hero-stage {
  position: sticky;
  z-index: 1;
  top: 0;
  height: 100dvh;
  min-height: 620px;
  transform-origin: center top;
  will-change: transform, opacity;
}

.home-page__content {
  position: relative;
  z-index: 2;
  margin-top: -1px;
  scroll-margin-top: 82px;
  transform-origin: center top;
  will-change: transform, opacity;
}

@media (max-width: 720px) {
  .home-page__hero-stage {
    min-height: 560px;
  }
}
</style>
