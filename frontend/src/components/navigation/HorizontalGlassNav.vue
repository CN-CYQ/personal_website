<script setup lang="ts">
import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type CSSProperties,
} from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { createPillNavMotion, type PillNavMotion } from '@/motion/pillNav'
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

const themeItems: SecondaryNavItem[] = [
  { label: '浅色模式', action: 'light' },
  { label: '深色模式', action: 'dark' },
]

const store = useAppStore()
const route = useRoute()

const navElement = ref<HTMLElement | null>(null)
const activeId = ref<string | null>(null)
const mobileMenuOpen = ref(false)

let motion: PillNavMotion | null = null
let closeTimer: ReturnType<typeof setTimeout> | undefined
let pointerIsDown = false
let hoverOpenedId: string | null = null

function secondaryStyle(index: number): CSSProperties {
  return {
    '--secondary-delay': `${index * 45}ms`,
  }
}

function isRouteActive(target?: string) {
  if (!target) {
    return false
  }

  if (target === '/') {
    return route.path === '/'
  }

  return route.path === target || route.path.startsWith(`${target}/`)
}

function isItemActive(item: PrimaryNavItem) {
  if (item.to) {
    return isRouteActive(item.to)
  }

  return Boolean(
    item.children?.some((child) => child.to && isRouteActive(child.to)),
  )
}

function hasMenu(id: string) {
  if (id === 'theme') {
    return true
  }

  return Boolean(
    navItems.find((candidate) => candidate.id === id)?.children?.length,
  )
}

function cancelClose() {
  if (closeTimer !== undefined) {
    clearTimeout(closeTimer)
    closeTimer = undefined
  }
}

function openMenu(id: string) {
  if (!hasMenu(id)) {
    return
  }

  cancelClose()
  activeId.value = id
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

function handleLogoEnter() {
  motion?.spinLogo()
}

function handleThemeSelect(theme: string) {
  store.setTheme(theme as Theme)
  activeId.value = null
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}

function handleDocumentKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape') {
    return
  }

  activeId.value = null
  closeMobileMenu()
}

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

function handleMobileThemeSelect(theme: string) {
  store.setTheme(theme as Theme)
  closeMobileMenu()
}

watch(activeId, async () => {
  await nextTick()
  motion?.refresh()
})

watch(
  () => route.fullPath,
  () => {
    activeId.value = null
    closeMobileMenu()
  },
)

onMounted(async () => {
  document.addEventListener('keydown', handleDocumentKeydown)
  await nextTick()

  if (!navElement.value) {
    return
  }

  motion = createPillNavMotion(navElement.value, {
    ease: 'power3.easeOut',
    initialLoad: true,
  })
  motion.refresh(true)
  motion.reveal()
})

onBeforeUnmount(() => {
  cancelClose()
  document.removeEventListener('keydown', handleDocumentKeydown)
  motion?.destroy()
  motion = null
})
</script>

