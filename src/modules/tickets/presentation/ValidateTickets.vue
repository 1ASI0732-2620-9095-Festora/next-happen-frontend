<template>
  <div class="validate-page">
    <header class="v-head">
      <span class="r-kicker">🎫 Control de acceso</span>
      <h1 class="r-page-title">Validar entradas</h1>
      <p class="v-sub">Marca el ingreso de tus asistentes mediante escaneo QR con la cámara, por código o desde la lista.</p>
    </header>

    <!-- Selector de modo -->
    <div class="tabs">
      <button class="tab" :class="{ active: mode === 'scanner' }" @click="switchToScanner">
        <i class="pi pi-camera"></i> Escáner QR
      </button>
      <button class="tab" :class="{ active: mode === 'code' }" @click="switchToCode">
        <i class="pi pi-pencil"></i> Por código
      </button>
      <button class="tab" :class="{ active: mode === 'list' }" @click="switchToList">
        <i class="pi pi-list"></i> Lista del evento
      </button>
    </div>

    <!-- ── Modo 1: Escáner QR con Cámara ── -->
    <section v-if="mode === 'scanner'" class="scanner-section">
      <p class="mode-hint">
        Apunta la cámara al <strong>código QR</strong> del boleto del asistente para validarlo instantáneamente.
      </p>

      <div class="camera-card r-card">
        <div class="camera-controls">
          <button
            v-if="!isScanning"
            class="r-btn r-btn--primary camera-toggle-btn"
            @click="startScanner"
            :disabled="cameraLoading"
          >
            <i class="pi pi-video"></i> {{ cameraLoading ? 'Iniciando cámara…' : 'Activar Cámara' }}
          </button>
          <button
            v-else
            class="r-btn r-btn--danger camera-toggle-btn"
            @click="stopScanner"
          >
            <i class="pi pi-power-off"></i> Detener Cámara
          </button>
        </div>

        <div v-show="isScanning" class="reader-wrapper">
          <div id="qr-reader" class="qr-reader-box"></div>
          <div class="scan-laser" aria-hidden="true"></div>
        </div>

        <div v-if="cameraError" class="camera-error-box">
          <i class="pi pi-exclamation-triangle"></i>
          <p>{{ cameraError }}</p>
          <button class="r-btn r-btn--ghost r-btn--sm" @click="switchToCode">
            Usar ingreso manual por código
          </button>
        </div>

        <div v-if="!isScanning && !cameraError" class="scanner-idle-placeholder">
          <div class="placeholder-icon">📷</div>
          <p>Presiona <strong>"Activar Cámara"</strong> para escanear boletos.</p>
        </div>
      </div>

      <!-- Tarjeta de Resultado del Escaneo -->
      <div v-if="result" class="result r-pop-in" :class="result.valid ? 'ok' : 'bad'" :key="resultKey">
        <div class="result-stamp">{{ result.valid ? '✓' : '✕' }}</div>
        <p class="result-msg">{{ result.message }}</p>
        <span v-if="result.status" class="r-badge">{{ statusLabel(result.status) }}</span>
        <button v-if="!isScanning" class="r-btn r-btn--primary r-btn--sm mt-2" @click="startScanner">
          <i class="pi pi-refresh"></i> Continuar escaneando
        </button>
      </div>
    </section>

    <!-- ── Modo 2: Por código manual ── -->
    <section v-else-if="mode === 'code'">
      <p class="mode-hint">
        Pide al asistente el <strong>código de su entrada</strong>
        (ej. <code class="inline-code">7K4-P9Q</code>) y escríbelo. También acepta el código GUID o texto del QR.
      </p>
      <div class="scan-box">
        <input
          v-model="code"
          class="r-input code-input"
          placeholder="7K4-P9Q"
          maxlength="64"
          @keyup.enter="validateManualCode"
          autofocus
        />
        <button class="r-btn r-btn--primary r-btn--lg" :disabled="checking || !code" @click="validateManualCode">
          <i class="pi pi-check"></i> {{ checking ? 'Validando…' : 'Validar' }}
        </button>
      </div>

      <div v-if="result" class="result r-pop-in" :class="result.valid ? 'ok' : 'bad'" :key="resultKey">
        <div class="result-stamp">{{ result.valid ? '✓' : '✕' }}</div>
        <p class="result-msg">{{ result.message }}</p>
        <span v-if="result.status" class="r-badge">{{ statusLabel(result.status) }}</span>
      </div>
      <div v-else class="result idle">
        <div class="result-stamp">⌁</div>
        <p class="result-msg">Esperando código…</p>
      </div>
    </section>

    <!-- ── Modo 3: Lista del evento ── -->
    <section v-else>
      <div class="event-picker">
        <label class="picker-label">Evento</label>
        <select v-model="selectedEventId" class="r-input" @change="loadEventTickets">
          <option value="" disabled>Selecciona un evento…</option>
          <option v-for="ev in myEvents" :key="ev.id" :value="ev.id">{{ ev.title }}</option>
        </select>
      </div>

      <div v-if="listLoading" class="list-state">Cargando entradas…</div>

      <template v-else-if="selectedEventId">
        <div class="list-summary">
          <span class="r-badge r-badge--success">{{ validatedCount }} validadas</span>
          <span class="r-badge">{{ activeCount }} pendientes</span>
          <span class="r-badge r-badge--muted">{{ rows.length }} total</span>
        </div>

        <div v-if="rows.length" class="ticket-rows">
          <div v-for="t in rows" :key="t.id" class="trow" :class="`st-${t.status.toLowerCase()}`">
            <code class="trow-code">{{ formatCode(t.shortCode) }}</code>
            <div class="trow-meta">
              <span class="r-badge" :class="badgeClass(t.status)">{{ statusLabel(t.status) }}</span>
              <small>{{ formatDate(t.purchaseDate) }}</small>
            </div>
            <button
              v-if="t.status === 'Active'"
              class="r-btn r-btn--primary trow-btn"
              :disabled="validatingId === t.id"
              @click="validateRow(t)"
            >
              {{ validatingId === t.id ? '…' : 'Validar' }}
            </button>
            <span v-else-if="t.status === 'Used'" class="trow-done">✔ Ingresó</span>
            <span v-else class="trow-done muted">{{ statusLabel(t.status) }}</span>
          </div>
        </div>
        <p v-else class="list-state">Este evento aún no tiene entradas vendidas.</p>
      </template>

      <p v-else-if="!myEvents.length" class="list-state">No tienes eventos todavía.</p>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'
