<template>
  <article class="poster" @click="openDetail">
    <div class="poster-img">
      <img :src="image" :alt="event.title" loading="lazy" @error="onImgError" />
      <span v-if="event.category" class="poster-cat">{{ event.category }}</span>
      <button
        class="poster-save"
        :class="{ saved: isSaved }"
        :title="isSaved ? 'Quitar de guardados' : 'Guardar'"
        @click.stop="toggleSave"
      >
        <i :class="isSaved ? 'pi pi-heart-fill' : 'pi pi-heart'"></i>
      </button>
    </div>
    <div class="poster-body">
      <h3 class="poster-title">{{ event.title }}</h3>
      <div class="poster-foot">
        <span class="poster-date">📅 {{ formatDate(startDate) }}</span>
        <span class="poster-price">{{ priceLabel }}</span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useSavedStore } from '@/modules/events/application/saved.store.js'
import { MetricsApi } from '@/modules/metrics/infrastructure/metrics-api.js'

const props = defineProps({ event: { type: Object, required: true } })

const router = useRouter()
const savedStore = useSavedStore()
const metricsApi = new MetricsApi()
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/proxy' : 'http://localhost:5000')

const isSaved = ref(false)

const image = computed(() =>
  props.event.image || props.event.photos?.[0] || 'https://placehold.co/400x260?text=NextHappen'
)
const startDate = computed(() => props.event.startDate || props.event.dateRange?.startDate)
const priceLabel = computed(() => {
  const p = props.event.price
  return p ? `S/. ${Number(p).toFixed(2)}` : 'Gratis'
})

onMounted(() => {
  if (props.event?.id) isSaved.value = savedStore.isSaved(props.event.id)
})

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }) : 'Por definir'
}

function onImgError(e) {
  e.target.src = 'https://placehold.co/900x560?text=NextHappen'
}

async function openDetail() {
  const id = props.event.eventId || props.event.id
  try { await metricsApi.registerAction(id, 'view') } catch { /* opcional */ }
  router.push({ name: 'user-publishment', params: { id } })
}

async function toggleSave() {
  const userId = localStorage.getItem('userId')
  const token = localStorage.getItem('token')
  const eventId = props.event.id
  if (!userId || !token) { alert('Debes iniciar sesión para guardar eventos.'); return }

  const config = { headers: { Authorization: `Bearer ${token}` } }
  try {
    if (isSaved.value) {
      await axios.delete(`${API_URL}/api/users/${userId}/saved-events/${eventId}`, config)
      savedStore.removeSaved(eventId)
      isSaved.value = false
    } else {
      await axios.post(`${API_URL}/api/users/${userId}/saved-events/${eventId}`, {}, config)
      savedStore.addSaved(props.event)
      isSaved.value = true

      await metricsApi.registerAction(eventId, "save")
    }
  } catch (err) {
    console.error('Error al guardar/quitar evento:', err)
  }
}
</script>

<style scoped>
.poster {
  display: flex;
  flex-direction: column;
  border: var(--r-bd);
  background: var(--r-surface);
  box-shadow: var(--r-sh-2);
  cursor: pointer;
  transition: transform var(--r-dur) var(--r-ease), box-shadow var(--r-dur) var(--r-ease);
}
.poster:hover { transform: translate(-3px, -3px); box-shadow: var(--r-sh-3); }

.poster-img { position: relative; aspect-ratio: 16 / 10; border-bottom: var(--r-bd); overflow: hidden; }
.poster-img img { width: 100%; height: 100%; object-fit: cover; display: block; }

.poster-cat {
  position: absolute; left: 10px; top: 10px;
  font-family: var(--r-font-mono); font-weight: 700; font-size: 0.66rem;
  text-transform: uppercase; letter-spacing: 0.03em;
  padding: 3px 8px; border: var(--r-bd); background: var(--r-brand); color: var(--r-brand-ink);
  box-shadow: var(--r-sh-1);
}
.poster-save {
  position: absolute; right: 10px; top: 10px;
  width: 38px; height: 38px; display: grid; place-items: center;
  border: var(--r-bd); background: #fff; box-shadow: var(--r-sh-1); cursor: pointer;
  transition: transform var(--r-dur) var(--r-ease);
}
.poster-save:hover { transform: scale(1.08); }
.poster-save i { font-size: 1.15rem; color: var(--r-ink); }
.poster-save.saved { background: var(--r-coral); }
.poster-save.saved i { color: #fff; }

.poster-body { padding: 14px 16px; display: flex; flex-direction: column; gap: 12px; flex: 1; }
.poster-title {
  font-family: var(--r-font-display); font-size: 1.1rem; font-weight: 700;
  letter-spacing: -0.01em; line-height: 1.2; margin: 0;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.poster-foot { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
.poster-date { color: var(--r-ink-soft); font-size: 0.82rem; }
.poster-price { font-family: var(--r-font-mono); font-weight: 700; font-size: 0.95rem; }
</style>