<template>
  <nav
    ref="navElement"
    class="pill-nav"
    aria-label="主导航"
    @pointerleave="scheduleClose"
    @focusout="handleFocusOut"
  >
    <div class="pill-nav__bar">
      <RouterLink class="pill-nav__brand" to="/" aria-label="返回首页">
        <span
          class="pill-nav__logo"
          data-pill-logo
          aria-hidden="true"
          @pointerenter="handleLogoEnter"
        >
          <span class="pill-nav__logo-mark">CY</span>
        </span>
        <span class="pill-nav__brand-copy">
          <strong>CN-CYQ</strong>
          <small>Simply Lovely</small>
        </span>
      </RouterLink>

      <div class="pill-nav__items">
        <ul class="pill-nav__list" role="menubar" data-pill-track>
          <li
            v-for="item in navItems"
            :key="item.id"
            class="pill-nav__group"
            :class="{
              'is-active': activeId === item.id,
              'is-current': isItemActive(item),
            }"
          >
            <RouterLink
              v-if="item.to"
              class="pill pill--motion"
              :class="{ 'is-current': isItemActive(item) }"
              :to="item.to"
              role="menuitem"
              data-pill-motion
              @pointerenter="handleMenuPointerEnter(item.id, $event)"
              @focus="handleMenuFocus(item.id)"
            >
              <span class="pill__circle" data-pill-circle aria-hidden="true" />
              <span class="pill__label-stack">
                <span class="pill__label" data-pill-label>{{ item.label }}</span>
                <span
                  class="pill__label-hover"
                  data-pill-label-hover
                  aria-hidden="true"
                  >{{ item.label }}</span
                >
              </span>
            </RouterLink>

            <button
              v-else
              class="pill pill--motion"
              :class="{ 'is-open': activeId === item.id }"
              type="button"
              :aria-expanded="activeId === item.id"
              aria-haspopup="menu"
              data-pill-motion
              @pointerenter="handleMenuPointerEnter(item.id, $event)"
              @pointerdown="handleMenuPointerDown"
              @focus="handleMenuFocus(item.id)"
              @click="handleMenuClick(item.id, $event)"
            >
              <span class="pill__circle" data-pill-circle aria-hidden="true" />
              <span class="pill__label-stack">
                <span class="pill__label" data-pill-label>{{ item.label }}</span>
                <span
                  class="pill__label-hover"
                  data-pill-label-hover
                  aria-hidden="true"
                  >{{ item.label }}</span
                >
              </span>
              <svg class="pill__chevron" viewBox="0 0 12 12" aria-hidden="true">
                <path d="m3 4.25 3 3 3-3" />
              </svg>
            </button>

            <div
              v-if="activeId === item.id && item.children"
              class="pill-nav__submenu"
              role="menu"
              :aria-label="`${item.label}二级导航`"
            >
              <template v-for="(child, index) in item.children" :key="child.label">
                <RouterLink
                  v-if="child.to"
                  class="pill secondary-pill pill--motion"
                  :style="secondaryStyle(index)"
                  :to="child.to"
                  role="menuitem"
                  data-pill-motion
                >
                  <span class="pill__circle" data-pill-circle aria-hidden="true" />
                  <span class="pill__label-stack">
                    <span class="pill__label" data-pill-label>{{ child.label }}</span>
                    <span
                      class="pill__label-hover"
                      data-pill-label-hover
                      aria-hidden="true"
                      >{{ child.label }}</span
                    >
                  </span>
                </RouterLink>
                <a
                  v-else
                  class="pill secondary-pill pill--motion"
                  :style="secondaryStyle(index)"
                  :href="child.href"
                  target="_blank"
                  rel="noreferrer"
                  role="menuitem"
                  data-pill-motion
                >
                  <span class="pill__circle" data-pill-circle aria-hidden="true" />
                  <span class="pill__label-stack">
                    <span class="pill__label" data-pill-label>{{ child.label }}</span>
                    <span
                      class="pill__label-hover"
                      data-pill-label-hover
                      aria-hidden="true"
                      >{{ child.label }}</span
                    >
                  </span>
                </a>
              </template>
            </div>
          </li>
        </ul>
      </div>

      <div class="pill-nav__actions">
        <GlobalSearch />

        <div
          class="pill-nav__group pill-nav__group--theme"
          :class="{ 'is-active': activeId === 'theme' }"
        >
          <button
            class="pill pill--motion pill--icon"
            :class="{ 'is-open': activeId === 'theme' }"
            type="button"
            :aria-expanded="activeId === 'theme'"
            aria-haspopup="menu"
            :aria-label="`主题切换，当前为${store.theme === 'light' ? '浅色' : '深色'}模式`"
            data-pill-motion
            @pointerenter="handleMenuPointerEnter('theme', $event)"
            @pointerdown="handleMenuPointerDown"
            @focus="handleMenuFocus('theme')"
            @click="handleMenuClick('theme', $event)"
          >
            <span class="pill__circle" data-pill-circle aria-hidden="true" />
            <span class="pill__icon-stack">
              <svg
                v-if="store.theme === 'light'"
                class="pill__icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="5" fill="currentColor" />
                <path
                  d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                />
              </svg>
              <svg
                v-else
                class="pill__icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                  fill="currentColor"
                />
              </svg>
            </span>
          </button>

          <div
            v-if="activeId === 'theme'"
            class="pill-nav__submenu pill-nav__submenu--theme"
            role="menu"
            aria-label="主题切换"
          >
            <button
              v-for="(item, index) in themeItems"
              :key="item.action"
              class="pill secondary-pill pill--motion"
              :class="{ 'is-selected': store.theme === item.action }"
              :style="secondaryStyle(index)"
              type="button"
              role="menuitemradio"
              :aria-checked="store.theme === item.action"
              data-pill-motion
              @click="handleThemeSelect(item.action!)"
              @focus="cancelClose"
            >
              <span class="pill__circle" data-pill-circle aria-hidden="true" />
              <span class="pill__label-stack">
                <span class="pill__label" data-pill-label>{{ item.label }}</span>
                <span
                  class="pill__label-hover"
                  data-pill-label-hover
                  aria-hidden="true"
                  >{{ item.label }}</span
                >
              </span>
            </button>
          </div>
        </div>

        <button
          class="pill-nav__hamburger"
          :class="{ 'is-open': mobileMenuOpen }"
          type="button"
          :aria-expanded="mobileMenuOpen"
          aria-label="切换导航菜单"
          @click="toggleMobileMenu"
        >
          <span class="pill-nav__hamburger-line" />
          <span class="pill-nav__hamburger-line" />
        </button>
      </div>
    </div>

    <Transition name="pill-mobile">
      <div v-if="mobileMenuOpen" class="pill-nav__mobile">
        <ul class="pill-nav__mobile-list">
        <li
          v-for="item in navItems"
          :key="item.id"
          class="pill-nav__mobile-group"
        >
          <RouterLink
            v-if="item.to"
            class="pill-nav__mobile-link"
            :to="item.to"
            @click="closeMobileMenu"
          >
            {{ item.label }}
          </RouterLink>

          <template v-else>
            <p class="pill-nav__mobile-heading">{{ item.label }}</p>
            <div class="pill-nav__mobile-children">
              <template v-for="child in item.children" :key="child.label">
                <RouterLink
                  v-if="child.to"
                  class="pill-nav__mobile-link"
                  :to="child.to"
                  @click="closeMobileMenu"
                >
                  {{ child.label }}
                </RouterLink>
                <a
                  v-else
                  class="pill-nav__mobile-link"
                  :href="child.href"
                  target="_blank"
                  rel="noreferrer"
                  @click="closeMobileMenu"
                >
                  {{ child.label }}
                </a>
              </template>
            </div>
          </template>
        </li>

        <li class="pill-nav__mobile-group">
          <p class="pill-nav__mobile-heading">主题</p>
          <div class="pill-nav__mobile-children">
            <button
              v-for="item in themeItems"
              :key="item.action"
              class="pill-nav__mobile-link"
              :class="{ 'is-selected': store.theme === item.action }"
              type="button"
              :aria-pressed="store.theme === item.action"
              @click="handleMobileThemeSelect(item.action!)"
            >
              {{ item.label }}
            </button>
          </div>
        </li>
        </ul>
      </div>
    </Transition>
  </nav>
