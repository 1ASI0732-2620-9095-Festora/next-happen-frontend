<template>
  <div class="dash">
    <!-- Saludo -->
    <header class="dash-head">
      <span class="r-kicker">Panel del organizador</span>
      <h1 class="r-page-title">Hola{{ name ? ', ' + name : '' }} 👋</h1>
      <p class="dash-sub">Este es el resumen de tus eventos y ventas en NextHappen.</p>
    </header>

    <!-- KPIs -->
    <section class="kpis">
      <div class="kpi kpi--money">
        <span class="kpi-label">Ingresos netos</span>
        <span class="kpi-value">S/. {{ totalRevenue.toFixed(2) }}</span>
      </div>
      <div class="kpi">
        <span class="kpi-label">Mis eventos</span>
        <span class="kpi-value">{{ loading ? '—' : myEvents.length }}</span>
      </div>
      <div class="kpi">
        <span class="kpi-label">Entradas vendidas</span>
        <span class="kpi-value">{{ loading ? '—' : totalSold }}</span>
      </div>
      <div class="kpi kpi--ok">
        <span class="kpi-label">Validadas · asistencia</span>
        <span class="kpi-value">{{ loading ? '—' : totalValidated }}</span>
      </div>
    </section>

    <!-- Acciones rápidas -->
    <section class="quick">
      <button class="action" @click="go('org-create-event')">
        <span class="action-icon">➕</span>
        <span class="action-text"><strong>Crear evento</strong><small>Publica una nueva feria</small></span>
      </button>
      <button class="action" @click="go('org-sales')">
        <span class="action-icon">💰</span>
        <span class="action-text"><strong>Ver ventas</strong><small>Ingresos y métricas</small></span>
      </button>
      <button class="action" @click="go('org-validate')">
        <span class="action-icon">🎫</span>
        <span class="action-text"><strong>Validar entradas</strong><small>Control de acceso</small></span>
      </button>
      <button class="action" @click="go('org-events')">
        <span class="action-icon">🗂️</span>
        <span class="action-text"><strong>Mis eventos</strong><small>Editar y gestionar</small></span>
      </button>
    </section>

    <!-- Mis eventos con mini-stats -->
    <section class="events-section">
      <div class="section-head">
        <h2 class="r-display section-title">Tus eventos</h2>
        <button class="r-btn r-btn--primary" @click="go('org-create-event')">
          <i class="pi pi-plus"></i> Nuevo
        </button>
      </div>

      <div v-if="loading" class="rows">
        <div v-for="n in 3" :key="n" class="skeleton"></div>
      </div>

      <div v-else-if="rows.length" class="rows">
        <article v-for="row in rows" :key="row.id" class="event-row">
          <div class="er-main">
            <h3 class="er-title">{{ row.title }}</h3>
            <div class="er-meta">
              <span class="chip">{{ row.category || 'Sin categoría' }}</span>
              <span class="er-date">{{ formatDate(row.startDate) }}</span>
            </div>
            <div class="er-capacity">
              <div class="cap-bar"><div class="cap-fill" :style="{ width: soldPct(row) }"></div></div>
              <small>{{ row.summary.ticketsSold }} vendidas · {{ row.remaining }} disponibles</small>
            </div>
          </div>
          <div class="er-side">
            <span class="er-revenue">S/. {{ row.summary.netRevenue.toFixed(2) }}</span>
            <button class="r-btn r-btn--ghost er-btn" @click="go('org-sales')">Ver ventas</button>
          </div>
        </article>
      </div>

      <div v-else class="empty r-card">
        <div class="empty-icon">📅</div>
        <h3>Aún no tienes eventos</h3>
        <p>Crea tu primera feria para empezar a vender entradas.</p>
        <button class="r-btn r-btn--primary" @click="go('org-create-event')">Crear mi primer evento</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { SalesApi } from '@/modules/tickets/infrastructure/sales-api.js'

const router = useRouter()
const salesApi = new SalesApi()
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/proxy' : 'http://localhost:5000')

const name = localStorage.getItem('userName') || ''
const loading = ref(true)
const myEvents = ref([])
const rows = ref([])

const totalRevenue = computed(() => rows.value.reduce((a, r) => a + r.summary.netRevenue, 0))
const totalSold = computed(() => rows.value.reduce((a, r) => a + r.summary.ticketsSold, 0))
const totalValidated = computed(() => rows.value.reduce((a, r) => a + r.summary.ticketsValidated, 0))

function go(routeName) { router.push({ name: routeName }) }
function soldPct(row) {
  const total = row.summary.ticketsSold + row.remaining
  return total ? `${Math.round((row.summary.ticketsSold / total) * 100)}%` : '0%'
}
function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('es-PE', { dateStyle: 'medium' }) : 'Sin fecha'
}
function emptySummary(id) {
  return { eventId: id, ticketsSold: 0, ticketsValidated: 0, ticketsRefunded: 0, grossRevenue: 0, refundedAmount: 0, netRevenue: 0, byDay: [] }
}

