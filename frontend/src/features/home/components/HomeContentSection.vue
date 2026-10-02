<script setup lang="ts">
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
</script>

<template>
  <section
    id="home-content"
    class="home-content"
    aria-labelledby="home-content-title"
    tabindex="-1"
  >
    <div class="home-content__orb home-content__orb--warm" aria-hidden="true" />
    <div class="home-content__orb home-content__orb--mint" aria-hidden="true" />

    <div class="home-content__inner">
      <header class="home-content__intro">
        <p>Home archive</p>
        <h2 id="home-content-title">记录正在发生的思考</h2>
        <span>
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
              <p class="profile-summary__eyebrow">Personal workspace</p>
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
            <HeroWeatherCard class="weather-panel__card" />
          </section>

          <section class="content-card profile-note" aria-labelledby="profile-note-title">
            <p class="content-card__eyebrow">Now</p>
            <h3 id="profile-note-title">保持好奇，持续记录</h3>
            <p>
              最近在整理个人网站的内容结构，也在尝试让动效更克制、更贴近阅读节奏。
            </p>
          </section>
        </aside>

        <div class="home-content__feed">
          <div class="home-content__feed-heading">
            <div>
              <p class="content-card__eyebrow">Latest notes</p>
              <h3>最新内容</h3>
            </div>
            <span>03 / 42</span>
          </div>

          <article
            v-for="(post, index) in postPreviews"
            :key="post.id"
            class="post-preview"
          >
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
            <p class="content-card__eyebrow">Explore</p>
            <h3 id="category-title">内容分类</h3>
            <ul class="category-list">
              <li v-for="category in categories" :key="category.label">
                <span>{{ category.label }}</span>
                <small>{{ category.count }}</small>
              </li>
            </ul>
          </section>

          <section class="content-card" aria-labelledby="tag-title">
            <p class="content-card__eyebrow">Index</p>
            <h3 id="tag-title">常用标签</h3>
            <ul class="tag-list">
              <li v-for="tag in tags" :key="tag">{{ tag }}</li>
            </ul>
          </section>

          <section class="content-card site-status-card" aria-labelledby="status-title">
            <p class="content-card__eyebrow">Status</p>
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
  position: relative;
  z-index: 5;
  min-height: 100dvh;
  overflow: hidden;
  padding: clamp(72px, 10vw, 132px) clamp(18px, 4vw, 68px)
    clamp(32px, 5vw, 72px);
  color: #153f3d;
  background:
    linear-gradient(180deg, #dfeae3 0%, #cadfd6 36%, #b8d2c9 100%);
}

.home-content::before {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgb(255 255 255 / 8%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 8%) 1px, transparent 1px);
  background-size: 44px 44px;
  content: '';
  mask-image: linear-gradient(180deg, rgb(0 0 0 / 42%), transparent 76%);
  pointer-events: none;
}

.home-content__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(16px);
  pointer-events: none;
}

.home-content__orb--warm {
  top: -160px;
  right: -80px;
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, rgb(255 228 174 / 66%), transparent 68%);
}

.home-content__orb--mint {
  bottom: -140px;
  left: -120px;
  width: 440px;
  height: 440px;
  background: radial-gradient(circle, rgb(112 184 158 / 42%), transparent 68%);
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
  max-width: 760px;
  gap: 12px;
}

