<template>
  <div class="tickets-page">
    <header class="tk-head">
      <span class="r-kicker">🎟️ {{ $t('tickets.pageTitle') }}</span>
      <h1 class="r-page-title">{{ $t('tickets.pageTitle') }}</h1>
      <p class="tk-sub">{{ $t('tickets.pageSub') }}</p>

      <!-- Tabs de Navegación: Vigentes vs Historial (US14) -->
      <div class="ticket-tabs">
        <button
          class="tab-btn"
          :class="{ active: currentTab === 'active' }"
          @click="currentTab = 'active'"
        >
          <i class="pi pi-ticket"></i> {{ $t('tickets.activeTab') }} ({{ activeTickets.length }})
        </button>
        <button
          class="tab-btn"
          :class="{ active: currentTab === 'history' }"
          @click="currentTab = 'history'"
        >
          <i class="pi pi-history"></i> {{ $t('tickets.historyTab') }} ({{ historyTickets.length }})
        </button>
      </div>
    </header>

    <!-- Resumen de Compras en la pestaña de Historial -->
    <div v-if="currentTab === 'history' && !loading && historyTickets.length" class="history-summary r-card">
      <div class="summary-metric">
        <span class="metric-label">{{ $t('tickets.totalSpent') }}</span>
        <span class="metric-val">S/. {{ totalHistorySpent.toFixed(2) }}</span>
      </div>
      <div class="summary-metric">
        <span class="metric-label">Entradas Registradas</span>
        <span class="metric-val">{{ historyTickets.length }}</span>
      </div>
      <div class="summary-metric">
        <span class="metric-label">Última Compra</span>
        <span class="metric-val">{{ lastPurchaseDate }}</span>
      </div>
    </div>

    <!-- Loading skeletons -->
    <div v-if="loading" class="tickets-list">
      <div v-for="n in 2" :key="n" class="skeleton"></div>
    </div>

    <!-- Pestaña 1: Entradas Vigentes -->
    <div v-else-if="currentTab === 'active'">
      <div v-if="activeTickets.length" class="tickets-list">
        <article
          v-for="ticket in activeTickets"
          :key="ticket.id"
          class="ticket r-pop-in st-active"
        >
          <!-- Cuerpo del ticket -->
          <div class="ticket-body">
            <div class="ticket-top">
              <h3 class="ticket-title">{{ ticket.title }}</h3>
              <span class="r-badge r-badge--success">{{ $t('tickets.statusActive') }}</span>
            </div>

            <dl class="ticket-meta">
              <div>
                <dt>Precio</dt>
                <dd class="price">S/. {{ Number(ticket.price).toFixed(2) }}</dd>
              </div>
              <div>
                <dt>{{ $t('tickets.purchasedOn') }}</dt>
                <dd>{{ formatDate(ticket.purchaseDate) }}</dd>
              </div>
            </dl>

            <div class="ticket-actions">
              <button class="r-btn r-btn--ghost" @click="goToEvent(ticket.eventId)">
                <i class="pi pi-eye"></i> {{ $t('tickets.viewEventBtn') }}
              </button>
              <button
                class="r-btn r-btn--danger"
                :disabled="refunding === ticket.id"
                @click="refund(ticket)"
              >
                <i class="pi pi-undo"></i> {{ refunding === ticket.id ? 'Procesando…' : $t('tickets.refundBtn') }}
              </button>
            </div>
          </div>

          <!-- Perforación -->
          <div class="perf" aria-hidden="true"><span class="notch top"></span><span class="notch bot"></span></div>

          <!-- Colilla con QR + código corto -->
          <div class="ticket-stub">
            <img v-if="ticket.qrUrl" :src="ticket.qrUrl" alt="Código QR de la entrada" class="qr" />
            <div class="code-block" v-if="ticket.shortCode">
              <span class="code-label">Código</span>
              <span class="code-value">{{ formatCode(ticket.shortCode) }}</span>
            </div>
            <span class="stub-tag">{{ $t('tickets.admitOne') }}</span>
          </div>
        </article>
      </div>

      <!-- Empty state vigentes -->
      <div v-else class="empty r-card">
        <div class="empty-icon">🎫</div>
        <h2>{{ $t('tickets.noActive') }}</h2>
        <p>Cuando compres una entrada para un evento próximo, aparecerá aquí con su código QR listo para escanear.</p>
        <button class="r-btn r-btn--primary" @click="$router.push({ name: 'user-events' })">
          Explorar eventos
        </button>
      </div>
    </div>

    <!-- Pestaña 2: Historial de Compras (US14) -->
    <div v-else-if="currentTab === 'history'">
      <div v-if="historyTickets.length" class="tickets-list">
        <article
          v-for="ticket in historyTickets"
          :key="ticket.id"
          class="ticket r-pop-in"
          :class="statusClass(ticket.status)"
        >
          <!-- Cuerpo del ticket -->
          <div class="ticket-body">
            <div class="ticket-top">
              <h3 class="ticket-title">{{ ticket.title }}</h3>
              <span class="r-badge" :class="badgeClass(ticket.status)">{{ statusLabel(ticket.status) }}</span>
            </div>

            <dl class="ticket-meta">
              <div>
                <dt>Importe</dt>
                <dd class="price">S/. {{ Number(ticket.price).toFixed(2) }}</dd>
              </div>
              <div>
                <dt>{{ $t('tickets.purchasedOn') }}</dt>
                <dd>{{ formatDate(ticket.purchaseDate) }}</dd>
              </div>
              <div>
                <dt>ID de Ticket</dt>
                <dd class="ticket-id-sub">#{{ String(ticket.id).slice(0, 8) }}</dd>
              </div>
            </dl>

            <div class="ticket-actions">
              <button class="r-btn r-btn--ghost" @click="goToEvent(ticket.eventId)">
                <i class="pi pi-eye"></i> {{ $t('tickets.viewEventBtn') }}
              </button>
            </div>
          </div>

          <!-- Perforación -->
          <div class="perf" aria-hidden="true"><span class="notch top"></span><span class="notch bot"></span></div>

          <!-- Colilla informativa -->
          <div class="ticket-stub">
            <div class="stub-state">
              <span class="stub-icon">{{ stubIcon(ticket.status) }}</span>
              <span class="stub-label">{{ statusLabel(ticket.status) }}</span>
            </div>
          </div>
        </article>
      </div>

      <!-- Empty state historial -->
      <div v-else class="empty r-card">
        <div class="empty-icon">📜</div>
        <h2>{{ $t('tickets.noHistory') }}</h2>
        <p>Aquí se registrará el historial de todas las entradas utilizadas o reembolsadas en la plataforma.</p>
        <button class="r-btn r-btn--primary" @click="$router.push({ name: 'user-events' })">
          Explorar eventos
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { PaymentsApi } from '@/modules/tickets/infrastructure/payments-api.js'

