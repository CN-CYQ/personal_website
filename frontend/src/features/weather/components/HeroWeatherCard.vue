<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { heroWeather } from '../mock'

import WeatherGlyph from './WeatherGlyph.vue'

const props = withDefaults(
  defineProps<{
    instanceId?: string
  }>(),
  {
    instanceId: 'hero-weather',
  },
)

const emit = defineEmits<{
  'update:expanded': [expanded: boolean]
}>()

const isHovered = ref(false)
const isPinned = ref(false)
const isExpanded = computed(() => isHovered.value || isPinned.value)
const forecastId = computed(() => `${props.instanceId}-forecast`)
let lastPointerType = ''

watch(
  isExpanded,
  (expanded) => {
    emit('update:expanded', expanded)
  },
  { immediate: true },
)

const chartWidth = 500
const chartHeight = 112
const chartStart = 42
const chartEnd = 458
const chartTop = 14
const chartBottom = 94

const allTemperatures = heroWeather.forecasts.flatMap((day) => [
  day.high,
  day.low,
])
const minimumTemperature = Math.min(...allTemperatures)
const maximumTemperature = Math.max(...allTemperatures)
const temperatureRange = Math.max(maximumTemperature - minimumTemperature, 1)

function chartPoints(values: number[]) {
  return values
    .map((value, index) => {
      const x =
        chartStart +
        (index / Math.max(values.length - 1, 1)) * (chartEnd - chartStart)
      const y =
        chartTop +
        ((maximumTemperature - value) / temperatureRange) *
        (chartBottom - chartTop)

      return `${x},${y}`
    })
    .join(' ')
}

function chartDotX(index: number) {
  return (
    chartStart +
    (index / Math.max(heroWeather.forecasts.length - 1, 1)) *
    (chartEnd - chartStart)
  )
}

function chartDotY(value: number) {
  return (
    chartTop +
    ((maximumTemperature - value) / temperatureRange) *
    (chartBottom - chartTop)
  )
}

const highTemperaturePoints = computed(() =>
  chartPoints(heroWeather.forecasts.map((day) => day.high)),
)

const lowTemperaturePoints = computed(() =>
  chartPoints(heroWeather.forecasts.map((day) => day.low)),
)

function handlePointerEnter(event: PointerEvent) {
  if (event.pointerType !== 'touch') {
    isHovered.value = true
  }
}

function handlePointerLeave(event: PointerEvent) {
  if (event.pointerType !== 'touch') {
    isHovered.value = false
  }
}

function handlePointerDown(event: PointerEvent) {
  lastPointerType = event.pointerType
}

function toggleExpanded(event: MouseEvent) {
  const shouldPin =
    lastPointerType === 'touch' ||
    lastPointerType === 'pen' ||
    event.detail === 0

  if (shouldPin) {
    isPinned.value = !isPinned.value
  }
}

function collapseExpanded() {
  isHovered.value = false
  isPinned.value = false
}
</script>

<template>
  <article class="hero-weather" :class="{ 'is-expanded': isExpanded }" @pointerenter="handlePointerEnter"
    @pointerleave="handlePointerLeave" @keydown.esc="collapseExpanded">
    <button class="hero-weather__summary" type="button" :aria-expanded="isExpanded"
      :aria-controls="forecastId" @pointerdown="handlePointerDown" @click="toggleExpanded">
      <WeatherGlyph class="hero-weather__current-icon" kind="sunny" :size="56" />
      <span class="hero-weather__reading">
        <strong>{{ heroWeather.condition }}</strong>
        <span>{{ heroWeather.temperature }}°C</span>
      </span>
    </button>

    <div :id="forecastId" class="hero-weather__details" :aria-hidden="!isExpanded">
      <div class="hero-weather__forecast">
        <div v-for="day in heroWeather.forecasts" :key="day.id" class="hero-weather__day">
          <div class="hero-weather__day-heading">
            <strong>{{ day.label }}</strong>
            <time>{{ day.date }}</time>
          </div>
          <WeatherGlyph class="hero-weather__day-icon" :kind="day.kind" :size="40" />
          <span class="hero-weather__condition">{{ day.condition }}</span>
          <span class="hero-weather__rain">{{ day.precipitation }}%</span>
          <span class="hero-weather__temperatures">
            <strong>{{ day.high }}°</strong>
            <small>{{ day.low }}°</small>
          </span>
        </div>
      </div>

      <svg class="hero-weather__chart" :viewBox="`0 0 ${chartWidth} ${chartHeight}`" role="img" aria-label="未来五日高低温折线图"
        preserveAspectRatio="none">
        <path class="hero-weather__chart-grid" d="M42 24h416M42 76h416" />
        <polyline class="hero-weather__chart-line hero-weather__chart-line--low" :points="lowTemperaturePoints" />
        <polyline class="hero-weather__chart-line hero-weather__chart-line--high" :points="highTemperaturePoints" />
        <g class="hero-weather__chart-dots">
          <circle v-for="(day, index) in heroWeather.forecasts" :key="`high-${day.id}`"
            class="hero-weather__chart-dot hero-weather__chart-dot--high" :cx="chartDotX(index)"
            :cy="chartDotY(day.high)" r="7" />
          <circle v-for="(day, index) in heroWeather.forecasts" :key="`low-${day.id}`"
            class="hero-weather__chart-dot hero-weather__chart-dot--low" :cx="chartDotX(index)" :cy="chartDotY(day.low)"
            r="7" />
        </g>
      </svg>
    </div>

    <time class="hero-weather__date" datetime="2026-10-01">
      {{ heroWeather.dateLabel }}
      <span>{{ heroWeather.weekday }}</span>
    </time>
  </article>
