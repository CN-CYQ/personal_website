<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'

import { useAppStore } from '@/stores/app'

const store = useAppStore()

onMounted(() => {
  document.documentElement.setAttribute('data-theme', store.theme)
})
</script>

<template>
  <RouterView />
</template>