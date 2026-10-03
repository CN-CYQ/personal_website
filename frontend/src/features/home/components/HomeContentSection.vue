<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

import HeroWeatherCard from '@/features/weather/components/HeroWeatherCard.vue'

import DiscoveryGalleryCard from './DiscoveryGalleryCard.vue'
import RecentActivityCard from './RecentActivityCard.vue'

interface PostPreview {
  id: string
  category: string
  title: string
  summary: string
  date: string
  readingTime: string
}

const postPreviews: PostPreview[] = [
  {
    id: 'design-density',
    category: '设计系统',
    title: '密度、节奏与界面的呼吸感',
    summary:
      '从信息密度、间距系统和动效节奏出发，整理一套可持续扩展的页面设计方法。',
    date: '2026 · 09 · 27',
    readingTime: '8 min',
  },
  {
    id: 'frontend-notes',
    category: '开发笔记',
    title: '把复杂交互拆成可维护的页面状态',
    summary:
      '在 Vue 中组织动效、滚动状态和组件生命周期，让视觉体验保持稳定可控。',
    date: '2026 · 09 · 18',
    readingTime: '12 min',
  },
  {
    id: 'personal-site',
    category: '项目记录',
    title: '个人站点的视觉系统如何持续生长',
    summary:
      '记录草浪首页、玻璃组件和内容结构的迭代过程，以及设计取舍背后的原因。',
    date: '2026 · 09 · 08',
    readingTime: '6 min',
  },
]

const categories = [
  { label: '设计系统', count: 12 },
  { label: '前端开发', count: 18 },
  { label: '项目复盘', count: 9 },
  { label: '生活记录', count: 24 },
]

const tags = ['Vue', 'TypeScript', 'Motion', 'Design Token', 'Vite', 'Notes']

const sectionRef = ref<HTMLElement | null>(null)
const isRevealed = ref(false)
const isActive = ref(false)

let revealObserver: IntersectionObserver | undefined
let activeObserver: IntersectionObserver | undefined

onMounted(() => {
  const target = sectionRef.value

  if (!target) {
    return
  }

  if (typeof IntersectionObserver === 'undefined') {
    isActive.value = true
  } else {
    // Ambient motion stays paused while the section is off screen, so the
    // hero's WebGL loop and this section never animate at the same time.
    activeObserver = new IntersectionObserver(
      (entries) => {
        isActive.value = entries.some((entry) => entry.isIntersecting)
      },
      { rootMargin: '140px 0px 140px 0px', threshold: 0 },
    )
    activeObserver.observe(target)
  }

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches

  if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
    isRevealed.value = true
    return
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) {
        return
      }

      isRevealed.value = true
      revealObserver?.disconnect()
      revealObserver = undefined
    },
    {
      rootMargin: '0px 0px -12% 0px',
      threshold: 0.14,
    },
  )

  revealObserver.observe(target)
})

onBeforeUnmount(() => {
  revealObserver?.disconnect()
  revealObserver = undefined
  activeObserver?.disconnect()
  activeObserver = undefined
})
</script>

