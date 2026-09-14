<template>
  <div id="app" class="app-layout">
    <Navbar v-if="isUserRoute" />

    <OrganizerHeader v-else-if="isOrganizerRoute" />

    <main class="main-content">
      <RouterView />
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

import Navbar from '@/shared/presentation/Navbar.vue'
import OrganizerHeader from '@/shared/presentation/organizer-header.vue'
import AppFooter from '@/shared/presentation/AppFooter.vue'

const route = useRoute()

const isUserRoute = computed(() => route.path.startsWith('/user'))
const isOrganizerRoute = computed(() => route.path.startsWith('/org'))
</script>

<style>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1 0 auto;
}
body {
  margin: 0;
  background-color: #fffdf8;
  font-family: 'Inter', sans-serif;
}
</style>
