<template>
  <div class="sales-page">
    <header class="s-head">
      <span class="r-kicker">💰 Panel del organizador</span>
      <h1 class="r-page-title">Ventas</h1>
      <p class="s-sub">Ingresos y asistencia en tiempo real de tus eventos.</p>
    </header>

    <div v-if="loading" class="kpis">
      <div v-for="n in 4" :key="n" class="kpi skeleton"></div>
    </div>

    <template v-else>
      <!-- KPIs globales -->
      <div class="kpis">
        <div class="kpi kpi--money">
          <span class="kpi-label">Ingresos netos</span>
          <span class="kpi-value">S/. {{ totalRevenue.toFixed(2) }}</span>
        </div>
        <div class="kpi">
          <span class="kpi-label">Entradas vendidas</span>
          <span class="kpi-value">{{ totalSold }}</span>
        </div>
        <div class="kpi kpi--ok">
          <span class="kpi-label">Validadas · asistencia</span>
          <span class="kpi-value">{{ totalValidated }}</span>
        </div>
        <div class="kpi kpi--danger">
          <span class="kpi-label">Reembolsadas</span>
          <span class="kpi-value">{{ totalRefunded }}</span>
        </div>
      </div>

      <!-- Por evento -->
      <div v-if="rows.length" class="event-cards">
        <article v-for="row in rows" :key="row.eventId" class="event-card">
          <div class="event-head">
            <h3 class="event-title">{{ row.title }}</h3>
            <span class="revenue">S/. {{ row.summary.netRevenue.toFixed(2) }}</span>
          </div>

          <div class="capacity">
            <div class="capacity-bar">
              <div class="capacity-fill" :style="{ width: soldPercent(row) }"></div>
            </div>
            <small>{{ row.summary.ticketsSold }} vendidas · {{ row.remaining }} disponibles</small>
          </div>

          <div class="stats-row">
            <span class="chip chip--ok">✔ {{ row.summary.ticketsValidated }} validadas</span>
            <span class="chip chip--danger">↩ {{ row.summary.ticketsRefunded }} reembolsos</span>
          </div>

          <div v-if="row.summary.byDay.length" class="chart">
            <div class="bars">
              <div
                v-for="d in row.summary.byDay"
                :key="d.date"
                class="bar-col"
                :title="`${d.date}: ${d.tickets} entradas · S/. ${d.revenue.toFixed(2)}`"
              >
                <span class="bar-val">{{ d.tickets }}</span>
                <div class="bar" :style="{ height: barHeight(d, row) }"></div>
                <small class="bar-label">{{ shortDay(d.date) }}</small>
              </div>
            </div>
            <small class="chart-caption">Entradas vendidas por día</small>
          </div>
          <p v-else class="no-data">Aún no hay ventas para este evento.</p>
        </article>
      </div>

      <div v-else class="empty r-card">
        <div class="empty-icon">📊</div>
        <h2>Sin ventas todavía</h2>
        <p>Cuando alguien compre entradas a tus eventos, verás aquí los ingresos y la asistencia.</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { SalesApi } from '@/modules/tickets/infrastructure/sales-api.js'

const salesApi = new SalesApi()
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/proxy' : 'http://localhost:5000')

const loading = ref(true)
const rows = ref([])

const totalRevenue = computed(() => rows.value.reduce((a, r) => a + r.summary.netRevenue, 0))
const totalSold = computed(() => rows.value.reduce((a, r) => a + r.summary.ticketsSold, 0))
const totalValidated = computed(() => rows.value.reduce((a, r) => a + r.summary.ticketsValidated, 0))
const totalRefunded = computed(() => rows.value.reduce((a, r) => a + r.summary.ticketsRefunded, 0))

function soldPercent(row) {
  const total = row.summary.ticketsSold + row.remaining
  return total ? `${Math.round((row.summary.ticketsSold / total) * 100)}%` : '0%'
}
function barHeight(d, row) {
  const max = Math.max(...row.summary.byDay.map(x => x.tickets), 1)
  return `${Math.max(8, Math.round((d.tickets / max) * 100))}%`
}
function shortDay(date) {
  return date.slice(5)
}