<template>
  <section
    id="home-content"
    ref="sectionRef"
    class="home-content"
    :class="{ 'is-revealed': isRevealed, 'is-active': isActive }"
    aria-labelledby="home-content-title"
    tabindex="-1"
  >
    <div class="home-content__atmosphere" aria-hidden="true">
      <span class="home-content__glow home-content__glow--sun" />
      <span class="home-content__glow home-content__glow--sky" />
      <span class="home-content__glow home-content__glow--deep" />
      <span class="home-content__filaments">
        <i v-for="filament in 9" :key="filament" />
      </span>
    </div>

    <div class="home-content__inner">
      <header class="home-content__intro">
        <p class="hc-eyebrow">Home archive</p>
        <h2 id="home-content-title">记录正在发生的<em>思考</em></h2>
        <span class="home-content__lede">
          从设计系统到前端实现，把每一次探索整理成可以继续生长的内容。
        </span>
      </header>

      <div class="home-content__mobile-art">
        <DiscoveryGalleryCard />
        <RecentActivityCard />
      </div>

      <div class="home-content__grid">
        <aside class="home-content__sidebar home-content__sidebar--left">
          <section class="profile-summary" aria-labelledby="profile-title">
            <div class="profile-summary__mark">CY</div>
            <div>
              <p class="hc-eyebrow">Personal workspace</p>
              <h3 id="profile-title">CN-CYQ</h3>
              <p class="profile-summary__bio">
                物物而不物于物，念念而不念于念。
              </p>
            </div>
            <dl class="profile-summary__stats">
              <div>
                <dt>文章</dt>
                <dd>42</dd>
              </div>
              <div>
                <dt>项目</dt>
                <dd>18</dd>
              </div>
              <div>
                <dt>动态</dt>
                <dd>96</dd>
              </div>
            </dl>
          </section>

          <section class="weather-panel" aria-label="当前天气">
            <HeroWeatherCard class="weather-panel__card" instance-id="content-weather" />
          </section>

          <section class="content-card profile-note" aria-labelledby="profile-note-title">
            <p class="hc-eyebrow">Now</p>
            <h3 id="profile-note-title">保持好奇，持续记录</h3>
            <p>
              最近在整理个人网站的内容结构，也在尝试让动效更克制、更贴近阅读节奏。
            </p>
          </section>
        </aside>

        <div class="home-content__feed">
          <div class="home-content__feed-heading">
            <div>
              <p class="hc-eyebrow">Latest notes</p>
              <h3>最新内容</h3>
            </div>
            <span>03 / 42</span>
          </div>

          <article v-for="(post, index) in postPreviews" :key="post.id" class="post-preview">
            <div class="post-preview__index">
              {{ String(index + 1).padStart(2, '0') }}
            </div>
            <div class="post-preview__body">
              <div class="post-preview__meta">
                <span>{{ post.category }}</span>
                <time>{{ post.date }}</time>
              </div>
              <h3>{{ post.title }}</h3>
              <p>{{ post.summary }}</p>
            </div>
            <span class="post-preview__reading">{{ post.readingTime }}</span>
          </article>
        </div>

        <aside class="home-content__sidebar home-content__sidebar--right">
          <section class="content-card" aria-labelledby="category-title">
            <p class="hc-eyebrow">Explore</p>
            <h3 id="category-title">内容分类</h3>
            <ul class="category-list">
              <li v-for="category in categories" :key="category.label">
                <span>{{ category.label }}</span>
                <small>{{ category.count }}</small>
              </li>
            </ul>
          </section>

          <section class="content-card" aria-labelledby="tag-title">
            <p class="hc-eyebrow">Index</p>
            <h3 id="tag-title">常用标签</h3>
            <ul class="tag-list">
              <li v-for="tag in tags" :key="tag">{{ tag }}</li>
            </ul>
          </section>

          <section class="content-card site-status-card" aria-labelledby="status-title">
            <p class="hc-eyebrow">Status</p>
            <h3 id="status-title">站点状态</h3>
            <div class="site-status-card__row">
              <span><i aria-hidden="true" />运行中</span>
              <strong>99.9%</strong>
            </div>
            <div class="site-status-card__row">
              <span>最近更新</span>
              <strong>今天</strong>
            </div>
          </section>
        </aside>
      </div>

      <footer class="home-content__footer">
        <div>
          <strong>CN-CYQ</strong>
          <span>Personal website and archive</span>
        </div>
        <nav aria-label="页脚导航">
          <a href="#home-content">内容</a>
          <a href="/rss.xml">RSS</a>
          <a href="/sitemap-index.xml">Sitemap</a>
        </nav>
        <p>© 2026 CN-CYQ. All rights reserved.</p>
      </footer>
    </div>
  </section>
</template>

