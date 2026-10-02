<script setup lang="ts">
import { computed, onBeforeUnmount, ref, type CSSProperties } from 'vue'
import { RouterLink } from 'vue-router'

import { useAppStore, type Theme } from '@/stores/app'

import GlobalSearch from './GlobalSearch.vue'

interface SecondaryNavItem {
  label: string
  to?: string
  href?: string
  action?: string
}

interface PrimaryNavItem {
  id: string
  label: string
  to?: string
  children?: SecondaryNavItem[]
}

const navItems: PrimaryNavItem[] = [
  {
    id: 'home',
    label: '主页',
    to: '/',
  },
  {
    id: 'notes',
    label: '笔记',
    children: [
      { label: '归档', to: '/notes/archive' },
      { label: '分类', to: '/notes/categories' },
      { label: '标签', to: '/notes/tags' },
    ],
  },
  {
    id: 'profile',
    label: '我的',
    children: [
      { label: '项目', to: '/profile/projects' },
      { label: '书签导航', to: '/profile/bookmarks' },
      { label: '动态', to: '/profile/activity' },
      { label: '相册', to: '/profile/gallery' },
    ],
  },
  {
    id: 'about',
    label: '关于',
    children: [
      { label: '打赏', to: '/about/donate' },
      { label: '关于我', to: '/about/me' },
    ],
  },
  {
    id: 'links',
    label: '链接',
    children: [
      { label: 'GitHub', href: 'https://github.com/' },
      { label: 'Gitee', href: 'https://gitee.com/' },
    ],
  },
]

const store = useAppStore()

const themeItems: SecondaryNavItem[] = [
  { label: '浅色模式', action: 'light' },
  { label: '深色模式', action: 'dark' },
]

function handleThemeSelect(theme: string) {
  store.setTheme(theme as Theme)
  activeId.value = null
}

const activeId = ref<string | null>(null)
const navElement = ref<HTMLElement | null>(null)
let closeTimer: ReturnType<typeof setTimeout> | undefined
let pointerIsDown = false
let hoverOpenedId: string | null = null

const activeItem = computed(
  () => navItems.find((item) => item.id === activeId.value) ?? null,
)

function secondaryStyle(index: number): CSSProperties {
  return {
    '--secondary-delay': `${index * 45}ms`,
  }
}

function cancelClose() {
  if (closeTimer !== undefined) {
    clearTimeout(closeTimer)
    closeTimer = undefined
  }
}

function openMenu(id: string) {
  if (id === 'theme') {
    cancelClose()
    activeId.value = 'theme'
    return
  }

  const item = navItems.find((candidate) => candidate.id === id)

  cancelClose()
  activeId.value = item?.children?.length ? id : null
}

function scheduleClose() {
  cancelClose()
  closeTimer = setTimeout(() => {
    activeId.value = null
  }, 160)
}

function handleMenuPointerEnter(id: string, event: PointerEvent) {
  if (event.pointerType !== 'touch') {
    hoverOpenedId = id
    openMenu(id)
  }
}

function handleMenuFocus(id: string) {
  if (!pointerIsDown) {
    openMenu(id)
  }
}

function handleMenuPointerDown() {
  pointerIsDown = true
}

function handleMenuClick(id: string, event: MouseEvent) {
  cancelClose()
  pointerIsDown = false

  if (hoverOpenedId === id) {
    hoverOpenedId = null
    activeId.value = id
    return
  }

  if (event.detail === 0 || activeId.value !== id) {
    activeId.value = id
    return
  }

  activeId.value = null
}

function handleFocusOut(event: FocusEvent) {
  const nextTarget = event.relatedTarget

  if (!(nextTarget instanceof Node) || !navElement.value?.contains(nextTarget)) {
    cancelClose()
    hoverOpenedId = null
    activeId.value = null
  }
}

onBeforeUnmount(cancelClose)
</script>

