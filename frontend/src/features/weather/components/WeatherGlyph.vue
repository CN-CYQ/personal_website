<script setup lang="ts">
import type { WeatherKind } from '../types'

withDefaults(
  defineProps<{
    kind: WeatherKind
    size?: number
  }>(),
  {
    size: 48,
  },
)
</script>

<template>
  <svg
    class="weather-glyph"
    :class="`weather-glyph--${kind}`"
    :width="size"
    :height="size"
    viewBox="0 0 64 64"
    aria-hidden="true"
  >
    <template v-if="kind === 'sunny'">
      <circle class="weather-glyph__sun" cx="32" cy="32" r="13" />
      <path
        class="weather-glyph__rays"
        d="M32 8v7M32 49v7M8 32h7M49 32h7M15 15l5 5M44 44l5 5M49 15l-5 5M20 44l-5 5"
      />
    </template>

    <template v-else-if="kind === 'partly-cloudy'">
      <circle class="weather-glyph__sun" cx="42" cy="22" r="12" />
      <path
        class="weather-glyph__rays"
        d="M42 3v6M56 22h5M52 9l4-4M51 32l5 4"
      />
      <path
        class="weather-glyph__cloud"
        d="M14 48h33a11 11 0 0 0 1.3-21.9A15 15 0 0 0 20 29a10 10 0 0 0-6 19Z"
      />
    </template>

    <template v-else-if="kind === 'cloudy'">
      <path
        class="weather-glyph__cloud weather-glyph__cloud--back"
        d="M12 39h27a9 9 0 0 0 1-17.9A12 12 0 0 0 17 23a8 8 0 0 0-5 16Z"
      />
      <path
        class="weather-glyph__cloud"
        d="M18 51h32a11 11 0 0 0 1.3-21.9A15 15 0 0 0 23 33a10 10 0 0 0-5 18Z"
      />
    </template>

    <template v-else-if="kind === 'rain'">
      <path
        class="weather-glyph__cloud"
        d="M15 40h33a11 11 0 0 0 1.3-21.9A15 15 0 0 0 21 21a10 10 0 0 0-6 19Z"
      />
      <path
        class="weather-glyph__rain"
        d="M24 47 20 55M34 47l-4 8M44 47l-4 8"
      />
    </template>

    <template v-else>
      <path
        class="weather-glyph__cloud"
        d="M15 39h33a11 11 0 0 0 1.3-21.9A15 15 0 0 0 21 20a10 10 0 0 0-6 19Z"
      />
      <path
        class="weather-glyph__rain"
        d="M22 46 18 54M31 46l-4 8M40 46l-4 8"
      />
      <path class="weather-glyph__bolt" d="m46 42-7 10h7l-4 9 9-12h-7Z" />
    </template>
  </svg>
</template>

<style scoped>
.weather-glyph {
  display: block;
  overflow: visible;
}

.weather-glyph__sun {
  fill: #ffd977;
  filter: drop-shadow(0 0 8px rgb(255 221 114 / 34%));
}

.weather-glyph__rays {
  fill: none;
  stroke: #ffe8a8;
  stroke-linecap: round;
  stroke-width: 3.4;
}

.weather-glyph__cloud {
  fill: #f5fbff;
  filter: drop-shadow(0 8px 12px rgb(8 50 77 / 16%));
}

.weather-glyph__cloud--back {
  fill: rgb(247 253 255 / 62%);
}

.weather-glyph__rain {
  fill: none;
  stroke: #b9e8ff;
  stroke-linecap: round;
  stroke-width: 3.5;
}

.weather-glyph__bolt {
  fill: #ffd55f;
  filter: drop-shadow(0 0 6px rgb(255 216 97 / 48%));
}
</style>