<style scoped>
.home-content {
  --hc-serif: "Iowan Old Style", "Baskerville", Georgia, serif;
  --hc-heading: #0e2f47;
  --hc-ink: #10344c;
  --hc-ink-soft: rgb(16 52 76 / 68%);
  --hc-muted: rgb(22 68 98 / 52%);
  --hc-accent: #3d84b6;
  --hc-accent-strong: #2d6d9c;
  --hc-accent-text: #1b5c86;
  --hc-cyan: #6db6da;
  --hc-line: rgb(30 78 110 / 14%);
  --hc-line-soft: rgb(30 78 110 / 8%);
  --hc-panel: rgb(255 255 255 / 58%);
  --hc-panel-2: rgb(228 242 251 / 40%);
  --hc-panel-border: rgb(255 255 255 / 72%);
  --hc-shadow: rgb(30 78 112 / 14%);
  --hc-warm: #f0ebdc;
  --hc-warm-soft: rgb(240 235 220 / 46%);
  --hc-warm-line: rgb(240 235 220 / 72%);
  --hc-warm-deep: rgb(214 184 128 / 82%);

  position: relative;
  z-index: 5;
  min-height: 100dvh;
  overflow: hidden;
  padding: clamp(72px, 10vw, 132px) clamp(18px, 4vw, 68px) clamp(32px, 5vw, 72px);
  color: var(--hc-ink);
  background:
    radial-gradient(96% 66% at 96% -6%,
      rgb(240 235 220 / 82%) 0%,
      rgb(240 235 220 / 38%) 24%,
      rgb(240 235 220 / 12%) 44%,
      transparent 62%),
    radial-gradient(64% 34% at 100% 104%,
      rgb(240 235 220 / 40%) 0%,
      transparent 68%),
    linear-gradient(180deg,
      rgb(198 224 240 / 0%) 0%,
      rgb(198 224 240 / 0%) 7%,
      rgb(198 224 240 / 30%) 15%,
      rgb(193 221 239 / 74%) 23%,
      #c2dcee 31%,
      #b4d1e8 52%,
      #a2c5e0 76%,
      #90b7d5 100%);
}

/* fine sky grid */
.home-content::before {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image:
    linear-gradient(rgb(255 255 255 / 9%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 9%) 1px, transparent 1px);
  background-size: 46px 46px;
  content: '';
  mask-image: linear-gradient(180deg, rgb(0 0 0 / 34%), transparent 72%);
  -webkit-mask-image: linear-gradient(180deg, rgb(0 0 0 / 34%), transparent 72%);
  pointer-events: none;
}

/* seam that blends the hero above into this section */
.home-content::after {
  position: absolute;
  z-index: 0;
  top: 0;
  right: 0;
  left: 0;
  height: clamp(150px, 22vw, 260px);
  background:
    linear-gradient(100deg,
      rgb(240 235 220 / 0%) 34%,
      rgb(240 235 220 / 34%) 72%,
      rgb(240 235 220 / 62%) 100%),
    linear-gradient(180deg,
      rgb(214 235 248 / 0%) 0%,
      rgb(214 235 248 / 22%) 28%,
      rgb(214 235 248 / 66%) 66%,
      rgb(214 235 248 / 96%) 100%);
  content: '';
  mask-image: linear-gradient(180deg,
      transparent 0%,
      rgb(0 0 0 / 24%) 12%,
      rgb(0 0 0 / 78%) 56%,
      #000 100%);
  -webkit-mask-image: linear-gradient(180deg,
      transparent 0%,
      rgb(0 0 0 / 24%) 12%,
      rgb(0 0 0 / 78%) 56%,
      #000 100%);
  pointer-events: none;
}

.home-content__atmosphere {
  position: absolute;
  z-index: 0;
  inset: 0;
  overflow: hidden;
  contain: layout paint style;
  pointer-events: none;
}

.home-content__glow {
  position: absolute;
  border-radius: 50%;
  opacity: 0.9;
  will-change: transform, opacity;
  animation-play-state: paused;
}

/* warm sun in the top-right corner, echoing the reference palette */
.home-content__glow--sun {
  top: -14%;
  right: -12%;
  width: min(56vw, 720px);
  aspect-ratio: 1;
  background: radial-gradient(circle,
    rgb(240 235 220 / 88%) 0%,
    rgb(240 235 220 / 36%) 38%,
    transparent 70%);
  animation: hc-breathe 14s ease-in-out infinite alternate;
}

.home-content__glow--sky {
  top: 14%;
  left: -18%;
  width: min(48vw, 640px);
  aspect-ratio: 1;
  background: radial-gradient(circle,
    rgb(226 242 252 / 66%) 0%,
    rgb(190 220 241 / 24%) 44%,
    transparent 72%);
  animation: hc-breathe 11s ease-in-out infinite alternate-reverse;
}

.home-content__glow--deep {
  bottom: -22%;
  left: 32%;
  width: min(56vw, 700px);
  aspect-ratio: 1;
  background: radial-gradient(circle,
    rgb(120 172 212 / 34%) 0%,
    rgb(120 172 212 / 12%) 46%,
    transparent 74%);
  animation: hc-breathe 18s ease-in-out infinite alternate;
}

/* pale light filaments standing in for the meadow edge */
.home-content__filaments {
  position: absolute;
  right: 0;
  bottom: -4%;
  left: 0;
  display: flex;
  height: clamp(180px, 32vh, 360px);
  justify-content: center;
  gap: 2.6vw;
  opacity: 0.5;
  mask-image: linear-gradient(180deg, transparent, #000 58%);
  -webkit-mask-image: linear-gradient(180deg, transparent, #000 58%);
}

.home-content__filaments i {
  width: 1px;
  height: 88%;
  background: linear-gradient(180deg,
    rgb(255 255 255 / 0%),
    rgb(238 249 255 / 74%) 42%,
    rgb(130 176 210 / 0%));
  transform-origin: bottom center;
  will-change: transform;
  animation: hc-current 7.5s ease-in-out infinite alternate;
  animation-play-state: paused;
}

.home-content__filaments i:nth-child(2n) {
  height: 72%;
  opacity: 0.72;
  animation-duration: 9.5s;
}

.home-content__filaments i:nth-child(3n) {
  height: 96%;
  animation-duration: 11s;
}

.home-content__filaments i:nth-child(4n) {
  width: 2px;
  opacity: 0.86;
}

.home-content__inner {
  position: relative;
  z-index: 1;
  display: grid;
  width: min(100%, 1440px);
  gap: clamp(42px, 5vw, 76px);
  margin: 0 auto;
}

.home-content__intro {
  display: grid;
  max-width: 780px;
  gap: 16px;
}

.hc-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  color: var(--hc-accent-strong);
  font-size: 0.72rem;
  font-weight: 800;
}

.hc-eyebrow::before {
  width: 18px;
  height: 1px;
  background: linear-gradient(90deg, var(--hc-warm-deep), var(--hc-accent));
  content: '';
}

.home-content__intro h2 {
  margin: 0;
  color: var(--hc-heading);
  font-family: var(--hc-serif);
  font-size: 4.4rem;
  font-weight: 500;
  line-height: 1.02;
}

.home-content__intro h2 em {
  position: relative;
  color: var(--hc-accent-strong);
  font-style: normal;
  white-space: nowrap;
}

.home-content__intro h2 em::after {
  position: absolute;
  right: -0.04em;
  bottom: 0.1em;
  left: -0.04em;
  height: 0.12em;
  border-radius: 999px;
  background: linear-gradient(90deg,
    rgb(109 182 218 / 0%),
    rgb(109 182 218 / 58%) 44%,
    rgb(214 184 128 / 80%) 78%,
    rgb(240 235 220 / 0%));
  content: '';
}

.home-content__lede {
  max-width: 620px;
  color: var(--hc-ink-soft);
  font-size: 1rem;
  line-height: 1.85;
}

.home-content__grid {
  position: relative;
  display: grid;
  grid-template-columns: minmax(220px, 17.5rem) minmax(0, 1fr) minmax(220px, 17.5rem);
  align-items: start;
  gap: clamp(18px, 2vw, 30px);
}

/* an arc of sky behind the grid, purely geometric */
.home-content__grid::before {
  position: absolute;
  top: -130px;
  right: -150px;
  width: 460px;
  height: 460px;
  border: 1px solid rgb(120 168 205 / 24%);
  border-radius: 50%;
  content: '';
  mask-image: linear-gradient(205deg, #000, transparent 68%);
  -webkit-mask-image: linear-gradient(205deg, #000, transparent 68%);
  pointer-events: none;
}

.home-content__mobile-art {
  display: none;
}

.home-content__sidebar {
  position: sticky;
  top: 112px;
  display: grid;
  gap: 18px;
}

.home-content__feed {
  display: grid;
  align-content: start;
}

.profile-summary {
  position: relative;
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr);
  gap: 16px;
  overflow: hidden;
  padding: 22px;
  border: 1px solid var(--hc-panel-border);
  border-radius: 22px;
  background: linear-gradient(150deg, var(--hc-panel), var(--hc-panel-2));
  box-shadow:
    0 20px 46px var(--hc-shadow),
    inset 0 1px 0 rgb(255 255 255 / 88%);
  backdrop-filter: blur(10px) saturate(124%);
  -webkit-backdrop-filter: blur(10px) saturate(124%);
}

.profile-summary::before {
  position: absolute;
  top: 22px;
  bottom: 22px;
  left: 0;
  width: 3px;
  border-radius: 0 999px 999px 0;
  background: linear-gradient(180deg, var(--hc-cyan), rgb(61 132 182 / 10%));
  content: '';
}

.profile-summary__mark {
  position: relative;
  display: grid;
  width: 56px;
  height: 56px;
  place-items: center;
  border: 1px solid rgb(255 255 255 / 84%);
  border-radius: 50%;
  color: var(--hc-accent-text);
  background:
    radial-gradient(circle at 34% 24%, rgb(255 255 255 / 88%), transparent 42%),
    radial-gradient(circle at 74% 78%, rgb(240 235 220 / 82%), transparent 46%),
    linear-gradient(150deg, #d7ecf9, #8dc0de);
  box-shadow: 0 12px 26px rgb(34 88 126 / 18%);
  font-size: 0.82rem;
  font-weight: 800;
}

.profile-summary__mark::after {
  position: absolute;
  inset: -6px;
  border: 1px dashed rgb(61 132 182 / 34%);
  border-radius: 50%;
  content: '';
  animation: hc-orbit 22s linear infinite;
  animation-play-state: paused;
}

.profile-summary h3,
.content-card h3 {
  margin: 8px 0 0;
  color: var(--hc-heading);
  font-size: 1.05rem;
  font-weight: 750;
}

.profile-summary__bio {
  margin: 8px 0 0;
  color: var(--hc-ink-soft);
  font-size: 0.84rem;
  line-height: 1.75;
}

.profile-summary__stats {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin: 8px 0 0;
  padding-top: 16px;
  border-top: 1px solid var(--hc-line);
}

.profile-summary__stats div {
  display: grid;
}

.profile-summary__stats dt {
  color: var(--hc-muted);
  font-size: 0.68rem;
}

.profile-summary__stats dd {
  margin: 4px 0 0;
  color: var(--hc-accent-text);
  font-size: 1.15rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.weather-panel {
  display: none;
  justify-items: stretch;
}

.weather-panel :deep(.hero-weather),
.weather-panel :deep(.hero-weather.is-expanded) {
  width: 100%;
}

.content-card {
  position: relative;
  display: grid;
  gap: 14px;
  padding: 22px;
  border: 1px solid var(--hc-line);
  border-radius: 18px;
  background: linear-gradient(160deg,
    rgb(255 255 255 / 62%),
    rgb(240 235 220 / 30%) 58%,
    rgb(233 245 252 / 34%));
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 82%);
  transition:
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1),
    border-color 220ms ease,
    box-shadow 220ms ease;
}

.content-card:hover {
  border-color: rgb(214 184 128 / 52%);
  box-shadow:
    0 16px 34px rgb(30 78 112 / 10%),
    inset 0 1px 0 rgb(255 255 255 / 84%);
  transform: translateY(-3px);
}

.content-card > p:not(.hc-eyebrow) {
  margin: 0;
  color: var(--hc-ink-soft);
  font-size: 0.84rem;
  line-height: 1.75;
}

.home-content__feed-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding: 4px 4px 18px;
  border-bottom: 1px solid var(--hc-line);
}

.home-content__feed-heading h3 {
  margin: 8px 0 0;
  color: var(--hc-heading);
  font-family: var(--hc-serif);
  font-size: 1.7rem;
  font-weight: 500;
}

.home-content__feed-heading > span {
  color: var(--hc-muted);
  font-size: 0.78rem;
  font-variant-numeric: tabular-nums;
}

.post-preview {
  position: relative;
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr) auto;
  align-items: start;
  gap: 18px;
  padding: 26px 10px 26px 4px;
  border-bottom: 1px solid var(--hc-line-soft);
}

.post-preview::before {
  position: absolute;
  inset: 6px -14px;
  z-index: 0;
  border-radius: 18px;
  background: linear-gradient(115deg,
    rgb(255 255 255 / 62%),
    rgb(240 235 220 / 44%) 62%,
    rgb(222 239 250 / 26%));
  content: '';
  opacity: 0;
  transform: scale(0.985);
  transition:
    opacity 260ms ease,
    transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
}

.post-preview::after {
  position: absolute;
  top: 22px;
  bottom: 22px;
  left: -6px;
  width: 2px;
  border-radius: 999px;
  background: linear-gradient(180deg, var(--hc-warm), var(--hc-accent));
  content: '';
  opacity: 0;
  transform: scaleY(0.3);
  transform-origin: top center;
  transition:
    opacity 240ms ease,
    transform 240ms cubic-bezier(0.22, 1, 0.36, 1);
}

.post-preview:hover::before,
.post-preview:focus-within::before {
  opacity: 1;
  transform: scale(1);
}

.post-preview:hover::after,
.post-preview:focus-within::after {
  opacity: 1;
  transform: scaleY(1);
}

.post-preview > * {
  position: relative;
  z-index: 1;
}

.post-preview__index {
  color: rgb(45 109 156 / 40%);
  font-family: var(--hc-serif);
  font-size: 1.5rem;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  transition: color 220ms ease;
}

.post-preview:hover .post-preview__index {
  color: var(--hc-accent-strong);
}

.post-preview__body {
  min-width: 0;
}

.post-preview__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  color: var(--hc-muted);
  font-size: 0.72rem;
  font-weight: 700;
}

.post-preview__meta span {
  color: var(--hc-accent-text);
}

.post-preview__meta time::before {
  margin-right: 10px;
  content: '·';
}

.post-preview h3 {
  margin: 0;
  color: var(--hc-heading);
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 1.32;
}

.post-preview p {
  margin: 12px 0 0;
  color: var(--hc-ink-soft);
  font-size: 0.86rem;
  line-height: 1.78;
}

.post-preview__reading {
  align-self: start;
  padding: 6px 12px;
  border: 1px solid rgb(255 255 255 / 82%);
  border-radius: 999px;
  color: var(--hc-accent-text);
  background: linear-gradient(120deg, rgb(255 255 255 / 66%), rgb(240 235 220 / 56%));
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 80%);
  font-size: 0.66rem;
  font-weight: 750;
  white-space: nowrap;
}

.category-list,
.tag-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.category-list {
  display: grid;
}

.category-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 8px 9px 0;
  border-bottom: 1px solid var(--hc-line-soft);
  color: var(--hc-ink-soft);
  font-size: 0.82rem;
  transition:
    color 200ms ease,
    padding-left 200ms ease;
}

