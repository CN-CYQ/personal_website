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
          scrub: 0.65,
          invalidateOnRefresh: true,
        },
      })

      transition.to(
        heroStage.value,
        {
          yPercent: -7,
          scale: 0.91,
          opacity: 0,
          filter: 'blur(14px)',
        },
        0,
      )

      transition.fromTo(
        content.value,
        {
          y: 56,
          opacity: 0.24,
          scale: 0.992,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
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
