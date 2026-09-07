<template>
  <div class="saved-content">
    <h2>{{ $t('saved.title') }}</h2>

    <!-- Cuando no hay eventos guardados -->
    <div v-if="filteredEvents.length === 0">
      <p class="no-saved-title">{{ $t('saved.emptyTitle') }}</p>
      <p class="no-saved-desc">{{ $t('saved.emptyDesc') }}</p>
      <RouterLink to="/user/home">
        <button class="explore-btn">{{ $t('saved.explore') }}</button>
      </RouterLink>
    </div>

    <!-- Cuando sí hay eventos guardados -->
    <div v-else class="events-grid">
      <EventCard
        v-for="e in filteredEvents"
        :key="e.id"
        :event="e"
        :showSave="false"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import EventCard from '@/modules/events/presentation/EventCard.vue'

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/proxy' : 'http://localhost:5000')
const savedEvents = ref([])

const { t } = useI18n()

onMounted(async () => {
  const userId = localStorage.getItem("userId")

  if (!userId) {
    console.error("No hay userId en localStorage")
    return
  }

  try {
    // 1️⃣ Obtener lista de guardados (solo userId + eventId)
    const token = localStorage.getItem("token")
    const res = await axios.get(`${API_URL}/api/users/${userId}/saved-events`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const savedList = res.data

    // 2️⃣ Traer el evento completo de cada guardado
    const fullEvents = await Promise.all(
      savedList.map(async (s) => {
        try {
          const eventRes = await axios.get(`${API_URL}/api/events/${s.eventId}`)
          const ev = eventRes.data

          // 3️⃣ Normalizar imagen (Cloudinary)
          const image =
            ev.images?.[0]?.url ||
            ev.photos?.[0] ||
            "https://res.cloudinary.com/dummy/no-image.png"

          return {
            ...ev,
            image
          }

        } catch (err) {
          console.error("Error cargando evento:", s.eventId)
          return null
        }
      })
    )

    // 4️⃣ Guardar eventos válidos
    savedEvents.value = fullEvents.filter(e => e !== null)

    console.log("EVENTOS COMPLETOS:", savedEvents.value)

  } catch (err) {
    console.error("Error cargando guardados:", err)
  }
})

/* Para la vista */
const filteredEvents = computed(() => savedEvents.value)
</script>

<style scoped>
.saved-content{
  text-align: center;
  margin: 40px;
}
  
.event-card{
  border-radius: 0;
  border: 2px solid #333;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 1);
}

.events-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 48px;
  border-bottom: 1px solid #ddd;
  background-color: #fff;
}

.events-nav .logo {
  font-weight: 700;
  font-size: 1.2rem;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 24px;
}

.nav-links a {
  text-decoration: none;
  color: #000;
  font-weight: 500;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-bar {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #e1e1e1;
  background-color: #f3f1ea;
}

.profile-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.saved-content {
  margin-top: 60px;
}

.saved-content h2 {
  font-size: 1.5rem;
  margin-bottom: 12px;
}

.no-saved-title {
  font-weight: 600;
  font-size: 1.1rem;
}

.no-saved-desc {
  color: #555;
  margin-bottom: 20px;
}

.explore-btn {
  border: 2px solid #333;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 1);
  cursor: pointer;
  height: 30px;
}

.explore-btn:hover {
  border: 2px solid #333;
  box-shadow: none;
}

.happi-img {
  display: block;
  margin: 40px auto;
  width: 180px;
  opacity: 0.8;
}

.events-grid {
  display: flex;
  flex-direction: column;   
  gap: 20px;                 
  margin-top: 32px;
  padding: 0 48px;
}
</style>