onMounted(async () => {
  try {
    const organizerId = localStorage.getItem('userId')
    const organizerName = localStorage.getItem('userName')
    const { data: all } = await axios.get(`${API_URL}/api/events`)
    myEvents.value = all.filter(ev => ev.organizer === organizerId || ev.organizer === organizerName)

    if (myEvents.value.length) {
      let summaries = []
      try {
        summaries = await salesApi.getForEvents(myEvents.value.map(e => e.id))
      } catch { summaries = [] }
      const byId = Object.fromEntries(summaries.map(s => [s.eventId, s]))

      rows.value = myEvents.value
        .map(ev => ({
          id: ev.id,
          title: ev.title,
          category: ev.category,
          startDate: ev.startDate || ev.dateRange?.startDate,
          remaining: ev.quantity ?? 0,
          summary: byId[ev.id] || emptySummary(ev.id)
        }))
        .sort((a, b) => b.summary.netRevenue - a.summary.netRevenue)
    }
  } catch (err) {
    console.error('Error cargando dashboard:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.dash { max-width: 1120px; margin: 0 auto; padding: 40px 24px 64px; }
.dash-head { margin-bottom: 30px; }
.r-page-title { font-size: 2.2rem; font-weight: 700; margin: 12px 0 6px; }
.dash-sub { color: var(--r-ink-soft); margin: 0; }

/* KPIs */
.kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 18px;
  margin-bottom: 30px;
}
.kpi { border: var(--r-bd-3); background: var(--r-surface); padding: 20px; box-shadow: var(--r-sh-2); display: flex; flex-direction: column; gap: 8px; }
.kpi--money { background: var(--r-brand); }
.kpi--ok { background: var(--r-success-bg); }
.kpi-label { font-family: var(--r-font-mono); font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--r-ink-soft); }
.kpi-value { font-family: var(--r-font-mono); font-size: 2rem; font-weight: 700; line-height: 1; }

/* Quick actions */
.quick { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 40px; }
.action {
  display: flex; align-items: center; gap: 14px; text-align: left;
  border: var(--r-bd); background: var(--r-surface); box-shadow: var(--r-sh-2);
  padding: 16px 18px; cursor: pointer;
  transition: transform var(--r-dur) var(--r-ease), box-shadow var(--r-dur) var(--r-ease);
}
.action:hover { transform: translate(-2px, -2px); box-shadow: var(--r-sh-3); }
.action:active { transform: translate(2px, 2px); box-shadow: 0 0 0 var(--r-ink); }
.action-icon { font-size: 1.8rem; }
.action-text { display: flex; flex-direction: column; }
.action-text strong { font-family: var(--r-font-display); font-size: 1.02rem; }
.action-text small { color: var(--r-ink-soft); }

/* Events */
.section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
.section-title { font-size: 1.5rem; font-weight: 700; margin: 0; }

.rows { display: flex; flex-direction: column; gap: 14px; }
.event-row {
  display: flex; justify-content: space-between; gap: 20px;
  border: var(--r-bd); box-shadow: var(--r-sh-2); background: var(--r-surface); padding: 18px 20px;
}
.er-title { font-family: var(--r-font-display); font-size: 1.15rem; font-weight: 700; margin: 0 0 8px; letter-spacing: -0.01em; }
.er-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.chip { font-family: var(--r-font-mono); font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border: var(--r-bd); background: var(--r-surface-2); }
.er-date { color: var(--r-ink-soft); font-size: 0.85rem; }
.er-capacity { max-width: 340px; }
.cap-bar { height: 12px; border: var(--r-bd); background: #fff; }
.cap-fill { height: 100%; background: var(--r-brand); }
.er-capacity small { color: var(--r-ink-soft); display: block; margin-top: 6px; }
.er-side { display: flex; flex-direction: column; align-items: flex-end; justify-content: center; gap: 10px; flex-shrink: 0; }
.er-revenue { font-family: var(--r-font-mono); font-weight: 700; font-size: 1.3rem; color: var(--r-success); }
.er-btn { font-size: 0.82rem; padding: 8px 14px; }

.skeleton { height: 96px; border: var(--r-bd); box-shadow: var(--r-sh-2); background: linear-gradient(100deg, #f3f1ea 30%, #fbf9f2 50%, #f3f1ea 70%); background-size: 200% 100%; animation: sk 1.2s ease-in-out infinite; }
@keyframes sk { from { background-position: 200% 0; } to { background-position: -200% 0; } }

.empty { text-align: center; padding: 40px 32px; }
.empty-icon { font-size: 3rem; }
.empty h3 { font-family: var(--r-font-display); margin: 12px 0 8px; }
.empty p { color: var(--r-ink-soft); margin-bottom: 20px; }
.empty .r-btn { margin: 0 auto; }

@media (max-width: 560px) {
  .event-row { flex-direction: column; }
  .er-side { align-items: flex-start; flex-direction: row; }
}
</style>
