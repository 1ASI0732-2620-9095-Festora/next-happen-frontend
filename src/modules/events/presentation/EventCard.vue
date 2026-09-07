<template>
  <div class="event-card">
    <!-- Imagen -->
    <div class="img-wrap" @click="registerView">
      <img :src="props.event.image" :alt="props.event.title" />
    </div>

    <!-- Título -->
    <div class="body">
      <h3 class="title">{{ props.event.title }}</h3>
    </div>

    <pv-button
    v-if="props.showSave"
    class="btn-save"
    :icon="isSaved ? 'pi pi-heart-fill' : 'pi pi-heart'" 
    @click="toggleSave"
    />

    <pv-button
      class="btn-eye"
      icon="pi pi-eye"
      @click="handleView"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import axios from "axios"
import { useSavedStore } from "@/modules/events/application/saved.store.js"
import { MetricsApi } from "@/modules/metrics/infrastructure/metrics-api.js"
import { useRouter } from "vue-router"

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/proxy' : 'http://localhost:5000')
const router = useRouter()
const savedStore = useSavedStore()
const metricsApi = new MetricsApi()

const props = defineProps({
  event: Object,
  showSave: {
    type: Boolean,
    default: true
  }
})

const isSaved = ref(false)

// Inicializar si ya está guardado
onMounted(() => {
  if (!props.event?.id) return
  isSaved.value = savedStore.isSaved(props.event.id)
})

async function handleView() {
  const realId = props.event.eventId || props.event.id
  await metricsApi.registerAction(realId, "view")
  router.push({
    name: "user-publishment",
    params: { id: realId }
  })
}

async function toggleSave() {
  const userId = localStorage.getItem("userId")
  const eventId = props.event.id

  if (!userId || !eventId) {
    return console.log("userId que usa el front:", userId)
  }

  console.log("eventId:", eventId)

  try {
    const token = localStorage.getItem("token")
    const config = { headers: { Authorization: `Bearer ${token}` } }

    // SI YA ESTÁ GUARDADO → ELIMINAR DESDE BACKEND
    if (isSaved.value) {
      await axios.delete(`${API_URL}/api/users/${userId}/saved-events/${eventId}`, config)
      savedStore.removeSaved(eventId)
      isSaved.value = false
      console.log("Evento eliminado del backend")
      return
    }

    // SI NO ESTÁ GUARDADO → GUARDAR EN BACKEND
    await axios.post(`${API_URL}/api/users/${userId}/saved-events/${eventId}`, {}, config)
    savedStore.addSaved(props.event)
    isSaved.value = true
    console.log("Evento guardado en backend")

    await metricsApi.registerAction(eventId, "save")
  } catch (err) {
    console.error("Error en toggleSave:", err)
  }
}
</script>

<style scoped>
.event-card {
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  position: relative;
}

/* ==== Botones ==== */
.btn-eye,
.btn-save {
  width: 45px;
  height: 45px;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 2);
  border-radius: 0;
  border: 2px solid #333;
  background-color: #fff;
}

/* Ícono base */
:deep(.p-button-icon) {
  margin: 0 !important;
  font-size: 1.5rem;
  font-weight: 300;
  color: #333;
  transition: color 0.25s ease;
}

/* Hover SAVE */
.btn-save:hover {
  border-color: red;
  cursor: pointer;
  box-shadow: none;
}
.btn-save:hover :deep(.p-button-icon) {
  color: red;
}

/* Hover EYE */
.btn-eye:hover {
  border-color: #2563eb;
  cursor: pointer;
  box-shadow: none;
}
.btn-eye:hover :deep(.p-button-icon) {
  color: #2563eb;
}

/* ==== Estado guardado permanente ==== */
.btn-saved {
  border-color: red !important;
  box-shadow: none !important;
}
.btn-saved :deep(.p-button-icon) {
  color: red !important;
}

:deep(.pi-heart-fill) {
  color: red !important;
}


/* ==== Imagen ==== */
.img-wrap {
  height: 100%;
  width: 180px;
  flex-shrink: 0;
  border: 2px solid #333;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 2);
  overflow: hidden;
}
.img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ==== Texto ==== */
.body {
  flex: 1;
}
.title {
  font-size: 22px;
  margin: 0 0 8px;
  font-weight: 800;
}

/* ==== Responsive ==== */
@media (max-width: 640px) {
  .event-card {
    flex-direction: column;
    align-items: flex-start;
  }
  .img-wrap {
    width: 100%;
    height: 180px;
  }
}
</style>
