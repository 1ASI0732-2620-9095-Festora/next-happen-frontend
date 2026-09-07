<template>
  <div class="page container">
    <h1 class="page-title">Saved Events</h1>

    <div class="card">
      <div v-if="filteredEvents.length === 0" class="empty">
        <img src="/src/assets/mascot.png" class="mascot" alt=""/>
        <div class="empty-title">No saved events yet</div>
        <div class="empty-sub">Explore events and tap the heart icon to save them for later.</div>
        <RouterLink to="/" class="explore-btn">Explore</RouterLink>
      </div>

      <div v-else class="saved-list">
        <EventCard
            v-for="s in filteredEvents"
            :key="s.id"
            :event="s"
            :showSave="false"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSavedStore } from '@/modules/events/application/saved.store.js'
import EventCard from '@/modules/events/presentation/EventCard.vue'

const { t } = useI18n()
const savedStore = useSavedStore()

onMounted(() => savedStore.loadSaved())

const filteredEvents = computed(() => savedStore.savedEvents)
</script>