</template>

<style scoped>
.hero-weather {
  display: grid;
  width: clamp(276px, 23vw, 350px);
  grid-template-rows: auto 0fr auto;
  overflow: hidden;
  padding: 10px 12px 11px;
  border: 1px solid rgb(244 252 255 / 28%);
  border-radius: 22px;
  color: rgb(19 63 74 / 88%);
  background:
    linear-gradient(145deg,
      rgb(255 255 255 / 34%),
      rgb(217 240 248 / 14%) 56%,
      rgb(255 255 255 / 20%)),
    rgb(164 205 221 / 12%);
  box-shadow:
    0 22px 54px rgb(19 62 71 / 14%),
    inset 0 1px 0 rgb(255 255 255 / 58%),
    inset 0 -16px 34px rgb(105 164 184 / 7%);
  backdrop-filter: blur(28px) saturate(145%);
  -webkit-backdrop-filter: blur(28px) saturate(145%);
  transition:
    width 420ms cubic-bezier(0.22, 1, 0.36, 1),
    grid-template-rows 460ms cubic-bezier(0.22, 1, 0.36, 1),
    border-color 260ms ease,
    box-shadow 260ms ease;
}

.hero-weather.is-expanded {
  width: clamp(420px, 32vw, 540px);
  grid-template-rows: auto 1fr auto;
  border-color: rgb(250 255 255 / 48%);
  box-shadow:
    0 30px 76px rgb(14 53 67 / 20%),
    inset 0 1px 0 rgb(255 255 255 / 72%),
    inset 0 -22px 44px rgb(101 161 184 / 9%);
}

