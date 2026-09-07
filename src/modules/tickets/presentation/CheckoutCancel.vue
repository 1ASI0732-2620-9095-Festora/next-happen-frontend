<template>
  <div class="checkout-result">
    <div class="result-card r-pop-in">
      <div class="stamp cancel" aria-hidden="true">
        <span class="stamp-icon">✕</span>
      </div>
      <span class="r-kicker kicker-muted">Pago cancelado</span>
      <h1 class="r-display">No se realizó ningún cobro</h1>
      <p>
        Los cupos que habías reservado se liberarán automáticamente.
        Puedes intentarlo de nuevo cuando quieras.
      </p>
      <div class="actions">
        <button class="r-btn r-btn--primary r-btn--lg" @click="goEvents">
          <i class="pi pi-search"></i> Explorar eventos
        </button>
        <button class="r-btn r-btn--ghost" @click="goHome">Volver al inicio</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const goEvents = () => router.push({ name: 'user-events' })
const goHome = () => router.push({ name: 'user-home' })
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
  width: 84px;
  height: 84px;
  margin: 0 auto 20px;
  border: var(--r-bd-3);
  display: grid;
  place-items: center;
  box-shadow: var(--r-sh-2);
  transform: rotate(-6deg);
}
.stamp.cancel { background: #ececea; }
.stamp-icon { font-size: 2.8rem; font-weight: 800; color: var(--r-ink); line-height: 1; }
.kicker-muted { background: #ececea; }
.r-display { font-size: 1.9rem; font-weight: 700; margin: 14px 0 10px; }
p { color: var(--r-ink-soft); line-height: 1.65; margin: 0 auto 26px; max-width: 42ch; }
.actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
</style>
