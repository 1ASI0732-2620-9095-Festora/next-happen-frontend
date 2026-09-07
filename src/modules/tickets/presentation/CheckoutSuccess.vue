<template>
  <div class="checkout-result">
    <div class="result-card r-pop-in">
      <!-- Confirmando -->
      <template v-if="state === 'loading'">
        <div class="spinner" aria-hidden="true"></div>
        <span class="r-kicker">Confirmando pago</span>
        <h1 class="r-display">Procesando tu compra…</h1>
        <p>Estamos verificando tu pago con Stripe y emitiendo tus entradas.</p>
      </template>

      <!-- Éxito -->
      <template v-else-if="state === 'paid'">
        <div class="stamp success" aria-hidden="true"><span class="stamp-icon">✓</span></div>
        <span class="r-kicker">Pago confirmado</span>
        <h1 class="r-display">¡Compra exitosa!</h1>
        <p>
          Tu pago se procesó de forma segura con Stripe. Emitimos
          {{ quantity }} entrada{{ quantity === 1 ? '' : 's' }} con su código QR.
          Te llevamos a <strong>Mis Entradas</strong>…
        </p>
        <div class="actions">
          <button class="r-btn r-btn--primary r-btn--lg" @click="goToTickets">
            <i class="pi pi-ticket"></i> Ver mis entradas
          </button>
        </div>
      </template>

      <!-- Pendiente / error -->
      <template v-else>
        <div class="stamp cancel" aria-hidden="true"><span class="stamp-icon">!</span></div>
        <span class="r-kicker kicker-muted">Pago no confirmado</span>
        <h1 class="r-display">Aún no pudimos confirmar tu pago</h1>
        <p>{{ message }}</p>
        <div class="actions">
          <button class="r-btn r-btn--primary r-btn--lg" @click="retry">Reintentar</button>
          <button class="r-btn r-btn--ghost" @click="goToTickets">Ir a Mis Entradas</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PaymentsApi } from '@/modules/tickets/infrastructure/payments-api.js'

const route = useRoute()
const router = useRouter()
const paymentsApi = new PaymentsApi()

const state = ref('loading') // loading | paid | pending
const quantity = ref(0)
const message = ref('')
let redirectTimer = null

async function confirm() {
  state.value = 'loading'
  const sessionId = route.query.session_id
  if (!sessionId) {
    // Sin session_id no podemos confirmar; enviamos a Mis Entradas de todos modos.
    goToTickets()
    return
  }

  try {
    const res = await paymentsApi.confirmCheckout(sessionId)
    if (res.paid) {
      quantity.value = res.quantity
      state.value = 'paid'
      // Llevar a Mis Entradas automáticamente tras un breve confirmación.
      redirectTimer = setTimeout(goToTickets, 2200)
    } else {
      state.value = 'pending'
      message.value = 'El pago todavía figura como pendiente. Si ya pagaste, espera unos segundos y reintenta.'
    }
  } catch (err) {
    state.value = 'pending'
    message.value = err?.response?.data?.error || 'No pudimos confirmar el pago. Revisa Mis Entradas en un momento.'
  }
}

function goToTickets() {
  if (redirectTimer) clearTimeout(redirectTimer)
  router.push({ name: 'user-tickets' })
}
function retry() {
  confirm()
}

onMounted(confirm)
</script>

<style scoped>
.checkout-result {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 78vh;
  padding: 24px;
}
.result-card {
  max-width: 520px;
  text-align: center;
  border: var(--r-bd-3);
  background: var(--r-surface);
  padding: 48px 36px 40px;
  box-shadow: var(--r-sh-pop);
}
.stamp {
  width: 84px; height: 84px; margin: 0 auto 20px;
  border: var(--r-bd-3); display: grid; place-items: center;
  box-shadow: var(--r-sh-2); transform: rotate(-6deg);
}
.stamp.success { background: var(--r-success); }
.stamp.cancel { background: var(--r-brand); }
.stamp-icon { font-size: 3rem; font-weight: 800; color: #fff; line-height: 1; }
.stamp.cancel .stamp-icon { color: var(--r-ink); }
.kicker-muted { background: #ececea; }
.r-display { font-size: 1.9rem; font-weight: 700; margin: 14px 0 10px; }
p { color: var(--r-ink-soft); line-height: 1.65; margin: 0 auto 26px; max-width: 44ch; }
.actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

.spinner {
  width: 56px; height: 56px; margin: 0 auto 20px;
  border: 5px solid #eee; border-top-color: var(--r-ink);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .spinner { animation-duration: 2s; } }
</style>