<template>
  <nav ref="navElement" class="horizontal-glass-nav" aria-label="主导航" @pointerleave="scheduleClose"
    @focusout="handleFocusOut">
    <div class="horizontal-glass-nav__surface">
      <RouterLink class="horizontal-glass-nav__brand" to="/" aria-label="返回首页">
        <span class="horizontal-glass-nav__brand-mark">CY</span>
        <span class="horizontal-glass-nav__brand-copy">
          <strong>CN-CYQ</strong>
          <small>Simply Lovely</small>
        </span>
      </RouterLink>

      <ul class="horizontal-glass-nav__track">
        <li v-for="item in navItems" :key="item.id" class="horizontal-glass-nav__group"
          :class="{ 'is-active': activeId === item.id }">
          <RouterLink v-if="item.to" class="horizontal-glass-nav__item" :to="item.to"
            @pointerenter="handleMenuPointerEnter(item.id, $event)" @focus="handleMenuFocus(item.id)">
            {{ item.label }}
          </RouterLink>

          <button v-else class="horizontal-glass-nav__item" type="button" :aria-expanded="activeId === item.id"
            aria-haspopup="menu" @pointerenter="handleMenuPointerEnter(item.id, $event)"
            @pointerdown="handleMenuPointerDown" @focus="handleMenuFocus(item.id)"
            @click="handleMenuClick(item.id, $event)">
            <span>{{ item.label }}</span>
            <svg viewBox="0 0 12 12" aria-hidden="true">
              <path d="m3 4.25 3 3 3-3" />
            </svg>
          </button>

          <div v-if="activeItem?.id === item.id && item.children" class="horizontal-glass-nav__submenu" role="menu"
            :aria-label="`${item.label}二级导航`">
            <template v-for="(child, index) in item.children" :key="child.label">
              <RouterLink v-if="child.to" class="horizontal-glass-nav__secondary-item" :style="secondaryStyle(index)"
                :to="child.to" role="menuitem" @focus="cancelClose">
                {{ child.label }}
              </RouterLink>
              <a v-else class="horizontal-glass-nav__secondary-item" :style="secondaryStyle(index)" :href="child.href"
                target="_blank" rel="noreferrer" role="menuitem" @focus="cancelClose">
                {{ child.label }}
              </a>
            </template>
          </div>
        </li>

      </ul>

      <div class="horizontal-glass-nav__actions">
        <GlobalSearch />

        <div class="horizontal-glass-nav__group horizontal-glass-nav__theme-group"
          :class="{ 'is-active': activeId === 'theme' }">
          <button class="horizontal-glass-nav__item horizontal-glass-nav__theme-btn" type="button"
            :aria-expanded="activeId === 'theme'" :aria-label="`主题切换，当前为${store.theme === 'light' ? '浅色' : '深色'}模式`"
            aria-haspopup="menu" @pointerenter="handleMenuPointerEnter('theme', $event)"
            @pointerdown="handleMenuPointerDown" @focus="handleMenuFocus('theme')"
            @click="handleMenuClick('theme', $event)">
            <svg v-if="store.theme === 'light'" class="horizontal-glass-nav__theme-icon" viewBox="0 0 24 24"
              aria-hidden="true">
              <circle cx="12" cy="12" r="5" fill="currentColor" />
              <path
                d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
            <svg v-else class="horizontal-glass-nav__theme-icon horizontal-glass-nav__theme-icon--moon"
              viewBox="0 0 24 24" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" />
            </svg>
          </button>

          <div v-if="activeId === 'theme'" class="horizontal-glass-nav__submenu" role="menu" aria-label="主题切换">
            <button v-for="(item, index) in themeItems" :key="item.action" class="horizontal-glass-nav__secondary-item"
              :class="{ 'is-selected': store.theme === item.action }" :style="secondaryStyle(index)" type="button"
              role="menuitemradio" :aria-checked="store.theme === item.action" @click="handleThemeSelect(item.action!)"
              @focus="cancelClose">
              {{ item.label }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.horizontal-glass-nav {
  position: fixed;
  z-index: 1;
  top: 16px;
  left: 50%;
  width: min(92vw, 1420px);
  pointer-events: none;
  transform: translateX(-50%);
}

.horizontal-glass-nav__surface {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 10px 60px;
  border: 1px solid rgb(255 255 255 / 0%);
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.4);
  box-shadow:
    0 16px 38px rgb(35 77 70 / 12%);
  /* inset 0 1px 0 rgb(255 255 255 / 62%); */
  backdrop-filter: blur(20px) saturate(150%);
  -webkit-backdrop-filter: blur(20px) saturate(150%);
  pointer-events: auto;
}

.horizontal-glass-nav__brand {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 2px 7px 2px 2px;
  border: 1px solid transparent;
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.88);
  white-space: nowrap;
  transition:
    border-color 160ms ease,
    background 160ms ease;
}

.horizontal-glass-nav__brand:hover,
.horizontal-glass-nav__brand:focus-visible {
  border-color: rgb(255 255 255 / 68%);
  background: rgb(255 255 255 / 28%);
  outline: none;
}

