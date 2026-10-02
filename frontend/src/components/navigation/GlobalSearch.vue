<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

interface SearchEntry {
  id: string
  label: string
  description: string
  target: string
  keywords: string
}

const searchEntries: SearchEntry[] = [
  {
    id: 'home',
    label: '主页',
    description: '返回首页首屏',
    target: '/',
    keywords: 'home 首页 hero 主页',
  },
  {
    id: 'content',
    label: '内容区',
    description: '浏览首页文章与站点动态',
    target: '/#home-content',
    keywords: 'article post content 内容 文章 动态',
  },
  {
    id: 'notes',
    label: '笔记',
    description: '打开笔记入口',
    target: '/notes',
    keywords: 'note notes 笔记 archive 归档',
  },
  {
    id: 'music',
    label: '音乐',
    description: '查看音乐播放器',
    target: '/#home-hero-player',
    keywords: 'music player song 音乐 播放器',
  },
  {
    id: 'about',
    label: '关于',
    description: '了解站点与作者',
    target: '/about',
    keywords: 'about profile 关于 作者',
  },
]

const router = useRouter()
const rootElement = ref<HTMLElement | null>(null)
const inputElement = ref<HTMLInputElement | null>(null)
const query = ref('')
const isOpen = ref(false)
const activeIndex = ref(0)

const filteredEntries = computed(() => {
  const keyword = query.value.trim().toLowerCase()

  if (!keyword) {
    return searchEntries.slice(0, 4)
  }

  return searchEntries.filter((entry) =>
    `${entry.label} ${entry.description} ${entry.keywords}`
      .toLowerCase()
      .includes(keyword),
  )
})

watch(filteredEntries, () => {
  activeIndex.value = 0
})

function openSearch() {
  isOpen.value = true
}

function closeSearch() {
  isOpen.value = false
}

async function selectEntry(entry: SearchEntry) {
  query.value = ''
  isOpen.value = false
  inputElement.value?.blur()
  await router.push(entry.target)

  if (entry.target.endsWith('#home-content')) {
    const contentSection = document.getElementById('home-content')
    const contentPage = contentSection?.closest<HTMLElement>('.home-page__content')
    const targetTop = (contentPage?.offsetTop ?? contentSection?.offsetTop ?? 0) - 82

    window.scrollTo({
      top: Math.max(targetTop, 0),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    })
    return
  }

  if (entry.target.endsWith('#home-hero-player')) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function handleInputKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    activeIndex.value =
      filteredEntries.value.length === 0
        ? 0
        : (activeIndex.value + 1) % filteredEntries.value.length
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    activeIndex.value =
      filteredEntries.value.length === 0
        ? 0
        : (activeIndex.value - 1 + filteredEntries.value.length) %
          filteredEntries.value.length
    return
  }

  if (event.key === 'Enter') {
    const entry = filteredEntries.value[activeIndex.value]
    if (entry) {
      event.preventDefault()
      selectEntry(entry)
    }
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    closeSearch()
    inputElement.value?.blur()
  }
}

function handleDocumentKeydown(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    openSearch()
    inputElement.value?.focus()
  }
}

function handleDocumentPointerDown(event: PointerEvent) {
  if (
    isOpen.value &&
    event.target instanceof Node &&
    !rootElement.value?.contains(event.target)
  ) {
    closeSearch()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleDocumentKeydown)
  document.addEventListener('pointerdown', handleDocumentPointerDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleDocumentKeydown)
  document.removeEventListener('pointerdown', handleDocumentPointerDown)
})
</script>

<template>
  <div ref="rootElement" class="global-search" role="search">
    <label class="global-search__label" for="global-search-input">全局搜索</label>
    <div
      class="global-search__field"
      :class="{ 'is-open': isOpen }"
      data-pill-motion
    >
      <span class="global-search__circle" data-pill-circle aria-hidden="true" />
      <svg class="global-search__icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4 4" />
      </svg>
      <input
        id="global-search-input"
        ref="inputElement"
        v-model="query"
        class="global-search__input"
        type="search"
        autocomplete="off"
        placeholder="搜索内容"
        aria-label="全局搜索"
        aria-controls="global-search-results"
        :aria-expanded="isOpen"
        :aria-activedescendant="
          filteredEntries[activeIndex]
            ? `global-search-option-${filteredEntries[activeIndex]?.id}`
            : undefined
        "
        @focus="openSearch"
        @keydown="handleInputKeydown"
      />
      <kbd class="global-search__shortcut" aria-hidden="true">⌘K</kbd>
    </div>

    <div
      v-if="isOpen"
      id="global-search-results"
      class="global-search__results"
      role="listbox"
      aria-label="搜索结果"
    >
      <button
        v-for="(entry, index) in filteredEntries"
        :id="`global-search-option-${entry.id}`"
        :key="entry.id"
        class="global-search__result"
        :class="{ 'is-active': index === activeIndex }"
        :style="{ '--result-delay': `${index * 35}ms` }"
        type="button"
        role="option"
        :aria-selected="index === activeIndex"
        @pointermove="activeIndex = index"
        @click="selectEntry(entry)"
      >
        <span>
          <strong>{{ entry.label }}</strong>
          <small>{{ entry.description }}</small>
        </span>
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="m6 3 5 5-5 5" />
        </svg>
      </button>

      <p v-if="filteredEntries.length === 0" class="global-search__empty">
        没有匹配内容
      </p>
    </div>
  </div>
