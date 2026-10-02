<script setup lang="ts">
interface ActivityItem {
  id: string
  time: string
  title: string
  featured?: boolean
}

const activityItems: ActivityItem[] = [
  {
    id: 'today',
    time: '今日 10:30am',
    title: '设计系统：密度与节奏阿苏不丢...',
    featured: true,
  },
  {
    id: 'september-14',
    time: '09.14',
    title: '设计系统：密度与节奏',
  },
  {
    id: 'september-12',
    time: '09.12',
    title: '设计系统：密度与节奏',
  },
  {
    id: 'september-08',
    time: '09.08',
    title: '设计系统：密度与节奏',
  },
  {
    id: 'september-02',
    time: '09.02',
    title: '设计系统：密度与节奏',
  },
]
</script>

<template>
  <article class="activity-card" aria-label="最近动态">
    <h2>最近动态</h2>

    <ol class="activity-card__list">
      <li v-for="(item, index) in activityItems" :key="item.id" class="activity-card__item"
        :class="{ 'is-featured': item.featured }">
        <span class="activity-card__rail" aria-hidden="true">
          <i />
        </span>
        <time>{{ item.time }}</time>
        <p>{{ item.title }}</p>

        <div v-if="index === 3" class="activity-card__year" aria-label="2025 年分隔线">
          <span aria-hidden="true" />
          <time datetime="2025">2025</time>
          <span aria-hidden="true" />
        </div>
      </li>
    </ol>
  </article>
</template>

<style scoped>
.activity-card {
  width: 100%;
  padding: 17px 18px 18px;
  border: 1px solid rgb(255 255 255 / 0%);
  border-radius: 18px;
  color: rgb(27 83 99 / 70%);
  background: rgb(218 239 243 / 22%) 62%;
  /* linear-gradient(145deg,
      rgb(255 255 255 / 44%),
      rgb(218 239 243 / 22%) 62%,
      rgb(255 255 255 / 30%)),
    rgb(162 202 215 / 16%); */
  box-shadow:
    0 24px 58px rgb(17 57 67 / 17%);

  backdrop-filter: blur(10px) saturate(155%);
  -webkit-backdrop-filter: blur(10px) saturate(155%);
}

.activity-card h2 {
  margin: 0 0 15px;
  font-size: 1rem;
  font-weight: 620;
}

.activity-card__list {
  display: grid;
  gap: 15px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.activity-card__item {
  position: relative;
  display: grid;
  grid-template-columns: 18px 68px minmax(0, 1fr);
  align-items: start;
  gap: 6px;
  min-height: 24px;
  color: rgb(255, 255, 255);
}

.activity-card__rail {
  position: relative;
  align-self: stretch;
  min-height: 24px;
}

.activity-card__rail::before {
  position: absolute;
  top: 6px;
  bottom: -18px;
  left: 4px;
  width: 1px;
  background: rgb(255 255 255 / 52%);
  content: '';
}

.activity-card__item:last-child .activity-card__rail::before {
  bottom: 14px;
}

.activity-card__rail i {
  position: absolute;
  top: 5px;
  left: 0;
  width: 9px;
  height: 9px;
  border: 2px solid rgb(255 255 255 / 78%);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 0 0 4px rgb(255 255 255 / 12%);
}

.activity-card__item.is-featured .activity-card__rail i {
  background: #d9f2e2;
}

.activity-card__item time {
  padding-top: 1px;
  color: rgba(198, 230, 238, 0.986);
  font-size: 0.7rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}



.activity-card__item p {
  overflow: hidden;
  margin: 0;
  font-size: 0.8rem;
  font-weight: 760;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-card__year {
  position: absolute;
  right: 0;
  bottom: -11px;
  left: 24px;
  display: grid;
  grid-template-columns: minmax(16px, 1fr) auto minmax(16px, 1fr);
  align-items: center;
  gap: 10px;
  color: rgb(42 105 121 / 62%);
  font-size: 0.72rem;
  font-variant-numeric: tabular-nums;
}

.activity-card__year span {
  height: 1px;
  background-image: linear-gradient(90deg,
      rgb(255 255 255 / 60%) 0 4px,
      transparent 4px 8px);
  background-size: 8px 1px;
}

[data-theme='dark'] .activity-card {
  border-color: rgb(78 135 182 / 34%);
  color: rgb(168 215 239 / 90%);
  background:
    linear-gradient(145deg,
      rgb(12 32 56 / 62%),
      rgb(6 20 38 / 36%) 62%,
      rgb(14 38 64 / 48%)),
    rgb(5 18 36 / 26%);
  box-shadow:
    0 24px 58px rgb(0 5 18 / 46%),
    inset 0 1px 0 rgb(140 190 230 / 26%);
}

[data-theme='dark'] .activity-card__item {
  color: rgb(160 205 230 / 88%);
}

[data-theme='dark'] .activity-card__rail::before {
  background: rgb(90 145 185 / 38%);
}

[data-theme='dark'] .activity-card__rail i {
  border-color: rgb(170 215 240 / 72%);
  background: rgb(56 118 158 / 84%);
  box-shadow: 0 0 0 4px rgb(70 130 170 / 12%);
}

[data-theme='dark'] .activity-card__item time,
[data-theme='dark'] .activity-card__year {
  color: rgb(111 165 203 / 58%);
}

@media (max-width: 360px) {
  .activity-card {
    padding-inline: 14px;
  }

  .activity-card__item {
    grid-template-columns: 16px 56px minmax(0, 1fr);
    gap: 5px;
  }

  .activity-card__item p {
    font-size: 0.68rem;
  }
}
</style>
