<template>
  <div class="tickets-page">
    <header class="tk-head">
      <span class="r-kicker">🎟️ Mis entradas</span>
      <h1 class="r-page-title">Tus tickets NextHappen</h1>
      <p class="tk-sub">Presenta el código QR en la puerta del evento.</p>
    </header>

    <!-- Loading skeletons -->
    <div v-if="loading" class="tickets-list">
      <div v-for="n in 2" :key="n" class="skeleton"></div>
    </div>

    <div v-else-if="tickets.length" class="tickets-list">
      <article
        v-for="ticket in tickets"
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
              <dt>Precio</dt>
              <dd class="price">S/. {{ Number(ticket.price).toFixed(2) }}</dd>
            </div>
            <div>
              <dt>Comprado</dt>
              <dd>{{ formatDate(ticket.purchaseDate) }}</dd>
            </div>
          </dl>

          <div class="ticket-actions">
            <button class="r-btn r-btn--ghost" @click="goToEvent(ticket.eventId)">
              <i class="pi pi-eye"></i> Ver evento
            </button>
            <button
              v-if="ticket.status === 'Active'"
              class="r-btn r-btn--danger"
              :disabled="refunding === ticket.id"
              @click="refund(ticket)"
            >
              <i class="pi pi-undo"></i> {{ refunding === ticket.id ? 'Procesando…' : 'Reembolsar' }}
            </button>
          </div>
        </div>

        <!-- Perforación -->
        <div class="perf" aria-hidden="true"><span class="notch top"></span><span class="notch bot"></span></div>

        <!-- Colilla con QR + código corto -->
        <div class="ticket-stub">
          <template v-if="ticket.status === 'Active'">
            <img v-if="ticket.qrUrl" :src="ticket.qrUrl" alt="Código QR de la entrada" class="qr" />
            <div class="code-block" v-if="ticket.shortCode">
              <span class="code-label">Código</span>
              <span class="code-value">{{ formatCode(ticket.shortCode) }}</span>
            </div>
            <span class="stub-tag">ADMIT ONE</span>
          </template>
          <div v-else class="stub-state">
            <span class="stub-icon">{{ stubIcon(ticket.status) }}</span>
            <span class="stub-label">{{ statusLabel(ticket.status) }}</span>
          </div>
        </div>
      </article>
    </div>

    <!-- Empty state que enseña la interfaz -->
    <div v-else class="empty r-card">
      <div class="empty-icon">🎫</div>
      <h2>Todavía no tienes entradas</h2>
      <p>Cuando compres una entrada, aparecerá aquí con su código QR listo para escanear.</p>
      <button class="r-btn r-btn--primary" @click="$router.push({ name: 'user-events' })">
        Explorar eventos
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { PaymentsApi } from '@/modules/tickets/infrastructure/payments-api.js'

const router = useRouter()
const paymentsApi = new PaymentsApi()
const tickets = ref([])
const loading = ref(true)
const refunding = ref(null)
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/proxy' : 'http://localhost:5000')

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
  // "7K4P9Q" → "7K4-P9Q" para leerlo/dictarlo con facilidad.
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
  return new Date(date).toLocaleDateString('es-PE', { dateStyle: 'medium' })
}
function goToEvent(eventId) {
  router.push({ name: 'user-publishment', params: { id: eventId } })
}

onMounted(load)
</script>

<style scoped>
.tickets-page {
  max-width: 1080px;
  margin: 0 auto;
  padding: 40px 24px 64px;
}

.tk-head { margin-bottom: 32px; }
.r-page-title { font-size: 2.1rem; font-weight: 700; margin: 12px 0 6px; }
.tk-sub { color: var(--r-ink-soft); margin: 0; }

.tickets-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 28px;
}