import http from '@/shared/infrastructure/http.js'
import { PaymentsApi } from '@/modules/tickets/infrastructure/payments-api.js'

const paymentsApi = new PaymentsApi()

const mode = ref('scanner') // 'scanner' | 'code' | 'list'

/* ── Por código / Resultado común ── */
const code = ref('')
const checking = ref(false)
const result = ref(null)
const resultKey = ref(0)

/* ── Cámara / Escáner QR ── */
const isScanning = ref(false)
const cameraLoading = ref(false)
const cameraError = ref('')
let html5QrScanner = null

function playBeep(success = true) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = success ? 'sine' : 'sawtooth'
    osc.frequency.setValueAtTime(success ? 880 : 220, ctx.currentTime)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.25)
  } catch {
    // AudioContext not allowed or not supported in this environment
  }
}

async function processValidation(rawCode) {
  if (!rawCode) return
  checking.value = true
  result.value = null

  try {
    const res = await paymentsApi.validate(rawCode.trim())
    result.value = res
    playBeep(res.valid)
  } catch (err) {
    result.value = {
      valid: false,
      message: err?.response?.data?.error || 'Error al validar la entrada.',
      status: ''
    }
    playBeep(false)
  } finally {
    resultKey.value++
    checking.value = false
  }
}

async function validateManualCode() {
  if (!code.value) return
  await processValidation(code.value)
  code.value = ''
}

async function startScanner() {
  cameraError.value = ''
  cameraLoading.value = true
  result.value = null

  await stopScanner()
  await nextTick()

  try {
    html5QrScanner = new Html5Qrcode('qr-reader')
    await html5QrScanner.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 }
      },
      async (decodedText) => {
        // Pausar tras captura
        await stopScanner()
        await processValidation(decodedText)
      },
      () => {
        // Silently ignore individual frame misses
      }
    )
    isScanning.value = true
  } catch (err) {
    console.error('Error al inicializar cámara QR:', err)
    cameraError.value = 'No se pudo acceder a la cámara. Asegúrate de otorgar permisos o utiliza el ingreso por código.'
    isScanning.value = false
  } finally {
    cameraLoading.value = false
  }
}