</template>

<style scoped>
.pill-nav {
  --nav-height: 46px;
  --nav-pill-height: 38px;
  --nav-pad: 5px;
  --nav-gap: 4px;
  --pill-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --nav-base: rgb(8 28 36 / 46%);
  --nav-panel: rgb(10 30 40 / 82%);
  --nav-pill-bg: rgb(255 255 255 / 8%);
  --nav-pill-text: rgb(200 240 255 / 82%);
  --nav-hover-fill: rgb(255 255 255 / 90%);
  --nav-hover-text: #103e35;
  --nav-active-outline: rgb(255 255 255 / 42%);
  --nav-shadow: 0 16px 38px rgb(35 77 70 / 12%);

  position: fixed;
  z-index: 30;
  top: 16px;
  left: 50%;
  width: min(94vw, 1420px);
  transform: translateX(-50%);
  pointer-events: none;
}

.pill-nav__bar {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  padding: var(--nav-pad);
  border: 1px solid rgb(255 255 255 / 0%);
  border-radius: 999px;
  background: var(--nav-base);
  box-shadow: var(--nav-shadow);
  backdrop-filter: blur(20px) saturate(150%);
  -webkit-backdrop-filter: blur(20px) saturate(150%);
  pointer-events: auto;
}

.pill-nav__brand {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.pill-nav__logo {
  display: grid;
  width: var(--nav-height);
  height: var(--nav-height);
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid rgb(255 255 255 / 24%);
  border-radius: 50%;
  color: #bdefff;
  background: var(--nav-pill-bg);
  transition:
    color 180ms var(--pill-ease),
    background-color 180ms var(--pill-ease),
    border-color 180ms var(--pill-ease);
}

.pill-nav__brand:hover .pill-nav__logo,
.pill-nav__brand:focus-visible .pill-nav__logo {
  border-color: var(--nav-active-outline);
  color: var(--nav-hover-text);
  background: var(--nav-hover-fill);
}

.pill-nav__brand:focus-visible {
  border-radius: 999px;
  outline: 2px solid var(--nav-active-outline);
  outline-offset: 2px;
}

.pill-nav__logo-mark {
  font-size: 0.66rem;
  font-weight: 840;
  letter-spacing: 0.06em;
}

.pill-nav__brand-copy {
  display: grid;
  gap: 1px;
  color: rgb(255 255 255 / 88%);
  white-space: nowrap;
}

.pill-nav__brand-copy strong {
  font-size: 0.7rem;
  font-weight: 840;
  letter-spacing: 0.08em;
}

.pill-nav__brand-copy small {
  color: rgb(255 255 255 / 51%);
  font-size: 0.48rem;
  font-weight: 680;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.pill-nav__items {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
}

.pill-nav__list {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--nav-gap);
  min-width: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.pill-nav__group {
  position: relative;
  display: flex;
}

.pill {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  height: var(--nav-pill-height);
  padding: 0 16px;
  overflow: hidden;
  border: 0;
  border-radius: 999px;
  color: var(--nav-pill-text);
  background: var(--nav-pill-bg);
  font-size: 0.76rem;
  font-weight: 790;
  letter-spacing: 0.06em;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  isolation: isolate;
  transition:
    color 180ms var(--pill-ease),
    background-color 180ms var(--pill-ease);
}

.pill:focus-visible {
  outline: 2px solid var(--nav-active-outline);
  outline-offset: 2px;
}

.pill.is-current {
  background: rgb(255 255 255 / 14%);
}

.pill.is-current::after {
  position: absolute;
  bottom: 4px;
  left: 50%;
  z-index: 3;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--nav-hover-fill);
  content: '';
  opacity: 0.78;
  transform: translateX(-50%);
}

.pill__circle {
  position: absolute;
  bottom: 0;
  left: 50%;
  z-index: 1;
  display: block;
  border-radius: 50%;
  background: var(--nav-hover-fill);
  pointer-events: none;
  will-change: transform;
}

.pill__label-stack {
  position: relative;
  z-index: 2;
  display: inline-block;
  line-height: 1;
}

.pill__label {
  position: relative;
  z-index: 2;
  display: inline-block;
  line-height: 1;
  will-change: transform;
}

.pill__label-hover {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3;
  display: inline-block;
  color: var(--nav-hover-text);
  line-height: 1;
  will-change: transform, opacity;
}

.pill__chevron {
  position: relative;
  z-index: 3;
  width: 12px;
  height: 12px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.6;
  transition:
    color 160ms var(--pill-ease) 80ms,
    transform 200ms var(--pill-ease);
}

.pill:hover .pill__chevron,
.pill:focus-visible .pill__chevron {
  color: var(--nav-hover-text);
}

.pill.is-open .pill__chevron {
  transform: rotate(180deg);
}

.pill--icon {
  width: var(--nav-pill-height);
  padding: 0;
  transition:
    color 160ms var(--pill-ease) 80ms,
    background-color 180ms var(--pill-ease);
}

.pill--icon:hover,
.pill--icon:focus-visible,
.pill--icon.is-open {
  color: var(--nav-hover-text);
}

.pill__icon-stack {
  position: relative;
  z-index: 2;
  display: grid;
  place-items: center;
}

.pill__icon {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.5;
}

.pill-nav__submenu {
  position: absolute;
  z-index: 20;
  top: calc(100% + 10px);
  left: 50%;
  display: flex;
  align-items: center;
  gap: var(--nav-gap);
  padding: var(--nav-pad);
  border: 1px solid rgb(255 255 255 / 20%);
  border-radius: 999px;
  background: var(--nav-base);
  box-shadow:
    var(--nav-shadow),
    inset 0 1px 0 rgb(255 255 255 / 18%);
  backdrop-filter: blur(22px) saturate(150%);
  -webkit-backdrop-filter: blur(22px) saturate(150%);
  animation: pill-submenu-in 220ms var(--pill-ease) both;
  pointer-events: auto;
}

.pill-nav__submenu--theme {
  right: 0;
  left: auto;
  transform: none;
  animation-name: pill-submenu-in-right;
}

.secondary-pill {
  height: 36px;
  padding: 0 14px;
  animation: pill-submenu-item-in 240ms var(--pill-ease) both;
  animation-delay: var(--secondary-delay);
}

.secondary-pill.is-selected {
  background: rgb(255 255 255 / 18%);
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 26%);
}