.horizontal-glass-nav__brand-mark {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 1px solid rgb(255 255 255 / 38%);
  border-radius: 50%;
  color: #BDEFFF;
  background: rgb(255 255 255 / 0%);
  /* box-shadow: inset 0 1px 0 rgb(255 255 255 / 62%); */
  font-size: 0.64rem;
  font-weight: 840;
}

.horizontal-glass-nav__brand-copy {
  display: grid;
  gap: 1px;
}

.horizontal-glass-nav__brand-copy strong {
  font-size: 0.72rem;
  font-weight: 840;
  letter-spacing: 0.08em;
}

.horizontal-glass-nav__brand-copy small {
  color: rgba(255, 255, 255, 0.511);
  font-size: 0.48rem;
  font-weight: 680;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.horizontal-glass-nav__track {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
  list-style: none;
  pointer-events: auto;
}

.horizontal-glass-nav__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
}

.horizontal-glass-nav__group {
  position: relative;
}

.horizontal-glass-nav__item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  min-height: 38px;
  padding: 0 12px;
  border: 1px solid transparent;
  border-radius: 999px;
  color: rgb(189, 239, 255, 78%);
  background: transparent;
  font-size: 0.74rem;
  font-weight: 790;
  letter-spacing: 0.08em;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition:
    color 160ms ease,
    background 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease;
}

.horizontal-glass-nav__item svg {
  width: 13px;
  height: 13px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.5;
  transition: transform 160ms ease;
}

.horizontal-glass-nav__item:hover,
.horizontal-glass-nav__item:focus-visible,
.horizontal-glass-nav__group.is-active .horizontal-glass-nav__item {
  border-color: rgb(255 255 255 / 68%);
  color: #103e35;
  background: linear-gradient(135deg,
      rgb(255 255 255 / 62%),
      rgb(255 255 255 / 24%));
  box-shadow:
    0 9px 22px rgb(30 75 68 / 12%),
    inset 0 1px 0 rgb(255 255 255 / 76%);
  outline: none;
}

.horizontal-glass-nav__group.is-active .horizontal-glass-nav__item svg {
  transform: rotate(180deg);
}

.horizontal-glass-nav__submenu {
  position: absolute;
  z-index: 4;
  top: 100%;
  left: 50%;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 8px 8px;
  transform: translateX(-50%);
  pointer-events: auto;
}

.horizontal-glass-nav__submenu::before {
  position: absolute;
  z-index: -1;
  inset: 6px 0 0;
  border: 1px solid rgb(255 255 255 / 48%);
  border-radius: 16px;
  background:
    linear-gradient(135deg,
      rgb(255 255 255 / 48%),
      rgb(255 255 255 / 16%));
  box-shadow:
    0 18px 42px rgb(28 72 65 / 14%),
    inset 0 1px 0 rgb(255 255 255 / 68%);
  backdrop-filter: blur(22px) saturate(150%);
  -webkit-backdrop-filter: blur(22px) saturate(150%);
  content: '';
}

.horizontal-glass-nav__secondary-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid rgb(255 255 255 / 40%);
  border-radius: 999px;
  color: rgb(16 62 54 / 84%);
  background: rgb(255 255 255 / 20%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 52%);
  font-size: 0.74rem;
  font-weight: 760;
  letter-spacing: 0.08em;
  line-height: 1;
  white-space: nowrap;
  animation: horizontal-submenu-in 220ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--secondary-delay);
  transition:
    color 160ms ease,
    background 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease;
}

.horizontal-glass-nav__secondary-item:hover,
.horizontal-glass-nav__secondary-item:focus-visible,
.horizontal-glass-nav__secondary-item.is-selected {
  border-color: rgb(255 255 255 / 78%);
  color: #103e35;
  background: rgb(255 255 255 / 50%);
  box-shadow:
    0 8px 18px rgb(30 75 68 / 12%),
    inset 0 1px 0 rgb(255 255 255 / 78%);
  outline: none;
}

.horizontal-glass-nav__secondary-item.is-selected {
  font-weight: 800;
  box-shadow:
    0 0 0 1px rgb(30 75 68 / 14%),
    0 8px 18px rgb(30 75 68 / 12%),
    inset 0 1px 0 rgb(255 255 255 / 78%);
}

.horizontal-glass-nav__theme-btn {
  padding: 0 10px;
}

.horizontal-glass-nav__theme-icon {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.5;
  transition: transform 160ms ease;
}

.horizontal-glass-nav__theme-group.is-active .horizontal-glass-nav__item .horizontal-glass-nav__theme-icon {
  transform: scale(1.08);
}