async function stopScanner() {
  if (html5QrScanner) {
    try {
      if (html5QrScanner.isScanning) {
        await html5QrScanner.stop()
      }
      await html5QrScanner.clear()
    } catch (e) {
      console.warn('Error deteniendo escáner:', e)
    } finally {
      html5QrScanner = null
      isScanning.value = false
    }
  }
}

function switchToScanner() {
  mode.value = 'scanner'
  startScanner()
}

function switchToCode() {
  stopScanner()
  mode.value = 'code'
}

/* ── Lista del evento ── */
const myEvents = ref([])
const selectedEventId = ref('')
const rows = ref([])
const listLoading = ref(false)
const validatingId = ref(null)

const validatedCount = computed(() => rows.value.filter(t => t.status === 'Used').length)
const activeCount = computed(() => rows.value.filter(t => t.status === 'Active').length)

async function switchToList() {
  await stopScanner()
  mode.value = 'list'
  if (!myEvents.value.length) await loadMyEvents()
}

async function loadMyEvents() {
  try {
    const organizerId = localStorage.getItem('userId')
    const organizerName = localStorage.getItem('userName')
    const { data } = await http.get('/api/events')
    myEvents.value = data.filter(ev => ev.organizer === organizerId || ev.organizer === organizerName)
  } catch (err) {
    console.error('Error cargando eventos:', err)
    myEvents.value = []
  }
}

async function loadEventTickets() {
  if (!selectedEventId.value) return
  listLoading.value = true
  try {
    rows.value = await paymentsApi.getEventTickets(selectedEventId.value)
  } catch (err) {
    console.error('Error cargando entradas:', err)
    rows.value = []
  } finally {
    listLoading.value = false
  }
}

async function validateRow(t) {
  validatingId.value = t.id
  try {
    const res = await paymentsApi.validate(t.shortCode)
    if (res.valid || res.status) {
      t.status = res.status || 'Used'
    }
    if (!res.valid) alert(res.message)
  } catch (err) {
    alert(err?.response?.data?.error || 'No se pudo validar la entrada.')
  } finally {
    validatingId.value = null
  }
}

/* ── Helpers ── */
function statusLabel(status) {
  return { Active: 'Válida', Used: 'Utilizada', Refunded: 'Reembolsada', Cancelled: 'Cancelada' }[status] || status
}
function badgeClass(status) {
  return {
    Active: 'r-badge--success', Used: 'r-badge--brand',
    Refunded: 'r-badge--danger', Cancelled: 'r-badge--muted'
  }[status] || 'r-badge--muted'
}
function formatCode(code) {
  if (!code) return '—'
  return code.length === 6 ? `${code.slice(0, 3)}-${code.slice(3)}` : code
}
function formatDate(date) {
  return new Date(date).toLocaleDateString('es-PE', { dateStyle: 'medium' })
}

onMounted(() => {
  if (mode.value === 'scanner') {
    startScanner()
  }
})

onBeforeUnmount(() => {
  stopScanner()
})
</script>

<style scoped>
.validate-page { max-width: 640px; margin: 0 auto; padding: 40px 24px 64px; }
.v-head { margin-bottom: 20px; }
.r-page-title { font-size: 2rem; font-weight: 700; margin: 12px 0 6px; }
.v-sub { color: var(--r-ink-soft); margin: 0; }

/* Tabs */
.tabs { display: flex; gap: 0; margin-bottom: 22px; }
.tab {
  flex: 1;
  font-family: var(--r-font-body);
  font-weight: 700;
  padding: 11px 14px;
  border: var(--r-bd);
  background: var(--r-surface);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background var(--r-dur) var(--r-ease);
}
.tab + .tab { border-left: none; }
.tab.active { background: var(--r-brand); }
.tab:hover:not(.active) { background: var(--r-surface-2); }