.pill-nav__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.pill-nav__hamburger {
  display: none;
  width: var(--nav-height);
  height: var(--nav-height);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0;
  border: 1px solid rgb(255 255 255 / 24%);
  border-radius: 50%;
  color: var(--nav-pill-text);
  background: var(--nav-pill-bg);
  cursor: pointer;
  transition:
    color 180ms var(--pill-ease),
    background-color 180ms var(--pill-ease),
    border-color 180ms var(--pill-ease);
}

.pill-nav__hamburger:hover,
.pill-nav__hamburger:focus-visible {
  border-color: var(--nav-active-outline);
  color: var(--nav-hover-text);
  background: var(--nav-hover-fill);
  outline: none;
}

.pill-nav__hamburger:focus-visible {
  outline: 2px solid var(--nav-active-outline);
  outline-offset: 2px;
}

.pill-nav__hamburger-line {
  width: 16px;
  height: 2px;
  border-radius: 1px;
  background: currentColor;
  transition: transform 240ms var(--pill-ease);
}

.pill-nav__hamburger.is-open .pill-nav__hamburger-line:first-child {
  transform: translateY(3px) rotate(45deg);
}

.pill-nav__hamburger.is-open .pill-nav__hamburger-line:last-child {
  transform: translateY(-3px) rotate(-45deg);
}