async function load() {
  loading.value = true
  try {
    const organizerId = localStorage.getItem('userId')
    const organizerName = localStorage.getItem('userName')
    const { data: allEvents } = await axios.get(`${API_URL}/api/events`)
    const myEvents = allEvents.filter(
      ev => ev.organizer === organizerId || ev.organizer === organizerName
    )

    if (!myEvents.length) { rows.value = []; return }

    const summaries = await salesApi.getForEvents(myEvents.map(e => e.id))
    const byId = Object.fromEntries(summaries.map(s => [s.eventId, s]))

    rows.value = myEvents.map(ev => ({
      eventId: ev.id,
      title: ev.title,
      remaining: ev.quantity ?? 0,
      summary: byId[ev.id] || emptySummary(ev.id)
    }))
  } catch (err) {
    console.error('Error cargando ventas:', err)
    rows.value = []
  } finally {
    loading.value = false
  }
}

function emptySummary(eventId) {
  return {
    eventId, ticketsSold: 0, ticketsValidated: 0, ticketsRefunded: 0,
    grossRevenue: 0, refundedAmount: 0, netRevenue: 0, byDay: []
  }
}

onMounted(load)
</script>

<style scoped>
.sales-page { max-width: 1120px; margin: 0 auto; padding: 40px 24px 64px; }
.s-head { margin-bottom: 28px; }
.r-page-title { font-size: 2.1rem; font-weight: 700; margin: 12px 0 6px; }
.s-sub { color: var(--r-ink-soft); margin: 0; }

/* KPIs */
.kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 18px;
  margin-bottom: 36px;
}
.kpi {
  border: var(--r-bd-3);
  background: var(--r-surface);
  padding: 20px;
  box-shadow: var(--r-sh-2);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.kpi--money  { background: var(--r-brand); }
.kpi--ok     { background: var(--r-success-bg); }
.kpi--danger { background: var(--r-danger-bg); }
.kpi-label {
  font-family: var(--r-font-mono);
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--r-ink-soft);
}
.kpi-value {
  font-family: var(--r-font-mono);
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  color: var(--r-ink);
}

/* Event cards */
.event-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
}
.event-card {
  border: var(--r-bd-3);
  background: var(--r-surface);
  padding: 20px;
  box-shadow: var(--r-sh-3);
}
.event-head { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
.event-title { font-family: var(--r-font-display); font-size: 1.2rem; font-weight: 700; margin: 0; letter-spacing: -0.01em; }
.revenue { font-family: var(--r-font-mono); font-weight: 700; font-size: 1.15rem; color: var(--r-success); white-space: nowrap; }

.capacity { margin: 14px 0; }
.capacity-bar { height: 14px; border: var(--r-bd); background: #fff; box-shadow: var(--r-sh-1); }
.capacity-fill { height: 100%; background: var(--r-brand); }
.capacity small { color: var(--r-ink-soft); display: block; margin-top: 6px; }

.stats-row { display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
.chip {
  font-family: var(--r-font-mono);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 9px;
  border: var(--r-bd);
}
.chip--ok { background: var(--r-success-bg); }
.chip--danger { background: var(--r-danger-bg); }

.chart { margin-top: 12px; }
.bars {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 128px;
  border-bottom: var(--r-bd);
  padding-bottom: 2px;
}
.bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; }
.bar-val { font-family: var(--r-font-mono); font-size: 0.66rem; color: var(--r-ink-soft); margin-bottom: 3px; }
.bar {
  width: 78%;
  background: var(--r-brand);
  border: var(--r-bd);
  min-height: 8px;
  transition: height var(--r-dur) var(--r-ease);
}
.bar-label { font-size: 0.62rem; color: var(--r-ink-faint); margin-top: 4px; font-family: var(--r-font-mono); }
.chart-caption { color: var(--r-ink-faint); display: block; margin-top: 8px; }
.no-data { color: var(--r-ink-faint); margin-top: 12px; }

.skeleton {
  height: 96px;
  background: linear-gradient(100deg, #f3f1ea 30%, #fbf9f2 50%, #f3f1ea 70%);
  background-size: 200% 100%;
  animation: sk 1.2s ease-in-out infinite;
}
@keyframes sk { from { background-position: 200% 0; } to { background-position: -200% 0; } }

.empty { max-width: 460px; margin: 20px auto; padding: 40px 32px; text-align: center; }
.empty-icon { font-size: 3rem; }
.empty h2 { font-family: var(--r-font-display); margin: 12px 0 8px; }
.empty p { color: var(--r-ink-soft); }
</style>