.mode-hint { color: var(--r-ink-soft); margin: 0 0 14px; line-height: 1.5; }
.inline-code {
  font-family: var(--r-font-mono); font-weight: 700;
  background: var(--r-brand); border: var(--r-bd); padding: 0 5px; color: var(--r-brand-ink);
}

/* Scanner Section */
.scanner-section { display: flex; flex-direction: column; gap: 14px; }
.camera-card {
  border: var(--r-bd-3);
  background: var(--r-surface);
  padding: 18px;
  box-shadow: var(--r-sh-pop);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
.camera-controls { width: 100%; display: flex; justify-content: center; }
.camera-toggle-btn { width: 100%; max-width: 320px; display: flex; align-items: center; justify-content: center; gap: 8px; }

.reader-wrapper {
  position: relative;
  width: 100%;
  max-width: 380px;
  border: var(--r-bd-3);
  background: #000;
  overflow: hidden;
  border-radius: 8px;
}
.qr-reader-box {
  width: 100%;
  min-height: 280px;
}
.scan-laser {
  position: absolute;
  top: 15%;
  left: 10%;
  right: 10%;
  height: 3px;
  background: #00e676;
  box-shadow: 0 0 10px #00e676;
  animation: laserScan 2s infinite alternate ease-in-out;
  pointer-events: none;
}
@keyframes laserScan {
  0% { top: 15%; }
  100% { top: 85%; }
}

.scanner-idle-placeholder {
  padding: 40px 20px;
  text-align: center;
  color: var(--r-ink-soft);
}
.placeholder-icon { font-size: 3rem; margin-bottom: 10px; }
.camera-error-box {
  background: var(--r-danger-bg);
  border: var(--r-bd-2);
  padding: 16px;
  border-radius: 6px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

/* Por código */
.scan-box { display: flex; gap: 10px; }
.code-input { flex: 1; font-family: var(--r-font-mono); font-size: 1.05rem; letter-spacing: 0.04em; }

.result {
  margin-top: 24px; border: var(--r-bd-3); padding: 32px 24px; text-align: center;
  box-shadow: var(--r-sh-pop); display: flex; flex-direction: column; align-items: center; gap: 12px;
}
.result.ok  { background: var(--r-success-bg); }
.result.bad { background: var(--r-danger-bg); }
.result.idle { background: var(--r-surface-2); box-shadow: var(--r-sh-2); border-style: dashed; }
.result-stamp {
  width: 76px; height: 76px; display: grid; place-items: center; border: var(--r-bd-3);
  font-size: 2.6rem; font-weight: 800; box-shadow: var(--r-sh-2); transform: rotate(-5deg);
}
.result.ok  .result-stamp { background: var(--r-success); color: #fff; }
.result.bad .result-stamp { background: var(--r-danger); color: #fff; }
.result.idle .result-stamp { background: #fff; color: var(--r-ink-faint); box-shadow: none; transform: none; }
.result-msg { font-family: var(--r-font-display); font-size: 1.3rem; font-weight: 700; margin: 0; }

/* Lista del evento */
.event-picker { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
.picker-label { font-family: var(--r-font-mono); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--r-ink-soft); }
select.r-input { cursor: pointer; }

.list-summary { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.list-state { color: var(--r-ink-soft); margin-top: 16px; }

.ticket-rows { display: flex; flex-direction: column; gap: 10px; }
.trow {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 14px;
  border: var(--r-bd);
  box-shadow: var(--r-sh-1);
  background: var(--r-surface);
  padding: 12px 14px;
}
.trow.st-used { background: #fffdf3; }
.trow.st-refunded, .trow.st-cancelled { background: #f3f2ef; }
.trow-code {
  font-family: var(--r-font-mono);
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: 0.06em;
}
.trow-meta { display: flex; flex-direction: column; gap: 4px; }
.trow-meta small { color: var(--r-ink-faint); font-family: var(--r-font-mono); font-size: 0.7rem; }
.trow-btn { padding: 8px 16px; font-size: 0.9rem; }
.trow-done { font-family: var(--r-font-mono); font-weight: 700; font-size: 0.82rem; color: var(--r-success); }
.trow-done.muted { color: var(--r-ink-faint); }

@media (max-width: 480px) {
  .trow { grid-template-columns: 1fr auto; }
  .trow-code { grid-column: 1 / -1; }
}
</style>