</template>

<style scoped>
.global-search {
  position: relative;
  min-width: 0;
}

.global-search__label {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

.global-search__field {
  position: relative;
  display: grid;
  width: clamp(160px, 16vw, 250px);
  min-height: 38px;
  grid-template-columns: 18px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  padding: 0 11px;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 14%);
  border-radius: 999px;
  color: var(--nav-pill-text, rgb(200 240 255 / 82%));
  background: var(--nav-pill-bg, rgb(255 255 255 / 8%));
  cursor: text;
  isolation: isolate;
  transition:
    color 160ms var(--pill-ease, ease) 70ms,
    border-color 180ms var(--pill-ease, ease),
    background-color 180ms var(--pill-ease, ease);
}

.global-search__field:hover,
.global-search__field:focus-within,
.global-search__field.is-open {
  border-color: var(--nav-active-outline, rgb(255 255 255 / 42%));
  color: var(--nav-hover-text, #103e35);
}

.global-search__field:focus-within {
  outline: 2px solid var(--nav-active-outline, rgb(255 255 255 / 42%));
  outline-offset: 2px;
}

.global-search__circle {
  position: absolute;
  bottom: 0;
  left: 50%;
  z-index: 1;
  display: block;
  border-radius: 50%;
  background: var(--nav-hover-fill, rgb(255 255 255 / 90%));
  pointer-events: none;
  will-change: transform;
}

.global-search__icon {
  position: relative;
  z-index: 2;
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 1.7;
}

.global-search__input {
  position: relative;
  z-index: 2;
  width: 100%;
  min-width: 0;
  padding: 0;
  border: 0;
  outline: none;
  color: inherit;
  background: transparent;
  font-size: 0.72rem;
  font-weight: 720;
}

.global-search__input::placeholder {
  color: currentColor;
  opacity: 0.62;
}

.global-search__input::-webkit-search-cancel-button {
  display: none;
}

.global-search__shortcut {
  position: relative;
  z-index: 2;
  padding: 3px 6px;
  border: 1px solid currentColor;
  border-radius: 999px;
  color: inherit;
  font-family: inherit;
  font-size: 0.56rem;
  font-weight: 760;
  white-space: nowrap;
  opacity: 0.56;
}

.global-search__results {
  position: absolute;
  z-index: 20;
  top: calc(100% + 10px);
  right: 0;
  display: grid;
  width: min(320px, calc(100vw - 28px));
  gap: 5px;
  padding: 8px;
  border: 1px solid rgb(255 255 255 / 20%);
  border-radius: 16px;
  color: rgb(214 242 255 / 92%);
  background: var(--nav-base, rgb(8 28 36 / 78%));
  box-shadow:
    var(--nav-shadow, 0 22px 52px rgb(23 62 58 / 20%)),
    inset 0 1px 0 rgb(255 255 255 / 16%);
  backdrop-filter: blur(26px) saturate(150%);
  -webkit-backdrop-filter: blur(26px) saturate(150%);
  animation: global-search-results-in 200ms var(--pill-ease, ease) both;
}

.global-search__result {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 52px;
  padding: 8px 10px;
  border: 1px solid transparent;
  border-radius: 11px;
  color: inherit;
  background: transparent;
  text-align: left;
  cursor: pointer;
  animation: global-search-result-in 220ms var(--pill-ease, ease) both;
  animation-delay: var(--result-delay, 0ms);
}

.global-search__result.is-active,
.global-search__result:hover,
.global-search__result:focus-visible {
  border-color: rgb(255 255 255 / 26%);
  background: rgb(255 255 255 / 14%);
  outline: none;
}

.global-search__result:focus-visible {
  outline: 2px solid var(--nav-active-outline, rgb(255 255 255 / 42%));
  outline-offset: 2px;
}

.global-search__result span {
  display: grid;
  min-width: 0;
  gap: 2px;
}

.global-search__result strong {
  font-size: 0.78rem;
  font-weight: 800;
}

.global-search__result small {
  overflow: hidden;
  color: rgb(190 228 250 / 62%);
  font-size: 0.66rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.global-search__result svg {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.5;
}

.global-search__empty {
  margin: 0;
  padding: 16px 12px;
  color: rgb(190 228 250 / 62%);
  font-size: 0.72rem;
  text-align: center;
}

@keyframes global-search-results-in {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.97);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes global-search-result-in {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1080px) {
  .global-search__field {
    width: clamp(145px, 17vw, 220px);
  }

  .global-search__shortcut {
    display: none;
  }
}

@media (max-width: 860px) {
  .global-search__field {
    width: min(240px, 42vw);
  }
}

@media (max-width: 560px) {
  .global-search__field {
    width: min(180px, 48vw);
  }

  .global-search__results {
    position: fixed;
    top: 84px;
    right: 14px;
    left: 14px;
    width: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .global-search__field:hover,
  .global-search__field:focus-within,
  .global-search__field.is-open {
    background: var(--nav-hover-fill, rgb(255 255 255 / 90%));
  }

  .global-search__results,
  .global-search__result {
    animation: none;
  }
}
</style>
