<template>
  <article class="gallery-card" aria-label="动态相册，树林下散步">
    <header class="gallery-card__header">
      <p class="gallery-card__eyebrow">动态 · 相册</p>
      <!-- <span class="gallery-card__badge">PICTURES</span> -->
    </header>

    <div class="gallery-card__frame">
      <img class="gallery-card__image"
        src="https://tse2-mm.cn.bing.net/th/id/OIP-C.biQ7tIKJcAl-6-ILyOabEAHaFi?w=228&h=180&c=7&r=0&o=7&pid=1.7&rm=3"
        alt="树林与长椅旁的散步照片" width="768" height="512" />
      <span class="gallery-card__light" aria-hidden="true" />
    </div>

    <footer class="gallery-card__footer">
      <div>
        <h3>树林下散步</h3>
        <time datetime="2026-09-27">2026 · 09 · 27</time>
      </div>
      <span class="gallery-card__playing">
        <i aria-hidden="true" />
        PLAYING
      </span>
    </footer>
  </article>
</template>

<style scoped>
.gallery-card {
  display: grid;
  gap: 11px;
  width: 100%;
  padding: 10px 18px 10px;
  border: 1px solid rgb(255 255 255 / 0%);
  border-radius: 18px;
  color: rgb(255, 255, 255);
  background: rgb(218 239 243 / 22%) 62%;
  /* linear-gradient(145deg,
      rgb(255 255 255 / 44%),
      rgb(218 239 243 / 22%) 62%,
      rgb(255 255 255 / 30%)),
    rgb(162 202 215 / 16%); */
  box-shadow:
    0 24px 58px rgb(17 57 67 / 17%);

  backdrop-filter: blur(10px) saturate(155%);
  -webkit-backdrop-filter: blur(10px) saturate(155%);
}

.gallery-card__header,
.gallery-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.gallery-card__eyebrow,
.gallery-card__footer h3,
.gallery-card__footer time {
  margin: 0;
}

.gallery-card__eyebrow {
  color: rgb(27 83 99 / 70%);
  font-size: 0.92rem;
  font-weight: 780;
  letter-spacing: 0.08em;
}

.gallery-card__badge,
.gallery-card__playing {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 25px;
  padding: 0 11px;
  border: 1px solid rgb(92, 201, 236 / 20%);
  border-radius: 999px;
  color: rgb(198, 230, 238, 0.986);
  background: rgb(92, 201, 236, 12.16%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 58%);
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.gallery-card__frame {
  position: relative;
  aspect-ratio: 1.72;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 56%);
  border-radius: 14px;
  background: rgb(19 52 56 / 24%);
  box-shadow:
    0 15px 34px rgb(15 55 64 / 18%),
    inset 0 1px 0 rgb(255 255 255 / 46%);
}

.gallery-card__image {
  display: block;
  width: 100%;
  height: 100%;
  filter: saturate(0.78) contrast(1.02) brightness(0.88);
  object-fit: cover;
  object-position: center 38%;
}

.gallery-card__light {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 10%), transparent 42%),
    radial-gradient(circle at 72% 12%, rgb(255 250 226 / 28%), transparent 30%);
  pointer-events: none;
}

.gallery-card__footer h3 {
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.86rem;
  font-weight: 780;
}

.gallery-card__footer time {
  display: block;
  margin-top: 4px;
  color: rgb(198, 230, 238, 0.986);
  font-size: 0.68rem;
  font-variant-numeric: tabular-nums;
}

.gallery-card__playing i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #77dca9;
  box-shadow: 0 0 0 4px rgb(119 220 169 / 14%);
  animation: gallery-playing-pulse 1.8s ease-in-out infinite;
}

[data-theme='dark'] .gallery-card {
  border-color: rgb(78 135 182 / 34%);
  color: rgb(151 202 228 / 82%);
  background:
    linear-gradient(145deg,
      rgb(12 32 56 / 62%),
      rgb(6 20 38 / 36%) 62%,
      rgb(14 38 64 / 48%)),
    rgb(5 18 36 / 26%);
  box-shadow:
    0 24px 58px rgb(0 5 18 / 46%),
    inset 0 1px 0 rgb(140 190 230 / 28%),
    inset 0 -24px 48px rgb(30 70 120 / 7%);
}

[data-theme='dark'] .gallery-card__eyebrow,
[data-theme='dark'] .gallery-card__footer h3 {
  color: rgb(157 208 235 / 88%);
}

[data-theme='dark'] .gallery-card__badge,
[data-theme='dark'] .gallery-card__playing {
  border-color: rgb(80 140 190 / 28%);
  color: rgb(137 185 218 / 58%);
  background: rgb(12 34 58 / 28%);
  box-shadow: inset 0 1px 0 rgb(140 190 230 / 12%);
}

[data-theme='dark'] .gallery-card__footer time {
  color: rgb(116 162 198 / 62%);
}

@keyframes gallery-playing-pulse {
  50% {
    opacity: 0.55;
    transform: scale(0.82);
  }
}

@media (prefers-reduced-motion: reduce) {
  .gallery-card__playing i {
    animation: none;
  }
}
</style>
