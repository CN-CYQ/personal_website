<script setup lang="ts">
import { computed, onBeforeUnmount, ref, type CSSProperties } from 'vue'
import { RouterLink } from 'vue-router'

interface SecondaryNavItem {
  label: string
  to?: string
  href?: string
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

const activeId = ref<string | null>(null)
const navElement = ref<HTMLElement | null>(null)
let closeTimer: ReturnType<typeof setTimeout> | undefined
let pointerIsDown = false

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
    activeId.value = null
  }
}

onBeforeUnmount(cancelClose)
</script>

<template>
  <nav
    ref="navElement"
    class="horizontal-glass-nav"
    aria-label="主导航"
    @pointerleave="scheduleClose"
    @focusout="handleFocusOut"
  >
    <ul class="horizontal-glass-nav__track">
      <li
        v-for="item in navItems"
        :key="item.id"
        class="horizontal-glass-nav__group"
        :class="{ 'is-active': activeId === item.id }"
      >
        <RouterLink
          v-if="item.to"
          class="horizontal-glass-nav__item"
          :to="item.to"
          @pointerenter="handleMenuPointerEnter(item.id, $event)"
          @focus="handleMenuFocus(item.id)"
        >
          {{ item.label }}
        </RouterLink>

        <button
          v-else
          class="horizontal-glass-nav__item"
          type="button"
          :aria-expanded="activeId === item.id"
          aria-haspopup="menu"
          @pointerenter="handleMenuPointerEnter(item.id, $event)"
          @pointerdown="handleMenuPointerDown"
          @focus="handleMenuFocus(item.id)"
          @click="handleMenuClick(item.id, $event)"
        >
          <span>{{ item.label }}</span>
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path d="m3 4.25 3 3 3-3" />
          </svg>
        </button>

        <div
          v-if="activeItem?.id === item.id && item.children"
          class="horizontal-glass-nav__submenu"
          role="menu"
          :aria-label="`${item.label}二级导航`"
        >
          <template
            v-for="(child, index) in item.children"
            :key="child.label"
          >
            <RouterLink
              v-if="child.to"
              class="horizontal-glass-nav__secondary-item"
              :style="secondaryStyle(index)"
              :to="child.to"
              role="menuitem"
              @focus="cancelClose"
            >
              {{ child.label }}
            </RouterLink>
            <a
              v-else
              class="horizontal-glass-nav__secondary-item"
              :style="secondaryStyle(index)"
              :href="child.href"
              target="_blank"
              rel="noreferrer"
              role="menuitem"
              @focus="cancelClose"
            >
              {{ child.label }}
            </a>
          </template>
        </div>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.horizontal-glass-nav {
  position: absolute;
  z-index: 1;
  top: 16px;
  left: 50%;
  pointer-events: none;
  transform: translateX(-50%);
}

.horizontal-glass-nav__track {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  padding: 5px;
  border: 1px solid rgb(255 255 255 / 50%);
  border-radius: 999px;
  background:
    linear-gradient(
      135deg,
      rgb(255 255 255 / 42%),
      rgb(255 255 255 / 14%)
    );
  box-shadow:
    0 16px 38px rgb(35 77 70 / 12%),
    inset 0 1px 0 rgb(255 255 255 / 62%);
  backdrop-filter: blur(20px) saturate(150%);
  -webkit-backdrop-filter: blur(20px) saturate(150%);
  list-style: none;
  pointer-events: auto;
}

.horizontal-glass-nav__group {
  position: relative;
}

.horizontal-glass-nav__item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  min-height: 34px;
  padding: 0 14px;
  border: 1px solid transparent;
  border-radius: 999px;
  color: rgb(17 66 58 / 78%);
  background: transparent;
  font-size: 0.69rem;
  font-weight: 790;
  letter-spacing: 0.13em;
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
  width: 11px;
  height: 11px;
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
  background: linear-gradient(
    135deg,
    rgb(255 255 255 / 62%),
    rgb(255 255 255 / 24%)
  );
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
    linear-gradient(
      135deg,
      rgb(255 255 255 / 48%),
      rgb(255 255 255 / 16%)
    );
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
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid rgb(255 255 255 / 40%);
  border-radius: 999px;
  color: rgb(16 62 54 / 84%);
  background: rgb(255 255 255 / 20%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 52%);
  font-size: 0.66rem;
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
.horizontal-glass-nav__secondary-item:focus-visible {
  border-color: rgb(255 255 255 / 78%);
  color: #103e35;
  background: rgb(255 255 255 / 50%);
  box-shadow:
    0 8px 18px rgb(30 75 68 / 12%),
    inset 0 1px 0 rgb(255 255 255 / 78%);
  outline: none;
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
}

@media (max-width: 720px) {
  .horizontal-glass-nav {
    top: 70px;
    width: min(360px, calc(100vw - 24px));
  }

  .horizontal-glass-nav__track {
    justify-content: center;
    gap: 1px;
    padding: 4px;
  }

  .horizontal-glass-nav__item {
    min-height: 32px;
    padding: 0 8px;
    font-size: 0.65rem;
    letter-spacing: 0.06em;
  }

  .horizontal-glass-nav__submenu {
    max-width: calc(100vw - 24px);
    overflow-x: auto;
  }
}
</style>