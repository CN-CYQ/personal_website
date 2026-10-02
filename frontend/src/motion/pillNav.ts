import { gsap } from 'gsap'

export interface PillNavMotionOptions {
  ease?: string
  initialLoad?: boolean
}

export interface PillNavMotion {
  refresh: (force?: boolean) => void
  destroy: () => void
  spinLogo: () => void
  reveal: () => void
}

interface PillEntry {
  timeline: gsap.core.Timeline
  tween?: gsap.core.Tween
}

interface PillBinding {
  enter: () => void
  leave: () => void
  focus: () => void
  blur: () => void
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function prefersReducedMotion() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches
}

/**
 * PillNav-style motion tuned for the project glass nav.
 *
 * The controller owns every GSAP tween it creates so the caller only needs to
 * call destroy() on unmount. Elements opt in with:
 *   [data-pill-motion] + [data-pill-circle] (+ optional label elements).
 */
export function createPillNavMotion(
  root: HTMLElement,
  options: PillNavMotionOptions = {},
): PillNavMotion {
  const ease = options.ease ?? 'power3.easeOut'
  const initialLoad = options.initialLoad ?? true
  const entries = new Map<HTMLElement, PillEntry>()
  const bindings = new Map<HTMLElement, PillBinding>()
  const measured = new WeakSet<HTMLElement>()
  const revealTweens: gsap.core.Tween[] = []

  let revealed = false
  let destroyed = false
  let frame = 0
  let logoRotation: gsap.core.Tween | null = null
  let resizeObserver: ResizeObserver | null = null

  const play = (element: HTMLElement) => {
    const entry = entries.get(element)
    if (!entry) {
      return
    }

    entry.tween?.kill()
    entry.tween = entry.timeline.tweenTo(entry.timeline.duration(), {
      duration: 0.3,
      ease,
      overwrite: 'auto',
    })
  }

  const reset = (element: HTMLElement) => {
    const entry = entries.get(element)
    if (!entry) {
      return
    }

    entry.tween?.kill()
    entry.tween = entry.timeline.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: 'auto',
    })
  }

  const layout = (pill: HTMLElement) => {
    const circle = pill.querySelector<HTMLElement>('[data-pill-circle]')
    if (!circle) {
      return
    }

    const { width: w, height: h } = pill.getBoundingClientRect()
    if (w <= 0 || h <= 0) {
      return
    }

    const radius = ((w * w) / 4 + h * h) / (2 * h)
    const diameter = Math.ceil(2 * radius) + 2
    const delta =
      Math.ceil(radius - Math.sqrt(Math.max(0, radius * radius - (w * w) / 4))) +
      1
    const originY = diameter - delta

    circle.style.width = `${diameter}px`
    circle.style.height = `${diameter}px`
    circle.style.bottom = `-${delta}px`

    const label = pill.querySelector<HTMLElement>('[data-pill-label]')
    const hoverLabel = pill.querySelector<HTMLElement>(
      '[data-pill-label-hover]',
    )

    const previous = entries.get(pill)
    previous?.timeline.kill()
    previous?.tween?.kill()

    gsap.set(circle, {
      xPercent: -50,
      scale: 0,
      transformOrigin: `50% ${originY}px`,
    })

    if (label) {
      gsap.set(label, { y: 0 })
    }

    if (hoverLabel) {
      gsap.set(hoverLabel, { y: h + 100, opacity: 0 })
    }

    if (prefersReducedMotion()) {
      entries.delete(pill)
      measured.add(pill)
      return
    }

    const timeline = gsap.timeline({ paused: true })

    timeline.to(
      circle,
      { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' },
      0,
    )

    if (label) {
      timeline.to(
        label,
        { y: -(h + 8), duration: 2, ease, overwrite: 'auto' },
        0,
      )
    }

    if (hoverLabel) {
      timeline.to(
        hoverLabel,
        { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' },
        0,
      )
    }

    entries.set(pill, { timeline })
    measured.add(pill)
  }

  const bind = (force = false) => {
    if (destroyed) {
      return
    }

    const found = new Set<HTMLElement>()

    root.querySelectorAll<HTMLElement>('[data-pill-motion]').forEach((element) => {
      found.add(element)

      if (!bindings.has(element)) {
        const enter = () => play(element)
        const leave = () => reset(element)
        const focus = () => play(element)
        const blur = () => reset(element)

        element.addEventListener('pointerenter', enter)
        element.addEventListener('pointerleave', leave)
        element.addEventListener('focusin', focus)
        element.addEventListener('focusout', blur)
        bindings.set(element, { enter, leave, focus, blur })
      }

      if (force || !measured.has(element)) {
        layout(element)
      }
    })

    bindings.forEach((handlers, element) => {
      if (found.has(element)) {
        return
      }

      element.removeEventListener('pointerenter', handlers.enter)
      element.removeEventListener('pointerleave', handlers.leave)
      element.removeEventListener('focusin', handlers.focus)
      element.removeEventListener('focusout', handlers.blur)

      const entry = entries.get(element)
      entry?.timeline.kill()
      entry?.tween?.kill()
      entries.delete(element)
      measured.delete(element)
      bindings.delete(element)
    })
  }

  const refresh = (force = false) => bind(force)

  const scheduleLayout = () => {
    if (destroyed) {
      return
    }

    window.cancelAnimationFrame(frame)
    frame = window.requestAnimationFrame(() => bind(true))
  }

  const reveal = () => {
    if (revealed || destroyed || !initialLoad || prefersReducedMotion()) {
      return
    }

    revealed = true

    const logo = root.querySelector<HTMLElement>('[data-pill-logo]')
    const track = root.querySelector<HTMLElement>('[data-pill-track]')

    if (logo) {
      gsap.set(logo, { scale: 0 })
      revealTweens.push(gsap.to(logo, { scale: 1, duration: 0.6, ease }))
    }

    if (track) {
      const items = Array.from(
        track.querySelectorAll<HTMLElement>('[data-pill-motion]'),
      )

      if (items.length > 0) {
        gsap.set(items, { opacity: 0, y: 10 })
        revealTweens.push(
          gsap.to(items, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease,
            stagger: 0.05,
            clearProps: 'opacity,transform',
          }),
        )
      }

      gsap.set(track, { clipPath: 'inset(0% 50% 0% 50%)' })
      revealTweens.push(
        gsap.to(track, {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 0.6,
          ease,
          onComplete: () => {
            gsap.set(track, { clearProps: 'clipPath' })
          },
        }),
      )
    }
  }

  const spinLogo = () => {
    if (destroyed || prefersReducedMotion()) {
      return
    }

    const logo = root.querySelector<HTMLElement>('[data-pill-logo]')
    if (!logo) {
      return
    }

    logoRotation?.kill()
    gsap.set(logo, { rotate: 0 })
    logoRotation = gsap.to(logo, {
      rotate: 360,
      duration: 0.4,
      ease,
      overwrite: 'auto',
    })
  }

  const destroy = () => {
    if (destroyed) {
      return
    }

    destroyed = true
    window.cancelAnimationFrame(frame)
    window.removeEventListener('resize', scheduleLayout)
    resizeObserver?.disconnect()

    bindings.forEach((handlers, element) => {
      element.removeEventListener('pointerenter', handlers.enter)
      element.removeEventListener('pointerleave', handlers.leave)
      element.removeEventListener('focusin', handlers.focus)
      element.removeEventListener('focusout', handlers.blur)
    })
    bindings.clear()

    entries.forEach((entry) => {
      entry.timeline.kill()
      entry.tween?.kill()
    })
    entries.clear()

    logoRotation?.kill()
    revealTweens.forEach((tween) => tween.kill())
  }

  window.addEventListener('resize', scheduleLayout)

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(scheduleLayout)
    resizeObserver.observe(root)
  }

  return { refresh, destroy, spinLogo, reveal }
}
