<script setup lang="ts">
import GrassWaveCanvas from './GrassWaveCanvas.vue'
</script>

<template>
  <section class="hero">
    <GrassWaveCanvas />
    <div class="hero__sky-glow" aria-hidden="true" />

    <div class="hero__content">
      <div class="hero__topline">
        <span>CN-CYQ</span>
        <span>Clear sky / 26 C</span>
      </div>

      <div class="hero__statement">
        <p class="hero__eyebrow">Personal digital meadow</p>
        <h1>
          Personal
          <span>Website</span>
        </h1>
        <p class="hero__summary">
          作品、记录与互动实验，在明亮生长的数字草甸中展开。
        </p>
      </div>

      <div class="hero__bottomline">
        <p class="hero__glass-chip hero__interaction">
          <span class="hero__interaction-mark" aria-hidden="true" />
          Move through the meadow
        </p>
        <p class="hero__glass-chip hero__coordinate">
          WIND / 1.18&nbsp;&nbsp; LIGHT / 82%
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 100svh;
  overflow: hidden;
  isolation: isolate;
  color: #123d35;
  background:
    radial-gradient(
      circle at 82% 8%,
      rgb(255 252 229 / 96%) 0%,
      rgb(255 246 210 / 52%) 12%,
      transparent 34%
    ),
    radial-gradient(
      circle at 14% 18%,
      rgb(255 255 255 / 52%) 0%,
      transparent 28%
    ),
    linear-gradient(
      180deg,
      #a8cddd 0%,
      #cfe3e5 34%,
      #e7eee3 52%,
      #92c19e 72%,
      #3f8b71 100%
    );
}

.hero__sky-glow {
  position: absolute;
  z-index: 1;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(
      180deg,
      rgb(255 255 255 / 12%) 0%,
      transparent 42%,
      rgb(255 248 208 / 10%) 100%
    ),
    radial-gradient(
      circle at 84% 9%,
      rgb(255 255 255 / 72%) 0%,
      rgb(255 244 198 / 20%) 7%,
      transparent 19%
    );
  mix-blend-mode: screen;
}

.hero__content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100svh;
  padding: 104px clamp(22px, 4vw, 68px) 34px;
  pointer-events: none;
}

.hero__topline,
.hero__glass-chip {
  border: 1px solid rgb(255 255 255 / 52%);
  background: linear-gradient(
    135deg,
    rgb(255 255 255 / 38%),
    rgb(255 255 255 / 14%)
  );
  box-shadow:
    0 16px 44px rgb(37 80 69 / 12%),
    inset 0 1px 0 rgb(255 255 255 / 55%);
  backdrop-filter: blur(18px) saturate(145%);
  -webkit-backdrop-filter: blur(18px) saturate(145%);
}

.hero__topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  width: 100%;
  padding: 11px 15px;
  border-radius: 16px;
  color: rgb(21 67 57 / 78%);
  font-size: 0.67rem;
  font-weight: 750;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.hero__statement {
  width: min(800px, 84vw);
  margin-top: auto;
  margin-bottom: 7vh;
}

.hero__eyebrow {
  display: inline-flex;
  margin-bottom: 18px;
  padding: 9px 13px;
  border: 1px solid rgb(255 255 255 / 50%);
  border-radius: 999px;
  color: #185b4d;
  background: rgb(255 255 255 / 24%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 58%);
  backdrop-filter: blur(16px) saturate(145%);
  -webkit-backdrop-filter: blur(16px) saturate(145%);
  font-size: 0.68rem;
  font-weight: 780;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: #103e35;
  font-size: clamp(3.75rem, 10vw, 9.5rem);
  font-weight: 520;
  letter-spacing: -0.07em;
  line-height: 0.79;
  text-wrap: balance;
  text-shadow: 0 8px 32px rgb(255 255 255 / 18%);
}

h1 span {
  display: block;
  margin-left: clamp(24px, 8vw, 132px);
  color: transparent;
  -webkit-text-stroke: 1px rgb(255 255 255 / 88%);
}

.hero__summary {
  display: inline-flex;
  max-width: 520px;
  margin: 28px 0 0;
  padding: 12px 16px;
  border: 1px solid rgb(255 255 255 / 46%);
  border-radius: 14px;
  color: rgb(17 61 52 / 76%);
  background: linear-gradient(
    135deg,
    rgb(255 255 255 / 34%),
    rgb(255 255 255 / 12%)
  );
  box-shadow:
    0 14px 38px rgb(42 86 75 / 10%),
    inset 0 1px 0 rgb(255 255 255 / 56%);
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
  font-size: clamp(0.85rem, 1.05vw, 0.98rem);
  line-height: 1.65;
}

.hero__bottomline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.hero__glass-chip {
  margin: 0;
  padding: 10px 14px;
  border-radius: 999px;
  color: rgb(16 59 51 / 76%);
  font-size: 0.66rem;
  font-weight: 760;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.hero__interaction {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hero__interaction-mark {
  width: 8px;
  height: 8px;
  border: 1px solid rgb(255 255 255 / 86%);
  border-radius: 50%;
  background: #e9ffca;
  box-shadow:
    0 0 0 4px rgb(255 255 255 / 18%),
    0 0 20px rgb(255 248 191 / 70%);
}

.hero__coordinate {
  text-align: right;
}

@media (max-width: 720px) {
  .hero__content {
    padding: 94px 20px 24px;
  }

  .hero__topline span:last-child,
  .hero__coordinate {
    display: none;
  }

  .hero__statement {
    width: 100%;
    margin-bottom: 5vh;
  }

  h1 {
    font-size: clamp(3.5rem, 19vw, 6rem);
  }

  h1 span {
    margin-left: 0;
  }

  .hero__summary {
    max-width: 330px;
  }
}
</style>