.category-list li:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.category-list li:hover {
  padding-left: 6px;
  color: var(--hc-accent-strong);
}

.category-list small {
  color: var(--hc-muted);
  font-size: 0.68rem;
  font-variant-numeric: tabular-nums;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-list li {
  padding: 7px 12px;
  border: 1px solid rgb(255 255 255 / 66%);
  border-radius: 999px;
  color: rgb(30 82 116 / 78%);
  background: rgb(255 255 255 / 40%);
  font-size: 0.7rem;
  font-weight: 700;
  transition:
    transform 200ms ease,
    color 200ms ease,
    background 200ms ease;
}

.tag-list li:hover {
  color: var(--hc-accent-strong);
  background: var(--hc-warm);
  transform: translateY(-2px);
}

.site-status-card {
  gap: 12px;
}

.site-status-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: var(--hc-ink-soft);
  font-size: 0.78rem;
}

.site-status-card__row span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.site-status-card__row i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #4aa8d8;
  box-shadow:
    0 0 0 4px rgb(74 168 216 / 16%),
    0 0 14px rgb(74 168 216 / 46%);
  animation: hc-pulse 2.4s ease-in-out infinite;
  animation-play-state: paused;
}

.site-status-card__row strong {
  color: var(--hc-accent-text);
  font-size: 0.76rem;
  font-variant-numeric: tabular-nums;
}