const router = useRouter()
const paymentsApi = new PaymentsApi()
const tickets = ref([])
const loading = ref(true)
const refunding = ref(null)
const currentTab = ref('active') // 'active' | 'history'

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/proxy' : 'http://localhost:5000')

const activeTickets = computed(() => {
  return tickets.value.filter(t => t.status === 'Active')
})

const historyTickets = computed(() => {
  // Compras pasadas, utilizadas, canceladas o reembolsadas
  return tickets.value.filter(t => t.status !== 'Active')
})

const totalHistorySpent = computed(() => {
  return historyTickets.value.reduce((acc, t) => acc + (Number(t.price) || 0), 0)
})

const lastPurchaseDate = computed(() => {
  if (!historyTickets.value.length) return '—'
  const dates = historyTickets.value
    .map(t => new Date(t.purchaseDate).getTime())
    .filter(t => !isNaN(t))
  if (!dates.length) return '—'
  const max = Math.max(...dates)
  return new Date(max).toLocaleDateString('es-PE', { dateStyle: 'medium' })
})

async function load() {
  loading.value = true
  const userId = localStorage.getItem('userId')
  if (!userId) {
    console.error('No hay userId en localStorage')
    loading.value = false
    return
  }

  try {
    const raw = await paymentsApi.getUserTickets(userId)

    const enriched = await Promise.all(
      raw.map(async (t) => {
        let title = 'Evento'
        try {
          const eventRes = await axios.get(`${API_URL}/api/events/${t.eventId}`)
          title = eventRes.data.title
        } catch {
          // Evento eliminado o inaccesible; mantenemos el título por defecto.
        }

        let qrUrl = null
        if (t.status === 'Active') {
          try {
            qrUrl = await paymentsApi.getQrObjectUrl(t.id)
          } catch {
            qrUrl = null
          }
        }

        return { ...t, title, qrUrl }
      })
    )

    tickets.value = enriched
  } catch (err) {
    console.error('Error al obtener tickets:', err)
  } finally {
    loading.value = false
  }
}

async function refund(ticket) {
  if (!confirm('¿Seguro que deseas reembolsar esta entrada? Se devolverá el importe a tu tarjeta.')) return
  refunding.value = ticket.id
  try {
    await paymentsApi.refund(ticket.id)
    await load()
  } catch (err) {
    const msg = err?.response?.data?.error || 'No se pudo procesar el reembolso.'
    alert(msg)
  } finally {
    refunding.value = null
  }
}

