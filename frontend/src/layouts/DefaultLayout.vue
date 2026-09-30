<template>
  <div class="app-shell">
    <header class="site-header">
      <RouterLink class="brand" to="/">
        <span class="brand-mark">P</span>
        <span>Personal Website</span>
      </RouterLink>
      <nav class="site-nav" aria-label="主导航">
        <RouterLink to="/">概览</RouterLink>
      </nav>
    </header>

    <main class="site-main">
      <slot />
    </main>
  </div>
</template>