.home-content__intro > p,
.content-card__eyebrow,
.profile-summary__eyebrow {
  margin: 0;
  color: #27705f;
  font-size: 0.66rem;
  font-weight: 820;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.home-content__intro h2 {
  margin: 0;
  color: #113d38;
  font-family: "Iowan Old Style", "Baskerville", Georgia, serif;
  font-size: clamp(2.5rem, 6vw, 5.7rem);
  font-weight: 500;
  line-height: 0.98;
}

.home-content__intro > span {
  max-width: 620px;
  color: rgb(21 63 61 / 68%);
  font-size: clamp(0.88rem, 1.3vw, 1.05rem);
  line-height: 1.8;
}

.home-content__grid {
  display: grid;
  grid-template-columns: minmax(220px, 17.5rem) minmax(0, 1fr) minmax(220px, 17.5rem);
  align-items: start;
  gap: clamp(18px, 2vw, 30px);
}

.home-content__mobile-art {
  display: none;
}

.home-content__sidebar,
.home-content__feed {
  display: grid;
  gap: 18px;
}

.home-content__sidebar {
  position: sticky;
  top: 112px;
}

.content-card,
.profile-summary,
.post-preview {
  border: 1px solid rgb(255 255 255 / 68%);
  border-radius: 16px;
  background:
    linear-gradient(145deg, rgb(255 255 255 / 68%), rgb(239 248 244 / 46%)),
    rgb(245 251 248 / 50%);
  box-shadow:
    0 18px 42px rgb(35 79 68 / 9%),
    inset 0 1px 0 rgb(255 255 255 / 86%);
  backdrop-filter: blur(18px) saturate(130%);
  -webkit-backdrop-filter: blur(18px) saturate(130%);
}

.content-card,
.profile-summary {
  padding: 20px;
}

.content-card {
  display: grid;
  gap: 12px;
}

.content-card h3,
.profile-summary h3,
.post-preview h3 {
  margin: 0;
  color: #123e39;
  font-weight: 800;
}

.content-card h3,
.profile-summary h3 {
  font-size: 1rem;
}

.content-card > p:not(.content-card__eyebrow),
.profile-summary__bio,
.profile-note > p:last-child {
  margin: 0;
  color: rgb(21 63 61 / 68%);
  font-size: 0.78rem;
  line-height: 1.7;
}

.profile-summary {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  gap: 14px;
}

.profile-summary__mark {
  display: grid;
  width: 52px;
  height: 52px;
  place-items: center;
  border: 1px solid rgb(255 255 255 / 82%);
  border-radius: 50%;
  color: #1f6655;
  background:
    radial-gradient(circle at 38% 26%, rgb(255 255 255 / 78%), transparent 38%),
    linear-gradient(145deg, #b8d8cd, #7fb89d);
  box-shadow: 0 9px 22px rgb(36 87 71 / 15%);
  font-size: 0.78rem;
  font-weight: 840;
}

.profile-summary__eyebrow {
  margin-bottom: 5px;
  font-size: 0.55rem;
  letter-spacing: 0.12em;
}

.profile-summary__bio {
  margin-top: 6px;
}

.profile-summary__stats {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin: 6px 0 0;
  padding-top: 14px;
  border-top: 1px solid rgb(31 96 78 / 10%);
}

.profile-summary__stats div {
  display: grid;
  gap: 3px;
}

.profile-summary__stats dt {
  color: rgb(20 66 57 / 54%);
  font-size: 0.62rem;
}

.profile-summary__stats dd {
  margin: 0;
  color: #1a5e4d;
  font-size: 1.05rem;
  font-weight: 820;
  font-variant-numeric: tabular-nums;
}

.weather-panel {
  display: grid;
  justify-items: stretch;
}

.weather-panel :deep(.hero-weather),
.weather-panel :deep(.hero-weather.is-expanded) {
  width: 100%;
}

.home-content__feed-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  padding: 4px 2px 6px;
}

.home-content__feed-heading h3 {
  margin: 5px 0 0;
  color: #123e39;
  font-size: 1.55rem;
}

.home-content__feed-heading > span {
  color: rgb(28 92 75 / 48%);
  font-size: 0.72rem;
  font-variant-numeric: tabular-nums;
}

.post-preview {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  gap: 16px;
  padding: 22px;
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.post-preview:hover {
  border-color: rgb(255 255 255 / 92%);
  box-shadow:
    0 24px 52px rgb(35 79 68 / 13%),
    inset 0 1px 0 rgb(255 255 255 / 92%);
  transform: translateY(-3px);
}

.post-preview__index {
  color: rgb(31 105 84 / 42%);
  font-family: "Iowan Old Style", "Baskerville", Georgia, serif;
  font-size: 1.2rem;
  font-variant-numeric: tabular-nums;
}

.post-preview__body {
  min-width: 0;
}

.post-preview__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 9px;
  color: rgb(25 85 70 / 56%);
  font-size: 0.64rem;
  font-weight: 760;
}

.post-preview__meta span {
  color: #24705b;
}

.post-preview__meta time::before {
  margin-right: 10px;
  content: '·';
}

.post-preview h3 {
  font-size: clamp(1.1rem, 2vw, 1.5rem);
  line-height: 1.28;
}

.post-preview p {
  margin: 11px 0 0;
  color: rgb(21 63 61 / 66%);
  font-size: 0.78rem;
  line-height: 1.72;
}

.post-preview__reading {
  align-self: start;
  padding: 5px 9px;
  border: 1px solid rgb(255 255 255 / 72%);
  border-radius: 999px;
  color: rgb(30 94 75 / 58%);
  background: rgb(255 255 255 / 38%);
  font-size: 0.58rem;
  font-weight: 760;
  white-space: nowrap;
}

.category-list,
.tag-list {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.category-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: rgb(21 63 61 / 72%);
  font-size: 0.76rem;
}

.category-list small {
  color: rgb(25 85 70 / 46%);
  font-size: 0.64rem;
  font-variant-numeric: tabular-nums;
}

.tag-list {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.tag-list li {
  padding: 7px 8px;
  border: 1px solid rgb(255 255 255 / 62%);
  border-radius: 999px;
  color: rgb(23 73 63 / 68%);
  background: rgb(255 255 255 / 34%);
  font-size: 0.62rem;
  font-weight: 720;
  text-align: center;
}

.site-status-card {
  gap: 9px;
}

.site-status-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: rgb(21 63 61 / 62%);
  font-size: 0.72rem;
}

.site-status-card__row span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.site-status-card__row i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #45b784;
  box-shadow: 0 0 0 4px rgb(69 183 132 / 14%);
}