function statusLabel(status) {
  return { Active: 'Válida', Used: 'Utilizada', Refunded: 'Reembolsada', Cancelled: 'Cancelada' }[status] || status
}
function formatCode(code) {
  if (!code) return ''
  return code.length === 6 ? `${code.slice(0, 3)}-${code.slice(3)}` : code
}
function stubIcon(status) {
  return { Used: '✔', Refunded: '↩', Cancelled: '✕' }[status] || '—'
}
function statusClass(status) {
  return `st-${(status || '').toLowerCase()}`
}
function badgeClass(status) {
  return {
    Active: 'r-badge--success',
    Used: 'r-badge--brand',
    Refunded: 'r-badge--danger',
    Cancelled: 'r-badge--muted'
  }[status] || 'r-badge--muted'
}
function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('es-PE', { dateStyle: 'medium' })
}

function goToEvent(eventId) {
  router.push({ name: 'user-publishment', params: { id: eventId } })
}

onMounted(load)
</script>

<style scoped>
.tickets-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 24px 64px;
  font-family: 'Space Grotesk', 'Inter', sans-serif;
}

.tk-head {
  margin-bottom: 24px;
}

.tk-sub {
  color: var(--r-text-sub, #4b5563);
  margin-top: 4px;
  margin-bottom: 18px;
}

/* Tabs */
.ticket-tabs {
  display: flex;
  gap: 10px;
  border-bottom: 2px solid #111;
  padding-bottom: 12px;
  margin-top: 16px;
}

.tab-btn {
  padding: 8px 18px;
  font-weight: 800;
  font-size: 0.95rem;
  background: white;
  border: 2px solid #111;
  box-shadow: 2px 2px 0 #111;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: inherit;
  transition: all 0.15s ease;
}

.tab-btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 #111;
}

.tab-btn.active {
  background: #ffcd00;
  color: #111;
  box-shadow: 3px 3px 0 #111;
}

/* History Summary Card */
.history-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  padding: 16px 20px;
  margin-bottom: 24px;
  background: #fffbe8;
  border: 2px solid #111;
  box-shadow: 3px 3px 0 #111;
}

.summary-metric {
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #666;
  margin-bottom: 4px;
}

.metric-val {
  font-size: 1.4rem;
  font-weight: 900;
  color: #111;
}

.ticket-id-sub {
  font-family: monospace;
  font-size: 0.85rem;
  color: #666;
}

/* Lista de tickets */
.tickets-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.skeleton {
  height: 170px;
  background: #e5e7eb;
  border: 2px solid #111;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.ticket {
  display: grid;
  grid-template-columns: 1fr auto 160px;
  background: white;
  border: 2px solid #111;
  box-shadow: 4px 4px 0 #111;
  overflow: hidden;
}

.ticket-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.ticket-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.ticket-title {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 800;
}

.ticket-meta {
  display: flex;
  gap: 24px;
  margin: 12px 0;
}

.ticket-meta dt {
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 700;
  color: #666;
}

.ticket-meta dd {
  margin: 2px 0 0 0;
  font-size: 0.95rem;
  font-weight: 700;
}

.ticket-meta .price {
  color: #111;
  font-weight: 800;
}

.ticket-actions {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

/* Perforación */
.perf {
  position: relative;
  width: 2px;
  border-left: 2px dashed #111;
  margin: 8px 0;
}

.notch {
  position: absolute;
  width: 16px;
  height: 16px;
  background: var(--r-bg, #f6f5f0);
  border-radius: 50%;
  border: 2px solid #111;
  left: -9px;
}

.notch.top { top: -16px; }
.notch.bot { bottom: -16px; }

/* Stub */
.ticket-stub {
  background: #faf8f5;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-left: 2px solid #111;
}

.qr {
  width: 90px;
  height: 90px;
  object-fit: contain;
  margin-bottom: 8px;
}

.code-block {
  display: flex;
  flex-direction: column;
  margin-bottom: 6px;
}

.code-label {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #777;
}

.code-value {
  font-family: monospace;
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.05em;
}

.stub-tag {
  font-size: 0.65rem;
  font-weight: 900;
  background: #ffcd00;
  padding: 2px 6px;
  border: 1.5px solid #111;
}

.stub-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.stub-icon {
  font-size: 1.8rem;
}

.stub-label {
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
}

/* Empty states */
.empty {
  text-align: center;
  padding: 48px 24px;
  border: 2px solid #111;
  box-shadow: 4px 4px 0 #111;
  background: white;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

/* Responsive */
@media (max-width: 640px) {
  .ticket {
    grid-template-columns: 1fr;
  }
  .perf {
    display: none;
  }
  .ticket-stub {
    border-left: none;
    border-top: 2px dashed #111;
    padding: 20px;
  }
}
</style>
