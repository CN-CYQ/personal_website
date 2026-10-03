import { onBeforeUnmount, onMounted, type Ref } from 'vue'

interface HomeScrollTransitionOptions {
  scope: Ref<HTMLElement | null>
  heroStage: Ref<HTMLElement | null>
  content: Ref<HTMLElement | null>
}

interface GsapContext {
  revert: () => void
}

export function useHomeScrollTransition({
  scope,
  heroStage,
  content,
}: HomeScrollTransitionOptions) {
  let animationContext: GsapContext | undefined

  onMounted(async () => {
    if (
      !scope.value ||
      !heroStage.value ||
      !content.value ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    const [{ gsap }, { ScrollTrigger }] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ])

    gsap.registerPlugin(ScrollTrigger)

    animationContext = gsap.context(() => {
      const transition = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: heroStage.value,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.4,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
        },
      })

      // Deliberately no animated `filter: blur()` here: blurring a full-screen
      // WebGL layer every scroll frame was the most expensive part of the
      // transition. Scale plus opacity reads the same at a fraction of the cost.
      transition.to(
        heroStage.value,
        {
          yPercent: -7,
          scale: 0.93,
          opacity: 0,
        },
        0,
      )

      transition.fromTo(
        content.value,
        {
          y: 48,
          opacity: 0.28,
        },
        {
          y: 0,
          opacity: 1,
        },
        0,
      )
    }, scope.value)
  })

  onBeforeUnmount(() => {
    animationContext?.revert()
    animationContext = undefined
  })
}