.pill-nav__mobile {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  left: 0;
  padding: var(--nav-pad);
  border: 1px solid rgb(255 255 255 / 20%);
  border-radius: 24px;
  background: var(--nav-panel);
  box-shadow:
    var(--nav-shadow),
    inset 0 1px 0 rgb(255 255 255 / 18%);
  backdrop-filter: blur(22px) saturate(150%);
  -webkit-backdrop-filter: blur(22px) saturate(150%);
  pointer-events: auto;
}

.pill-mobile-enter-active,
.pill-mobile-leave-active {
  transition:
    opacity 220ms var(--pill-ease),
    transform 220ms var(--pill-ease);
}

.pill-mobile-enter-from,
.pill-mobile-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.97);
  transform-origin: top center;
}

.pill-nav__mobile-list {
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.pill-nav__mobile-group {
  display: grid;
  gap: 4px;
}

.pill-nav__mobile-heading {
  margin: 4px 10px 2px;
  color: rgb(255 255 255 / 48%);
  font-size: 0.6rem;
  font-weight: 780;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.pill-nav__mobile-children {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.pill-nav__mobile-link {
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid transparent;
  border-radius: 999px;
  color: var(--nav-pill-text);
  background: var(--nav-pill-bg);
  font-size: 0.74rem;
  font-weight: 760;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition:
    color 160ms var(--pill-ease),
    background-color 160ms var(--pill-ease);
}

.pill-nav__mobile-link:hover,
.pill-nav__mobile-link:focus-visible,
.pill-nav__mobile-link.is-selected {
  color: var(--nav-hover-text);
  background: var(--nav-hover-fill);
  outline: none;
}

.pill-nav__mobile-link:focus-visible {
  outline: 2px solid var(--nav-active-outline);
  outline-offset: 2px;
}

@keyframes pill-submenu-in {
  from {
    opacity: 0;
    transform: translate(-50%, -8px) scale(0.96);
  }

  to {
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
  }
}

@keyframes pill-submenu-in-right {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.96);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes pill-submenu-item-in {
  from {
    opacity: 0;
    transform: translateY(-6px) scale(0.94);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 1080px) {
  .pill {
    padding: 0 12px;
    font-size: 0.72rem;
  }

  .pill-nav__bar {
    gap: 7px;
  }
}

@media (max-width: 860px) {
  .pill-nav {
    top: 10px;
    width: calc(100vw - 20px);
  }

  .pill-nav__items,
  .pill-nav__group--theme {
    display: none;
  }

  .pill-nav__bar {
    grid-template-columns: auto minmax(0, 1fr);
    padding: 6px;
  }

  .pill-nav__actions {
    justify-self: end;
  }

  .pill-nav__hamburger {
    display: flex;
  }
}

@media (max-width: 560px) {
  .pill-nav__brand-copy {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pill:hover,
  .pill:focus-visible,
  .pill.is-open {
    color: var(--nav-hover-text);
    background: var(--nav-hover-fill);
  }

  .pill-nav__submenu,
  .secondary-pill {
    animation: none;
  }
}
</style>

<style>
[data-theme='dark'] .pill-nav {
  --nav-base: rgb(6 18 38 / 62%);
  --nav-panel: rgb(4 14 30 / 88%);
  --nav-pill-bg: rgb(12 32 56 / 42%);
  --nav-pill-text: rgb(160 205 235 / 82%);
  --nav-hover-fill: rgb(150 205 240 / 88%);
  --nav-hover-text: #071a2c;
  --nav-active-outline: rgb(100 160 210 / 50%);
  --nav-shadow: 0 16px 38px rgb(0 6 20 / 40%);
}

[data-theme='dark'] .pill-nav__brand-copy {
  color: rgb(160 205 235 / 88%);
}

[data-theme='dark'] .pill-nav__brand-copy small {
  color: rgb(130 175 210 / 48%);
}

[data-theme='dark'] .pill-nav__logo-mark {
  color: #8bc7e2;
}

[data-theme='dark'] .pill-nav__mobile-heading {
  color: rgb(130 175 210 / 52%);
}
</style>
