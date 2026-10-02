import { defineStore } from 'pinia'

export type Theme = 'light' | 'dark'

function loadTheme(): Theme {
  const stored = localStorage.getItem('theme')
  if (stored === 'dark' || stored === 'light') return stored
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useAppStore = defineStore('app', {
  state: () => ({
    initialized: false,
    theme: loadTheme(),
  }),
  actions: {
    markInitialized() {
      this.initialized = true
    },
    setTheme(theme: Theme) {
      this.theme = theme
      localStorage.setItem('theme', theme)
      document.documentElement.setAttribute('data-theme', theme)
    },
  },
})