.home-content__footer {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 24px;
  padding-top: 28px;
  border-top: 1px solid var(--hc-line);
  color: var(--hc-muted);
  font-size: 0.74rem;
}

.home-content__footer > div {
  display: grid;
  gap: 4px;
}

.home-content__footer strong {
  color: var(--hc-heading);
  font-size: 0.84rem;
}

.home-content__footer nav {
  display: flex;
  align-items: center;
  gap: 18px;
}

.home-content__footer a {
  position: relative;
  transition: color 180ms ease;
}

.home-content__footer a::after {
  position: absolute;
  right: 0;
  bottom: -3px;
  left: 0;
  height: 1px;
  background: currentColor;
  content: '';
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.home-content__footer a:hover,
.home-content__footer a:focus-visible {
  color: var(--hc-heading);
}

.home-content__footer a:hover::after,
.home-content__footer a:focus-visible::after {
  transform: scaleX(1);
}

.home-content__footer p {
  margin: 0;
  text-align: right;
}

.home-content a:focus-visible,
.home-content button:focus-visible,
.home-content [tabindex]:focus-visible {
  border-radius: 6px;
  outline: 2px solid rgb(45 109 156 / 72%);
  outline-offset: 4px;
}

/* scroll reveal */
.home-content__intro,
.profile-summary,
.content-card,
.post-preview,
.home-content__mobile-art,
.weather-panel,
.home-content__footer {
  opacity: 0;
  transform: translateY(22px);
  transition:
    opacity 760ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 760ms cubic-bezier(0.22, 1, 0.36, 1);
}

.home-content.is-revealed .home-content__intro,
.home-content.is-revealed .profile-summary,
.home-content.is-revealed .content-card,
.home-content.is-revealed .post-preview,
.home-content.is-revealed .home-content__mobile-art,
.home-content.is-revealed .weather-panel,
.home-content.is-revealed .home-content__footer {
  opacity: 1;
  transform: translateY(0);
}

.home-content.is-revealed .home-content__intro {
  transition-delay: 40ms;
}

.home-content.is-revealed .profile-summary {
  transition-delay: 160ms;
}

.home-content.is-revealed .home-content__sidebar--left .content-card {
  transition-delay: 250ms;
}

.home-content.is-revealed .weather-panel {
  transition-delay: 200ms;
}

.home-content.is-revealed .post-preview:nth-of-type(1) {
  transition-delay: 190ms;
}

.home-content.is-revealed .post-preview:nth-of-type(2) {
  transition-delay: 280ms;
}

.home-content.is-revealed .post-preview:nth-of-type(3) {
  transition-delay: 370ms;
}

.home-content.is-revealed .home-content__sidebar--right .content-card:nth-child(1) {
  transition-delay: 240ms;
}

.home-content.is-revealed .home-content__sidebar--right .content-card:nth-child(2) {
  transition-delay: 330ms;
}

.home-content.is-revealed .home-content__sidebar--right .content-card:nth-child(3) {
  transition-delay: 420ms;
}

.home-content.is-revealed .home-content__footer {
  transition-delay: 470ms;
}

/* ambient motion only runs while the section is near the viewport */
.home-content.is-active .home-content__glow,
.home-content.is-active .home-content__filaments i,
.home-content.is-active .profile-summary__mark::after,
.home-content.is-active .site-status-card__row i {
  animation-play-state: running;
}

@keyframes hc-breathe {
  from {
    opacity: 0.62;
    transform: scale(0.94);
  }

  to {
    opacity: 1;
    transform: scale(1.06);
  }
}

@keyframes hc-current {
  from {
    transform: translateY(4%) scaleY(0.94) rotate(-1.1deg);
  }

  to {
    transform: translateY(-3%) scaleY(1.03) rotate(1.1deg);
  }
}

@keyframes hc-orbit {
  to {
    transform: rotate(360deg);
  }
}

@keyframes hc-pulse {
  50% {
    opacity: 0.55;
    transform: scale(0.82);
  }
}

[data-theme='dark'] .home-content {
  --hc-heading: #dcecf7;
  --hc-ink: #cfe4f2;
  --hc-ink-soft: rgb(190 218 236 / 70%);
  --hc-muted: rgb(150 190 216 / 56%);
  --hc-accent: #6fb4de;
  --hc-accent-strong: #8fc9ec;
  --hc-accent-text: #9fd3ef;
  --hc-cyan: #79c6e6;
  --hc-line: rgb(120 175 215 / 16%);
  --hc-line-soft: rgb(120 175 215 / 10%);
  --hc-panel: rgb(14 38 60 / 62%);
  --hc-panel-2: rgb(8 24 40 / 40%);
  --hc-panel-border: rgb(96 152 196 / 26%);
  --hc-shadow: rgb(0 8 20 / 34%);
  --hc-warm: rgb(240 235 220 / 20%);
  --hc-warm-soft: rgb(240 235 220 / 14%);
  --hc-warm-line: rgb(240 235 220 / 24%);
  --hc-warm-deep: rgb(214 184 128 / 58%);

  background:
    radial-gradient(88% 60% at 98% -8%,
      rgb(240 235 220 / 14%) 0%,
      rgb(240 235 220 / 6%) 30%,
      transparent 58%),
    linear-gradient(180deg,
      rgb(4 15 28 / 0%) 0%,
      rgb(4 15 28 / 0%) 7%,
      rgb(5 19 34 / 34%) 15%,
      rgb(5 20 36 / 78%) 23%,
      #061726 31%,
      #082034 52%,
      #0b2a42 76%,
      #0e3350 100%);
}

[data-theme='dark'] .home-content::before {
  background-image:
    linear-gradient(rgb(120 175 215 / 6%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(120 175 215 / 6%) 1px, transparent 1px);
}

[data-theme='dark'] .home-content::after {
  background:
    linear-gradient(100deg,
      rgb(240 235 220 / 0%) 40%,
      rgb(240 235 220 / 8%) 76%,
      rgb(240 235 220 / 16%) 100%),
    linear-gradient(180deg,
      rgb(12 34 56 / 0%) 0%,
      rgb(12 34 56 / 22%) 28%,
      rgb(12 34 56 / 68%) 66%,
      rgb(12 34 56 / 96%) 100%);
}

[data-theme='dark'] .home-content__glow--sky {
  background: radial-gradient(circle,
    rgb(96 152 208 / 34%) 0%,
    rgb(60 110 160 / 16%) 40%,
    transparent 72%);
}

[data-theme='dark'] .home-content__glow--sun {
  background: radial-gradient(circle,
    rgb(214 184 140 / 22%) 0%,
    rgb(170 140 96 / 10%) 44%,
    transparent 72%);
}

[data-theme='dark'] .home-content__glow--deep {
  background: radial-gradient(circle,
    rgb(40 90 140 / 30%) 0%,
    rgb(30 70 115 / 12%) 48%,
    transparent 76%);
}

[data-theme='dark'] .home-content__filaments i {
  background: linear-gradient(180deg,
    rgb(140 200 240 / 0%),
    rgb(150 205 240 / 40%) 44%,
    rgb(120 175 215 / 0%));
}

[data-theme='dark'] .home-content__grid::before {
  border-color: rgb(110 165 210 / 20%);
}

[data-theme='dark'] .profile-summary__mark {
  border-color: rgb(120 180 220 / 32%);
  color: #acdaf2;
  background:
    radial-gradient(circle at 34% 24%, rgb(170 215 240 / 24%), transparent 42%),
    radial-gradient(circle at 74% 78%, rgb(214 184 140 / 26%), transparent 46%),
    linear-gradient(150deg, #1d4664, #143149);
}

[data-theme='dark'] .content-card {
  background: linear-gradient(160deg,
    rgb(14 38 60 / 56%),
    rgb(28 40 44 / 30%) 58%,
    rgb(8 24 40 / 30%));
  box-shadow: inset 0 1px 0 rgb(140 190 230 / 12%);
}

[data-theme='dark'] .content-card:hover {
  border-color: rgb(120 180 220 / 34%);
  box-shadow:
    0 16px 34px rgb(0 8 20 / 26%),
    inset 0 1px 0 rgb(140 190 230 / 16%);
}

[data-theme='dark'] .post-preview::before {
  background: linear-gradient(115deg, rgb(20 48 74 / 62%), rgb(10 28 46 / 26%));
}

[data-theme='dark'] .post-preview__reading,
[data-theme='dark'] .tag-list li {
  border-color: rgb(110 165 210 / 22%);
  color: rgb(160 205 232 / 78%);
  background: rgb(12 34 54 / 48%);
  box-shadow: inset 0 1px 0 rgb(140 190 230 / 12%);
}

[data-theme='dark'] .tag-list li:hover {
  color: #bfe2f5;
  background: rgb(90 150 200 / 24%);
}

@media (max-width: 1120px) {
  .home-content__intro h2 {
    font-size: 3.6rem;
  }

  .home-content__grid {
    grid-template-columns: minmax(200px, 15rem) minmax(0, 1fr);
  }

  .home-content__sidebar--right {
    position: static;
    grid-column: 1 / -1;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .home-content {
    padding-inline: 16px;
    padding-top: 104px;
  }

  .home-content__intro h2 {
    font-size: 2.9rem;
  }

  .home-content__grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .home-content__mobile-art {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
    gap: 18px;
  }

  /* the shared hero cards use white type, so give them a deeper sky surface here */
  .home-content__mobile-art :deep(.gallery-card),
  .home-content__mobile-art :deep(.activity-card) {
    border-color: rgb(120 180 220 / 26%);
    background: linear-gradient(150deg, rgb(52 104 144 / 94%), rgb(24 64 96 / 92%));
    box-shadow:
      0 22px 50px rgb(18 54 84 / 24%),
      inset 0 1px 0 rgb(140 190 230 / 16%);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  .home-content__mobile-art :deep(.gallery-card__eyebrow),
  .home-content__mobile-art :deep(.activity-card h2) {
    color: rgb(178 218 242 / 90%);
  }

  .home-content__mobile-art :deep(.activity-card__year) {
    color: rgb(148 198 228 / 62%);
  }

  .home-content__sidebar {
    position: static;
  }

  .home-content__sidebar--left {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .profile-summary,
  .weather-panel {
    grid-column: 1 / -1;
  }

  .weather-panel {
    display: grid;
  }

  .home-content__sidebar--right {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .site-status-card {
    grid-column: 1 / -1;
  }

  .home-content__footer {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .home-content__footer p {
    grid-column: 1 / -1;
    text-align: left;
  }
}

@media (max-width: 520px) {
  .home-content__intro h2 {
    font-size: 2.5rem;
  }

  .home-content__sidebar--left,
  .home-content__sidebar--right,
  .home-content__mobile-art {
    grid-template-columns: minmax(0, 1fr);
  }

  .profile-summary,
  .weather-panel,
  .site-status-card {
    grid-column: auto;
  }

  .post-preview {
    grid-template-columns: 34px minmax(0, 1fr);
    gap: 12px;
    padding: 20px 4px;
  }

  .post-preview h3 {
    font-size: 1.15rem;
  }

  .post-preview__reading {
    grid-column: 2;
    justify-self: start;
  }

  .home-content__footer {
    grid-template-columns: minmax(0, 1fr);
  }

  .home-content__footer nav {
    flex-wrap: wrap;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-content__intro,
  .profile-summary,
  .content-card,
  .post-preview,
  .home-content__mobile-art,
  .weather-panel,
  .home-content__footer {
    opacity: 1;
    transform: none;
    transition: none;
  }

  .home-content__glow,
  .home-content__filaments i,
  .profile-summary__mark::after,
  .site-status-card__row i {
    animation: none;
  }

  .post-preview::before,
  .post-preview::after,
  .content-card,
  .tag-list li {
    transition: none;
  }
}
</style>
