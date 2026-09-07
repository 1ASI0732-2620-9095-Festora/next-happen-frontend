<template>
  <div class="metrics-page">
    <h2 class="h-title mb-2">{{ $t('metrics.title') || 'Métricas de mis eventos' }}</h2>
    <p class="mb-4 p-muted" style="max-width:680px;">
      {{ $t('metrics.desc') || 'Selecciona uno de tus eventos para ver sus métricas de visualización y guardado.' }}
    </p>

    <!-- Selección de evento -->
    <div class="grid mb-3">
      <div class="col-12 md:col-6">
        <label class="block mb-2 p-muted">{{ $t('metrics.selectEvent') || 'Selecciona un evento' }}</label>
        <pv-dropdown
          v-model="selectedEventId"
          :options="myEvents"
          optionLabel="title"
          optionValue="id"
          placeholder="Selecciona un evento"
          class="fair-select"
        />
      </div>
    </div>

    <!-- Si no se seleccionó evento -->
    <div v-if="!selectedEvent" class="p-muted mt-4"></div>

    <!-- Detalle de métricas -->
    <div v-else class="table-container mt-4">
      <h3 class="text-xl font-semibold mb-3">{{ selectedEvent.title }}</h3>
      <div class="grid mb-4">
        <div class="col-12 md:col-6">
          <div class="surface-card p-4 border-1 border-200 border-round">
            <div class="text-gray-600 mb-2">{{ $t('metrics.views') || 'Visualizaciones' }}</div>
            <div class="text-4xl font-bold">{{ eventViews }}</div>
          </div>
        </div>
        <div class="col-12 md:col-6">
          <div class="surface-card p-4 border-1 border-200 border-round">
            <div class="text-gray-600 mb-2">{{ $t('metrics.saves') || 'Guardados' }}</div>
            <div class="text-4xl font-bold">{{ eventSaves }}</div>
          </div>
        </div>
      </div>

      <pv-data-table
        :value="eventMetrics"
        :loading="loading"
        responsiveLayout="scroll"
        class="custom-table"
      >
        <pv-column field="timestamp" header="Fecha y Hora" />
        <pv-column field="action" header="Acción" />
      </pv-data-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { MetricsApi } from '@/modules/metrics/infrastructure/metrics-api.js'

const { t } = useI18n()
const metricsApi = new MetricsApi()

// ================================================
// Estado
// ================================================
const myEvents = ref([])
const metrics = ref([])
const selectedEventId = ref(null)
const loading = ref(false)

const API = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/proxy' : 'http://localhost:5000')

// ================================================
// Cargar eventos REALES desde tu backend .NET
// ================================================
async function fetchEvents() {
  loading.value = true
  try {
    const res = await fetch(`${API}/api/events`)
    if (!res.ok) throw new Error("Error cargando eventos")

    const allEvents = await res.json()
    const organizerId = localStorage.getItem('userId')
    myEvents.value = allEvents.filter(
      ev => ev.organizer === organizerId
    )
  } catch (e) {
    console.error("Error cargando eventos:", e)
    myEvents.value = []
  } finally {
    loading.value = false
  }
}

// ================================================
// onMounted → cargar eventos + métricas
// ================================================
onMounted(async () => {
  await fetchEvents()
  metrics.value = await metricsApi.getAll()
})

// ================================================
// Cuando el usuario selecciona un evento → recargar métricas
// ================================================
watch(selectedEventId, async () => {
  metrics.value = await metricsApi.getAll()
})

// ================================================
// Evento seleccionado
// ================================================
const selectedEvent = computed(() =>
  myEvents.value.find(e => e.id === selectedEventId.value)
)

// ================================================
// Métricas del evento
// ================================================
const eventMetrics = computed(() => {
  if (!selectedEvent.value) return []

  // BACKEND devuelte eventId = GUID
  // FRONT selectedEvent.id = GUID
  return metrics.value.filter(m => m.eventId === selectedEvent.value.id)
})

// ================================================
// Contadores
// ================================================
const eventViews = computed(() =>
  eventMetrics.value.filter(m => m.action === 'view' || m.action === 'view-event').length
)

const eventSaves = computed(() =>
  eventMetrics.value.filter(m => m.action === 'save' || m.action === 'saved-event').length
)
</script>


<style scoped>
.metrics-page {
  max-width: 80rem;
  margin: 2rem auto;
  padding: 2rem;
  border: 2px solid #333;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 1);
}

.custom-table {
  border: 2px solid #333;
  overflow: hidden;
  font-family: "Inter", sans-serif;
}

.fair-select {
  border: 2px solid #333 !important;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 1) !important;
  background-color: #fff !important;
  height: 40px !important;
}

.surface-card {
  border: 2px solid #333;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 1);
}
</style>