/* ── Ticket como objeto físico: cuerpo + perforación + colilla ── */
.ticket {
  display: grid;
  grid-template-columns: 1fr auto;
  background: var(--r-surface);
  border: var(--r-bd-3);
  box-shadow: var(--r-sh-3);
  transition: transform var(--r-dur) var(--r-ease), box-shadow var(--r-dur) var(--r-ease);
}
.ticket:hover {
  transform: translate(-3px, -3px);
  box-shadow: var(--r-sh-pop);
}
.ticket.st-refunded,
.ticket.st-cancelled { background: #f4f3f0; }
.ticket.st-used { background: #fffdf3; }

.ticket-body { padding: 20px 22px; display: flex; flex-direction: column; gap: 16px; }

.ticket-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.ticket-title {
  font-family: var(--r-font-display);
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0;
  line-height: 1.15;
}

.ticket-meta { display: flex; gap: 28px; margin: 0; }
.ticket-meta dt {
  font-family: var(--r-font-mono);
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--r-ink-faint);
}
.ticket-meta dd { margin: 2px 0 0; font-weight: 600; }
.ticket-meta .price { font-family: var(--r-font-mono); font-size: 1.25rem; font-weight: 700; }

.ticket-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: auto; }
.ticket-actions .r-btn { font-size: 0.85rem; padding: 9px 14px; }

/* Perforación con muescas */
.perf {
  position: relative;
  width: 0;
  border-left: 3px dashed var(--r-ink);
}
.notch {
  position: absolute;
  left: -9px;
  width: 16px;
  height: 16px;
  background: var(--r-bg);
  border: 2px solid var(--r-ink);
  border-radius: 50%;
}
.notch.top { top: -9px; }
.notch.bot { bottom: -9px; }

/* Colilla con QR */
.ticket-stub {
  width: 148px;
  background: var(--r-surface-2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 18px 12px;
}
.st-used .ticket-stub,
.st-refunded .ticket-stub,
.st-cancelled .ticket-stub { background: #ececea; }

.qr {
  width: 108px;
  height: 108px;
  border: var(--r-bd);
  background: #fff;
  image-rendering: pixelated;
}
.code-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  border: var(--r-bd);
  background: var(--r-brand);
  box-shadow: var(--r-sh-1);
  padding: 5px 10px;
}
.code-label {
  font-family: var(--r-font-mono);
  font-size: 0.55rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--r-brand-ink);
}
.code-value {
  font-family: var(--r-font-mono);
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: 0.08em;
  color: var(--r-brand-ink);
}
.stub-tag {
  font-family: var(--r-font-mono);
  font-weight: 700;
  font-size: 0.62rem;
  letter-spacing: 0.18em;
  color: var(--r-ink-soft);
}
.stub-state { text-align: center; display: flex; flex-direction: column; gap: 6px; }
.stub-icon { font-size: 2.4rem; line-height: 1; }
.stub-label {
  font-family: var(--r-font-mono);
  font-weight: 700;
  font-size: 0.72rem;
  text-transform: uppercase;
  color: var(--r-ink-soft);
}

/* Skeleton */
.skeleton {
  height: 200px;
  border: var(--r-bd);
  box-shadow: var(--r-sh-2);
  background: linear-gradient(100deg, #f3f1ea 30%, #fbf9f2 50%, #f3f1ea 70%);
  background-size: 200% 100%;
  animation: sk 1.2s ease-in-out infinite;
}
@keyframes sk { from { background-position: 200% 0; } to { background-position: -200% 0; } }

/* Empty state */
.empty {
  max-width: 460px;
  margin: 40px auto;
  padding: 40px 32px;
  text-align: center;
}
.empty-icon { font-size: 3.2rem; }
.empty h2 { font-family: var(--r-font-display); margin: 12px 0 8px; }
.empty p { color: var(--r-ink-soft); margin-bottom: 22px; }
.empty .r-btn { margin: 0 auto; }

@media (max-width: 460px) {
  .ticket { grid-template-columns: 1fr; }
  .perf { width: auto; height: 0; border-left: none; border-top: 3px dashed var(--r-ink); }
  .notch { left: -9px; top: auto; }
  .notch.top { top: -9px; left: -9px; }
  .notch.bot { bottom: auto; top: -9px; left: auto; right: -9px; }
  .ticket-stub { width: auto; flex-direction: row; }
}
</style>
