<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-text">
        <span class="r-kicker">Descubre Lima</span>
        <h1 class="hero-title">Encuentra tu próxima<br /><span class="hl">experiencia</span></h1>
        <p class="hero-sub">
          Ferias independientes, eventos alternativos y propuestas culturales — todo en un solo lugar.
        </p>
        <div class="hero-actions">
          <button class="r-btn r-btn--primary r-btn--lg" @click="$router.push({ name: 'user-search' })">
            <i class="pi pi-search"></i> Buscar eventos
          </button>
          <button class="r-btn r-btn--ghost r-btn--lg" @click="$router.push({ name: 'user-events' })">
            Ver todos
          </button>
        </div>
      </div>
      <div class="hero-stat">
        <span class="stat-num">{{ events.length }}</span>
        <span class="stat-label">eventos activos</span>
      </div>
    </section>

    <!-- Filtro por categoría -->
    <section v-if="categories.length" class="cats">
      <button
        class="cat"
        :class="{ active: activeCat === null }"
        @click="activeCat = null"
      >Todos</button>
      <button
        v-for="c in categories"
        :key="c"
        class="cat"
        :class="{ active: activeCat === c }"
        @click="activeCat = activeCat === c ? null : c"
      >{{ c }}</button>
    </section>

    <!-- Recomendados -->
    <section v-if="!loading && recommended.length" class="block">
      <div class="block-head">
        <h2 class="r-display block-title">✨ Recomendados para ti</h2>
        <small class="block-hint">Según tus intereses y lo que viene pronto</small>
      </div>
      <div class="grid">
        <EventPoster v-for="ev in recommended" :key="ev.id" :event="ev" />
      </div>
    </section>

    <!-- Próximos -->
    <section v-if="!loading && upcoming.length" class="block">
      <div class="block-head">
        <h2 class="r-display block-title">🗓️ Próximos eventos</h2>
      </div>
      <div class="grid">
        <EventPoster v-for="ev in upcoming" :key="ev.id" :event="ev" />
      </div>
    </section>

    <!-- Loading -->
    <div v-if="loading" class="grid">
      <div v-for="n in 6" :key="n" class="skeleton"></div>
    </div>

    <!-- Empty -->
    <div v-if="!loading && !events.length" class="empty r-card">
      <div class="empty-icon">🎪</div>
      <h2>Todavía no hay eventos</h2>
      <p>Vuelve pronto: los organizadores están publicando nuevas ferias y experiencias.</p>
    </div>
  </div>
</template>

<script setup>
import EventPoster from '@/modules/events/presentation/EventPoster.vue'
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useSavedStore } from '@/modules/events/application/saved.store.js'

const API = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/proxy' : 'http://localhost:5000')
const savedStore = useSavedStore()

const events = ref([])
const loading = ref(true)
const activeCat = ref(null)

const categories = computed(() => {
  const set = new Set(events.value.map(e => e.category).filter(Boolean))
  return [...set].slice(0, 8)
})

const filtered = computed(() =>
  activeCat.value ? events.value.filter(e => e.category === activeCat.value) : events.value
)

// Recomendados: prioriza categorías que el usuario ha guardado + cercanía en el tiempo.
const recommended = computed(() => {
  const savedRaw = JSON.parse(localStorage.getItem('nh_saved') || '[]')
  const savedCats = new Set(
    events.value.filter(e => savedRaw.includes(e.id)).map(e => e.category)
  )
  const now = Date.now()
  const score = (e) => {
    let s = 0
    if (savedCats.has(e.category)) s += 20
    const start = new Date(e.startDate || e.dateRange?.startDate).getTime()
    if (!isNaN(start)) {
      const days = (start - now) / 86400000
      if (days >= 0) s += Math.max(0, 12 - days / 7)
    }
    return s
  }
  return [...filtered.value].sort((a, b) => score(b) - score(a)).slice(0, 6)
})

const upcoming = computed(() => {
  const now = Date.now()
  return [...filtered.value]
    .map(e => ({ e, t: new Date(e.startDate || e.dateRange?.startDate).getTime() }))
    .sort((a, b) => {
      const af = isNaN(a.t) || a.t < now ? Infinity : a.t
      const bf = isNaN(b.t) || b.t < now ? Infinity : b.t
      return af - bf
    })
    .map(x => x.e)
    .slice(0, 8)
})

onMounted(async () => {
  savedStore.loadSaved()
  try {
    const res = await axios.get(`${API}/api/events/public`)
    events.value = res.data.map(e => ({
      ...e,
      image: e.photos?.length ? e.photos[0] : 'https://placehold.co/400x260?text=NextHappen'
    }))
  } catch (err) {
    console.error('Error cargando eventos:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.home { max-width: 1160px; margin: 0 auto; padding: 32px 24px 64px; }

/* Hero */
.hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  border: var(--r-bd-3);
  box-shadow: var(--r-sh-pop);
  background: var(--r-brand);
  padding: 40px 36px;
  margin-bottom: 32px;
}
.hero-title {
  font-family: var(--r-font-display);
  font-size: clamp(1.9rem, 4.5vw, 3rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.05;
  margin: 12px 0;
  color: var(--r-ink);
}
.hero-title .hl {
  background: var(--r-ink);
  color: var(--r-brand);
  padding: 0 8px;
  display: inline-block;
}
.hero-sub { color: #4a4436; max-width: 46ch; margin: 0 0 22px; line-height: 1.55; font-weight: 500; }
.hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
.hero-stat {
  flex-shrink: 0;
  border: var(--r-bd-3);
  background: var(--r-surface);
  box-shadow: var(--r-sh-3);
  padding: 22px 28px;
  text-align: center;
}
.stat-num { display: block; font-family: var(--r-font-mono); font-size: 3rem; font-weight: 700; line-height: 1; }
.stat-label { font-family: var(--r-font-mono); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--r-ink-soft); }

/* Categorías */
.cats { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 32px; }
.cat {
  font-family: var(--r-font-body); font-weight: 600; font-size: 0.9rem;
  padding: 8px 16px; border: var(--r-bd); background: var(--r-surface); cursor: pointer;
  box-shadow: var(--r-sh-1);
  transition: transform var(--r-dur) var(--r-ease), box-shadow var(--r-dur) var(--r-ease), background var(--r-dur) var(--r-ease);
}
.cat:hover { transform: translate(-1px, -1px); box-shadow: var(--r-sh-2); }
.cat.active { background: var(--r-ink); color: var(--r-bg); }

/* Bloques */
.block { margin-bottom: 40px; }
.block-head { display: flex; align-items: baseline; gap: 12px; margin-bottom: 18px; flex-wrap: wrap; }
.block-title { font-size: 1.55rem; font-weight: 700; margin: 0; }
.block-hint { color: var(--r-ink-soft); }

.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 22px; }

.skeleton {
  aspect-ratio: 16 / 13;
  border: var(--r-bd); box-shadow: var(--r-sh-2);
  background: linear-gradient(100deg, #f3f1ea 30%, #fbf9f2 50%, #f3f1ea 70%);
  background-size: 200% 100%; animation: sk 1.2s ease-in-out infinite;
}
@keyframes sk { from { background-position: 200% 0; } to { background-position: -200% 0; } }

.empty { text-align: center; padding: 48px 32px; max-width: 480px; margin: 20px auto; }
.empty-icon { font-size: 3.2rem; }
.empty h2 { font-family: var(--r-font-display); margin: 12px 0 8px; }
.empty p { color: var(--r-ink-soft); }

@media (max-width: 640px) {
  .hero { flex-direction: column; align-items: flex-start; }
  .hero-stat { align-self: stretch; }
}
</style>