.hero-weather__summary {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 62px;
  padding: 4px 6px;
  border: 0;
  color: inherit;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.hero-weather__summary:focus-visible {
  border-radius: 14px;
  outline: 1px solid rgb(255 255 255 / 72%);
  outline-offset: 4px;
}

.hero-weather__current-icon {
  width: 56px;
  height: 56px;
  transition:
    width 380ms cubic-bezier(0.22, 1, 0.36, 1),
    height 380ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 380ms cubic-bezier(0.22, 1, 0.36, 1);
}

.hero-weather.is-expanded .hero-weather__summary {
  grid-template-columns: 36px minmax(0, 1fr);
  gap: 10px;
}

.hero-weather.is-expanded .hero-weather__current-icon {
  width: 36px;
  height: 36px;
  transform: translateY(-1px) scale(0.92);
}

.hero-weather__reading {
  display: inline-flex;
  align-items: baseline;
  gap: 14px;
  min-width: 0;
  color: rgb(12 54 65 / 92%);
}

.hero-weather__reading strong {
  font-size: 1.05rem;
  font-weight: 740;
  letter-spacing: 0.08em;
}

.hero-weather__reading span {
  font-size: 1.22rem;
  font-weight: 680;
  letter-spacing: -0.025em;
}

.hero-weather__details {
  min-height: 0;
  overflow: hidden;
  opacity: 0;
  transform: translateY(-10px);
  transition:
    opacity 260ms ease,
    transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
}

.hero-weather.is-expanded .hero-weather__details {
  padding-top: 12px;
  opacity: 1;
  transform: translateY(0);
}

.hero-weather__forecast {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 2px;
}

.hero-weather__day {
  display: grid;
  min-width: 0;
  justify-items: center;
  gap: 2px;
  color: rgb(15 60 73 / 82%);
}

.hero-weather__day-heading {
  display: grid;
  justify-items: center;
  gap: 2px;
}

.hero-weather__day-heading strong {
  font-size: 0.76rem;
  font-weight: 760;
}

.hero-weather__day-heading time {
  color: rgb(20 68 80 / 62%);
  font-size: 0.58rem;
  font-variant-numeric: tabular-nums;
}

.hero-weather__day-icon {
  margin-top: 5px;
}

.hero-weather__condition {
  min-height: 1.1em;
  font-size: 0.66rem;
  font-weight: 720;
  white-space: nowrap;
}

.hero-weather__rain {
  color: rgb(35 93 111 / 62%);
  font-size: 0.58rem;
  font-variant-numeric: tabular-nums;
}

.hero-weather__temperatures {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  margin-top: 1px;
  font-variant-numeric: tabular-nums;
}

.hero-weather__temperatures strong {
  font-size: 0.92rem;
  font-weight: 720;
}

.hero-weather__temperatures small {
  color: rgb(21 69 82 / 60%);
  font-size: 0.68rem;
  font-weight: 620;
}

.hero-weather__chart {
  display: block;
  width: 100%;
  height: 106px;
  margin-top: 20px;
  overflow: visible;
  transform: translateY(-16px);
}

.hero-weather__chart-grid {
  fill: none;
  stroke: rgb(21 71 85 / 12%);
  stroke-dasharray: 7 10;
  stroke-width: 1.4;
}

.hero-weather__chart-line {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 5;
}

.hero-weather__chart-line--high {
  stroke: rgb(255 255 255 / 86%);
  filter: drop-shadow(0 4px 8px rgb(45 107 129 / 18%));
}

.hero-weather__chart-line--low {
  stroke: rgb(255 255 255 / 48%);
}

.hero-weather__chart-dot {
  stroke: rgb(255 255 255 / 96%);
  stroke-width: 4;
}

.hero-weather__chart-dot--high {
  fill: #f9ffff;
}

.hero-weather__chart-dot--low {
  fill: rgb(221 244 252 / 78%);
}

.hero-weather__date {
  display: inline-flex;
  grid-row: 3;
  align-items: baseline;
  justify-self: end;
  gap: 13px;
  padding: 0 7px 2px;
  color: rgb(12 55 67 / 88%);
  font-size: 0.9rem;
  font-weight: 720;
  font-variant-numeric: tabular-nums;
  transition:
    color 220ms ease,
    transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
}

.hero-weather__date span {
  color: rgb(18 66 78 / 66%);
  font-size: 0.74rem;
  font-weight: 650;
}

.hero-weather.is-expanded .hero-weather__date {
  transform: translateY(2px);
}

@media (max-width: 1024px) {

  .hero-weather,
  .hero-weather.is-expanded {
    width: min(430px, calc(100vw - 40px));
  }
}

@media (max-width: 640px) {

  .hero-weather,
  .hero-weather.is-expanded {
    width: min(350px, calc(100vw - 32px));
    border-radius: 18px;
  }

  .hero-weather.is-expanded .hero-weather__forecast {
    gap: 0;
  }

  .hero-weather__day-heading strong {
    font-size: 0.66rem;
  }

  .hero-weather__day-heading time,
  .hero-weather__rain {
    font-size: 0.52rem;
  }

  .hero-weather__condition {
    font-size: 0.58rem;
  }

  .hero-weather__temperatures {
    gap: 4px;
  }

  .hero-weather__temperatures strong {
    font-size: 0.78rem;
  }

  .hero-weather__temperatures small {
    font-size: 0.6rem;
  }
}

@media (prefers-reduced-motion: reduce) {

  .hero-weather,
  .hero-weather__current-icon,
  .hero-weather__details,
  .hero-weather__date {
    transition: none;
  }
}
</style>

<style>
[data-theme='dark'] .hero-weather {
  border-color: rgb(60 110 160 / 22%);
  color: rgb(150 200 225 / 80%);
  background:
    linear-gradient(145deg,
      rgb(10 28 48 / 38%),
      rgb(6 18 34 / 18%) 56%,
      rgb(12 30 50 / 24%)),
    rgb(6 20 36 / 14%);
  box-shadow:
    0 22px 54px rgb(0 6 18 / 22%),
    inset 0 1px 0 rgb(140 190 230 / 40%),
    inset 0 -16px 34px rgb(30 70 120 / 6%);
}

[data-theme='dark'] .hero-weather.is-expanded {
  border-color: rgb(80 140 200 / 36%);
  box-shadow:
    0 30px 76px rgb(0 4 16 / 28%),
    inset 0 1px 0 rgb(150 200 240 / 52%),
    inset 0 -22px 44px rgb(30 70 120 / 8%);
}

[data-theme='dark'] .hero-weather__reading {
  color: rgb(160 210 235 / 88%);
}

[data-theme='dark'] .hero-weather__day {
  color: rgb(150 200 230 / 76%);
}

[data-theme='dark'] .hero-weather__day-heading time {
  color: rgb(110 150 190 / 58%);
}

[data-theme='dark'] .hero-weather__rain {
  color: rgb(90 130 170 / 58%);
}

[data-theme='dark'] .hero-weather__temperatures small {
  color: rgb(100 140 180 / 56%);
}

[data-theme='dark'] .hero-weather__chart-grid {
  stroke: rgb(100 150 190 / 12%);
}

[data-theme='dark'] .hero-weather__chart-line--high {
  stroke: rgb(170 210 240 / 76%);
  filter: drop-shadow(0 4px 8px rgb(30 70 120 / 18%));
}

[data-theme='dark'] .hero-weather__chart-line--low {
  stroke: rgb(130 180 220 / 42%);
}

[data-theme='dark'] .hero-weather__chart-dot {
  stroke: rgb(190 220 245 / 88%);
}

[data-theme='dark'] .hero-weather__chart-dot--high {
  fill: #cfe4f8;
}

[data-theme='dark'] .hero-weather__chart-dot--low {
  fill: rgb(130 190 225 / 70%);
}

[data-theme='dark'] .hero-weather__date {
  color: rgb(130 180 220 / 66%);
}

[data-theme='dark'] .hero-weather__date span {
  color: rgb(90 130 170 / 50%);
}
</style>