@keyframes horizontal-submenu-in {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.96);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 900px) {
  .horizontal-glass-nav__item {
    padding: 0 11px;
  }

  .horizontal-glass-nav__surface {
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 7px;
  }

  .horizontal-glass-nav__track {
    grid-column: 1 / -1;
    grid-row: 2;
    padding-top: 4px;
  }

  .horizontal-glass-nav__surface {
    border-radius: 22px;
  }
}

@media (max-width: 720px) {
  .horizontal-glass-nav {
    top: 10px;
    width: calc(100vw - 20px);
  }

  .horizontal-glass-nav__track {
    justify-content: center;
    gap: 1px;
    padding-top: 3px;
  }

  .horizontal-glass-nav__item {
    min-height: 32px;
    padding: 0 8px;
    font-size: 0.68rem;
    letter-spacing: 0.04em;
  }

  .horizontal-glass-nav__submenu {
    max-width: calc(100vw - 24px);
    overflow-x: auto;
  }
}

@media (max-width: 520px) {
  .horizontal-glass-nav__brand-copy {
    display: none;
  }

  .horizontal-glass-nav__brand {
    padding-right: 2px;
  }

  .horizontal-glass-nav__surface {
    padding-inline: 6px;
  }
}
</style>

<style>
[data-theme='dark'] .horizontal-glass-nav__surface {
  border-color: rgb(70 120 180 / 34%);
  background:
    linear-gradient(135deg,
      rgb(10 28 50 / 50%),
      rgb(6 18 38 / 20%));
  box-shadow:
    0 16px 38px rgb(0 6 20 / 40%),
    inset 0 1px 0 rgb(130 180 220 / 14%);
}

[data-theme='dark'] .horizontal-glass-nav__brand {
  color: rgb(160 205 235 / 88%);
}

[data-theme='dark'] .horizontal-glass-nav__brand-mark {
  border-color: rgb(100 160 210 / 38%);
  color: #8bc7e2;
  background: rgb(40 100 160 / 16%);
  box-shadow: inset 0 1px 0 rgb(130 180 220 / 14%);
}

[data-theme='dark'] .horizontal-glass-nav__brand-copy small {
  color: rgb(130 175 210 / 48%);
}

[data-theme='dark'] .horizontal-glass-nav__item {
  color: rgb(150 195 225 / 76%);
}

[data-theme='dark'] .horizontal-glass-nav__item:hover,
[data-theme='dark'] .horizontal-glass-nav__item:focus-visible,
[data-theme='dark'] .horizontal-glass-nav__group.is-active .horizontal-glass-nav__item {
  border-color: rgb(100 160 210 / 50%);
  color: #c8e2f8;
  background: linear-gradient(135deg,
      rgb(18 42 68 / 54%),
      rgb(8 28 50 / 30%));
  box-shadow:
    0 9px 22px rgb(0 8 24 / 40%),
    inset 0 1px 0 rgb(160 210 240 / 22%);
}

[data-theme='dark'] .horizontal-glass-nav__submenu::before {
  border-color: rgb(70 120 180 / 34%);
  background:
    linear-gradient(135deg,
      rgb(12 32 58 / 54%),
      rgb(6 20 40 / 22%));
  box-shadow:
    0 18px 42px rgb(0 6 20 / 42%),
    inset 0 1px 0 rgb(130 180 220 / 18%);
}

[data-theme='dark'] .horizontal-glass-nav__secondary-item {
  border-color: rgb(60 110 160 / 30%);
  color: rgb(150 200 225 / 82%);
  background: rgb(14 36 56 / 24%);
  box-shadow: inset 0 1px 0 rgb(120 180 220 / 14%);
}

[data-theme='dark'] .horizontal-glass-nav__secondary-item:hover,
[data-theme='dark'] .horizontal-glass-nav__secondary-item:focus-visible,
[data-theme='dark'] .horizontal-glass-nav__secondary-item.is-selected {
  border-color: rgb(90 150 210 / 56%);
  color: #cfe6fc;
  background: rgb(22 48 72 / 54%);
  box-shadow:
    0 8px 18px rgb(0 6 20 / 38%),
    inset 0 1px 0 rgb(160 210 240 / 22%);
}

[data-theme='dark'] .horizontal-glass-nav__secondary-item.is-selected {
  font-weight: 800;
  box-shadow:
    0 0 0 1px rgb(70 130 180 / 25%),
    0 8px 18px rgb(0 6 20 / 38%),
    inset 0 1px 0 rgb(160 210 240 / 22%);
}
</style>