.site-status-card__row strong {
  color: #1f6d57;
  font-size: 0.7rem;
  font-variant-numeric: tabular-nums;
}

.home-content__footer {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 24px;
  padding-top: 28px;
  border-top: 1px solid rgb(21 63 61 / 12%);
  color: rgb(21 63 61 / 60%);
  font-size: 0.68rem;
}

.home-content__footer > div {
  display: grid;
  gap: 3px;
}

.home-content__footer strong {
  color: #174b42;
  font-size: 0.78rem;
}

.home-content__footer nav {
  display: flex;
  align-items: center;
  gap: 18px;
}

.home-content__footer a:hover,
.home-content__footer a:focus-visible {
  color: #174b42;
  outline: none;
  text-decoration: underline;
  text-underline-offset: 4px;
}

.home-content__footer p {
  margin: 0;
  text-align: right;
}

[data-theme='dark'] .home-content {
  color: #b6d0dc;
  background:
    linear-gradient(180deg, #061521 0%, #0a1e2b 42%, #102b33 100%);
}

[data-theme='dark'] .home-content::before {
  background-image:
    linear-gradient(rgb(110 170 200 / 5%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(110 170 200 / 5%) 1px, transparent 1px);
}

[data-theme='dark'] .home-content__orb--warm {
  background: radial-gradient(circle, rgb(150 111 66 / 30%), transparent 68%);
}

[data-theme='dark'] .home-content__orb--mint {
  background: radial-gradient(circle, rgb(35 104 98 / 28%), transparent 68%);
}

[data-theme='dark'] .home-content__intro h2,
[data-theme='dark'] .content-card h3,
[data-theme='dark'] .profile-summary h3,
[data-theme='dark'] .post-preview h3,
[data-theme='dark'] .home-content__feed-heading h3 {
  color: #c7deea;
}

[data-theme='dark'] .home-content__intro > span,
[data-theme='dark'] .content-card > p:not(.content-card__eyebrow),
[data-theme='dark'] .profile-summary__bio,
[data-theme='dark'] .profile-note > p:last-child,
[data-theme='dark'] .post-preview p {
  color: rgb(168 202 218 / 66%);
}

[data-theme='dark'] .content-card,
[data-theme='dark'] .profile-summary,
[data-theme='dark'] .post-preview {
  border-color: rgb(78 135 170 / 24%);
  background:
    linear-gradient(145deg, rgb(11 32 48 / 76%), rgb(5 19 31 / 54%)),
    rgb(5 19 31 / 62%);
  box-shadow:
    0 18px 42px rgb(0 4 14 / 28%),
    inset 0 1px 0 rgb(130 180 210 / 14%);
}

[data-theme='dark'] .home-content__intro > p,
[data-theme='dark'] .content-card__eyebrow,
[data-theme='dark'] .profile-summary__eyebrow,
[data-theme='dark'] .post-preview__meta span {
  color: #78b7a7;
}

[data-theme='dark'] .profile-summary__mark {
  border-color: rgb(120 180 200 / 28%);
  color: #a4d8ca;
  background:
    radial-gradient(circle at 38% 26%, rgb(160 210 220 / 24%), transparent 38%),
    linear-gradient(145deg, #1c4a4d, #17353c);
}

[data-theme='dark'] .profile-summary__stats,
[data-theme='dark'] .home-content__footer {
  border-color: rgb(115 165 185 / 14%);
}

[data-theme='dark'] .profile-summary__stats dd,
[data-theme='dark'] .site-status-card__row strong {
  color: #8bc8b4;
}

[data-theme='dark'] .post-preview__reading,
[data-theme='dark'] .tag-list li {
  border-color: rgb(90 145 175 / 20%);
  color: rgb(150 195 215 / 66%);
  background: rgb(10 30 44 / 44%);
}

[data-theme='dark'] .category-list li,
[data-theme='dark'] .site-status-card__row,
[data-theme='dark'] .home-content__footer {
  color: rgb(146 186 204 / 64%);
}

[data-theme='dark'] .home-content__footer strong {
  color: #abd4dc;
}

@media (max-width: 1120px) {
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
    font-size: 2.6rem;
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
    padding: 18px;
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
  .post-preview {
    transition: none;
  }
}
</style>
